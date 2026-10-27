import { describe, expect, it } from "vitest";
import { BRAND, whatsappUrl } from "@/lib/brand";

describe("Norita WhatsApp contact", () => {
  it("directs default and service messages to +51947833628", () => {
    expect(BRAND.whatsappNumber).toBe("51947833628");
    for (const url of [whatsappUrl(), whatsappUrl("Consulta de acompañamiento")]) {
      expect(new URL(url).origin).toBe("https://wa.me");
      expect(new URL(url).pathname).toBe("/51947833628");
    }
  });
});