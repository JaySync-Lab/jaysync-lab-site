import fs from 'fs';
import path from 'path';

export interface ChangelogEntry {
  date: string | null;
  label: string;
  entries: string[];
}

export function getChangelog(): ChangelogEntry[] {
  const filePath = path.join(process.cwd(), 'content', 'CHANGELOG.md');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n');

  const groups: ChangelogEntry[] = [];
  let current: ChangelogEntry | null = null;

  for (const line of lines) {
    const dated = line.match(/^## (\d{4}-\d{2}-\d{2})$/);
    const earlier = line.match(/^## Earlier/i);
    const bullet = line.match(/^- (.+)/);

    if (dated) {
      if (current) groups.push(current);
      current = { date: dated[1], label: dated[1], entries: [] };
    } else if (earlier) {
      if (current) groups.push(current);
      current = { date: null, label: 'Earlier (reconstructed)', entries: [] };
    } else if (bullet && current) {
      current.entries.push(bullet[1].trim());
    }
  }

  if (current) groups.push(current);

  return groups.sort((a, b) => {
    if (a.date === null) return 1;
    if (b.date === null) return -1;
    return b.date.localeCompare(a.date);
  });
}
