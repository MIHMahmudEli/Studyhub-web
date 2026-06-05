import { apiRequest } from './api';

const R2_PUBLIC = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-aef2edcdffe24ec4999b508f46e4bc59.r2.dev';

export function getDisplayUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  
  const baseUrl = R2_PUBLIC.replace(/\/$/, '');

  if (pathOrUrl.includes('?key=')) {
    const key = pathOrUrl.split('?key=')[1];
    return `${baseUrl}/${key}`;
  }
  
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  
  const cleanKey = pathOrUrl.replace(/^\//, '');
  return `${baseUrl}/${cleanKey}`;
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

export async function deleteFromR2(pathOrUrl) {
  if (!pathOrUrl) return;

  let key = pathOrUrl;
  const baseUrl = R2_PUBLIC.replace(/\/$/, '');

  if (pathOrUrl.includes('?key=')) {
    key = pathOrUrl.split('?key=')[1];
  } else if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    if (pathOrUrl.startsWith(baseUrl)) {
      key = pathOrUrl.replace(baseUrl, '').replace(/^\//, '');
    }
  }

  if (!key) return;

  await apiRequest('/storage/objects', {
    method: 'DELETE',
    body: { key },
  });
}
