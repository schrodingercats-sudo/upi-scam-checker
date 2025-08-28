import Hero from "@/app/components/Hero";
import Features from "@/app/components/Features";
import HowItWorks from "@/app/components/HowItWorks";
import ApiSection from "@/app/components/ApiSection";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Hero />
      <Features />
      <HowItWorks />
      <ApiSection />
      <Footer />
    </div>
  );
}