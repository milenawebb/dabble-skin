import { readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { expect, it } from 'vitest';

it('keeps every local source import inside the reusable skin folder', () => {
  const root = resolve('src/dabble');
  const files = (folder: string): string[] => readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(resolve(folder, entry.name)) : [resolve(folder, entry.name)]);
  for (const file of files(root).filter(file => /\.(ts|tsx|css)$/.test(file))) {
    for (const match of readFileSync(file, 'utf8').matchAll(/(?:from\s*|import\s*|@import\s*)['"]([^'"]+)['"]/g)) {
      const specifier = match[1];
      if (!specifier) continue;
      expect(specifier.startsWith('@/'), file).toBe(false);
      if (specifier.startsWith('.')) expect(resolve(dirname(file), specifier).startsWith(root + '/'), file).toBe(true);
    }
  }
});
