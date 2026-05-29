export function sanitizeName(input) {
  let cleaned = input.trim();
  cleaned = cleaned.replace(/[^a-zA-Z\s]/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ');
  return cleaned;
}

export function getSuggestedName(input) {
  const raw = input;
  const sanitized = sanitizeName(input);
  if (sanitized !== raw.trim()) return sanitized;
  return null;
}

export function getNameValidation(name) {
  const raw = name.trim();
  const words = raw.split(/\s+/).filter(Boolean);
  return {
    twoWords: words.length >= 2,
    twoChars: words.length >= 1 && words.every(w => w.length >= 2),
    lettersOnly: raw.length > 0 && /^[a-zA-Z\s]+$/.test(raw),
  };
}
