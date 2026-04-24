import * as SliderPrimitive from '@radix-ui/react-slider';
import { ADVERSARY_MIN_LEVEL, ADVERSARY_MAX_LEVEL } from '~/constants/game';

interface AdversarySliderProps {
  level: number;
  onChange: (level: number) => void;
  onCommit: (level: number) => void;
}

export function AdversarySlider({ level, onChange, onCommit }: AdversarySliderProps) {
  const levels = Array.from(
    { length: ADVERSARY_MAX_LEVEL - ADVERSARY_MIN_LEVEL + 1 },
    (_, i) => i + ADVERSARY_MIN_LEVEL
  );

  return (
    <div className="px-1">
      <SliderPrimitive.Root
        className="relative flex items-center select-none touch-none w-full h-10"
        value={[level]}
        min={ADVERSARY_MIN_LEVEL}
        max={ADVERSARY_MAX_LEVEL}
        step={1}
        onValueChange={([v]) => onChange(v)}
        onValueCommit={([v]) => onCommit(v)}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full bg-depth-600">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-teal-600" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="slider-thumb block w-5 h-5 rounded-full bg-teal-400 border-2 border-depth-800
                     shadow-lg cursor-pointer hover:bg-teal-300 transition-colors"
          aria-label="Adversary level"
        />
      </SliderPrimitive.Root>

      {/* Level tick labels */}
      <div className="flex justify-between px-0.5 -mt-1">
        {levels.map((l) => (
          <span
            key={l}
            className={`text-xs font-display transition-colors ${
              l === level ? 'text-teal-400' : 'text-slate-600'
            }`}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
