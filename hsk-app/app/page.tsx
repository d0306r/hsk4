// app/page.tsx
import { ProgressHeader } from '@/components/home/ProgressHeader';
import { WelcomeHint } from '@/components/home/WelcomeHint';
import { StreakBanner } from '@/components/home/StreakBanner';
import { StudySection } from '@/components/home/StudySection';
import { SrsStageCard } from '@/components/home/SrsStageCard';
import { BottomNav } from '@/components/home/BottomNav';
import { PageContainer } from '@/components/ui/PageContainer';

export default function HomePage() {
  return (
    <main className="pb-24 md:pt-16 md:pb-8">
      <PageContainer width="narrow">
        <ProgressHeader />

        {/* 첫 방문자 시작 안내 (학습 기록 있으면 자동 숨김) */}
        <WelcomeHint />

        {/* 연속 학습 배너 (스트릭 0이면 자동 숨김) */}
        <StreakBanner />

        {/* 학습 카드 — PC에서 2열, 폰에서 1열 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-5 pt-2">
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

        {/* 학습 단계 — SRS 분포 (통계에서 이동) */}
        <div className="pt-2">
          <SrsStageCard />
        </div>
      </PageContainer>

      <BottomNav />
    </main>
  );
}