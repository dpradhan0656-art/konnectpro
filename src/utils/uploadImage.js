import imageCompression from 'browser-image-compression';
import { supabase } from '../lib/supabase';

const EXPERT_PHOTO_BUCKET = 'expert-photos';

/**
 * Compresses an image file and uploads it to Supabase storage.
 *
 * @param {{ file: File; expertKey: string | number }} params
 * @returns {Promise<{ publicUrl: string; objectPath: string; compressedFile: File }>}
 */
export async function compressAndUploadExpertPhoto({ file, expertKey }) {
  if (!file) throw new Error('Image file is required.');
  if (!expertKey) throw new Error('Expert key is required for upload path.');

  const compressedFile = await imageCompression(file, {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    initialQuality: 0.75,
    fileType: 'image/jpeg',
  });

  const objectPath = `experts/${expertKey}/${Date.now()}-admin.jpg`;
  const { error: uploadErr } = await supabase.storage.from(EXPERT_PHOTO_BUCKET).upload(objectPath, compressedFile, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (uploadErr) throw uploadErr;

  const { data } = supabase.storage.from(EXPERT_PHOTO_BUCKET).getPublicUrl(objectPath);
  const publicUrl = data?.publicUrl;
  if (!publicUrl) {
    throw new Error('Could not resolve public URL after upload.');
  }

  return { publicUrl, objectPath, compressedFile };
}
