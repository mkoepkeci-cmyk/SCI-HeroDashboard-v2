import { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface InsightsChatProps {
  contextData: string; // JSON stringified data about initiatives, team, etc.
}

const SUGGESTED_PROMPTS = [
  // Capacity & Workload
  "Who is over capacity and what are their top 3 initiatives by revenue impact?",
  "Which team members have under 60% capacity and could take on new Pharmacy work?",

  // Financial & ROI
  "Show me the top 5 revenue-generating initiatives with their ROI details",
  "Which service lines have the highest total revenue impact?",
  "Identify initiatives with over $500K projected revenue that are missing baseline metrics",

  // Risk & Progress
  "Which active initiatives have data quality scores below 50%?",
  "Show me team members over 85% capacity who own high-revenue initiatives",
  "What initiatives are in 'On Hold' status and why might they be paused?",

  // Work Distribution
  "What's the distribution of work types across the team?",
  "Show me all active initiatives by service line (Pharmacy, ED, Perioperative, etc.)",

  // Optimization
  "Recommend workload rebalancing - who can give work, who can take it?",
  "Which initiatives should we prioritize based on revenue impact and team capacity?",
];

export const InsightsChat = ({ contextData }: InsightsChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your SCI team insights assistant. I have access to all your team's initiatives, workload data, and metrics. Ask me anything about capacity, initiatives, impact, or team performance!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: contextData,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${responseText}`);
      }

      const data = JSON.parse(responseText);

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));

      // Check if we're in local development (API route doesn't exist)
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      const errorDetails = error instanceof Error ? error.message : String(error);

      const errorMessage: Message = {
        role: 'assistant',
        content: isLocalDev
          ? "🔧 **Local Development Mode**\n\nThe AI chat API is not available in local development. This feature will work once the app is deployed to Vercel with the ANTHROPIC_API_KEY environment variable configured.\n\n**To enable AI chat:**\n1. Deploy to Vercel\n2. Add ANTHROPIC_API_KEY in Vercel Environment Variables\n3. The chat will automatically work in production!\n\nFor now, you can explore the UI and test the initiative browsing features on the Overview tab."
          : `I'm sorry, I encountered an error connecting to the AI service.\n\n**Error Details:**\n${errorDetails}\n\n**Troubleshooting:**\n- Check that ANTHROPIC_API_KEY is configured in Vercel\n- Open browser console (F12) for detailed logs\n- Try the test endpoint: /api/test`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const useSuggestedPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#9B2F6A] to-[#6F47D0] text-white p-4 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-lg font-bold">AI Insights Assistant</h2>
        </div>
        <p className="text-xs text-white/80 mt-1">
          Powered by Claude • Ask questions about your team's work, capacity, and impact
        </p>
      </div>

      {/* Suggested Prompts - Only show if no messages yet */}
      {messages.length === 1 && (
        <div className="p-4 bg-gray-50 border-b">
          <p className="text-xs font-semibold text-gray-700 mb-2">Suggested questions:</p>
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => useSuggestedPrompt(prompt)}
                className="text-left text-xs p-2 bg-white border border-gray-200 rounded hover:border-[#9B2F6A] hover:bg-[#9B2F6A]/5 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-[#9B2F6A] text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              <div
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-white/60' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#9B2F6A]" />
              <span className="text-sm text-gray-600">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about team capacity, initiatives, impact..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B2F6A] focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-[#9B2F6A] text-white rounded-lg hover:bg-[#8F2561] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="text-sm font-semibold">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
};
