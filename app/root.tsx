import globalStyles from '~/styles/global.css?url';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { Toaster } from 'sonner';
import { TopNav } from '~/components/TopNav';

export const links = () => [{ rel: 'stylesheet', href: globalStyles }];

export default function App() {
  return (
    <html lang="en">
      <head>
        <title>Spirits Night</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
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
        <div className="min-h-screen">
          <TopNav />
          <main className="max-w-3xl mx-auto px-4 pb-16">
            <Outlet />
          </main>
        </div>
        <Toaster
          position="bottom-center"
          theme="dark"
          toastOptions={{
            style: {
              background: '#0e1d32',
              border: '1px solid #1b3050',
              color: '#dde5f0',
              fontFamily: "'Lora', Georgia, serif",
              fontSize: '1rem',
            },
          }}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
