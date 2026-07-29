import type { Metadata } from "next";
import Image from "next/image";
import PillButton from "@/components/site/PillButton";
import SiteHeader from "@/components/site/SiteHeader";
import AnimationsProvider from "@/components/site/providers/AnimationsProvider";
import GridLines from "@/components/site/v2/GridLines";
import ConcentricRings from "@/components/site/v2/ConcentricRings";
import UseCaseFilter from "@/components/site/ironclaw/UseCaseFilter";
import Marquee from "@/components/site/ironclaw/Marquee";

export const metadata: Metadata = {
  title: "IronClaw | NEAR AI",
  description:
    "An open-source agent for your busywork — in encrypted enclaves, where your secrets never touch the model.",
  openGraph: {
    type: "website",
    url: "https://near.ai/ironclaw",
    siteName: "NEAR AI",
    title: "IronClaw | NEAR AI",
    description:
      "An open-source agent for your busywork — in encrypted enclaves, where your secrets never touch the model.",
  },
};

const USE_CASES = [
  { title: "Inbox triage", category: "Communication", tags: ["Gmail"], description: "Reads, prioritizes, and summarizes email. Labels inbound as Action, FYI, or Ignore and drafts replies for the ones that matter." },
  { title: "Daily morning briefing", category: "Productivity", tags: ["Calendar", "Telegram"], description: "A concise daily summary of your calendar, email, tasks, and key signals — delivered wherever you are." },
  { title: "Meeting prep assistant", category: "Productivity", tags: ["Calendar"], description: "10 minutes before each meeting, get a brief on the company, attendees, and recent news." },
  { title: "Team chat operations", category: "Communication", tags: ["Slack", "Telegram"], description: "Slack or Telegram as your control layer — send updates, triage messages, and coordinate work from chat." },
  { title: "Keyword monitor", category: "Monitoring", tags: ["Slack"], description: "Watches Hacker News, Twitter, or the web for mentions of your product and sends a summary the moment they appear." },
  { title: "Deployment health watcher", category: "Monitoring", tags: ["Telegram"], description: "Pings your endpoint every 5 minutes and alerts you in chat if it returns anything but a 200." },
  { title: "Release tracker", category: "Developer", tags: ["GitHub", "Telegram"], description: "Watches a GitHub repo and summarizes new releases into your channel of choice." },
  { title: "Task capture & delegation", category: "Productivity", tags: ["Slack", "Linear"], description: "Turns messages and emails into structured tasks with assignments and tracking — “create task: …” from anywhere." },
  { title: "Invoice parser", category: "Automation", tags: ["Gmail", "Sheets"], description: "Forward a PDF invoice and the amount, date, and vendor land in a spreadsheet automatically." },
  { title: "Daily KPI reporter", category: "Automation", tags: ["Slack"], description: "Pulls simple metrics from a CSV or API and posts a formatted dashboard to your team channel daily." },
];

const INTEGRATIONS_ROW_1 = ["Gmail", "Google Drive", "Google Sheets", "GitHub", "Discord", "Web Search"];
const INTEGRATIONS_ROW_2 = ["Google Calendar", "Google Docs", "Google Slides", "Telegram", "Signal", "MCP Servers"];

const STATS = ["OPEN SOURCE", "Defense-in-depth security", "BUILT ON RUST", "1-CLICK CLOUD DEPLOYMENT"];

const HOW_IT_WORKS = [
  { label: "Deploy in one click.", text: "Launch your own IronClaw instance on NEAR AI Cloud. It boots inside a Trusted Execution Environment — encrypted from the start, no setup required." },
  { label: "Store your credentials.", text: "Add API keys, tokens, and passwords to the encrypted vault. IronClaw injects them only where you've allowed — the AI never sees the raw values." },
  { label: "Work like you always do.", text: "Browse, research, code, automate. Powerful capabilities that are exempt from protected injection that can steal your credentials." },
];

