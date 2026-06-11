// scripts/fix-glosses.mjs
// hsk_vocab.json의 일부 단어 뜻풀이(meaning)를 실제 HSK 용법에 맞게 교정.
// 실행: node scripts/fix-glosses.mjs
import { readFileSync, writeFileSync } from 'fs';

const PATH = 'lib/words/hsk_vocab.json';

// id → 교정값 (meaning 필수, partOfSpeech는 필요할 때만)
const FIXES = {
  610: { meaning: '대단하다. 훌륭하다. 멋지다. (명사) 막대기. 몽둥이.', partOfSpeech: '형용사' }, // 棒
  645: { meaning: '만리장성.' }, // 长城
  654: { meaning: '담배를 피우다.' }, // 抽烟
  664: { meaning: '(돈·물건을) 저금하다. 맡기다. 보관하다. 존재하다.' }, // 存
  674: { meaning: '(액체를) 붓다. 따르다; 거꾸로 되다. 뒤집히다.', partOfSpeech: '동사' }, // 倒
  685: { meaning: '할인하다. 세일하다.' }, // 打折
  714: { meaning: '여름 방학을 하다.', partOfSpeech: '동사' }, // 放暑假 (원본 데이터 깨짐)
  732: { meaning: '(일을) 하다. 종사하다.', partOfSpeech: '동사' }, // 干 (gàn)
  737: { meaning: '방금. 막. 마침.', partOfSpeech: '부사' }, // 刚 (gāng)
  744: { meaning: '(들인) 시간과 노력. 솜씨.' }, // 功夫
  750: { meaning: '(고리·못 등에) 걸다. 매달다; (전화를) 끊다.' }, // 挂
  802: { meaning: '내다. 제출하다. (친구를) 사귀다.' }, // 交 (交作业·交朋友)
  813: { meaning: '명절. 축제일; (수업의) 교시.' }, // 节
};

const vocab = JSON.parse(readFileSync(PATH, 'utf8'));
let n = 0;
const log = [];
for (const w of vocab.words) {
  const f = FIXES[w.id];
  if (!f) continue;
  log.push(`${w.id} ${w.hanzi}: "${w.meaning}" → "${f.meaning}"`);
  w.meaning = f.meaning;
  if (f.partOfSpeech) w.partOfSpeech = f.partOfSpeech;
  n++;
}

writeFileSync(PATH, JSON.stringify(vocab, null, 2) + '\n', 'utf8');
console.log(`뜻풀이 수정 ${n}개:\n  ` + log.join('\n  '));
