'use client';

import React, { useState, useEffect } from 'react';
import ProjectCard from '@/components/ui/ProjectCard';

interface Startup {
  id: number;
  name: string;
  sector: string;
  maturity: string;
  description: string;
  address: string;
  likesCount: number;
  details: Array<{
    website_url?: string;
    project_status?: string;
  }>;
  founders: Array<{
    user: {
      name: string;
    };
  }>;
}

const generateProjectImage = (sector: string, id: number) => {
  const sectorImages: { [key: string]: string } = {
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

  return sectorImages[sector] || sectorImages['default'];
};

export default function ProjectsPage() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const response = await fetch('/api/startups');
        const data = await response.json();

        if (Array.isArray(data)) {
          setStartups(data);
        } else {
          console.error('API returned non-array data:', data);
          setStartups([]);
        }
      } catch (error) {
        console.error('Error fetching startups:', error);
        setStartups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, []);

  const filteredStartups = Array.isArray(startups) ? startups.filter((startup: Startup) => {
    const matchesSearch = startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'All' || startup.sector === sectorFilter;
    const matchesStage = stageFilter === 'All' || startup.maturity === stageFilter;

    return matchesSearch && matchesSector && matchesStage;
  }) : [];

  const projectCards = filteredStartups.map((startup: Startup) => {
    return {
      ...startup,
      image: generateProjectImage(startup.sector, startup.id)
    };
  });

  const uniqueSectors = Array.from(new Set(Array.isArray(startups) ? startups.map((s: Startup) => s.sector) : []));
  const uniqueStages = Array.from(new Set(Array.isArray(startups) ? startups.map((s: Startup) => s.maturity) : []));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading startups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Startup Projects</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover innovative startups across various industries and stages. Connect with 
              entrepreneurs who are building the future.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">🔍 Search & Filter</span>
              <div className="flex items-center gap-4 ml-4">
                <span className="text-sm text-gray-500">Show Advanced</span>
                <button className="text-sm text-blue-600 hover:text-blue-800">✕ Clear All</button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Showing {filteredStartups.length} of {Array.isArray(startups) ? startups.length : 0} projects</span>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-gray-500">📊 Name (A-Z)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sector Filter */}
            <div className="min-w-0 flex-shrink-0">
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Sectors</option>
                {uniqueSectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            {/* Stage Filter */}
            <div className="min-w-0 flex-shrink-0">
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Stages</option>
                {uniqueStages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="py-12 px-4">
        {filteredStartups.length > 0 ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center max-w-6xl mx-auto"
            style={{
              gap: '10px',
              gridAutoRows: 'max-content'
            }}
          >
            {projectCards.map((startup) => (
              <div key={startup.id} className="w-full flex justify-center">
                <ProjectCard
                  startup={startup}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {loading ? 'Loading...' : 'No projects found matching your filters.'}
            </div>
            {!loading && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSectorFilter('All');
                  setStageFilter('All');
                }}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
