// scripts/add-examples.mjs
// examples.json에 예문 배치를 머지 (이미 있는 id는 건드리지 않음).
// 실행: node scripts/add-examples.mjs
import { readFileSync, writeFileSync } from 'fs';

const EXAMPLES_PATH = 'lib/words/examples.json';
const VOCAB_PATH = 'lib/words/hsk_vocab.json';

// ─── 이번 배치 (HSK 3급 4차, id 순) ───
const BATCH = {
  198: { sentence: '我昨天买了一件红色的毛衣。', pinyin: 'Wǒ zuótiān mǎile yí jiàn hóngsè de máoyī.', translation: '나는 어제 빨간색 스웨터 한 벌을 샀다.' },
  201: { sentence: '老师正在给我们讲新课。', pinyin: 'Lǎoshī zhèngzài gěi wǒmen jiǎng xīn kè.', translation: '선생님이 우리에게 새 수업을 설명하고 있다.' },
  203: { sentence: '我们好久没见面了。', pinyin: 'Wǒmen hǎojiǔ méi jiànmiàn le.', translation: '우리는 오랫동안 만나지 못했다.' },
  204: { sentence: '妈妈叫我去买东西。', pinyin: 'Māma jiào wǒ qù mǎi dōngxi.', translation: '엄마가 나에게 물건을 사오라고 하셨다.' },
  205: { sentence: '牛的头上有两只角。', pinyin: 'Niú de tóu shàng yǒu liǎng zhī jiǎo.', translation: '소 머리에는 뿔이 두 개 있다.' },
  206: { sentence: '我走了一天路，脚很疼。', pinyin: 'Wǒ zǒule yì tiān lù, jiǎo hěn téng.', translation: '나는 하루 종일 걸어서, 발이 매우 아프다.' },
  211: { sentence: '你还记得我们第一次见面的地方吗？', pinyin: 'Nǐ hái jìde wǒmen dì-yī cì jiànmiàn de dìfang ma?', translation: '너 우리가 처음 만난 곳 아직 기억해?' },
  213: { sentence: '我去机场接一个朋友。', pinyin: 'Wǒ qù jīchǎng jiē yí gè péngyou.', translation: '나는 공항에 친구를 마중하러 간다.' },
  214: { sentence: '这条街道两边都是商店。', pinyin: 'Zhè tiáo jiēdào liǎngbiān dōu shì shāngdiàn.', translation: '이 거리 양쪽은 모두 상점이다.' },
  215: { sentence: '他们打算明年春天结婚。', pinyin: 'Tāmen dǎsuàn míngnián chūntiān jiéhūn.', translation: '그들은 내년 봄에 결혼할 계획이다.' },
  222: { sentence: '这件事我几乎忘了。', pinyin: 'Zhè jiàn shì wǒ jīhū wàng le.', translation: '이 일을 나는 거의 잊었다.' },
  225: { sentence: '请进，外面冷。', pinyin: 'Qǐng jìn, wàimiàn lěng.', translation: '들어오세요, 밖이 추워요.' },
  228: { sentence: '我每天上班都经过这个公园。', pinyin: 'Wǒ měitiān shàngbān dōu jīngguò zhège gōngyuán.', translation: '나는 매일 출근할 때 이 공원을 지나간다.' },
  229: { sentence: '我们公司的经理对人很友好。', pinyin: 'Wǒmen gōngsī de jīnglǐ duì rén hěn yǒuhǎo.', translation: '우리 회사 사장은 사람들에게 매우 친절하다.' },
  231: { sentence: '这件旧衣服我穿了很多年了。', pinyin: 'Zhè jiàn jiù yīfu wǒ chuānle hěn duō nián le.', translation: '이 낡은 옷을 나는 여러 해 입었다.' },
  232: { sentence: '你等一下，我马上就来。', pinyin: 'Nǐ děng yíxià, wǒ mǎshàng jiù lái.', translation: '잠깐만 기다려, 나 금방 갈게.' },
  233: { sentence: '你来中国多久了？', pinyin: 'Nǐ lái Zhōngguó duōjiǔ le?', translation: '너 중국에 온 지 얼마나 됐어?' },
  234: { sentence: '我们学校有九个年级。', pinyin: 'Wǒmen xuéxiào yǒu jiǔ gè niánjí.', translation: '우리 학교는 9개 학년이 있다.' },
  242: { sentence: '我在街上看见了一位老朋友。', pinyin: 'Wǒ zài jiē shàng kànjiànle yí wèi lǎo péngyou.', translation: '나는 길에서 오랜 친구를 봤다.' },
  244: { sentence: '他在石头上刻了几个字。', pinyin: 'Tā zài shítou shàng kèle jǐ gè zì.', translation: '그는 돌에 글자를 몇 개 새겼다.' },
  245: { sentence: '今天上午我们有三节课。', pinyin: 'Jīntiān shàngwǔ wǒmen yǒu sān jié kè.', translation: '오늘 오전에 우리는 세 교시 수업이 있다.' },
  249: { sentence: '家里来了几位客人。', pinyin: 'Jiā lǐ láile jǐ wèi kèrén.', translation: '집에 손님 몇 분이 오셨다.' },
  250: { sentence: '这里可以拍照吗？', pinyin: 'Zhèlǐ kěyǐ pāizhào ma?', translation: '여기서 사진 찍어도 되나요?' },
  251: { sentence: '天太热了，把空调打开吧。', pinyin: 'Tiān tài rè le, bǎ kōngtiáo dǎkāi ba.', translation: '날이 너무 더우니, 에어컨을 켜자.' },
  252: { sentence: '请张开口，我看看你的牙。', pinyin: 'Qǐng zhāngkāi kǒu, wǒ kànkan nǐ de yá.', translation: '입을 벌려 주세요, 이를 좀 볼게요.' },
  253: { sentence: '那个小孩哭得很伤心。', pinyin: 'Nàge xiǎohái kū de hěn shāngxīn.', translation: '저 아이는 매우 슬프게 운다.' },
  254: { sentence: '这本书才十块钱，很便宜。', pinyin: 'Zhè běn shū cái shí kuài qián, hěn piányi.', translation: '이 책은 겨우 10위안이라, 매우 싸다.' },
  257: { sentence: '我还不太会用筷子吃饭。', pinyin: 'Wǒ hái bú tài huì yòng kuàizi chīfàn.', translation: '나는 아직 젓가락으로 밥 먹는 게 서툴다.' },
  260: { sentence: '今天的天空很蓝。', pinyin: 'Jīntiān de tiānkōng hěn lán.', translation: '오늘 하늘이 매우 파랗다.' },
  261: { sentence: '公交车上要给老人让座。', pinyin: 'Gōngjiāochē shàng yào gěi lǎorén ràngzuò.', translation: '버스에서는 노인에게 자리를 양보해야 한다.' },
  263: { sentence: '我已经吃完饭了。', pinyin: 'Wǒ yǐjīng chīwán fàn le.', translation: '나는 이미 밥을 다 먹었다.' },
  266: { sentence: '我家离公司不远。', pinyin: 'Wǒ jiā lí gōngsī bù yuǎn.', translation: '우리 집은 회사에서 멀지 않다.' },
  267: { sentence: '包里有钱包、手机和钥匙。', pinyin: 'Bāo lǐ yǒu qiánbāo, shǒujī hé yàoshi.', translation: '가방 안에는 지갑, 휴대폰, 열쇠가 있다.' },
  268: { sentence: '她的脸红了。', pinyin: 'Tā de liǎn hóng le.', translation: '그녀의 얼굴이 빨개졌다.' },
  269: { sentence: '门口停着一辆红色的汽车。', pinyin: 'Ménkǒu tíngzhe yí liàng hóngsè de qìchē.', translation: '입구에 빨간색 자동차 한 대가 서 있다.' },
  270: { sentence: '我有两个妹妹。', pinyin: 'Wǒ yǒu liǎng gè mèimei.', translation: '나는 여동생이 둘 있다.' },
  271: { sentence: '学好汉语需要多练习。', pinyin: 'Xuéhǎo Hànyǔ xūyào duō liànxí.', translation: '중국어를 잘하려면 많이 연습해야 한다.' },
  272: { sentence: '我对这个城市还不太了解。', pinyin: 'Wǒ duì zhège chéngshì hái bú tài liǎojiě.', translation: '나는 이 도시를 아직 잘 모른다.' },
  274: { sentence: '他大学毕业后就离开了家乡。', pinyin: 'Tā dàxué bìyè hòu jiù líkāile jiāxiāng.', translation: '그는 대학 졸업 후 고향을 떠났다.' },
  275: { sentence: '现在的气温是零下五度。', pinyin: 'Xiànzài de qìwēn shì líng xià wǔ dù.', translation: '지금 기온은 영하 5도이다.' },
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
