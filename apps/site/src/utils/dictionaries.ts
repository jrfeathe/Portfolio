import type { Locale } from "./i18n";

export type CtaVariant = "primary" | "secondary" | "ghost";

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
        description: string;
        actions: Array<{ label: string; variant: CtaVariant }>;
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
      title: "Portfolio",
      subtitle:
        "Blueprinting a recruiter-friendly experience that foregrounds measurable impact, operating rituals, and proof you can audit.",
      cta: {
        title: "Need proof fast?",
        description:
          "Grab the highlights, download artifacts, or book time to walk through the operating model.",
        actions: [
          { label: "View case studies", variant: "primary" },
          { label: "Download resume", variant: "secondary" },
          { label: "Book a 20-minute intro", variant: "ghost" }
        ]
      }
    },
    sections: {
      mission: {
        eyebrow: "Orientation",
        title: "Why this portfolio exists",
        description:
          "Give recruiters and hiring managers measurable proof of delivery, leadership, and operational maturity in under three clicks.",
        overview:
          "The portfolio initiative reframes a personal site as an operating system. Every artifact is instrumented so talent partners can quickly sample outcomes, delivery patterns, and working agreements.",
        bulletPoints: [
          "Documentation-first case studies with linked telemetry.",
          "Design system primitives shared across the app and print views.",
          "Automations that keep resume, notes, and demos in sync."
        ]
      },
      proof: {
        eyebrow: "Evidence",
        title: "Proof chips & supporting artifacts",
        description:
          "Each claim on the landing page links directly to proof so stakeholders can verify impact without booking a call.",
        overview:
          "Proof chips map key promises to tangible evidence: recorded demos, performance dashboards, stakeholder quotes, and delivery matrices.",
        proofChips: [
          {
            title: "Shipping velocity",
            details:
              "DORA metrics exported weekly with regression alerts surfaced on the site."
          },
          {
            title: "Leadership range",
            details:
              "Case studies document org design choices, trade-off memos, and stakeholder alignment rituals."
          },
          {
            title: "Operational excellence",
            details:
              "Playbooks cover rollout gates, observability baselines, and incident response posture."
          },
          {
            title: "Hiring enablement",
            details:
              "Recruiter skim mode aggregates eligibility, timezone, compensation guardrails, and references."
          }
        ]
      },
      roadmap: {
        eyebrow: "Roadmap",
        title: "What ships next",
        description:
          "The Essential WBS guides delivery so the experience lands in iterative, verifiable slices.",
        overview:
          "Design system foundations are in place. Next milestones add localized content, MDX-based engineering notes, and Lighthouse-backed CI.",
        nextSteps: [
          "Publish recruiter skim matrix with structured data for search.",
          "Wire i18n routing with English, Japanese, and Chinese toggles.",
          "Introduce MDX pipeline for engineering notes and diagrams."
        ]
      }
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
      title: "ポートフォリオ",
      subtitle:
        "測定可能な成果、運用リズム、検証できる証跡を前面に出し、採用担当者にとって使いやすい体験を設計しています。",
      cta: {
        title: "証跡がすぐに必要ですか？",
        description:
          "ハイライトをまとめて確認し、成果物をダウンロードするか、オペレーティングモデルを説明する時間を予約してください。",
        actions: [
          { label: "ケーススタディを見る", variant: "primary" },
          { label: "履歴書をダウンロード", variant: "secondary" },
          { label: "20分の導入ミーティングを予約", variant: "ghost" }
        ]
      }
    },
    sections: {
      mission: {
        eyebrow: "オリエンテーション",
        title: "このポートフォリオの目的",
        description:
          "リクルーターと採用マネージャーが、3クリック以内で成果・リーダーシップ・運用成熟度を測れるようにします。",
        overview:
          "このポートフォリオ施策は、個人サイトをオペレーティングシステムとして再構築したものです。各成果物に計測機能を組み込み、タレントパートナーが成果や働き方をすばやく確認できます。",
        bulletPoints: [
          "テレメトリーと連動したドキュメント主導のケーススタディ。",
          "アプリと印刷ビューで共通化されたデザインシステムのプリミティブ。",
          "履歴書・ノート・デモを同期し続ける自動化。"
        ]
      },
      proof: {
        eyebrow: "エビデンス",
        title: "証跡チップと関連アーティファクト",
        description:
          "ランディングページの主張ごとに直接証跡へリンクし、打ち合わせ不要でインパクトを検証できます。",
        overview:
          "証跡チップは主要な約束を具体的なエビデンスに対応付けます。収録済みデモ、パフォーマンスダッシュボード、ステークホルダーの声、デリバリーマトリクスなどです。",
        proofChips: [
          {
            title: "出荷速度",
            details:
              "DORA 指標を毎週エクスポートし、回帰アラートをサイト上で可視化します。"
          },
          {
            title: "リーダーシップの幅",
            details:
              "ケーススタディで組織設計の意思決定、トレードオフメモ、ステークホルダー調整の儀式を記録します。"
          },
          {
            title: "オペレーショナル・エクセレンス",
            details:
              "導入ゲート、観測可能性のベースライン、インシデント対応姿勢をカバーするプレイブック。"
          },
          {
            title: "採用支援",
            details:
              "リクルーター向けスキムモードで、応募要件、タイムゾーン、報酬基準、推薦情報を集約します。"
          }
        ]
      },
      roadmap: {
        eyebrow: "ロードマップ",
        title: "これから提供するもの",
        description:
          "Essential WBS に沿って、検証可能なスライスで体験をリリースします。",
        overview:
          "デザインシステムの基盤は整いました。次のマイルストーンではローカライズされたコンテンツ、MDX ベースのエンジニアリングノート、Lighthouse による CI を追加します。",
        nextSteps: [
          "検索向けの構造化データ付きで、リクルーター向けスキムマトリクスを公開。",
          "英語・日本語・中国語のトグルで i18n ルーティングを配線。",
          "エンジニアリングノートとダイアグラムのための MDX パイプラインを導入。"
        ]
      }
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
    description: "展示工程成果與實驗的個人項目中樞。"
  },
  home: {
    breadcrumbs: {
      home: "首頁",
      workspace: "工作區總覽"
    },
    hero: {
      title: "作品集",
      subtitle:
        "打造讓招募方快速理解的體驗，突出可量化的影響、運營節奏，以及可驗證的證據。",
      cta: {
        title: "需要立即取得證據嗎？",
        description:
          "快速查看重點、下載成果物，或預約時間深入介紹整體運作模式。",
        actions: [
          { label: "查看案例研究", variant: "primary" },
          { label: "下載履歷", variant: "secondary" },
          { label: "預約 20 分鐘會談", variant: "ghost" }
        ]
      }
    },
    sections: {
      mission: {
        eyebrow: "導覽",
        title: "這份作品集的定位",
        description:
          "讓招募與用人主管在三次點擊內，就能看到交付成果、領導力，以及運營成熟度。",
        overview:
          "這個作品集計畫把個人網站重新定義為一套操作系統。每個成果物都內建量測，協助招募夥伴快速了解成果、交付節奏與合作方式。",
        bulletPoints: [
          "以文件為先的案例研究，並附上可追蹤的遙測資料。",
          "在網站與列印視圖之間共用的設計系統元件。",
          "自動化流程確保履歷、筆記與展示保持同步。"
        ]
      },
      proof: {
        eyebrow: "證據",
        title: "證據晶片與支援性素材",
        description:
          "著陸頁上的每項主張都直接連到證據，讓利害關係人無需預約就能驗證影響力。",
        overview:
          "證據晶片把關鍵承諾映射到具體素材：錄製的示範、效能儀表板、利害關係人引言與交付矩陣。",
        proofChips: [
          {
            title: "交付速度",
            details: "每週輸出 DORA 指標，並在站點上顯示回歸警報。"
          },
          {
            title: "領導廣度",
            details:
              "案例研究記錄組織設計決策、權衡備忘錄與利害關係人對齊流程。"
          },
          {
            title: "營運卓越",
            details: "操作手冊涵蓋上線關卡、可觀測性基準與事件回應作法。"
          },
          {
            title: "招募賦能",
            details:
              "招募者快速瀏覽模式整合任用條件、時區、薪酬範圍與推薦資訊。"
          }
        ]
      },
      roadmap: {
        eyebrow: "路線圖",
        title: "下一步計畫",
        description:
          "依照 Essential WBS，以可驗證的切片逐步發佈完整體驗。",
        overview:
          "設計系統基礎已就緒。接下來的里程碑會加入在地化內容、基於 MDX 的工程筆記，以及 Lighthouse 驗證的 CI。",
        nextSteps: [
          "公開招募者瀏覽矩陣，並提供搜尋用的結構化資料。",
          "串接支援英文、日文、中文的國際化路由與切換器。",
          "為工程筆記與圖表導入 MDX 流程。"
        ]
      }
    }
  },
  notes: {
    index: {
      title: "工程筆記",
      subtitle:
        "延伸說明本作品集背後的交付決策、監測手法，以及合作共識。",
      empty: "筆記即將發布。"
    },
    detail: {
      backLabel: "返回筆記",
      tocLabel: "頁面導覽"
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
