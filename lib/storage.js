import { uploadToR2, deleteFromR2 } from './r2';

export async function uploadProfilePicture(file, fileName) {
  const key = `profile-pics/${fileName}`;
  return uploadToR2(file, key);
}

export async function deleteProfilePicture(fileName) {
  if (!fileName) return;
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (base) {
    await deleteFromR2(`${base}/profile-pics/${fileName}`);
  }
}

export async function uploadFile(file, filePath) {
  return uploadToR2(file, filePath);
}

export async function deleteFile(filePath) {
  if (!filePath) return;
  await deleteFromR2(filePath);
}
