// scripts/add-examples.mjs
// examples.json에 예문 배치를 머지 (이미 있는 id는 건드리지 않음).
// 실행: node scripts/add-examples.mjs
import { readFileSync, writeFileSync } from 'fs';

const EXAMPLES_PATH = 'lib/words/examples.json';
const VOCAB_PATH = 'lib/words/hsk_vocab.json';

// ─── 이번 배치 (HSK 4급 9차, id 순) ───
const BATCH = {
  757: { sentence: '这场比赛吸引了很多观众。', pinyin: 'Zhè chǎng bǐsài xīyǐnle hěn duō guānzhòng.', translation: '이 경기는 많은 관중을 끌어모았다.' },
  759: { sentence: '我估计他今天不会来了。', pinyin: 'Wǒ gūjì tā jīntiān bú huì lái le.', translation: '내 생각엔 그가 오늘 안 올 것 같다.' },
  760: { sentence: '这家店的服务让顾客很满意。', pinyin: 'Zhè jiā diàn de fúwù ràng gùkè hěn mǎnyì.', translation: '이 가게의 서비스는 고객을 만족시킨다.' },
  762: { sentence: '学习的过程虽然辛苦，但很有意思。', pinyin: 'Xuéxí de guòchéng suīrán xīnkǔ, dàn hěn yǒu yìsi.', translation: '공부하는 과정은 비록 힘들지만, 매우 재미있다.' },
  763: { sentence: '请问您是什么国籍？', pinyin: 'Qǐngwèn nín shì shénme guójí?', translation: '실례지만 국적이 어디신가요?' },
  764: { sentence: '这是一场重要的国际会议。', pinyin: 'Zhè shì yì chǎng zhòngyào de guójì huìyì.', translation: '이것은 중요한 국제 회의이다.' },
  765: { sentence: '我喜欢喝新鲜的橙子果汁。', pinyin: 'Wǒ xǐhuan hē xīnxiān de chéngzi guǒzhī.', translation: '나는 신선한 오렌지 주스를 좋아한다.' },
  768: { sentence: '海洋里有各种各样的动物。', pinyin: 'Hǎiyáng lǐ yǒu gèzhǒng-gèyàng de dòngwù.', translation: '바다에는 다양한 동물이 있다.' },
  769: { sentence: '天气太热，我出了很多汗。', pinyin: 'Tiānqì tài rè, wǒ chūle hěn duō hàn.', translation: '날씨가 너무 더워서, 나는 땀을 많이 흘렸다.' },
  770: { sentence: '我的航班因为天气延误了。', pinyin: 'Wǒ de hángbān yīnwèi tiānqì yánwù le.', translation: '내 항공편은 날씨 때문에 지연되었다.' },
  772: { sentence: '多运动对身体有很多好处。', pinyin: 'Duō yùndòng duì shēntǐ yǒu hěn duō hǎochu.', translation: '운동을 많이 하면 몸에 좋은 점이 많다.' },
  773: { sentence: '请告诉我你的电话号码。', pinyin: 'Qǐng gàosu wǒ nǐ de diànhuà hàomǎ.', translation: '당신의 전화번호를 알려 주세요.' },
  774: { sentence: '天阴了，好像要下雨。', pinyin: 'Tiān yīn le, hǎoxiàng yào xià yǔ.', translation: '하늘이 흐려져서, 비가 올 것 같다.' },
  775: { sentence: '这个产品质量合格。', pinyin: 'Zhège chǎnpǐn zhìliàng hégé.', translation: '이 제품은 품질이 규격에 맞는다(합격이다).' },
  776: { sentence: '这双鞋的大小很合适。', pinyin: 'Zhè shuāng xié de dàxiǎo hěn héshì.', translation: '이 신발의 크기는 딱 알맞다.' },
  777: { sentence: '这个盒子里装满了巧克力。', pinyin: 'Zhège hézi lǐ zhuāngmǎnle qiǎokèlì.', translation: '이 상자 안에는 초콜릿이 가득 차 있다.' },
  779: { sentence: '我很后悔没有努力学习。', pinyin: 'Wǒ hěn hòuhuǐ méiyǒu nǔlì xuéxí.', translation: '나는 열심히 공부하지 않은 것을 매우 후회한다.' },
  780: { sentence: '我怀疑他没有说实话。', pinyin: 'Wǒ huáiyí tā méiyǒu shuō shíhuà.', translation: '나는 그가 사실대로 말하지 않았다고 의심한다.' },
  781: { sentence: '看到这张照片，我回忆起了很多往事。', pinyin: 'Kàndào zhè zhāng zhàopiàn, wǒ huíyì qǐle hěn duō wǎngshì.', translation: '이 사진을 보니, 많은 옛일이 떠올랐다.' },
  782: { sentence: '现在我们的生活离不开互联网。', pinyin: 'Xiànzài wǒmen de shēnghuó lí bù kāi hùliánwǎng.', translation: '지금 우리 생활은 인터넷 없이는 안 된다.' },
  783: { sentence: '厨房里的火还没关。', pinyin: 'Chúfáng lǐ de huǒ hái méi guān.', translation: '부엌의 불을 아직 안 껐다.' },
  784: { sentence: '他获得了这次比赛的冠军。', pinyin: 'Tā huòdéle zhè cì bǐsài de guànjūn.', translation: '그는 이번 시합에서 우승을 했다.' },
  786: { sentence: '这个孩子很活泼，喜欢交朋友。', pinyin: 'Zhège háizi hěn huópo, xǐhuan jiāo péngyou.', translation: '이 아이는 활발해서, 친구 사귀는 걸 좋아한다.' },
  788: { sentence: '同学之间应该互相帮助。', pinyin: 'Tóngxué zhījiān yīnggāi hùxiāng bāngzhù.', translation: '학우들끼리는 서로 도와야 한다.' },
  793: { sentence: '我们买了一些新家具。', pinyin: 'Wǒmen mǎile yìxiē xīn jiājù.', translation: '우리는 새 가구를 좀 샀다.' },
  795: { sentence: '为了减肥，她每天都去跑步。', pinyin: 'Wèile jiǎnféi, tā měitiān dōu qù pǎobù.', translation: '살을 빼기 위해, 그녀는 매일 달리기를 한다.' },
  796: { sentence: '这家商店降低了商品的价格。', pinyin: 'Zhè jiā shāngdiàn jiàngdīle shāngpǐn de jiàgé.', translation: '이 가게는 상품 가격을 낮췄다.' },
  797: { sentence: '他这个月拿到了一笔奖金。', pinyin: 'Tā zhège yuè ná dàole yì bǐ jiǎngjīn.', translation: '그는 이번 달에 보너스를 받았다.' },
  799: { sentence: '飞机马上就要降落了。', pinyin: 'Fēijī mǎshàng jiùyào jiàngluò le.', translation: '비행기가 곧 착륙한다.' },
  802: { sentence: '请在明天之前交作业。', pinyin: 'Qǐng zài míngtiān zhīqián jiāo zuòyè.', translation: '내일까지 숙제를 제출해 주세요.' },
  804: { sentence: '我们应该多和同学交流。', pinyin: 'Wǒmen yīnggāi duō hé tóngxué jiāoliú.', translation: '우리는 학우들과 많이 소통해야 한다.' },
  805: { sentence: '他们搬到了城市的郊区。', pinyin: 'Tāmen bāndàole chéngshì de jiāoqū.', translation: '그들은 도시 교외로 이사했다.' },
  806: { sentence: '这位教授的课很受欢迎。', pinyin: 'Zhè wèi jiàoshòu de kè hěn shòu huānyíng.', translation: '이 교수의 수업은 매우 인기가 많다.' },
  807: { sentence: '这个城市的交通很方便。', pinyin: 'Zhège chéngshì de jiāotōng hěn fāngbiàn.', translation: '이 도시의 교통은 매우 편리하다.' },
  808: { sentence: '父母很重视孩子的教育。', pinyin: 'Fùmǔ hěn zhòngshì háizi de jiàoyù.', translation: '부모는 아이의 교육을 매우 중시한다.' },
  810: { sentence: '前面有一个加油站。', pinyin: 'Qiánmiàn yǒu yí gè jiāyóuzhàn.', translation: '앞에 주유소가 하나 있다.' },
  813: { sentence: '今天下午有两节英语课。', pinyin: 'Jīntiān xiàwǔ yǒu liǎng jié Yīngyǔ kè.', translation: '오늘 오후에 영어 수업이 두 교시 있다.' },
  816: { sentence: '他接受了我们的建议。', pinyin: 'Tā jiēshòule wǒmen de jiànyì.', translation: '그는 우리의 제안을 받아들였다.' },
  818: { sentence: '他先看了新闻，接着开始工作。', pinyin: 'Tā xiān kànle xīnwén, jiēzhe kāishǐ gōngzuò.', translation: '그는 먼저 뉴스를 보고, 이어서 일을 시작했다.' },
  821: { sentence: '学外语需要慢慢积累词汇。', pinyin: 'Xué wàiyǔ xūyào mànmàn jīlěi cíhuì.', translation: '외국어를 배우려면 천천히 어휘를 쌓아야 한다.' },
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
