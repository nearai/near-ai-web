"use client";

import { useState } from "react";
import GetInTouchForm from "@/components/site/GetInTouchForm";

export default function GetInTouchFormCard() {
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="flex gap-1.5 px-6 pb-5">
        <div className="h-0.5 flex-1 rounded-full bg-black/80" />
        <div
          className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
            step === 2 ? "bg-black/80" : "bg-black/15"
          }`}
        />
      </div>
      <GetInTouchForm onStepChange={setStep} />
    </div>
  );
}
