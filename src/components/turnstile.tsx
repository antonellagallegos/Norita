import { useEffect, useRef } from "react";
import { TURNSTILE_SITE_KEY } from "@/lib/contact-config";

type Turnstile = {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  remove: (id: string) => void;
};

// Cloudflare Turnstile widget. `action` must match the one the server checks for that form.
export function Captcha({
  onToken,
  action = "norita_contact",
}: {
  onToken: (token: string) => void;
  action?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let widget: string | undefined;
    let cancelled = false;
    const win = window as Window & { turnstile?: Turnstile };
    const render = () => {
      if (!cancelled && ref.current && win.turnstile)
        widget = win.turnstile.render(ref.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action,
          callback: onToken,
          "expired-callback": () => onToken(""),
          "error-callback": () => onToken(""),
        });
    };
    const existing = document.getElementById("norita-turnstile");
    if (win.turnstile) render();
    else if (existing) existing.addEventListener("load", render, { once: true });
    else {
      const script = document.createElement("script");
      script.id = "norita-turnstile";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.addEventListener("load", render, { once: true });
      document.head.appendChild(script);
    }
    return () => {
      cancelled = true;
      existing?.removeEventListener("load", render);
      if (widget && win.turnstile) win.turnstile.remove(widget);
    };
  }, [onToken, action]);
  return <div ref={ref} />;
}
