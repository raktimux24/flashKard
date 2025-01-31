import React from 'react';
import { PricingCard } from './ui/dark-gradient-pricing';

export function Pricing() {
  return (
    <section className="relative overflow-hidden bg-transparent text-[#EAEAEA]">
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 md:px-8">
        <div className="mb-12 space-y-3">
          <h2 className="text-center text-3xl font-semibold leading-tight sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight text-[#00A6B2]">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-base text-[#C0C0C0] md:text-lg">
            Choose the plan that fits your needs
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <PricingCard
            tier="Basic"
            price="Free"
            bestFor="Perfect for getting started"
            CTA="Get Started"
            benefits={[
              { text: "3 flashcard generations per month", checked: true },
              { text: "Basic file formats support", checked: true },
              { text: "Export to PDF", checked: true },
              { text: "Email support", checked: true },
              { text: "Custom organization", checked: false },
              { text: "Priority AI processing", checked: false },
            ]}
          />
          <PricingCard
            tier="Pro"
            price="$4.99/mo"
            bestFor="For serious learners"
            CTA="Start Free Trial"
            benefits={[
              { text: "Unlimited flashcard generations", checked: true },
              { text: "Advanced file formats support", checked: true },
              { text: "Export to PDF", checked: true },
              { text: "Priority support", checked: true },
              { text: "Custom organization", checked: true },
              { text: "Priority AI processing", checked: true },
            ]}
          />
          <PricingCard
            tier="Enterprise"
            price="Contact us"
            bestFor="For teams and organizations"
            CTA="Contact Sales"
            benefits={[
              { text: "Everything in Pro", checked: true },
              { text: "Custom integrations", checked: true },
              { text: "Team management", checked: true },
              { text: "Advanced analytics", checked: true },
              { text: "24/7 dedicated support", checked: true },
              { text: "Custom AI training", checked: true },
            ]}
          />
        </div>
      </div>
    </section>
  );
}