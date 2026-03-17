"use client"

import { useI18n } from "@/lib/i18n"

const content = {
  en: {
    title: "Privacy Policy",
    lastModified: "Last modified: March 17, 2025",
    intro: `Please read this Privacy Policy ("Privacy Policy") before using our Service including the Website and API (as defined below), referred to collectively as the "Service". This Privacy Policy governs the types of information and data we collect and how we use and share this information. Your access to and use of the Service are available for your use only on the condition that you agree to the Terms of Service available at /terms which include the terms of this Privacy Policy. Sakura AI ("Company", "we", "us", or "our") operates the Service. We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.`,
    sections: [
      {
        title: "1. Definitions",
        items: [
          { label: "Service", text: "The Sakura AI website and API operated by the Company." },
          { label: "Personal Data", text: "Data about a living individual who can be identified from that data." },
          { label: "Usage Data", text: "Data collected automatically from use of the Service (e.g. page views, IP address, browser type)." },
          { label: "Cookies", text: "Small files stored on your device." },
          { label: "Data Controller", text: "The Company, which determines the purposes and means of processing Personal Data." },
        ],
      },
      {
        title: "2. Information We Collect",
        subsections: [
          {
            title: "2.1 Personal Data",
            text: "While using our Service, we may ask you to provide certain personally identifiable information, including but not limited to:",
            items: [
              "Email address",
              "First name and last name (from your Google account)",
              "Profile picture (from your Google account)",
              "Payment information (processed by PayPal; we do not store card details)",
            ],
          },
          {
            title: "2.2 Usage Data",
            text: "We automatically collect information about how you access and use the Service, including your IP address, browser type and version, pages visited, time and date of visits, time spent on pages, and other diagnostic data.",
          },
          {
            title: "2.3 Cookies and Tracking",
            text: "We use the following types of cookies:",
            items: [
              "Session Cookies – to operate our Service.",
              "Preference Cookies – to remember your preferences and settings.",
              "Security Cookies – for security purposes.",
              "Analytics Cookies – to understand how users interact with the Service (via Vercel Analytics).",
            ],
          },
        ],
      },
      {
        title: "3. How We Use Your Data",
        purposes: [
          { purpose: "To provide and maintain the Service", data: "Email address, name, Usage Data", basis: "Necessity for the performance of a contract to which you are a party" },
          { purpose: "To manage your account and credits", data: "Email address, name, Usage Data", basis: "Necessity for the performance of a contract to which you are a party" },
          { purpose: "To process payments", data: "Email address, payment information", basis: "Necessity for the performance of a contract to which you are a party" },
          { purpose: "To notify you about changes to our Service", data: "Email address", basis: "Necessity for the performance of a contract to which you are a party" },
          { purpose: "To provide customer support", data: "Email address, name, Usage Data", basis: "Legitimate interests of the Data Controller" },
          { purpose: "To monitor and analyze usage to improve the Service", data: "Usage Data, Cookies", basis: "Legitimate interests of the Data Controller" },
          { purpose: "To detect and prevent fraud or abuse", data: "Usage Data, IP address", basis: "Legitimate interests of the Data Controller" },
          { purpose: "To send promotional communications (with your consent)", data: "Email address", basis: "Upon your consent" },
        ],
        labels: { purpose: "Purpose", data: "Type of Personal Data", basis: "Legal Basis" },
      },
      {
        title: "4. Data Retention",
        text: "We retain your Personal Data only for as long as necessary for the purposes set out in this Privacy Policy. We will retain and use your data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies. Usage Data is generally retained for a shorter period, except when used to strengthen security or improve functionality.",
      },
      {
        title: "5. Data Transfer",
        text: "Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By providing your information and using the Service, you consent to this transfer. We take all steps reasonably necessary to ensure your data is treated securely and in accordance with this Privacy Policy.",
      },
      {
        title: "6. Third-Party Services",
        intro: "We use the following third-party services that may collect data:",
        services: [
          { name: "Supabase", desc: "Database and authentication.", link: "https://supabase.com/privacy", linkText: "Supabase Privacy Policy" },
          { name: "Google OAuth", desc: "Sign-in.", link: "https://policies.google.com/privacy", linkText: "Google Privacy Policy" },
          { name: "OpenRouter / Google Gemini", desc: "AI image generation. Your prompts and uploaded images are sent to OpenRouter for processing.", link: "https://openrouter.ai/privacy", linkText: "OpenRouter Privacy Policy" },
          { name: "PayPal", desc: "Payment processing.", link: "https://www.paypal.com/us/legalhub/privacy-full", linkText: "PayPal Privacy Policy" },
          { name: "Vercel Analytics", desc: "Website analytics.", link: "https://vercel.com/legal/privacy-policy", linkText: "Vercel Privacy Policy" },
        ],
      },
      {
        title: "7. Your Rights",
        intro: "Depending on your location, you may have the following rights:",
        items: [
          "The right to access, update, or delete your Personal Data",
          "The right to rectification of inaccurate data",
          "The right to object to processing of your Personal Data",
          "The right to data portability",
          "The right to withdraw consent at any time",
        ],
        outro: "To exercise these rights, please contact us at the email address below.",
      },
      {
        title: "8. Children's Privacy",
        text: "Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us so we can take necessary action.",
      },
      {
        title: "9. Security",
        text: "The security of your data is important to us. We use commercially acceptable means to protect your Personal Data, but no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.",
      },
      {
        title: "10. Changes to This Privacy Policy",
        text: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last modified" date. You are advised to review this Privacy Policy periodically for any changes.',
      },
      {
        title: "11. Contact Us",
        intro: "If you have any questions about this Privacy Policy, please contact us:",
        email: "support@sakura-ai.app",
      },
    ],
  },
  zh: {
    title: "隐私政策",
    lastModified: "最后修改：2025年3月17日",
    intro: `请在使用我们的服务（包括网站和 API，以下统称"服务"）之前，仔细阅读本隐私政策（"隐私政策"）。本隐私政策规定了我们收集的信息和数据类型，以及我们如何使用和共享这些信息。您访问和使用本服务的前提是您同意 /terms 中的服务条款，其中包含本隐私政策的条款。Sakura AI（"公司"、"我们"或"我方"）运营本服务。我们使用您的数据来提供和改进服务。使用本服务即表示您同意按照本政策收集和使用信息。`,
    sections: [
      {
        title: "1. 定义",
        items: [
          { label: "服务", text: "公司运营的 Sakura AI 网站和 API。" },
          { label: "个人数据", text: "可识别特定在世个人的数据。" },
          { label: "使用数据", text: "通过使用服务自动收集的数据（如页面浏览量、IP 地址、浏览器类型）。" },
          { label: "Cookie", text: "存储在您设备上的小型文件。" },
          { label: "数据控制者", text: "公司，负责确定处理个人数据的目的和方式。" },
        ],
      },
      {
        title: "2. 我们收集的信息",
        subsections: [
          {
            title: "2.1 个人数据",
            text: "在使用我们的服务时，我们可能会要求您提供某些可识别个人身份的信息，包括但不限于：",
            items: [
              "电子邮件地址",
              "姓名（来自您的 Google 账户）",
              "头像（来自您的 Google 账户）",
              "支付信息（由 PayPal 处理；我们不存储银行卡信息）",
            ],
          },
          {
            title: "2.2 使用数据",
            text: "我们会自动收集您访问和使用服务的相关信息，包括您的 IP 地址、浏览器类型和版本、访问的页面、访问时间和日期、在页面上停留的时间以及其他诊断数据。",
          },
          {
            title: "2.3 Cookie 和追踪",
            text: "我们使用以下类型的 Cookie：",
            items: [
              "会话 Cookie – 用于运营我们的服务。",
              "偏好 Cookie – 用于记住您的偏好和设置。",
              "安全 Cookie – 用于安全目的。",
              "分析 Cookie – 用于了解用户如何与服务互动（通过 Vercel Analytics）。",
            ],
          },
        ],
      },
      {
        title: "3. 我们如何使用您的数据",
        purposes: [
          { purpose: "提供和维护服务", data: "电子邮件地址、姓名、使用数据", basis: "履行您所参与合同的必要性" },
          { purpose: "管理您的账户和积分", data: "电子邮件地址、姓名、使用数据", basis: "履行您所参与合同的必要性" },
          { purpose: "处理支付", data: "电子邮件地址、支付信息", basis: "履行您所参与合同的必要性" },
          { purpose: "通知您服务变更", data: "电子邮件地址", basis: "履行您所参与合同的必要性" },
          { purpose: "提供客户支持", data: "电子邮件地址、姓名、使用数据", basis: "数据控制者的合法利益" },
          { purpose: "监控和分析使用情况以改进服务", data: "使用数据、Cookie", basis: "数据控制者的合法利益" },
          { purpose: "检测和防止欺诈或滥用", data: "使用数据、IP 地址", basis: "数据控制者的合法利益" },
          { purpose: "发送促销通讯（经您同意）", data: "电子邮件地址", basis: "经您同意" },
        ],
        labels: { purpose: "目的", data: "个人数据类型", basis: "法律依据" },
      },
      {
        title: "4. 数据保留",
        text: "我们仅在本隐私政策所述目的所需的时间内保留您的个人数据。我们将在履行法律义务、解决争议和执行政策所必要的范围内保留和使用您的数据。使用数据通常保留较短时间，但用于加强安全性或改进功能时除外。",
      },
      {
        title: "5. 数据传输",
        text: "您的信息可能被传输到并保存在您所在州、省、国家或其他政府管辖区以外的计算机上，这些地区的数据保护法律可能有所不同。通过提供您的信息并使用服务，您同意此类传输。我们将采取一切合理必要的措施，确保您的数据得到安全处理并符合本隐私政策。",
      },
      {
        title: "6. 第三方服务",
        intro: "我们使用以下可能收集数据的第三方服务：",
        services: [
          { name: "Supabase", desc: "数据库和身份验证。", link: "https://supabase.com/privacy", linkText: "Supabase 隐私政策" },
          { name: "Google OAuth", desc: "登录服务。", link: "https://policies.google.com/privacy", linkText: "Google 隐私政策" },
          { name: "OpenRouter / Google Gemini", desc: "AI 图像生成。您的提示词和上传的图片将发送至 OpenRouter 进行处理。", link: "https://openrouter.ai/privacy", linkText: "OpenRouter 隐私政策" },
          { name: "PayPal", desc: "支付处理。", link: "https://www.paypal.com/us/legalhub/privacy-full", linkText: "PayPal 隐私政策" },
          { name: "Vercel Analytics", desc: "网站分析。", link: "https://vercel.com/legal/privacy-policy", linkText: "Vercel 隐私政策" },
        ],
      },
      {
        title: "7. 您的权利",
        intro: "根据您所在地区，您可能享有以下权利：",
        items: [
          "访问、更新或删除您的个人数据的权利",
          "更正不准确数据的权利",
          "反对处理您个人数据的权利",
          "数据可携带性权利",
          "随时撤回同意的权利",
        ],
        outro: "如需行使这些权利，请通过以下电子邮件地址联系我们。",
      },
      {
        title: "8. 儿童隐私",
        text: "我们的服务不面向 13 岁以下的儿童。我们不会故意收集 13 岁以下儿童的个人身份信息。如果您是父母或监护人，并且发现您的孩子向我们提供了个人数据，请联系我们，以便我们采取必要措施。",
      },
      {
        title: "9. 安全性",
        text: "您的数据安全对我们非常重要。我们采用商业上可接受的方式保护您的个人数据，但互联网传输或电子存储方式均无法保证 100% 的安全性。我们无法保证绝对安全。",
      },
      {
        title: "10. 本隐私政策的变更",
        text: "我们可能会不时更新本隐私政策。我们将通过在本页面发布新的隐私政策并更新"最后修改"日期来通知您任何变更。建议您定期查阅本隐私政策以了解任何变更。",
      },
      {
        title: "11. 联系我们",
        intro: "如果您对本隐私政策有任何疑问，请联系我们：",
        email: "support@sakura-ai.app",
      },
    ],
  },
}

