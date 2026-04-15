import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';

import { resolveSupabasePublicConfig, supabase } from '../lib/supabase';

const EXPERT_PHOTO_BUCKET = 'expert-photos';

/**
 * On-device debug text for Storage errors (APK bundle may use wrong EXPO_PUBLIC_SUPABASE_URL).
 * @param {string} bucketName
 * @param {string} supabaseUrl
 */
function formatStorageDebugFooter(bucketName, supabaseUrl) {
  const raw = (supabaseUrl || '').trim();
  const first25 = raw.slice(0, 25);
  let host = '(parse failed)';
  try {
    if (raw) host = new URL(raw).host;
  } catch {
    host = '(invalid URL)';
  }
  return (
    `\n\n--- Debug (compare with Supabase dashboard) ---\n` +
    `Bucket String: ${bucketName}\n` +
    `Supabase URL (first 25 chars): ${first25 || '(empty)'}\n` +
    `Resolved host: ${raw ? host : '(empty — EXPO_PUBLIC_SUPABASE_URL likely missing at build)'}\n` +
    `Full URL length: ${raw.length} chars`
  );
}

/**
 * Decode a base64 string to an ArrayBuffer (Hermes / modern RN provide `atob`).
 * @param {string} base64
 * @returns {ArrayBuffer}
 */
function base64ToArrayBuffer(base64) {
  if (typeof atob !== 'function') {
    throw new Error('atob is not available; cannot decode image for upload.');
  }
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer.byteLength === bytes.byteLength
    ? bytes.buffer
    : bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

/**
 * Read a local or remote image URI into binary data suitable for Supabase Storage.
 * React Native `fetch(file://...)` often fails with "Network request failed"; use the file system for local URIs.
 *
 * @param {string} uri
 * @returns {Promise<ArrayBuffer>}
 */
async function imageUriToArrayBuffer(uri) {
  const localLike =
    uri.startsWith('file:') ||
    uri.startsWith('content:') ||
    (uri.startsWith('/') && !uri.startsWith('//'));

  if (localLike) {
    const base64 = await readAsStringAsync(uri, { encoding: EncodingType.Base64 });
    return base64ToArrayBuffer(base64);
  }

  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Failed to read image (${response.status})`);
  }
  const blob = await response.blob();
  return blob.arrayBuffer();
}

/**
 * Uploads an already-compressed local image to Supabase Storage and returns its public URL.
 *
 * @param {{ localUri: string; expertId: string | number; objectSuffix?: string }} params
 * @returns {Promise<{ path: string; publicUrl: string }>}
 */
export async function uploadExpertProfileImage({ localUri, expertId, objectSuffix = 'profile' }) {
  if (!localUri) throw new Error('Image URI is required.');
  if (!expertId) throw new Error('Expert ID is required.');

  let body;
  try {
    body = await imageUriToArrayBuffer(localUri);
  } catch (e) {
    const { url: supabaseUrl } = resolveSupabasePublicConfig();
    const msg = e?.message || String(e);
    // eslint-disable-next-line no-console
    console.log('[expert-photos upload] Failed to read image bytes:', msg);
    throw new Error(
      `${msg}${formatStorageDebugFooter(EXPERT_PHOTO_BUCKET, supabaseUrl)}`
    );
  }

  const safeSuffix = String(objectSuffix || 'profile').replace(/[^a-zA-Z0-9_-]/g, '') || 'profile';
  const objectPath = `experts/${expertId}/${Date.now()}-${safeSuffix}.jpg`;
  const bucketName = EXPERT_PHOTO_BUCKET;
  const { url: supabaseUrl } = resolveSupabasePublicConfig();
  let projectHost = '(unknown)';
  try {
    if (supabaseUrl) projectHost = new URL(supabaseUrl).host;
  } catch {
    projectHost = '(invalid EXPO_PUBLIC_SUPABASE_URL)';
  }
  // eslint-disable-next-line no-console
  console.log('Attempting upload to bucket:', bucketName, '| Supabase host:', projectHost);

  const { error: uploadErr } = await supabase.storage.from(bucketName).upload(objectPath, body, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (uploadErr) {
    const errMsg =
      uploadErr?.message || uploadErr?.error || (typeof uploadErr === 'string' ? uploadErr : 'Storage upload failed');
    // eslint-disable-next-line no-console
    console.log('[expert-photos upload] Supabase error:', errMsg, uploadErr);
    throw new Error(`${errMsg}${formatStorageDebugFooter(bucketName, supabaseUrl)}`);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(objectPath);
  const publicUrl = data?.publicUrl;
  if (!publicUrl) {
    throw new Error(
      `Could not resolve image public URL.${formatStorageDebugFooter(bucketName, supabaseUrl)}`
    );
  }
  return { path: objectPath, publicUrl };
}
