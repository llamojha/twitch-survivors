export interface ViewerLabelCandidate {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

function overlaps(a: ViewerLabelCandidate, b: ViewerLabelCandidate, padding: number): boolean {
  return a.x < b.x + b.width + padding && a.x + a.width + padding > b.x
    && a.y < b.y + b.height + padding && a.y + a.height + padding > b.y;
}

/** Greedy collision-free label selection with a rotating priority offset. */
export function selectViewerLabelIds(
  candidates: readonly ViewerLabelCandidate[],
  priorityOffset: number,
  maxVisible: number,
  padding = 4,
): ReadonlySet<string> {
  const selected: ViewerLabelCandidate[] = [];
  const count = candidates.length;
  if (!count || maxVisible <= 0) return new Set();
  const start = ((Math.floor(priorityOffset) % count) + count) % count;
  for (let step = 0; step < count && selected.length < maxVisible; step++) {
    const candidate = candidates[(start + step) % count];
    if (!selected.some(existing => overlaps(candidate, existing, padding))) selected.push(candidate);
  }
  return new Set(selected.map(candidate => candidate.id));
}
