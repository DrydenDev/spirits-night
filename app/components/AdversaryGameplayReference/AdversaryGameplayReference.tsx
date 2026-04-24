import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { EscalationAlert, LossAlert } from '~/components/AdversaryAlerts';
import { toSpiritIslandText } from '~/utils/spiritIslandText';
import type { Adversary, AdversaryReference } from '~/types/domain';

const PHASE_ORDER = [
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

interface AdversaryGameplayReferenceProps {
  adversary: Adversary;
  level: number;
}

export function AdversaryGameplayReference({ adversary, level }: AdversaryGameplayReferenceProps) {
  const levelReferences = adversary.references.filter((ref) => {
    const atLevel = ref.level <= level;
    const levelExceeded = ref.maxLevel !== null && level > ref.maxLevel;
    return atLevel && !levelExceeded;
  });

  return (
    <div className="bg-depth-800 border border-depth-600 rounded-xl overflow-hidden divide-y divide-depth-600/40">
      {PHASE_ORDER.map((phase) => (
        <PhaseAccordion key={phase} references={levelReferences} phase={phase} />
      ))}
    </div>
  );
}

interface PhaseAccordionProps {
  references: AdversaryReference[];
  phase: string;
}

function PhaseAccordion({ references, phase }: PhaseAccordionProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const phaseRefs = references.filter(
    (ref) => ref.phase.toUpperCase() === phase.toUpperCase()
  );
  if (!phaseRefs.length) return null;

  return (
    <details open className="group">
      <summary className="flex items-center justify-between cursor-pointer px-4 py-3.5 hover:bg-depth-700/40 transition-colors select-none">
        <span className="font-display text-[0.65rem] uppercase tracking-[0.15em] text-teal-300">
          {phase}
        </span>
        <ChevronDown className="w-4 h-4 text-teal-600 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4 flex flex-col gap-3">
        {phaseRefs.map((ref) => {
          if (ref.type === 'Loss Condition') {
            return <LossAlert key={ref.id} title={ref.title} description={ref.description} />;
          }
          if (ref.type === 'Escalation') {
            return <EscalationAlert key={ref.id} title={ref.title} description={ref.description} />;
          }
          return (
            <div key={ref.id}>
              <p className="font-semibold text-slate-100 mb-0.5">{ref.title}</p>
              <p className="text-slate-300 text-base leading-relaxed">
                {toSpiritIslandText(ref.description)}
              </p>
            </div>
          );
        })}
        {phase.toUpperCase() === 'SETUP' && (
          <div className="flex justify-center mt-1">
            <button
              onClick={() => setDismissed(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-depth-500
                         text-slate-500 hover:text-slate-200 hover:border-depth-400
                         transition-colors font-display text-[0.65rem] tracking-widest uppercase"
            >
              <X className="w-3 h-3" />
              Dismiss Setup
            </button>
          </div>
        )}
      </div>
    </details>
  );
}
