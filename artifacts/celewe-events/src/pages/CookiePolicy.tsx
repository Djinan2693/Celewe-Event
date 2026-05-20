import React from "react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SEO } from "@/components/SEO";

export function CookiePolicy() {
  return (
    <div className="pt-32 pb-24 md:pt-40 container max-w-[800px] mx-auto px-4 md:px-6">
      <SEO
        title="Cookie Policy"
        description="Cookie Policy for CÉLÉWÉ Events — how we use cookies, third-party services, and how you can manage your preferences."
        canonicalPath="/cookie-policy"
      />
      <SectionTitle
        title="Cookie Policy"
        className="mb-12"
      />

      <div className="prose prose-invert max-w-none text-muted-foreground">
        <p className="lead text-xl text-white mb-8">
          Last updated: May 20, 2026
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">1. What Are Cookies</h2>
        <p>
          Cookies are small text files placed on your device by a website when you visit it. They are widely used to make websites work efficiently and to provide information to the site owner. Cookies do not contain personally identifiable information unless you have provided it directly.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">2. How We Use Cookies</h2>
        <p>
          CÉLÉWÉ Events uses cookies to ensure the proper functioning of our website, remember your preferences, and understand how visitors use our platform. Specifically, cookies help us:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Keep you logged in or maintain your cart/session during checkout</li>
          <li>Remember your preferences across visits</li>
          <li>Analyze traffic and usage patterns to improve the site</li>
          <li>Prevent fraudulent transactions and ensure checkout security</li>
        </ul>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">3. Types of Cookies We Use</h2>

        <h3 className="text-xl font-heading text-white mt-8 mb-3">3.1 Strictly Necessary Cookies</h3>
        <p>
          These cookies are required for the website to function and cannot be switched off. They are usually set in response to actions you take, such as setting your privacy preferences, logging in, or filling in forms. Examples include:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Session identifiers to maintain your checkout state</li>
          <li>CSRF protection tokens to secure form submissions</li>
          <li>Authentication tokens for admin or scan access</li>
        </ul>

        <h3 className="text-xl font-heading text-white mt-8 mb-3">3.2 Functional Cookies</h3>
        <p>
          These cookies allow the website to remember choices you make (such as your language or region) and provide enhanced, more personal features. They may be set by us or by third-party providers whose services we have added to our pages.
        </p>

        <h3 className="text-xl font-heading text-white mt-8 mb-3">3.3 Analytics Cookies</h3>
        <p>
          We may use analytics cookies to collect anonymous information about how visitors interact with our website, including which pages are visited most, time spent on pages, and how users navigate the site. This data is used to improve user experience and site performance. All data collected is aggregated and anonymized.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">4. Third-Party Cookies</h2>
        <p>
          Our website uses third-party services that may set their own cookies. We do not control these cookies. Key third-party services include:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>
            <strong className="text-white">Paddle</strong> — our payment processor. Paddle may set cookies during the checkout process to prevent fraud and ensure secure transactions. These are subject to{" "}
            <a
              href="https://www.paddle.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Paddle's Privacy Policy
            </a>.
          </li>
          <li>
            <strong className="text-white">Social Media Platforms</strong> — if you interact with embedded content (e.g., Instagram feeds or share buttons), those platforms may set their own tracking cookies subject to their own policies.
          </li>
        </ul>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">5. Managing Your Cookie Preferences</h2>
        <p>
          You can manage and control cookies through your browser settings. Most browsers allow you to:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>View the cookies currently stored on your device</li>
          <li>Allow, block, or delete cookies on a per-site basis</li>
          <li>Block all third-party cookies</li>
          <li>Clear all cookies when you close your browser</li>
        </ul>
        <p>
          Please be aware that disabling strictly necessary cookies may impair the functionality of our website — including the ability to complete a purchase.
        </p>
        <p className="mt-4">
          For guidance on managing cookies in popular browsers:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">Apple Safari</a></li>
          <li><a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">Microsoft Edge</a></li>
        </ul>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">6. Do Not Track</h2>
        <p>
          Some browsers include a "Do Not Track" (DNT) feature. Because there is no consistent industry standard for responding to DNT signals, our website does not alter its behavior in response to DNT signals at this time.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">7. Changes to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time to reflect changes in technology, legal requirements, or our business practices. We encourage you to review this page periodically. The "Last updated" date at the top of this page indicates when the policy was last revised.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">8. Contact Us</h2>
        <p>
          If you have any questions about our use of cookies, please contact us at:{" "}
          <a href="mailto:contact@celeweevent.com" className="text-primary hover:text-primary/80 transition-colors">
            contact@celeweevent.com
          </a>
        </p>
      </div>
    </div>
  );
}
