import { useState, useEffect } from 'react';
import { ArrowLeft, Bookmark, Share2, ThumbsUp, ThumbsDown, Check, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, EducationalContent } from '../lib/supabase';
import { VideoPlayer } from '../components/VideoPlayer';
import { ArticleReader } from '../components/ArticleReader';
import { ExerciseGuide } from '../components/ExerciseGuide';

interface ContentViewerProps {
  contentId: string;
  onBack: () => void;
}

export function ContentViewer({ contentId, onBack }: ContentViewerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState<EducationalContent | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
    loadProgress();
  }, [contentId, user]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('educational_content')
        .select('*')
        .eq('id', contentId)
        .single();

      if (error) throw error;
      setContent(data);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('content_progress')
        .select('*')
        .eq('patient_id', user.id)
        .eq('content_id', contentId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProgressPercentage(data.progress_percentage);
        setIsCompleted(data.completed);
        setIsBookmarked(data.bookmarked);
        setRating(data.rating);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const updateProgress = async (updates: {
    progress_percentage?: number;
    completed?: boolean;
    bookmarked?: boolean;
    rating?: number;
  }) => {
    if (!user || !content) return;

    try {
      const { error } = await supabase
        .from('content_progress')
        .upsert({
          patient_id: user.id,
          content_id: content.id,
          progress_percentage: progressPercentage,
          completed: isCompleted,
          bookmarked: isBookmarked,
          rating: rating,
          ...updates,
          last_accessed: new Date().toISOString(),
        }, {
          onConflict: 'patient_id,content_id'
        });

      if (error) throw error;

      if (updates.progress_percentage !== undefined) setProgressPercentage(updates.progress_percentage);
      if (updates.completed !== undefined) setIsCompleted(updates.completed);
      if (updates.bookmarked !== undefined) setIsBookmarked(updates.bookmarked);
      if (updates.rating !== undefined) setRating(updates.rating);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleMarkComplete = async () => {
    await updateProgress({ completed: true, progress_percentage: 100 });
    setShowRatingPrompt(true);
  };

  const handleToggleBookmark = async () => {
    await updateProgress({ bookmarked: !isBookmarked });
  };

  const handleRating = async (stars: number) => {
    await updateProgress({ rating: stars });
    setShowRatingPrompt(false);
  };

  const handleFeedback = async (helpful: boolean) => {
    setFeedback(helpful ? 'helpful' : 'not-helpful');
  };

  const handleShare = () => {
    if (navigator.share && content) {
      navigator.share({
        title: content.title,
        text: content.description,
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-qivr-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Content not found</p>
          <button onClick={onBack} className="mt-4 text-qivr-blue hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-qivr-blue hover:text-qivr-blue-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked ? 'text-qivr-blue bg-qivr-blue/10' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {progressPercentage > 0 && progressPercentage < 100 && (
          <div className="px-6 pb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-qivr-blue rounded-full h-1 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white">
        {content.content_type === 'video' && (
          <div className="p-6">
            <VideoPlayer videoUrl={content.content_url} title={content.title} />
            <div className="mt-6">
              <h1 className="text-2xl font-bold text-[#1F2937] mb-2">{content.title}</h1>
              <p className="text-gray-600 mb-4">{content.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{content.duration_minutes} minutes</span>
                <span>•</span>
                <span className="capitalize">{content.difficulty_level}</span>
                <span>•</span>
                <span>{content.category}</span>
              </div>
            </div>
          </div>
        )}

        {content.content_type === 'article' && (
          <ArticleReader
            title={content.title}
            content=""
            readTime={content.duration_minutes}
          />
        )}

        {content.content_type === 'exercise' && (
          <ExerciseGuide
            title={content.title}
            exercises={[]}
            onComplete={handleMarkComplete}
          />
        )}
      </div>

      {!isCompleted && content.content_type !== 'exercise' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <button
            onClick={handleMarkComplete}
            className="w-full bg-qivr-blue text-white py-3 px-6 rounded-lg font-semibold hover:bg-qivr-blue-dark transition-colors flex items-center justify-center space-x-2"
          >
            <Check className="w-5 h-5" />
            <span>Mark as Complete</span>
          </button>
        </div>
      )}

      {isCompleted && (
        <div className="p-6 space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Completed!</h3>
              <p className="text-sm text-green-700">Great job finishing this content</p>
            </div>
          </div>

          {showRatingPrompt && !rating && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="font-semibold text-[#1F2937] mb-4">How helpful was this content?</h3>
              <div className="flex justify-center space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className="text-4xl hover:scale-110 transition-transform"
                  >
                    <Star className={`w-10 h-10 ${star <= (rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {rating && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="font-semibold text-[#1F2937] mb-4">Thank you for your feedback!</h3>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-semibold text-[#1F2937] mb-4">Was this content helpful?</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => handleFeedback(true)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  feedback === 'helpful'
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ThumbsUp className="w-5 h-5" />
                <span>Yes</span>
              </button>
              <button
                onClick={() => handleFeedback(false)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  feedback === 'not-helpful'
                    ? 'bg-red-100 text-red-700 border-2 border-red-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ThumbsDown className="w-5 h-5" />
                <span>No</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-qivr-blue to-qivr-blue-light rounded-2xl p-6 text-white">
            <h3 className="font-semibold mb-2">Keep Learning</h3>
            <p className="text-sm opacity-90 mb-4">Continue your recovery journey with more educational content</p>
            <button
              onClick={onBack}
              className="bg-white text-qivr-blue py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Browse More Content
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
