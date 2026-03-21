import adversaryStyles from '~/styles/adversary.css';
import { Outlet } from '@remix-run/react';

export const links = () => [{ rel: 'stylesheet', href: adversaryStyles }];

export default function AdversaryLayout() {
  return <Outlet />;
}
