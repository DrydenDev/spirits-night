import { EscalationAlert, LossAlert } from '~/components/AdversaryAlerts';
import { toSpiritIslandText } from '~/utils/spiritIslandText';
import type { Adversary, AdversaryLevel } from '~/types/domain';

interface AdversaryCardProps {
  adversary: Adversary;
  level: number;
}

function getDifficultyLevel(adversary: Adversary, level: number): AdversaryLevel | undefined {
  return adversary.levels.find((adversaryLevel) => adversaryLevel.level === level);
}

export function AdversaryCard({ adversary, level }: AdversaryCardProps) {
  const { lossCondition, escalationAbility, levels } = adversary;
  const difficultyLevel = getDifficultyLevel(adversary, level);
  const sortedLevels = [...levels].sort((a, b) => a.level - b.level);
  const activeLevels = sortedLevels.filter((l) => l.level <= level);

  return (
    <div className="bg-depth-800 border border-depth-600 rounded-xl overflow-hidden flex flex-col gap-3 p-4">
      {lossCondition && (
        <LossAlert title={lossCondition.title} description={lossCondition.description} />
      )}
      <EscalationAlert
        title={escalationAbility.title}
        description={escalationAbility.description}
      />

      {/* Fear Cards */}
      <div className="rounded-lg overflow-hidden border border-teal-700/25">
        <div className="bg-teal-900/40 border-b border-teal-700/25 px-4 py-2">
          <h4 className="font-display text-[0.65rem] uppercase tracking-widest text-teal-400">
            Fear Cards
          </h4>
        </div>
        <div className="px-4 py-3">
          <span className="text-slate-200 text-lg tabular-nums">
            {difficultyLevel?.fearCards ?? '3/3/3'}
          </span>
        </div>
      </div>

      {/* Level abilities */}
      {activeLevels.length > 0 && (
        <ul className="divide-y divide-depth-600/40">
          {activeLevels.map((levelRow) => (
            <li key={levelRow.id} className="py-3 first:pt-0 last:pb-0">
              <p className="font-semibold text-slate-100 mb-0.5">{levelRow.title}</p>
              <p className="text-slate-300 text-base leading-relaxed">
                {toSpiritIslandText(levelRow.description)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
