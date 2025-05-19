import { app } from 'electron';
import path from 'path';
import { isDev } from './util.js';

export const preloadPath = () =>
    path.join(app.getAppPath(), isDev() ? '.' : '..', '/electron-dist/preload.cjs');
