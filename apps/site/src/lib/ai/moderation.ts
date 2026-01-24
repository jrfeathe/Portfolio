import { Filter, type CheckProfanityResult, type Language } from "glin-profanity";
import { loadLdnoobwWords } from "./ldnoobw";
import { loadSafePhrases, loadSafePhrasePatterns } from "./safePhrases";

export type LocalModerationResult = {
  flagged: boolean;
  normalized: string;
  reasons: string[];
  glinMatches: string[];
  languagesTried: Language[];
  professionalIntent: boolean;
  techIntent: boolean;
  harassmentCue: boolean;
  selfHarmCue: boolean;
  personalSensitiveCue: boolean;
  suspicionScore: number;
};

const ZERO_WIDTH_CHARS = /[\u200B-\u200D\uFEFF]/g;
const LEET_MAP: Record<string, string> = { "0": "o", "1": "l", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "9": "g" };
const NON_LATIN_SCRIPT = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Cyrillic}\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Devanagari}\p{Script=Thai}\p{Script=Greek}]/u;

const PORTFOLIO_ALLOWLIST_WORDS = new Set(
  [
    // English
    "resume",
    "cv",
    "portfolio",
    "work",
    "works",
    "worker",
    "employer",
    "company",
    "job",
    "jobs",
    "role",
    "roles",
    "team",
    "office",
    "remote",
    "hybrid",
    "school",
    "college",
    "university",
    "degree",
    "education",
    "class",
    "classes",
    "course",
    "courses",
    "major",
    "project",
    "projects",
    "tech",
    "stack",
    "skills",
    "experience",
    "availability",
    "available",
    "schedule",
    "timezone",
    "time",
    "hours",
    "assess",
    "assessment",
    "location",
    "city",
    "based",
    "strength",
    "strengths",
    "weakness",
    "weaknesses",
    "industry",
    "industries",
    "sector",
    "sectors",
    "domain",
    "domains",
    // Japanese (portfolio-safe terms)
    "履歴書",
    "職務経歴書",
    "ポートフォリオ",
    "会社",
    "勤務先",
    "職場",
    "仕事",
    "働いて",
    "学歴",
    "学校",
    "大学",
    "大学院",
    "高校",
    "専攻",
    "プロジェクト",
    "スキル",
    "経験",
    "経歴",
    "技術",
    "時間",
    "時間帯",
    "タイムゾーン",
    "スケジュール",
    "勤務時間",
    "所在地",
    "拠点",
    "部下",
    "社員",
    "従業員",
    "チーム",
    "リーダー",
    "リーダーシップ",
    "管理",
    "マネジメント",
    "会議",
    "ミーティング",
    "運営",
    "司会",
    "進行",
    "ファシリテーション",
    "対立",
    "衝突",
    "クレーム",
    "苦情",
    "顧客",
    "クライアント",
    "秘密",
    "守秘",
    "機密",
    "倫理",
    "道徳",
    "プライバシー",
    "フィードバック",
    "エスカレーション",
    // Simplified Chinese (portfolio-safe terms)
    "简历",
    "履历",
    "作品集",
    "公司",
    "雇主",
    "工作",
    "就业",
    "岗位",
    "职位",
    "学校",
    "大学",
    "学院",
    "学历",
    "专业",
    "项目",
    "技能",
    "技术栈",
    "经验",
    "时间",
    "时区",
    "日程",
    "工作时间",
    "地点",
    "位置",
    "城市",
    "办公地点",
    "员工",
    "下属",
    "团队",
    "领导",
    "管理",
    "经理",
    "主管",
    "会议",
    "组织",
    "协调",
    "主持",
    "冲突",
    "纠纷",
    "投诉",
    "客户",
    "保密",
    "机密",
    "伦理",
    "道德",
    "隐私",
    "反馈",
    "升级"
  ].map((word) => word.toLowerCase())
);

const CUSTOM_PROFANITY_WORDS = ["bugger", "buggery", "buggering", "bum"];

