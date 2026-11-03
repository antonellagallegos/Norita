import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { pageHead } from "@/lib/page-head";
import { PrivacyPolicy } from "@/components/privacy-policy";

export const Route = createFileRoute("/privacidad")({ head: () => pageHead("Política de privacidad | Norita", "Cómo trata Norita los datos personales que recibe a través de su sitio web y su formulario de contacto, y cómo ejercer tus derechos."), component: Privacy });
function Privacy() { return <main className="mx-auto min-h-screen max-w-3xl px-5 py-8 sm:px-8 sm:py-12"><Button asChild variant="link" className="mb-8 p-0"><Link to="/"><ArrowLeft /> Volver a Norita</Link></Button><PrivacyPolicy /><div className="mt-12 border-t border-border pt-8"><Button asChild variant="outline" className="h-12"><Link to="/contacto">Ir al formulario de contacto <ArrowRight /></Link></Button></div></main>; }
