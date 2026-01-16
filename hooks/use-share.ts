import { useCallback, useState } from "react";
import type { SpeedTestResult } from "@/types/speed-test";
import { buildInvoiceOgUrl, buildShareText } from "@/lib/utils/share";

export function useShare(result: SpeedTestResult | null, shareUrl: string) {
  const [copied, setCopied] = useState(false);

  const shareText = result ? buildShareText(result) : "";
  const ogUrl = result ? buildInvoiceOgUrl(result) : "";

  const shareOnX = useCallback(() => {
    if (!result) return;
    const url = new URL("https://twitter.com/intent/tweet");
    url.searchParams.set("text", shareText);
    url.searchParams.set("url", shareUrl);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }, [result, shareText, shareUrl]);

  const shareOnWhatsApp = useCallback(() => {
    if (!result) return;
    const url = new URL("https://wa.me/");
    url.searchParams.set("text", `${shareText}\n\n${shareUrl}`);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }, [result, shareText, shareUrl]);

  const copyLink = useCallback(async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const downloadInvoice = useCallback(async () => {
    if (!ogUrl) return;
    const response = await fetch(ogUrl);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `pulse-invoice-${result?.id ?? "audit"}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [ogUrl, result]);

  return {
    copied,
    shareOnX,
    shareOnWhatsApp,
    copyLink,
    downloadInvoice,
  };
}
