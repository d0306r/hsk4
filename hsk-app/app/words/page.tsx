// app/words/page.tsx
import WordBrowser from '@/components/words/WordBrowser';
import { BottomNav } from '@/components/home/BottomNav';

export default function WordsPage() {
  return (
    <main className="min-h-screen md:pt-16">
      <WordBrowser />
      <BottomNav />
    </main>
  );
}
