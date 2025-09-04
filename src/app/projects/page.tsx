'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ProjectCard from '@/components/ui/ProjectCard';

  interface Startup {
    id: number;
    name: string;
    sector: string;
    maturity: string;
    description: string;
    address: string;
    likesCount?: number;
    details: Array<{ website_url?: string; project_status?: string; }>;
    founders?: Array<{ user: { name: string } }>;
  }

  const generateProjectImage = (sector: string, id: number) => {
    const sectorImages: Record<string, string> = {
      'Software Technology': `https://picsum.photos/400/300?random=${id}&tech`,
      'Clean Energy': `https://picsum.photos/400/300?random=${id}&green`,
      'Artificial Intelligence': `https://picsum.photos/400/300?random=${id}&ai`,
      'FinTech': `https://picsum.photos/400/300?random=${id}&finance`,
      'HealthTech': `https://picsum.photos/400/300?random=${id}&health`,
      'EdTech': `https://picsum.photos/400/300?random=${id}&education`,
      'BioTech': `https://picsum.photos/400/300?random=${id}&biotech`,
      'Mobility': `https://picsum.photos/400/300?random=${id}&transport`,
      'default': `https://picsum.photos/400/300?random=${id}`
    };
    return sectorImages[sector] || sectorImages.default;
  };

  export default function ProjectsPage() {
    // Data
    const [startups, setStartups] = useState<Startup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Basic filters
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // debounced
    const [sectorFilter, setSectorFilter] = useState('All');
    const [stageFilter, setStageFilter] = useState('All');

    // Advanced filters
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [minLikes, setMinLikes] = useState(0);
    const [maxLikes, setMaxLikes] = useState<number | null>(null);
    const [minFounders, setMinFounders] = useState(0);
    const [hasWebsite, setHasWebsite] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');
    const [locationFilter, setLocationFilter] = useState('All');
    const [sortOption, setSortOption] = useState('name-asc');

    // Fetch
    useEffect(() => {
      let abort = false;
      (async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await fetch('/api/startups', { cache: 'no-store' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          if (!abort) {
            if (data.success && Array.isArray(data.data)) {
              setStartups(data.data);
            } else {
              setError('Unexpected data format');
              setStartups([]);
            }
          }
        } catch (e: any) {
          if (!abort) {
            setError(e.message || 'Loading error');
            setStartups([]);
          }
        } finally {
          if (!abort) setLoading(false);
        }
      })();
      return () => { abort = true; };
    }, []);

    // Debounce search
    useEffect(() => {
      const id = setTimeout(() => setSearchTerm(searchInput.trim()), 300);
      return () => clearTimeout(id);
    }, [searchInput]);

    // Derived collections
    const uniqueSectors = useMemo(() => Array.from(new Set(startups.map(s => s.sector))).sort(), [startups]);
    const uniqueStages = useMemo(() => Array.from(new Set(startups.map(s => s.maturity))).sort(), [startups]);
    const uniqueStatuses = useMemo(
      () => Array.from(new Set(startups.flatMap(s => (s.details || []).map(d => d.project_status).filter(Boolean) as string[]))).sort(),
      [startups]
    );
    const uniqueCountries = useMemo(() => {
      const countries = startups.map(s => {
        const address = s.address?.trim();
        if (!address) return null;
        // Take the last segment after the last comma as country
        const parts = address.split(',');
        let country = parts[parts.length - 1].trim();
        
        // Clean the country by keeping only letters and spaces
        country = country.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim();
        
        return country || null;
      }).filter(Boolean) as string[];
      return Array.from(new Set(countries)).sort();
    }, [startups]);
    const likeBounds = useMemo(() => {
      const likes = startups.map(s => s.likesCount || 0);
      return { min: likes.length ? Math.min(...likes) : 0, max: likes.length ? Math.max(...likes) : 0 };
    }, [startups]);

    // Initialize maxLikes
    useEffect(() => {
      if (maxLikes == null && likeBounds.max > 0) setMaxLikes(likeBounds.max);
    }, [likeBounds, maxLikes]);

    const filteredStartups = useMemo(() => {
      const term = searchTerm.toLowerCase();
      let list = startups.filter(s => {
        const matchesSearch = !term || s.name.toLowerCase().includes(term) || s.description?.toLowerCase().includes(term);
        const matchesSector = sectorFilter === 'All' || s.sector === sectorFilter;
        const matchesStage = stageFilter === 'All' || s.maturity === stageFilter;
        const foundersCount = s.founders?.length || 0;
        const likes = s.likesCount || 0;
        const statusList = (s.details || []).map(d => d.project_status).filter(Boolean) as string[];
        const matchesStatus = statusFilter === 'All' || statusList.includes(statusFilter);
        const country = s.address ? s.address.split(',').pop()?.trim().replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim() || '' : '';
        const matchesLocation = locationFilter === 'All' || country === locationFilter;
        const matchesLikesMin = likes >= minLikes;
        const matchesLikesMax = maxLikes == null || likes <= maxLikes;
        const matchesFounders = foundersCount >= minFounders;
        const matchesWebsite = !hasWebsite || (s.details || []).some(d => d.website_url);
        return matchesSearch && matchesSector && matchesStage && matchesStatus && matchesLocation && matchesLikesMin && matchesLikesMax && matchesFounders && matchesWebsite;
      });
      switch (sortOption) {
        case 'likes-desc': list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0)); break;
        case 'likes-asc': list.sort((a, b) => (a.likesCount || 0) - (b.likesCount || 0)); break;
        case 'name-desc': list.sort((a, b) => b.name.localeCompare(a.name)); break;
        case 'stage-asc': list.sort((a, b) => a.maturity.localeCompare(b.maturity)); break;
        case 'stage-desc': list.sort((a, b) => b.maturity.localeCompare(a.maturity)); break;
        case 'name-asc':
        default: list.sort((a, b) => a.name.localeCompare(b.name));
      }
      return list;
    }, [startups, searchTerm, sectorFilter, stageFilter, statusFilter, locationFilter, minLikes, maxLikes, minFounders, hasWebsite, sortOption]);

    const projectCards = useMemo(() => filteredStartups.map(s => ({ ...s, image: generateProjectImage(s.sector, s.id) })), [filteredStartups]);

    function clearAll() {
      setSearchInput('');
      setSearchTerm('');
      setSectorFilter('All');
      setStageFilter('All');
      setStatusFilter('All');
      setLocationFilter('All');
      setMinLikes(0);
      setMaxLikes(likeBounds.max || null);
      setMinFounders(0);
      setHasWebsite(false);
      setSortOption('name-asc');
    }

    if (loading) {
      return (
        <div className="h-screen bg-background pt-14 overflow-y-auto">
          <div className="h-screen overflow-y-auto flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-4 text-gray-600 text-sm">Loading startups...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen bg-background pt-14 overflow-y-auto">
        <div className="h-screen overflow-y-auto flex flex-col bg-gray-50">
          <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Startup Projects</h1>
                  <p className="text-sm text-gray-600 max-w-2xl">Explore, filter and compare startups by sector, maturity, traction and more.</p>
                </div>
                <div className="flex items-center gap-2 md:self-end">
                  <button onClick={() => setShowAdvanced(v => !v)} className="text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition">
                    {showAdvanced ? 'Hide advanced filters' : 'Advanced filters'}
                  </button>
                  <button onClick={clearAll} className="text-sm px-3 py-1.5 rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 transition">
                    ✕ Reset
                  </button>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search (name, description)..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-4 flex-wrap">
                  <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="All">All sectors</option>
                    {uniqueSectors.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="All">All maturities</option>
                    {uniqueStages.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                  <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="All">All countries</option>
                    {uniqueCountries.map(country => <option key={country} value={country}>{country}</option>)}
                  </select>
                  <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="likes-desc">Likes (desc)</option>
                    <option value="likes-asc">Likes (asc)</option>
                    <option value="stage-asc">Maturity (A-Z)</option>
                    <option value="stage-desc">Maturity (Z-A)</option>
                  </select>
                </div>
              </div>
              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2" aria-label="Advanced filters">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Min likes</label>
                    <input type="number" min={likeBounds.min} max={likeBounds.max} value={minLikes} onChange={e => setMinLikes(Number(e.target.value) || 0)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Max likes</label>
                    <input type="number" min={likeBounds.min} max={likeBounds.max} value={maxLikes ?? ''} onChange={e => setMaxLikes(e.target.value === '' ? null : Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Founders (min)</label>
                    <input type="number" min={0} value={minFounders} onChange={e => setMinFounders(Number(e.target.value) || 0)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Project status</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="All">All</option>
                      {uniqueStatuses.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end gap-2 md:col-span-2 lg:col-span-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer select-none">
                      <input type="checkbox" checked={hasWebsite} onChange={e => setHasWebsite(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      With website
                    </label>
                  </div>
                  <div className="md:col-span-3 lg:col-span-4">
                    <p className="text-[11px] text-gray-500 flex flex-wrap gap-4">
                      <span><strong>{filteredStartups.length}</strong> result(s) / {startups.length} total</span>
                      <span>Likes range: {likeBounds.min} - {likeBounds.max}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-20 pt-6">
            {error && <div className="max-w-6xl mx-auto mb-4 p-3 text-sm rounded-md bg-red-50 text-red-700 border border-red-200">Error: {error}</div>}
            {projectCards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center max-w-6xl mx-auto gap-6">
                {projectCards.map(p => (
                  <div key={p.id} className="w-full flex justify-center">
                    <ProjectCard startup={p} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 max-w-6xl mx-auto">
                <div className="text-gray-500 text-base">{error ? "Unable to display projects." : 'No projects match the filters.'}</div>
                <button onClick={clearAll} className="mt-6 inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
