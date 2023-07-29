import { cssBundleHref } from "@remix-run/css-bundle";
import globalStyles from "~/styles/global.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import { Container } from "@mui/material";

export const links = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: globalStyles },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Container maxWidth="lg">
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </Container>
      </body>
    </html>
  );
}
