import globalStyles from '~/styles/global.css?url';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

import { TopNav } from '~/components/TopNav';
import { Container } from '@mui/material';
import { Analytics } from '@vercel/analytics/react';

export const links = () => [{ rel: 'stylesheet', href: globalStyles }];

export default function App() {
  return (
    <html lang="en">
      <head>
        <title>Spirits Night</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Container maxWidth="lg">
          <TopNav />
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <Analytics />
        </Container>
      </body>
    </html>
  );
}
