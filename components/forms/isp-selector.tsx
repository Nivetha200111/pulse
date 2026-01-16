import { ISPS } from "@/lib/data/isps";
import { Select } from "@/components/ui/select";

interface IspSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function IspSelector({ value, onChange }: IspSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
        ISP
      </label>
      <Select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select your ISP</option>
        {ISPS.map((isp) => (
          <option key={isp.id} value={isp.id}>
            {isp.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
