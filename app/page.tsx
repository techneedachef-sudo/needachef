import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/general/Hero";
import { Services } from "@/components/general/Services";
import { ChefLevels } from "@/components/general/ChefLevels";
import { Testimonials } from "@/components/general/Testimonials";
import { Shop } from "@/components/general/Shop";
import { Promo } from "@/components/general/Promo";
import { AnimatedSection } from "@/components/general/AnimatedSection";
import { AnimatedDivider } from "@/components/general/AnimatedDivider";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <AnimatedDivider />

        <AnimatedSection>
          <Services />
        </AnimatedSection>
        <AnimatedDivider />

        <AnimatedSection>
          <ChefLevels />
        </AnimatedSection>
        <AnimatedDivider />

        <AnimatedSection>
          <Testimonials />
        </AnimatedSection>
        <AnimatedDivider />

        <AnimatedSection>
          <Shop />
        </AnimatedSection>
        <AnimatedDivider />

        <AnimatedSection>
          <Promo />
        </AnimatedSection>
        <AnimatedDivider />
      </main>
      <AnimatedSection>
        <Footer />
      </AnimatedSection>
    </>
  );
}
