import adversaryStyles from '~/styles/adversary.css?url';
import { Outlet } from 'react-router';

export const links = () => [{ rel: 'stylesheet', href: adversaryStyles }];

export default function AdversaryLayout() {
  return <Outlet />;
}
