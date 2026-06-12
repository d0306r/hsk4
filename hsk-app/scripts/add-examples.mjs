// scripts/add-examples.mjs
// examples.json에 예문 배치를 머지 (이미 있는 id는 건드리지 않음).
// 실행: node scripts/add-examples.mjs
import { readFileSync, writeFileSync } from 'fs';

const EXAMPLES_PATH = 'lib/words/examples.json';
const VOCAB_PATH = 'lib/words/hsk_vocab.json';

// ─── 이번 배치 (HSK 3급 6차, id 순) ───
const BATCH = {
  346: { sentence: '我用铅笔写字，写错了可以擦掉。', pinyin: 'Wǒ yòng qiānbǐ xiězì, xiě cuòle kěyǐ cā diào.', translation: '나는 연필로 글씨를 써서, 틀리면 지울 수 있다.' },
  349: { sentence: '飞机马上就要起飞了。', pinyin: 'Fēijī mǎshàng jiùyào qǐfēi le.', translation: '비행기가 곧 이륙한다.' },
  351: { sentence: '我每天六点就起来了。', pinyin: 'Wǒ měitiān liù diǎn jiù qǐlái le.', translation: '나는 매일 6시에 일어난다.' },
  352: { sentence: '今天天气很晴，适合出去玩。', pinyin: 'Jīntiān tiānqì hěn qíng, shìhé chūqù wán.', translation: '오늘 날씨가 맑아서, 나가서 놀기 좋다.' },
  353: { sentence: '请大家安静一下。', pinyin: 'Qǐng dàjiā ānjìng yíxià.', translation: '모두 좀 조용히 해 주세요.' },
  354: { sentence: '这件事我没听清楚，请再说一遍。', pinyin: 'Zhè jiàn shì wǒ méi tīng qīngchu, qǐng zài shuō yí biàn.', translation: '이 일을 제가 잘 못 들었어요, 다시 한 번 말씀해 주세요.' },
  356: { sentence: '大家都觉得他很认真，其实他很懒。', pinyin: 'Dàjiā dōu juéde tā hěn rènzhēn, qíshí tā hěn lǎn.', translation: '모두 그가 성실하다고 생각하지만, 사실 그는 게으르다.' },
  357: { sentence: '除了你，其他人都同意了。', pinyin: 'Chúle nǐ, qítā rén dōu tóngyì le.', translation: '너를 제외하고, 다른 사람들은 모두 동의했다.' },
  358: { sentence: '秋天是收获的季节。', pinyin: 'Qiūtiān shì shōuhuò de jìjié.', translation: '가을은 수확의 계절이다.' },
  360: { sentence: '周末我想去看望奶奶。', pinyin: 'Zhōumò wǒ xiǎng qù kànwàng nǎinai.', translation: '주말에 나는 할머니를 뵈러 가고 싶다.' },
  361: { sentence: '我是去年开始学习汉语的。', pinyin: 'Wǒ shì qùnián kāishǐ xuéxí Hànyǔ de.', translation: '나는 작년부터 중국어를 배우기 시작했다.' },
  364: { sentence: '我们先吃饭，然后去看电影。', pinyin: 'Wǒmen xiān chīfàn, ránhòu qù kàn diànyǐng.', translation: '우리 먼저 밥 먹고, 그 다음에 영화 보러 가자.' },
  366: { sentence: '公园里有很多人在散步。', pinyin: 'Gōngyuán lǐ yǒu hěn duō rén zài sànbù.', translation: '공원에 많은 사람이 산책하고 있다.' },
  371: { sentence: '今天是几月几日？', pinyin: 'Jīntiān shì jǐ yuè jǐ rì?', translation: '오늘은 몇 월 며칠이야?' },
  373: { sentence: '如果明天不下雨，我们就去爬山。', pinyin: 'Rúguǒ míngtiān bú xià yǔ, wǒmen jiù qù páshān.', translation: '만약 내일 비가 안 오면, 우리는 등산 갈 것이다.' },
  374: { sentence: '外面下雨了，记得带伞。', pinyin: 'Wàimiàn xià yǔ le, jìde dài sǎn.', translation: '밖에 비가 오니, 우산 챙기는 거 잊지 마.' },
  375: { sentence: '我每天喝三杯水。', pinyin: 'Wǒ měitiān hē sān bēi shuǐ.', translation: '나는 매일 물 세 잔을 마신다.' },
  376: { sentence: '书放在桌子上。', pinyin: 'Shū fàng zài zhuōzi shàng.', translation: '책은 책상 위에 놓여 있다.' },
  377: { sentence: '我每天九点上班。', pinyin: 'Wǒ měitiān jiǔ diǎn shàngbān.', translation: '나는 매일 9시에 출근한다.' },
  379: { sentence: '我喜欢上网看新闻。', pinyin: 'Wǒ xǐhuan shàngwǎng kàn xīnwén.', translation: '나는 인터넷으로 뉴스 보는 걸 좋아한다.' },
  381: { sentence: '今天来的人比昨天少。', pinyin: 'Jīntiān lái de rén bǐ zuótiān shǎo.', translation: '오늘 온 사람이 어제보다 적다.' },
  382: { sentence: '这本书是谁的？', pinyin: 'Zhè běn shū shì shéi de?', translation: '이 책은 누구 거야?' },
  383: { sentence: '他生病了，今天没来上课。', pinyin: 'Tā shēngbìng le, jīntiān méi lái shàngkè.', translation: '그는 병이 나서, 오늘 수업에 안 왔다.' },
  386: { sentence: '请把电视的声音关小一点儿。', pinyin: 'Qǐng bǎ diànshì de shēngyīn guān xiǎo yìdiǎnr.', translation: '텔레비전 소리를 좀 줄여 주세요.' },
  387: { sentence: '你想吃什么？', pinyin: 'Nǐ xiǎng chī shénme?', translation: '너 뭐 먹고 싶어?' },
  389: { sentence: '这个班一共有十个学生。', pinyin: 'Zhège bān yígòng yǒu shí gè xuéshēng.', translation: '이 반은 모두 10명의 학생이 있다.' },
  391: { sentence: '他是我最好的朋友。', pinyin: 'Tā shì wǒ zuì hǎo de péngyou.', translation: '그는 내 가장 친한 친구이다.' },
  392: { sentence: '你什么时候有空？', pinyin: 'Nǐ shénme shíhou yǒu kòng?', translation: '너 언제 시간 있어?' },
  395: { sentence: '我今天有很多事情要做。', pinyin: 'Wǒ jīntiān yǒu hěn duō shìqing yào zuò.', translation: '나는 오늘 할 일이 많다.' },
  398: { sentence: '我的手机没电了。', pinyin: 'Wǒ de shǒujī méi diàn le.', translation: '내 휴대폰이 배터리가 다 됐다.' },
  400: { sentence: '我喜欢在睡觉前看一会儿书。', pinyin: 'Wǒ xǐhuan zài shuìjiào qián kàn yíhuìr shū.', translation: '나는 자기 전에 잠깐 책 읽는 걸 좋아한다.' },
  401: { sentence: '我买了一双新鞋。', pinyin: 'Wǒ mǎile yì shuāng xīn xié.', translation: '나는 새 신발 한 켤레를 샀다.' },
  402: { sentence: '我每天早晚都刷牙。', pinyin: 'Wǒ měitiān zǎowǎn dōu shuāyá.', translation: '나는 매일 아침저녁으로 이를 닦는다.' },
  407: { sentence: '他的汉语水平提高得很快。', pinyin: 'Tā de Hànyǔ shuǐpíng tígāo de hěn kuài.', translation: '그의 중국어 실력은 매우 빠르게 향상됐다.' },
  409: { sentence: '上课的时候不要说话。', pinyin: 'Shàngkè de shíhou búyào shuōhuà.', translation: '수업 시간에는 말하지 마라.' },
  410: { sentence: '这位叔叔是我爸爸的同事。', pinyin: 'Zhè wèi shūshu shì wǒ bàba de tóngshì.', translation: '이 아저씨는 우리 아빠의 동료이다.' },
  411: { sentence: '我最喜欢的科目是数学。', pinyin: 'Wǒ zuì xǐhuan de kēmù shì shùxué.', translation: '내가 가장 좋아하는 과목은 수학이다.' },
  412: { sentence: '一年有四个季节。', pinyin: 'Yì nián yǒu sì gè jìjié.', translation: '일 년에는 네 계절이 있다.' },
  413: { sentence: '出租车司机很热情地帮我搬行李。', pinyin: 'Chūzūchē sījī hěn rèqíng de bāng wǒ bān xíngli.', translation: '택시 기사가 친절하게 내 짐 옮기는 걸 도와줬다.' },
  415: { sentence: '我女儿今年五岁了。', pinyin: 'Wǒ nǚ’ér jīnnián wǔ suì le.', translation: '내 딸은 올해 다섯 살이 됐다.' },
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
