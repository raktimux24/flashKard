import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Card } from "./card"
import React from 'react';

interface BenefitProps {
  text: string
  checked: boolean
}

const Benefit = ({ text, checked }: BenefitProps) => {
  return (
    <div className="flex items-center gap-3">
      {checked ? (
        <span className="grid size-4 place-content-center rounded-full bg-primary text-sm text-primary-foreground">
          <Check className="size-3" />
        </span>
      ) : (
        <span className="grid size-4 place-content-center rounded-full dark:bg-zinc-800 bg-zinc-200 text-sm dark:text-zinc-400 text-zinc-600">
          <X className="size-3" />
        </span>
      )}
      <span className="text-sm dark:text-zinc-300 text-zinc-600">{text}</span>
    </div>
  )
}

interface PricingCardProps {
  tier: string
  price: string
  bestFor: string
  CTA: string
  benefits: Array<{ text: string; checked: boolean }>
  className?: string
  onSelect?: () => void
}

export const PricingCard = ({
  tier,
  price,
  bestFor,
  CTA,
  benefits,
  className,
  onSelect
}: PricingCardProps) => {
  return (
    <motion.div
      initial={{ filter: "blur(2px)" }}
      whileInView={{ filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: "easeInOut", delay: 0.25 }}
    >
      <Card 
        className={cn(
          "relative overflow-hidden border border-zinc-700/50 bg-gradient-to-t from-zinc-900/50 to-zinc-900/25 p-8",
          className
        )}
      >
        <div className="relative z-20 flex flex-col gap-3">
          <div>
            <p className="text-sm text-[#C0C0C0]">{bestFor}</p>
            <div className="flex flex-col gap-1">
              <p className="text-3xl font-semibold text-[#00A6B2]">{tier}</p>
              <p className="text-sm text-[#C0C0C0]">Starting from</p>
              <p className="text-4xl font-semibold text-white">{price}</p>
            </div>
          </div>

          <Button
            onClick={onSelect}
            className="w-full bg-[#00A6B2] hover:bg-[#008C96] text-white"
          >
            {CTA}
          </Button>

          <div className="flex flex-col gap-3 pt-3">
            {benefits.map((benefit, i) => (
              <Benefit key={i} {...benefit} />
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}