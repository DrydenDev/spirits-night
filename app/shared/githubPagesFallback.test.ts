import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const fallbackHtml = readFileSync(resolve(process.cwd(), 'public/404.html'), 'utf8');
const entryHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

function inlineScript(html: string): string {
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  if (!script) throw new Error('Expected a route recovery script');
  return script;
}

function restoredPath(originalUrl: string): string {
  const original = new URL(originalUrl);
  let redirectedUrl = '';
  runInNewContext(inlineScript(fallbackHtml), {
    window: {
      location: {
        origin: original.origin,
        pathname: original.pathname,
        search: original.search,
        hash: original.hash,
        replace: (url: string) => {
          redirectedUrl = url;
        },
      },
    },
  });

  const redirected = new URL(redirectedUrl);
  let path = '';
  runInNewContext(inlineScript(entryHtml), {
    window: {
      location: { search: redirected.search, hash: redirected.hash },
      history: {
        replaceState: (_state: unknown, _title: string, url: string) => {
          path = url;
        },
      },
    },
  });
  return path;
}

describe('GitHub Pages fallback', () => {
  it('restores a direct adversary permalink', () => {
    expect(restoredPath('https://spiritsnight.com/adversary/england/4')).toBe(
      '/adversary/england/4'
    );
  });

  it('keeps query parameters and fragments on a direct link', () => {
    expect(
      restoredPath('https://spiritsnight.com/adversary/england/4?view=card&note=one#rules')
    ).toBe('/adversary/england/4?view=card&note=one#rules');
  });
});
