// scripts/add-examples.mjs
// examples.json에 예문 배치를 머지 (이미 있는 id는 건드리지 않음).
// 실행: node scripts/add-examples.mjs
import { readFileSync, writeFileSync } from 'fs';

const EXAMPLES_PATH = 'lib/words/examples.json';
const VOCAB_PATH = 'lib/words/hsk_vocab.json';

// ─── 이번 배치 (HSK 3급 8차, id 순) ───
const BATCH = {
  477: { sentence: '路上很滑，走路要小心。', pinyin: 'Lùshàng hěn huá, zǒulù yào xiǎoxīn.', translation: '길이 미끄러우니, 걸을 때 조심해야 한다.' },
  478: { sentence: '校长在开学典礼上讲了话。', pinyin: 'Xiàozhǎng zài kāixué diǎnlǐ shàng jiǎngle huà.', translation: '교장 선생님이 개학식에서 말씀을 하셨다.' },
  480: { sentence: '外面下雨了，我们等一会儿再走。', pinyin: 'Wàimiàn xiàyǔ le, wǒmen děng yíhuìr zài zǒu.', translation: '밖에 비가 오니, 우리 좀 있다가 가자.' },
  482: { sentence: '我买了一些水果和蔬菜。', pinyin: 'Wǒ mǎile yìxiē shuǐguǒ hé shūcài.', translation: '나는 과일과 채소를 좀 샀다.' },
  483: { sentence: '谢谢你的帮助。', pinyin: 'Xièxie nǐ de bāngzhù.', translation: '도와줘서 고마워.' },
  484: { sentence: '夏天吃西瓜最舒服了。', pinyin: 'Xiàtiān chī xīguā zuì shūfu le.', translation: '여름에 수박 먹는 게 제일 시원하다.' },
  488: { sentence: '请问您贵姓？', pinyin: 'Qǐngwèn nín guì xìng?', translation: '실례지만 성함이 어떻게 되세요?' },
  489: { sentence: '我的行李箱里装满了衣服。', pinyin: 'Wǒ de xínglǐxiāng lǐ zhuāngmǎnle yīfu.', translation: '내 여행 가방에는 옷이 가득 차 있다.' },
  490: { sentence: '这个星期我很忙。', pinyin: 'Zhège xīngqī wǒ hěn máng.', translation: '이번 주에 나는 매우 바쁘다.' },
  493: { sentence: '这里可以用信用卡付款。', pinyin: 'Zhèlǐ kěyǐ yòng xìnyòngkǎ fùkuǎn.', translation: '여기서는 신용카드로 결제할 수 있다.' },
  494: { sentence: '熊猫是中国的国宝。', pinyin: 'Xióngmāo shì Zhōngguó de guóbǎo.', translation: '판다는 중국의 국보이다.' },
  495: { sentence: '请问，洗手间在哪儿？', pinyin: 'Qǐngwèn, xǐshǒujiān zài nǎr?', translation: '실례지만, 화장실이 어디에 있나요?' },
  498: { sentence: '运动以后我喜欢洗个热水澡。', pinyin: 'Yùndòng yǐhòu wǒ xǐhuan xǐ gè rèshuǐ zǎo.', translation: '운동 후에 나는 따뜻한 물로 목욕하는 걸 좋아한다.' },
  503: { sentence: '我们的学校离这儿很近。', pinyin: 'Wǒmen de xuéxiào lí zhèr hěn jìn.', translation: '우리 학교는 여기서 매우 가깝다.' },
  507: { sentence: '你最喜欢什么颜色？', pinyin: 'Nǐ zuì xǐhuan shénme yánsè?', translation: '너 무슨 색을 가장 좋아해?' },
  508: { sentence: '你感冒了，应该按时吃药。', pinyin: 'Nǐ gǎnmào le, yīnggāi ànshí chī yào.', translation: '너 감기 걸렸으니, 제때 약을 먹어야 해.' },
  509: { sentence: '我要一杯咖啡，谢谢。', pinyin: 'Wǒ yào yì bēi kāfēi, xièxie.', translation: '커피 한 잔 주세요, 감사합니다.' },
  510: { sentence: '老师要求我们每天都背单词。', pinyin: 'Lǎoshī yāoqiú wǒmen měitiān dōu bèi dāncí.', translation: '선생님은 우리에게 매일 단어를 외우라고 요구하신다.' },
  511: { sentence: '我喜欢看电影，也喜欢听音乐。', pinyin: 'Wǒ xǐhuan kàn diànyǐng, yě xǐhuan tīng yīnyuè.', translation: '나는 영화 보는 것도 좋아하고, 음악 듣는 것도 좋아한다.' },
  512: { sentence: '我爷爷每天早上去公园锻炼。', pinyin: 'Wǒ yéye měitiān zǎoshang qù gōngyuán duànliàn.', translation: '우리 할아버지는 매일 아침 공원에 가서 운동하신다.' },
  513: { sentence: '我只有一个哥哥。', pinyin: 'Wǒ zhǐyǒu yí gè gēge.', translation: '나는 형이 한 명뿐이다.' },
  514: { sentence: '我一般晚上十一点睡觉。', pinyin: 'Wǒ yìbān wǎnshang shíyī diǎn shuìjiào.', translation: '나는 보통 밤 11시에 잔다.' },
  515: { sentence: '他一边走路一边听音乐。', pinyin: 'Tā yìbiān zǒulù yìbiān tīng yīnyuè.', translation: '그는 걸으면서 음악을 듣는다.' },
  516: { sentence: '今天比昨天暖和一点儿。', pinyin: 'Jīntiān bǐ zuótiān nuǎnhuo yìdiǎnr.', translation: '오늘은 어제보다 조금 따뜻하다.' },
  519: { sentence: '这些东西一共多少钱？', pinyin: 'Zhèxiē dōngxi yígòng duōshǎo qián?', translation: '이 물건들은 모두 얼마예요?' },
  520: { sentence: '你等我一会儿，我马上就好。', pinyin: 'Nǐ děng wǒ yíhuìr, wǒ mǎshàng jiù hǎo.', translation: '잠깐만 기다려, 나 금방 끝나.' },
  522: { sentence: '今天天气很阴，可能要下雨。', pinyin: 'Jīntiān tiānqì hěn yīn, kěnéng yào xià yǔ.', translation: '오늘 날씨가 흐려서, 아마 비가 올 것 같다.' },
  523: { sentence: '我们应该多帮助别人。', pinyin: 'Wǒmen yīnggāi duō bāngzhù biérén.', translation: '우리는 다른 사람을 많이 도와야 한다.' },
  526: { sentence: '你想喝什么饮料？', pinyin: 'Nǐ xiǎng hē shénme yǐnliào?', translation: '너 무슨 음료 마시고 싶어?' },
  527: { sentence: '因为生病了，所以他请了一天假。', pinyin: 'Yīnwèi shēngbìng le, suǒyǐ tā qǐngle yì tiān jià.', translation: '병이 나서, 그는 하루 휴가를 냈다.' },
  528: { sentence: '听音乐能让人放松。', pinyin: 'Tīng yīnyuè néng ràng rén fàngsōng.', translation: '음악을 들으면 긴장을 풀 수 있다.' },
  532: { sentence: '这个词是什么意思？', pinyin: 'Zhège cí shì shénme yìsi?', translation: '이 단어는 무슨 뜻이야?' },
  533: { sentence: '请你帮我看一下这个句子。', pinyin: 'Qǐng nǐ bāng wǒ kàn yíxià zhège jùzi.', translation: '이 문장 좀 봐 줄래?' },
  534: { sentence: '这两件衣服的颜色一样。', pinyin: 'Zhè liǎng jiàn yīfu de yánsè yíyàng.', translation: '이 두 옷의 색깔은 똑같다.' },
  537: { sentence: '请坐在这把椅子上。', pinyin: 'Qǐng zuò zài zhè bǎ yǐzi shàng.', translation: '이 의자에 앉으세요.' },
  539: { sentence: '他今天又迟到了。', pinyin: 'Tā jīntiān yòu chídào le.', translation: '그는 오늘 또 지각했다.' },
  540: { sentence: '我有两个姐姐。', pinyin: 'Wǒ yǒu liǎng gè jiějie.', translation: '나는 누나가 둘 있다.' },
  542: { sentence: '这家餐厅的烤鸭很有名。', pinyin: 'Zhè jiā cāntīng de kǎoyā hěn yǒumíng.', translation: '이 식당의 오리구이는 매우 유명하다.' },
  543: { sentence: '孩子们正在玩游戏。', pinyin: 'Háizimen zhèngzài wán yóuxì.', translation: '아이들이 게임을 하고 있다.' },
  545: { sentence: '妈妈做的鱼很好吃。', pinyin: 'Māma zuò de yú hěn hǎochī.', translation: '엄마가 만든 생선이 매우 맛있다.' },
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