const PORTFOLIO_INTENT_PATTERNS = [
  /\b(resume|cv|portfolio)\b/i,
  /\b(work|works|working|job|jobs|employ(er|ment)?|company|role|roles|team|office|remote|hybrid)\b/i,
  /\b(school|college|university|degree|education|class|classes|course|courses|major|gpa)\b/i,
  /\b(project|projects|tech|stack|skills?)\b/i,
  /\b(availability|available|schedule|timezone|time\s*zone|hours?)\b/i,
  /\bwork\s+(location|city|office)\b/i,
  /\b(strengths?|weaknesses?)\b/i,
  /\b(based\s+in|where\s+is\s+\w+\s+based|location|city)\b/i,
  /\b(industry|industries|sector|sectors|domain|domains)\b/i,
  /(部下|社員|従業員|チーム|リーダー|リーダーシップ|管理|マネジメント|会議|ミーティング|運営|司会|進行|ファシリテーション|対立|衝突|クレーム|苦情|顧客|クライアント|秘密|守秘|機密|倫理|道徳|プライバシー|フィードバック|エスカレーション)/i,
  /(员工|下属|团队|领导|管理|经理|主管|会议|组织|协调|主持|冲突|纠纷|投诉|客户|保密|机密|伦理|道德|隐私|反馈|升级)/i
];

const DOXXING_PATTERNS = [
  // English (high-sensitivity only)
  /\b(ssn|social\s+security(?:\s+number)?|social\s+insurance\s+number)\b/i,
  /\b(home|residential|street|house)\s+address\b/i,
  /\b(bank\s+account|bank\s+details?|bank\s+info|banking\s+details?|banking\s+info|routing\s+number|iban|swift|bic|credit\s+card\s+number|debit\s+card\s+number)\b/i,
  /\b(password|passphrase|passcode)\b/i,
  /\b(api\s+key|secret\s+key|private\s+key|ssh\s+key|access\s+token|api\s+token)\b/i,
  /\b(?!000|666|9\d\d)\d{3}[- ]?(?!00)\d{2}[- ]?(?!0000)\d{4}\b/,
  // Japanese
  /自宅住所|自宅の住所|家の住所/i,
  /社会保障番号|マイナンバー/i,
  /銀行口座|口座番号|銀行口座番号/i,
  /パスワード|パスフレーズ|パスコード/i,
  /秘密鍵|プライベートキー|APIキー|シークレットキー|アクセス\s*トークン/i,
  // Simplified Chinese
  /家庭住址|家庭地址|家里地址/i,
  /社会保障号|社会保障号码|身份证号/i,
  /银行账户|银行账号|银行账户号|账户号码|信用卡号|借记卡号|路由号码|国际银行账号|iban|swift|bic/i,
  /密码|口令/i,
  /私钥|API密钥|访问令牌|访问密钥/i
];

const TECH_INTENT_PATTERNS = [
  /\breact\b/i,
  /\bjavascript\b/i,
  /\btypescript\b/i,
  /\bnext\.?js\b/i,
  /\bnode\.?js\b/i,
  /\bcode\b/i,
  /\bcoding\b/i,
  /\bcoder\b/i,
  /\bprogram(mer|ming)?\b/i,
  /\bsoftware\s+engineer\b/i,
  /\bdeveloper\b/i,
  /\bdevs?\b/i,
  /\b(frontend|backend|full\s*stack)\b/i,
  /\bskills?\b/i,
  /\bscope\s+of\s+skills?\b/i,
  /\bexperience\b/i,
  /\btech\b/i,
  /\bai\b/i
];

// Keep CJK explicit-body fallbacks; English sexual terms rely on glin/LDNOOBW.
const SEXUAL_BODY_PATTERNS = [
  /(陰茎|阴茎|阴道|陰道|陰部|阴部|乳房|乳头|乳交|肛門|肛门|阴蒂|陰核|裤裆)/i,
  /(ちんこ|ちんちん|まんこ|おっぱい|巨乳|性器)/i
];

const HARASSMENT_PATTERNS = [
  /\bkys\b/i,
  /\bkill\s+yourself\b/i,
  /\byou\s+suck\b/i,
  /\byou\s+(are\s+)?(an?\s+)?(idiot|loser|stupid|dumb)\b/i,
  /\bshut\s+up\b/i,
  /\bgo\s+away\b/i,
  /\bgo\s+(die|jump)\b/i,
  /\b4chan\b/i,
  /\btroll(ing)?\b/i
];

const SELF_HARM_PATTERNS = [
  /\bi\s+(want|need)\s+to\s+die\b/i,
  /\b(end|ending)\s+my\s+life\b/i,
  /\bkill\s+myself\b/i,
  /\bsuicide\b/i,
  /\bhurt\s+myself\b/i,
  /\bself[-\s]?harm\b/i
];

