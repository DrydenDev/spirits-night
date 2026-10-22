import rawData from '../../../data/community-adversaries.yaml';
import { mapAdversary } from '~/data/adversaries';
import type { Adversary } from '~/types/domain';

interface CommunityAdversariesYaml {
  adversaries: Parameters<typeof mapAdversary>[0][];
}

export const communityAdversaries: Adversary[] = (
  rawData as CommunityAdversariesYaml
).adversaries.map(mapAdversary);
