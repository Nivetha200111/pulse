"use client";

import type { SpeedTestResult } from "@/types/speed-test";
import { useShare } from "@/hooks/use-share";
import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  result: SpeedTestResult;
  shareUrl: string;
}

export function ShareButtons({ result, shareUrl }: ShareButtonsProps) {
  const { copied, shareOnX, shareOnWhatsApp, copyLink, downloadInvoice } =
    useShare(result, shareUrl);

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Button onClick={shareOnX}>Share on X</Button>
      <Button variant="outline" onClick={shareOnWhatsApp}>
        WhatsApp
      </Button>
      <Button variant="outline" onClick={copyLink}>
        {copied ? "Copied" : "Copy Link"}
      </Button>
      <Button variant="ghost" onClick={downloadInvoice}>
        Download Image
      </Button>
    </div>
  );
}
