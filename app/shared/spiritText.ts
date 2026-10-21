export type SpiritTextPart =
  | { kind: 'text'; value: string }
  | { kind: 'icon'; value: string; label: string }
  | { kind: 'bold'; value: string }
  | { kind: 'italic'; value: string };

const ICONS: Record<string, { value: string; label: string }> = {
  Beast: { value: 'A', label: 'Beast' },
  Blight: { value: 'B', label: 'Blight' },
  City: { value: 'C', label: 'City' },
  Disease: { value: 'D', label: 'Disease' },
  Explorer: { value: 'E', label: 'Explorer' },
  Fear: { value: 'F', label: 'Fear' },
  Badlands: { value: 'L', label: 'Badlands' },
  Dahan: { value: 'N', label: 'Dahan' },
  Strife: { value: 'S', label: 'Strife' },
  Town: { value: 'T', label: 'Town' },
  Wilds: { value: 'W', label: 'Wilds' },
  Presence: { value: '1', label: 'Presence' },
  'Sacred Site': { value: '2', label: 'Sacred Site' },
  Player: { value: '.', label: 'Player' },
  Players: { value: ':', label: 'Players' },
  Fast: { value: '+', label: 'Fast' },
  Slow: { value: '-', label: 'Slow' },
};

const MARKUP = /(\[\[([^\]]+)\]\]|\*([^*]+)\*|_([^_]+)_)/g;

export function parseSpiritText(input: string | null | undefined): SpiritTextPart[] {
  if (!input) return [];

  const parts: SpiritTextPart[] = [];
  let cursor = 0;

  for (const match of input.matchAll(MARKUP)) {
    const position = match.index ?? cursor;
    if (position > cursor) parts.push({ kind: 'text', value: input.slice(cursor, position) });

    const icon = match[2] ? ICONS[match[2]] : undefined;
    if (icon) {
      parts.push({ kind: 'icon', ...icon });
    } else if (match[3]) {
      parts.push({ kind: 'bold', value: match[3] });
    } else if (match[4]) {
      parts.push({ kind: 'italic', value: match[4] });
    } else {
      parts.push({ kind: 'text', value: match[0] });
    }

    cursor = position + match[0].length;
  }

  if (cursor < input.length) parts.push({ kind: 'text', value: input.slice(cursor) });
  return parts;
}
