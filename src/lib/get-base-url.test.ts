import { afterEach, expect, test, vi } from 'vitest';
import { HOMEPAGE_URL } from './constants';
import { getBaseUrl } from './get-base-url';

afterEach(() => vi.unstubAllEnvs());

test('configured public origin takes precedence over an old deployment host', () => {
  vi.stubEnv('LIEKAN_PUBLIC_URL', 'https://geo.hong1234.com/');
  expect(getBaseUrl(createHeaders({ host: 'geoinflow.vercel.app' })).href).toBe(
    'https://geo.hong1234.com/',
  );
});

test('configured public origin works without request headers', () => {
  vi.stubEnv('LIEKAN_PUBLIC_URL', 'https://geo.hong1234.com');
  expect(getBaseUrl().href).toBe('https://geo.hong1234.com/');
});

test('rejects non-HTTP public URLs and embedded credentials', () => {
  for (const value of ['javascript:alert(1)', 'https://user:password@example.com']) {
    vi.stubEnv('LIEKAN_PUBLIC_URL', value);
    expect(() => getBaseUrl()).toThrow('LIEKAN_PUBLIC_URL');
  }
});

function createHeaders(entries: Record<string, string>) {
  return {
    get(name: string) {
      return entries[name.toLowerCase()] ?? null;
    },
  };
}

test('prefers forwarded host and protocol', () => {
  const url = getBaseUrl(
    createHeaders({
      'x-forwarded-host': 'umami.is',
      'x-forwarded-proto': 'https',
      host: 'localhost:3000',
    }),
  );

  expect(url.toString()).toBe('https://umami.is/');
});

test('falls back to host header', () => {
  const url = getBaseUrl(
    createHeaders({
      host: 'analytics.example.com',
    }),
  );

  expect(url.toString()).toBe('https://analytics.example.com/');
});

test('uses http for localhost hosts', () => {
  const url = getBaseUrl(
    createHeaders({
      host: 'localhost:3000',
    }),
  );

  expect(url.toString()).toBe('http://localhost:3000/');
});

test('falls back to homepage when host is missing', () => {
  const url = getBaseUrl(createHeaders({}));

  expect(url.toString()).toBe(`${HOMEPAGE_URL}/`);
});
