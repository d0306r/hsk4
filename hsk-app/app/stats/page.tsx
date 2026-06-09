// app/stats/page.tsx
import StatsOverview from '@/components/stats/StatsOverview';
import { BottomNav } from '@/components/home/BottomNav';

export default function StatsPage() {
  return (
    <main className="min-h-screen md:pt-16">
      <StatsOverview />
      <BottomNav />
    </main>
  );
}