"use client";

import { motion } from "framer-motion";

type Sport = "NBA" | "NFL" | "NHL" | "MLB" | "La Liga";

const SPORT_META: Record<Sport, { icon: string; label: string }> = {
  NBA: { icon: "🏀", label: "Checking matchups..." },
  NFL: { icon: "🏈", label: "Reading the defense..." },
  NHL: { icon: "🏒", label: "Looking at shot volume..." },
  MLB: { icon: "⚾", label: "Crunching splits..." },
  "La Liga": { icon: "⚽", label: "Scanning fixtures..." },
};

export function SportLoadingBubble({ sport }: { sport: Sport }) {
  const { icon, label } = SPORT_META[sport];

  return (
    <div className="relative overflow-hidden rounded-2xl rounded-bl-sm bg-zinc-100 px-4 py-3 text-zinc-900 shadow-sm ring-1 ring-zinc-200">
      {/* Shimmer overlay */}
      <motion.div
        initial={{ x: "-40%" }}
        animate={{ x: "140%" }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />

      <div className="relative z-10 flex items-center gap-3">
        {/* animated balls */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ y: 0, opacity: 0.6, scale: 0.95 }}
              animate={{
                y: [0, -8, 0],
                opacity: [0.55, 1, 0.55],
                scale: [0.95, 1.05, 0.95],
              }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.12,
              }}
              className="grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5"
              aria-hidden="true"
              title="Loading"
            >
              <span className="text-base leading-none">{icon}</span>
            </motion.div>
          ))}
        </div>

        {/* text */}
        <div className="min-w-0">
          <div className="text-xs text-zinc-500">Gambling Buddy</div>
          <div className="truncate text-sm font-medium">{label}</div>
        </div>
      </div>

      {/* tiny pulse dots after the label */}
      <div className="relative z-10 mt-2 flex items-center gap-1 text-[11px] text-zinc-500">
        <span>Thinking</span>

        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.0, repeat: Infinity }}
        >
          .
        </motion.span>

        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.0, repeat: Infinity, delay: 0.2 }}
        >
          .
        </motion.span>

        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.0, repeat: Infinity, delay: 0.4 }}
        >
          .
        </motion.span>
      </div>
    </div>
  );
}
