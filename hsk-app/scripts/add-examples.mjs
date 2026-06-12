// scripts/add-examples.mjs
// examples.json에 예문 배치를 머지 (이미 있는 id는 건드리지 않음).
// 실행: node scripts/add-examples.mjs
import { readFileSync, writeFileSync } from 'fs';

const EXAMPLES_PATH = 'lib/words/examples.json';
const VOCAB_PATH = 'lib/words/hsk_vocab.json';

// ─── 이번 배치 (HSK 4급 16차 — 4급 완성, id 순) ───
const BATCH = {
  1186: { sentence: '祝贺你通过了这次考试！', pinyin: 'Zhùhè nǐ tōngguòle zhè cì kǎoshì!', translation: '이번 시험에 합격한 걸 축하해!' },
  1189: { sentence: '请大家准时参加明天的会议。', pinyin: 'Qǐng dàjiā zhǔnshí cānjiā míngtiān de huìyì.', translation: '모두 내일 회의에 제시간에 참석해 주세요.' },
  1190: { sentence: '这真是一个好主意。', pinyin: 'Zhè zhēn shì yí gè hǎo zhǔyi.', translation: '이건 정말 좋은 생각이다.' },
  1191: { sentence: '我们应该保护大自然。', pinyin: 'Wǒmen yīnggāi bǎohù dà zìrán.', translation: '우리는 대자연을 보호해야 한다.' },
  1193: { sentence: '他是一个很自信的人。', pinyin: 'Tā shì yí gè hěn zìxìn de rén.', translation: '그는 매우 자신감 있는 사람이다.' },
  1194: { sentence: '老师让我们总结一下这次活动。', pinyin: 'Lǎoshī ràng wǒmen zǒngjié yíxià zhè cì huódòng.', translation: '선생님은 우리에게 이번 활동을 정리하게 하셨다.' },
  1195: { sentence: '我在学校附近租了一间房子。', pinyin: 'Wǒ zài xuéxiào fùjìn zūle yì jiān fángzi.', translation: '나는 학교 근처에 방을 하나 세냈다.' },
  1196: { sentence: '你最好早点儿休息。', pinyin: 'Nǐ zuìhǎo zǎo diǎnr xiūxi.', translation: '너는 좀 일찍 쉬는 게 좋겠다.' },
  1197: { sentence: '我们应该尊重别人的意见。', pinyin: 'Wǒmen yīnggāi zūnzhòng biérén de yìjiàn.', translation: '우리는 다른 사람의 의견을 존중해야 한다.' },
  1198: { sentence: '这座山非常高。', pinyin: 'Zhè zuò shān fēicháng gāo.', translation: '이 산은 매우 높다.' },
  1199: { sentence: '他是一位很有名的作家。', pinyin: 'Tā shì yí wèi hěn yǒumíng de zuòjiā.', translation: '그는 매우 유명한 작가이다.' },
  1200: { sentence: '火车上的座位都坐满了。', pinyin: 'Huǒchē shàng de zuòwèi dōu zuòmǎn le.', translation: '기차의 좌석이 모두 찼다.' },
  1201: { sentence: '这种药对治疗感冒很有作用。', pinyin: 'Zhè zhǒng yào duì zhìliáo gǎnmào hěn yǒu zuòyòng.', translation: '이 약은 감기 치료에 효과가 있다.' },
  1202: { sentence: '他每天睡八个小时左右。', pinyin: 'Tā měitiān shuì bā gè xiǎoshí zuǒyòu.', translation: '그는 매일 8시간 정도 잔다.' },
  1203: { sentence: '这本书的作者是一位中国人。', pinyin: 'Zhè běn shū de zuòzhě shì yí wèi Zhōngguórén.', translation: '이 책의 저자는 중국인이다.' },
};

const examples = JSON.parse(readFileSync(EXAMPLES_PATH, 'utf8'));
const vocab = JSON.parse(readFileSync(VOCAB_PATH, 'utf8'));
const vocabById = new Map(vocab.words.map((w) => [w.id, w]));

let added = 0;
const skipped = [];
const warnings = [];

for (const [idStr, ex] of Object.entries(BATCH)) {
  const id = Number(idStr);
  if (!vocabById.has(id)) { warnings.push(`id ${id}: 단어 목록에 없음`); continue; }
  if (examples[idStr]) { skipped.push(id); continue; } // 이미 있으면 보존
  if (!ex.sentence || !ex.pinyin || !ex.translation) { warnings.push(`id ${id}: 필드 누락`); continue; }
  examples[idStr] = ex;
  added++;
}

writeFileSync(EXAMPLES_PATH, JSON.stringify(examples, null, 2) + '\n', 'utf8');

const total = vocab.words.length;
const covered = Object.keys(examples).length;
console.log(`추가: ${added}개` + (skipped.length ? ` | 이미 있어 건너뜀: ${skipped.join(',')}` : ''));
if (warnings.length) console.log('경고:\n  ' + warnings.join('\n  '));
console.log(`커버리지: ${covered}/${total} (${(covered / total * 100).toFixed(1)}%)`);
