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
    metadataTitle: string;
    title: string;
    subtitle: string;
    section1title: string;
    section1subtitle: string;
    intro: string;
    availability: {
      alt: string;
      description: string;
      timezoneHref?: string;
      timezoneLabel?: string;
    };
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
    context: "2 years of experience",
    summary: "Frontend design for Software Portfolio (this website), Rollodex Capstone, Quester2000.",
    highlights: [
      "Rollodex - Implemented various components to build templated forms and redesign search/filter UI.",
      "Portfolio - Implemented a wide suite of custom UI components."
    ]
  },
  {
    id: "html",
    title: "HTML",
    context: "5 years of experience",
    summary: "Web design for Web Development & Design Foundations coursework, Software Portfolio (this website), Rollodex Capstone, Quester2000.",
    highlights: [
      "Built legacy style websites using HTML and CSS to display information and navigate between pages.",
      "Integrated with JavaScript, TypeScript, and React to build complex web apps."
    ]
  },
  {
    id: "css",
    title: "CSS",
    context: "5 years of experience",
    summary: "UI design for Software Portfolio (this website), Rollodex Capstone, Quester2000, Various courses.",
    highlights: [
      "Created themes for web applications to customize and improve accessibility."
    ]
  },
  {
    id: "javascript",
    title: "JavaScript",
    context: "3 years of experience",
    summary: "Backend logic for Software Portfolio (this website), Rollodex Capstone, Quester2000.",
    highlights: [
      "Built client/server logic to power complex features, such as menu interfaces, search filtering, and form templates."
    ]
  },
  {
    id: "typescript",
    title: "TypeScript",
    context: "6 months of experience",
    summary: "Backend logic for Software Portfolio (this website), Quester2000.",
    highlights: [
      "Built web apps meant to run on cloud services."
    ]
  },
  {
    id: "c",
    title: "C",
    context: "3 years of experience",
    summary: "Coursework for various courses.",
    highlights: [
      "SER334 - Built a Loadable Kernel Module that uses Linux data structures to display details about the processes executing in the kernel.",
      "Applied scripting for various topics such as thread/compiler optimization, page replacement, image processing, and scheduling algorithms."
    ]
  },
  {
    id: "cpp",
    title: "C++",
    context: "7 years of experience",
    summary: "Core language foundation. Used for custom game engine and many small projects.",
    highlights: [
      "Developed a custom game engine for a current project. (Limited information disclosure)",
      "The language that I first learned and my top preference."
    ]
  },
  {
    id: "java",
    title: "Java",
    context: "7 years of experience",
    summary: "Distributed systems teaching, Minecraft modding, Various courses/projects.",
    highlights: [
      "Built a Wheel of Fortune Java client/server assignment for students.",
      "Decompiled code to patch a crash and reassemble."
    ]
  },
  {
    id: "linux",
    title: "Linux",
    context: "7 years of experience",
    summary: "My daily driver kernel, set up on many systems. Also used for various courses.",
    highlights: [
      "Actively maintaining Nextcloud and game servers with backups and monitoring.",
      "Configured VFIO and kernel tuning for GPU passthrough to VMs."
    ]
  },
  {
    id: "json",
    title: "JSON",
    context: "5 years of experience",
    summary: "Modding, Game Engine, Various courses.",
    highlights: [
      "Stored complex application objects to file, and read them back upon application reload.",
      "Commonly used when modding Stellaris and Minecraft."
    ]
  },
  {
    id: "bash",
    title: "Bash",
    context: "5 years of experience",
    summary: "Local tooling on Linux systems",
    highlights: [
      "Scripting to modify various behaviors of Linux machines.",
      "Used heavily during application development."
    ]
  },
  {
    id: "xml",
    title: "XML",
    context: "5 years of experience",
    summary: "Game mod configuration, Various courses",
    highlights: [
      "Patched Minecraft config XMLs to optimize servers and align with modpack updates.",
      "Deploy virtual machines and optimize them."
    ]
  },
  {
    id: "kvm",
    title: "KVM",
    context: "4 years of experience",
    summary: "Virtualize Windows on Linux systems",
    highlights: [
      "Set up Windows 10 virtual machines optimized for gaming, with GPU passthrough.",
      "Used with QEMU."
    ]
  },
  {
    id: "qemu",
    title: "QEMU",
    context: "4 years of experience",
    summary: "Virtualize Windows on Linux systems",
    highlights: [
      "Set up Windows 10 virtual machines optimized for gaming, with GPU passthrough.",
      "Used with KVM."
    ]
  },
  {
    id: "postgresql",
    title: "PostgreSQL",
    context: "2 years of experience",
    summary: "Rollodex, Quester2000",
    highlights: [
      "Modeled contact/search data to support fast filtering.",
      "Stored app data for user accounts."
    ]
  },
  {
    id: "sql",
    title: "SQL",
    context: "2 years of experience",
    summary: "Rollodex, SER322 - Database Management course",
    highlights: [
      "Designed Retail Inventory Management system for SER322.",
      "Used queries to troubleshoot and speed up search for Rollodex."
    ]
  },
  {
    id: "lua",
    title: "Lua",
    context: "2 years of experience",
    summary: "Stellaris Modding",
    highlights: [
      "Built gameplay scripts and UI hooks for custom content.",
      "Iterated on mod changes to improve balance."
    ]
  },
  {
    id: "prisma",
    title: "Prisma",
    context: "2 years of experience",
    summary: "Rollodex, Quester2000",
    highlights: [
      "Managed schema migrations and models for database structure."
    ]
  },
  {
    id: "oracle-cloud",
    title: "Oracle Cloud",
    context: "2 years of experience",
    summary: "WireGuard experiments with intermediate IP",
    highlights: [
      "Set up a ping point to create a secure connection to my home server."
    ]
  },
  {
    id: "aws",
    title: "AWS",
    context: "2 years of experience",
    summary: "Server deployment for various projects",
    highlights: [
      "Used to host client-server applications for SER321."
    ]
  },
  {
    id: "stellaris-mods-tech",
    title: "Stellaris Mods",
    context: "3 years of experience",
    summary: "Repeated bandaging of a broken modpack to encourage a desired storyline.",
    highlights: [
      "Built custom Stellaris mechanics and memory optimizing scripts."
    ]
  },
  {
    id: "minecraft-mods",
    title: "Minecraft Mods",
    context: "5 years of experience",
    summary: "10+ high performance modded servers.",
    highlights: [
      "Backported crash fixes to patch a rare client side disconnect.",
      "Added new features with custom mods, and optimized modpacks."
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
        role: "Co-lead fullstack developer",
        timeframe: "2023–2024 (capstone)",
        summary: "Co-led a remote fullstack development team, developing a contact management tool. Took ownership of API/data integrations and accessibility, while maintaining the repo as Git master across two-week Scrum releases.",
        highlights: [
          "Designed APIs and database schemas, templated forms, and rebuilt search/filter UI.",
          "Cut search latency from ~5s to ~200ms while maintaining repo practices, docs, and two-week sprints."
        ]
      },
      {
        id: "ser321",
        company: "SER321 (TA)",
        role: "Undergraduate TA for SER 321 (Distributed Software Systems)",
        timeframe: "March – May 2024",
        summary: "Designed and coded an assignment (“Wheel of Fortune” Java server supporting a dynamic amount of concurrent clients). Mentored students in designing distributed systems hosted on AWS and debugging client-server architectures.",
        highlights: [
          "Actively answered student questions on Slack discussion boards, and hosted office hours once per week.",
          "Assisted in debugging complex issues with code logic, networking, threading, AWS deployment, Ubuntu, and virtualization."
        ]
      },
      {
        id: "stellaris-mods-project",
        company: "Freelance / Mods",
        role: "Mod developer (Stellaris & Minecraft)",
        timeframe: "Ongoing",
        summary: "Maintain a handful of Minecraft and Stellaris mods plus high performance heavily modded private servers.",
        highlights: [
          "Built custom mod features and balance tweaks for Stellaris and Minecraft.",
          "Operate game servers and customize modpacks with ongoing profiling and tuning."
        ]
      },
    ],
    techStack: DEFAULT_TECH_STACK_DETAILS
  },
  meetings: {
    metadataTitle: "Jack F. Contact",
    title: "Contact",
    subtitle: "I'm open to answering any questions you may have, in any format that works for you.",
    section1title: "Availability",
    section1subtitle: "I am commonly able to schedule a short meeting during the hours listed below.",
    intro:
      "Green areas indicate my common availability (New York time, EST/EDT). If you need another window, send an email and I will do my best to accommodate you.",
    availability: {
      alt: "Calendar snapshot showing weekly availability with green blocks highlighting openings.",
      description: "Weekly snapshot of common availability.",
      timezoneHref: "https://www.timeanddate.com/worldclock/usa/new-york",
      timezoneLabel: "Check the current New York time"
    },
    slots: [
      {
        title: "Portfolio walkthrough",
        description:
          "Fast skim of the site, tech stack, and anything you would like me to expand on (resume, telemetry, project management, etc.)."
      },
      {
        title: "Project deep dive",
        description:
          "Focus on a single project, such as Rollodex, Quester2000, or a mod. Discuss the tradeoffs, timelines, and lessons learned."
      },
      {
        title: "Open Q&A",
        description:
          "Need a second opinion on a tech issue or just want to chat? I am happy to help you without a formal agenda. Async may fit better for this case!"
      }
    ],
    contactLabel: "Email to confirm: jfstone2000@proton.me",
    contactHref: "mailto:jfstone2000@proton.me",
    contactNote: "Available on multiple messaging platforms! Suggest something that works for you. You can typically expect an async reply within 24 hours."
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
        role: "Co-lead fullstack developer",
        timeframe: "2023–2024 (capstone)",
        summary: "Co-led a remote fullstack development team, developing a contact management tool. Took ownership of API/data integrations and accessibility, while maintaining the repo as Git master across two-week Scrum releases.",
        highlights: [
          "Designed APIs and database schemas, templated forms, and rebuilt search/filter UI.",
          "Cut search latency from ~5s to ~200ms while maintaining repo practices, docs, and two-week sprints."
        ]
      },
      {
        id: "ser321",
        company: "SER321 (TA)",
        role: "Undergraduate TA for SER 321 (Distributed Software Systems)",
        timeframe: "March – May 2024",
        summary: "Designed and coded an assignment (“Wheel of Fortune” Java server supporting a dynamic amount of concurrent clients). Mentored students in designing distributed systems hosted on AWS and debugging client-server architectures.",
        highlights: [
          "Actively answered student questions on Slack discussion boards, and hosted office hours once per week.",
          "Assisted in debugging complex issues with code logic, networking, threading, AWS deployment, Ubuntu, and virtualization."
        ]
      },
      {
        id: "stellaris-mods-project",
        company: "Freelance / Mods",
        role: "Mod developer (Stellaris & Minecraft)",
        timeframe: "Ongoing",
        summary: "Maintain a handful of Minecraft and Stellaris mods plus high performnce heavily modded private servers.",
        highlights: [
          "Built custom mod features and balance tweaks for Stellaris and Minecraft.",
          "Operate game servers and customize modpacks with ongoing profiling and tuning."
        ]
      },
    ],
    techStack: DEFAULT_TECH_STACK_DETAILS
  },
  meetings: {
    metadataTitle: "Jack F. へのお問い合わせ",
    title: "お問い合わせ",
    subtitle:
      "ご都合のよい方法であれば、どのようなご質問にも喜んでお答えします。",
    section1title: "面談可能時間",
    section1subtitle:
      "下記の時間帯であれば、短時間のミーティングを比較的柔軟に調整できます。",
    intro:
      "緑色の部分は、私の主な空き時間を示しています（ニューヨーク時間、EST/EDT）。この時間帯以外をご希望の場合は、メールでお知らせください。可能な限り調整いたします。",
    availability: {
      alt: "週ごとの空き時間を示したカレンダーのスナップショット。緑色のブロックが空いている時間帯を示しています。",
      description: "通常の空き時間を示した週次スナップショット。",
      timezoneHref: "https://www.timeanddate.com/worldclock/usa/new-york",
      timezoneLabel: "現在のニューヨーク時刻を確認する"
    },
    slots: [
      {
        title: "ポートフォリオの概要ご説明",
        description:
          "サイト全体や技術スタックの概要を手短にご紹介し、ご希望があれば職務経歴書、テレメトリ、プロジェクトマネジメントなど、詳しくお聞きになりたい点を深掘りします。"
      },
      {
        title: "プロジェクトの深掘り",
        description:
          "Rollodex、Quester2000、各種 MOD など、特定のプロジェクトを一つ選び、トレードオフやスケジュール、得られた知見について集中的に議論します。"
      },
      {
        title: "オープン Q&A",
        description:
          "技術的な課題についてセカンドオピニオンが欲しい場合や、ざっくばらんにお話ししたいだけの場合でも歓迎です。正式なアジェンダがなくても問題ありません。このような場合は、メールなどの非同期コミュニケーションの方が適しているかもしれません。"
      }
    ],
    contactLabel: "日程確認用メール: jfstone2000@proton.me",
    contactHref: "mailto:jfstone2000@proton.me",
    contactNote:
      "複数のメッセージングプラットフォームに対応可能です。ご都合のよいツールをご提案ください。通常、24時間以内に非同期でご返信いたします。"
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
        role: "Co-lead fullstack developer",
        timeframe: "2023–2024 (capstone)",
        summary: "Co-led a remote fullstack development team, developing a contact management tool. Took ownership of API/data integrations and accessibility, while maintaining the repo as Git master across two-week Scrum releases.",
        highlights: [
          "Designed APIs and database schemas, templated forms, and rebuilt search/filter UI.",
          "Cut search latency from ~5s to ~200ms while maintaining repo practices, docs, and two-week sprints."
        ]
      },
      {
        id: "ser321",
        company: "SER321 (TA)",
        role: "Undergraduate TA for SER 321 (Distributed Software Systems)",
        timeframe: "March – May 2024",
        summary: "Designed and coded an assignment (“Wheel of Fortune” Java server supporting a dynamic amount of concurrent clients). Mentored students in designing distributed systems hosted on AWS and debugging client-server architectures.",
        highlights: [
          "Actively answered student questions on Slack discussion boards, and hosted office hours once per week.",
          "Assisted in debugging complex issues with code logic, networking, threading, AWS deployment, Ubuntu, and virtualization."
        ]
      },
      {
        id: "stellaris-mods-project",
        company: "Freelance / Mods",
        role: "Mod developer (Stellaris & Minecraft)",
        timeframe: "Ongoing",
        summary: "Maintain a handful of Minecraft and Stellaris mods plus high performnce heavily modded private servers.",
        highlights: [
          "Built custom mod features and balance tweaks for Stellaris and Minecraft.",
          "Operate game servers and customize modpacks with ongoing profiling and tuning."
        ]
      },
    ],
    techStack: DEFAULT_TECH_STACK_DETAILS
  },
  meetings: {
    metadataTitle: "Jack F. 联系",
    title: "联系",
    subtitle:
      "欢迎通过适合您的任何方式联系我，我很乐意回答您的任何问题。",
    section1title: "可会面时间",
    section1subtitle:
      "我通常可以在下列时间段安排一次简短的会面。",
    intro:
      "绿色区域表示我常见的可用时间（纽约时间，EST/EDT）。如果您需要其他时间段，请发邮件告诉我，我会尽量配合安排。",
    availability: {
      alt: "显示每周可用时间的日历快照，绿色方块标出可约时间。",
      description: "常见可用时间的每周快照。",
      timezoneHref: "https://www.timeanddate.com/worldclock/usa/new-york",
      timezoneLabel: "查看当前纽约时间"
    },
    slots: [
      {
        title: "作品集导览",
        description:
          "一起快速浏览网站、技术栈，以及您希望我重点展开介绍的部分（简历、数据/遥测、项目管理等）。"
      },
      {
        title: "项目深度交流",
        description:
          "围绕某一个项目深入讨论，例如 Rollodex、Quester2000，或某个 Mod，一起聊聊权衡取舍、时间安排以及从中获得的经验和反思。"
      },
      {
        title: "开放式问答",
        description:
          "在技术问题上需要第二个意见，或者只是想随便聊聊？即使没有正式议程，我也很乐意帮忙。对于这种场景，异步沟通可能会更合适！"
      }
    ],
    contactLabel: "确认请发邮件至：jfstone2000@proton.me",
    contactHref: "mailto:jfstone2000@proton.me",
    contactNote:
      "我也使用多个消息平台，欢迎提出对您最方便的工具。一般情况下，您可以在 24 小时内收到异步回复。"
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
