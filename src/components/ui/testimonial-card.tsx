import { cn } from "../../lib/utils"
import { Avatar, AvatarImage } from "./avatar"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
}

export function TestimonialCard({ 
  author,
  text,
  href,
  className
}: TestimonialCardProps) {
  const Card = href ? 'a' : 'div'
  
  return (
    <Card
      {...(href ? { href } : {})}
      className={cn(
        "flex flex-col rounded-lg border-t",
        "bg-gradient-to-b from-[#2A2A2A]/80 to-[#2A2A2A]/40",
        "backdrop-blur-sm",
        "p-4 text-start sm:p-6",
        "hover:from-[#2A2A2A]/90 hover:to-[#2A2A2A]/50",
        "max-w-[320px] sm:max-w-[320px]",
        "transition-colors duration-300",
        "border-[#404040]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={author.avatar} alt={author.name} />
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="text-md font-semibold leading-none text-white">
            {author.name}
          </h3>
          <p className="text-sm text-[#C0C0C0]">
            {author.handle}
          </p>
        </div>
      </div>
      <p className="sm:text-md mt-4 text-sm text-[#C0C0C0]">
        {text}
      </p>
    </Card>
  )
}