// scripts/add-examples.mjs
// examples.json에 예문 배치를 머지 (이미 있는 id는 건드리지 않음).
// 실행: node scripts/add-examples.mjs
import { readFileSync, writeFileSync } from 'fs';

const EXAMPLES_PATH = 'lib/words/examples.json';
const VOCAB_PATH = 'lib/words/hsk_vocab.json';

// ─── 이번 배치 (HSK 4급 10차, id 순) ───
const BATCH = {
  823: { sentence: '遇到危险时可以打电话找警察。', pinyin: 'Yùdào wēixiǎn shí kěyǐ dǎ diànhuà zhǎo jǐngchá.', translation: '위험할 때는 전화해서 경찰을 찾으면 된다.' },
  825: { sentence: '京剧是中国的传统艺术。', pinyin: 'Jīngjù shì Zhōngguó de chuántǒng yìshù.', translation: '경극은 중국의 전통 예술이다.' },
  826: { sentence: '他经历了很多困难。', pinyin: 'Tā jīnglìle hěn duō kùnnan.', translation: '그는 많은 어려움을 겪었다.' },
  828: { sentence: '这里的景色非常美。', pinyin: 'Zhèlǐ de jǐngsè fēicháng měi.', translation: '이곳의 경치는 매우 아름답다.' },
  831: { sentence: '现在社会竞争很激烈。', pinyin: 'Xiànzài shèhuì jìngzhēng hěn jīliè.', translation: '요즘 사회는 경쟁이 매우 치열하다.' },
  832: { sentence: '她每天照镜子打扮。', pinyin: 'Tā měitiān zhào jìngzi dǎban.', translation: '그녀는 매일 거울을 보며 단장한다.' },
  835: { sentence: '这里禁止停车。', pinyin: 'Zhèlǐ jìnzhǐ tíngchē.', translation: '이곳은 주차 금지이다.' },
  837: { sentence: '谢谢你及时提醒我。', pinyin: 'Xièxie nǐ jíshí tíxǐng wǒ.', translation: '제때에 알려 줘서 고마워.' },
  840: { sentence: '你究竟想说什么？', pinyin: 'Nǐ jiūjìng xiǎng shuō shénme?', translation: '너 도대체 무슨 말을 하고 싶은 거야?' },
  842: { sentence: '那位记者正在采访明星。', pinyin: 'Nà wèi jìzhě zhèngzài cǎifǎng míngxīng.', translation: '저 기자는 스타를 인터뷰하고 있다.' },
  843: { sentence: '有问题的同学请举手。', pinyin: 'Yǒu wèntí de tóngxué qǐng jǔ shǒu.', translation: '질문 있는 학우는 손을 들어 주세요.' },
  844: { sentence: '学校下周要举办运动会。', pinyin: 'Xuéxiào xià zhōu yào jǔbàn yùndònghuì.', translation: '학교는 다음 주에 운동회를 개최한다.' },
  845: { sentence: '周末我们有一个朋友聚会。', pinyin: 'Zhōumò wǒmen yǒu yí gè péngyou jùhuì.', translation: '주말에 우리는 친구 모임이 있다.' },
  849: { sentence: '别生气，我只是跟你开玩笑。', pinyin: 'Bié shēngqì, wǒ zhǐshì gēn nǐ kāiwánxiào.', translation: '화내지 마, 난 그냥 너랑 농담한 거야.' },
  851: { sentence: '大家对这件事有不同的看法。', pinyin: 'Dàjiā duì zhè jiàn shì yǒu bùtóng de kànfǎ.', translation: '모두가 이 일에 대해 다른 견해를 가지고 있다.' },
  852: { sentence: '这个问题我需要再考虑考虑。', pinyin: 'Zhège wèntí wǒ xūyào zài kǎolǜ kǎolǜ.', translation: '이 문제는 다시 좀 고려해 봐야겠다.' },
  853: { sentence: '北京烤鸭非常有名。', pinyin: 'Běijīng kǎoyā fēicháng yǒumíng.', translation: '베이징 오리구이는 매우 유명하다.' },
  854: { sentence: '院子里有一棵大树。', pinyin: 'Yuànzi lǐ yǒu yì kē dà shù.', translation: '마당에 큰 나무 한 그루가 있다.' },
  855: { sentence: '那只小狗看起来很可怜。', pinyin: 'Nà zhī xiǎo gǒu kàn qǐlái hěn kělián.', translation: '저 강아지는 매우 불쌍해 보인다.' },
  856: { sentence: '他肯定会准时来的。', pinyin: 'Tā kěndìng huì zhǔnshí lái de.', translation: '그는 틀림없이 제시간에 올 것이다.' },
  857: { sentence: '我想去旅行，可是没有时间。', pinyin: 'Wǒ xiǎng qù lǚxíng, kěshì méiyǒu shíjiān.', translation: '나는 여행을 가고 싶지만, 시간이 없다.' },
  858: { sentence: '我感冒了，一直咳嗽。', pinyin: 'Wǒ gǎnmào le, yìzhí késou.', translation: '나는 감기에 걸려서, 계속 기침을 한다.' },
  859: { sentence: '客人都坐在客厅里聊天。', pinyin: 'Kèrén dōu zuò zài kètīng lǐ liáotiān.', translation: '손님들은 모두 거실에 앉아 이야기를 나눈다.' },
  860: { sentence: '真可惜，你错过了这么好的机会。', pinyin: 'Zhēn kěxī, nǐ cuòguòle zhème hǎo de jīhuì.', translation: '정말 아쉽다, 너 이렇게 좋은 기회를 놓쳤구나.' },
  866: { sentence: '我买了一瓶矿泉水。', pinyin: 'Wǒ mǎile yì píng kuàngquánshuǐ.', translation: '나는 생수 한 병을 샀다.' },
  870: { sentence: '他用力拉开了门。', pinyin: 'Tā yònglì lā kāile mén.', translation: '그는 힘껏 문을 당겨 열었다.' },
  871: { sentence: '现在出发已经来不及了。', pinyin: 'Xiànzài chūfā yǐjīng láibují le.', translation: '지금 출발하면 이미 늦었다.' },
  872: { sentence: '别着急，现在去还来得及。', pinyin: 'Bié zháojí, xiànzài qù hái láidejí.', translation: '서두르지 마, 지금 가면 아직 늦지 않아.' },
  873: { sentence: '我们班的同学来自不同的国家。', pinyin: 'Wǒmen bān de tóngxué láizì bùtóng de guójiā.', translation: '우리 반 학우들은 서로 다른 나라에서 왔다.' },
  874: { sentence: '请把垃圾扔进垃圾桶。', pinyin: 'Qǐng bǎ lājī rēng jìn lājītǒng.', translation: '쓰레기를 쓰레기통에 버려 주세요.' },
  877: { sentence: '他为女朋友准备了一个浪漫的晚餐。', pinyin: 'Tā wèi nǚpéngyou zhǔnbèile yí gè làngmàn de wǎncān.', translation: '그는 여자친구를 위해 낭만적인 저녁 식사를 준비했다.' },
  878: { sentence: '动物园里的老虎很大。', pinyin: 'Dòngwùyuán lǐ de lǎohǔ hěn dà.', translation: '동물원의 호랑이는 매우 크다.' },
  879: { sentence: '遇到问题要冷静地思考。', pinyin: 'Yùdào wèntí yào lěngjìng de sīkǎo.', translation: '문제에 부딪히면 침착하게 생각해야 한다.' },
  880: { sentence: '我们俩是好朋友。', pinyin: 'Wǒmen liǎ shì hǎo péngyou.', translation: '우리 둘은 친한 친구다.' },
  881: { sentence: '他连一句中文都不会说。', pinyin: 'Tā lián yí jù Zhōngwén dōu bú huì shuō.', translation: '그는 중국어를 한 마디조차 할 줄 모른다.' },
  882: { sentence: '秋天的天气很凉快。', pinyin: 'Qiūtiān de tiānqì hěn liángkuai.', translation: '가을 날씨는 매우 시원하다.' },
  883: { sentence: '有问题的话，请随时跟我联系。', pinyin: 'Yǒu wèntí dehuà, qǐng suíshí gēn wǒ liánxì.', translation: '문제가 있으면, 언제든지 저에게 연락 주세요.' },
  884: { sentence: '这个礼拜天我们去爬山吧。', pinyin: 'Zhège lǐbàitiān wǒmen qù páshān ba.', translation: '이번 일요일에 우리 등산 가자.' },
  885: { sentence: '我下午要去理发。', pinyin: 'Wǒ xiàwǔ yào qù lǐfà.', translation: '나는 오후에 이발하러 갈 것이다.' },
  887: { sentence: '我完全理解你的想法。', pinyin: 'Wǒ wánquán lǐjiě nǐ de xiǎngfǎ.', translation: '나는 네 생각을 완전히 이해한다.' },
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
