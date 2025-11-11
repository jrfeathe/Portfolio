import type { ImageDescriptor, ResponsiveImagePreset } from "../lib/images";
import type { Locale } from "./i18n";

export type CtaVariant = "primary" | "secondary" | "ghost";

type TechStackEntry = {
  name: string;
  href: string;
  assetId: string;
};

export type AppDictionary = {
  metadata: {
    title: string;
    description: string;
  };
  home: {
    breadcrumbs: {
      home: string;
      workspace: string;
    };
    hero: {
      title: string;
      subtitle: string;
      cta: {
        title: string;
        description?: string;
        actions: Array<{
          label: string;
          variant: CtaVariant;
          href?: string;
          download?: boolean;
        }>;
      };
      media?: {
        image: ImageDescriptor;
        preset?: ResponsiveImagePreset;
        caption?: string;
      };
    };
    sections: {
      mission: {
        eyebrow: string;
        title: string;
        description: string;
        overview: string;
        bulletPoints: string[];
      };
      techStack: {
        eyebrow: string;
        title: string;
        description: string;
        overview: string;
        items: TechStackEntry[];
      };
      proof: {
        eyebrow: string;
        title: string;
        description: string;
        overview: string;
        proofChips: Array<{ title: string; details: string }>;
      };
      roadmap: {
        eyebrow: string;
        title: string;
        description: string;
        overview: string;
        nextSteps: string[];
      };
    };
    footer: {
      heading: string;
      body: string;
      email: string;
      notesLabel: string;
      notesHref: string;
      resumeLabel: string;
      resumeHref: string;
      closing: string;
    };
  };
  notes: {
    index: {
      title: string;
      subtitle: string;
      empty: string;
    };
    detail: {
      backLabel: string;
      tocLabel: string;
    };
  };
};

const HERO_IMAGE_BASE: Omit<ImageDescriptor, "alt"> = {
  src: "/media/hero/hero-glow.svg",
  width: 960,
  height: 720,
  blurDataURL:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAr8B9ngcRwAAAABJRU5ErkJggg=="
};

const DEFAULT_TECH_STACK_ITEMS: TechStackEntry[] = [
  { name: "React", href: "https://react.dev/", assetId: "react" },
  { name: "HTML", href: "https://html.spec.whatwg.org/multipage/", assetId: "html" },
  { name: "CSS", href: "https://www.w3.org/Style/CSS/Overview.en.html", assetId: "css" },
  { name: "JavaScript", href: "https://developer.mozilla.org/docs/Web/JavaScript", assetId: "javascript" },
  { name: "TypeScript", href: "https://www.typescriptlang.org/", assetId: "typescript" },
  { name: "C", href: "https://en.cppreference.com/w/c", assetId: "c" },
  { name: "C++", href: "https://en.cppreference.com/w/cpp", assetId: "cpp" },
  { name: "Java", href: "https://dev.java/", assetId: "java" },
  { name: "Linux", href: "https://www.linuxfoundation.org/", assetId: "linux" },
  { name: "JSON", href: "https://www.json.org/json-en.html", assetId: "json" },
  { name: "Bash", href: "https://www.gnu.org/software/bash/", assetId: "bash" },
  { name: "XML", href: "https://www.w3.org/XML/", assetId: "xml" },
  { name: "KVM", href: "https://www.linux-kvm.org/page/Main_Page", assetId: "kvm" },
  { name: "QEMU", href: "https://www.qemu.org/", assetId: "qemu" },
  { name: "PostgreSQL", href: "https://www.postgresql.org/", assetId: "postgresql" },
  { name: "SQL", href: "https://www.iso.org/standard/63555.html", assetId: "sql" },
  { name: "Lua", href: "https://www.lua.org/", assetId: "lua" },
  { name: "Prisma", href: "https://www.prisma.io/", assetId: "prisma" },
  { name: "Oracle Cloud", href: "https://www.oracle.com/cloud/", assetId: "oracle-cloud" },
  { name: "AWS", href: "https://aws.amazon.com/", assetId: "aws" },
  { name: "Stellaris Mods", href: "https://steamcommunity.com/app/281990/workshop/", assetId: "stellaris-mods" },
  { name: "Minecraft Mods", href: "https://modrinth.com/", assetId: "minecraft-mods" }
];