export default function PrivacyPage() {
  const { locale } = useI18n()
  const c = content[locale]

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-sm leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">{c.title}</h1>
      <p className="text-muted-foreground mb-10">{c.lastModified}</p>
      <p className="mb-6">{c.intro}</p>

      {c.sections.map((section) => (
        <section key={section.title} className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{section.title}</h2>

          {"items" in section && section.items && !("purposes" in section) && !("subsections" in section) && !("services" in section) && !("intro" in section) && (
            <ul className="list-disc pl-5 space-y-2">
              {(section.items as { label: string; text: string }[]).map((item) => (
                <li key={item.label}>
                  <strong>{item.label}</strong> – {item.text}
                </li>
              ))}
            </ul>
          )}

          {"subsections" in section && section.subsections && (
            <div className="space-y-4">
              {section.subsections.map((sub) => (
                <div key={sub.title}>
                  <h3 className="font-medium mb-2">{sub.title}</h3>
                  {sub.text && <p className="mb-2">{sub.text}</p>}
                  {sub.items && (
                    <ul className="list-disc pl-5 space-y-1">
                      {sub.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {"purposes" in section && section.purposes && (
            <div className="space-y-3">
              {section.purposes.map((p) => (
                <div key={p.purpose} className="border rounded p-3 space-y-1">
                  <p><strong>{section.labels.purpose}:</strong> {p.purpose}</p>
                  <p><strong>{section.labels.data}:</strong> {p.data}</p>
                  <p><strong>{section.labels.basis}:</strong> {p.basis}</p>
                </div>
              ))}
            </div>
          )}

          {"text" in section && section.text && (
            <p>{section.text}</p>
          )}

          {"services" in section && section.services && (
            <>
              {section.intro && <p className="mb-3">{section.intro}</p>}
              <ul className="list-disc pl-5 space-y-2">
                {section.services.map((s) => (
                  <li key={s.name}>
                    <strong>{s.name}</strong> – {s.desc}{" "}
                    <a href={s.link} className="underline" target="_blank" rel="noreferrer">{s.linkText}</a>.
                  </li>
                ))}
              </ul>
            </>
          )}

          {"intro" in section && !("services" in section) && !("purposes" in section) && section.intro && (
            <>
              <p className="mb-3">{section.intro}</p>
              {"items" in section && Array.isArray(section.items) && typeof section.items[0] === "string" && (
                <ul className="list-disc pl-5 space-y-1">
                  {(section.items as string[]).map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
              {"outro" in section && section.outro && <p className="mt-3">{section.outro}</p>}
              {"email" in section && section.email && (
                <ul className="list-disc pl-5 mt-2">
                  <li>Email: <a href={`mailto:${section.email}`} className="underline">{section.email}</a></li>
                </ul>
              )}
            </>
          )}
        </section>
      ))}
    </main>
  )
}
