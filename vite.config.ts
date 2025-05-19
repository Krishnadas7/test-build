import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    css: {
        postcss: './postcss.config.cjs',
    },
    base: './',
    build: {
        outDir: './react-dist',
    },
    server: {
        port: 7091,
        strictPort: true,
    },
});
