import { Filter, type CheckProfanityResult, type Language } from "glin-profanity";
import { loadLdnoobwWords } from "./ldnoobw";
import { loadSafePhrases } from "./safePhrases";

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
    "办公地点"
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
  /\b(industry|industries|sector|sectors|domain|domains)\b/i
];

const DOXXING_PATTERNS = [
  // English
  /\b(ssn|social\s+security|sin)\b/i,
  /\bpassport\b/i,
  /\bdriver'?s\s+license\b/i,
  /\bid\s*(number)?\b/i,
  /\b(home|street|mailing|physical)\s+address\b/i,
  /\b(apartment|apt\.?|unit)\s+(number|no\.?)\b/i,
  /\bcoordinates?\b/i,
  /\blatitude\b|\blongitude\b/i,
  /\bexact\s+(home|work|school)?\s*location\b/i,
  /\bwhere\s+(does\s+he\s+)?live\b/i,
  /\bdoxx?\b/i,
  /\btrack(ing)?\s+(him|her|them|location|address|phone|device)\b/i,
  // Japanese
  /住所|自宅住所|自宅の住所|家の住所|郵便番号|連絡先|電話番号|携帯番号|マイナンバー|居場所|所在|追跡|どこに住んで/i,
  // Simplified Chinese
  /住址|家庭住址|家庭地址|家里地址|邮编|联系电话|电话号码|手机号|身份证号?|护照号?|精准定位|坐标|追踪|追蹤|住在哪里/i
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

const PERSONAL_SENSITIVE_PATTERNS = [
  /\b(age|how\s+old|birth\s*date|date\s+of\s+birth)\b/i,
  /\b(phone|mobile|cell)\s*(number)?\b/i,
  /\bcontact\s+(number|info)\b/i,
  /\b(address|exact\s+location|exact\s+city)\b/i,
  /\bsalary\b/i,
  /\b(relationship|girlfriend|boyfriend|partner)\b/i
];

export function normalizeForModeration(text: string): string {
  const nfkc = text.normalize("NFKC");
  const withoutZeroWidth = nfkc.replace(ZERO_WIDTH_CHARS, "");
  const deLeeted = withoutZeroWidth.replace(/[01345789]/g, (char) => LEET_MAP[char] ?? char);
  return deLeeted.replace(/\s+/g, " ").trim().toLowerCase();
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
  const safePhraseHit = safePhrases.some((phrase) => phrase && normalized.includes(phrase));
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
  const professionalIntent = portfolioIntent || techIntent;
  const doxxing = !portfolioIntent && DOXXING_PATTERNS.some((pattern) => pattern.test(normalized));
  const sexualBody = SEXUAL_BODY_PATTERNS.some((pattern) => pattern.test(normalized));
  const harassmentCue = HARASSMENT_PATTERNS.some((pattern) => pattern.test(normalized));
  const selfHarmCue = SELF_HARM_PATTERNS.some((pattern) => pattern.test(normalized));
  const personalSensitiveCue = !portfolioIntent && PERSONAL_SENSITIVE_PATTERNS.some((pattern) => pattern.test(normalized));
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

  if (selfHarmCue) addSuspicion(0.4);
  if (doxxing) addSuspicion(0.4);
  if (sexualBody) addSuspicion(0.25);
  if (glinFlagged) addSuspicion(0.25);
  if (harassmentCue) addSuspicion(0.25);
  if (personalSensitiveCue) addSuspicion(0.2);
  if (unprofessionalCue) addSuspicion(0.05);

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
