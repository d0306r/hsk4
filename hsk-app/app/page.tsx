// app/page.tsx
import { HomeGreeting } from '@/components/home/HomeGreeting';
import { WelcomeHint } from '@/components/home/WelcomeHint';
import { StudyLauncher } from '@/components/home/StudyLauncher';
import { LearningStatusCard } from '@/components/home/LearningStatusCard';
import { GuestBanner } from '@/components/home/GuestBanner';
import { DailyGoalCard } from '@/components/home/DailyGoalCard';
import { LevelCard } from '@/components/home/LevelCard';
import { ModeLinks } from '@/components/home/ModeLinks';
import { WordOfTheDay } from '@/components/home/WordOfTheDay';
import { UpcomingReviewChart } from '@/components/home/UpcomingReviewChart';
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

      {/* 홈은 집중형(narrow) 폭 — 설정·학습과 동일 */}
      <PageContainer width="narrow">
        {/* 인사 + 연속 학습 칩 + 배지 */}
        <div className="animate-rise">
          <HomeGreeting />
        </div>

        {/* 게스트일 때만: 로그인 유도 */}
        <GuestBanner />

        {/* 앱 설치 유도 (설치 가능 환경에서만) */}
        <InstallPrompt />

        {/* 첫 방문자 시작 안내 (학습 기록 있으면 자동 숨김) */}
        <WelcomeHint />

        {/* 학습 영역 — 데스크톱 2열 벤토 (휑함 방지) */}
        <div
          className="px-5 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-rise"
          style={{ animationDelay: '90ms' }}
        >
          {/* 통합 학습 시작 — 가장 중요한 액션, 위쪽 전폭 */}
          <div className="sm:col-span-2">
            <StudyLauncher />
          </div>

          {/* 레벨 & 경험치 (학습 기록 있는 사용자) */}
          <LevelCard />

          {/* 다른 모드 — 플래시카드 · 스피드 퀴즈 */}
          <ModeLinks />

          {/* 오늘의 목표 진행 링 (학습 기록 있는 사용자) */}
          <DailyGoalCard />

          {/* 학습 현황 — 접힘 기본(전체 진도만), 펼치면 SRS 단계 */}
          <LearningStatusCard />

          {/* 오늘의 단어 · 다가오는 복습 — 좌우로 세로 여백 채움 */}
          <WordOfTheDay />
          <UpcomingReviewChart />
        </div>
      </PageContainer>

      <BottomNav />
    </main>
  );
}