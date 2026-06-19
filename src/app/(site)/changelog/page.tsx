import { getChangelog } from '@/lib/changelog';
import { Timeline } from '@/components/Timeline';

export const metadata = { title: 'Changelog — JaySync-Lab' };

export default function ChangelogPage() {
  const entries = getChangelog();
  const latestDate = entries.find((e) => e.date !== null)?.date;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="font-mono text-[#38bdf8] text-[10px] uppercase tracking-widest mb-3">
          Last updated {latestDate ?? 'recently'}
        </p>
        <h1 className="text-3xl font-bold text-[#e2e8f0]">Changelog</h1>
        <p className="text-[#64748b] mt-3 text-sm leading-relaxed">
          Infrastructure changes, new containers, and configuration updates.
          Entries before 2026-06-17 are reconstructed from git history.
        </p>
      </div>

      <Timeline entries={entries} />
    </div>
  );
}
