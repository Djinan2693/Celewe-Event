import React from "react";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function Terms() {
  return (
    <div className="pt-32 pb-24 md:pt-40 container max-w-[800px] mx-auto px-4 md:px-6">
      <SectionTitle 
        title="Terms of Service" 
        className="mb-12"
      />
      
      <div className="prose prose-invert max-w-none text-muted-foreground">
        <p className="lead text-xl text-white mb-8">
          Last updated: January 1, 2026
        </p>
        
        <h2 className="text-2xl font-heading text-white mt-12 mb-4">1. Agreement to Terms</h2>
        <p>
          By accessing our website or purchasing tickets to any Céléwé event, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the service or attend our events.
        </p>
        
        <h2 className="text-2xl font-heading text-white mt-12 mb-4">2. Event Admission & Dress Code</h2>
        <p>
          Céléwé Events reserves the right of admission (ROAR). We enforce strict dress codes for all our events:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Management reserves the right to refuse entry to anyone not adhering to the stated dress code.</li>
          <li>All attendees must be of legal drinking age (18+) and present valid government-issued ID.</li>
          <li>Intoxicated individuals will be refused entry without refund.</li>
        </ul>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">3. Ticketing & Refunds</h2>
        <p>
          All ticket sales are final. We do not offer refunds or exchanges unless an event is cancelled or entirely rescheduled. In the case of cancellation, refunds will be issued to the original method of payment.
        </p>
        <p className="mt-4">
          Tickets purchased through unauthorized third-party sellers are not valid and will not be honored.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">4. Code of Conduct</h2>
        <p>
          We aim to provide a safe, premium environment for all guests. Any harassment, discrimination, illegal activities, or disruptive behavior will result in immediate removal from the premises without refund and potential banning from future events.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">5. Liability</h2>
        <p>
          Céléwé Events and its partner venues are not responsible for any lost, stolen, or damaged personal property. Attendance is at your own risk.
        </p>
      </div>
    </div>
  );
}
