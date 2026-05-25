import { loadBackendEnv } from './loadEnv';

loadBackendEnv();

function requireClientUrl(): string {
  const clientUrl = process.env.CLIENT_URL?.trim();

  if (!clientUrl) {
    throw new Error('CLIENT_URL is not set');
  }

  return clientUrl;
}

export const clientUrl = requireClientUrl();