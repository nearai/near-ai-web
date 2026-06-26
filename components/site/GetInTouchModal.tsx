"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { XIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@near/cms-core/components/ui/dialog";

const step1Schema = z.object({
  contactName: z.string().min(1, "Your name is required"),
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
});

const step2Schema = z.object({
  solutionDescription: z.string().min(1, "Please describe your solution"),
  productCategory: z.string().min(1, "Please select a category"),
  timeZone: z.string().optional(),
});

const fullSchema = step1Schema.merge(step2Schema);
type ContactForm = z.infer<typeof fullSchema>;
type FormErrors = Partial<Record<keyof ContactForm, string>>;

const CATEGORIES = [
  "AI Agent",
  "Data Pipeline",
  "Healthcare",
  "Finance",
  "Legal",
  "Security",
  "Other",
];

const TIMEZONES = [
  "PST (UTC-8)",
  "MST (UTC-7)",
  "CST (UTC-6)",
  "EST (UTC-5)",
  "GMT / UTC",
  "CET (UTC+1)",
  "JST (UTC+9)",
  "Other",
];

const EMPTY: ContactForm = {
  contactName: "",
  companyName: "",
  email: "",
  phone: "",
  solutionDescription: "",
  productCategory: "",
  timeZone: "",
};

export default function GetInTouchModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<ContactForm>(() => ({ ...EMPTY }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedChip, setSelectedChip] = useState("");

  function reset() {
    setStep(1);
    setForm({ ...EMPTY });
    setErrors({});
    setSelectedChip("");
    setSelectedTimezone("");
  }

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) reset();
  }

  function set(field: keyof ContactForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function handleContinue() {
    const parsed = step1Schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactForm;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = fullSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactForm;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Something went wrong");
      }
      toast.success("We'll be in touch soon.");
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const firstName = form.contactName.trim().split(" ")[0];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="border border-white/40 rounded-full px-4 py-1.5 text-white/80 hover:text-white hover:border-white/70 transition-colors cursor-pointer">
          GET IN TOUCH
        </button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-md bg-white text-gray-900 overflow-hidden p-0 gap-0 rounded-2xl"
      >
        <DialogTitle className="sr-only">
          Get In Touch With The NEAR Forward Deployed Team
        </DialogTitle>

        {/* Header — 4 layers */}
        <div className="relative overflow-hidden min-h-[156px] flex flex-col justify-between p-5 bg-[#1d2e42] mx-3 mt-3 rounded-lg">

          {/* Layer 1: Blue gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1d2e42] via-[#26405c] to-[#334f6a]" />

          {/* Layer 2: Noise with blur */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
              filter: 'blur(0.6px)',
            }}
          />

          {/* Layer 3: Hero image blended over blue */}
          <img
            src="/demo-v1/background-1.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
          />

          {/* Layer 4: Dark gradient for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/80" />

          {/* Progress + close */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex gap-1.5 flex-1">
              <div className="h-0.5 flex-1 rounded-full bg-white/80" />
              <div className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                step === 2 ? "bg-white/80" : "bg-white/25"
              }`} />
            </div>
            <DialogClose asChild>
              <button
                type="button"
                className="bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white transition-colors p-1.5 rounded-lg cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </DialogClose>
          </div>

          {/* Dynamic title */}
          <div className="relative z-10">
            <h2 className="text-white font-bold text-2xl leading-snug text-balance">
              Get In Touch With The NEAR Forward Deployed Team
            </h2>
          </div>
        </div>

        {/* Sliding steps */}
        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                width: "200%",
                transform: step === 1 ? "translateX(0)" : "translateX(-50%)",
              }}
            >
              {/* ── Step 1: Who are you ── */}
              <div className="px-6 pt-5 pb-4 space-y-4" style={{ width: "50%" }}>
                <div>
                  <p className="text-base text-gray-400">
                    Tell us who you are and we&apos;ll take it from there.
                  </p>
                </div>

                <Field label="Your Name" error={errors.contactName} required>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => set("contactName", e.target.value)}
                    placeholder=""
                    className={inputCls(!!errors.contactName)}
                  />
                </Field>

                <Field label="Company" error={errors.companyName} required>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => set("companyName", e.target.value)}
                    placeholder=""
                    className={inputCls(!!errors.companyName)}
                  />
                </Field>

                <Field label="Email" error={errors.email} required>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder=""
                    className={inputCls(!!errors.email)}
                  />
                </Field>

                <Field label="Phone" error={errors.phone}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder=""
                    className={inputCls(false)}
                  />
                </Field>
              </div>

              {/* ── Step 2: What are you building ── */}
              <div className="px-6 pt-5 pb-6 space-y-4" style={{ width: "50%" }}>
                <div>
                  {firstName && (
                    <p className="text-sm text-gray-400 font-medium uppercase tracking-widest mb-1">
                      Hi, {firstName}
                    </p>
                  )}
                  <p className="text-base text-gray-400 mt-1">
                    The more context you share, the better we can prepare.
                  </p>
                </div>

                <Field
                  label="What are you trying to build?"
                  error={errors.solutionDescription}
                  required
                >
                  <textarea
                    value={form.solutionDescription}
                    onChange={(e) => set("solutionDescription", e.target.value)}
                    placeholder=""
                    rows={2}
                    className={inputCls(!!errors.solutionDescription)}
                  />
                </Field>

                {/* Category chips */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-base font-medium text-gray-700">
                    What best describes your project?
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedChip(cat);
                          if (cat !== "Other") {
                            set("productCategory", cat);
                          } else {
                            set("productCategory", "");
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                          selectedChip === cat
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  {selectedChip === "Other" && (
                    <input
                      type="text"
                      autoFocus
                      value={form.productCategory}
                      onChange={(e) => set("productCategory", e.target.value)}
                      placeholder="Describe your product or category"
                      className={inputCls(!!errors.productCategory)}
                    />
                  )}
                  {errors.productCategory && (
                    <p className="text-sm text-red-500">{errors.productCategory}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-base font-medium text-gray-700">
                    Best time zone to contact
                  </label>
                  <select
                    value={form.timeZone ?? ""}
                    onChange={(e) => {
                      set("timeZone", e.target.value);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-base text-gray-700 outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 bg-white cursor-pointer"
                  >
                    <option value="">Select a time zone…</option>
                    {TIMEZONES.filter((tz) => tz !== "Other").map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                  {form.timeZone === "Other" && (
                    <input
                      type="text"
                      autoFocus
                      value={form.timeZone ?? ""}
                      onChange={(e) => set("timeZone", e.target.value)}
                      placeholder="Enter your time zone"
                      className={inputCls(false)}
                    />
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Buttons — always pinned to bottom of the card */}
          <div className="px-6 pb-6">
            {step === 1 ? (
              <button
                type="button"
                onClick={handleContinue}
                className="w-full bg-black text-white py-2.5 rounded-lg text-base font-medium hover:bg-black/85 transition-colors cursor-pointer"
              >
                Tell us about your project →
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-base font-medium hover:border-gray-400 transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] bg-black text-white py-2.5 rounded-lg text-base font-medium hover:bg-black/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending..." : "Request a Discovery Call"}
                </button>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function inputCls(hasError: boolean) {
  return [
    "w-full rounded-lg border px-3 py-2 text-base outline-none transition-colors",
    "focus:ring-2 focus:ring-black/10 focus:border-gray-400",
    hasError
      ? "border-red-400 bg-red-50 focus:ring-red-200"
      : "border-gray-200 bg-gray-50",
  ].join(" ");
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-base font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