const en: AppDictionary = {
  metadata: {
    title: "Jack F. Portfolio",
    description: "Personal engineering portfolio and live project playground."
  },
  home: {
    breadcrumbs: {
      home: "Home",
      workspace: "Workspace overview"
    },
    hero: {
      title: "Jack Featherstone",
      subtitle:
        "Hi, I'm Jack and this is my Software Engineering portfolio! I'm looking to begin my career as a Junior Fullstack Developer. The intent of this site is to prove my skills and abilities, and to capitalize on opportunities to network.",
      media: {
        image: {
          ...HERO_IMAGE_BASE,
          alt: "Abstract gradient artwork representing portfolio velocity and focus.",
        },
        preset: "hero",
        caption: "Gradient artwork used as the default hero visual."
      },
      cta: {
        title: "Need proof fast?",
        actions: [
          {
            label: "Download resume",
            variant: "primary",
            href: "/resume.pdf",
            download: true
          },
          { label: "View experience", variant: "secondary", href: "/experience" },
          { label: "Book a short intro", variant: "ghost", href: "/meetings" }
        ]
      }
    },
    sections: {
      mission: {
        eyebrow: "Orientation",
        title: "Site purpose",
        description:
          "Create distinctive evidence of my abilities for fullstack development, showcasing my capabilities to job recruiters in under three clicks.",
        overview:
          "While the site began as a dedicated service to host my resume, it evolved into a central place for hosting my personal projects.",
        bulletPoints: []
      },
      techStack: {
        eyebrow: "Skills",
        title: "Tech stack & skills",
        description:
          "",
        overview:
          "",
        items: DEFAULT_TECH_STACK_ITEMS
      },
      proof: {
        eyebrow: "Evidence",
        title: "Past achievements",
        description: "Relatable highlights from the past few years.",
        overview:
          "Each card focuses on a project or role that tells the story behind the skills shown above.",
        proofChips: [
          {
            title: "Rollodex",
            details: "Co-led development of a contact management web application."
          },
          {
            title: "Quester2000",
            details:
              "A point tracking to-do list tool for managing your work-life balance."
          },
          {
            title: "SER321 TA",
            details:
              "Supported a high level Distributed Software Systems course as a teacher’s assistant."
          },
          {
            title: "Stellaris Modding",
            details:
              "Upgraded the memory management library for Stellaris to boost performance."
          }
        ]
      },
      roadmap: {
        eyebrow: "Roadmap",
        title: "Current projects & plans",
        description:
          "My current focus is on building some small scale projects that make a difference in my life. G.O.A.T.: Grind, Optimize, Automate, Thrive.",
        overview:
          "While it is very rewarding to optimize and automate, I also find joy in learning new skills and technologies!",
        nextSteps: [
          "Revisit Quester2000: Add more functionality and improve UI. Possible smartwatch integration.",
          "The Four Horsemen: Develop a new mod for Stellaris to spawn an end-game crisis, compatible with Gigastructural Engineering.",
          "Pixelmon Problem: Continue work to backport an update to Pixelmon to fix a periodic client-side crash on my private server.",
          "C++ Game Engine: Continue work on a private game / engine. Abstract loosely-autobiographical RPG adventure.",
          "Social Networking: Find events to meet people in industry. Considering indie games conventions in NYC."
        ]
      }
    }
    ,
    footer: {
      heading: "Jack Featherstone - Software Engineering Portfolio",
      body: "Showcasing my purpose, skills, achievements, and interests!",
      email: "jfstone2000@proton.me",
      notesLabel: "Engineering notes",
      notesHref: "/en/notes",
      resumeLabel: "Resume (PDF)",
      resumeHref: "/resume.pdf",
      closing: "2025. Jack Featherstone. Built with Codex, Next.js, pnpm, and my spiritual pressure."
    }
  },
  notes: {
    index: {
      title: "Engineering notes",
      subtitle:
        "Long-form breakdowns of delivery choices, instrumentation tactics, and operating agreements behind the portfolio effort.",
      empty: "Notes are on the way."
    },
    detail: {
      backLabel: "Back to notes",
      tocLabel: "On this page"
    }
  }
};

