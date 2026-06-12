// scripts/add-examples.mjs
// examples.json에 예문 배치를 머지 (이미 있는 id는 건드리지 않음).
// 실행: node scripts/add-examples.mjs
import { readFileSync, writeFileSync } from 'fs';

const EXAMPLES_PATH = 'lib/words/examples.json';
const VOCAB_PATH = 'lib/words/hsk_vocab.json';

// ─── 이번 배치 (HSK 3급 9차 — 3급 완성, id 순) ───
const BATCH = {
  546: { sentence: '这本书十五元。', pinyin: 'Zhè běn shū shíwǔ yuán.', translation: '이 책은 15위안이다.' },
  548: { sentence: '我愿意帮你解决这个问题。', pinyin: 'Wǒ yuànyì bāng nǐ jiějué zhège wèntí.', translation: '나는 기꺼이 네가 이 문제를 해결하도록 도울게.' },
  549: { sentence: '我今天在路上遇到了一位老朋友。', pinyin: 'Wǒ jīntiān zài lùshàng yùdàole yí wèi lǎo péngyou.', translation: '나는 오늘 길에서 오랜 친구를 우연히 만났다.' },
  550: { sentence: '天气越来越冷了。', pinyin: 'Tiānqì yuèláiyuè lěng le.', translation: '날씨가 점점 추워진다.' },
  551: { sentence: '我的生日在五月。', pinyin: 'Wǒ de shēngrì zài wǔ yuè.', translation: '내 생일은 5월이다.' },
  552: { sentence: '今晚的月亮又大又圆。', pinyin: 'Jīnwǎn de yuèliang yòu dà yòu yuán.', translation: '오늘 밤 달은 크고 둥글다.' },
  553: { sentence: '经常运动对身体好。', pinyin: 'Jīngcháng yùndòng duì shēntǐ hǎo.', translation: '자주 운동하는 것은 몸에 좋다.' },
  554: { sentence: '我的书在桌子上。', pinyin: 'Wǒ de shū zài zhuōzi shàng.', translation: '내 책은 책상 위에 있다.' },
  555: { sentence: '这个地方很美，我下次还想再来。', pinyin: 'Zhège dìfang hěn měi, wǒ xiàcì hái xiǎng zài lái.', translation: '이곳은 아름다워서, 다음에 또 오고 싶다.' },
  556: { sentence: '时间不早了，我们明天见，再见！', pinyin: 'Shíjiān bù zǎo le, wǒmen míngtiān jiàn, zàijiàn!', translation: '시간이 늦었네, 내일 보자, 안녕!' },
  558: { sentence: '请问，去火车站怎么走？', pinyin: 'Qǐngwèn, qù huǒchēzhàn zěnme zǒu?', translation: '실례지만, 기차역은 어떻게 가나요?' },
  559: { sentence: '我们周末去爬山，怎么样？', pinyin: 'Wǒmen zhōumò qù páshān, zěnmeyàng?', translation: '우리 주말에 등산 가는 거, 어때?' },
  562: { sentence: '请给我一张纸。', pinyin: 'Qǐng gěi wǒ yì zhāng zhǐ.', translation: '종이 한 장 주세요.' },
  565: { sentence: '妈妈生病了，我要在家照顾她。', pinyin: 'Māma shēngbìng le, wǒ yào zài jiā zhàogù tā.', translation: '엄마가 아프셔서, 나는 집에서 엄마를 돌봐야 한다.' },
  568: { sentence: '我用照相机拍了很多照片。', pinyin: 'Wǒ yòng zhàoxiàngjī pāile hěn duō zhàopiàn.', translation: '나는 카메라로 사진을 많이 찍었다.' },
  569: { sentence: '他笑着对我说“你好”。', pinyin: 'Tā xiàozhe duì wǒ shuō “nǐ hǎo”.', translation: '그는 웃으며 나에게 "안녕"이라고 말했다.' },
  570: { sentence: '这是我的新手机。', pinyin: 'Zhè shì wǒ de xīn shǒujī.', translation: '이것은 내 새 휴대폰이다.' },
  572: { sentence: '我正在做作业，没时间出去玩。', pinyin: 'Wǒ zhèngzài zuò zuòyè, méi shíjiān chūqù wán.', translation: '나는 지금 숙제를 하고 있어서, 나가 놀 시간이 없다.' },
  573: { sentence: '我只想安静地休息一下。', pinyin: 'Wǒ zhǐ xiǎng ānjìng de xiūxi yíxià.', translation: '나는 그저 조용히 좀 쉬고 싶다.' },
  574: { sentence: '院子里有一只小狗。', pinyin: 'Yuànzi lǐ yǒu yì zhī xiǎo gǒu.', translation: '마당에 강아지 한 마리가 있다.' },
  576: { sentence: '教室里只有一个学生。', pinyin: 'Jiàoshì lǐ zhǐyǒu yí gè xuéshēng.', translation: '교실에는 학생이 한 명밖에 없다.' },
  577: { sentence: '我不喜欢这种颜色。', pinyin: 'Wǒ bù xǐhuan zhè zhǒng yánsè.', translation: '나는 이런 색깔을 좋아하지 않는다.' },
  578: { sentence: '中国是一个历史悠久的国家。', pinyin: 'Zhōngguó shì yí gè lìshǐ yōujiǔ de guójiā.', translation: '중국은 역사가 유구한 나라이다.' },
  580: { sentence: '我正在努力学习中文。', pinyin: 'Wǒ zhèngzài nǔlì xuéxí Zhōngwén.', translation: '나는 열심히 중국어를 공부하고 있다.' },
  583: { sentence: '经过努力，他终于成功了。', pinyin: 'Jīngguò nǔlì, tā zhōngyú chénggōng le.', translation: '노력 끝에, 그는 마침내 성공했다.' },
  585: { sentence: '我现在住在学校附近。', pinyin: 'Wǒ xiànzài zhù zài xuéxiào fùjìn.', translation: '나는 지금 학교 근처에 산다.' },
  587: { sentence: '桌子上放着一台电脑。', pinyin: 'Zhuōzi shàng fàngzhe yì tái diànnǎo.', translation: '책상 위에 컴퓨터가 한 대 놓여 있다.' },
  590: { sentence: '这个字我不认识。', pinyin: 'Zhège zì wǒ bú rènshi.', translation: '이 글자를 나는 모른다.' },
  591: { sentence: '自己的事情应该自己做。', pinyin: 'Zìjǐ de shìqing yīnggāi zìjǐ zuò.', translation: '자기 일은 스스로 해야 한다.' },
  595: { sentence: '这是我吃过的最好吃的菜。', pinyin: 'Zhè shì wǒ chīguò de zuì hǎochī de cài.', translation: '이것은 내가 먹어 본 것 중 가장 맛있는 음식이다.' },
  596: { sentence: '吃饭的时候不要张着嘴说话。', pinyin: 'Chīfàn de shíhou búyào zhāngzhe zuǐ shuōhuà.', translation: '밥 먹을 때 입을 벌리고 말하지 마라.' },
  597: { sentence: '他是最后一个离开教室的。', pinyin: 'Tā shì zuìhòu yí gè líkāi jiàoshì de.', translation: '그는 교실을 마지막으로 떠난 사람이다.' },
  598: { sentence: '你最近过得怎么样？', pinyin: 'Nǐ zuìjìn guò de zěnmeyàng?', translation: '너 요즘 어떻게 지내?' },
  600: { sentence: '妈妈正在厨房做饭。', pinyin: 'Māma zhèngzài chúfáng zuòfàn.', translation: '엄마가 부엌에서 밥을 하고 있다.' },
  603: { sentence: '今天的作业有点儿多。', pinyin: 'Jīntiān de zuòyè yǒudiǎnr duō.', translation: '오늘 숙제가 좀 많다.' },
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
