import { useState } from 'react';
import { redirect } from 'react-router';
import type { ClientLoaderFunctionArgs, MetaFunction } from 'react-router';
import { useLoaderData, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Shuffle, Calendar, Link2 } from 'lucide-react';

import { AdversaryCard } from '~/components/AdversaryCard';
import { AdversaryGameplayReference } from '~/components/AdversaryGameplayReference';
import { AdversarySlider } from '~/components/AdversarySlider';
import { AdversaryTagBar } from '~/components/AdversaryTagBar';
import { getRandomAdversary, getAdversaryBySlug } from '~/models/Adversary';
import { getTodaySeed } from '~/utils/random';
import {
  ADVERSARY_MIN_LEVEL,
  ADVERSARY_MAX_LEVEL,
  TODAY_MIN_ADVERSARY_LEVEL,
} from '~/constants/game';

const TABS = ['card', 'reference'] as const;
type Tab = (typeof TABS)[number];

export const meta: MetaFunction<typeof clientLoader> = ({ data }) => {
  if (!data) return [];
  const { adversary, level } = data;
  return [
    { name: 'title', content: `${adversary.name} — Level ${level}` },
    { name: 'description', content: `Adversary rules for ${adversary.name} at level ${level}` },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: `${adversary.name} — Level ${level}` },
    { property: 'og:image', content: `/images/adversaries/${adversary.slug}/banner.png` },
  ];
};

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const [slug, rawLevel] = (params['*'] ?? '').split('/');
  const parsedLevel = rawLevel !== undefined ? parseInt(rawLevel, 10) : null;
  const clampedLevel =
    parsedLevel !== null && !isNaN(parsedLevel)
      ? Math.min(Math.max(parsedLevel, ADVERSARY_MIN_LEVEL), ADVERSARY_MAX_LEVEL)
      : null;

  if (slug === 'random' || slug === 'today') {
    const randomSeed = slug === 'today' ? getTodaySeed() : null;
    const { adversary, level } = await getRandomAdversary(randomSeed);
    const desiredLevel =
      clampedLevel ?? (slug === 'today' ? Math.max(TODAY_MIN_ADVERSARY_LEVEL, level) : level);
    return redirect(`/adversary/${adversary.slug}/${desiredLevel}`);
  }

  const adversary = await getAdversaryBySlug(slug);
  if (adversary) {
    return { adversary, level: clampedLevel ?? ADVERSARY_MAX_LEVEL };
  }

  throw new Response(null, { status: 404, statusText: 'Adversary not found' });
}

export default function AdversaryDetails() {
  const { adversary, level } = useLoaderData<typeof clientLoader>();
  const [sliderLevel, setSliderLevel] = useState<number | null>(null);
  const [currentTab, setCurrentTab] = useState<Tab>('card');
  const navigate = useNavigate();
  const effectiveLevel = sliderLevel ?? level;

  const linkPage = (slugLink: string) => {
    setSliderLevel(null);
    navigate(`/adversary/${slugLink}`);
  };

  return (
    <div>
      <div className="relative -mx-4 h-44 mb-6 overflow-hidden">
        <img
          src={`/images/adversaries/${adversary.slug}/banner.png`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-depth-950/10 via-depth-950/50 to-depth-950" />
        <div className="absolute bottom-4 left-5">
          <h1 className="font-display text-2xl font-bold text-white tracking-widest uppercase">
            {adversary.name}
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <AdversarySlider
          level={effectiveLevel}
          onChange={(v) => setSliderLevel(v)}
          onCommit={(v) =>
            window.history.replaceState({}, '', `/adversary/${adversary.slug}/${v}`)
          }
        />

        <div className="border-b border-depth-600">
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={[
                  'px-6 py-3 -mb-px border-b-2 transition-colors',
                  'font-display text-[0.65rem] uppercase tracking-widest',
                  currentTab === tab
                    ? 'text-teal-400 border-teal-400'
                    : 'text-slate-500 border-transparent hover:text-slate-300',
                ].join(' ')}
              >
                {tab === 'card' ? 'Card' : 'Reference'}
              </button>
            ))}
          </div>
        </div>

        {currentTab === 'card' ? (
          <AdversaryCard adversary={adversary} level={effectiveLevel} />
        ) : (
          <AdversaryGameplayReference adversary={adversary} level={effectiveLevel} />
        )}

        <AdversaryTagBar adversary={adversary} level={effectiveLevel} />

        <div className="flex flex-wrap justify-center gap-3 py-2">
          <ActionButton icon={<Shuffle className="w-4 h-4" />} onClick={() => linkPage('random')}>
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
