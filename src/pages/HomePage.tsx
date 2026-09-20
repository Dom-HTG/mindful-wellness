import { Hero } from "../components/Hero";
import { Marquee } from "../components/ui/Marquee";
import { CredentialsTeaser } from "../components/sections/CredentialsTeaser";
import { ServicesTeaser } from "../components/sections/ServicesTeaser";
import { ReadinessQuiz } from "../components/ReadinessQuiz";
import { Calculator } from "../components/Calculator";
import { Testimonials } from "../components/Testimonials";
import { ChatbotSection } from "../components/chatbot/ChatbotSection";
import { Faq } from "../components/Faq";
import { CtaBanner } from "../components/CtaBanner";

const VALUES = [
  "Compassion before compliance",
  "Evidence, always",
  "The mind leads the body",
  "Care that respects your life",
  "No shame, no crash diets",
];

export function HomePage() {
  return (
    <>
      <Hero />
      <Marquee items={VALUES} />
      <CredentialsTeaser />
      <ServicesTeaser />
      <ReadinessQuiz />
      <Calculator />
      <Testimonials />
      <ChatbotSection />
      <Faq />
      <CtaBanner />
    </>
  );
}
