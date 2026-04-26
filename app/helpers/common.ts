export function toIsoDate(value: Date | string | null): string | null {
  if (value == null) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.toISOString();
}

export function toIsoRequired(value: Date | string): string {
  return typeof value === 'string' ? value : value.toISOString();
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'Present';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

export function buildDateRange(startDate?: string | null, endDate?: string | null): string | null {
  if (startDate == null && endDate == null) return null;
  if (startDate != null && endDate != null) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }
  if (startDate != null) {
    return `${formatDate(startDate)} - Present`;
  }
  return formatDate(endDate);
}

export function toSecureAssetUrl(value: string): string {
  const trimmed = value.trim();

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  if (trimmed.startsWith('http://')) {
    return `https://${trimmed.slice('http://'.length)}`;
  }

  return trimmed;
}