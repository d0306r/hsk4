// app/study/[level]/page.tsx
import SessionSetup from '@/components/study/SessionSetup';
import { BottomNav } from '@/components/home/BottomNav';

interface PageProps {
  params: { level: string };
}

export default function StudyLevelPage({ params }: PageProps) {
  const level = parseInt(params.level, 10);

  return (
    <main className="min-h-screen px-4 py-8 pb-24">
      <SessionSetup level={level} />
      <BottomNav />
    </main>
  );
}