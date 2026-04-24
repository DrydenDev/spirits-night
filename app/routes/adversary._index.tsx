import { useMemo } from 'react';
import { Link, useLoaderData, useNavigate } from 'react-router';
import { Shuffle, Calendar } from 'lucide-react';
import { getAllAdversaries } from '~/models/Adversary';
import type { Adversary } from '~/types/domain';

export const meta = () => [
  { name: 'title', content: 'Adversaries' },
  { name: 'description', content: 'List of all Spirit Island Adversaries' },
  { property: 'og:type', content: 'website' },
  { property: 'og:title', content: 'Adversaries' },
  { property: 'og:description', content: 'List of Spirit Island Adversaries' },
  { property: 'og:image', content: '/images/adversaries/adversary_splash.jpg' },
];

export async function clientLoader() {
  return { adversaries: getAllAdversaries() };
}

export default function AdversaryIndex() {
  const { adversaries } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();

  return (
    <div>
      <div className="relative -mx-4 h-52 mb-6 overflow-hidden">
        <img
          src="/images/adversaries/adversary_splash.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-depth-950/10 via-depth-950/55 to-depth-950" />
        <div className="absolute bottom-5 left-5">
          <h1 className="font-display text-3xl font-bold text-white tracking-widest uppercase">
            Adversaries
          </h1>
          <p className="text-slate-500 text-sm mt-1">{adversaries.length} adversaries</p>
        </div>
      </div>

      <AdversaryList adversaries={adversaries} />

      <div className="flex justify-center gap-3 mt-8">
        <ActionButton icon={<Shuffle className="w-4 h-4" />} onClick={() => navigate('/adversary/random')}>
          Random
        </ActionButton>
        <ActionButton icon={<Calendar className="w-4 h-4" />} onClick={() => navigate('/adversary/today')} muted>
          Today
        </ActionButton>
      </div>
    </div>
  );
}

function AdversaryList({ adversaries }: { adversaries: Adversary[] }) {
  const difficultyRange = (adversary: Adversary) => {
    const max = Math.max(...adversary.levels.map((l) => l.difficulty));
    return `${adversary.difficulty}–${max}`;
  };

  const sorted = useMemo(
    () => [...adversaries].sort((a, b) => a.name.localeCompare(b.name)),
    [adversaries]
  );

  return (
    <div className="bg-depth-800 border border-depth-600 rounded-xl overflow-hidden divide-y divide-depth-600/40">
      {sorted.map((adversary) => (
        <Link
          key={adversary.id}
          to={`/adversary/${adversary.slug}`}
          className="flex items-center gap-4 px-4 py-3.5 hover:bg-depth-700/50 transition-colors"
        >
          <img
            src={`/images/adversaries/${adversary.slug}/avatar.png`}
            alt={adversary.name}
            className="w-12 h-12 rounded-full object-cover border border-depth-500/60 shrink-0"
          />
          <div className="min-w-0">
            <p className="font-display text-sm text-teal-400 tracking-wide truncate">
              {adversary.name}
            </p>
            <p className="text-slate-500 text-sm">Difficulty {difficultyRange(adversary)}</p>
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
