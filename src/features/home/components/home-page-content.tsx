"use client";

import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSlider } from "./hero-slider";
import { PopularDestinations } from "./popular-destinations";
import { TopHotels } from "./top-hotels";
import { BestPackages } from "./best-packages";
import { SpecialOffers } from "./special-offers";
import { Testimonials } from "./testimonials";
import { FaqSection } from "./faq-section";

export function HomePageContent() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteNavbar />
      <main className="flex-1">
        <HeroSlider />
        <PopularDestinations />
        <TopHotels />
        <BestPackages />
        <SpecialOffers />
        <Testimonials />
        <FaqSection />
      </main>
      <SiteFooter />
    </div>
  );
}
