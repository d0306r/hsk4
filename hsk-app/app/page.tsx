// app/page.tsx
import { HomeGreeting } from '@/components/home/HomeGreeting';
import { WelcomeHint } from '@/components/home/WelcomeHint';
import { StudyLauncher } from '@/components/home/StudyLauncher';
import { LearningStatusCard } from '@/components/home/LearningStatusCard';
import { GuestBanner } from '@/components/home/GuestBanner';
import { DailyGoalCard } from '@/components/home/DailyGoalCard';
import { BottomNav } from '@/components/home/BottomNav';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import AchievementCelebration from '@/components/achievements/AchievementCelebration';
import { PageContainer } from '@/components/ui/PageContainer';

export default function HomePage() {
  return (
    <main className="pb-24 md:pt-16 md:pb-8">
      {/* 첫 실행 안내 (1회) */}
      <OnboardingModal />

      {/* 새 배지 획득 축하 (있을 때만) */}
      <AchievementCelebration />

      <PageContainer width="narrow">
        {/* 인사 + 연속 학습 칩 */}
        <HomeGreeting />

        {/* 게스트일 때만: 로그인 유도 */}
        <GuestBanner />

        {/* 앱 설치 유도 (설치 가능 환경에서만) */}
        <InstallPrompt />

        {/* 첫 방문자 시작 안내 (학습 기록 있으면 자동 숨김) */}
        <WelcomeHint />

        {/* 통합 학습 시작 — 범위(전체·4급·3급) 선택 후 시작 (가장 중요한 액션) */}
        <StudyLauncher />

        {/* 오늘의 목표 진행 링 (학습 기록 있는 사용자) */}
        <DailyGoalCard />

        {/* 학습 현황 — 접힘 기본(전체 진도만), 펼치면 SRS 단계 */}
        <LearningStatusCard />
      </PageContainer>

      <BottomNav />
    </main>
  );
}