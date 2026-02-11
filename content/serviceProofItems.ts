export type LocaleKey = "en" | "ja" | "zh";
export type Localized<T> = Record<LocaleKey, T>;

export type ProofCategory = "quick-fix" | "deployment" | "maintenance";

export type ImageRef = {
  src: string;
  alt: Localized<string>;
  caption?: Localized<string>;
};

export type LinkRef = {
  label: Localized<string>;
  href: string;
};

export type ServiceProofItem = {
  id: string;
  title: Localized<string>;
  category: ProofCategory;
  date: string;
  outcome_one_liner: Localized<string>;
  stack_tags: string[];
  problem: Localized<string[]>;
  solution: Localized<string[]>;
  before?: { bullets?: Localized<string[]>; images?: ImageRef[] };
  after?: { bullets?: Localized<string[]>; images?: ImageRef[] };
  artifacts?: {
    links?: LinkRef[];
    repo_or_pr?: LinkRef;
    notes?: Localized<string[]>;
  };
  timeline?: {
    kickoff?: string;
    delivery?: string;
    duration_business_days?: number;
    scope?: Localized<string>;
  };
  metrics?: {
    label: Localized<string>;
    before?: Localized<string>;
    after?: Localized<string>;
    note?: Localized<string>;
  }[];
  is_anonymized: boolean;
  client?: {
    name?: string;
    role?: Localized<string>;
    org?: Localized<string>;
    note?: Localized<string>;
  };
  testimonial_ids?: string[];
  mailto_subject?: Localized<string>;
};

export type ServiceTestimonial = {
  id: string;
  quote: Localized<string>;
  date: string;
  category?: ProofCategory;
  stack_tags?: string[];
  is_anonymized: boolean;
  client?: {
    name?: string;
    role?: Localized<string>;
    org?: Localized<string>;
    note?: Localized<string>;
  };
  related_proof_id?: string;
};

