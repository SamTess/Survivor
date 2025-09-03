'use client';

import { useState, useEffect } from 'react';
import NewsCard from '@/components/cards/NewsCard';
import NewsModal from '@/components/modals/NewsModal';
import { NewsDetailApiResponse } from '@/domain/interfaces/News';

// TODO REMOVE
import newsData from '@/mocks/news.json';

export default function NewsPage() {
  const [news, setNews] = useState<NewsDetailApiResponse[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsDetailApiResponse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'all' | 'recent' | 'older'>('all');
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsDetailApiResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNewsClick = (newsItem: NewsDetailApiResponse) => {
    setSelectedNewsItem(newsItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNewsItem(null);
  };

  useEffect(() => {
    setNews(newsData);
    setFilteredNews(newsData);
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
    <div className="h-screen bg-background pt-14 overflow-y-auto">
      <div className="px-6 py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 transition-all duration-300">News</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Stay updated with the latest news, announcements, and milestones from our startup ecosystem.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center bg-card/50 backdrop-blur-md border border-border/20 rounded-2xl p-6 transition-all duration-300">
            {/* Category Filter */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-foreground">Filter by category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-border rounded-full text-sm text-foreground bg-background/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary hover:border-primary/50 transition-all duration-200"
              >
                <option value="all" className="text-foreground">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category} className="text-foreground">{category}</option>
                ))}
              </select>
            </div>

            {/* Time Filter */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-foreground">Filter by time:</label>
              <select
                value={selectedTimeFilter}
                onChange={(e) => setSelectedTimeFilter(e.target.value as 'all' | 'recent' | 'older')}
                className="px-4 py-2 border border-border rounded-full text-sm text-foreground bg-background/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary hover:border-primary/50 transition-all duration-200"
              >
                <option value="all" className="text-foreground">All Time</option>
                <option value="recent" className="text-foreground">Last 30 Days</option>
                <option value="older" className="text-foreground">Older than 30 Days</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground ml-auto font-medium">
              Showing {filteredNews.length} of {news.length} news items
            </div>
          </div>
        </div>

        {/* News Grid */}
        {filteredNews.length > 0 ? (
          <div className="space-y-4 animate-in fade-in-50 duration-500">
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
          <div className="text-center py-12 bg-card/30 backdrop-blur-md border border-border/20 rounded-2xl transition-all duration-300">
            <div className="text-muted-foreground text-lg mb-2 font-medium">No news found</div>
            <p className="text-muted-foreground/70">
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
