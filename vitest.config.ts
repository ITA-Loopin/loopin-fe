import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
        enabled: true,
        headless: true,
        provider: 'playwright',
        instances: [{ browser: 'chromium' }]
      },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
      // Node 환경 유닛 테스트 (라이브러리/유틸/서비스 코어). `npm test`로 실행.
      {
        resolve: {
          alias: { '@': path.join(dirname, 'src') },
        },
        test: {
          name: 'unit',
          // 기본은 node(services 테스트). 훅 테스트(.test.tsx)는 파일 상단
          // `// @vitest-environment jsdom` docblock으로 개별 override 한다.
          environment: 'node',
          include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
          setupFiles: ['src/test/setup.ts'],
        },
      },
    ],
  },
});
