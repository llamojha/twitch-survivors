import assert from 'node:assert/strict';
import test from 'node:test';
import { selectViewerLabelIds } from '../src/audience/ViewerLabelLayout';

test('viewer labels respect collision and display budgets while rotating priority', () => {
  const candidates = [
    { id: 'a', x: 0, y: 0, width: 50, height: 20 },
    { id: 'b', x: 10, y: 0, width: 50, height: 20 },
    { id: 'c', x: 100, y: 0, width: 50, height: 20 },
    { id: 'd', x: 200, y: 0, width: 50, height: 20 },
  ];
  assert.deepEqual([...selectViewerLabelIds(candidates, 0, 2)], ['a', 'c']);
  assert.deepEqual([...selectViewerLabelIds(candidates, 1, 2)], ['b', 'c']);
  assert.deepEqual([...selectViewerLabelIds(candidates, 3, 1)], ['d']);
});
