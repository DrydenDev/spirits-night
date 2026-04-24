import { AlertCircle } from 'lucide-react';
import { toSpiritIslandText } from '~/utils/spiritIslandText';

interface LossAlertProps {
  title: string;
  description: string;
}

export function LossAlert({ title, description }: LossAlertProps) {
  return (
    <div className="border-l-4 border-red-500 bg-red-900/15 rounded-r-lg px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
        <span className="font-display text-[0.65rem] uppercase tracking-widest text-red-400">
          Additional Loss Condition
        </span>
      </div>
      <p className="text-slate-200 text-base leading-relaxed">
        <strong className="text-red-300 font-semibold">{title}:</strong>{' '}
        {toSpiritIslandText(description)}
      </p>
    </div>
  );
}
