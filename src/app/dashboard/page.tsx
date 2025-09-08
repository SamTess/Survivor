"use client";

import StatsSection from "@/components/dashboard/StatsSection";
import StartupForm from "@/components/dashboard/StartupForm";
import EventsNewsManager from "@/components/dashboard/EventsNewsManager";
import { useEffect, useRef, useState } from "react";
import Dock from "@/components/ui/Dock";
import { FaChartLine, FaRocket, FaNewspaper, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ProtectedRoute } from "@/context/auth";

export default function Dashboard() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0); // 0=Stats, 1=Startup, 2=Events/News
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768); // md breakpoint
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  function goTo(index: number) {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.clientWidth;
    el.scrollTo({ left: index * w, behavior: "smooth" });
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const w = el.clientWidth || 1;
      const idx = Math.round(el.scrollLeft / w);
      setActive(Math.max(0, Math.min(2, idx)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => onScroll());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex h-full w-screen fixed flex-col mx-auto">
          <div
            ref={scrollRef}
            className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth gap-4 rounded-2xl scrollbar-none"
            aria-label="Dashboard sections"
          >
            <section className="snap-start pt-20 shrink-0 w-full h-full overflow-y-auto justify-center flex">
              <div className="space-y-6 max-w-6xl px-4">
                <StatsSection />
              </div>
            </section>
            <section className="snap-start pt-20 shrink-0 w-full h-full overflow-y-auto justify-center flex">
              <div className="space-y-6 max-w-6xl px-4 ">
                <StartupForm />
              </div>
            </section>
            <section className="snap-start pt-20 shrink-0 w-full h-full overflow-y-auto justify-center flex">
              <div className="space-y-6 max-w-6xl px-4 ">
                <EventsNewsManager />
              </div>
            </section>
          </div>

          {/* Floating Navigation Arrows for Desktop */}
          {isDesktop && (
            <>
              {/* Left Arrow */}
              {active > 0 && (
                <button
                  onClick={() => goTo(active - 1)}
                  className="fixed left-8 top-1/2 -translate-y-1/2 z-40 group"
                  aria-label="Previous section"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-card/90 border border-border/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <FaChevronLeft className="text-muted-foreground group-hover:text-primary transition-colors duration-200" size={16} />
                  </div>
                </button>
              )}

              {/* Right Arrow */}
              {active < 2 && (
                <button
                  onClick={() => goTo(active + 1)}
                  className="fixed right-8 top-1/2 -translate-y-1/2 z-40 group"
                  aria-label="Next section"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-card/90 border border-border/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <FaChevronRight className="text-muted-foreground group-hover:text-primary transition-colors duration-200" size={16} />
                  </div>
                </button>
              )}
            </>
          )}

          <nav className="fixed inset-x-0 bottom-4 z-40 flex items-center justify-center" aria-label="Slide navigation">
            <div className="flex items-center gap-2 rounded-2xl border border-border/20 bg-card/90 px-3 py-2 shadow-sm animate-fade-in-up">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-current={active === i}
                  aria-label={`Go to section ${i + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    active === i ? "bg-foreground" : "bg-muted-foreground/50 hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </nav>
        </div>

      {/* Hide Dock on mobile devices */}
      {isDesktop && (
        <Dock className="fixed bottom-15 right-4 z-10 border-none"  items={[
          {
            label: "Project statistics",
            icon: <FaChartLine className={`${active == 0 ? "text-white text-xl" : "text-gray-400 text-md"}`} />,
            onClick: () => goTo(0)
          },
          {
            label: "Startup overview",
            icon: <FaRocket className={`${active == 1 ? "text-white text-xl" : "text-gray-400 text-md"}`} />,
            onClick: () => goTo(1)
          },
          {
            label: "News & Events",
            icon: <FaNewspaper className={`${active == 2 ? "text-white text-xl" : "text-gray-400 text-md"}`} />,
            onClick: () => goTo(2)
          },
        ]} />
      )}
    </ProtectedRoute>
  );
}
