'use client';

import { useState, useEffect } from 'react';
import NewsCard from '@/components/cards/NewsCard';
import NewsModal from '@/components/modals/NewsModal';
import { NewsDetailApiResponse } from '@/domain/interfaces/News';

export default function NewsPage() {
  const [news, setNews] = useState<NewsDetailApiResponse[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsDetailApiResponse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'all' | 'recent' | 'older'>('all');
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsDetailApiResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleNewsClick = (newsItem: NewsDetailApiResponse) => {
    setSelectedNewsItem(newsItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNewsItem(null);
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setNews(result.data);
        } else {
          console.error('API returned invalid data structure:', result);
          setNews([]);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    let filtered = [...news];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedTimeFilter === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(item => item.news_date && new Date(item.news_date) >= thirtyDaysAgo);
    } else if (selectedTimeFilter === 'older') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(item => item.news_date && new Date(item.news_date) < thirtyDaysAgo);
    }

    filtered.sort((a, b) => {
      if (!a.news_date) return 1;
      if (!b.news_date) return -1;
      return new Date(b.news_date).getTime() - new Date(a.news_date).getTime();
    });

    setFilteredNews(filtered);
  }, [news, selectedCategory, selectedTimeFilter]);

  // Get unique categories for filter dropdown
  const categories = [...new Set(news.map(item => item.category).filter(Boolean))];

  return (
    <div className="h-screen bg-gray-50 pt-14 overflow-y-auto">
      <div className="px-4 py-8 max-w-[70rem] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">News</h1>
          <p className="text-lg text-gray-600 mb-6">
            Stay updated with the latest news, announcements, and milestones from our startup ecosystem.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter by category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all" className="text-gray-900">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category} className="text-gray-900">{category}</option>
                ))}
              </select>
            </div>

            {/* Time Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter by time:</label>
              <select
                value={selectedTimeFilter}
                onChange={(e) => setSelectedTimeFilter(e.target.value as 'all' | 'recent' | 'older')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all" className="text-gray-900">All Time</option>
                <option value="recent" className="text-gray-900">Last 30 Days</option>
                <option value="older" className="text-gray-900">Older than 30 Days</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-500 ml-auto">
              Showing {filteredNews.length} of {news.length} news items
            </div>
          </div>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">Loading news...</div>
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="space-y-4">
            {filteredNews.map((newsItem) => (
              <NewsCard
                key={newsItem.id}
                id={newsItem.id}
                title={newsItem.title}
                news_date={newsItem.news_date}
                location={newsItem.location}
                category={newsItem.category}
                startup_id={newsItem.startup_id}
                description={newsItem.description}
                onClick={() => handleNewsClick(newsItem)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No news found</div>
            <p className="text-gray-500">
              {selectedCategory !== 'all' || selectedTimeFilter !== 'all'
                ? 'Try adjusting your filters to see more news.'
                : 'Check back later for the latest updates.'}
            </p>
          </div>
        )}
      </div>

      {/* News Modal */}
      <NewsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        newsItem={selectedNewsItem}
      />
    </div>
  );
}
