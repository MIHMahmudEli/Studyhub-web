import { apiRequest } from './api';

function getKeyFromUrl(publicUrl) {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!base || !publicUrl) return null;
  return publicUrl.replace(base, '').replace(/^\//, '');
}

export async function uploadToR2(file, key) {
  const contentType = file.type || 'application/octet-stream';

  const { uploadUrl, publicUrl } = await apiRequest('/storage/upload-url', {
    method: 'POST',
    body: { key, contentType },
  });

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': contentType },
  });

  if (!uploadRes.ok) {
    throw new Error(`Upload to R2 failed: ${uploadRes.statusText}`);
  }

  return publicUrl;
}

export async function deleteFromR2(publicUrl) {
  const key = getKeyFromUrl(publicUrl);
  if (!key) return;

  await apiRequest('/storage/objects', {
    method: 'DELETE',
    body: { key },
  });
}