const ja: AppDictionary = {
  metadata: {
    title: "Jack F. ポートフォリオ",
    description: "エンジニアリングの成果と実験を公開するプロジェクトハブ。"
  },
  home: {
    breadcrumbs: {
      home: "ホーム",
      workspace: "ワークスペース概要"
    },
    hero: {
      title: "Jack Featherstone",
      subtitle:
        "はじめまして、Jack と申します。こちらは私のソフトウェアエンジニアリング・ポートフォリオです。現在、ジュニア・フルスタック開発者としてキャリアを開始する機会を探しています。本サイトの目的は、私のスキルと実務能力を証拠に基づいて示し、ネットワーク構築の機会につなげることです。",
      media: {
        image: {
          ...HERO_IMAGE_BASE,
          alt: "ポートフォリオの集中と推進力を表現した抽象的なグラデーションアート。",
        },
        preset: "hero",
        caption: "既定のヒーロービジュアルとして使用するグラデーションアート。"
      },
      cta: {
        title: "証跡がすぐに必要ですか？",
        actions: [
          {
            label: "履歴書をダウンロード",
            variant: "primary",
            href: "/resume.pdf",
            download: true
          },
          { label: "経験を見る", variant: "secondary", href: "/experience" },
          { label: "短時間の面談を予約", variant: "ghost", href: "/meetings" }
        ]
      }
    },
    sections: {
      mission: {
        eyebrow: "オリエンテーション",
        title: "サイトの目的",
        description:
          "フルスタック開発に関する私の能力を、採用担当者の方々が 3 クリック以内で把握できるよう、独自の証跡として提示します。",
        overview:
          "当初は履歴書を掲載するための専用サイトとして開始しましたが、現在は個人プロジェクトを集約して紹介する中核の場へと発展しています。",
        bulletPoints: []
      },
      techStack: {
        eyebrow: "スキル",
        title: "技術スタックとスキル",
        description:
          "",
        overview:
          "",
        items: DEFAULT_TECH_STACK_ITEMS
      },
      proof: {
        eyebrow: "エビデンス",
        title: "過去の実績",
        description: "近年の主なハイライトを抜粋して掲載しています。",
        overview:
          "各カードは、上記のスキルの裏付けとなるプロジェクトや役割のストーリーに焦点を当てています。",
        proofChips: [
          {
            title: "Rollodex",
            details: "連絡先管理 Web アプリの開発を共同リードしました。"
          },
          {
            title: "Quester2000",
            details:
              "ワークライフバランスの管理を支援するポイント制の ToDo ツール。"
          },
          {
            title: "SER321 TA（ティーチングアシスタント）",
            details:
              "上級レベルの分散ソフトウェアシステム講義でティーチングアシスタントを務めました。"
          },
          {
            title: "Stellaris Modding",
            details:
              "Stellaris のメモリ管理ライブラリを改良し、パフォーマンスを向上させました。"
          }
        ]
      },
      roadmap: {
        eyebrow: "ロードマップ",
        title: "現在の取り組みと計画",
        description:
          "現在は、日々の生活に実際の価値をもたらす小規模プロジェクトの構築に注力しています。G.O.A.T.（Grind, Optimize, Automate, Thrive）。",
        overview:
          "最適化や自動化は非常に有益ですが、新しい技術やスキルを学ぶ楽しさも大切にしています。",
        nextSteps: [
          "Quester2000 の見直し：機能拡充と UI 改善。スマートウォッチ連携の可能性も検討。",
          "The Four Horsemen：Stellaris で終盤クライシスを発生させる新規 Mod を開発。Gigastructural Engineering との互換性を確保。",
          "Pixelmon の課題対応：プライベートサーバーで発生する定期的なクライアントクラッシュを解消するため、アップデートのバックポート作業を継続。",
          "C++ 製ゲーム／エンジンの継続開発：自伝的要素を取り入れた RPG 体験を目指す。",
          "交流活動：業界イベントを探索し、人脈づくりを推進。NYC のインディーゲーム系イベント参加も検討。"
        ]
      }
    },
    footer: {
      heading: "Jack Featherstone - ソフトウェアエンジニアリング・ポートフォリオ",
      body: "私の目的、スキル、実績、関心領域を分かりやすくご紹介します。",
      email: "jfstone2000@proton.me",
      notesLabel: "エンジニアリングノート",
      notesHref: "/ja/notes",
      resumeLabel: "履歴書 (PDF)",
      resumeHref: "/resume.pdf",
      closing: "2025年。Jack Featherstone。Codex、Next.js、pnpm で構築し、霊圧を添えました。"
    }
  },
  notes: {
    index: {
      title: "エンジニアリングノート",
      subtitle:
        "ポートフォリオ施策を支えるデリバリー判断、計測手法、オペレーションの約束事を詳しく解説します。",
      empty: "ノートは近日公開予定です。"
    },
    detail: {
      backLabel: "ノート一覧に戻る",
      tocLabel: "このページの内容"
    }
  }
};

