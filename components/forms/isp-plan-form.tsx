"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ISPS } from "@/lib/data/isps";
import { IspSelector } from "@/components/forms/isp-selector";
import { PlanSelector } from "@/components/forms/plan-selector";
import { Button } from "@/components/ui/button";

export function IspPlanForm() {
  const router = useRouter();
  const [ispId, setIspId] = useState("");
  const [planId, setPlanId] = useState("");

  const plans = useMemo(() => {
    return ISPS.find((isp) => isp.id === ispId)?.plans ?? [];
  }, [ispId]);

  const handleStart = () => {
    if (!ispId || !planId) return;
    router.push(`/test?isp=${encodeURIComponent(ispId)}&plan=${encodeURIComponent(planId)}`);
  };

  return (
    <div className="space-y-6">
      <IspSelector
        value={ispId}
        onChange={(value) => {
          setIspId(value);
          setPlanId("");
        }}
      />
      <PlanSelector
        value={planId}
        onChange={setPlanId}
        plans={plans}
        disabled={!ispId}
      />
      <Button
        size="lg"
        className="w-full"
        onClick={handleStart}
        disabled={!ispId || !planId}
      >
        Start Audit
      </Button>
    </div>
  );
}
