import React from "react";
import { SEO } from "@/components/SEO";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function RefundPolicy() {
  return (
    <div className="pt-32 pb-24 md:pt-40 container max-w-[800px] mx-auto px-4 md:px-6">
      <SEO
        title="Refund Policy"
        description="Refund Policy for CÉLÉWÉ Events tickets, including cancellation, rescheduling, request windows, and processing timelines."
        canonicalPath="/refund-policy"
      />

      <SectionTitle
        title="Refund Policy"
        subtitle="How CÉLÉWÉ Events handles ticket refunds, cancellations, and schedule changes."
        className="mb-12"
      />

      <div className="prose prose-invert max-w-none text-muted-foreground">
        <p className="lead text-xl text-white mb-8">Last updated: May 20, 2026</p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">1. Standard Rule</h2>
        <p>
          Ticket purchases are generally non-refundable, except where stated in this policy or required by law.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">2. Event Cancellation</h2>
        <p>
          If CÉLÉWÉ Events cancels an event, affected ticket holders are eligible for a full refund to the original payment method.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">3. Event Rescheduling</h2>
        <p>
          If an event is rescheduled, your ticket remains valid for the new date. If you cannot attend the new date, you may request a refund within 7 calendar days of the reschedule announcement.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">4. Customer-Initiated Requests</h2>
        <p>
          If you purchased the wrong ticket or entered incorrect buyer details, contact us as soon as possible. Requests made at least 72 hours before event start time may be considered case-by-case but are not guaranteed.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">5. Refund Request Cut-Off</h2>
        <p>
          Except for event cancellation or official rescheduling, no refund requests are accepted after the 72-hour pre-event cut-off.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">6. Processing Timeline</h2>
        <p>
          Approved refunds are typically processed within 5 to 10 business days. Final posting time depends on Paddle and your payment provider.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">7. How to Request a Refund</h2>
        <p>
          Email <a href="mailto:contact@celeweevent.com" className="text-primary">contact@celeweevent.com</a> with your order email, event name, and reason for request. We may ask for additional verification for fraud prevention.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">8. Chargebacks</h2>
        <p>
          Please contact support before filing a chargeback so we can resolve the issue quickly. Fraudulent or abusive chargebacks may result in order cancellation and ticket invalidation.
        </p>
      </div>
    </div>
  );
}
