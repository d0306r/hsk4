// app/notes/page.tsx
import WrongNoteList from '@/components/notes/WrongNoteList';
import { BottomNav } from '@/components/home/BottomNav';
import { allWords } from '@/lib/words/mock';

export default function NotesPage() {
  return (
    <main className="md:pt-16">
      <WrongNoteList allWords={allWords} />
      <BottomNav />
    </main>
  );
}