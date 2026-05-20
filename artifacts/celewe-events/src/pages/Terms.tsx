import React from "react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SEO } from "@/components/SEO";

export function Terms() {
  return (
    <div className="pt-32 pb-24 md:pt-40 container max-w-[800px] mx-auto px-4 md:px-6">
      <SEO
        title="Terms & Conditions"
        description="Terms and Conditions for purchasing CÉLÉWÉ Events tickets, including ticket usage rules, delivery, and fraud or chargeback policy."
        canonicalPath="/terms"
      />
      <SectionTitle 
        title="Terms & Conditions" 
        className="mb-12"
      />
      
      <div className="prose prose-invert max-w-none text-muted-foreground">
        <p className="lead text-xl text-white mb-8">
          Last updated: May 20, 2026
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">1. Merchant Identity</h2>
        <p>
          This website is operated by <strong>CÉLÉWÉ Events</strong> (<strong>legal entity name placeholder: [Insert Legal Entity Name]</strong>). By purchasing from this site, you agree to these Terms & Conditions.
        </p>
        <p className="mt-4">
          Registered address placeholder: <strong>[Insert Legal Business Address]</strong>
        </p>
        <p className="mt-4">
          Support contact: <a href="mailto:contact@celeweevent.com" className="text-primary">contact@celeweevent.com</a>
        </p>
        
        <h2 className="text-2xl font-heading text-white mt-12 mb-4">2. What We Sell</h2>
        <p>
          We sell <strong>event tickets</strong> for CÉLÉWÉ Events. Ticket availability, inclusions, and prices are shown on each event page and at checkout.
        </p>
        
        <h2 className="text-2xl font-heading text-white mt-12 mb-4">3. Ticket Usage Rules</h2>
        <p>
          Tickets are valid only for the specified date, event, and purchaser details submitted at checkout. Entry may require matching valid government-issued ID.
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Resale, transfer for profit, or unauthorized duplication of tickets is prohibited.</li>
          <li>CÉLÉWÉ Events reserves the right of admission for safety, capacity, and venue policy compliance.</li>
          <li>Guests removed for misconduct, intoxication, or prohibited behavior are not entitled to a refund.</li>
        </ul>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">4. Age & Venue Rules</h2>
        <p>
          Unless otherwise stated on the event page, CÉLÉWÉ Events are <strong>18+</strong>. Some venues may require 21+ per local licensing conditions. You are responsible for checking event-specific age policies before purchase.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">5. Delivery Method</h2>
        <p>
          All tickets are delivered digitally by email. After successful payment, the purchaser receives an e-ticket and/or QR code at the email address provided during checkout.
        </p>
        <p className="mt-4">
          It is your responsibility to enter a valid email address and check spam or promotions folders if confirmation is delayed.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">6. Fraud & Chargeback Policy</h2>
        <p className="mt-4">
          We actively monitor transactions for fraud and reserve the right to cancel suspicious orders. Unauthorized or abusive chargebacks may lead to ticket invalidation and restricted future purchases.
        </p>
        <p className="mt-4">
          If you believe a charge is incorrect, contact us at <a href="mailto:contact@celeweevent.com" className="text-primary">contact@celeweevent.com</a> before initiating a chargeback so we can investigate quickly.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">7. Refunds & Event Changes</h2>
        <p>
          Refund handling is governed by our Refund Policy available at /refund-policy. In case of cancellation or material rescheduling by the organizer, eligible customers may request a refund according to that policy.
        </p>

        <h2 className="text-2xl font-heading text-white mt-12 mb-4">8. Contact</h2>
        <p>
          For ticketing support, account issues, or policy questions, email <a href="mailto:contact@celeweevent.com" className="text-primary">contact@celeweevent.com</a>.
        </p>
      </div>
    </div>
  );
}
