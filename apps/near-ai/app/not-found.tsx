"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import IsoCube from "@/components/site/IsoCube";

const CUBES: { x: number; y: number; scale: number; top: string; left: string; opacity: number }[] = [
  { x: 0, y: 0, scale: 2.8, top: "8%",  left: "2%",   opacity: 0.06 },
  { x: 0, y: 0, scale: 1.6, top: "18%", left: "12%",  opacity: 0.04 },
  { x: 0, y: 0, scale: 3.4, top: "60%", left: "78%",  opacity: 0.07 },
  { x: 0, y: 0, scale: 2.0, top: "75%", left: "88%",  opacity: 0.05 },
  { x: 0, y: 0, scale: 1.4, top: "82%", left: "6%",   opacity: 0.04 },
  { x: 0, y: 0, scale: 4.2, top: "30%", left: "70%",  opacity: 0.05 },
  { x: 0, y: 0, scale: 1.8, top: "50%", left: "55%",  opacity: 0.03 },
];

// Easter egg #2: ↓↓←→↑
const OVERRIDE_SEQUENCE = ["ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp"];

function glitchShadow(level: number): string {
  if (level === 0) return "none";
  const offset = level * 3;
  const alpha = Math.min(0.4 + level * 0.15, 0.9);
  return `${offset}px 0 rgba(255,0,60,${alpha}), -${offset}px 0 rgba(0,255,220,${alpha})`;
}

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Easter egg #1 — ghost 404 clicks
  const [clickCount, setClickCount] = useState(0);
  const [forbidden, setForbidden] = useState(false);
  const forbiddenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Easter egg #2 — override sequence
  const [showAttestation, setShowAttestation] = useState(false);
  const seqIndexRef = useRef(0);

  // Easter egg #3 — "a33" typed
  const [showDevTag, setShowDevTag] = useState(false);
  const keyBufferRef = useRef("");
  const devTagTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Particle field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.05,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  // Easter egg #2 & #3 — keydown listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore keypresses when user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // EE#2 — override sequence
      if (e.key === OVERRIDE_SEQUENCE[seqIndexRef.current]) {
        seqIndexRef.current += 1;
        if (seqIndexRef.current === OVERRIDE_SEQUENCE.length) {
          seqIndexRef.current = 0;
          setShowAttestation(true);
        }
      } else {
        seqIndexRef.current = e.key === OVERRIDE_SEQUENCE[0] ? 1 : 0;
      }

      // EE#3 — "a33" buffer
      if (e.key.length === 1) {
        keyBufferRef.current = (keyBufferRef.current + e.key).slice(-3);
        if (keyBufferRef.current === "a33") {
          keyBufferRef.current = "";
          setShowDevTag(true);
          if (devTagTimerRef.current) clearTimeout(devTagTimerRef.current);
          devTagTimerRef.current = setTimeout(() => setShowDevTag(false), 3500);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // EE#1 — handle ghost 404 click
  const handleGhostClick = useCallback(() => {
    if (forbidden) return;
    const next = clickCount + 1;
    if (next >= 4) {
      setForbidden(true);
      setClickCount(0);
      if (forbiddenTimerRef.current) clearTimeout(forbiddenTimerRef.current);
      forbiddenTimerRef.current = setTimeout(() => {
        setForbidden(false);
      }, 2200);
    } else {
      setClickCount(next);
    }
  }, [clickCount, forbidden]);

  const ghostSkew = forbidden ? "skewX(-4deg)" : clickCount >= 3 ? "skewX(-2deg)" : "none";
  const ghostColor = forbidden ? "rgba(255,50,50,0.55)" : `rgba(255,255,255,${0.025 + clickCount * 0.012})`;
  const ghostShadow = forbidden
    ? "8px 0 rgba(255,0,0,0.9), -8px 0 rgba(255,100,100,0.7), 0 0 60px rgba(255,0,0,0.4)"
    : glitchShadow(clickCount);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0B0B0B] text-white overflow-hidden">

      <style>{`
        @keyframes glitch-shake {
          0%,100% { transform: skewX(-2deg) translateX(0); }
          25% { transform: skewX(-4deg) translateX(-4px); }
          75% { transform: skewX(2deg) translateX(4px); }
        }
        @keyframes forbidden-pulse {
          0%,100% { opacity: 0.55; }
          50% { opacity: 0.75; }
        }
        @keyframes overlay-in {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes dev-tag-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dev-tag-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        .ghost-glitch { animation: glitch-shake 0.12s infinite; }
        .ghost-forbidden { animation: forbidden-pulse 0.4s infinite; }
        .attest-modal { animation: overlay-in 0.2s ease-out forwards; }
        .dev-tag-enter { animation: dev-tag-in 0.3s ease-out forwards; }
        .dev-tag-exit  { animation: dev-tag-out 0.4s ease-in forwards; }
      `}</style>

      {/* Particle field */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" aria-hidden />

      {/* Grid lines */}
      <div className="absolute inset-0 hidden lg:grid grid-cols-4 pointer-events-none z-0 opacity-[0.04]">
        <div className="border-r border-white h-full" />
        <div className="border-r border-white h-full" />
        <div className="border-r border-white h-full" />
        <div className="h-full" />
      </div>

      {/* Background IsoCubes */}
      {mounted && CUBES.map((c, i) => (
        <div key={i} className="absolute pointer-events-none z-0" style={{ top: c.top, left: c.left, opacity: c.opacity }}>
          <svg width={200 * c.scale} height={120 * c.scale} viewBox={`${-80 * c.scale} ${-80 * c.scale} ${160 * c.scale} ${120 * c.scale}`}>
            <IsoCube x={c.x} y={c.y} scale={c.scale} topFill="#ffffff" leftFill="#cccccc" rightFill="#888888" />
          </svg>
        </div>
      ))}

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between py-8 px-5 sm:px-10 lg:px-[100px] text-[0.75rem] uppercase tracking-[0.2em] text-white/80">
        <a href="/"><Image src="/near-ai.png" alt="NEAR AI" width={120} height={24} style={{ width: "auto", height: "24px" }} /></a>
        <a href="/company" className="hover:text-white transition-colors">OUR COMPANY</a>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 text-center select-none">

        {/* Ghost 404 — EE#1 target */}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <span
            role="button"
            tabIndex={0}
            aria-hidden
            onClick={handleGhostClick}
            onKeyDown={(e) => e.key === "Enter" && handleGhostClick()}
            className={`font-sans font-bold cursor-default ${forbidden ? "ghost-forbidden" : clickCount >= 3 ? "ghost-glitch" : ""}`}
            style={{
              fontSize: "clamp(18rem, 40vw, 52rem)",
              lineHeight: 1,
              color: ghostColor,
              textShadow: ghostShadow,
              letterSpacing: "-0.05em",
              transform: ghostSkew,
              transition: forbidden ? "none" : "color 0.15s, text-shadow 0.15s",
              userSelect: "none",
            }}
          >
            {forbidden ? "403" : "404"}
          </span>
          {forbidden && (
            <span
              className="absolute font-mono text-red-400/70 uppercase tracking-[0.4em] pointer-events-none"
              style={{ fontSize: "clamp(0.8rem, 2vw, 1.1rem)", marginTop: "clamp(18rem, 40vw, 52rem)" }}
            >
              ACCESS DENIED 🔒
            </span>
          )}
        </div>

        {/* Foreground content */}
        <div className="relative flex flex-col items-center gap-8 max-w-lg">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-white/40">Error · 404</p>

          <h1 className="font-sans font-medium text-white leading-[1.1] tracking-tight" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Page Not Found
          </h1>

          <p className="text-white/45 leading-relaxed" style={{ fontSize: "var(--font-size-body)" }}>
            The page you&apos;re looking for doesn&apos;t exist in any known execution environment —
            not even inside a Trusted Execution Environment.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Link
              href="/"
              className="flex items-center gap-3 border border-white/20 rounded-full pl-1.5 pr-6 py-1.5 text-white/70 hover:text-white hover:border-white/40 transition-all duration-200"
              style={{ fontSize: "var(--font-size-body)" }}
            >
              <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </div>
              Back to home
            </Link>
            <Link href="/blog" className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors">
              Read the blog →
            </Link>
          </div>

          {/* Attestation card */}
          <div className="mt-8 border border-white/10 rounded-lg px-6 py-4 text-left w-full max-w-sm">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-white/25 mb-2">IronClaw · Route Attestation</p>
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[0.6rem] text-white/20">
                <span>STATUS</span><span className="text-red-400/60">UNRESOLVED</span>
              </div>
              <div className="flex justify-between font-mono text-[0.6rem] text-white/20">
                <span>ENVIRONMENT</span><span>TEE / NEAR AI CLOUD</span>
              </div>
              <div className="flex justify-between font-mono text-[0.6rem] text-white/20">
                <span>THREAT LEVEL</span><span>NONE DETECTED</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-5 sm:px-10 lg:px-[100px] py-8 flex items-center justify-between border-t border-white/[0.06]">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/20">© 2026 Jasnah Inc., DBA as NEAR AI</p>
        <a href="https://x.com/near_ai" target="_blank" rel="noopener noreferrer" className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/20 hover:text-white/50 transition-colors">
          @near_ai
        </a>
      </footer>

      {/* ── Easter Egg #2 — System Override Attestation modal ── */}
      {showAttestation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowAttestation(false)}
        >
          <div
            className="attest-modal relative border border-green-400/30 rounded-lg bg-[#0a0f0a] max-w-sm w-full mx-4 p-6 font-mono text-[0.7rem] text-green-400/80"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4 border-b border-green-400/15 pb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="uppercase tracking-[0.3em] text-green-400">System Override Initiated</span>
            </div>

            <div className="space-y-2 mb-4">
              {[
                ["SUBJECT",       "unknown_user@void.null"],
                ["SEQUENCE",      "↓↓←→↑  [ACCEPTED]"],
                ["THREAT_LEVEL",  "HARMLESS"],
                ["CURIOSITY",     "VERIFIED ✓"],
                ["HARDWARE",      "IronClaw MK-0 (prototype)"],
                ["ENVIRONMENT",   "NEAR AI CLOUD / TEE"],
                ["SIGNATURE",     "0xDEADBEEF404CAFE..."],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <span className="text-green-400/40 w-28 shrink-0">{k}</span>
                  <span className={v.includes("✓") ? "text-green-300" : "text-green-400/70"}>{v}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-green-400/15 pt-3 text-green-400/35 text-[0.6rem] leading-relaxed">
              This was a simulated TEE breach. Your data is safe.
              <br />No attestation was actually violated.
            </div>

            <button
              onClick={() => setShowAttestation(false)}
              className="mt-4 w-full border border-green-400/20 rounded py-1.5 text-green-400/50 hover:text-green-400 hover:border-green-400/50 transition-colors uppercase tracking-[0.3em] text-[0.65rem]"
            >
              CLOSE TERMINAL
            </button>
          </div>
        </div>
      )}

      {/* ── Easter Egg #3 — dev by Aurora33 tag ── */}
      {showDevTag && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none dev-tag-enter">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-white/30 border border-white/10 rounded px-3 py-1.5 bg-[#0B0B0B]/80 backdrop-blur-sm">
            dev by Aurora33
          </span>
        </div>
      )}
    </div>
  );
}
