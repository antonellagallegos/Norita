import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/brand";
export function FloatingContact() { return <Button asChild size="icon" className="floating-contact fixed bottom-5 right-5 z-30 h-12 w-12 rounded-full bg-whatsapp text-primary-foreground shadow-soft hover:bg-whatsapp/90"><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp"><MessageCircle className="h-7 w-7" /></a></Button>; }