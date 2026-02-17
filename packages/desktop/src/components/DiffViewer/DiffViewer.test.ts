import { describe, it, expect } from 'vitest';
import { parseDiff } from './DiffViewer.js';

const SAMPLE_DIFF = `diff --git a/src/main.ts b/src/main.ts
index abc123..def456 100644
--- a/src/main.ts
+++ b/src/main.ts
@@ -1,5 +1,6 @@
 import { foo } from './foo';
-import { bar } from './bar';
+import { bar } from './bar-v2';
+import { baz } from './baz';

 function main() {
   foo();
@@ -10,4 +11,3 @@ function main() {
 }

-export default main;
 export { main };`;

describe('parseDiff', () => {
  it('parses hunks from unified diff', () => {
    const hunks = parseDiff(SAMPLE_DIFF);
    expect(hunks).toHaveLength(2);
  });

  it('extracts hunk header numbers', () => {
    const hunks = parseDiff(SAMPLE_DIFF);
    expect(hunks[0].oldStart).toBe(1);
    expect(hunks[0].oldCount).toBe(5);
    expect(hunks[0].newStart).toBe(1);
    expect(hunks[0].newCount).toBe(6);
  });

  it('identifies additions and removals', () => {
    const hunks = parseDiff(SAMPLE_DIFF);
    const adds = hunks[0].lines.filter((l) => l.type === 'add');
    const removes = hunks[0].lines.filter((l) => l.type === 'remove');
    expect(adds).toHaveLength(2);
    expect(removes).toHaveLength(1);
  });

  it('assigns line numbers correctly', () => {
    const hunks = parseDiff(SAMPLE_DIFF);
    const contextLine = hunks[0].lines[0];
    expect(contextLine.type).toBe('context');
    expect(contextLine.oldLineNo).toBe(1);
    expect(contextLine.newLineNo).toBe(1);
  });

  it('returns empty array for empty diff', () => {
    expect(parseDiff('')).toHaveLength(0);
  });

  it('handles diff with no hunks', () => {
    expect(parseDiff('diff --git a/foo b/foo\nindex abc..def')).toHaveLength(0);
  });
});
