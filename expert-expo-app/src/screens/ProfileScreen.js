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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import { supabase } from '../lib/supabase';
import { ACCENT, BG, BORDER, CARD, TEXT, TEXT_MUTED } from '../components/dashboard/theme';
import { uploadExpertProfileImage } from '../utils/uploadImage';

const MOCK_REVIEWS = [
  {
    id: 'mock-1',
    customer_name: 'Rohit Sharma',
    rating: 5,
    review_text: 'Reached on time and completed the work neatly. Very professional.',
    created_at: null,
  },
  {
    id: 'mock-2',
    customer_name: 'Neha Verma',
    rating: 4.8,
    review_text: 'Good communication and quick diagnosis. Recommended expert.',
    created_at: null,
  },
  {
    id: 'mock-3',
    customer_name: 'Amit Patel',
    rating: 4.7,
    review_text: 'Solved a recurring issue in one visit. Clean and polite service.',
    created_at: null,
  },
];

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
  if (!value) return 'Recent';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Recent';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function normalizeKycStatus(raw) {
  const normalized = String(raw || 'pending').trim().toLowerCase();
  return ['verified', 'approved', 'completed', 'active'].includes(normalized) ? 'Verified' : 'Pending KYC';
}

/** @param {{ expert: { id?: string | number | null; name?: string | null; email?: string | null } | null }} props */
export default function ProfileScreen({ expert }) {
  const expertId = expert?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rankLabel, setRankLabel] = useState('\ud83c\udfc6 #2 Expert in your area');
  const [photoUploading, setPhotoUploading] = useState(false);

  const display = useMemo(() => {
    const p = profile || {};
    const fullName = p.name || expert?.name || 'Expert';
    const category = p.category || p.service_category || p.primary_category || 'General Service';
    const city = p.city || p.location_city || p.address_city || 'Your City';
    const kycStatus = normalizeKycStatus(p.kyc_status || p.kyc_verification_status);
    const memberSince = formatMemberSince(p.created_at || p.member_since || p.joined_at);
    const avgRating = Number(p.average_rating ?? p.avg_rating ?? p.rating ?? 0);
    const totalReviews = Number(p.total_reviews ?? p.review_count ?? 0);
    const photo = p.photo_url || p.profile_photo_url || p.avatar_url || null;

    return {
      fullName,
      category,
      city,
      kycStatus,
      memberSince,
      avgRating: Number.isFinite(avgRating) ? avgRating : 0,
      totalReviews: Number.isFinite(totalReviews) ? totalReviews : 0,
      photo,
    };
  }, [profile, expert?.name]);

  const reputationReviews = useMemo(() => {
    if (Array.isArray(reviews) && reviews.length) return reviews;
    return MOCK_REVIEWS;
  }, [reviews]);

  const loadRankLabel = async (expertRow) => {
    const category = expertRow?.category || expertRow?.service_category || expertRow?.primary_category;
    const city = expertRow?.city || expertRow?.location_city || expertRow?.address_city;
    if (!category || !city) {
      return `\ud83c\udfc6 #2 ${display.category} in ${display.city}`;
    }

    try {
      const { data, error: rankErr } = await supabase
        .from('experts')
        .select('id, average_rating, category, city')
        .eq('category', category)
        .eq('city', city)
        .order('average_rating', { ascending: false })
        .limit(100);

      if (rankErr || !Array.isArray(data) || !data.length) {
        return `\ud83c\udfc6 #2 ${category} in ${city}`;
      }

      const idx = data.findIndex((row) => String(row.id) === String(expertRow.id));
      const rank = idx >= 0 ? idx + 1 : 2;
      return `\ud83c\udfc6 #${rank} ${category} in ${city}`;
    } catch {
      return `\ud83c\udfc6 #2 ${category} in ${city}`;
    }
  };

  const load = async () => {
    if (!expertId) {
      setProfile(null);
      setReviews([]);
      setRankLabel('\ud83c\udfc6 #2 Expert in your area');
      setError(null);
      setLoading(false);
      return;
    }

    setError(null);
    try {
      const { data: expertRow, error: profileErr } = await supabase
        .from('experts')
        .select('*')
        .eq('id', expertId)
        .maybeSingle();
      if (profileErr) throw profileErr;

      setProfile(expertRow || null);

      const [reviewsRes, nextRank] = await Promise.all([
        supabase
          .from('expert_reviews')
          .select('id, customer_name, rating, review_text, created_at')
          .eq('expert_id', expertId)
          .order('created_at', { ascending: false })
          .limit(10),
        loadRankLabel(expertRow || {}),
      ]);

      setRankLabel(nextRank);

      if (!reviewsRes.error && Array.isArray(reviewsRes.data)) {
        setReviews(reviewsRes.data);
      } else {
        setReviews([]);
      }
    } catch (e) {
      setError(e?.message || String(e));
      setReviews([]);
      setRankLabel('\ud83c\udfc6 #2 Expert in your area');
    } finally {
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

      const result =
        mode === 'camera'
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 1,
              allowsEditing: true,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 1,
              allowsEditing: true,
            });

      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];

      const manipActions = [];
      if (asset.width && asset.width > 800) {
        manipActions.push({ resize: { width: 800 } });
      }

      const compressed = await ImageManipulator.manipulateAsync(asset.uri, manipActions, {
        compress: 0.5,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      const { publicUrl } = await uploadExpertProfileImage({
        localUri: compressed.uri,
        expertId,
      });

      const { error: upErr } = await supabase
        .from('experts')
        .update({ photo_url: publicUrl })
        .eq('id', expertId);
      if (upErr) throw upErr;

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
              <Text style={styles.infoTitle}>Identity Status</Text>
              <View style={[styles.kycPill, display.kycStatus === 'Verified' ? styles.kycVerified : styles.kycPending]}>
                <Text style={[styles.kycText, display.kycStatus === 'Verified' ? styles.kycTextVerified : styles.kycTextPending]}>
                  {display.kycStatus}
                </Text>
              </View>
              <View style={styles.actionRow}>
                <Pressable
                  style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.9 }]}
                  onPress={() => Alert.alert('Update KYC', 'KYC document upload module coming in next phase.')}
                >
                  <Text style={styles.secondaryBtnText}>Update KYC (Aadhaar/PAN)</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.9 }]}
                  onPress={() => Alert.alert('Edit Profile', 'Profile edit module coming in next phase.')}
                >
                  <Text style={styles.secondaryBtnText}>Edit Profile</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.reputationCard}>
              <Text style={styles.infoTitle}>Reputation Dashboard</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.rating}>
                  {display.avgRating > 0 ? `${display.avgRating.toFixed(1)} \u2b50` : 'New Partner \ud83c\udd95'}
                </Text>
                <Text style={styles.reviewCount}>({display.totalReviews} reviews)</Text>
              </View>
              {display.avgRating > 0 ? <Text style={styles.stars}>{ratingStars(display.avgRating)}</Text> : null}
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{rankLabel}</Text>
              </View>

              <Text style={styles.reviewHeading}>Recent Customer Reviews</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reviewScrollContent}>
                {reputationReviews.map((item) => (
                  <View key={String(item.id)} style={styles.reviewCard}>
                    <Text style={styles.reviewName}>{item.customer_name || 'Customer'}</Text>
                    <Text style={styles.reviewRating}>{Number(item.rating || 0).toFixed(1)} \u2b50</Text>
                    <Text style={styles.reviewText} numberOfLines={4}>
                      {item.review_text || item.comment || 'Great service experience.'}
                    </Text>
                    <Text style={styles.reviewDate}>{formatReviewDate(item.created_at)}</Text>
                  </View>
                ))}
              </ScrollView>
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
  kycText: { fontSize: 12, fontWeight: '800' },
  kycTextVerified: { color: '#34d399' },
  kycTextPending: { color: '#fbbf24' },

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

  reviewHeading: { color: TEXT, fontSize: 14, fontWeight: '800', marginTop: 14, marginBottom: 10 },
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
