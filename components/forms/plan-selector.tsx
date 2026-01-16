import type { ISPPlan } from "@/types/isp";
import { Select } from "@/components/ui/select";

interface PlanSelectorProps {
  value: string;
  onChange: (value: string) => void;
  plans: ISPPlan[];
  disabled?: boolean;
}

export function PlanSelector({
  value,
  onChange,
  plans,
  disabled,
}: PlanSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
        Plan
      </label>
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        <option value="">Select your plan</option>
        {plans.map((plan) => (
          <option key={plan.id} value={plan.id}>
            {plan.name} — {plan.speed} Mbps
          </option>
        ))}
      </Select>
    </div>
  );
}
