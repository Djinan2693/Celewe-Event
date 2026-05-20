import React from "react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SEO } from "@/components/SEO";

export function Privacy() {
  return (
    <div className="pt-32 pb-24 md:pt-40 container max-w-[800px] mx-auto px-4 md:px-6">
      <SEO
        title="Privacy Policy"
        description="Privacy Policy for CÉLÉWÉ Events detailing personal data collection, usage, retention, third parties, and user rights."
        canonicalPath="/privacy"
      />
      <SectionTitle 
        title="Privacy Policy" 
        className="mb-12"
      />
      
      <div className="prose prose-invert max-w-none text-muted-foreground">
        <p className="lead text-xl text-white mb-8">
          Last updated: May 20, 2026
        </p>
        
        <h2 className="text-2xl font-heading text-white mt-12 mb-4">1. Information We Collect</h2>
        <p>
          CÉLÉWÉ Events collects data needed to sell and deliver event tickets. This may include:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Full name</li>
          <li>Email address</li>
          <li>Phone number (if provided)</li>
          <li>Payment confirmation data and transaction identifiers from Paddle (we do not store full card details)</li>
          <li>Support messages submitted through our contact channels</li>
        </ul>
        
        <h2 className="text-2xl font-heading text-white mt-12 mb-4">2. How We Use Your Information</h2>
        <p>
          We use your information to:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Process ticket orders and send e-ticket or QR delivery emails</li>
          <li>Provide customer support and event communication</li>
          <li>Detect and prevent fraud, abuse, and unauthorized transactions</li>
          <li>Comply with legal, tax, and accounting obligations</li>
        </ul>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">3. Data Retention</h2>
        <p>
          We retain customer and transaction records only as long as necessary for ticketing operations, legal compliance, dispute resolution, and fraud prevention. Retention periods may vary by law and payment provider obligations.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">4. Third-Party Processors</h2>
        <p>
          We share relevant data only with trusted processors needed to run the service:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong>Paddle</strong> for payment processing, fraud checks, and transaction records</li>
          <li><strong>Email service providers</strong> for ticket confirmations and support communications</li>
        </ul>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">5. Data Security</h2>
        <p>
          We use appropriate technical and organizational safeguards to protect your data. However, no internet transmission or storage system is completely risk-free.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">6. Your Rights</h2>
        <p>
          Subject to applicable law, you may request access, correction, deletion, or restriction of your personal data, and object to certain processing activities.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">7. Contact Us</h2>
        <p>
          For privacy requests or questions, contact <a href="mailto:contact@celeweevent.com" className="text-primary">contact@celeweevent.com</a>.
        </p>
      </div>
    </div>
  );
}
