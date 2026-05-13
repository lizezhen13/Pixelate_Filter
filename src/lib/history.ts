import type { PaletteKey, RgbColor } from './palettes';

const STORAGE_KEY = 'pixelate_filter_history';
const MAX_RECORDS = 20;

export interface HistoryParams {
  blockSize: number;
  colorDepth: number;
  paletteKey: PaletteKey;
  customColors: RgbColor[];
}

export interface HistoryRecord {
  id: string;
  thumbnail: string;
  params: HistoryParams;
  timestamp: number;
}

function generateId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function isHistoryRecord(record: unknown): record is HistoryRecord {
  if (!record || typeof record !== 'object') return false;
  const candidate = record as Partial<HistoryRecord>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.thumbnail === 'string' &&
    typeof candidate.timestamp === 'number' &&
    !!candidate.params
  );
}

export function readHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isHistoryRecord) : [];
  } catch {
    return [];
  }
}

export function createHistoryRecord(thumbnail: string, params: HistoryParams): HistoryRecord {
  return {
    id: generateId(),
    thumbnail,
    params,
    timestamp: Date.now(),
  };
}

export function addHistoryRecord(record: HistoryRecord): HistoryRecord[] {
  const list = [record, ...readHistory()].slice(0, MAX_RECORDS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    const smallerList = list.slice(0, Math.max(1, list.length - 1));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(smallerList));
      return smallerList;
    } catch {
      return readHistory();
    }
  }

  return list;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors caused by browser privacy settings.
  }
}

export function formatHistoryTime(timestamp: number): string {
  const date = new Date(timestamp);
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}
