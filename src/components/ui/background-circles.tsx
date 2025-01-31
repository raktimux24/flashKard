"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

interface BackgroundCirclesProps {
    title?: string;
    description?: string;
    className?: string;
    variant?: keyof typeof COLOR_VARIANTS;
    children?: React.ReactNode;
}

const COLOR_VARIANTS = {
    primary: {
        border: [
            "border-emerald-500/60",
            "border-cyan-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-emerald-500/30",
    },
    secondary: {
        border: [
            "border-violet-500/60",
            "border-fuchsia-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-violet-500/30",
    },
    tertiary: {
        border: [
            "border-orange-500/60",
            "border-yellow-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-orange-500/30",
    },
    quaternary: {
        border: [
            "border-purple-500/60",
            "border-pink-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-purple-500/30",
    },
    quinary: {
        border: [
            "border-red-500/60",
            "border-rose-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-red-500/30",
    }, // red
    senary: {
        border: [
            "border-blue-500/60",
            "border-sky-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-blue-500/30",
    }, // blue
    septenary: {
        border: [
            "border-gray-500/60",
            "border-gray-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-gray-500/30",
    },
    octonary: {
        border: [
            "border-red-500/60",
            "border-rose-400/50",
            "border-slate-600/30",
        ],
        gradient: "from-red-500/30",
    },
} as const;

export function BackgroundCircles({
    title = "Background Circles",
    description = "Optional Description",
    className,
    variant = "octonary",
    children,
}: BackgroundCirclesProps) {
    const variantStyles = COLOR_VARIANTS[variant];

    return (
        <div
            className={clsx(
                "relative flex h-screen w-full items-center justify-center overflow-hidden",
                className
            )}
        >
            <motion.div className="absolute h-[480px] w-[480px]">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className={clsx(
                            "absolute inset-0 rounded-full",
                            "border-2 bg-gradient-to-br to-transparent",
                            variantStyles.border[i],
                            variantStyles.gradient
                        )}
                        animate={{
                            rotate: 360,
                            scale: [1, 1.05 + i * 0.05, 1],
                            opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                        }}
                    >
                        <div
                            className={clsx(
                                "absolute inset-0 rounded-full mix-blend-screen",
                                `bg-[radial-gradient(ellipse_at_center,${variantStyles.gradient.replace(
                                    "from-",
                                    ""
                                )}/10%,transparent_70%)]`
                            )}
                        />
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                className="relative z-10 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <h1
                    className={clsx(
                        "text-5xl font-bold tracking-tight md:text-7xl",
                        "bg-gradient-to-b from-slate-100 to-slate-300 bg-clip-text text-transparent",
                        "drop-shadow-[0_0_32px_rgba(94,234,212,0.4)]"
                    )}
                >
                    {title}
                </h1>

                <motion.p
                    className="mt-6 text-lg md:text-xl text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {description}
                </motion.p>

                {children}
            </motion.div>
        </div>
    );
}