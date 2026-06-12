// scripts/add-examples.mjs
// examples.json에 예문 배치를 머지 (이미 있는 id는 건드리지 않음).
// 실행: node scripts/add-examples.mjs
import { readFileSync, writeFileSync } from 'fs';

const EXAMPLES_PATH = 'lib/words/examples.json';
const VOCAB_PATH = 'lib/words/hsk_vocab.json';

// ─── 이번 배치 (HSK 3급 2차, id 순) ───
const BATCH = {
  62: { sentence: '春天的天气很暖和。', pinyin: 'Chūntiān de tiānqì hěn nuǎnhuo.', translation: '봄 날씨는 따뜻하다.' },
  63: { sentence: '我们打一辆出租车去机场吧。', pinyin: 'Wǒmen dǎ yí liàng chūzūchē qù jīchǎng ba.', translation: '우리 택시 한 대 잡아서 공항에 가자.' },
  64: { sentence: '这是我第一次来中国。', pinyin: 'Zhè shì wǒ dì-yī cì lái Zhōngguó.', translation: '이번이 내가 처음 중국에 온 것이다.' },
  66: { sentence: '他从北京坐火车来上海。', pinyin: 'Tā cóng Běijīng zuò huǒchē lái Shànghǎi.', translation: '그는 베이징에서 기차를 타고 상하이로 온다.' },
  68: { sentence: '这道题我做错了。', pinyin: 'Zhè dào tí wǒ zuò cuò le.', translation: '이 문제를 나는 틀리게 풀었다.' },
  70: { sentence: '我每天都给妈妈打电话。', pinyin: 'Wǒ měitiān dōu gěi māma dǎ diànhuà.', translation: '나는 매일 엄마에게 전화한다.' },
  72: { sentence: '大家好，很高兴认识你们。', pinyin: 'Dàjiā hǎo, hěn gāoxìng rènshi nǐmen.', translation: '여러분 안녕하세요, 만나서 반갑습니다.' },
  73: { sentence: '他喜欢和朋友一起打篮球。', pinyin: 'Tā xǐhuan hé péngyou yìqǐ dǎ lánqiú.', translation: '그는 친구와 함께 농구하는 걸 좋아한다.' },
  76: { sentence: '这件衣服很漂亮，但是太贵了。', pinyin: 'Zhè jiàn yīfu hěn piàoliang, dànshì tài guì le.', translation: '이 옷은 예쁘지만, 너무 비싸다.' },
  81: { sentence: '他高兴地笑了。', pinyin: 'Tā gāoxìng de xiào le.', translation: '그는 기뻐서 웃었다.' },
  82: { sentence: '这是我买的书。', pinyin: 'Zhè shì wǒ mǎi de shū.', translation: '이것은 내가 산 책이다.' },
  83: { sentence: '他跑得很快。', pinyin: 'Tā pǎo de hěn kuài.', translation: '그는 매우 빨리 달린다.' },
  84: { sentence: '请在这儿等我一下。', pinyin: 'Qǐng zài zhèr děng wǒ yíxià.', translation: '여기서 저를 잠깐 기다려 주세요.' },
  85: { sentence: '天黑了，请把灯打开。', pinyin: 'Tiān hēi le, qǐng bǎ dēng dǎkāi.', translation: '날이 어두워졌으니, 불을 켜 주세요.' },
  86: { sentence: '我们点了三个菜和两碗米饭。', pinyin: 'Wǒmen diǎnle sān gè cài hé liǎng wǎn mǐfàn.', translation: '우리는 요리 세 개와 밥 두 공기를 주문했다.' },
  87: { sentence: '我用电脑写作业。', pinyin: 'Wǒ yòng diànnǎo xiě zuòyè.', translation: '나는 컴퓨터로 숙제를 한다.' },
  88: { sentence: '晚上我喜欢看电视。', pinyin: 'Wǎnshang wǒ xǐhuan kàn diànshì.', translation: '저녁에 나는 텔레비전 보는 걸 좋아한다.' },
  89: { sentence: '我们坐电梯上五楼。', pinyin: 'Wǒmen zuò diàntī shàng wǔ lóu.', translation: '우리는 엘리베이터를 타고 5층으로 올라간다.' },
  90: { sentence: '周末我想去看一场电影。', pinyin: 'Zhōumò wǒ xiǎng qù kàn yì chǎng diànyǐng.', translation: '주말에 나는 영화를 한 편 보고 싶다.' },
  91: { sentence: '请把文件用电子邮件发给我。', pinyin: 'Qǐng bǎ wénjiàn yòng diànzǐyóujiàn fā gěi wǒ.', translation: '서류를 이메일로 보내 주세요.' },
  95: { sentence: '我看着地图找到了那家商店。', pinyin: 'Wǒ kànzhe dìtú zhǎodàole nà jiā shāngdiàn.', translation: '나는 지도를 보고 그 가게를 찾았다.' },
  96: { sentence: '他在这次比赛中得了第一名。', pinyin: 'Tā zài zhè cì bǐsài zhōng déle dì-yī míng.', translation: '그는 이번 시합에서 1등을 했다.' },
  97: { sentence: '老师说的话我都听懂了。', pinyin: 'Lǎoshī shuō de huà wǒ dōu tīngdǒng le.', translation: '선생님이 한 말을 나는 다 알아들었다.' },
  99: { sentence: '北方的冬天经常下雪。', pinyin: 'Běifāng de dōngtiān jīngcháng xià xuě.', translation: '북방의 겨울은 자주 눈이 내린다.' },
  100: { sentence: '孩子们最喜欢去动物园看动物。', pinyin: 'Háizimen zuì xǐhuan qù dòngwùyuán kàn dòngwù.', translation: '아이들은 동물원에 가서 동물을 보는 걸 가장 좋아한다.' },
  101: { sentence: '我要去超市买一些东西。', pinyin: 'Wǒ yào qù chāoshì mǎi yìxiē dōngxi.', translation: '나는 슈퍼마켓에 가서 물건을 좀 사려고 한다.' },
  102: { sentence: '我们都是中国人。', pinyin: 'Wǒmen dōu shì Zhōngguórén.', translation: '우리는 모두 중국인이다.' },
  103: { sentence: '请大声读这篇课文。', pinyin: 'Qǐng dàshēng dú zhè piān kèwén.', translation: '이 본문을 큰 소리로 읽으세요.' },
  104: { sentence: '请把这段话翻译成中文。', pinyin: 'Qǐng bǎ zhè duàn huà fānyì chéng Zhōngwén.', translation: '이 단락을 중국어로 번역해 주세요.' },
  107: { sentence: '你说得对，我同意。', pinyin: 'Nǐ shuō de duì, wǒ tóngyì.', translation: '네 말이 맞아, 나도 동의해.' },
  108: { sentence: '他对中国文化很感兴趣。', pinyin: 'Tā duì Zhōngguó wénhuà hěn gǎn xìngqù.', translation: '그는 중국 문화에 매우 관심이 있다.' },
  109: { sentence: '对不起，我来晚了。', pinyin: 'Duìbuqǐ, wǒ lái wǎn le.', translation: '죄송합니다, 제가 늦게 왔어요.' },
  110: { sentence: '今天来的人很多。', pinyin: 'Jīntiān lái de rén hěn duō.', translation: '오늘 온 사람이 매우 많다.' },
  111: { sentence: '你看，这里的风景多么美丽！', pinyin: 'Nǐ kàn, zhèlǐ de fēngjǐng duōme měilì!', translation: '봐, 이곳의 풍경이 얼마나 아름다운지!' },
  112: { sentence: '请问这件衣服多少钱？', pinyin: 'Qǐngwèn zhè jiàn yīfu duōshǎo qián?', translation: '실례지만 이 옷은 얼마인가요?' },
  114: { sentence: '二加二等于四。', pinyin: 'Èr jiā èr děngyú sì.', translation: '2 더하기 2는 4이다.' },
  116: { sentence: '他学习很努力，而且很聪明。', pinyin: 'Tā xuéxí hěn nǔlì, érqiě hěn cōngming.', translation: '그는 공부를 열심히 하고, 게다가 똑똑하다.' },
  118: { sentence: '我给朋友发了一条短信。', pinyin: 'Wǒ gěi péngyou fāle yì tiáo duǎnxìn.', translation: '나는 친구에게 문자를 한 통 보냈다.' },
  119: { sentence: '这家饭店的菜很有名。', pinyin: 'Zhè jiā fàndiàn de cài hěn yǒumíng.', translation: '이 식당의 음식은 매우 유명하다.' },
  123: { sentence: '你放心吧，我一定会按时完成。', pinyin: 'Nǐ fàngxīn ba, wǒ yídìng huì ànshí wánchéng.', translation: '안심해, 나 반드시 제때 끝낼게.' },
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
