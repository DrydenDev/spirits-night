import type { Adversary } from '~/types/domain';

type PlaytestConfidence = NonNullable<Adversary['playtestConfidence']>;

export const PLAYTEST_CONFIDENCE_LABELS: Record<PlaytestConfidence, string> = {
  more: 'More playtest evidence',
  some: 'Some play reports',
  limited: 'Limited play reports',
};
