import globalStyles from '~/styles/global.css?url';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

import { TopNav } from '~/components/TopNav';
import { Container } from '@mui/material';

// prepend:true inserts Emotion's <style> tag at the top of <head>, before
// React's reconciled children, so hydrateRoot's head reconciliation leaves it alone.
const emotionCache = createCache({ key: 'css', prepend: true });

export const links = () => [{ rel: 'stylesheet', href: globalStyles }];

export default function App() {
  return (
    <CacheProvider value={emotionCache}>
    <html lang="en">
      <head>
        <title>Spirits Night</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        {/* GitHub Pages SPA routing: decode the ?/ redirect from 404.html */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var search = window.location.search;
            if (search[1] === '/') {
              var decoded = search.slice(1).split('&').map(function(s) {
                return s.replace(/~and~/g, '&');
              }).join('?');
              window.history.replaceState(null, null,
                window.location.pathname.slice(0, -1) + decoded + window.location.hash
              );
            }
          })();
        ` }} />
      </head>
      <body>
        <Container maxWidth="lg">
          <TopNav />
          <Outlet />
          <ScrollRestoration />
          <Scripts />
        </Container>
      </body>
    </html>
    </CacheProvider>
  );
}
