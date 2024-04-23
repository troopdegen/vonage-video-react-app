import { _electron as electron } from '@playwright/test';
import path from 'path';

async function startElectronApp() {
  const electronApp = await electron.launch({
    args: [path.resolve(__dirname, './main.js')],
  });
  return electronApp;
}

module.exports = startElectronApp;
