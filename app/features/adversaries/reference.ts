import type { AdversaryReference } from '~/types/domain';

export const PHASE_ORDER = [
  'Setup',
  'Traits',
  'Spirit',
  'Fast',
  'Event',
  'Fear',
  'Invader',
  'Ravage',
  'Build',
  'Explore',
  'Slow',
  'Time Passes',
] as const;

export function referencesAtLevel(
  references: AdversaryReference[],
  level: number
): AdversaryReference[] {
  return references.filter(
    (reference) =>
      reference.level <= level && (reference.maxLevel === null || level <= reference.maxLevel)
  );
}
