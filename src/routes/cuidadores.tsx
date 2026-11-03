import { createFileRoute } from "@tanstack/react-router";
import { useScrollReveal } from "@/components/brand";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import {
  ApplicationSection,
  BenefitsMosaic,
  CaregiverFaq,
  CaregiverHero,
  CaregiverValue,
  CommunitySection,
  OnboardingSteps,
  TrainingSection,
} from "@/components/caregivers/sections";
import { pageHead } from "@/lib/page-head";

// Caregiver funnel: separate from the family landing (/) and from /contacto, with its own form and table.
export const Route = createFileRoute("/cuidadores")({
  head: () =>
    pageHead(
      "Trabaja con Norita | Oportunidades para cuidadores en Lima y Bogotá",
      "Trabajo por horas y horarios flexibles, formación, certificación y acompañamiento para cuidadores de adultos mayores. Postula a Norita.",
    ),
  component: CaregiversPage,
});

function CaregiversPage() {
  useScrollReveal();
  return (
    <div className="bg-background text-foreground">
      <SiteHeader audience="caregivers" />
      <main className="overflow-x-clip">
        <CaregiverHero />
        <CaregiverValue />
        <BenefitsMosaic />
        <OnboardingSteps />
        <TrainingSection />
        <CommunitySection />
        <CaregiverFaq />
        <ApplicationSection />
      </main>
      <SiteFooter audience="caregivers" />
    </div>
  );
}
