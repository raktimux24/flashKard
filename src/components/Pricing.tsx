import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PricingCard } from './ui/dark-gradient-pricing';
import { logAnalyticsEvent, AnalyticsEvents } from '../lib/firebase';

export function Pricing() {
  const navigate = useNavigate();

  useEffect(() => {
    logAnalyticsEvent(AnalyticsEvents.LANDING_PAGE_VIEW, {
      section: 'pricing',
      timestamp: new Date().toISOString()
    });
  }, []);

  const handlePlanSelect = (tier: string, price: string) => {
    logAnalyticsEvent(AnalyticsEvents.PRICING_PLAN_SELECT, {
      plan_tier: tier,
      plan_price: price,
      timestamp: new Date().toISOString()
    });

    if (tier === 'Enterprise') {
      // Navigate to contact page or open contact form
      navigate('/contact');
    } else {
      // Navigate to signup with selected plan
      navigate('/signup', { state: { selectedPlan: tier } });
    }
  };

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
              { text: "Export to PDF", checked: false },
              { text: "Email support", checked: false },
              { text: "Priority AI processing", checked: false },
            ]}
            onSelect={() => handlePlanSelect("Basic", "Free")}
          />
          <PricingCard
            tier="Pro"
            price="₹199/mo"
            bestFor="For serious learners"
            CTA="Start Free Trial"
            benefits={[
              { text: "Unlimited flashcard generations", checked: true },
              { text: "Advanced file formats support", checked: true },
              { text: "Export to PDF", checked: true },
              { text: "Email support", checked: true },
              { text: "Priority AI processing", checked: true },
            ]}
            onSelect={() => handlePlanSelect("Pro", "₹199/mo")}
          />
          <PricingCard
            tier="Enterprise"
            price="Contact us"
            bestFor="For teams and organizations"
            CTA="Contact Sales"
            benefits={[
              { text: "Everything in Pro", checked: true },
              { text: "Custom integrations", checked: true },
              { text: "Advanced analytics", checked: true },
              { text: "Dedicated support", checked: true },
              { text: "Custom AI models", checked: true },
            ]}
            onSelect={() => handlePlanSelect("Enterprise", "Custom")}
          />
        </div>
      </div>
    </section>
  );
}