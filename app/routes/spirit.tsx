import spiritStyles from '~/styles/spirit.css?url';
import { Outlet } from 'react-router';

export const links = () => [{ rel: 'stylesheet', href: spiritStyles }];

export default function SpiritLayout() {
  return <Outlet />;
}
