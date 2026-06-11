// app/page.tsx
import { HomeGreeting } from '@/components/home/HomeGreeting';
import { WelcomeHint } from '@/components/home/WelcomeHint';
import { StudySection } from '@/components/home/StudySection';
import { LearningStatusCard } from '@/components/home/LearningStatusCard';
import { BottomNav } from '@/components/home/BottomNav';
import { PageContainer } from '@/components/ui/PageContainer';

export default function HomePage() {
  return (
    <main className="pb-24 md:pt-16 md:pb-8">
      <PageContainer width="narrow">
        {/* 인사 + 연속 학습 칩 */}
        <HomeGreeting />

        {/* 학습 현황 — 접힘 기본(전체 진도만), 펼치면 SRS 단계 */}
        <LearningStatusCard />

        {/* 첫 방문자 시작 안내 (학습 기록 있으면 자동 숨김) */}
        <WelcomeHint />

        {/* 학습 카드 — 가장 먼저 보이게 위로. PC 2열 / 폰 1열 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-5 pt-4">
          <StudySection
            level={4}
            title="4급 신규 학습"
            href="/study/4"
          />

          <StudySection
            level={3}
            title="3급 학습"
            href="/study/3"
          />
        </div>
      </PageContainer>

      <BottomNav />
    </main>
  );
}