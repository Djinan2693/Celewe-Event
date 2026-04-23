import React from "react";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function Privacy() {
  return (
    <div className="pt-32 pb-24 md:pt-40 container max-w-[800px] mx-auto px-4 md:px-6">
      <SectionTitle 
        title="Privacy Policy" 
        className="mb-12"
      />
      
      <div className="prose prose-invert max-w-none text-muted-foreground">
        <p className="lead text-xl text-white mb-8">
          Last updated: January 1, 2026
        </p>
        
        <h2 className="text-2xl font-heading text-white mt-12 mb-4">1. Information We Collect</h2>
        <p>
          At Céléwé Events, we collect information that you provide directly to us when you:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Purchase tickets or RSVP to an event</li>
          <li>Subscribe to our newsletter</li>
          <li>Contact us with inquiries</li>
          <li>Participate in event photography/videography</li>
        </ul>
        
        <h2 className="text-2xl font-heading text-white mt-12 mb-4">2. How We Use Your Information</h2>
        <p>
          The information we collect is used to:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Process transactions and send related information including confirmations</li>
          <li>Send administrative messages, security alerts, and support messages</li>
          <li>Respond to your comments and questions</li>
          <li>Communicate with you about upcoming events and promotions</li>
        </ul>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">3. Photography & Media</h2>
        <p>
          By attending a Céléwé event, you consent to being photographed and filmed. These materials may be used for marketing, promotional purposes, and social media content without compensation. If you wish to not be photographed, please inform our staff upon arrival.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">4. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect the security of your personal information against unauthorized access, disclosure, alteration, and destruction.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">5. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at vip@celeweevent.com.
        </p>
      </div>
    </div>
  );
}
