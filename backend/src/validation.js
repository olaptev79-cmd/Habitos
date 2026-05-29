export function requireFields(payload, fields) {
  const missing = fields.filter((field) => !payload?.[field] || String(payload[field]).trim() === '');
  return missing;
}

export function sanitizeText(value = '', max = 160) {
  return String(value).trim().replace(/\s+/g, ' ').slice(0, max);
}

export function ensureMin(value = '', min = 1) {
  return String(value).trim().length >= min;
}
