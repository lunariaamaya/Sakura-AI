"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"

export type Locale = "zh" | "en"

interface I18nContextType {
  locale: Locale
  t: (key: string) => string
  toggleLocale: () => void
}

const translations: Record<Locale, Record<string, string>> = {
  zh: {
    "nav.features": "核心功能",
    "nav.showcase": "案例展示",
    "nav.reviews": "用户评价",
    "nav.faq": "常见问题",
    "nav.pricing": "价格方案",
    "nav.start": "开始使用",
    "nav.signIn": "登录",
    "nav.signOut": "退出登录",
    "nav.account": "账户",
    "nav.credits": "积分",

    "hero.badge": "AI 图像编辑器 - 全新上线",
    "hero.title": "用简单文本",
    "hero.title2": "变换任意图片",
    "hero.desc": "Sakura AI 的先进模型可用自然语言完成图像编辑，并在角色一致性与场景保留方面表现出色。",
    "hero.cta": "开始编辑",
    "hero.cta2": "查看案例",

    "editor.title": "AI 编辑器",
    "editor.subtitle": "体验强大的自然语言图像编辑能力，用简单指令快速改图。",
    "editor.tab.img2img": "图生图",
    "editor.tab.txt2img": "文生图",
    "editor.model": "AI 模型",
    "editor.upload": "上传参考图",
    "editor.upload.hint": "点击或拖拽上传图片，最大 10MB",
    "editor.upload.formats": "支持 JPG、PNG、WebP",
    "editor.prompt": "输入提示词",
    "editor.prompt.placeholder": "描述你想要的编辑效果，例如：把背景换成雪山...",
    "editor.generate": "生成",
    "editor.generating": "生成中...",
    "editor.output": "输出图库",
    "editor.output.ready": "准备就绪",
    "editor.output.desc": "输入提示词后即可生成图片",
    "editor.remove": "移除图片",
    "editor.addImage": "添加图片",
    "editor.generateNow": "立即生成",
    "editor.rechargeNow": "立即充值",
    "editor.error.authCheck": "账户状态校验失败，请稍后重试。",
    "editor.error.insufficient": "积分不足，请充值后重试。",
    "editor.error.generate": "生成失败，请稍后重试。",
    "editor.error.noImages": "模型未返回图片结果。",
    "editor.uploadedAlt": "已上传参考图",
    "editor.generatedAlt": "生成结果",

    "features.label": "核心功能",
    "features.title": "为什么选择 Sakura AI？",
    "features.desc": "最先进的 AI 图像编辑器，用自然语言重塑你的创作流程。",
    "features.1.title": "自然语言编辑",
    "features.1.desc": "像聊天一样编辑图片，AI 能理解复杂指令。",
    "features.2.title": "角色一致性",
    "features.2.desc": "编辑过程保持角色细节一致，擅长保留人脸与身份特征。",
    "features.3.title": "场景保留",
    "features.3.desc": "编辑内容与原始背景自然融合，画面更真实。",
    "features.4.title": "一步到位",
    "features.4.desc": "单次尝试就能获得高质量结果，减少反复调整。",
    "features.5.title": "多图上下文",
    "features.5.desc": "支持多图协同编辑，满足更复杂的工作流。",
    "features.6.title": "AI 内容创作",
    "features.6.desc": "可用于社媒、营销等场景的稳定内容生产。",

    "showcase.label": "案例展示",
    "showcase.title": "闪电般的 AI 创作",
    "showcase.desc": "看看 Sakura AI 在毫秒级生成的作品",
    "showcase.speed": "极速生成",
    "showcase.1.title": "超快山景生成",
    "showcase.1.desc": "使用 Sakura AI 优化模型在 0.8 秒内完成",
    "showcase.2.title": "即时花园创作",
    "showcase.2.desc": "复杂场景在毫秒级完成渲染",
    "showcase.3.title": "实时海滩合成",
    "showcase.3.desc": "快速产出高真实感结果",
    "showcase.4.title": "极光快速生成",
    "showcase.4.desc": "高级视觉效果即时处理",
    "showcase.cta": "亲自体验 Sakura AI",

    "reviews.label": "用户评价",
    "reviews.title": "创作者怎么说",
    "reviews.1.name": "AI 创作者",
    "reviews.1.role": "数字内容作者",
    "reviews.1.text": "这个编辑器明显提升了我的工作效率，角色一致性非常稳定。",
    "reviews.2.name": "内容创作者",
    "reviews.2.role": "UGC 专家",
    "reviews.2.text": "做一致性人物内容更轻松，细节保留非常好。",
    "reviews.3.name": "图片编辑师",
    "reviews.3.role": "专业修图",
    "reviews.3.text": "场景融合效果自然，一次出图成功率很高。",

    "faq.label": "常见问题",
    "faq.title": "常见问题解答",
    "faq.1.q": "什么是 Sakura AI？",
    "faq.1.a": "Sakura AI 是一款可用自然语言进行图像编辑的模型，擅长一致性与场景保留。",
    "faq.2.q": "它如何工作？",
    "faq.2.a": "上传图片并输入提示词，AI 会理解你的编辑意图并生成结果。",
    "faq.3.q": "可以商用吗？",
    "faq.3.a": "可以，适合 UGC、社媒和营销素材生产。",
    "faq.4.q": "支持哪些编辑？",
    "faq.4.a": "包括背景替换、对象增删、风格迁移、人物细节调整等。",
    "faq.5.q": "在哪里体验 Sakura AI？",
    "faq.5.a": "可直接在网页中上传图片并输入提示词体验。",

    "footer.desc": "先进的 AI 图像编辑器，用简单文本即可变换任意图片。",
    "footer.product": "产品",
    "footer.editor": "AI 编辑器",
    "footer.generator": "图像生成",
    "footer.pricing": "价格方案",
    "footer.company": "公司",
    "footer.about": "关于我们",
    "footer.blog": "博客",
    "footer.careers": "加入我们",
    "footer.legal": "法律",
    "footer.privacy": "隐私政策",
    "footer.terms": "服务条款",
    "footer.rights": "保留所有权利。",
  },
  en: {
    "nav.features": "Features",
    "nav.showcase": "Showcase",
    "nav.reviews": "Reviews",
    "nav.faq": "FAQ",
    "nav.pricing": "Pricing",
    "nav.start": "Get Started",
    "nav.signIn": "Sign in",
    "nav.signOut": "Sign out",
    "nav.account": "Account",
    "nav.credits": "credits",

    "hero.badge": "AI Image Editor - Now Live",
    "hero.title": "Transform Any Image",
    "hero.title2": "With Simple Text",
    "hero.desc": "Sakura AI's advanced AI model delivers consistent character editing and scene preservation with simple text prompts. Experience the future of AI image editing.",
    "hero.cta": "Start Editing",
    "hero.cta2": "View Examples",

    "editor.title": "AI Editor",
    "editor.subtitle": "Experience the power of AI natural language image editing. Transform any photo with simple text commands.",
    "editor.tab.img2img": "Image to Image",
    "editor.tab.txt2img": "Text to Image",
    "editor.model": "AI Model",
    "editor.upload": "Upload Reference Image",
    "editor.upload.hint": "Click or drag to upload, max 10MB",
    "editor.upload.formats": "Supports JPG, PNG, WebP",
    "editor.prompt": "Enter Prompt",
    "editor.prompt.placeholder": "Describe the edit you want, e.g.: change background to snowy mountains...",
    "editor.generate": "Generate",
    "editor.generating": "Generating...",
    "editor.output": "Output Gallery",
    "editor.output.ready": "Ready",
    "editor.output.desc": "Enter a prompt and unleash the power of AI",
    "editor.remove": "Remove image",
    "editor.addImage": "Add Image",
    "editor.generateNow": "Generate Now",
    "editor.rechargeNow": "Recharge now",
    "editor.error.authCheck": "Failed to verify account state. Please try again.",
    "editor.error.insufficient": "Insufficient credits. Please recharge and try again.",
    "editor.error.generate": "Generate failed. Please try again.",
    "editor.error.noImages": "No images returned by model.",
    "editor.uploadedAlt": "Uploaded reference",
    "editor.generatedAlt": "Generated image",

    "features.label": "Core Features",
    "features.title": "Why Choose Sakura AI?",
    "features.desc": "The most advanced AI image editor. Revolutionize your photo editing with natural language understanding.",
    "features.1.title": "Natural Language Editing",
    "features.1.desc": "Edit images using simple text prompts. AI understands complex instructions like GPT for images.",
    "features.2.title": "Character Consistency",
    "features.2.desc": "Maintain perfect character details across edits. Excels at preserving faces and identities.",
    "features.3.title": "Scene Preservation",
    "features.3.desc": "Seamlessly blend edits with original backgrounds. Superior scene fusion capability.",
    "features.4.title": "One-Shot Editing",
    "features.4.desc": "Perfect results in a single attempt. Effortlessly solve one-shot image editing challenges.",
    "features.5.title": "Multi-Image Context",
    "features.5.desc": "Process multiple images simultaneously. Support for advanced multi-image editing workflows.",
    "features.6.title": "AI Content Creation",
    "features.6.desc": "Create consistent AI content. Perfect for social media and marketing campaigns.",

    "showcase.label": "Showcase",
    "showcase.title": "Lightning-Fast AI Creations",
    "showcase.desc": "See what Sakura AI generates in milliseconds",
    "showcase.speed": "Ultra Fast",
    "showcase.1.title": "Ultra-Fast Mountain Generation",
    "showcase.1.desc": "Created in 0.8 seconds with Sakura AI's optimized neural engine",
    "showcase.2.title": "Instant Garden Creation",
    "showcase.2.desc": "Complex scene rendered in milliseconds using Sakura AI technology",
    "showcase.3.title": "Real-time Beach Synthesis",
    "showcase.3.desc": "Sakura AI delivers photorealistic results at lightning speed",
    "showcase.4.title": "Rapid Aurora Generation",
    "showcase.4.desc": "Advanced effects processed instantly with Sakura AI",
    "showcase.cta": "Try Sakura AI Yourself",

    "reviews.label": "User Reviews",
    "reviews.title": "What Creators Are Saying",
    "reviews.1.name": "AIArtistPro",
    "reviews.1.role": "Digital Creator",
    "reviews.1.text": "This editor completely changed my workflow. The character consistency is incredible.",
    "reviews.2.name": "ContentCreator",
    "reviews.2.role": "UGC Specialist",
    "reviews.2.text": "Creating consistent AI influencers has never been easier. It keeps face details across edits.",
    "reviews.3.name": "PhotoEditor",
    "reviews.3.role": "Professional Editor",
    "reviews.3.text": "One-shot editing is close to solved with this tool. Scene blending feels natural.",

    "faq.label": "FAQ",
    "faq.title": "Frequently Asked Questions",
    "faq.1.q": "What is Sakura AI?",
    "faq.1.a": "A powerful AI image editing model that transforms photos with natural language prompts.",
    "faq.2.q": "How does it work?",
    "faq.2.a": "Upload an image and describe your edits. The model understands your instructions and generates results.",
    "faq.3.q": "Can I use it for commercial projects?",
    "faq.3.a": "Yes. It is suitable for UGC, social media campaigns, and marketing assets.",
    "faq.4.q": "What types of edits can it handle?",
    "faq.4.a": "Background swaps, object edits, style transfer, character refinements, and more.",
    "faq.5.q": "Where can I try Sakura AI?",
    "faq.5.a": "Use the web editor directly: upload an image, enter a prompt, and generate.",

    "footer.desc": "Advanced AI image editor. Transform any image with simple text prompts.",
    "footer.product": "Product",
    "footer.editor": "AI Editor",
    "footer.generator": "Image Generator",
    "footer.pricing": "Pricing",
    "footer.company": "Company",
    "footer.about": "About",
    "footer.blog": "Blog",
    "footer.careers": "Careers",
    "footer.legal": "Legal",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.rights": "All rights reserved.",
  },
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const LOCALE_STORAGE_KEY = "sakura-locale"
const LOCALE_COOKIE_KEY = "sakura-locale"

function isLocale(value: string | null | undefined): value is Locale {
  return value === "zh" || value === "en"
}

export function I18nProvider({
  children,
  initialLocale = "en",
}: {
  children: ReactNode
  initialLocale?: Locale
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale)

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isLocale(storedLocale) && storedLocale !== initialLocale) {
      setLocale(storedLocale)
      return
    }

    const localeFromCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${LOCALE_COOKIE_KEY}=`))
      ?.split("=")[1]

    if (isLocale(localeFromCookie) && localeFromCookie !== initialLocale) {
      setLocale(localeFromCookie)
    }
  }, [initialLocale])

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`
  }, [locale])

  const t = useCallback(
    (key: string) => {
      return translations[locale][key] || key
    },
    [locale],
  )

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === "zh" ? "en" : "zh"))
  }, [])

  return (
    <I18nContext.Provider value={{ locale, t, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
