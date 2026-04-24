import { NavLink } from 'react-router';
import { toSpiritIslandText } from '~/utils/spiritIslandText';

export function TopNav() {
  return (
    <nav className="sticky top-0 z-50 bg-depth-900/95 backdrop-blur-sm border-b border-depth-600">
      <div className="max-w-3xl mx-auto px-4 py-4 flex justify-around items-center">
        <NavItem to="/adversary" glyph="[[Explorer]]" label="Adversaries" />
        <NavItem to="/spirit" glyph="[[Presence]]" label="Spirits" />
      </div>
    </nav>
  );
}

function NavItem({ to, glyph, label }: { to: string; glyph: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex items-center gap-2 transition-colors',
          'font-display text-xs tracking-[0.18em] uppercase',
          isActive ? 'text-teal-300' : 'text-teal-500 hover:text-teal-300',
        ].join(' ')
      }
    >
      <span className="text-base leading-none">{toSpiritIslandText(glyph)}</span>
      <span>{label}</span>
    </NavLink>
  );
}
