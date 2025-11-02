import { useState, useEffect } from 'react';
import { Search, Play, FileText, Activity, Bookmark, Clock, BookmarkCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, EducationalContent } from '../lib/supabase';
import { ContentViewer } from './ContentViewer';

export function Learn() {
  const { user } = useAuth();
  const [content, setContent] = useState<EducationalContent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadContent();
    loadBookmarks();
  }, [user]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('educational_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setContent(data);
      } else {
        setContent(getSampleContent());
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setContent(getSampleContent());
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('content_progress')
        .select('content_id')
        .eq('patient_id', user.id)
        .eq('bookmarked', true);

      if (error) throw error;
      if (data) {
        setBookmarkedIds(new Set(data.map(d => d.content_id)));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const toggleBookmark = async (contentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    const isBookmarked = bookmarkedIds.has(contentId);

    try {
      const { error } = await supabase
        .from('content_progress')
        .upsert({
          patient_id: user.id,
          content_id: contentId,
          bookmarked: !isBookmarked,
          last_accessed: new Date().toISOString(),
        }, {
          onConflict: 'patient_id,content_id'
        });

      if (error) throw error;

      const newBookmarks = new Set(bookmarkedIds);
      if (isBookmarked) {
        newBookmarks.delete(contentId);
      } else {
        newBookmarks.add(contentId);
      }
      setBookmarkedIds(newBookmarks);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const getSampleContent = (): EducationalContent[] => [
    {
      id: '1',
      title: 'Week 2 Recovery Tips',
      description: 'Essential tips for the second week post-surgery',
      content_type: 'video',
      category: 'Post-Surgery Care',
      duration_minutes: 10,
      thumbnail_url: '',
      content_url: '',
      difficulty_level: 'beginner',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: '5-Minute Mobility Exercises',
      description: 'Quick exercises to improve your range of motion',
      content_type: 'video',
      category: 'Exercise & Rehabilitation',
      duration_minutes: 5,
      thumbnail_url: '',
      content_url: '',
      difficulty_level: 'beginner',
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Understanding Your Recovery Timeline',
      description: 'A comprehensive guide to what to expect during recovery',
      content_type: 'article',
      category: 'Post-Surgery Care',
      duration_minutes: 15,
      thumbnail_url: '',
      content_url: '',
      difficulty_level: 'beginner',
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'Pain Management Strategies',
      description: 'Non-medication approaches to managing post-surgical pain',
      content_type: 'article',
      category: 'Pain Management',
      duration_minutes: 12,
      thumbnail_url: '',
      content_url: '',
      difficulty_level: 'beginner',
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      title: 'Pre-Surgery Preparation Checklist',
      description: 'Everything you need to prepare before your surgery',
      content_type: 'article',
      category: 'Pre-Surgery',
      duration_minutes: 8,
      thumbnail_url: '',
      content_url: '',
      difficulty_level: 'beginner',
      created_at: new Date().toISOString(),
    },
    {
      id: '6',
      title: 'Nutrition for Recovery',
      description: 'Foods that support healing and recovery',
      content_type: 'article',
      category: 'Nutrition & Recovery',
      duration_minutes: 10,
      thumbnail_url: '',
      content_url: '',
      difficulty_level: 'beginner',
      created_at: new Date().toISOString(),
    },
  ];

  const categories = [
    'All',
    'Pre-Surgery',
    'Post-Surgery Care',
    'Exercise & Rehabilitation',
    'Pain Management',
    'Nutrition & Recovery',
    'Return to Activities',
  ];

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-5 h-5" />;
      case 'exercise':
        return <Activity className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' ||
                           item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (selectedContentId) {
    return (
      <ContentViewer
        contentId={selectedContentId}
        onBack={() => {
          setSelectedContentId(null);
          loadBookmarks();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24">
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-[#1F2937] mb-4">Learning Center</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search topics, exercises, conditions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qivr-blue focus:border-transparent"
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category.toLowerCase())}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.toLowerCase()
                    ? 'bg-qivr-blue text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-qivr-blue'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-[#1F2937] mb-4">Recommended for You</h2>
          <div className="space-y-4">
            {filteredContent.map((item) => {
              const isBookmarked = bookmarkedIds.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedContentId(item.id)}
                  className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex">
                    <div
                      className="w-32 h-32 bg-gradient-to-br from-qivr-blue to-qivr-blue-light flex items-center justify-center flex-shrink-0 relative"
                      style={item.thumbnail_url ? { backgroundImage: `url(${item.thumbnail_url})`, backgroundSize: 'cover' } : {}}
                    >
                      <div className="text-white">
                        {getContentIcon(item.content_type)}
                      </div>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#1F2937] mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <button
                          onClick={(e) => toggleBookmark(item.id, e)}
                          className={`ml-2 transition-colors ${
                            isBookmarked ? 'text-qivr-blue' : 'text-gray-400 hover:text-qivr-blue'
                          }`}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="w-5 h-5 fill-current" />
                          ) : (
                            <Bookmark className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{item.duration_minutes} min</span>
                        </span>
                        <span className="px-2 py-1 bg-qivr-blue/10 text-qivr-blue rounded capitalize">
                          {item.content_type}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No results found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        <div className="bg-gradient-to-br from-qivr-blue to-qivr-blue-light rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Weekly Spotlight</h3>
          <p className="text-sm opacity-90 mb-4">
            Featured content curated by our orthopaedic specialists
          </p>
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold">Advanced Knee Strengthening</div>
                <div className="text-sm opacity-90">20 minutes • Intermediate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
