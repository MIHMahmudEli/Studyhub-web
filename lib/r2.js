import { apiRequest } from './api';

const R2_PUBLIC = 'https://pub-aef2edcdffe24ec4999b508f46e4bc59.r2.dev';

export function getDisplayUrl(proxyUrl) {
  if (!proxyUrl) return null;
  const key = proxyUrl.split('?key=')[1];
  return key ? `${R2_PUBLIC}/${key}` : proxyUrl;
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
  if (!publicUrl) return;

  let key = null;

  const proxyBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (proxyBase && publicUrl.startsWith(proxyBase)) {
    key = publicUrl.replace(proxyBase, '').replace(/^\//, '');
  } else if (publicUrl.startsWith(R2_PUBLIC)) {
    key = publicUrl.replace(R2_PUBLIC, '').replace(/^\//, '');
  }

  if (!key) return;

  await apiRequest('/storage/objects', {
    method: 'DELETE',
    body: { key },
  });
}
