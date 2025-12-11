import { Filter, type CheckProfanityResult, type Language } from "glin-profanity";
import { loadLdnoobwWords } from "./ldnoobw";

export type LocalModerationResult = {
  flagged: boolean;
  normalized: string;
  reasons: string[];
  glinMatches: string[];
  languagesTried: Language[];
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
    "schedule",
    "timezone",
    "time",
    "hours",
    "assess",
    "assessment",
    "location",
    "city",
    "based",
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
  /\b(availability|schedule|timezone|time\s*zone|hours?)\b/i,
  /\bwork\s+(location|city|office)\b/i
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

const TROLLING_PATTERNS = [
  /\b4chan\b/i,
  /\bkys\b/i,
  /\bkill\s+yourself\b/i,
  /\byou\s+suck\b/i,
  /\btroll(ing)?\b/i
];

const PERSONAL_PATTERNS = [
  // Personal traits we flag even if not profane
  /sexual\s*orientation/i,
  /\bstraight\b/i,
  /\bgay\b/i,
  /\bqueer\b/i,
  /\bbi(sexual)?\b/i,
  /\btrans(gender)?\b/i,
  /\bage\b/i,
  /\bhow\s+old\b/i,
  /\bborn\b/i,
  /\bbirth(day)?\b/i,
  /date\s+of\s+birth/i,
  /\bwhen\s+was\s+\w+\s+born\b/i,
  /\breligion\b/i,
  /\bpolitics?\b/i
];

const TECH_INTENT_PATTERNS = [
  /\breact\b/i,
  /\bjavascript\b/i,
  /\btypescript\b/i,
  /\bnext\.?js\b/i,
  /\bnode\.?js\b/i,
  /\b(frontend|backend|full\s*stack)\b/i,
  /\bskills?\b/i,
  /\bscope\s+of\s+skills?\b/i,
  /\bexperience\b/i,
  /\btech\b/i,
  /\bai\b/i
];

const INNUENDO_PATTERNS = [
  /\bvaseline\b/i,
  /\bgapefruit\b/i,
  /\bointment\b/i,
  /\bbugger(y|ing)?\b/i,
  /\blad(y|ies)\b/i,
  /\bbroads?\b/i,
  /\bwomen\b/i,
  /\bwoman\b/i,
  /\bmen\b/i,
  /\bman\b/i,
  /\bboys?\b/i,
  /\bgirls?\b/i,
  /\bgirlies\b/i
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

export function runLocalModeration(message: string): LocalModerationResult {
  const normalized = normalizeForModeration(message);
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
  const doxxing = !portfolioIntent && DOXXING_PATTERNS.some((pattern) => pattern.test(normalized));
  const trolling = TROLLING_PATTERNS.some((pattern) => pattern.test(normalized));
  const grossPersonal = PERSONAL_PATTERNS.some((pattern) => pattern.test(normalized));
  const innuendo = INNUENDO_PATTERNS.some((pattern) => pattern.test(normalized));
  const techIntent = TECH_INTENT_PATTERNS.some((pattern) => pattern.test(normalized));

  const reasons: string[] = [];
  if (glinFlagged) reasons.push("glin");
  if (trolling) reasons.push("troll");
  if (grossPersonal) reasons.push("gross_personal");
  if (doxxing) reasons.push("doxxing");
  if (innuendo) reasons.push("innuendo");

  const flagged = glinFlagged || trolling || grossPersonal || doxxing || innuendo;
  const shouldRelaxForTech =
    flagged &&
    techIntent &&
    !doxxing &&
    !trolling &&
    !grossPersonal &&
    !glinFlagged &&
    glinMatches.length === 0;

  return {
    flagged: shouldRelaxForTech ? false : flagged,
    normalized,
    reasons: shouldRelaxForTech ? [] : reasons,
    glinMatches: shouldRelaxForTech ? [] : glinMatches,
    languagesTried: languages
  };
}
