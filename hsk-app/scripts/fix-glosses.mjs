// scripts/fix-glosses.mjs
// hsk_vocab.json의 일부 단어 뜻풀이(meaning)를 실제 HSK 용법에 맞게 교정.
// 실행: node scripts/fix-glosses.mjs
import { readFileSync, writeFileSync } from 'fs';

const PATH = 'lib/words/hsk_vocab.json';

// id → 교정값 (meaning 필수, partOfSpeech는 필요할 때만)
const FIXES = {
  // HSK3 깨진/오류 뜻풀이
  23: { meaning: '…에게 …당하다 (피동 표지); 이불.', partOfSpeech: '개사' }, // 被
  30: { meaning: '…하지 마라. …하지 마. [금지]', partOfSpeech: '부사' }, // 别 (원본 meaning이 "부사")
  41: { meaning: '천만에요. (감사에 대한 답); 사양하지 않다.', partOfSpeech: '관용구' }, // 不客气 (원본 데이터 깨짐)
  64: { meaning: '번. 회.', partOfSpeech: '양사' }, // 次 (원본 POS가 동사)
  70: { meaning: '전화를 걸다.', partOfSpeech: '동사' }, // 打电话 (원본 데이터 깨짐)
  73: { meaning: '농구를 하다.', partOfSpeech: '동사' }, // 打篮球 (원본 데이터 깨짐)
  76: { meaning: '그러나. 그렇지만. [주로 虽然과 호응]' }, // 但是 (원본에 빈 따옴표)
  119: { meaning: '식당; (큰 규모의) 호텔.' }, // 饭店
  136: { meaning: '관심이 있다. 흥미가 있다.', partOfSpeech: '동사' }, // 感兴趣 (원본 데이터 깨짐)
  172: { meaning: '…와〔과〕; 그리고.', partOfSpeech: '접속사' }, // 和 (원본 meaning이 "접속사")
  193: { meaning: '혹은. 또는. (아마)', partOfSpeech: '접속사' }, // 或者
  195: { meaning: '몹시. 극히 (好极了); 정점. 끝.' }, // 极
  251: { meaning: '에어컨.', partOfSpeech: '명사' }, // 空调 (원본이 "공기를 조절하다")
  254: { meaning: '[양사] 덩이·조각; (구어) 위안(元) (五块钱).', partOfSpeech: '양사' }, // 块
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
  881: { meaning: '…조차(도). 마저 (连…都/也); 잇다. 연결하다.' }, // 连
  921: { meaning: '(어떤 일을) 하다. 다루다. (~한 상태로) 만들다. 망가뜨리다.', partOfSpeech: '동사' }, // 弄 (弄坏·弄脏)
  955: { meaning: '오히려. 도리어. 그러나.', partOfSpeech: '부사' }, // 却
  966: { meaning: '입구.', partOfSpeech: '명사' }, // 入口 (진입구; '수입'은 进口)
  1033: { meaning: '(손에) 들다. (의견·문제를) 제기하다. 끌어올리다.' }, // 提
  1034: { meaning: '빈칸을 채우다.' }, // 填空
  1038: { meaning: '꽤. 제법. 상당히.', partOfSpeech: '부사' }, // 挺 (挺好的)
  1117: { meaning: '(시합·내기에서) 이기다.' }, // 赢
  1126: { meaning: '…이〔가〕 (담당하다). …에 의해; 원인. 까닭.', partOfSpeech: '개사' }, // 由
  1166: { meaning: '가리키다. 지적하다; (손)가락.', partOfSpeech: '동사' }, // 指
  1167: { meaning: '…의; ~ 중의 (之一·之间). [문어 조사]', partOfSpeech: '조사' }, // 之
  1196: { meaning: '(부사) …하는 게 좋다; 가장 좋다.', partOfSpeech: '부사' }, // 最好
  1198: { meaning: '[양사] 채·동·좌 (산·다리·건물 등 큰 것); 자리.', partOfSpeech: '양사' }, // 座
  1202: { meaning: '(수량 뒤) …쯤. 가량. 안팎; 왼쪽과 오른쪽.' }, // 左右
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
