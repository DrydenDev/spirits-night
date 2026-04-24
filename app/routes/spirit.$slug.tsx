import { redirect } from 'react-router';
import type { ClientLoaderFunctionArgs, MetaFunction } from 'react-router';
import { useLoaderData, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ColorThief from 'colorthief';
import { toast } from 'sonner';
import { RotateCcw, Link2, Calendar } from 'lucide-react';

import { getRandomSpirit, getSpiritBySlug } from '~/models/Spirit';
import { getTodaySeed } from '~/utils/random';
import { toSpiritIslandText } from '~/utils/spiritIslandText';
import type { Spirit } from '~/types/domain';

const DEFAULT_COLOR = [20, 184, 166];

function getChartTheme(color: number[]): { bg: string; barFill: string; labelColor: string } {
  const [r, g, b] = color;
  const brightness = Math.sqrt(r * r * 0.241 + g * g * 0.691 + b * b * 0.068);
  if (brightness > 130) {
    const dark = color.map((c) => Math.floor(c * 0.25));
    return {
      bg: `rgba(${dark.join(',')}, 0.9)`,
      barFill: `rgb(${color.join(',')})`,
      labelColor: '#f1f5f9',
    };
  }
  return {
    bg: `rgba(${r},${g},${b}, 0.2)`,
    barFill: `rgba(${Math.min(r + 90, 255)},${Math.min(g + 90, 255)},${Math.min(b + 90, 255)}, 1)`,
    labelColor: '#f1f5f9',
  };
}

export const meta: MetaFunction<typeof clientLoader> = ({ data }) => {
  if (!data) return [];
  const { spirit } = data;
  return [
    { name: 'title', content: spirit.name },
    { name: 'description', content: `Summary of ${spirit.name}` },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: spirit.name },
    { property: 'og:description', content: `Summary of ${spirit.name}` },
    { property: 'og:image', content: `/images/spirits/${spirit.slug}/splash.png` },
  ];
};

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const { slug } = params;
  if (!slug) throw new Response(null, { status: 404, statusText: 'Spirit not found' });

  if (slug === 'random' || slug === 'today') {
    const randomSeed = slug === 'today' ? getTodaySeed() : null;
    return redirect(`/spirit/${getRandomSpirit(randomSeed).slug}`);
  }

  const spirit = getSpiritBySlug(slug);
  if (!spirit) throw new Response(null, { status: 404, statusText: 'Spirit not found' });
  return { spirit };
}

export default function SpiritDetails() {
  const { spirit } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const [color, setColor] = useState<number[]>(DEFAULT_COLOR);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const palette = new ColorThief().getPalette(img, 5) as number[][];
        setColor(palette[Math.floor(Math.random() * palette.length)]);
      } catch {
        // keep default on error
      }
    };
    img.src = `/images/spirits/${spirit.slug}/splash.png`;
  }, [spirit.slug]);

  const theme = getChartTheme(color);
  const linkPage = (slugLink: string) => navigate(`/spirit/${slugLink}`);

  return (
    <div>
      <div className="relative -mx-4 h-60 mb-6 overflow-hidden">
        <img
          src={`/images/spirits/${spirit.slug}/splash.png`}
          alt={spirit.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-depth-950/40 to-depth-950" />
        <div className="absolute bottom-4 left-5 right-5">
          <h1 className="font-display text-2xl font-bold text-white tracking-widest uppercase leading-tight">
            {spirit.name}
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {spirit.playstyle && <PlaystyleCard text={spirit.playstyle} accentColor={color} />}

        <SpiritChart spirit={spirit} theme={theme} />

        <div className="flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-display tracking-wide border bg-teal-900/30 border-teal-600/40 text-teal-300">
            {spirit.complexity} Complexity
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-display tracking-wide border bg-depth-700 border-depth-500 text-slate-400">
            {spirit.expansion}
          </span>
          {spirit.incarna && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-display tracking-wide border bg-amber-900/30 border-amber-500/40 text-amber-300">
              Incarna
            </span>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3 py-2">
          <ActionButton icon={<RotateCcw className="w-4 h-4" />} onClick={() => linkPage('random')}>
            Random
          </ActionButton>
          <ActionButton
            icon={<Link2 className="w-4 h-4" />}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast('Permalink copied!');
            }}
          >
            Permalink
          </ActionButton>
          <ActionButton icon={<Calendar className="w-4 h-4" />} onClick={() => linkPage('today')}>
            Today
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

function PlaystyleCard({ text, accentColor }: { text: string; accentColor: number[] }) {
  const [r, g, b] = accentColor;
  return (
    <div className="rounded-xl overflow-hidden border border-depth-600 max-w-xl mx-auto w-full">
      <div
        className="px-4 py-2.5 border-b border-white/10"
        style={{ backgroundColor: `rgba(${r},${g},${b},0.25)` }}
      >
        <h3 className="font-display text-[0.65rem] uppercase tracking-widest text-white/80">
          Playstyle
        </h3>
      </div>
      <div className="bg-depth-800 px-4 py-4">
        <p className="text-slate-200 whitespace-pre-wrap text-base leading-relaxed">
          {toSpiritIslandText(text)}
        </p>
      </div>
    </div>
  );
}

function TooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-depth-800 border border-depth-600 rounded-lg px-3 py-2 text-sm shadow-xl">
      <span className="text-slate-400">{label}: </span>
      <span className="text-slate-100 font-semibold tabular-nums">{payload[0].value}</span>
    </div>
  );
}

function SpiritChart({
  spirit,
  theme,
}: {
  spirit: Spirit;
  theme: { bg: string; barFill: string; labelColor: string };
}) {
  const data = [
    { name: 'Offense', attribute: spirit.offense },
    { name: 'Control', attribute: spirit.control },
    { name: 'Fear', attribute: spirit.fear },
    { name: 'Defense', attribute: spirit.defense },
    { name: 'Utility', attribute: spirit.utility },
  ];

  const minTick = Math.min(0, ...data.map((d) => d.attribute));
  const maxTick = Math.max(5, ...data.map((d) => d.attribute));
  const ticks = Array.from({ length: maxTick - minTick + 1 }, (_, i) => i + minTick);

  return (
    <div
      className="rounded-xl overflow-hidden max-w-md mx-auto w-full"
      style={{ backgroundColor: theme.bg }}
    >
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={data} margin={{ top: 16, right: 12, left: 4, bottom: 0 }}>
          <YAxis hide ticks={ticks} domain={[minTick, maxTick]} width={0} />
          <XAxis
            dataKey="name"
            tickLine={false}
            interval={0}
            tick={{
              fontWeight: 600,
              fill: theme.labelColor,
              fontSize: 11,
              fontFamily: 'Cinzel, Georgia, serif',
            }}
          />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<TooltipContent />} />
          <Bar dataKey="attribute" fill={theme.barFill} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ActionButton({
  icon,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-depth-500
                 text-slate-400 hover:text-teal-400 hover:border-teal-600/50 transition-colors
                 font-display text-[0.65rem] tracking-widest uppercase"
    >
      {icon}
      {children}
    </button>
  );
}
