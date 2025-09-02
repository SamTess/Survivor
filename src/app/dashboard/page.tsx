"use client";

import StatsSection from "@/components/dashboard/StatsSection";
import StartupForm from "@/components/dashboard/StartupForm";
import EventsNewsManager from "@/components/dashboard/EventsNewsManager";
import { useEffect, useRef, useState } from "react";
import Dock from "@/components/ui/Dock";
import { FaChartLine, FaRocket, FaNewspaper } from "react-icons/fa";

export default function Dashboard() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0); // 0=Stats, 1=Startup, 2=Events/News

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
    // Update on resize so index aligns after container changes width
    const ro = new ResizeObserver(() => onScroll());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, []);

  return (
    <>
      <div className="min-h-screen  min-w-screen bg-gray-50 pt-14 overflow-hidden">
        <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-7xl flex-col px-4 min-w-screen">
          <div className="relative flex-1 min-h-0 py-4 ">
            <div
              ref={scrollRef}
              className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth gap-4 rounded-xl scrollbar-none"
              aria-label="Dashboard sections"
            >
              <section className="snap-start shrink-0 w-full h-full overflow-y-auto pr-1 justify-center flex">
                <div className="space-y-6 max-w-[70rem] p-2">
                  <StatsSection />
                </div>
              </section>
              <section className="snap-start shrink-0 w-full h-full overflow-y-auto pr-1 justify-center flex">
                <div className="space-y-6 max-w-[70rem] px-4 ">
                  <StartupForm />
                </div>
              </section>
              <section className="snap-start shrink-0 w-full h-full overflow-y-auto pr-1 justify-center flex">
                <div className="space-y-6 max-w-[70rem] px-4 ">
                  <EventsNewsManager />
                </div>
              </section>
            </div>

            <nav className="fixed inset-x-0 bottom-4 z-40 flex items-center justify-center" aria-label="Slide navigation">
              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur animate-fade-in-up">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-current={active === i}
                    aria-label={`Go to section ${i + 1}`}
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                      active === i ? "bg-gray-900" : "bg-gray-400 hover:bg-gray-500"
                    }`}
                  />
                ))}
              </div>
            </nav>
          </div>
        </div>
      </div>
      <Dock className="fixed bottom-15 right-4 z-10 border-none"  items={[
        {
          label: "Project statistics",
          icon: <FaChartLine className="text-white text-lg" />,
          onClick: () => goTo(0)
        },
        {
          label: "Startup overview",
          icon: <FaRocket className="text-white text-lg" />,
          onClick: () => goTo(1)
        },
        {
          label: "News & Events",
          icon: <FaNewspaper className="text-white text-lg" />,
          onClick: () => goTo(2)
        },
      ]} />
    </>
  );
}
