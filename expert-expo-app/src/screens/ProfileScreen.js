import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { supabase } from '../lib/supabase';
import { ACCENT, BG, BORDER, CARD, TEXT, TEXT_MUTED } from '../components/dashboard/theme';
import { fetchExpertProfileMaster, upsertExpertProfileMaster } from '../utils/expertProfileMaster';
import { uploadExpertProfileImage } from '../utils/uploadImage';

function formatMemberSince(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ratingStars(avg) {
  const n = Math.max(0, Math.min(5, Number(avg) || 0));
  const full = Math.round(n);
  return '\u2605\u2605\u2605\u2605\u2605'.slice(0, full) + '\u2606\u2606\u2606\u2606\u2606'.slice(0, 5 - full);
}

function formatReviewDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

/** @returns {{ label: string; tone: 'verified' | 'pending' | 'rejected' }} */
function kycFromRow(raw) {
  const n = String(raw || 'pending').trim().toLowerCase();
  if (['verified', 'approved', 'completed', 'active'].includes(n)) return { label: 'Verified', tone: 'verified' };
  if (['rejected', 'declined', 'failed', 'denied'].includes(n)) return { label: 'Rejected', tone: 'rejected' };
  return { label: 'Pending KYC', tone: 'pending' };
}

/** @param {{ expert: { id?: string | number | null; name?: string | null; email?: string | null } | null }} props */
export default function ProfileScreen({ expert }) {
  const expertId = expert?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rankLabel, setRankLabel] = useState(null);
  const [rankLoaded, setRankLoaded] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [masterDraft, setMasterDraft] = useState({
    residential_address: '',
    bank_account_holder_name: '',
    bank_account_number: '',
    ifsc_code: '',
    pan_number: '',
  });
  const [masterSaving, setMasterSaving] = useState(false);
  const [aadharUploading, setAadharUploading] = useState(false);

  const display = useMemo(() => {
    const p = profile || {};
    const fullName = p.name || expert?.name || (expert?.email ? String(expert.email).split('@')[0] : '-');
    const category = p.category || p.service_category || p.primary_category || '-';
    const city = p.city || p.location_city || p.address_city || '-';
    const kyc = kycFromRow(p.kyc_status || p.kyc_verification_status);
    const memberSince = formatMemberSince(p.created_at || p.member_since || p.joined_at);
    const avgRating = Number(p.average_rating ?? p.avg_rating ?? p.rating ?? 0);
    const totalReviews = Number(p.total_reviews ?? p.review_count ?? 0);
    const photo = p.photo_url || p.profile_photo_url || p.avatar_url || null;

    return {
      fullName,
      category,
      city,
      kycLabel: kyc.label,
      kycTone: kyc.tone,
      memberSince,
      avgRating: Number.isFinite(avgRating) ? avgRating : 0,
      totalReviews: Number.isFinite(totalReviews) ? totalReviews : 0,
      photo,
    };
  }, [profile, expert?.name]);

  const loadRankLabel = async (expertRow) => {
    if (!expertRow?.id) return null;
    const category = String(expertRow?.category || expertRow?.service_category || expertRow?.primary_category || '').trim();
    const city = String(expertRow?.city || expertRow?.location_city || expertRow?.address_city || '').trim();
    if (!category || !city) return null;

    try {
      const { data, error: rankErr } = await supabase
        .from('experts')
        .select('id, average_rating')
        .eq('category', category)
        .eq('city', city)
        .order('average_rating', { ascending: false })
        .limit(200);

      if (rankErr || !Array.isArray(data) || !data.length) return null;

      const idx = data.findIndex((row) => String(row.id) === String(expertRow.id));
      if (idx < 0) return null;
      return `\ud83c\udfc6 #${idx + 1} ${category} in ${city}`;
    } catch {
      return null;
    }
  };

  const load = async () => {
    if (!expertId) {
      setProfile(null);
      setReviews([]);
      setRankLabel(null);
      setRankLoaded(true);
      setError(null);
      setLoading(false);
      return;
    }

    setError(null);
    setRankLoaded(false);
    try {
      const { data: expertRow, error: profileErr } = await supabase
        .from('experts')
        .select('*')
        .eq('id', expertId)
        .maybeSingle();
      if (profileErr) throw profileErr;

      setProfile(expertRow || null);

      let masterRow = null;
      try {
        masterRow = await fetchExpertProfileMaster(expertId);
      } catch {
        masterRow = null;
      }
      setMasterDraft({
        residential_address: masterRow?.residential_address || '',
        bank_account_holder_name: masterRow?.bank_account_holder_name || '',
        bank_account_number: masterRow?.bank_account_number || '',
        ifsc_code: masterRow?.ifsc_code || '',
        pan_number: masterRow?.pan_number || '',
      });

      const [reviewsRes, nextRank] = await Promise.all([
        supabase
          .from('expert_reviews')
          .select('id, customer_name, rating, review_text, created_at')
          .eq('expert_id', String(expertId))
          .order('created_at', { ascending: false })
          .limit(10),
        loadRankLabel(expertRow || {}),
      ]);

      setRankLabel(nextRank);

      if (!reviewsRes.error && Array.isArray(reviewsRes.data)) {
        setReviews(reviewsRes.data);
      } else {
        if (reviewsRes.error) {
          console.warn('expert_reviews:', reviewsRes.error.message);
        }
        setReviews([]);
      }
    } catch (e) {
      setError(e?.message || String(e));
      setReviews([]);
      setRankLabel(null);
    } finally {
      setRankLoaded(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expertId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const pickAndUploadPhoto = async (mode) => {
    if (!expertId || photoUploading) return;
    setPhotoUploading(true);
    try {
      if (mode === 'camera') {
        const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraPerm.status !== 'granted') {
          Alert.alert('Permission needed', 'Camera permission is required to capture profile photo.');
          return;
        }
      } else {
        const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (mediaPerm.status !== 'granted') {
          Alert.alert('Permission needed', 'Gallery permission is required to select profile photo.');
          return;
        }
      }

      // Compress via picker quality only (stable across devices; no extra native image module).
      const pickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.52,
      };

      const result =
        mode === 'camera'
          ? await ImagePicker.launchCameraAsync(pickerOptions)
          : await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];

      const { publicUrl } = await uploadExpertProfileImage({
        localUri: asset.uri,
        expertId,
      });

      const { error: upErr } = await supabase
        .from('experts')
        .update({ photo_url: publicUrl })
        .eq('id', expertId);
      if (upErr) {
        // eslint-disable-next-line no-console
        console.log('[experts photo_url update] Supabase error:', upErr.message, upErr);
        throw upErr;
      }

      setProfile((prev) => ({ ...(prev || {}), photo_url: publicUrl }));
      Alert.alert('Success', 'Profile photo updated.');
    } catch (e) {
      Alert.alert('Upload failed', e?.message || String(e));
    } finally {
      setPhotoUploading(false);
    }
  };

  const openEditPhotoChooser = () => {
    Alert.alert('Edit Photo', 'Choose image source', [
      { text: 'Camera', onPress: () => pickAndUploadPhoto('camera').catch(() => {}) },
      { text: 'Gallery', onPress: () => pickAndUploadPhoto('gallery').catch(() => {}) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const saveMasterProfile = async () => {
    if (!expertId || masterSaving) return;
    const ifsc = masterDraft.ifsc_code.replace(/\s/g, '').toUpperCase();
    if (ifsc && ifsc.length !== 11) {
      Alert.alert('Check IFSC', 'IFSC code should be 11 characters when provided.');
      return;
    }
    const pan = masterDraft.pan_number.replace(/\s/g, '').toUpperCase();
    if (pan && pan.length !== 10) {
      Alert.alert('Check PAN', 'PAN should be 10 characters when provided.');
      return;
    }
    setMasterSaving(true);
    try {
      await upsertExpertProfileMaster(expertId, {
        residential_address: masterDraft.residential_address.trim() || null,
        bank_account_holder_name: masterDraft.bank_account_holder_name.trim() || null,
        bank_account_number: masterDraft.bank_account_number.replace(/\s/g, '') || null,
        ifsc_code: ifsc || null,
        pan_number: pan || null,
      });
      Alert.alert('Saved', 'Bank and address details updated.');
    } catch (e) {
      Alert.alert('Save failed', e?.message || String(e));
    } finally {
      setMasterSaving(false);
    }
  };

  const pickAadharFront = async (mode) => {
    if (!expertId || aadharUploading) return;
    setAadharUploading(true);
    try {
      if (mode === 'camera') {
        const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraPerm.status !== 'granted') {
          Alert.alert('Permission needed', 'Camera permission is required.');
          return;
        }
      } else {
        const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (mediaPerm.status !== 'granted') {
          Alert.alert('Permission needed', 'Gallery permission is required.');
          return;
        }
      }
      const pickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.52 };
      const result =
        mode === 'camera'
          ? await ImagePicker.launchCameraAsync(pickerOptions)
          : await ImagePicker.launchImageLibraryAsync(pickerOptions);
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      const { publicUrl } = await uploadExpertProfileImage({
        localUri: asset.uri,
        expertId,
        objectSuffix: 'aadhar-front',
      });
      await upsertExpertProfileMaster(expertId, { aadhar_card_photo_url: publicUrl });
      Alert.alert('Success', 'Aadhaar front image saved.');
    } catch (e) {
      Alert.alert('Upload failed', e?.message || String(e));
    } finally {
      setAadharUploading(false);
    }
  };

  const openAadharChooser = () => {
    Alert.alert('Aadhaar card (front)', 'Choose source', [
      { text: 'Camera', onPress: () => pickAadharFront('camera').catch(() => {}) },
      { text: 'Gallery', onPress: () => pickAadharFront('gallery').catch(() => {}) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[ACCENT]} tintColor={ACCENT} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profile, KYC & Reputation</Text>
        <Text style={styles.sub}>Trust identity and customer reputation dashboard.</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={ACCENT} />
          </View>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading ? (
          <>
            <View style={styles.heroCard}>
              <View style={styles.avatarWrap}>
                {display.photo ? (
                  <Image source={{ uri: display.photo }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>{display.fullName.slice(0, 1).toUpperCase()}</Text>
                  </View>
                )}
                {photoUploading ? (
                  <View style={styles.avatarLoadingOverlay}>
                    <ActivityIndicator color={ACCENT} />
                  </View>
                ) : null}
              </View>
              <View style={styles.heroText}>
                <Text style={styles.name}>{display.fullName}</Text>
                <Text style={styles.meta}>{display.category}</Text>
                <Text style={styles.meta}>Member since {display.memberSince}</Text>
                <Pressable
                  style={({ pressed }) => [styles.editPhotoBtn, pressed && { opacity: 0.9 }, photoUploading && { opacity: 0.6 }]}
                  onPress={openEditPhotoChooser}
                  disabled={photoUploading}
                >
                  <Text style={styles.editPhotoBtnText}>{photoUploading ? 'Uploading...' : 'Edit Photo'}</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Payout & address</Text>
              <Text style={styles.masterHint}>
                Saved to expert_profile_master. Use the same spelling as in your bank passbook.
              </Text>
              <Text style={styles.fieldLabel}>residential_address</Text>
              <TextInput
                style={styles.input}
                placeholder="House, street, city, state, PIN"
                placeholderTextColor="#64748b"
                value={masterDraft.residential_address}
                onChangeText={(t) => setMasterDraft((d) => ({ ...d, residential_address: t }))}
                multiline
              />
              <Text style={styles.fieldLabel}>bank_account_holder_name</Text>
              <TextInput
                style={styles.input}
                placeholder="Account holder name"
                placeholderTextColor="#64748b"
                value={masterDraft.bank_account_holder_name}
                onChangeText={(t) => setMasterDraft((d) => ({ ...d, bank_account_holder_name: t }))}
              />
              <Text style={styles.fieldLabel}>bank_account_number</Text>
              <TextInput
                style={styles.input}
                placeholder="Account number"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                value={masterDraft.bank_account_number}
                onChangeText={(t) => setMasterDraft((d) => ({ ...d, bank_account_number: t }))}
              />
              <Text style={styles.fieldLabel}>ifsc_code</Text>
              <TextInput
                style={styles.input}
                placeholder="11-character IFSC"
                placeholderTextColor="#64748b"
                autoCapitalize="characters"
                value={masterDraft.ifsc_code}
                onChangeText={(t) => setMasterDraft((d) => ({ ...d, ifsc_code: t }))}
              />
              <Text style={styles.fieldLabel}>pan_number</Text>
              <TextInput
                style={styles.input}
                placeholder="10-character PAN"
                placeholderTextColor="#64748b"
                autoCapitalize="characters"
                value={masterDraft.pan_number}
                onChangeText={(t) => setMasterDraft((d) => ({ ...d, pan_number: t }))}
              />
              <Pressable
                style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.9 }, aadharUploading && { opacity: 0.6 }]}
                onPress={openAadharChooser}
                disabled={aadharUploading}
              >
                <Text style={styles.secondaryBtnText}>
                  {aadharUploading ? 'Uploading Aadhaar…' : 'Upload Aadhaar card (front)'}
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.editPhotoBtn, { marginTop: 12 }, pressed && { opacity: 0.9 }, masterSaving && { opacity: 0.6 }]}
                onPress={() => saveMasterProfile().catch(() => {})}
                disabled={masterSaving}
              >
                <Text style={styles.editPhotoBtnText}>{masterSaving ? 'Saving…' : 'Save bank & address'}</Text>
              </Pressable>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Identity Status</Text>
              <View
                style={[
                  styles.kycPill,
                  display.kycTone === 'verified' && styles.kycVerified,
                  display.kycTone === 'pending' && styles.kycPending,
                  display.kycTone === 'rejected' && styles.kycRejected,
                ]}
              >
                <Text
                  style={[
                    styles.kycText,
                    display.kycTone === 'verified' && styles.kycTextVerified,
                    display.kycTone === 'pending' && styles.kycTextPending,
                    display.kycTone === 'rejected' && styles.kycTextRejected,
                  ]}
                >
                  {display.kycLabel}
                </Text>
              </View>
              <Text style={styles.masterHint}>
                Official name and category are set by admin. Use Payout & address above for bank, IFSC, PAN, and Aadhaar
                photo; complete web KYC if your coordinator asks.
              </Text>
            </View>

            <View style={styles.reputationCard}>
              <Text style={styles.infoTitle}>Reputation Dashboard</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.rating}>
                  {display.avgRating > 0 ? `${display.avgRating.toFixed(1)} ★` : 'New partner'}
                </Text>
                <Text style={styles.reviewCount}>({display.totalReviews} reviews)</Text>
              </View>
              {display.avgRating > 0 ? <Text style={styles.stars}>{ratingStars(display.avgRating)}</Text> : null}
              {rankLoaded && rankLabel ? (
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{rankLabel}</Text>
                </View>
              ) : null}
              {rankLoaded && !rankLabel ? (
                <Text style={styles.rankHint}>
                  Local rank shows when your city and category match other experts. Ask admin to set city/category if this stays
                  empty.
                </Text>
              ) : null}

              <Text style={styles.reviewHeading}>Customer reviews</Text>
              {!reviews.length ? (
                <Text style={styles.emptyReviews}>No reviews yet. They will appear here when customers leave feedback.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reviewScrollContent}>
                  {reviews.map((item) => (
                    <View key={String(item.id)} style={styles.reviewCard}>
                      <Text style={styles.reviewName}>{item.customer_name?.trim() || 'Customer'}</Text>
                      <Text style={styles.reviewRating}>{Number(item.rating || 0).toFixed(1)} ★</Text>
                      <Text style={styles.reviewText} numberOfLines={4}>
                        {(item.review_text || item.comment || '').trim() || '-'}
                      </Text>
                      <Text style={styles.reviewDate}>{formatReviewDate(item.created_at)}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { padding: 20, paddingBottom: 30 },
  title: { color: TEXT, fontSize: 24, fontWeight: '800' },
  sub: { color: TEXT_MUTED, fontSize: 13, marginTop: 6, marginBottom: 16 },
  center: { paddingVertical: 20, alignItems: 'center' },
  error: { color: '#fca5a5', marginBottom: 10 },
  masterHint: { color: TEXT_MUTED, fontSize: 12, lineHeight: 18, marginBottom: 10 },
  fieldLabel: { color: TEXT_MUTED, fontSize: 11, fontWeight: '700', marginTop: 8, marginBottom: 4 },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: TEXT,
    fontSize: 14,
  },

  heroCard: {
    backgroundColor: CARD,
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 12,
  },
  avatarWrap: { width: 72, height: 72 },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  avatarLoadingOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: 36,
    backgroundColor: 'rgba(2, 6, 23, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#134e4a',
  },
  avatarText: { color: '#f0fdfa', fontSize: 30, fontWeight: '800' },
  heroText: { flex: 1, justifyContent: 'center' },
  name: { color: TEXT, fontSize: 20, fontWeight: '800' },
  meta: { color: TEXT_MUTED, fontSize: 12, marginTop: 4 },
  editPhotoBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#0f172a',
  },
  editPhotoBtnText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '700',
  },

  infoCard: {
    backgroundColor: CARD,
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  infoTitle: { color: TEXT, fontSize: 15, fontWeight: '800', marginBottom: 10 },
  kycPill: { alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  kycVerified: { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.38)' },
  kycPending: { backgroundColor: 'rgba(245, 158, 11, 0.14)', borderColor: 'rgba(245, 158, 11, 0.45)' },
  kycRejected: { backgroundColor: 'rgba(248, 113, 113, 0.12)', borderColor: 'rgba(248, 113, 113, 0.45)' },
  kycText: { fontSize: 12, fontWeight: '800' },
  kycTextVerified: { color: '#34d399' },
  kycTextPending: { color: '#fbbf24' },
  kycTextRejected: { color: '#fca5a5' },

  actionRow: { marginTop: 12, gap: 8 },
  secondaryBtn: {
    minHeight: 44,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  secondaryBtnText: { color: TEXT, fontSize: 13, fontWeight: '700' },

  reputationCard: {
    backgroundColor: CARD,
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  rating: { color: TEXT, fontSize: 34, fontWeight: '900' },
  reviewCount: { color: TEXT_MUTED, fontSize: 12 },
  stars: { color: '#fbbf24', marginTop: 4, letterSpacing: 1.2, fontSize: 18 },

  rankBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.45)',
    backgroundColor: 'rgba(13, 148, 136, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  rankText: { color: '#5eead4', fontSize: 12, fontWeight: '800' },
  rankHint: { color: TEXT_MUTED, fontSize: 12, lineHeight: 18, marginTop: 8 },

  reviewHeading: { color: TEXT, fontSize: 14, fontWeight: '800', marginTop: 14, marginBottom: 10 },
  emptyReviews: { color: TEXT_MUTED, fontSize: 12, lineHeight: 18, paddingVertical: 6 },
  reviewScrollContent: { gap: 10, paddingRight: 6 },
  reviewCard: {
    width: 245,
    backgroundColor: '#0f172a',
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  reviewName: { color: TEXT, fontSize: 13, fontWeight: '700' },
  reviewRating: { color: '#fbbf24', fontSize: 12, fontWeight: '800', marginTop: 3 },
  reviewText: { color: TEXT_MUTED, fontSize: 12, lineHeight: 18, marginTop: 8 },
  reviewDate: { color: '#64748b', fontSize: 11, marginTop: 10 },
});
