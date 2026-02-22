"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

type Locale = "zh" | "en"

interface I18nContextType {
  locale: Locale
  t: (key: string) => string
  toggleLocale: () => void
}

const translations: Record<Locale, Record<string, string>> = {
  zh: {
    // Nav
    "nav.features": "核心功能",
    "nav.showcase": "案例展示",
    "nav.reviews": "用户评价",
    "nav.faq": "常见问题",
    "nav.pricing": "价格方案",
    "nav.start": "开始使用",

    // Hero
    "hero.badge": "AI 图像编辑器 - 全新上线",
    "hero.title": "用文字指令",
    "hero.title2": "变换任何图像",
    "hero.desc": "Sakura AI 先进的 AI 模型，以简洁的文字提示实现图像编辑，在角色一致性和场景保留方面表现卓越。体验 AI 图像编辑的未来。",
    "hero.cta": "开始编辑",
    "hero.cta2": "查看案例",

    // Editor
    "editor.title": "AI 编辑器",
    "editor.subtitle": "体验强大的 AI 自然语言图像编辑能力，用简单的文字指令变换任何照片",
    "editor.tab.img2img": "图生图",
    "editor.tab.txt2img": "文生图",
    "editor.model": "AI 模型",
    "editor.upload": "上传参考图片",
    "editor.upload.hint": "点击或拖拽上传图片，最大 10MB",
    "editor.upload.formats": "支持 JPG, PNG, WebP 格式",
    "editor.prompt": "输入提示词",
    "editor.prompt.placeholder": "描述你想要的编辑效果，例如：把背景换成雪山...",
    "editor.generate": "生成图像",
    "editor.generating": "生成中...",
    "editor.output": "输出画廊",
    "editor.output.ready": "准备就绪",
    "editor.output.desc": "输入提示词，释放 AI 的力量",
    "editor.remove": "移除图片",

    // Features
    "features.label": "核心功能",
    "features.title": "为什么选择 Sakura AI？",
    "features.desc": "Sakura AI 是最先进的 AI 图像编辑器，以自然语言理解彻底革新你的照片编辑体验",
    "features.1.title": "自然语言编辑",
    "features.1.desc": "使用简单的文字提示编辑图像，AI 能像 GPT 一样理解复杂的编辑指令",
    "features.2.title": "角色一致性",
    "features.2.desc": "在编辑过程中保持完美的角色细节，擅长保留人脸和身份特征",
    "features.3.title": "场景融合",
    "features.3.desc": "无缝融合编辑内容与原始背景，卓越的场景融合能力",
    "features.4.title": "一步到位",
    "features.4.desc": "单次尝试即可获得完美结果，轻松解决一次性图像编辑挑战",
    "features.5.title": "多图上下文",
    "features.5.desc": "同时处理多张图片，支持高级多图编辑工作流",
    "features.6.title": "AI 内容创作",
    "features.6.desc": "创建一致的 AI 内容，完美适用于社交媒体和营销推广",

    // Showcase
    "showcase.label": "案例展示",
    "showcase.title": "闪电般的 AI 创作",
    "showcase.desc": "看看 Sakura AI 在毫秒内生成的惊艳作品",
    "showcase.speed": "极速生成",
    "showcase.1.title": "超快速山景生成",
    "showcase.1.desc": "使用 Sakura AI 优化的神经引擎在 0.8 秒内创建",
    "showcase.2.title": "即时花园创作",
    "showcase.2.desc": "使用 Sakura AI 技术在毫秒内渲染复杂场景",
    "showcase.3.title": "实时海滩合成",
    "showcase.3.desc": "Sakura AI 以闪电般的速度交付逼真的效果",
    "showcase.4.title": "快速极光生成",
    "showcase.4.desc": "使用 Sakura AI AI 即时处理高级视觉效果",
    "showcase.cta": "亲自体验 Sakura AI",

    // Reviews
    "reviews.label": "用户评价",
    "reviews.title": "创作者们怎么说",
    "reviews.1.name": "艺术创作者",
    "reviews.1.role": "数字创作者",
    "reviews.1.text": "这个编辑器彻底改变了我的工作流程。角色一致性令人难以置信，远超 Flux Kontext！",
    "reviews.2.name": "内容创作者",
    "reviews.2.role": "UGC 专家",
    "reviews.2.text": "创建一致的 AI 角色从未如此简单。它能在编辑过程中完美保留面部细节！",
    "reviews.3.name": "图片编辑师",
    "reviews.3.role": "专业编辑",
    "reviews.3.text": "一步编辑基本上已经被这个工具完美解决了。场景融合效果非常自然逼真！",

    // FAQ
    "faq.label": "常见问题",
    "faq.title": "常见问题解答",
    "faq.1.q": "什么是 Sakura AI？",
    "faq.1.a": "这是一款革命性的 AI 图像编辑模型，使用自然语言提示来变换照片。目前是可用的最强大的图像编辑模型，具有卓越的一致性，在角色编辑和场景保留方面表现优异。",
    "faq.2.q": "它是如何工作的？",
    "faq.2.a": "只需上传一张图片，用自然语言描述你想要的编辑。AI 能理解复杂的指令，如「将生物放在雪山上」或「想象完整的脸部并创建它」。它会处理你的文字提示并生成完美编辑的图像。",
    "faq.3.q": "可以用于商业项目吗？",
    "faq.3.a": "当然可以！它非常适合创建 AI UGC 内容、社交媒体营销和营销材料。许多用户利用它来创建一致的 AI 角色和产品摄影。高质量的输出适合专业使用。",
    "faq.4.q": "它能处理哪些类型的编辑？",
    "faq.4.a": "编辑器可处理复杂的编辑，包括面部补全、背景更换、物体放置、风格转换和角色修改。它擅长理解上下文指令，同时保持逼真的质量。",
    "faq.5.q": "在哪里可以试用 Sakura AI？",
    "faq.5.a": "你可以通过我们的网页界面试用 Sakura AI。只需上传你的图片，输入描述所需编辑的文字提示，然后观看 AI 以令人难以置信的准确性和一致性变换你的照片。",

    // Footer
    "footer.desc": "先进的 AI 图像编辑器，用简单的文字提示变换任何图像。",
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
    // Nav
    "nav.features": "Features",
    "nav.showcase": "Showcase",
    "nav.reviews": "Reviews",
    "nav.faq": "FAQ",
    "nav.pricing": "Pricing",
    "nav.start": "Get Started",

    // Hero
    "hero.badge": "AI Image Editor - Now Live",
    "hero.title": "Transform Any Image",
    "hero.title2": "With Simple Text",
    "hero.desc": "Sakura AI's advanced AI model delivers consistent character editing and scene preservation with simple text prompts. Experience the future of AI image editing.",
    "hero.cta": "Start Editing",
    "hero.cta2": "View Examples",

    // Editor
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

    // Features
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

    // Showcase
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
    "showcase.4.desc": "Advanced effects processed instantly with Sakura AI AI",
    "showcase.cta": "Try Sakura AI Yourself",

    // Reviews
    "reviews.label": "User Reviews",
    "reviews.title": "What Creators Are Saying",
    "reviews.1.name": "AIArtistPro",
    "reviews.1.role": "Digital Creator",
    "reviews.1.text": "This editor completely changed my workflow. The character consistency is incredible - miles ahead of Flux Kontext!",
    "reviews.2.name": "ContentCreator",
    "reviews.2.role": "UGC Specialist",
    "reviews.2.text": "Creating consistent AI influencers has never been easier. It maintains perfect face details across edits!",
    "reviews.3.name": "PhotoEditor",
    "reviews.3.role": "Professional Editor",
    "reviews.3.text": "One-shot editing is basically solved with this tool. The scene blending is so natural and realistic!",

    // FAQ
    "faq.label": "FAQ",
    "faq.title": "Frequently Asked Questions",
    "faq.1.q": "What is Sakura AI?",
    "faq.1.a": "A revolutionary AI image editing model that transforms photos using natural language prompts. Currently the most powerful image editing model with exceptional consistency in character editing and scene preservation.",
    "faq.2.q": "How does it work?",
    "faq.2.a": "Simply upload an image and describe your desired edits in natural language. The AI understands complex instructions and processes your text prompt to generate perfectly edited images.",
    "faq.3.q": "Can I use it for commercial projects?",
    "faq.3.a": "Absolutely! It's perfect for creating AI UGC content, social media campaigns, and marketing materials. The high-quality outputs are suitable for professional use.",
    "faq.4.q": "What types of edits can it handle?",
    "faq.4.a": "The editor handles complex edits including face completion, background changes, object placement, style transfers, and character modifications while maintaining photorealistic quality.",
    "faq.5.q": "Where can I try Sakura AI?",
    "faq.5.a": "You can try Sakura AI through our web interface. Simply upload your image, enter a text prompt, and watch as the AI transforms your photo with incredible accuracy.",

    // Footer
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

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh")

  const t = useCallback(
    (key: string) => {
      return translations[locale][key] || key
    },
    [locale]
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
