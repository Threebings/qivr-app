import { useState, useEffect, useRef } from 'react';
import { Send, Mic, Paperclip, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function Chat() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Array<{ id: string; sender: 'patient' | 'ai'; message: string; timestamp: Date }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeSession();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeSession = async () => {
    if (!user) return;

    const { data: existingSession } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('patient_id', user.id)
      .order('last_activity', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingSession) {
      setSessionId(existingSession.session_id);
      loadMessages(existingSession.id);
    } else {
      const newSessionId = `session_${Date.now()}`;
      const { data: newSession } = await supabase
        .from('chat_sessions')
        .insert({
          patient_id: user.id,
          session_id: newSessionId,
        })
        .select()
        .single();

      if (newSession) {
        setSessionId(newSession.session_id);

        const welcomeMessage = {
          id: `msg_${Date.now()}`,
          sender: 'ai' as const,
          message: `Hello ${profile?.full_name?.split(' ')[0] || 'there'}! I'm OrthoAI, your personal orthopaedic recovery assistant. I'm here to answer your questions about your recovery, provide guidance, and help you stay on track. How can I help you today?`,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }
    }
  };

  const loadMessages = async (chatSessionId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', chatSessionId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(
        data.map(msg => ({
          id: msg.id,
          sender: msg.sender,
          message: msg.message,
          timestamp: new Date(msg.created_at),
        }))
      );
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user || !sessionId) return;

    const userMessage = {
      id: `msg_${Date.now()}`,
      sender: 'patient' as const,
      message: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    const { data: session } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (session) {
      await supabase.from('chat_messages').insert({
        session_id: session.id,
        sender: 'patient',
        message: inputMessage,
      });
    }

    setTimeout(() => {
      const aiResponse = {
        id: `msg_${Date.now() + 1}`,
        sender: 'ai' as const,
        message: generateAIResponse(inputMessage),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);

      if (session) {
        supabase.from('chat_messages').insert({
          session_id: session.id,
          sender: 'ai',
          message: aiResponse.message,
        });
      }
    }, 2000);
  };

  const generateAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('pain') || lowerQuestion.includes('swelling')) {
      return `Pain and swelling are common after orthopaedic surgery. Here are some tips:\n\n• Elevate your leg above heart level for 20 minutes every hour\n• Apply ice for 15-20 minutes, 3-4 times daily\n• Take your prescribed medication as directed\n• If pain suddenly worsens or you notice warmth and redness, contact your doctor immediately\n\nWould you like me to log your current pain level or show you some gentle exercises?`;
    }

    if (lowerQuestion.includes('exercise') || lowerQuestion.includes('physical therapy')) {
      return `Exercise is crucial for recovery! Based on your current stage (${profile?.days_post_op || 0} days post-op), here's what I recommend:\n\n• Start with gentle range-of-motion exercises\n• Gradually increase intensity as tolerated\n• Listen to your body - some discomfort is normal, but stop if you feel sharp pain\n\nWould you like to see today's recommended exercises?`;
    }

    if (lowerQuestion.includes('drive') || lowerQuestion.includes('driving')) {
      return `When you can return to driving depends on several factors:\n\n• Type of surgery you had\n• Which leg was operated on (if applicable)\n• Whether you can safely brake and control the vehicle\n• Your pain medication use\n\nTypically, patients can drive 4-6 weeks after major surgery, but always check with your surgeon first. Are you taking pain medications that might impair driving?`;
    }

    return `Thank you for your question. Based on your recovery profile (${profile?.condition || 'your condition'}, Day ${profile?.days_post_op || 0}), I'm here to help.\n\nNote: This is a demo response. In the full version, this would connect to the Genspark AI agent (ID: 92dacb25-f2da-4a96-a4c5-a2b1be8aac66) for personalized, evidence-based guidance.\n\nCould you provide more details about what you'd like to know?`;
  };

  const quickReplies = [
    'Pain management tips',
    'Exercises for today',
    'When can I drive?',
    'Managing swelling',
  ];

  return (
    <div className="h-screen bg-[#F8FAFB] flex flex-col pb-16">
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-qivr-blue rounded-full flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#1F2937]">OrthoAI Assistant</h1>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500">Online</span>
            </div>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <Info className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.sender === 'patient'
                ? 'bg-qivr-blue text-white'
                : 'bg-white text-gray-800 border border-gray-200'
            }`}>
              <p className="text-sm whitespace-pre-line">{msg.message}</p>
              <span className={`text-xs mt-1 block ${
                msg.sender === 'patient' ? 'text-white/70' : 'text-gray-500'
              }`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => setInputMessage(reply)}
                className="px-4 py-2 bg-white border border-qivr-blue text-qivr-blue rounded-full text-sm hover:bg-qivr-blue hover:text-white transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <button className="text-gray-500 hover:text-gray-700 p-2">
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="text-gray-500 hover:text-gray-700 p-2">
            <Mic className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-qivr-blue focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="bg-qivr-blue text-white p-2 rounded-full hover:bg-qivr-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
