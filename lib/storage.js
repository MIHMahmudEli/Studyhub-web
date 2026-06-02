import { supabase } from './supabase';

const PROFILE_BUCKET = 'profile-pics';
const FILE_BUCKET = 'studyhub-storage';

export async function uploadProfilePicture(file, fileName) {
  const { error: uploadError } = await supabase.storage
    .from(PROFILE_BUCKET)
    .upload(fileName, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(PROFILE_BUCKET)
    .getPublicUrl(fileName);

  return publicUrl;
}

export async function deleteProfilePicture(fileName) {
  if (!fileName) return;
  const { error } = await supabase.storage.from(PROFILE_BUCKET).remove([fileName]);
  if (error) console.error('Failed to delete old profile pic:', error);
}

export async function uploadFile(file, filePath) {
  const { error } = await supabase.storage.from(FILE_BUCKET).upload(filePath, file);
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(FILE_BUCKET)
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteFile(filePath) {
  if (!filePath) return;
  const { error } = await supabase.storage.from(FILE_BUCKET).remove([filePath]);
  if (error) console.error('Failed to delete file:', error);
}

export async function ensureProfileBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some(b => b.name === PROFILE_BUCKET)) {
    await supabase.storage.createBucket(PROFILE_BUCKET, { public: true });
  }
}
