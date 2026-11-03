import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { pageHead } from "@/lib/page-head";
import { PrivacyPolicy } from "@/components/privacy-policy";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/privacidad")({ head: () => pageHead("Política de privacidad | Norita", "Cómo trata Norita los datos personales que recibe a través de su sitio web y su formulario de contacto, y cómo ejercer tus derechos."), component: Privacy });
function Privacy() { return <div className="bg-background text-foreground"><SiteHeader /><main className="frame py-10 md:py-16"><div className="mx-auto max-w-4xl"><PrivacyPolicy /><div className="mt-14 border-t border-border pt-8"><Button asChild variant="outline" size="lg"><Link to="/contacto">Ir al formulario de contacto <ArrowRight /></Link></Button></div></div></main><SiteFooter /></div>; }
