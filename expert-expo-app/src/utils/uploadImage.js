import { supabase } from '../lib/supabase';

const EXPERT_PHOTO_BUCKET = 'expert-photos';

/**
 * Uploads an already-compressed local image to Supabase Storage and returns its public URL.
 *
 * @param {{ localUri: string; expertId: string | number }} params
 * @returns {Promise<{ path: string; publicUrl: string }>}
 */
export async function uploadExpertProfileImage({ localUri, expertId }) {
  if (!localUri) throw new Error('Image URI is required.');
  if (!expertId) throw new Error('Expert ID is required.');

  const response = await fetch(localUri);
  const blob = await response.blob();

  const objectPath = `experts/${expertId}/${Date.now()}-profile.jpg`;
  const { error: uploadErr } = await supabase.storage.from(EXPERT_PHOTO_BUCKET).upload(objectPath, blob, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (uploadErr) throw uploadErr;

  const { data } = supabase.storage.from(EXPERT_PHOTO_BUCKET).getPublicUrl(objectPath);
  const publicUrl = data?.publicUrl;
  if (!publicUrl) {
    throw new Error('Could not resolve image public URL.');
  }
  return { path: objectPath, publicUrl };
}
