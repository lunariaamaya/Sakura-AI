import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - Sakura AI",
  description: "Privacy Policy for Sakura AI image generation service.",
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-sm leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-10">Last modified: March 17, 2025</p>

      <p className="mb-6">
        Please read this Privacy Policy (&ldquo;Privacy Policy&rdquo;) before using our Service including the
        Website and API (as defined below), referred to collectively as the &ldquo;Service&rdquo;. This Privacy
        Policy governs the types of information and data we collect and how we use and share this information.
        Your access to and use of the Service are available for your use only on the condition that you agree to
        the Terms of Service available at{" "}
        <a href="/terms" className="underline">
          /terms
        </a>{" "}
        which include the terms of this Privacy Policy. Sakura AI (&ldquo;Company&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the Service. We use your data to provide and improve
        the Service. By using the Service, you agree to the collection and use of information in accordance with
        this policy.
      </p>

      {/* 1. Definitions */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Definitions</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Service</strong> – the Sakura AI website and API operated by the Company.
          </li>
          <li>
            <strong>Personal Data</strong> – data about a living individual who can be identified from that data.
          </li>
          <li>
            <strong>Usage Data</strong> – data collected automatically from use of the Service (e.g. page views,
            IP address, browser type).
          </li>
          <li>
            <strong>Cookies</strong> – small files stored on your device.
          </li>
          <li>
            <strong>Data Controller</strong> – the Company, which determines the purposes and means of processing
            Personal Data.
          </li>
        </ul>
      </section>

      {/* 2. Information We Collect */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
        <h3 className="font-medium mb-2">2.1 Personal Data</h3>
        <p className="mb-3">
          While using our Service, we may ask you to provide certain personally identifiable information,
          including but not limited to:
        </p>
        <ul className="list-disc pl-5 space-y-1 mb-4">
          <li>Email address</li>
          <li>First name and last name (from your Google account)</li>
          <li>Profile picture (from your Google account)</li>
          <li>Payment information (processed by PayPal; we do not store card details)</li>
        </ul>

        <h3 className="font-medium mb-2">2.2 Usage Data</h3>
        <p className="mb-3">
          We automatically collect information about how you access and use the Service, including your IP
          address, browser type and version, pages visited, time and date of visits, time spent on pages, and
          other diagnostic data.
        </p>

        <h3 className="font-medium mb-2">2.3 Cookies and Tracking</h3>
        <p className="mb-2">We use the following types of cookies:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Session Cookies</strong> – to operate our Service.
          </li>
          <li>
            <strong>Preference Cookies</strong> – to remember your preferences and settings.
          </li>
          <li>
            <strong>Security Cookies</strong> – for security purposes.
          </li>
          <li>
            <strong>Analytics Cookies</strong> – to understand how users interact with the Service (via Vercel
            Analytics).
          </li>
        </ul>
      </section>

      {/* 3. How We Use Your Data */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. How We Use Your Data</h2>
        <p className="mb-3">We use the collected data for the following purposes:</p>
        <div className="space-y-3">
          {[
            {
              purpose: "To provide and maintain the Service",
              data: "Email address, name, Usage Data",
              basis: "Necessity for the performance of a contract to which you are a party",
            },
            {
              purpose: "To manage your account and credits",
              data: "Email address, name, Usage Data",
              basis: "Necessity for the performance of a contract to which you are a party",
            },
            {
              purpose: "To process payments",
              data: "Email address, payment information",
              basis: "Necessity for the performance of a contract to which you are a party",
            },
            {
              purpose: "To notify you about changes to our Service",
              data: "Email address",
              basis: "Necessity for the performance of a contract to which you are a party",
            },
            {
              purpose: "To provide customer support",
              data: "Email address, name, Usage Data",
              basis: "Legitimate interests of the Data Controller",
            },
            {
              purpose: "To monitor and analyze usage to improve the Service",
              data: "Usage Data, Cookies",
              basis: "Legitimate interests of the Data Controller",
            },
            {
              purpose: "To detect and prevent fraud or abuse",
              data: "Usage Data, IP address",
              basis: "Legitimate interests of the Data Controller",
            },
            {
              purpose: "To send promotional communications (with your consent)",
              data: "Email address",
              basis: "Upon your consent",
            },
          ].map((item) => (
            <div key={item.purpose} className="border rounded p-3 space-y-1">
              <p>
                <strong>Purpose:</strong> {item.purpose}
              </p>
              <p>
                <strong>Type of Personal Data:</strong> {item.data}
              </p>
              <p>
                <strong>Legal Basis:</strong> {item.basis}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Data Retention */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Data Retention</h2>
        <p>
          We retain your Personal Data only for as long as necessary for the purposes set out in this Privacy
          Policy. We will retain and use your data to the extent necessary to comply with our legal obligations,
          resolve disputes, and enforce our policies. Usage Data is generally retained for a shorter period,
          except when used to strengthen security or improve functionality.
        </p>
      </section>

      {/* 5. Data Transfer */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Data Transfer</h2>
        <p>
          Your information may be transferred to and maintained on computers located outside of your state,
          province, country, or other governmental jurisdiction where data protection laws may differ. By
          providing your information and using the Service, you consent to this transfer. We take all steps
          reasonably necessary to ensure your data is treated securely and in accordance with this Privacy
          Policy.
        </p>
      </section>

      {/* 6. Third-Party Services */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Third-Party Services</h2>
        <p className="mb-3">We use the following third-party services that may collect data:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Supabase</strong> – database and authentication. See{" "}
            <a href="https://supabase.com/privacy" className="underline" target="_blank" rel="noreferrer">
              Supabase Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>Google OAuth</strong> – sign-in. See{" "}
            <a
              href="https://policies.google.com/privacy"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              Google Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>OpenRouter / Google Gemini</strong> – AI image generation. Your prompts and uploaded images
            are sent to OpenRouter for processing. See{" "}
            <a href="https://openrouter.ai/privacy" className="underline" target="_blank" rel="noreferrer">
              OpenRouter Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>PayPal</strong> – payment processing. See{" "}
            <a
              href="https://www.paypal.com/us/legalhub/privacy-full"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              PayPal Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>Vercel Analytics</strong> – website analytics. See{" "}
            <a href="https://vercel.com/legal/privacy-policy" className="underline" target="_blank" rel="noreferrer">
              Vercel Privacy Policy
            </a>
            .
          </li>
        </ul>
      </section>

      {/* 7. Your Rights */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
        <p className="mb-3">Depending on your location, you may have the following rights:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The right to access, update, or delete your Personal Data</li>
          <li>The right to rectification of inaccurate data</li>
          <li>The right to object to processing of your Personal Data</li>
          <li>The right to data portability</li>
          <li>The right to withdraw consent at any time</li>
        </ul>
        <p className="mt-3">
          To exercise these rights, please contact us at the email address below.
        </p>
      </section>

      {/* 8. Children's Privacy */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">8. Children&apos;s Privacy</h2>
        <p>
          Our Service does not address anyone under the age of 13. We do not knowingly collect personally
          identifiable information from children under 13. If you are a parent or guardian and you are aware
          that your child has provided us with Personal Data, please contact us so we can take necessary action.
        </p>
      </section>

      {/* 9. Security */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">9. Security</h2>
        <p>
          The security of your data is important to us. We use commercially acceptable means to protect your
          Personal Data, but no method of transmission over the Internet or electronic storage is 100% secure.
          We cannot guarantee absolute security.
        </p>
      </section>

      {/* 10. Changes */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">10. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the
          new Privacy Policy on this page and updating the &ldquo;Last modified&rdquo; date. You are advised to
          review this Privacy Policy periodically for any changes.
        </p>
      </section>

      {/* 11. Contact */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            Email:{" "}
            <a href="mailto:support@sakura-ai.app" className="underline">
              support@sakura-ai.app
            </a>
          </li>
        </ul>
      </section>
    </main>
  )
}