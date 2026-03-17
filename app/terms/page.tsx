import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - Sakura AI",
  description: "Terms of Service for Sakura AI image generation service.",
}

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-sm leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-muted-foreground mb-10">Last modified: March 17, 2025</p>

      <p className="mb-6">
        Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using Sakura AI (the
        &ldquo;Service&rdquo;) operated by Sakura AI (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;,
        or &ldquo;our&rdquo;). Your access to and use of the Service is conditioned on your acceptance of and
        compliance with these Terms. By accessing or using the Service you agree to be bound by these Terms.
      </p>

      {/* 1. Definitions */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Definitions</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Service</strong> – the Sakura AI website and API.
          </li>
          <li>
            <strong>User / You</strong> – any individual or entity accessing or using the Service.
          </li>
          <li>
            <strong>Account</strong> – a unique account created for you to access the Service.
          </li>
          <li>
            <strong>Credits</strong> – the in-Service currency used to generate images. Each image generation
            costs 50 credits. Free users receive 100 credits per day.
          </li>
          <li>
            <strong>Content</strong> – text prompts, images, or other material you submit to the Service.
          </li>
          <li>
            <strong>Privacy Policy</strong> – our Privacy Policy available at{" "}
            <a href="/privacy" className="underline">
              /privacy
            </a>
            .
          </li>
          <li>
            <strong>Terms</strong> – these Terms of Service available at{" "}
            <a href="/terms" className="underline">
              /terms
            </a>
            .
          </li>
        </ul>
      </section>

      {/* 2. Accounts */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Accounts</h2>
        <p className="mb-3">
          To use certain features of the Service, you must sign in with a Google account. You are responsible
          for maintaining the confidentiality of your account and for all activities that occur under your
          account. You agree to notify us immediately of any unauthorized use of your account.
        </p>
        <p>
          We reserve the right to terminate accounts, refuse service, or remove content at our sole discretion.
        </p>
      </section>

      {/* 3. Technical Requirements */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Technical Requirements</h2>
        <p className="mb-2">To use the Service, your device must:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Support one of the following browsers: Chrome, Opera, Firefox, Safari, or Microsoft Edge (latest
            stable version recommended).
          </li>
          <li>Have JavaScript enabled.</li>
          <li>Have a stable internet connection.</li>
        </ul>
      </section>

      {/* 4. Credits and Billing */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Credits and Billing</h2>
        <h3 className="font-medium mb-2">4.1 Free Credits</h3>
        <p className="mb-3">
          Each registered user receives 100 free credits per day, which reset at midnight UTC. Unused free
          credits do not roll over to the next day.
        </p>

        <h3 className="font-medium mb-2">4.2 Paid Credits</h3>
        <p className="mb-3">
          You may purchase additional credits via PayPal. Paid credits do not expire and are consumed after free
          credits are exhausted. All purchases are final unless otherwise required by applicable law.
        </p>

        <h3 className="font-medium mb-2">4.3 Payment</h3>
        <p className="mb-3">
          Payments are processed by PayPal. You must provide accurate and complete billing information. By
          submitting payment information, you authorize us to charge the applicable fees. We reserve the right
          to refuse or cancel orders at any time for reasons including service availability, pricing errors, or
          suspected fraud.
        </p>

        <h3 className="font-medium mb-2">4.4 Taxes</h3>
        <p>
          The Company is not responsible for any additional fees or taxes imposed by the relevant authorities of
          the country in which you reside. Payment of such fees remains your responsibility.
        </p>
      </section>

      {/* 5. Acceptable Use */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Acceptable Use</h2>
        <p className="mb-3">You agree not to use the Service to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Generate content that is illegal, harmful, threatening, abusive, or defamatory.</li>
          <li>Generate sexually explicit content involving minors.</li>
          <li>Infringe any intellectual property rights of third parties.</li>
          <li>Attempt to reverse-engineer, scrape, or abuse the API.</li>
          <li>Circumvent rate limits or credit systems.</li>
          <li>Use the Service for any unlawful purpose.</li>
        </ul>
        <p className="mt-3">
          We reserve the right to suspend or terminate your access if you violate these rules.
        </p>
      </section>

      {/* 6. Content */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Content</h2>
        <p className="mb-3">
          You retain ownership of any Content you submit to the Service. By submitting Content, you grant us a
          limited, non-exclusive, royalty-free license to process and transmit your Content solely to provide
          the Service.
        </p>
        <p className="mb-3">
          You represent and warrant that: (i) you own or have the right to use the Content you submit, and (ii)
          your Content does not violate the privacy rights, publicity rights, copyrights, or any other rights of
          any person or entity.
        </p>
        <p>
          We take no responsibility and assume no liability for Content you or any third party submits through
          the Service.
        </p>
      </section>

      {/* 7. AI-Generated Images */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. AI-Generated Images</h2>
        <p className="mb-3">
          Images generated by the Service are produced by third-party AI models (currently Google Gemini via
          OpenRouter). We do not guarantee the accuracy, quality, or fitness for any particular purpose of
          generated images.
        </p>
        <p>
          Ownership and licensing of AI-generated images may vary by jurisdiction. You are solely responsible
          for ensuring your use of generated images complies with applicable laws.
        </p>
      </section>

      {/* 8. Intellectual Property */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">8. Intellectual Property</h2>
        <p>
          The Service and its original content (excluding Content submitted by users), features, and
          functionality are and will remain the exclusive property of Sakura AI and its licensors. Our trademarks
          may not be used in connection with any product or service without our prior written consent.
        </p>
      </section>

      {/* 9. Disclaimer of Warranties */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">9. Disclaimer of Warranties</h2>
        <p>
          THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT ANY
          WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE
          SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
        </p>
      </section>

      {/* 10. Limitation of Liability */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">10. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SAKURA AI, ITS DIRECTORS,
          EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA,
          GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS
          OR USE) THE SERVICE.
        </p>
      </section>

      {/* 11. Termination */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">11. Termination</h2>
        <p>
          We may terminate or suspend your account and access to the Service immediately, without prior notice
          or liability, for any reason, including if you breach these Terms. Upon termination, your right to use
          the Service will immediately cease. Unused paid credits are non-refundable upon termination for cause.
        </p>
      </section>

      {/* 12. Governing Law */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with applicable law, without regard to its
          conflict of law provisions. Any disputes arising under these Terms shall be resolved through binding
          arbitration or in the courts of competent jurisdiction.
        </p>
      </section>

      {/* 13. Changes */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">13. Changes to Terms</h2>
        <p>
          We reserve the right to modify or replace these Terms at any time. We will provide notice of
          significant changes by updating the &ldquo;Last modified&rdquo; date. Your continued use of the
          Service after any changes constitutes your acceptance of the new Terms.
        </p>
      </section>

      {/* 14. Contact */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">14. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us:</p>
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
