"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export type Sport = "NBA" | "NFL" | "NHL" | "MLB" | "La Liga";

const SPORTS: {
  id: Sport;
  label: Sport;
  icon: string;
  hint: string;
}[] = [
  { id: "NBA", label: "NBA", icon: "🏀", hint: "Props • Pace • Usage" },
  { id: "NFL", label: "NFL", icon: "🏈", hint: "Script • Matchups • Usage" },
  { id: "NHL", label: "NHL", icon: "🏒", hint: "Shots • Lines • Goalies" },
  { id: "MLB", label: "MLB", icon: "⚾️", hint: "Pitching • Splits • Form" },
  { id: "La Liga", label: "La Liga", icon: "⚽️", hint: "Form • XI • Home/Away" },
];

type Burst = { id: string; x: number; y: number };

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function SportTabs({
  value,
  onChange,
  className,
}: {
  value: Sport;
  onChange: (sport: Sport) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Cursor position over the dock (for magnification)
  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);

  // Smooth the motion values
  const sx = useSpring(mx, { stiffness: 350, damping: 35 });
  const sy = useSpring(my, { stiffness: 350, damping: 35 });

  const [bursts, setBursts] = useState<Burst[]>([]);

  const active = useMemo(
    () => SPORTS.find((s) => s.id === value) ?? SPORTS[0],
    [value]
  );

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  }

  function onLeave() {
    mx.set(-9999);
    my.set(-9999);
  }

  function clickBurst(e: React.PointerEvent<HTMLButtonElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    const b = e.currentTarget.getBoundingClientRect();
    if (!rect) return;

    const cx = b.left - rect.left + b.width / 2;
    const cy = b.top - rect.top + b.height / 2;

    const id = uid();
    setBursts((prev) => [...prev, { id, x: cx, y: cy }]);
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((p) => p.id !== id));
    }, 650);
  }

  return (
    <div className={cn("w-full sm:w-auto", className)}>
      <motion.div
        ref={containerRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={cn(
          "relative w-full overflow-hidden rounded-3xl",
          "bg-black/20 p-2 backdrop-blur-md",
          "sm:w-[560px]"
        )}
      >
        {/* Ambient scan / shimmer */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: [0.10, 0.24, 0.10] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.12) 28%, transparent 60%)",
          }}
        />

        {/* Rotating neon halo around container */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-[2px] rounded-[26px] opacity-90"
          animate={{ rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          style={{
            background:
              "conic-gradient(from 180deg, rgba(255,255,255,0), rgba(255,255,255,0.35), rgba(255,255,255,0), rgba(0,0,0,0))",
            maskImage: "radial-gradient(transparent 62%, black 66%)",
            WebkitMaskImage: "radial-gradient(transparent 62%, black 66%)",
          }}
        />

        {/* Click bursts */}
        <AnimatePresence>
          {bursts.map((b) => (
            <motion.div
              key={b.id}
              className="pointer-events-none absolute rounded-full"
              initial={{ opacity: 0.55, scale: 0.25 }}
              animate={{ opacity: 0, scale: 1.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              style={{
                left: b.x,
                top: b.y,
                width: 160,
                height: 160,
                transform: "translate(-50%, -50%)",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.12) 28%, rgba(255,255,255,0) 68%)",
              }}
            />
          ))}
        </AnimatePresence>

        {/* Dock */}
        <div className="relative flex items-center justify-between gap-2 rounded-2xl p-1">
          {SPORTS.map((s, i) => {
            const isActive = s.id === value;

            return (
              <DockItem
                key={s.id}
                index={i}
                label={s.label}
                icon={s.icon}
                active={isActive}
                mx={sx}
                my={sy}
                onClick={() => onChange(s.id)}
                onPointerDown={clickBurst}
              />
            );
          })}
        </div>

        {/* Active hint line */}
        <div className="mt-2 flex items-center justify-between px-2">
          <div className="text-xs text-white/70">
            <span className="font-semibold text-white/95">{active.label}</span>
            <span className="mx-2 text-white/40">•</span>
            <span>{active.hint}</span>
          </div>

          {/* tiny animated status dot */}
          <div className="flex items-center gap-2">
            <motion.div
              aria-hidden
              className="h-2 w-2 rounded-full bg-white/70"
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="text-[11px] text-white/60">SPORT MODE</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Dock item with cursor-proximity magnification (MacOS dock vibe)
 * using the smoothed motion values from the parent.
 */
function DockItem({
  label,
  icon,
  active,
  mx,
  my,
  onClick,
  onPointerDown,
}: {
  index: number;
  label: string;
  icon: string;
  active: boolean;
  mx: any; // MotionValue<number>
  my: any; // MotionValue<number>
  onClick: () => void;
  onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);

  // “distance to cursor” -> scale mapping
  const base = 1.0;
  const max = 1.22;

  // We compute scale in render via a derived function using current motion values.
  // Framer motion reads MotionValue updates without re-rendering the whole tree.
  const scale = useSpring(1, { stiffness: 420, damping: 30 });
  const lift = useSpring(0, { stiffness: 420, damping: 30 });

  // Update springs whenever motion values change
  // (This is lightweight; the math is tiny.)
  mx.on("change", () => {
    const el = ref.current;
    if (!el) return;

    const parent = el.parentElement?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (!parent) return;

    // cursor position in parent coords
    const cx = mx.get() + parent.left;
    const cy = my.get() + parent.top;

    const dx = cx - (r.left + r.width / 2);
    const dy = cy - (r.top + r.height / 2);
    const d = Math.sqrt(dx * dx + dy * dy);

    // radius where effect fades out
    const radius = 140;
    const t = Math.max(0, 1 - d / radius); // 1 near cursor, 0 far
    const s = base + (max - base) * t;

    scale.set(s);
    lift.set(-6 * t);
  });

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      onPointerDown={onPointerDown}
      className={cn(
        "group relative flex flex-1 items-center justify-center gap-2",
        "rounded-2xl px-3 py-3 text-white/80 transition",
        "hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      )}
      style={{ scale, y: lift }}
      title={label}
    >
      {/* Active base */}
      {active && (
        <motion.div
          layoutId="active-core"
          className="absolute inset-0 rounded-2xl bg-black/35"
          transition={{ type: "spring", stiffness: 520, damping: 36 }}
        />
      )}

      {/* Neon ring around active icon */}
      {active && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-1 rounded-xl opacity-90"
          animate={{ opacity: [0.55, 0.95, 0.55] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.22), 0 0 24px rgba(255,255,255,0.22)",
          }}
        />
      )}

      <div className="relative z-10 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="hidden text-sm font-semibold sm:inline">{label}</span>
      </div>

      {/* Active underline pulse */}
      {active && (
        <motion.div
          aria-hidden
          className="absolute bottom-1 left-1/2 h-[2px] w-10 -translate-x-1/2 rounded-full bg-white/70"
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  );
}
