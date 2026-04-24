import { AlertTriangle } from 'lucide-react';
import { toSpiritIslandText } from '~/utils/spiritIslandText';

interface EscalationAlertProps {
  title: string;
  description: string;
}

export function EscalationAlert({ title, description }: EscalationAlertProps) {
  return (
    <div className="border-l-4 border-amber-500 bg-amber-900/15 rounded-r-lg px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="font-display text-[0.65rem] uppercase tracking-widest text-amber-400">
          Escalation
        </span>
      </div>
      <p className="text-slate-200 text-base leading-relaxed">
        <strong className="text-amber-300 font-semibold">{title}:</strong>{' '}
        {toSpiritIslandText(description)}
      </p>
    </div>
  );
}
