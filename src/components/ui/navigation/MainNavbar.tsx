'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FaSearch, FaUser } from 'react-icons/fa';

export default function MainNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (pathname && pathname.startsWith('/admin'))
    return null;
  return (
    <nav className="fixed top-0 left-0 right-0 z-500 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-14">
          {/* Left side - Site name */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-light tracking-wide text-black hover:text-purple-600 transition-colors duration-200">
              JEB
            </Link>
          </div>

          {/* Middle - Navigation links */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-12">
              <Link
                href="/home"
                className="text-black hover:text-purple-600 text-sm font-normal tracking-wide transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                href="/projects"
                className="text-black hover:text-purple-600 text-sm font-normal tracking-wide transition-colors duration-200"
              >
                Projects
              </Link>
              <Link
                href="/news"
                className="text-black hover:text-purple-600 text-sm font-normal tracking-wide transition-colors duration-200"
              >
                News
              </Link>
              <Link
                href="/events"
                className="text-black hover:text-purple-600 text-sm font-normal tracking-wide transition-colors duration-200"
              >
                Events
              </Link>
            </div>
          </div>

          {/* Right side - Search and Login icons */}
          <div className="flex items-center space-x-2">
            <button
              className="text-black hover:text-purple-600 transition-colors duration-200 p-1.5 hover:bg-gray-50 rounded-lg"
              aria-label="Search"
            >
              <FaSearch className="h-4 w-4" />
            </button>
            <button
              className="text-black hover:text-purple-600 transition-colors duration-200 p-1.5 hover:bg-gray-50 rounded-lg"
              aria-label="Login"
            >
              <FaUser className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="text-black hover:text-purple-600 inline-flex items-center justify-center p-1.5 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="block h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-lg" id="mobile-menu">
          <div className="px-6 pt-3 pb-4 space-y-2 bg-white">
            <Link
              href="/home"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-black hover:text-purple-600 block text-sm font-normal tracking-wide transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/projects"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-black hover:text-purple-600 block text-sm font-normal tracking-wide transition-colors duration-200"
            >
              Projects
            </Link>
            <Link
              href="/news"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-black hover:text-purple-600 block text-sm font-normal tracking-wide transition-colors duration-200"
            >
              News
            </Link>
            <Link
              href="/events"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-black hover:text-purple-600 block text-sm font-normal tracking-wide transition-colors duration-200"
            >
              Events
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}