import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Motion } from "@/components/providers/Motion";
import { Cursor } from "@/components/ui/Cursor";
import { Scramble } from "@/components/ui/Scramble";
import { ScrollRail } from "@/components/ui/ScrollRail";
import { Preloader } from "@/components/sections/Preloader";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { Services } from "@/components/sections/Services";
import { Tech } from "@/components/sections/Tech";
import { Process } from "@/components/sections/Process";
import { AiDemo } from "@/components/sections/AiDemo";
import { WhyUs } from "@/components/sections/WhyUs";
import { Kinetic } from "@/components/sections/Kinetic";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

export default function Page() {
  return (
    <SmoothScroll>
      <Motion>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[130] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-ink-0">
        Перейти к содержимому
      </a>
      <Preloader />
      <Header />
      <main id="main">
        <Hero />
        <Manifesto />
        <Services />
        <Tech />
        <Process />
        <AiDemo />
        <WhyUs />
        <Kinetic />
        <Contact />
      </main>
      <Footer />
      <Cursor />
      <ScrollRail />
      <Scramble />
      <div aria-hidden className="vignette" />
      <div aria-hidden className="grain" />
      </Motion>
    </SmoothScroll>
  );
}