const SECURITY_FEATURES = [
  { title: "Encrypted Vault", text: "Your credentials are invisible to the AI. API keys, tokens, and passwords are encrypted at rest and injected into requests at the host boundary — only for endpoints you've approved." },
  { title: "Sandboxed Tools", text: "A compromised skill can't touch anything else. Every tool runs in its own Wasm container with capability-based permissions, allowlisted endpoints, and strict resource limits." },
  { title: "Encrypted Enclaves", text: "Not even the cloud provider can see your data. Your instance runs inside a Trusted Execution Environment on NEAR AI Cloud — encrypted in memory, from boot to shutdown." },
  { title: "Leak Detection", text: "Credential exfiltration gets caught before it leaves. All outbound traffic is scanned in real-time. Anything that looks like a secret heading out the door is blocked automatically." },
  { title: "Built in Rust", text: "Entire classes of exploits don't exist here. No garbage collector, no buffer overflows, no use-after-free. Memory safety is enforced at compile time, not at runtime." },
  { title: "Network Allowlisting", text: "You control exactly where data goes. Tools can only reach endpoints you've pre-approved. No silent phone-home, no data exfil to unknown servers." },
];

const RISKS = [
  { title: "Prompt injection can dump your secrets.", text: "A single crafted prompt can trick the LLM into revealing every API key and password you've given it. Telling it “don't share” doesn't help." },
  { title: "Hundreds of malicious skills found on ClawHub", text: "Researchers found hundreds of community skills designed to quietly exfiltrate credentials. You won't spot them in a code review." },
  { title: "30,000+ instances exposed to the internet.", text: "Tens of thousands of OpenClaw instances are publicly reachable. Attackers are already weaponizing them." },
];

const HOSTED_CHIPS = ["Rust", "Wasm Sandbox", "Encrypted Vault", "CVM", "Endpoint Allowlist"];

const MODELS = ["Anthropic", "OpenAI", "GitHub Copilot", "Google Gemini", "MiniMax", "Mistral", "Ollama", "OpenRouter", "Together AI", "Fireworks AI"];

const COMPARE_ROWS = [
  { feature: "Language", openclaw: "TypeScript", ironclaw: "Rust" },
  { feature: "Memory Safety", openclaw: "Runtime GC", ironclaw: "Compile-time" },
  { feature: "Secret Handling", openclaw: "LLM sees secrets", ironclaw: "Encrypted vault" },
  { feature: "Tool Isolation", openclaw: "Shared process", ironclaw: "Per-tool Wasm" },
  { feature: "Prompt Injection", openclaw: "“Please don't leak”", ironclaw: "Architectural" },
  { feature: "Network Control", openclaw: "Unrestricted", ironclaw: "Allowlist" },
];

const PRICING_TIERS = [
  {
    name: "Starter", badge: null, priceStruck: "$5", price: "$0", period: "/month",
    description: "Activate 1 agent instance in our secure environment, and use NEAR AI Inference to power your agent",
    bullets: ["Secure deployment", "Trusted Execution Environment", "NEAR AI Inference", "$5 credits included"],
  },
  {
    name: "Basic", badge: "Popular", priceStruck: null, price: "$20", period: "/month",
    description: "Everything you need to get started, plus credits to get up and running quickly with up to 2 agent instances",
    bullets: ["Everything in Starter", "Shared across all deployments", "Usage pooling", "$20 credits included"],
  },
  {
    name: "Pro+", badge: null, priceStruck: null, price: "$200", period: "/month",
    description: "Activate up to 5 agent instances in our environment, plus advanced features and more credits for high usage",
    bullets: ["Everything in Basic", "Early access to advanced models", "Priority support", "$200 credits included"],
  },
];