const PERSONAL_SENSITIVE_PATTERNS: RegExp[] = [];

export function normalizeForModeration(text: string): string {
  const nfkc = text.normalize("NFKC");
  const withoutZeroWidth = nfkc.replace(ZERO_WIDTH_CHARS, "");
  const deLeeted = withoutZeroWidth.replace(/[01345789]/g, (char) => LEET_MAP[char] ?? char);
  return deLeeted.replace(/\s+/g, " ").trim().toLowerCase();
}

function buildSafePhraseVariants(normalized: string): string[] {
  if (!normalized) return [];
  const variants = new Set<string>([normalized]);
  const expanded = normalized
    .replace(/\byou'?re\b/g, "you are")
    .replace(/\byou'?ve\b/g, "you have")
    .replace(/\bwe'?ve\b/g, "we have")
    .replace(/\bi'?ve\b/g, "i have")
    .replace(/\bcan'?t\b/g, "cannot")
    .replace(/\bwon'?t\b/g, "will not")
    .replace(/\bwhat'?s\b/g, "what is")
    .replace(/\bit'?s\b/g, "it is")
    .replace(/\bdo you\b/g, "does jack")
    .replace(/\bare you\b/g, "is jack")
    .replace(/\bcan you\b/g, "can jack")
    .replace(/\bcould you\b/g, "could jack")
    .replace(/\bwould you\b/g, "would jack")
    .replace(/\bshould you\b/g, "should jack")
    .replace(/\byour\b/g, "jack's")
    .replace(/\byou\b/g, "jack")
    .replace(/\bhe\b/g, "jack")
    .replace(/\bhis\b/g, "jack's");
  variants.add(expanded);
  return Array.from(variants);
}

export function selectProfanityLanguages(text: string): Language[] {
  const languages: Language[] = ["english"];
  const hasKana = /[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(text);
  const hasHan = /[\p{Script=Han}]/u.test(text);

  if (hasKana) {
    languages.push("japanese");
  }
  if (hasHan) {
    languages.push("chinese");
  }

  return Array.from(new Set(languages));
}

function hasAllowlistedPortfolioIntent(text: string): boolean {
  if (PORTFOLIO_INTENT_PATTERNS.some((pattern) => pattern.test(text))) {
    return true;
  }

  return ["履歴書", "職務経歴書", "ポートフォリオ", "経歴", "プロフィール", "简历", "作品集", "履历"].some((token) =>
    text.includes(token)
  );
}

export function isBenignStructuralPrompt(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  const urlOnly =
    /^(https?:\/\/\S+|www\.[^\s]+|\S+\.(com|net|org|io|dev|app|ai)(\/\S*)?)$/i.test(trimmed) &&
    !/\s/.test(trimmed.replace(/https?:\/\/|www\./gi, ""));
  if (urlOnly) return true;
  const systemLike = /^(system\s*:|\[?system\]?[:\s])/i.test(trimmed);
  return systemLike;
}

const BENIGN_LOCATION_PATTERNS = [
  /\bwhere\s+is\s+(he|jack)\s+(based|located)\b/i,
  /\b(where|what)\s+(city|location)\b/i,
  /\b(time\s*zone|timezone)\b/i,
  /\bbased\s+in\b/i,
  /\bwhich\s+city\b/i
];

export function isBenignLocationQuestion(normalized: string): boolean {
  return BENIGN_LOCATION_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function runLocalModeration(message: string): LocalModerationResult {
  const normalized = normalizeForModeration(message);
  const safePhrases = loadSafePhrases();
  const safePhrasePatterns = loadSafePhrasePatterns();
  const safePhraseVariants = buildSafePhraseVariants(normalized);
  const safePhraseHit =
    safePhrasePatterns.some((pattern) => safePhraseVariants.some((variant) => pattern.test(variant))) ||
    safePhraseVariants.some((variant) => safePhrases.some((phrase) => phrase && variant.includes(phrase)));
  const glinText = normalized
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\bpenises\b/g, "penis")
    .trim();
  const ldnoobw = loadLdnoobwWords(selectProfanityLanguages(normalized));
  const expandWord = (word: string, target: Set<string>) => {
    const lower = word.toLowerCase();
    if (!lower) return;
    target.add(lower);
    if (/^[a-z]+$/.test(lower) && lower.length > 2) {
      target.add(`${lower}s`);
      if (!lower.endsWith("s")) {
        target.add(`${lower}es`);
      }
      if (lower.endsWith("y")) {
        target.add(`${lower.slice(0, -1)}ies`);
      }
    }
  };

  const customWordSet = new Set<string>();
  [...CUSTOM_PROFANITY_WORDS, ...ldnoobw].forEach((word) => expandWord(word, customWordSet));
  const customWords = Array.from(customWordSet);
  const languages = selectProfanityLanguages(normalized);
  const containsCjk = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(normalized);

  let glinResult: CheckProfanityResult | null = null;
  try {
    const filter = new Filter({
      languages,
      allLanguages: false,
      allowObfuscatedMatch: true,
      wordBoundaries: !containsCjk,
      ignoreWords: Array.from(PORTFOLIO_ALLOWLIST_WORDS),
      customWords,
      fuzzyToleranceLevel: 1
    });
    glinResult = filter.checkProfanity(glinText);
  } catch (error) {
    console.error("[chatbot] glin-profanity check failed:", error);
  }

  const glinMatches =
    glinResult?.matches
      ?.filter((match) => !match.isWhitelisted && typeof match.word === "string" && match.word.trim())
      .map((match) => match.word.toLowerCase()) ??
    glinResult?.profaneWords ??
    [];
  const glinFlagged = Boolean(glinResult?.containsProfanity || (glinMatches?.length ?? 0) > 0);

  const portfolioIntent = hasAllowlistedPortfolioIntent(normalized);
  const techIntent = TECH_INTENT_PATTERNS.some((pattern) => pattern.test(normalized));
  const doxxing = !portfolioIntent && DOXXING_PATTERNS.some((pattern) => pattern.test(normalized));
  const sexualBody = SEXUAL_BODY_PATTERNS.some((pattern) => pattern.test(normalized));
  const harassmentCue = HARASSMENT_PATTERNS.some((pattern) => pattern.test(normalized));
  const selfHarmCue = SELF_HARM_PATTERNS.some((pattern) => pattern.test(normalized));
  const personalSensitiveCue = !portfolioIntent && PERSONAL_SENSITIVE_PATTERNS.some((pattern) => pattern.test(normalized));
  const nonLatinSafe =
    NON_LATIN_SCRIPT.test(normalized) &&
    !doxxing &&
    !sexualBody &&
    !harassmentCue &&
    !selfHarmCue &&
    !personalSensitiveCue;
  const professionalIntent = portfolioIntent || techIntent || nonLatinSafe;
  const unprofessionalCue = !professionalIntent;

  const reasons: string[] = [];
  if (glinFlagged) reasons.push("glin");
  if (doxxing) reasons.push("doxxing");
  if (sexualBody) reasons.push("sexual_body");
  if (harassmentCue) reasons.push("harassment");
  if (selfHarmCue) reasons.push("self_harm");
  if (personalSensitiveCue) reasons.push("personal_sensitive");
  if (unprofessionalCue) reasons.push("off_topic");

  const safePhraseOnly =
    safePhraseHit && !glinFlagged && !doxxing && !sexualBody && !harassmentCue && !selfHarmCue && !personalSensitiveCue;

  let suspicionScore = 0;
  const addSuspicion = (value: number) => {
    suspicionScore = Math.min(1, suspicionScore + value);
  };

  if (safePhraseOnly) {
    return {
      flagged: false,
      normalized,
      reasons: ["safe_phrase"],
      glinMatches,
      languagesTried: languages,
      professionalIntent: true,
      techIntent,
      harassmentCue: false,
      selfHarmCue: false,
      personalSensitiveCue: false,
      suspicionScore: 0
    };
  }

  if (selfHarmCue) addSuspicion(0.5);
  if (doxxing) addSuspicion(0.4);
  if (sexualBody) addSuspicion(0.25);
  if (glinFlagged) addSuspicion(0.25);
  if (harassmentCue) addSuspicion(0.25);
  if (personalSensitiveCue) addSuspicion(0.2);
  if (unprofessionalCue) addSuspicion(0.1);

  return {
    flagged: glinFlagged || doxxing || sexualBody || harassmentCue || selfHarmCue || personalSensitiveCue,
    normalized,
    reasons,
    glinMatches,
    languagesTried: languages,
    professionalIntent,
    techIntent,
    harassmentCue,
    selfHarmCue,
    personalSensitiveCue,
    suspicionScore
  };
}
