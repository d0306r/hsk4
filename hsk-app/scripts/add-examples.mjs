// scripts/add-examples.mjs
// examples.json에 예문 배치를 머지 (이미 있는 id는 건드리지 않음).
// 실행: node scripts/add-examples.mjs
import { readFileSync, writeFileSync } from 'fs';

const EXAMPLES_PATH = 'lib/words/examples.json';
const VOCAB_PATH = 'lib/words/hsk_vocab.json';

// ─── 이번 배치 (HSK 4급 12차, id 순) ───
const BATCH = {
  943: { sentence: '她最喜欢吃黑巧克力。', pinyin: 'Tā zuì xǐhuan chī hēi qiǎokèlì.', translation: '그녀는 다크 초콜릿을 가장 좋아한다.' },
  944: { sentence: '学习中，理解最重要，其次是练习。', pinyin: 'Xuéxí zhōng, lǐjiě zuì zhòngyào, qícì shì liànxí.', translation: '공부에서 이해가 가장 중요하고, 그 다음이 연습이다.' },
  945: { sentence: '这个地方的气候很适合旅游。', pinyin: 'Zhège dìfang de qìhòu hěn shìhé lǚyóu.', translation: '이 지역의 기후는 여행하기에 적합하다.' },
  947: { sentence: '请把这里的情况告诉我。', pinyin: 'Qǐng bǎ zhèlǐ de qíngkuàng gàosu wǒ.', translation: '이곳의 상황을 나에게 알려 주세요.' },
  948: { sentence: '考完试以后，我感觉很轻松。', pinyin: 'Kǎo wán shì yǐhòu, wǒ gǎnjué hěn qīngsōng.', translation: '시험을 다 보고 나니, 나는 매우 홀가분하다.' },
  949: { sentence: '过年的时候，我们要去看亲戚。', pinyin: 'Guònián de shíhou, wǒmen yào qù kàn qīnqi.', translation: '설에는 우리가 친척을 보러 간다.' },
  950: { sentence: '他小时候家里很穷。', pinyin: 'Tā xiǎoshíhou jiālǐ hěn qióng.', translation: '그는 어렸을 때 집이 매우 가난했다.' },
  953: { sentence: '我把全部的钱都花光了。', pinyin: 'Wǒ bǎ quánbù de qián dōu huāguāng le.', translation: '나는 가진 돈을 전부 다 써 버렸다.' },
  954: { sentence: '这两个词的区别很大。', pinyin: 'Zhè liǎng gè cí de qūbié hěn dà.', translation: '이 두 단어의 차이는 매우 크다.' },
  955: { sentence: '我给他打了电话，他却没接。', pinyin: 'Wǒ gěi tā dǎle diànhuà, tā què méi jiē.', translation: '내가 그에게 전화했는데, 그는 오히려 받지 않았다.' },
  957: { sentence: '这道菜还缺少一点盐。', pinyin: 'Zhè dào cài hái quēshǎo yìdiǎn yán.', translation: '이 요리는 소금이 조금 부족하다.' },
  959: { sentence: '他很努力，然而结果并不理想。', pinyin: 'Tā hěn nǔlì, rán’ér jiéguǒ bìng bù lǐxiǎng.', translation: '그는 매우 노력했지만, 결과는 그다지 이상적이지 않았다.' },
  961: { sentence: '请不要随便扔垃圾。', pinyin: 'Qǐng búyào suíbiàn rēng lājī.', translation: '함부로 쓰레기를 버리지 마세요.' },
  963: { sentence: '任何人都不能迟到。', pinyin: 'Rènhé rén dōu bùnéng chídào.', translation: '어떤 사람도 지각하면 안 된다.' },
  965: { sentence: '我有每天写日记的习惯。', pinyin: 'Wǒ yǒu měitiān xiě rìjì de xíguàn.', translation: '나는 매일 일기를 쓰는 습관이 있다.' },
  966: { sentence: '电影院的入口在那边。', pinyin: 'Diànyǐngyuàn de rùkǒu zài nàbiān.', translation: '영화관 입구는 저쪽에 있다.' },
  967: { sentence: '晚饭后我喜欢去公园散步。', pinyin: 'Wǎnfàn hòu wǒ xǐhuan qù gōngyuán sànbù.', translation: '저녁 식사 후에 나는 공원에 산책하러 가는 걸 좋아한다.' },
  968: { sentence: '这片森林里有很多动物。', pinyin: 'Zhè piàn sēnlín lǐ yǒu hěn duō dòngwù.', translation: '이 숲에는 많은 동물이 있다.' },
  969: { sentence: '他累得躺在沙发上睡着了。', pinyin: 'Tā lèi de tǎng zài shāfā shàng shuìzháo le.', translation: '그는 피곤해서 소파에 누워 잠들었다.' },
  972: { sentence: '这件衣服稍微有点儿大。', pinyin: 'Zhè jiàn yīfu shāowēi yǒudiǎnr dà.', translation: '이 옷은 약간 좀 크다.' },
  973: { sentence: '请给我一个勺子喝汤。', pinyin: 'Qǐng gěi wǒ yí gè sháozi hē tāng.', translation: '국을 먹게 숟가락 하나 주세요.' },
  976: { sentence: '桌子上还剩下一些菜。', pinyin: 'Zhuōzi shàng hái shèngxià yìxiē cài.', translation: '식탁에 음식이 좀 남아 있다.' },
  977: { sentence: '坐公交车比打车省钱。', pinyin: 'Zuò gōngjiāochē bǐ dǎchē shěng qián.', translation: '버스를 타는 게 택시 타는 것보다 돈을 아낀다.' },
  979: { sentence: '医生救了他的生命。', pinyin: 'Yīshēng jiùle tā de shēngmìng.', translation: '의사가 그의 생명을 구했다.' },
  980: { sentence: '他的生意做得很成功。', pinyin: 'Tā de shēngyi zuò de hěn chénggōng.', translation: '그의 사업은 매우 성공적이다.' },
  982: { sentence: '他忙得甚至没时间吃饭。', pinyin: 'Tā máng de shènzhì méi shíjiān chīfàn.', translation: '그는 너무 바빠서 심지어 밥 먹을 시간도 없다.' },
  983: { sentence: '这个好消息使大家都很高兴。', pinyin: 'Zhège hǎo xiāoxi shǐ dàjiā dōu hěn gāoxìng.', translation: '이 좋은 소식은 모두를 기쁘게 했다.' },
  985: { sentence: '他对这个结果十分满意。', pinyin: 'Tā duì zhège jiéguǒ shífēn mǎnyì.', translation: '그는 이 결과에 매우 만족한다.' },
  986: { sentence: '我不知道他是否会来。', pinyin: 'Wǒ bù zhīdào tā shìfǒu huì lái.', translation: '나는 그가 올지 안 올지 모른다.' },
  987: { sentence: '师傅，请到火车站。', pinyin: 'Shīfu, qǐng dào huǒchēzhàn.', translation: '기사님, 기차역으로 가 주세요.' },
  988: { sentence: '这件衣服很适合你。', pinyin: 'Zhè jiàn yīfu hěn shìhé nǐ.', translation: '이 옷은 너에게 잘 어울린다.' },
  990: { sentence: '我们生活在二十一世纪。', pinyin: 'Wǒmen shēnghuó zài èrshíyī shìjì.', translation: '우리는 21세기에 살고 있다.' },
  992: { sentence: '我已经适应了这里的生活。', pinyin: 'Wǒ yǐjīng shìyìngle zhèlǐ de shēnghuó.', translation: '나는 이미 이곳의 생활에 적응했다.' },
  993: { sentence: '使用前请仔细阅读说明书。', pinyin: 'Shǐyòng qián qǐng zǐxì yuèdú shuōmíngshū.', translation: '사용 전에 설명서를 자세히 읽어 주세요.' },
  994: { sentence: '他是一个很实在的人。', pinyin: 'Tā shì yí gè hěn shízai de rén.', translation: '그는 매우 진실한(꾸밈없는) 사람이다.' },
  995: { sentence: '我收到了一封朋友的来信。', pinyin: 'Wǒ shōudàole yì fēng péngyou de láixìn.', translation: '나는 친구의 편지 한 통을 받았다.' },
  996: { sentence: '今天热得让人受不了。', pinyin: 'Jīntiān rè de ràng rén shòubuliǎo.', translation: '오늘은 더워서 견딜 수가 없다.' },
  997: { sentence: '他的表演受到了大家的欢迎。', pinyin: 'Tā de biǎoyǎn shòudàole dàjiā de huānyíng.', translation: '그의 공연은 모두의 환영을 받았다.' },
  998: { sentence: '北京是中国的首都。', pinyin: 'Běijīng shì Zhōngguó de shǒudū.', translation: '베이징은 중국의 수도이다.' },
  999: { sentence: '售货员热情地向我介绍商品。', pinyin: 'Shòuhuòyuán rèqíng de xiàng wǒ jièshào shāngpǐn.', translation: '점원이 친절하게 나에게 상품을 소개했다.' },
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
