export function parseDateTimeValue(value?: string | null) {
  if (!value) return null;
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const parsed = new Date(normalized);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

export function beijingTimeValue(value?: string | null) {
  return parseDateTimeValue(value)?.getTime() ?? 0;
}

export function formatBeijingTime(value?: string | null, withSeconds = false) {
  const parsed = parseDateTimeValue(value);
  if (!parsed) return value ? value.replace('T', ' ').replace(/Z$/, '').slice(0, withSeconds ? 19 : 16) : '-';

  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: withSeconds ? '2-digit' : undefined,
    hour12: false,
  }).formatToParts(parsed);

  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  const date = `${get('year')}-${get('month')}-${get('day')}`;
  const time = withSeconds ? `${get('hour')}:${get('minute')}:${get('second')}` : `${get('hour')}:${get('minute')}`;
  return `${date} ${time}`;
}
