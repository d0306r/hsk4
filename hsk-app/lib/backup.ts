// lib/backup.ts — 진도/설정 백업(내보내기·가져오기)
// localStorage의 주요 키를 한 파일로 묶어 저장·복원한다.

const KEYS = ['hsk-progress', 'hsk-settings', 'hsk-favorites', 'hsk-theme'] as const;
const APP = 'hsk4voca';

export interface BackupFile {
  app: string;
  version: number;
  exportedAt: string;
  data: Record<string, string>;
}

/** 현재 localStorage를 백업 JSON 문자열로 직렬화 */
export function exportBackup(): string {
  const data: Record<string, string> = {};
  for (const k of KEYS) {
    const v = localStorage.getItem(k);
    if (v != null) data[k] = v;
  }
  const file: BackupFile = {
    app: APP,
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
  return JSON.stringify(file, null, 2);
}

/** 백업 JSON을 검증 후 localStorage에 복원(덮어쓰기) */
export function importBackup(json: string): { ok: boolean; error?: string } {
  let parsed: Partial<BackupFile>;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: '파일을 읽을 수 없어요 (JSON 형식 아님)' };
  }
  if (
    !parsed ||
    parsed.app !== APP ||
    parsed.data === null ||
    typeof parsed.data !== 'object' ||
    Array.isArray(parsed.data)
  ) {
    return { ok: false, error: '이 앱의 백업 파일이 아니에요' };
  }
  const data = parsed.data as Record<string, unknown>;
  let restored = 0;
  for (const k of KEYS) {
    const v = data[k];
    if (typeof v === 'string') {
      try {
        localStorage.setItem(k, v);
        restored++;
      } catch {
        /* 개별 키 실패는 건너뜀 */
      }
    }
  }
  if (restored === 0) {
    return { ok: false, error: '복원할 데이터가 없어요' };
  }
  return { ok: true };
}

/** 백업 파일을 브라우저에서 다운로드 */
export function downloadBackup(): void {
  const json = exportBackup();
  const now = new Date();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hsk-progress-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
