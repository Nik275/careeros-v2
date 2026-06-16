import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: [
      'lib/**/*.{test,spec}.{js,ts,tsx}',
      'src/lib/**/*.{test,spec}.{js,ts,tsx}',
      'src/app/**/*.{test,spec}.{js,ts,tsx}',
      'src/intelligence/**/*.{test,spec}.{js,ts,tsx}',
      'src/components/**/*.{test,spec}.{js,ts,tsx}',
      'src/mentor-intelligence/**/*.{test,spec}.{js,ts,tsx}',
      'src/archetype/**/*.{test,spec}.{js,ts,tsx}',
      'src/domains/**/*.{test,spec}.{js,ts,tsx}',
      'src/ontology/**/*.{test,spec}.{js,ts,tsx}',
      'src/authoring/**/*.{test,spec}.{js,ts,tsx}',
      'src/data/**/*.{test,spec}.{js,ts,tsx}',
      'src/knowledge-graph/**/*.{test,spec}.{js,ts,tsx}',
      'src/profile/**/*.{test,spec}.{js,ts,tsx}',
      'src/recommendation/**/*.{test,spec}.{js,ts,tsx}',
      'src/outcome-tracking/**/*.{test,spec}.{js,ts,tsx}',
    ],
    exclude: ['node_modules', '.next', 'dist'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
