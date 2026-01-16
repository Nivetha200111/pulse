import Image from "next/image";
import type { SpeedTestResult } from "@/types/speed-test";
import { buildInvoiceOgUrl } from "@/lib/utils/share";
import { Card } from "@/components/ui/card";

interface InvoicePreviewProps {
  result: SpeedTestResult;
}

export function InvoicePreview({ result }: InvoicePreviewProps) {
  const url = buildInvoiceOgUrl(result);
  return (
    <Card className="space-y-4">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
        Shareable invoice
      </p>
      <div className="relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)]">
        <Image
          src={url}
          alt="Pulse invoice preview"
          width={1200}
          height={630}
          className="h-auto w-full"
          unoptimized
          loader={() => url}
        />
      </div>
    </Card>
  );
}
