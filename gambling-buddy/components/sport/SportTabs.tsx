"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  type MotionValue,
} from "framer-motion";
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

/** --- MONEY RAIN CANVAS (background layer) --- */
type Drop = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vrot: number;
  ch: string;
  alpha: number;
};

function MoneyRain({
  containerRef,
  mx,
  my,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dropsRef = useRef<Drop[]>([]);
  const rafRef = useRef<number | null>(null);

  // knobs you can play with
  const SYMBOLS = ["$", "€", "¢"];
  const BASE_COLOR = "rgba(0, 255, 120,"; // neon-ish green
  const gravity = 0.008;      // gentler accel = less wavey
  const terminalVy = 2.2;     // cap fall speed so it stays steady
  const wind = 0.003; // ←→ slow drift
  const umbrellaRadius = 95; // how big the "umbrella" influence is
  const umbrellaForce = 0.35; // push-away strength
  const umbrellaLift = 0.55; // upward kick

  function spawnDrop(w: number, h: number): Drop {
    const size = 10 + Math.random() * 10;
    return {
      x: Math.random() * w,
      y: -20 - Math.random() * 180, // tighter spawn band = more continuous entry
      vx: (Math.random() - 0.5) * 0.25,
      vy: 0.25 + Math.random() * 0.85,
      size,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.02,
      ch: SYMBOLS[(Math.random() * SYMBOLS.length) | 0],
      alpha: 0.16 + Math.random() * 0.28,
    };
  }

  function ensureDrops(w: number, h: number) {
    // density knob: more/less drops
    const target = Math.max(18, Math.floor((w * h) / 2000));
    if (dropsRef.current.length === target) return;

    if (dropsRef.current.length < target) {
      const missing = target - dropsRef.current.length;
      for (let i = 0; i < missing; i++) dropsRef.current.push(spawnDrop(w, h));
    } else {
      dropsRef.current = dropsRef.current.slice(0, target);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = containerRef.current;
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(r.width * dpr);
      canvas.height = Math.floor(r.height * dpr);
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ensureDrops(r.width, r.height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const tick = () => {
      const r = host.getBoundingClientRect();
      const w = r.width;
      const h = r.height;

      ensureDrops(w, h);

      ctx.clearRect(0, 0, w, h);

      // Cursor position in container coords (your mx/my already are)
      const cx = mx.get();
      const cy = my.get();
      const cursorActive = cx > -1000 && cy > -1000;

      // paint a subtle “umbrella glow” so it feels interactive
      if (cursorActive) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, umbrellaRadius);
        g.addColorStop(0, "rgba(0,255,120,0.15)");
        g.addColorStop(1, "rgba(0,255,120,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      for (const d of dropsRef.current) {
        // physics
        d.vx += wind * (Math.random() > 0.5 ? 1 : -1);
        d.vy += gravity;
        if (d.vy > terminalVy) d.vy = terminalVy;


        // umbrella repel / bounce
        if (cursorActive) {
          const dx = d.x - cx;
          const dy = d.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < umbrellaRadius) {
            // push away + upward "bounce"
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);

            const strength = (1 - dist / umbrellaRadius) * umbrellaForce;

            d.vx += nx * strength;
            d.vy += ny * strength;
            d.vy -= strength * umbrellaLift; // lift

            // a little bounce feel
            d.vy = Math.max(d.vy, -1.6);
          }
        }

        d.x += d.vx;
        d.y += d.vy;
        d.rot += d.vrot;

        // wrap
        if (d.y > h + 40) {
          const nd = spawnDrop(w, h);
          d.x = nd.x;
          d.y = -20 - Math.random() * 180;
          d.vx = nd.vx;
          d.vy = nd.vy;
          d.size = nd.size;
          d.rot = nd.rot;
          d.vrot = nd.vrot;
          d.ch = nd.ch;
          d.alpha = nd.alpha;
        }
        if (d.x < -40) d.x = w + 40;
        if (d.x > w + 40) d.x = -40;

        // render
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rot);

        ctx.font = `700 ${d.size}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
        ctx.fillStyle = `${BASE_COLOR}${d.alpha})`;
        ctx.fillText(d.ch, -d.size * 0.35, d.size * 0.35);

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef, mx, my]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0"
    />
  );
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

  // Smooth motion values
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
        {/* ✅ Money rain background */}
        <MoneyRain containerRef={containerRef} mx={mx} my={my} />

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
 * Dock item with cursor-proximity magnification
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

  const base = 1.0;
  const max = 1.22;

  const scale = useSpring(1, { stiffness: 420, damping: 30 });
  const lift = useSpring(0, { stiffness: 420, damping: 30 });

  // NOTE: This is your existing approach; it works.
  mx.on("change", () => {
    const el = ref.current;
    if (!el) return;

    const parent = el.parentElement?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (!parent) return;

    const cx = mx.get() + parent.left;
    const cy = my.get() + parent.top;

    const dx = cx - (r.left + r.width / 2);
    const dy = cy - (r.top + r.height / 2);
    const d = Math.sqrt(dx * dx + dy * dy);

    const radius = 140;
    const t = Math.max(0, 1 - d / radius);
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
      {active && (
        <motion.div
          layoutId="active-core"
          className="absolute inset-0 rounded-2xl bg-black/35"
          transition={{ type: "spring", stiffness: 520, damping: 36 }}
        />
      )}

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
