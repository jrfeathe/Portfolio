import type { ImageDescriptor, ResponsiveImagePreset } from "../lib/images";
import type { Locale } from "./i18n";

export type CtaVariant = "primary" | "secondary" | "ghost";

type TechStackEntry = {
  name: string;
  href: string;
  assetId: string;
};

type TechExperienceEntry = {
  id: string;
  title: string;
  context: string;
  summary: string;
  highlights: string[];
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
  experience: {
    title: string;
    subtitle: string;
    section1title: string;
    section1subtitle: string;
    section2title: string;
    section2subtitle: string;
    entries: Array<{
      id: string;
      company: string;
      role: string;
      timeframe: string;
      summary: string;
      highlights: string[];
    }>;
    techStack: TechExperienceEntry[];
  };
  meetings: {
    title: string;
    subtitle: string;
    intro: string;
    slots: Array<{
      title: string;
      description: string;
    }>;
    contactLabel: string;
    contactHref: string;
    contactNote: string;
  };
};

const HERO_IMAGE_BASE: Omit<ImageDescriptor, "alt"> = {
  src: "/media/hero/portrait-placeholder.svg",
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

const DEFAULT_TECH_STACK_DETAILS: TechExperienceEntry[] = [
  {
    id: "react",
    title: "React",
    context: "Rollodex product UI & portfolio refresh",
    summary:
      "React powers both the Rollodex capstone and this portfolio, letting me pair server components with client-side polish without sacrificing performance.",
    highlights: [
      "Owned the Rollodex onboarding flow, wiring React forms to Prisma APIs to keep setup under five minutes.",
      "Maintained theme-aware ShellLayout controls so recruiters experience consistent navigation across devices."
    ]
  },
  {
    id: "html",
    title: "HTML",
    context: "Portfolio shell & resume exports",
    summary:
      "Semantic HTML keeps the site skim-friendly, screen-reader aware, and ready for PDF export without additional tooling.",
    highlights: [
      "Structured ShellLayout landmarks so anchor navigation and skim mode remain accessible.",
      "Authored print-focused markup for the resume route to satisfy recruiter download workflows."
    ]
  },
  {
    id: "css",
    title: "CSS",
    context: "Tailwind tokens & bespoke layouts",
    summary:
      "I lean on Tailwind plus custom variables to manage responsive grids, dark-mode palettes, and print styles without UI kit bloat.",
    highlights: [
      "Implemented the shell grid that scales from a single column to the tri-column desktop layout.",
      "Maintained dual contrast themes and validated them with Playwright accessibility runs."
    ]
  },
  {
    id: "javascript",
    title: "JavaScript",
    context: "Node utilities & instrumentation",
    summary:
      "Plain JavaScript still powers my quick automation scripts and browser logic when TypeScript would slow experimentation.",
    highlights: [
      "Built telemetry shims that sanitize request payloads before forwarding them to monitoring endpoints.",
      "Scripted content migrations for dictionaries and resume data to keep pull requests reviewable."
    ]
  },
  {
    id: "typescript",
    title: "TypeScript",
    context: "Next.js app & shared utilities",
    summary:
      "Strict TypeScript keeps localization, design tokens, and API contracts honest across the monorepo.",
    highlights: [
      "Defined dictionary types that guarantee every locale string is accounted for before build time.",
      "Modeled theme and contrast preferences as discriminated unions to prevent runtime toggling errors."
    ]
  },
  {
    id: "c",
    title: "C",
    context: "Systems programming coursework",
    summary:
      "C remains my go-to for networking labs and embedded-style exercises that demand explicit memory control.",
    highlights: [
      "Implemented RPC framing labs that stress pointer safety and deterministic resource cleanup.",
      "Led debugging sessions that taught classmates how to reason about segmentation faults and data races."
    ]
  },
  {
    id: "cpp",
    title: "C++",
    context: "Distributed systems labs & grading scripts",
    summary:
      "C++ powers the concurrency labs and tooling I supported as part of the SER321 teaching team.",
    highlights: [
      "Extended multi-threaded labs with profiling hooks so students could visualize race conditions.",
      "Authored linting utilities that validated C++ submissions before manual grading."
    ]
  },
  {
    id: "java",
    title: "Java",
    context: "SER321 teaching assistantship",
    summary:
      "Java is the backbone of the distributed systems assignments I built and supported on AWS.",
    highlights: [
      "Shipped a graded Java client/server assignment that faculty adopted for the course.",
      "Ran office hours focused on threading, networking, and deployment troubleshooting."
    ]
  },
  {
    id: "linux",
    title: "Linux",
    context: "Homelab & virtualization hosts",
    summary:
      "Most of my infrastructure—from self-hosted services to VFIO experiments—runs on Debian or Arch-based distributions.",
    highlights: [
      "Maintained Nextcloud and private game servers with automated backups and monitoring.",
      "Tuned kernel parameters to support GPU passthrough without destabilizing the host."
    ]
  },
  {
    id: "json",
    title: "JSON",
    context: "Resume + localization pipelines",
    summary:
      "Resume content, localization dictionaries, and telemetry fixtures all flow through JSON so they can be linted and diffed easily.",
    highlights: [
      "Keep `resume.json` authoritative so PDF and HTML exports stay in sync.",
      "Structure localization dictionaries so every change is reviewable in git."
    ]
  },
  {
    id: "bash",
    title: "Bash",
    context: "Automation + local tooling",
    summary:
      "Bash scripts handle repetitive chores across the portfolio repo and my homelab.",
    highlights: [
      "Wrote PNPM and Playwright helpers to standardize local test runs.",
      "Automated log rotation and archival tasks on self-hosted servers."
    ]
  },
  {
    id: "xml",
    title: "XML",
    context: "Game mod configuration",
    summary:
      "Large portions of my Stellaris and Minecraft mod work involve editing XML definitions and localization files.",
    highlights: [
      "Extended Stellaris event chains and localization entries to support new crisis mechanics.",
      "Patched Minecraft modpack configs to resolve schema drift between releases."
    ]
  },
  {
    id: "kvm",
    title: "KVM",
    context: "Virtualization stack",
    summary:
      "KVM is the foundation for my GPU-passthrough Windows and Linux guests.",
    highlights: [
      "Configured VFIO bindings and hugepages for reliable gaming VMs.",
      "Documented repeatable setup steps so rebuilds stay predictable."
    ]
  },
  {
    id: "qemu",
    title: "QEMU",
    context: "Low-level VM tuning",
    summary:
      "Custom QEMU launch scripts expose PCI devices, shared folders, and USB peripherals exactly how I need them.",
    highlights: [
      "Authored per-VM command lines for GPU and USB passthrough.",
      "Instrumented boot times to compare virtio models and caching strategies."
    ]
  },
  {
    id: "postgresql",
    title: "PostgreSQL",
    context: "Rollodex data layer",
    summary:
      "PostgreSQL paired with Prisma handles the Rollodex schema, migrations, and reporting queries.",
    highlights: [
      "Normalized contact and activity tables to keep analytics queries under 200ms.",
      "Used pgTAP-style checks and seed scripts to validate schema changes."
    ]
  },
  {
    id: "sql",
    title: "SQL",
    context: "Reporting + debugging",
    summary:
      "From migrations to ad-hoc debugging, SQL is the glue between application behavior and the data layer.",
    highlights: [
      "Created parameterized queries that power Rollodex reporting endpoints.",
      "Used SQL traces to investigate Prisma regressions during capstone sprints."
    ]
  },
  {
    id: "lua",
    title: "Lua",
    context: "Gameplay scripting",
    summary:
      "Lua fuels my Stellaris and Pixelmon scripting experiments where quick iteration matters.",
    highlights: [
      "Optimized resource loaders to cut tick time on a private server by ~18%.",
      "Inserted telemetry hooks that surface misbehaving scripts during playtests."
    ]
  },
  {
    id: "prisma",
    title: "Prisma",
    context: "Node/Next backend modeling",
    summary:
      "Prisma provides typed, migration-friendly access to PostgreSQL for Rollodex and internal tooling.",
    highlights: [
      "Managed schema migrations while coordinating with frontend delivery milestones.",
      "Used seed scripts to keep Playwright fixtures deterministic across CI runs."
    ]
  },
  {
    id: "oracle-cloud",
    title: "Oracle Cloud",
    context: "Digital fabrication internship & prototypes",
    summary:
      "Oracle Cloud's Always Free tier let me host fabrication trackers and small experiments without cost.",
    highlights: [
      "Deployed a fabrication request tracker for BAM Logistics during my internship.",
      "Scripted reproducible setup steps for OCI networking and storage resources."
    ]
  },
  {
    id: "aws",
    title: "AWS",
    context: "Coursework & teaching support",
    summary:
      "AWS hosts the distributed systems labs and demos I delivered as a SER321 teaching assistant.",
    highlights: [
      "Packaged a Java client/server assignment on EC2 so students could test remotely.",
      "Used CloudWatch and IAM policies to monitor and secure the teaching environment."
    ]
  },
  {
    id: "stellaris-mods-tech",
    title: "Stellaris Mods",
    context: "Long-running gameplay project",
    summary:
      "Stellaris modding combines scripting, balance work, and profiling to keep large empires playable.",
    highlights: [
      "Upgraded memory management scripts to reduce stutter in late-game saves.",
      "Coordinated feedback from private testers to prioritize crisis-mechanic fixes."
    ]
  },
  {
    id: "minecraft-mods",
    title: "Minecraft Mods",
    context: "Private Pixelmon server",
    summary:
      "I maintain a private modpack, backporting fixes and tuning configs to keep the Pixelmon server stable.",
    highlights: [
      "Backported a crash fix so the Pixelmon server stayed available for my community.",
      "Balanced resource costs and quest lines through iterative scripting."
    ]
  }
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
          alt: "Portrait of Jack Featherstone standing under warm light.",
        },
        preset: "hero",
        caption: "Self portrait captured for the 2025 personalization refresh."
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
          { label: "View experience", variant: "secondary", href: "/en/experience" },
          { label: "Book a short intro", variant: "ghost", href: "/en/meetings" }
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
  },
  experience: {
    title: "Experience",
    subtitle: "Major interactions that have defined my current skill set.",
    section1title: "Projects",
    section1subtitle: "Important projects and roles that have shaped my current skills.",
    section2title: "Tech stack",
    section2subtitle: "Relevant experience with each technology.",
    entries: [
      {
        id: "rollodex",
        company: "Rollodex",
        role: "Co-lead developer",
        timeframe: "2023 — Present",
        summary:
          "Partnered with a small team to ship a contact management web app for student founders and early-career operators.",
        highlights: [
          "Owned the React + Prisma stack, iterating on the data model and UI to keep onboarding under five minutes.",
          "Ran weekly release reviews that combined QA notes, bug triage, and rollout planning."
        ]
      },
      {
        id: "ser321",
        company: "SER321 (TA)",
        role: "Distributed systems teaching assistant",
        timeframe: "2022 — 2023",
        summary:
          "Supported an upper-division course focused on distributed systems patterns, RPC fundamentals, and testing discipline.",
        highlights: [
          "Hosted office hours twice a week to debug concurrency labs and guided teams through their capstone demos.",
          "Built grading scripts that linted C++ submissions and surfaced flaky behaviors before review."
        ]
      },
      {
        id: "stellaris-mods-project",
        company: "Freelance / Mods",
        role: "Gameplay systems tinkerer",
        timeframe: "Ongoing",
        summary:
          "Maintain a handful of Lua and Stellaris mods plus a private Pixelmon server, treating each as a sandbox for performance tuning.",
        highlights: [
          "Refactored resource loaders to cut average tick time by ~18% on a busy server.",
          "Applied profiling to memory-bound Stellaris scripts, reducing save/load spikes for large empires."
        ]
      }
    ],
    techStack: DEFAULT_TECH_STACK_DETAILS
  },
  meetings: {
    title: "Book a short intro",
    subtitle: "Pick the format that works for you and we will keep it under 20 minutes.",
    intro:
      "Most chats fall into one of the buckets below. If you need something else, send an email and I will tailor the time.",
    slots: [
      {
        title: "Portfolio walkthrough",
        description:
          "Fast skim of the site, tech stack, and anything you would like me to expand on (resume JSON, telemetry, etc.)."
      },
      {
        title: "Project deep dive",
        description:
          "Focus on a single project—Rollodex, Quester2000, or a mod—and unpack the tradeoffs, timelines, and lessons learned."
      },
      {
        title: "Open Q&A",
        description:
          "Need a second opinion on a junior role brief or want to chat about gameplay systems? I am happy to jam without a formal agenda."
      }
    ],
    contactLabel: "Email jfstone2000@proton.me to confirm a slot",
    contactHref: "mailto:jfstone2000@proton.me",
    contactNote: "Async works too—include a few windows (ET) and I will reply with a calendar invite."
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
          alt: "暖かな光の下に立つ Jack Featherstone のポートレート。",
        },
        preset: "hero",
        caption: "2025 年のパーソナライズ刷新に向けて撮影したセルフポートレート。"
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
          { label: "経験を見る", variant: "secondary", href: "/ja/experience" },
          { label: "短時間の面談を予約", variant: "ghost", href: "/ja/meetings" }
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
  },
  experience: {
    title: "経験スナップショット",
    subtitle: "スキルセットを作り上げたプロジェクトと役割を簡潔にまとめています。",
    entries: [
      {
        id: "rollodex",
        company: "Rollodex",
        role: "共同リード開発者",
        timeframe: "2023年 — 現在",
        summary:
          "学生起業家や若手エンジニア向けの連絡先管理 Web アプリを少人数チームで構築しました。",
        highlights: [
          "React + Prisma スタックを担当し、3〜5 分でオンボーディングが終わるようデータモデルと UI を改善。",
          "QA ノートやバグトリアージ、リリース計画をまとめた週次レビューを運営。"
        ]
      },
      {
        id: "ser321",
        company: "SER321 (TA)",
        role: "分散システム講義ティーチングアシスタント",
        timeframe: "2022年 — 2023年",
        summary:
          "分散システムの設計パターンや RPC、テスト手法を扱う上級講義をサポートしました。",
        highlights: [
          "週 2 回のオフィスアワーで並行処理課題のデバッグや最終デモのリハーサルを支援。",
          "C++ 課題のリンター兼テストスクリプトを作成し、レビュー前に不具合を可視化。"
        ]
      },
      {
        id: "stellaris-mods-project",
        company: "Freelance / Mods",
        role: "ゲームプレイシステム開発",
        timeframe: "継続中",
        summary:
          "Lua や Stellaris の Mod、プライベート Pixelmon サーバーをメンテし、パフォーマンス検証の場としています。",
        highlights: [
          "リソースローダーをリファクタし、混雑時サーバーの平均 tick 時間を約 18% 改善。",
          "Stellaris スクリプトのメモリ負荷を解析し、大規模帝国のセーブ/ロード遅延を低減。"
        ]
      }
    ],
    techStack: DEFAULT_TECH_STACK_DETAILS
  },
  meetings: {
    title: "ショート面談のご案内",
    subtitle: "20 分以内で終えられるライトな打ち合わせを想定しています。",
    intro:
      "下記のいずれかに当てはまるケースが多いですが、別の目的でもお気軽にご連絡ください。内容に合わせて構成します。",
    slots: [
      {
        title: "ポートフォリオ概要",
        description:
          "サイト全体や技術スタック、気になる箇所（履歴書 JSON やテレメトリなど）を短時間でご案内します。"
      },
      {
        title: "プロジェクト深掘り",
        description:
          "Rollodex や Quester2000 など 1 件に絞り、意思決定・スケジュール・学びをじっくり共有します。"
      },
      {
        title: "オープン Q&A",
        description:
          "ジュニア採用のブリーフ確認やゲームシステム談義など、 agenda フリーな相談枠としてご利用ください。"
      }
    ],
    contactLabel: "日程調整は jfstone2000@proton.me まで",
    contactHref: "mailto:jfstone2000@proton.me",
    contactNote: "東部時間でいくつか候補を添えていただければ、カレンダー招待で返信します。"
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
          alt: "暖色灯光下站立的 Jack Featherstone 肖像。",
        },
        preset: "hero",
        caption: "为 2025 年个性化焕新拍摄的自画像。"
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
          { label: "查看经历", variant: "secondary", href: "/zh/experience" },
          { label: "预约简短介绍会谈", variant: "ghost", href: "/zh/meetings" }
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
  },
  experience: {
    title: "经验速览",
    subtitle: "快速了解塑造我技能组合的项目与职责。",
    entries: [
      {
        id: "rollodex",
        company: "Rollodex",
        role: "联合负责人",
        timeframe: "2023 — 至今",
        summary:
          "与小团队合作，为学生创始人与初级工程师打造联系人管理 Web 应用。",
        highlights: [
          "负责 React + Prisma 技术栈，优化数据模型与界面，让注册流程控制在 5 分钟内。",
          "主持每周发布评审，合并 QA 记录、缺陷排期与上线计划。"
        ]
      },
      {
        id: "ser321",
        company: "SER321 (助教)",
        role: "分布式系统课程助教",
        timeframe: "2022 — 2023",
        summary:
          "支持高级分布式系统课程，覆盖 RPC 基础与测试规范。",
        highlights: [
          "每周两次答疑，协助学生调试并发实验并准备期末展示。",
          "编写 C++ 作业的 lint/测试脚本，在评分前提前暴露不稳定行为。"
        ]
      },
      {
        id: "stellaris-mods-project",
        company: "自由职业 / Mods",
        role: "玩法系统调优",
        timeframe: "持续",
        summary:
          "维护多款 Lua、Stellaris Mod 以及私有 Pixelmon 服务器，用作性能实验场。",
        highlights: [
          "重构资源加载器，在高负载服务器上将平均 tick 时间降低约 18%。",
          "分析 Stellaris 脚本的内存热点，减少大型帝国的存档/读取尖峰。"
        ]
      }
    ],
    techStack: DEFAULT_TECH_STACK_DETAILS
  },
  meetings: {
    title: "预约简介会",
    subtitle: "选择适合的形式，控制在 20 分钟左右。",
    intro:
      "大多数交流可以归入以下场景。如需其他主题，发送邮件即可；我会根据需求整理议程。",
    slots: [
      {
        title: "作品集速览",
        description:
          "快速演示站点、技术栈以及您想深入了解的部分（如简历 JSON、观测方案等）。"
      },
      {
        title: "项目深聊",
        description:
          "聚焦单个项目（Rollodex、Quester2000 或某个 Mod），拆解权衡、时间线与收获。"
      },
      {
        title: "自由问答",
        description:
          "需要讨论初级岗位需求或想聊玩法系统？可以在没有正式议程的前提下交流。"
      }
    ],
    contactLabel: "请发送邮件至 jfstone2000@proton.me 预约",
    contactHref: "mailto:jfstone2000@proton.me",
    contactNote: "写上几个东部时区的备选时间，我会回信附上日程邀请。"
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
