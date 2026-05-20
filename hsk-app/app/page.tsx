// app/page.tsx
import { ProgressHeader } from '@/components/home/ProgressHeader';
import { StudySection } from '@/components/home/StudySection';
import { BottomNav } from '@/components/home/BottomNav';

export default function HomePage() {
  return (
    <main className="pb-24">
      <ProgressHeader />

      <div className="pt-2">
        <StudySection
          level={4}
          title="4급 신규 학습"
          href="/study/4"
        />

        <StudySection
          level={3}
          title="3급 복습"
          href="/study/3"
          reviewOnly
        />
      </div>

      <BottomNav />
    </main>
  );
}