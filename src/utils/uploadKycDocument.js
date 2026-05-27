import imageCompression from 'browser-image-compression';
import { supabase } from '../lib/supabase';

export const EXPERT_KYC_DOCUMENT_BUCKET = 'expert-kyc-documents';

export async function compressAndUploadExpertKycDocument({ file, expertKey, objectSuffix = 'document' }) {
  if (!file) throw new Error('Image file is required.');
  if (!expertKey) throw new Error('Expert key is required for upload path.');

  const compressedFile = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    initialQuality: 0.75,
    fileType: 'image/jpeg',
  });

  const safeSuffix = String(objectSuffix || 'document').replace(/[^a-zA-Z0-9_-]/g, '') || 'document';
  const objectPath = `experts/${expertKey}/${Date.now()}-${safeSuffix}.jpg`;
  const { error } = await supabase.storage.from(EXPERT_KYC_DOCUMENT_BUCKET).upload(objectPath, compressedFile, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) throw error;

  return { objectPath, compressedFile };
}

export async function createSignedKycDocumentUrl(pathOrUrl, expiresIn = 300) {
  const value = String(pathOrUrl || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;

  const { data, error } = await supabase.storage
    .from(EXPERT_KYC_DOCUMENT_BUCKET)
    .createSignedUrl(value, expiresIn);
  if (error) throw error;
  return data?.signedUrl || '';
}
