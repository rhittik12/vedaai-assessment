import path from 'path';

import dotenv from 'dotenv';

let isLoaded = false;

export function loadBackendEnv(): void {
  if (isLoaded) {
    return;
  }

  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  isLoaded = true;
}