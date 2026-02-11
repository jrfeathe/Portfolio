import type { ServiceTestimonial } from "./serviceProofItems";

export const serviceTestimonials: ServiceTestimonial[] = [
  {
    id: "t-001",
    quote: {
      en: "Clear update, fast turnaround, and the checkout issue finally stopped.",
      ja: "分かりやすい報告と迅速な対応で、決済の問題が止まりました。",
      zh: "说明清晰、速度很快，结账问题终于解决了。"
    },
    date: "2025-11",
    category: "quick-fix",
    stack_tags: ["Next.js"],
    is_anonymized: true,
    client: {
      role: {
        en: "Owner",
        ja: "オーナー",
        zh: "负责人"
      },
      org: {
        en: "Small ecommerce shop",
        ja: "小規模EC",
        zh: "小型电商"
      },
      note: {
        en: "Shared anonymously with permission.",
        ja: "許可のうえ匿名で共有。",
        zh: "经许可匿名分享。"
      }
    },
    related_proof_id: "qf-001"
  },
  {
    id: "t-002",
    quote: {
      en: "Deployment felt calm after the runbook and monitoring setup.",
      ja: "ランブックと監視が整い、デプロイが落ち着いて行えるようになりました。",
      zh: "有了运行手册和监控，部署变得从容。"
    },
    date: "2025-08",
    category: "deployment",
    stack_tags: ["Docker", "AWS"],
    is_anonymized: true,
    client: {
      role: {
        en: "Engineering lead",
        ja: "エンジニアリングリード",
        zh: "工程负责人"
      },
      org: {
        en: "Small SaaS team",
        ja: "小規模SaaSチーム",
        zh: "小型SaaS团队"
      },
      note: {
        en: "Shared anonymously with permission.",
        ja: "許可のうえ匿名で共有。",
        zh: "经许可匿名分享。"
      }
    },
    related_proof_id: "dep-002"
  },
  {
    id: "t-003",
    quote: {
      en: "Monthly check-ins kept our site stable and predictable.",
      ja: "月次チェックでサイト運用が安定しました。",
      zh: "每月检查让网站更稳定。"
    },
    date: "2024-12",
    category: "maintenance",
    stack_tags: ["WordPress"],
    is_anonymized: true,
    client: {
      role: {
        en: "Owner",
        ja: "オーナー",
        zh: "负责人"
      },
      org: {
        en: "Local services business",
        ja: "地域サービス業者",
        zh: "本地服务商"
      },
      note: {
        en: "Shared anonymously with permission.",
        ja: "許可のうえ匿名で共有。",
        zh: "经许可匿名分享。"
      }
    },
    related_proof_id: "mnt-003"
  }
];
