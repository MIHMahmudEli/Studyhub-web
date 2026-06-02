export function getDepartmentName(code, subject, dept) {
  if (!code) return dept || 'CSE';
  const c = code.toUpperCase();
  if (c.startsWith('CSC') || c.startsWith('COE') || c.startsWith('CSE')) {
    const s = subject?.toLowerCase() || '';
    if (s.includes('network') || s.includes('architecture') || s.includes('organization') || s.includes('hardware')) {
      return 'Computer Engineering (CoE)';
    }
    return 'Computer Science & Engineering (CSE)';
  }
  if (c.startsWith('EEE')) return 'Electrical & Electronic Engineering (EEE)';
  if (c.startsWith('MGT')) return 'Engineering Management / BBA';
  if (c.startsWith('MAT') || c.startsWith('MTH')) return 'Mathematics (MATH)';
  if (c.startsWith('PHY')) return 'Physics';
  if (c.startsWith('CHM') || c.startsWith('CHE')) return 'Chemistry';
  return dept || 'Computer Science (CSE)';
}

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
