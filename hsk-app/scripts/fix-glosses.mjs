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
  281: { meaning: '(이층 이상의) 건물. (건물의) 층.' }, // 楼 (원본에 "계단" 오류)
  371: { meaning: '날. 일(日); 해. 태양.' }, // 日
  415: { meaning: '살. 세.', partOfSpeech: '양사' }, // 岁 (원본 POS가 명사)
  425: { meaning: '문제 (시험·연습 문제); 제목.' }, // 题
  433: { meaning: '축구를 하다.', partOfSpeech: '동사' }, // 踢足球 (원본 데이터 깨짐)
  442: { meaning: '다하다. 끝나다. 다 ~하다. 완료하다.', partOfSpeech: '동사' }, // 完
  451: { meaning: '…을 위하여. …때문에. [为+대상]', partOfSpeech: '개사' }, // 为 (원본 meaning이 "동사")
  465: { meaning: '먼저. 우선.', partOfSpeech: '부사' }, // 先 (원본이 "원래·처음")
  509: { meaning: '원하다. 필요하다. …하려고 하다.', partOfSpeech: '조동사' }, // 要 (원본 meaning이 "능원동사")
  533: { meaning: '(동사 뒤) 좀. 한번. 잠깐.' }, // 一下
  546: { meaning: '위안(元). [중국 화폐 단위]; 처음의.', partOfSpeech: '양사' }, // 元 (원본이 "시작의·처음의")
  550: { meaning: '(越来越·越…越…) 점점. …할수록; 넘다.', partOfSpeech: '부사' }, // 越
  562: { meaning: '[양사] 장 (종이·책상·사진 등); (입을) 벌리다.', partOfSpeech: '양사' }, // 张 (원본이 "열다·펼치다")
  577: { meaning: '[양사] 종류·가지 (这种); 씨앗. 심다.', partOfSpeech: '양사' }, // 种
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

  // ─── 뜻풀이 전수 검수(4-에이전트) 발견분 ───
  // 뜻 오류/오해 소지
  27: { meaning: '권. [책·노트 등을 세는 단위]', partOfSpeech: '양사' }, // 本
  106: { meaning: '(몸을) 단련하다. 운동하다.' }, // 锻炼
  112: { meaning: '얼마. 몇. [수량·정도를 물음]', partOfSpeech: '대명사' }, // 多少
  120: { meaning: '(물건을) 놓다. 두다; 놓아주다.' }, // 放
  130: { meaning: '부근. 근처.', partOfSpeech: '명사' }, // 附近
  154: { meaning: '닫다. 끄다.' }, // 关 ("덮다" 제거)
  169: { meaning: '(날짜의) 일; (순번) 번호.' }, // 号
  204: { meaning: '부르다; (~하도록) 시키다; 외치다.' }, // 叫
  227: { meaning: '자주. 늘. 항상.', partOfSpeech: '부사' }, // 经常
  238: { meaning: '커피(coffee).' }, // 咖啡 ("커피나무" 오해)
  248: { meaning: '아마(도). 가능하다.' }, // 可能 (부사 용법 보강)
  331: { meaning: '접시. 쟁반.' }, // 盘子
  553: { meaning: '운동. 스포츠. 운동하다.', partOfSpeech: '명사·동사' }, // 运动
  559: { meaning: '어떠하다. 어때(요)? [상황·의견·의향을 물음]' }, // 怎么样
  622: { meaning: '(생각·감정·태도를) 나타내다. 표시하다.' }, // 表示
  700: { meaning: '(휴대폰) 문자 메시지.' }, // 短信 ("짧은 편지" 오류)
  724: { meaning: '부유하다. 재산이 많다; 풍부하다.' }, // 富
  734: { meaning: '감히 …하다. …할 용기가 있다.', partOfSpeech: '조동사' }, // 敢
  859: { meaning: '거실. 응접실.' }, // 客厅 ("객실" 오해)
  867: { meaning: '졸리다. 나른하다.', partOfSpeech: '형용사' }, // 困
  893: { meaning: '남기다. 남겨 두다; 머무르다; 보관하다.' }, // 留
  1063: { meaning: '(맛이) 짜다.', partOfSpeech: '형용사' }, // 咸 (원본 "전부·모두" 깨짐)
  // 품사 필드 누락 보정 (뜻은 유지)
  52: { partOfSpeech: '명사' }, // 超市
  63: { partOfSpeech: '명사' }, // 出租车
  148: { partOfSpeech: '양사' }, // 公斤
  209: { partOfSpeech: '명사' }, // 机场
  273: { partOfSpeech: '동사' }, // 聊天
  297: { partOfSpeech: '관용구' }, // 没关系
  689: { partOfSpeech: '명사' }, // 登机牌
  745: { partOfSpeech: '양사' }, // 公里
  1018: { partOfSpeech: '명사' }, // 塑料袋
  1067: { partOfSpeech: '명사' }, // 橡皮
  1078: { partOfSpeech: '명사' }, // 西红柿
};

const vocab = JSON.parse(readFileSync(PATH, 'utf8'));
let n = 0;
const log = [];
for (const w of vocab.words) {
  const f = FIXES[w.id];
  if (!f) continue;
  if (f.meaning !== undefined) {
    log.push(`${w.id} ${w.hanzi}: "${w.meaning}" → "${f.meaning}"`);
    w.meaning = f.meaning;
  }
  if (f.partOfSpeech) {
    if (f.meaning === undefined)
      log.push(`${w.id} ${w.hanzi}: 품사 → "${f.partOfSpeech}"`);
    w.partOfSpeech = f.partOfSpeech;
  }
  n++;
}

writeFileSync(PATH, JSON.stringify(vocab, null, 2) + '\n', 'utf8');
console.log(`뜻풀이 수정 ${n}개:\n  ` + log.join('\n  '));