export default function IronClawPage() {
  return (
    <div className="relative w-full font-sans bg-[#e4e4e4] text-[#101010]">
      <AnimationsProvider />
      <div className="relative w-full flex flex-col">

        {/* HERO */}
        <section data-hero-section className="relative min-h-dvh flex flex-col bg-gradient-to-b from-[#525252] from-[35%] to-[#ECECEC]">
          <GridLines variant="dark" />

          <div className="relative z-30 flex flex-col flex-1 mx-auto w-full max-w-[1920px] px-5 sm:px-10 lg:px-20">
            <SiteHeader />

            <main className="flex-grow flex flex-col md:flex-row items-center pb-24 gap-8">
              <div className="w-full md:w-1/2 flex flex-col pt-8 lg:pt-12">
                <div className="flex items-center gap-1.5 mb-6">
                  <span className="[font-size:0.6875rem] lg:text-[0.6875rem] uppercase tracking-widest text-white/60">Built by</span>
                  <Image src="/ironclaw/near-logo-black.svg" alt="NEAR" width={22} height={20} className="invert opacity-80 w-auto h-5" />
                  <span className="[font-size:0.6875rem] lg:text-[0.6875rem] uppercase tracking-widest text-white/60">Near Foundation</span>
                </div>
                <h1 data-reveal-hero-h1 className="text-balance text-white leading-[1.05] font-medium tracking-tight mb-6" style={{ fontSize: "var(--font-size-h1)" }}>
                  Do what you do best, IronClaw will do the rest.
                </h1>
                <p className="text-pretty text-white/70 [font-size:var(--font-size-body)] font-mono leading-relaxed mb-8 max-w-[480px]">
                  An open-source agent for your busywork — in encrypted enclaves, where your secrets never touch the model.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <PillButton href="#use-cases" label="Discover use cases" />
                  <PillButton href="https://github.com/nearai/ironclaw" target="_blank" rel="noopener noreferrer" label="View source" className="text-white border-white/25 hover:bg-white/10" />
                </div>
              </div>

              <div className="w-full md:w-1/2 flex items-center justify-center">
                <Image
                  src="/ironclaw/iron-claw-guy.png"
                  alt="IronClaw"
                  width={1024}
                  height={1536}
                  priority
                  className="w-[220px] sm:w-[280px] lg:w-[340px] h-auto object-contain"
                />
              </div>
            </main>
          </div>
        </section>

        {/* USE CASES */}
        <section id="use-cases" className="relative flex flex-col py-16 lg:py-24 bg-[#ECECEC]">
          <GridLines variant="light" />
          <div className="relative z-10 mx-auto w-full max-w-[1920px] px-5 sm:px-10 lg:px-20">
            <span className="font-mono [font-size:0.75rem] uppercase tracking-[0.15em] text-muted">Explore</span>
            <h2 className="text-pretty text-[#101010] font-medium leading-[1.15] tracking-tight [font-size:var(--font-size-h2)] mt-2 mb-4">
              More you can hand off.
            </h2>
            <p className="text-pretty font-mono text-muted leading-relaxed [font-size:var(--font-size-body)] max-w-[720px] mb-10">
              You don&apos;t need to pick anything to get started — just open your agent above. But if you&apos;re curious, here&apos;s a taste of what IronClaw takes off your plate. Tap any to start it in your agent; it sets itself up in chat, then runs on its own.
            </p>

            <UseCaseFilter items={USE_CASES} />

            <p className="text-pretty font-mono text-muted leading-relaxed [font-size:var(--font-size-body)] mt-10">
              Missing yours? IronClaw builds new tools and connectors on the fly — just ask it in chat.
            </p>
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section id="integrations" className="relative py-16 lg:py-24 bg-[#ECECEC]">
          <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-10 lg:px-20 mb-12">
            <span className="font-mono [font-size:0.75rem] uppercase tracking-[0.15em] text-muted">Integrations</span>
            <h2 className="text-pretty text-[#101010] font-medium leading-[1.15] tracking-tight [font-size:var(--font-size-h2)] mt-2 mb-4">
              Works with your stack.
            </h2>
            <p className="text-pretty font-mono text-muted leading-relaxed [font-size:var(--font-size-body)] max-w-[720px]">
              Email, calendars, chat, code, tickets — your agent plugs into the tools you already use. Click any of them for automations you can hand off right now. Missing one? It builds the connector itself.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Marquee items={INTEGRATIONS_ROW_1} />
            <Marquee items={INTEGRATIONS_ROW_2} reverse />
          </div>

          <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-10 lg:px-20 mt-12">
            <p className="text-pretty font-mono text-muted leading-relaxed [font-size:var(--font-size-body)]">
              ...and anything with an API: IronClaw builds and sandboxes new tools on the fly — just describe what you need.
            </p>
          </div>
        </section>

        {/* STATS STRIP */}
        <section className="relative bg-[#ECECEC]">
          <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-10 lg:px-20 py-10 border-t border-[#CAC8C8]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((stat) => (
                <div key={stat} className="font-mono [font-size:0.75rem] uppercase tracking-widest text-muted text-center md:text-left">
                  {stat}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" data-b2-section className="relative bg-[#ECECEC] py-20 lg:py-32 overflow-hidden">
          <div className="relative z-10 mx-auto w-full max-w-[1920px] px-5 sm:px-10 lg:px-20">
            <h2 className="font-sans font-medium leading-[1.1] tracking-tight text-[#101010] mb-10 [font-size:var(--font-size-h2)]">
              From zero to secure agent in minutes.
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-16 items-center">

              <ConcentricRings />

              <div className="order-1 lg:order-1">
                <div className="mb-10">
                  {HOW_IT_WORKS.map(({ label, text }, i, arr) => (
                    <div key={label} className={`relative ${i !== 0 ? "pt-6" : ""} pb-6 flex flex-col gap-2`}>
                      {i !== 0 && <div className="absolute top-0 left-0 right-0 h-px bg-[#101010]/10 z-[5]" />}
                      {i === arr.length - 1 && <div className="absolute bottom-0 left-0 right-0 h-px bg-[#101010]/10 z-[5]" />}
                      <span className="text-[#101010] font-medium tracking-[0.02em] [font-size:var(--font-size-h3)]">{label}</span>
                      <p className="text-pretty text-muted leading-[1.6]" style={{ fontSize: "var(--font-size-body)" }}>{text}</p>
                    </div>
                  ))}
                </div>
                <PillButton href="https://docs.ironclaw.com" target="_blank" rel="noopener noreferrer" label="Read the docs" className="w-fit" />
              </div>

            </div>
          </div>
        </section>

        {/* SECURITY FEATURES */}
        <section id="features" className="relative py-16 lg:py-24 bg-[#ECECEC]">
          <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-10 lg:px-20">
            <h2 className="text-pretty text-[#101010] font-medium leading-[1.15] tracking-tight [font-size:var(--font-size-h2)] mb-10">
              Security you don&apos;t have to think about.
            </h2>
            <div data-reveal-group className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SECURITY_FEATURES.map(({ title, text }) => (
                <div key={title} data-reveal-item className="rounded-[2rem] border border-[#CAC8C8] p-8 flex flex-col gap-4">
                  <h3 className="font-medium leading-[1.15] text-[#101010] [font-size:var(--font-size-h3)]">{title}</h3>
                  <p className="text-pretty font-mono text-muted leading-[1.6] [font-size:var(--font-size-body)]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OPENCLAW PROBLEM */}
        <section id="why-switch" className="relative py-16 lg:py-24 bg-[#ECECEC]">
          <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-10 lg:px-20">
            <span className="font-mono [font-size:0.75rem] uppercase tracking-[0.15em] text-muted">OpenClaw Problem</span>
            <h2 className="text-pretty text-[#101010] font-medium leading-[1.15] tracking-tight [font-size:var(--font-size-h2)] mt-2 mb-4 max-w-[900px]">
              Empower your agent with full system access and persistent memory while still protecting your secrets.
            </h2>
            <p className="text-pretty font-mono text-muted leading-relaxed [font-size:var(--font-size-body)] max-w-[720px] mb-12">
              OpenClaw unlocks the agentic future but it also risks exposing your secrets. Credentials can be exposed through prompt injections. Malicious skills exist to steal passwords. If you&apos;re running OpenClaw by itself with anything sensitive, there are significant risks.
            </p>

            <ul data-reveal-group className="flex flex-col gap-8">
              {RISKS.map(({ title, text }, i) => (
                <li key={title} data-reveal-item className="flex gap-4 lg:gap-6">
                  <span className="shrink-0 font-mono text-muted [font-size:var(--font-size-h3)] leading-none">{i + 1}</span>
                  <div className="flex flex-col gap-1.5">
                    <p className="font-medium text-[#101010] [font-size:var(--font-size-body)]">{title}</p>
                    <p className="text-pretty font-mono text-muted leading-relaxed [font-size:var(--font-size-body)]">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* HOSTED SOLUTION */}
        <section className="relative py-16 lg:py-24 bg-[#ECECEC]">
          <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-10 lg:px-20">
            <span className="font-mono [font-size:0.75rem] uppercase tracking-[0.15em] text-muted">How IronClaw Fixes This</span>
            <h2 className="text-pretty text-[#101010] font-medium leading-[1.15] tracking-tight [font-size:var(--font-size-h2)] mt-2 mb-6">
              The Hosted Solution.
            </h2>
            <p className="text-pretty font-mono text-muted leading-relaxed [font-size:var(--font-size-body)] max-w-[720px] mb-3">
              Running IronClaw on NEAR AI Cloud, your credentials live in an encrypted vault empowering your agent with full system access and persistent memory while still protecting your secrets.
            </p>
            <p className="text-pretty font-mono text-muted leading-relaxed [font-size:var(--font-size-body)] max-w-[720px] mb-10">
              Every tool runs in its own WebAssembly sandbox with no filesystem access and no outbound connections beyond your allowlist. The entire runtime is Rust — no garbage collector, no buffer overflows, no use-after-free.
            </p>

            <div className="flex flex-wrap gap-3 mb-16">
              {HOSTED_CHIPS.map((chip) => (
                <span key={chip} className="rounded-full border border-[#101010]/25 px-4 py-1.5 font-mono [font-size:0.75rem] uppercase tracking-widest text-[#101010]">
                  {chip}
                </span>
              ))}
            </div>

            <span className="block font-mono [font-size:0.75rem] uppercase tracking-[0.15em] text-muted mb-4">Model-agnostic · compatible with</span>
            <Marquee items={MODELS} />
          </div>
        </section>

        {/* COMPARE */}
        <section id="compare" className="relative py-16 lg:py-24 bg-[#ECECEC]">
          <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-10 lg:px-20">
            <h2 className="text-pretty text-[#101010] font-medium leading-[1.15] tracking-tight [font-size:var(--font-size-h2)] mb-4 max-w-[900px]">
              Everything you like about OpenClaw. Nothing you&apos;re worried about.
            </h2>
            <p className="text-pretty font-mono text-muted leading-relaxed [font-size:var(--font-size-body)] max-w-[720px] mb-10">
              Choose a NEAR AI deployment based on your performance requirements and preferred agent. You get NEAR security no matter what.
            </p>

            <div className="overflow-x-auto rounded-[2rem] border border-[#CAC8C8]">
              <table className="w-full min-w-[560px] border-collapse">
                <thead>
                  <tr className="border-b border-[#CAC8C8]">
                    <th className="text-left font-mono [font-size:0.75rem] uppercase tracking-widest text-muted font-normal p-5">Feature</th>
                    <th className="text-left font-mono [font-size:0.75rem] uppercase tracking-widest text-muted font-normal p-5">OpenClaw</th>
                    <th className="text-left font-mono [font-size:0.75rem] uppercase tracking-widest text-[#101010] font-normal p-5">IronClaw</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row, i) => (
                    <tr key={row.feature} className={i !== COMPARE_ROWS.length - 1 ? "border-b border-[#CAC8C8]" : ""}>
                      <td className="p-5 font-medium text-[#101010] [font-size:var(--font-size-body)]">{row.feature}</td>
                      <td className="p-5 font-mono text-muted [font-size:var(--font-size-body)]">{row.openclaw}</td>
                      <td className="p-5 font-mono text-[#101010] [font-size:var(--font-size-body)]">{row.ironclaw}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="relative py-16 lg:py-24 bg-[#ECECEC]">
          <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-10 lg:px-20">
            <h2 className="text-pretty text-[#101010] font-medium leading-[1.15] tracking-tight [font-size:var(--font-size-h2)] mb-4">
              Deploy Secure Agents. No Hardware Required.
            </h2>
            <p className="text-pretty font-mono text-muted leading-relaxed [font-size:var(--font-size-body)] max-w-[720px] mb-12">
              Spin up to 5 agents in a Trusted Execution Environment with up to 130M tokens per month — no cloud setup, no infrastructure. Just a simple frontend and you&apos;re live.
            </p>

            <div data-reveal-group className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PRICING_TIERS.map((tier) => (
                <div key={tier.name} data-reveal-item className="rounded-[2rem] border border-[#CAC8C8] p-8 flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="font-mono [font-size:0.75rem] uppercase tracking-widest text-muted">{tier.name}</span>
                    {tier.badge && (
                      <span className="rounded-full bg-[#101010] text-[#ECECEC] px-2.5 py-0.5 font-mono [font-size:0.625rem] uppercase tracking-widest">{tier.badge}</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-6">
                    {tier.priceStruck && <span className="text-muted line-through [font-size:var(--font-size-h3)]">{tier.priceStruck}</span>}
                    <span className="font-medium text-[#101010] [font-size:var(--font-size-h2)]">{tier.price}</span>
                    <span className="font-mono text-muted [font-size:var(--font-size-body)]">{tier.period}</span>
                  </div>
                  <p className="text-pretty font-mono text-muted leading-relaxed [font-size:var(--font-size-body)] mb-8">
                    {tier.description}
                  </p>
                  <ul className="flex flex-col gap-3 mb-10">
                    {tier.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 font-mono text-[#101010] [font-size:var(--font-size-body)]">
                        <span className="text-muted">›</span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <PillButton href="https://agent.near.ai" target="_blank" rel="noopener noreferrer" label="Get started" className="mt-auto w-fit" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CLOSING CTA */}
        <section className="relative bg-[linear-gradient(to_bottom,#ECECEC_33%,#575757_100%)]">
          <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-10 lg:px-20">
            <div className="relative w-full rounded-[2rem] overflow-hidden min-h-[420px] lg:min-h-[480px] flex flex-col bg-gradient-to-b from-[#F3F3F3] via-[#E2E1E1] to-[#FCFCFC]">
              <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                <Image src="/ironclaw/ironclaw-logo.png" alt="" width={675} height={245} className="w-[420px] sm:w-[560px] lg:w-[700px] h-auto object-contain opacity-15" />
              </div>
              <div className="relative z-10 flex flex-col flex-1 items-center justify-center text-center px-6 py-12 md:py-16 lg:py-20 gap-8">
                <div className="flex flex-col items-center gap-4 max-w-[1280px]">
                  <h2 data-reveal className="text-balance font-medium leading-[1.1] tracking-tight text-[#101010] [font-size:var(--font-size-h2)]" style={{ textWrap: "balance" }}>
                    Deploy an AI agent you can actually trust.
                  </h2>
                  <p data-reveal className="text-pretty font-mono [font-size:var(--font-size-body)] text-muted leading-[1.9]" style={{ textWrap: "balance" }}>
                    Open source. One-click deploy on NEAR AI Cloud. Your secrets never leave the encrypted vault.
                  </p>
                </div>
                <PillButton data-reveal href="https://github.com/nearai/ironclaw" target="_blank" rel="noopener noreferrer" label="Star on GitHub" />
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