export const serviceProofItems: ServiceProofItem[] = [
  {
    id: "qf-001",
    title: {
      en: "Mobile checkout CTA restored",
      ja: "モバイル購入CTAを復旧",
      zh: "移动端结账CTA恢复"
    },
    category: "quick-fix",
    date: "2025-11",
    outcome_one_liner: {
      en: "Checkout button became visible and tappable across mobile breakpoints.",
      ja: "モバイルで購入ボタンが表示・タップ可能になりました。",
      zh: "结账按钮在移动端重新可见并可点击。"
    },
    stack_tags: ["Next.js", "Tailwind CSS", "Vercel"],
    problem: {
      en: [
        "Sticky footer covered the checkout CTA on iOS Safari.",
        "Tap target failed accessibility sizing checks.",
        "Cart errors increased after a content update."
      ],
      ja: [
        "iOS Safariで固定フッターがCTAを覆っていた。",
        "タップ領域がアクセシビリティのサイズ基準を満たしていなかった。",
        "コンテンツ更新後にカートエラーが増加。"
      ],
      zh: [
        "iOS Safari 上的固定页脚遮挡了结账CTA。",
        "点击区域未通过可访问性尺寸检查。",
        "内容更新后购物车错误增加。"
      ]
    },
    solution: {
      en: [
        "Adjusted layout stacking context and safe-area padding.",
        "Expanded tap target sizing and spacing.",
        "Added a quick regression checklist and notes."
      ],
      ja: [
        "重なり順とセーフエリア余白を調整。",
        "タップ領域のサイズと間隔を拡大。",
        "簡易回帰チェックとメモを追加。"
      ],
      zh: [
        "调整了层级关系与安全区域内边距。",
        "扩大了点击区域尺寸与间距。",
        "补充了快速回归检查与说明。"
      ]
    },
    before: {
      bullets: {
        en: [
          "CTA hidden below fold on iPhone 13.",
          "Checkout required a zoom gesture to tap."
        ],
        ja: [
          "iPhone 13でCTAが画面下に隠れていた。",
          "タップにはズームが必要だった。"
        ],
        zh: [
          "iPhone 13 上CTA被折叠在屏幕下方。",
          "点击需要缩放页面。"
        ]
      }
    },
    after: {
      bullets: {
        en: [
          "CTA visible above the sticky footer.",
          "Tap target passes sizing guidelines."
        ],
        ja: [
          "CTAが固定フッターの上に表示。",
          "タップ領域がサイズ基準を通過。"
        ],
        zh: [
          "CTA显示在固定页脚上方。",
          "点击区域符合尺寸规范。"
        ]
      }
    },
    artifacts: {
      notes: {
        en: ["Before/after screenshots and change notes shared privately."],
        ja: ["修正前後のスクリーンショットと変更メモを共有。"],
        zh: ["已私下分享前后对比截图与变更说明。"]
      }
    },
    timeline: {
      kickoff: "2025-11-04",
      delivery: "2025-11-06",
      duration_business_days: 2,
      scope: {
        en: "3 fixes, 1 revision.",
        ja: "3件の修正、1回のレビュー。",
        zh: "3项修复，1次复核。"
      }
    },
    metrics: [
      {
        label: {
          en: "Checkout errors",
          ja: "チェックアウトエラー",
          zh: "结账错误率"
        },
        before: {
          en: "6.2%",
          ja: "6.2%",
          zh: "6.2%"
        },
        after: {
          en: "1.1%",
          ja: "1.1%",
          zh: "1.1%"
        },
        note: {
          en: "Measured over 7 days after deployment.",
          ja: "リリース後7日間の計測。",
          zh: "上线后7天统计。"
        }
      }
    ],
    is_anonymized: true,
    client: {
      note: {
        en: "Anonymous, small ecommerce shop.",
        ja: "匿名の小規模EC。",
        zh: "匿名小型电商。"
      }
    },
    testimonial_ids: ["t-001"]
  },
  {
    id: "dep-002",
    title: {
      en: "Deployment pipeline + rollback notes",
      ja: "デプロイ手順とロールバックメモ",
      zh: "部署流水线与回滚说明"
    },
    category: "deployment",
    date: "2025-08",
    outcome_one_liner: {
      en: "Deployments became repeatable with monitoring and rollback steps.",
      ja: "監視とロールバック手順を備えた再現可能なデプロイになりました。",
      zh: "部署流程可重复，并加入监控与回滚步骤。"
    },
    stack_tags: ["Docker", "NGINX", "AWS", "GitHub Actions"],
    problem: {
      en: [
        "Manual SSH deploys caused drift between servers.",
        "SSL renewals were inconsistent and risked downtime.",
        "No shared runbook for on-call handoffs."
      ],
      ja: [
        "手動SSHデプロイでサーバー間の差分が発生していた。",
        "SSL更新が不安定でダウンタイムのリスクがあった。",
        "引き継ぎ用の共有ランブックがなかった。"
      ],
      zh: [
        "手动SSH部署导致服务器间配置漂移。",
        "SSL续期不稳定，存在停机风险。",
        "缺少值班交接用的运行手册。"
      ]
    },
    solution: {
      en: [
        "Automated container build + deploy pipeline.",
        "Configured SSL automation, headers, and health checks.",
        "Wrote a concise runbook with rollback steps."
      ],
      ja: [
        "コンテナビルドとデプロイを自動化。",
        "SSL自動更新、ヘッダー、ヘルスチェックを設定。",
        "ロールバック手順付きの短いランブックを作成。"
      ],
      zh: [
        "自动化容器构建与部署流水线。",
        "配置SSL自动化、响应头与健康检查。",
        "编写包含回滚步骤的简明手册。"
      ]
    },
    before: {
      bullets: {
        en: [
          "Deploys required manual server changes.",
          "No single source of truth for configs."
        ],
        ja: [
          "デプロイ時に手動のサーバー変更が必要だった。",
          "設定の単一ソースがなかった。"
        ],
        zh: [
          "部署需要手动修改服务器。",
          "配置没有统一的来源。"
        ]
      }
    },
    after: {
      bullets: {
        en: [
          "One-click deploy with versioned config.",
          "Runbook documented rollback and alert checks."
        ],
        ja: [
          "バージョン管理された設定でワンクリックデプロイ。",
          "ランブックにロールバックとアラート確認を記載。"
        ],
        zh: [
          "版本化配置的一键部署。",
          "手册记录了回滚和告警检查。"
        ]
      }
    },
    artifacts: {
      notes: {
        en: ["Runbook excerpt and deployment checklist delivered."],
        ja: ["ランブック抜粋とデプロイチェックリストを納品。"],
        zh: ["已交付运行手册节选与部署清单。"]
      }
    },
    timeline: {
      kickoff: "2025-08-12",
      delivery: "2025-08-20",
      duration_business_days: 6,
      scope: {
        en: "Deployment pipeline, SSL automation, runbook.",
        ja: "デプロイパイプライン、SSL自動化、ランブック。",
        zh: "部署流水线、SSL自动化、运行手册。"
      }
    },
    metrics: [
      {
        label: {
          en: "Deploy time",
          ja: "デプロイ時間",
          zh: "部署时间"
        },
        before: {
          en: "45 minutes",
          ja: "45分",
          zh: "45分钟"
        },
        after: {
          en: "12 minutes",
          ja: "12分",
          zh: "12分钟"
        },
        note: {
          en: "Median time across first 3 deployments.",
          ja: "最初の3回のデプロイ中央値。",
          zh: "前三次部署的中位数。"
        }
      }
    ],
    is_anonymized: true,
    client: {
      note: {
        en: "Anonymous, small SaaS team.",
        ja: "匿名の小規模SaaSチーム。",
        zh: "匿名小型SaaS团队。"
      }
    },
    testimonial_ids: ["t-002"]
  },
  {
    id: "mnt-003",
    title: {
      en: "Monthly maintenance + performance tune-up",
      ja: "月次メンテナンスと性能調整",
      zh: "月度维护与性能调整"
    },
    category: "maintenance",
    date: "2024-12",
    outcome_one_liner: {
      en: "Site stability improved and key pages loaded faster.",
      ja: "安定性が向上し、主要ページの読み込みが高速化しました。",
      zh: "网站稳定性提升，关键页面加载更快。"
    },
    stack_tags: ["WordPress", "Cloudflare", "PHP"],
    problem: {
      en: [
        "Largest images were not optimized for mobile.",
        "Plugin updates occasionally broke layout.",
        "No monitoring or weekly checks."
      ],
      ja: [
        "大きな画像がモバイル向けに最適化されていなかった。",
        "プラグイン更新でレイアウトが崩れることがあった。",
        "監視や週次チェックがなかった。"
      ],
      zh: [
        "最大图片未针对移动端优化。",
        "插件更新偶尔导致布局损坏。",
        "缺少监控与每周检查。"
      ]
    },
    solution: {
      en: [
        "Optimized images and cache headers.",
        "Staged plugin updates with rollback notes.",
        "Added uptime checks and monthly health note."
      ],
      ja: [
        "画像とキャッシュヘッダーを最適化。",
        "ロールバックメモ付きで更新を段階的に実施。",
        "稼働監視と月次ヘルスノートを追加。"
      ],
      zh: [
        "优化图片与缓存响应头。",
        "分阶段更新插件并记录回滚说明。",
        "增加正常运行监控与月度健康说明。"
      ]
    },
    before: {
      bullets: {
        en: ["LCP above 4s on mobile.", "Updates required emergency fixes."],
        ja: ["モバイルのLCPが4秒超。", "更新のたびに緊急対応が必要だった。"],
        zh: ["移动端LCP超过4秒。", "更新需要紧急修复。"]
      }
    },
    after: {
      bullets: {
        en: ["LCP reduced below 3s on key pages.", "Scheduled updates with documented rollback."],
        ja: ["主要ページのLCPが3秒未満に改善。", "ロールバック手順付きで更新を実施。"],
        zh: ["关键页面LCP降至3秒以内。", "按计划更新并附回滚说明。"]
      }
    },
    artifacts: {
      notes: {
        en: ["Monthly health note and before/after metrics shared."],
        ja: ["月次ヘルスノートと前後比較指標を共有。"],
        zh: ["已分享月度健康说明与前后对比指标。"]
      }
    },
    timeline: {
      kickoff: "2024-12-03",
      delivery: "2024-12-10",
      duration_business_days: 6,
      scope: {
        en: "4 fixes, monthly plan kickoff.",
        ja: "4件の修正、月次プラン開始。",
        zh: "4项修复，启动月度维护。"
      }
    },
    metrics: [
      {
        label: {
          en: "Largest Contentful Paint",
          ja: "LCP（Largest Contentful Paint）",
          zh: "最大内容绘制（LCP）"
        },
        before: {
          en: "4.2s",
          ja: "4.2秒",
          zh: "4.2秒"
        },
        after: {
          en: "2.6s",
          ja: "2.6秒",
          zh: "2.6秒"
        },
        note: {
          en: "Measured on mobile template pages.",
          ja: "モバイルのテンプレートページで計測。",
          zh: "移动端模板页测量。"
        }
      }
    ],
    is_anonymized: true,
    client: {
      note: {
        en: "Anonymous, local services business.",
        ja: "匿名の地域サービス業者。",
        zh: "匿名本地服务商。"
      }
    },
    testimonial_ids: ["t-003"]
  }
];
