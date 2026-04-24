import { useMemo } from 'react';
import { Link, useLoaderData, useNavigate } from 'react-router';
import { Shuffle, Calendar } from 'lucide-react';
import { getAllSpirits } from '~/models/Spirit';
import type { Spirit } from '~/types/domain';

export const meta = () => [
  { name: 'title', content: 'Spirits' },
  { name: 'description', content: 'List of all Spirit Island Spirits' },
  { property: 'og:type', content: 'website' },
  { property: 'og:title', content: 'Spirits' },
  { property: 'og:description', content: 'List of Spirit Island Spirits' },
  { property: 'og:image', content: '/images/spirits/spirits_splash.png' },
];

export async function clientLoader() {
  return { spirits: getAllSpirits() };
}

export default function SpiritIndex() {
  const { spirits } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();

  return (
    <div>
      <div className="relative -mx-4 h-52 mb-6 overflow-hidden">
        <img
          src="/images/spirits/spirits_splash.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-depth-950/10 via-depth-950/55 to-depth-950" />
        <div className="absolute bottom-5 left-5">
          <h1 className="font-display text-3xl font-bold text-white tracking-widest uppercase">
            Spirits
          </h1>
          <p className="text-slate-500 text-sm mt-1">{spirits.length} spirits</p>
        </div>
      </div>

      <SpiritList spirits={spirits} />

      <div className="flex justify-center gap-3 mt-8">
        <ActionButton icon={<Shuffle className="w-4 h-4" />} onClick={() => navigate('/spirit/random')}>
          Random
        </ActionButton>
        <ActionButton icon={<Calendar className="w-4 h-4" />} onClick={() => navigate('/spirit/today')} muted>
          Today
        </ActionButton>
      </div>
    </div>
  );
}

function SpiritList({ spirits }: { spirits: Spirit[] }) {
  const sorted = useMemo(
    () => [...spirits].sort((a, b) => a.name.localeCompare(b.name)),
    [spirits]
  );

  return (
    <div className="bg-depth-800 border border-depth-600 rounded-xl overflow-hidden divide-y divide-depth-600/40">
      {sorted.map((spirit) => (
        <Link
          key={spirit.id}
          to={`/spirit/${spirit.slug}`}
          className="flex items-center gap-4 px-4 py-3.5 hover:bg-depth-700/50 transition-colors"
        >
          <img
            src={`/images/spirits/${spirit.slug}/splash.png`}
            alt={spirit.name}
            className="w-12 h-12 rounded-full object-cover border border-teal-600/20 shrink-0"
          />
          <div className="min-w-0">
            <p className="font-display text-sm text-teal-400 tracking-wide truncate">
              {spirit.name}
            </p>
            <p className="text-slate-500 text-sm">{spirit.complexity} Complexity</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ActionButton({
  icon,
  onClick,
  children,
  muted,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex items-center gap-2 px-5 py-2.5 rounded-lg border transition-colors',
        'font-display text-xs tracking-widest uppercase',
        muted
          ? 'border-depth-500 text-slate-500 hover:text-slate-200 hover:bg-depth-700/50'
          : 'border-teal-600/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500',
      ].join(' ')}
    >
      {icon}
      {children}
    </button>
  );
}
