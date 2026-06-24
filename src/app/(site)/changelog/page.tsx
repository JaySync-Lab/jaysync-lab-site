import { getChangelog } from '@/lib/changelog';
import { Timeline } from '@/components/site/Timeline';
import { PageHeader } from '@/components/site/PageHeader';

export const metadata = { title: 'Changelog — JaySync-Lab' };

export default function ChangelogPage() {
  const entries = getChangelog();
  const latestDate = entries.find((e) => e.date !== null)?.date;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 md:pt-24 pb-16 md:pb-20">
      <PageHeader
        eyebrow={`Last updated ${latestDate ?? 'recently'}`}
        title="Changelog"
        description="Infrastructure changes, new containers and configuration updates. Entries before 2026-06-17 are reconstructed from git history."
      />

      <Timeline entries={entries} />
    </div>
  );
}