const zh: AppDictionary = {
  metadata: {
    title: "Jack F. 作品集",
    description: "展示工程成果与实验的个人项目中枢。"
  },
  home: {
    breadcrumbs: {
      home: "首页",
      workspace: "工作区总览"
    },
    hero: {
      title: "Jack Featherstone",
      subtitle:
        "您好，我叫 Jack。这里是我的软件工程作品集。我正寻求以初级全端开发者的身份开启职业生涯的机会。本网站旨在以可验证的证据呈现我的技能与能力，并拓展专业人脉。",
      media: {
        image: {
          ...HERO_IMAGE_BASE,
          alt: "抽象渐变艺术，象征作品集的速度与专注。",
        },
        preset: "hero",
        caption: "预设首页视觉所使用的渐变艺术。"
      },
      cta: {
        title: "需要立即取得证据吗？",
        actions: [
          {
            label: "下载履历",
            variant: "primary",
            href: "/resume.pdf",
            download: true
          },
          { label: "查看经历", variant: "secondary", href: "/experience" },
          { label: "预约简短介绍会谈", variant: "ghost", href: "/meetings" }
        ]
      }
    },
    sections: {
      mission: {
        eyebrow: "导览",
        title: "网站宗旨",
        description:
          "以独特且可验证的证据呈现我在全端开发方面的能力，使招聘方能在三次点击内快速掌握重点。",
        overview:
          "本网站起初作为履历托管之用，现已发展为集中呈现我个人项目的核心平台。",
        bulletPoints: []
      },
      techStack: {
        eyebrow: "技能",
        title: "技术栈与技能",
        description:
          "",
        overview:
          "",
        items: DEFAULT_TECH_STACK_ITEMS
      },
      proof: {
        eyebrow: "证据",
        title: "过往成就",
        description: "选取近年具有代表性的亮点。",
        overview:
          "每张卡片均聚焦于能够展现上述技能背景的项目或角色。",
        proofChips: [
          {
            title: "Rollodex",
            details: "共同主导开发一款联系人管理的 Web 应用。"
          },
          {
            title: "Quester2000",
            details: "用于管理工作与生活平衡的积分制待办工具。"
          },
          {
            title: "SER321 TA（教学助理）",
            details: "担任高级分布式软件系统课程的教学助理。"
          },
          {
            title: "Stellaris Modding",
            details: "改进 Stellaris 的内存管理库，以提升性能。"
          }
        ]
      },
      roadmap: {
        eyebrow: "路线图",
        title: "目前的项目与规划",
        description:
          "目前专注于构建能为我日常带来实际价值的小型项目。G.O.A.T.（Grind, Optimize, Automate, Thrive）。",
        overview:
          "尽管优化与自动化成效显著，我同样享受学习新技术与新技能的过程。",
        nextSteps: [
          "回顾 Quester2000：扩充功能并改进 UI，评估智能手表整合。",
          "The Four Horsemen：为 Stellaris 开发可触发终局危机的新 Mod，并确保与 Gigastructural Engineering 兼容。",
          "Pixelmon 问题：持续回溯移植更新，以修复我私有服务器上周期性发生的客户端崩溃。",
          "C++ 游戏引擎：持续开发私人游戏／引擎，目标为带有自传色彩的 RPG 体验。",
          "社交网络：寻找行业交流活动并拓展人脉，考虑参加纽约市的独立游戏展会。"
        ]
      }
    },
    footer: {
      heading: "Jack Featherstone - 软件工程作品集",
      body: "清晰呈现我的目标、技能、成果与兴趣。",
      email: "jfstone2000@proton.me",
      notesLabel: "工程笔记",
      notesHref: "/zh/notes",
      resumeLabel: "履历 (PDF)",
      resumeHref: "/resume.pdf",
      closing: "2025 年。Jack Featherstone。以 Codex、Next.js、pnpm 构建，并注入灵压。"
    }
  },
  notes: {
    index: {
      title: "工程笔记",
      subtitle:
        "延伸说明本作品集背后的交付决策、监测手法，以及合作共识。",
      empty: "笔记即将发布。"
    },
    detail: {
      backLabel: "返回笔记",
      tocLabel: "页面导览"
    }
  }
};

const dictionaries: Record<Locale, AppDictionary> = {
  en,
  ja,
  zh
};

export function getDictionary(locale: Locale): AppDictionary {
  return dictionaries[locale];
}
