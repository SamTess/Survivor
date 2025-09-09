"use client";

import StatsSection from "@/components/dashboard/StatsSection";
import StartupForm from "@/components/dashboard/StartupForm";
import EventsNewsManager from "@/components/dashboard/EventsNewsManager";
import InvestorPortfolioSection from "@/components/dashboard/InvestorPortfolioSection";
import InvestmentOpportunities from "@/components/dashboard/InvestmentOpportunities";
import MarketInsights from "@/components/dashboard/MarketInsights";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Dock from "@/components/ui/Dock";
import { FaChartLine, FaRocket, FaNewspaper, FaChevronLeft, FaChevronRight, FaBriefcase, FaSearch } from "react-icons/fa";
import { FiTrendingUp } from "react-icons/fi";
import { ProtectedRoute, useAuth, apiService } from "@/context/auth";
import { InvestorApiResponse } from "@/domain/interfaces/Investor";
import { Founder } from "@/domain/interfaces/Founder";
import { StartupDetailApiResponse } from "@/domain/interfaces";

export default function Dashboard() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0); // 0=Stats, 1=Startup, 2=Events/News
  const [isDesktop, setIsDesktop] = useState(false);
  const [userInvestor, setUserInvestor] = useState<InvestorApiResponse | null>(null);
  const [userStartup, setUserStartup] = useState<StartupDetailApiResponse | null>(null);
  const [userFounders, setUserFounders] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  if (error && loading && userInvestor && userFounders) { // TODO REMOVE : USELESS CONDITION
    setError(null);
  }

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768); // md breakpoint
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Fetch user's investor or founder data based on role
  useEffect(() => {
    const fetchUserRoleData = async () => {
      if (!user || !isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('User role:', user.role, 'User ID:', user.id);

        if (user.role !== 'investor' && user.role !== 'founder') {
          console.log('User is neither investor nor founder, redirecting to profile page');
          router.push('/profile');
          return;
        }

        if (user.role === 'investor') {
          const response = await apiService.get<InvestorApiResponse>(`/users/${user.id}/investor`);
          if (response.success && response.data) {
            setUserInvestor(response.data);
            console.log('Investor data loaded:', response.data);
          } else {
            console.log('No investor data found for user, creating mock investor data');
            // Create mock investor data for demonstration
            const mockInvestor: InvestorApiResponse = {
              id: user.id,
              email: user.email || 'investor@example.com',
              name: user.name || 'Demo Investor',
              description: 'Demo investor for testing',
              investment_focus: 'FinTech, HealthTech',
              investor_type: 'Angel Investor',
              created_at: new Date().toISOString()
            };
            setUserInvestor(mockInvestor);
          }
        } else if (user.role === 'founder') {
          const response = await apiService.get<Founder[]>(`/users/${user.id}/founder`);
          if (response.success && response.data && response.data.length > 0) {
            setUserFounders(response.data);
            const startupId = response.data[0]?.startup_id;
            if (startupId) {
              const startupResponse = await apiService.get<StartupDetailApiResponse>(`/startups/${startupId}`);
              if (startupResponse.success && startupResponse.data) {
                setUserStartup(startupResponse.data);
              }
            } else {
              console.log('No startup ID found for founder');
            }
          } else {
            console.log('No founder data found for user');
          }
        }
      } catch (error) {
        console.error('Error fetching user role data:', error);
        setError('Failed to fetch user role data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoleData();
  }, [isAuthenticated]);

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

  // Debug info
  console.log('Dashboard render - User:', user, 'UserInvestor:', userInvestor, 'Loading:', loading);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-full w-screen fixed flex-col mx-auto items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-full w-screen fixed flex-col mx-auto">
          <div
            ref={scrollRef}
            className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth gap-4 rounded-2xl scrollbar-none"
            aria-label="Dashboard sections"
          >
            {user?.role === 'founder' ? (
              <>
                <section className="snap-start pt-20 shrink-0 w-full h-full overflow-y-auto justify-center flex">
                  <div className="space-y-6 max-w-6xl px-4">
                    <StatsSection scope="user" />
                  </div>
                </section>
                <section className="snap-start pt-20 shrink-0 w-full h-full overflow-y-auto justify-center flex">
                  <div className="space-y-6 max-w-6xl px-4 ">
                    <StartupForm startup={userStartup} />
                  </div>
                </section>
                <section className="snap-start pt-20 shrink-0 w-full h-full overflow-y-auto justify-center flex">
                  <div className="space-y-6 max-w-6xl px-4 ">
                    <EventsNewsManager startup={userStartup} />
                  </div>
                </section>
              </>
            ) : user?.role === 'investor' ? (
              <>
                <section className="snap-start pt-20 shrink-0 w-full h-full overflow-y-auto justify-center flex">
                  <div className="space-y-6 max-w-6xl px-4">
                    <InvestorPortfolioSection investor={userInvestor} />
                  </div>
                </section>
                <section className="snap-start pt-20 shrink-0 w-full h-full overflow-y-auto justify-center flex">
                  <div className="space-y-6 max-w-6xl px-4 ">
                    <InvestmentOpportunities investor={userInvestor} />
                  </div>
                </section>
                <section className="snap-start pt-20 shrink-0 w-full h-full overflow-y-auto justify-center flex">
                  <div className="space-y-6 max-w-6xl px-4 ">
                    <MarketInsights investor={userInvestor} />
                  </div>
                </section>
              </>
            ) : null
            }
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
        <Dock className="fixed bottom-15 right-4 z-10 border-none" items={
          user?.role === 'founder' ? [
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
          ] : [
            {
              label: "Portfolio overview",
              icon: <FaBriefcase className={`${active == 0 ? "text-white text-xl" : "text-gray-400 text-md"}`} />,
              onClick: () => goTo(0)
            },
            {
              label: "Investment opportunities",
              icon: <FaSearch className={`${active == 1 ? "text-white text-xl" : "text-gray-400 text-md"}`} />,
              onClick: () => goTo(1)
            },
            {
              label: "Market insights",
              icon: <FiTrendingUp className={`${active == 2 ? "text-white text-xl" : "text-gray-400 text-md"}`} />,
              onClick: () => goTo(2)
            },
          ]
        } />
      )}
    </ProtectedRoute>
  );
}
