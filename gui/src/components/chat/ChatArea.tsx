import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { MessageBubble } from './MessageBubble';
import { ThinkingBubble } from './ThinkingBubble';
import { ChatInput } from './ChatInput';
import { Icon } from '../ui/Icon';
import type { Message } from '../../types';

// Threshold in pixels to consider user "at bottom"
const SCROLL_THRESHOLD = 100;

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  isThreadLoading?: boolean;
  writingStatus: string | null;
  onSendMessage: (content: string) => void;
  onStop?: () => void;
  isMobile?: boolean;
}

export function ChatArea({
  messages,
  isLoading,
  isThreadLoading,
  writingStatus,
  onSendMessage,
  onStop,
  isMobile = false,
}: ChatAreaProps): JSX.Element {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const lastMessageCountRef = useRef(messages.length);

  // Check if the last message is from the assistant (streaming response)
  const isStreamingResponse = useMemo(() => {
    if (!isLoading || messages.length === 0) return false;
    const lastMessage = messages[messages.length - 1];
    return lastMessage.role === 'assistant' && lastMessage.content;
  }, [isLoading, messages]);

  // Only show thinking bubble if loading AND not already streaming a response
  const showThinkingBubble = isLoading && !isStreamingResponse;

  // Check if user is at the bottom of the scroll container
  const checkIfAtBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return true;

    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const atBottom = checkIfAtBottom();
    setIsUserAtBottom(atBottom);

    // Clear "new messages" indicator when user scrolls to bottom
    if (atBottom) {
      setHasNewMessages(false);
    }
  }, [checkIfAtBottom]);

  // Scroll to bottom programmatically
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setHasNewMessages(false);
    setIsUserAtBottom(true);
  }, []);

  // Auto-scroll only if user is at bottom, otherwise show "new messages" indicator
  useEffect(() => {
    const newMessageCount = messages.length;
    const hadNewMessages = newMessageCount > lastMessageCountRef.current;
    lastMessageCountRef.current = newMessageCount;

    if (isUserAtBottom) {
      // User is at bottom, auto-scroll
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (hadNewMessages) {
      // User is scrolled up and there are new messages
      setHasNewMessages(true);
    }
  }, [messages, isUserAtBottom]);

  return (
    <div className={`flex-1 flex flex-col border-r border-luxury-500/20 bg-luxury-850/60 backdrop-blur-xl relative ${isMobile ? 'min-w-0' : 'min-w-[400px]'}`}>
      {/* Header - Hidden on mobile since we have the top bar */}
      <div className={`h-14 lg:h-18 border-b border-luxury-500/20 flex items-center justify-between px-4 lg:px-8 bg-luxury-800/40 backdrop-blur-2xl shrink-0 ${isMobile ? 'hidden lg:flex' : ''}`}>
        <div className="flex flex-col gap-0.5">
          <span className="font-display font-semibold text-luxury-50 tracking-tight text-sm lg:text-base">
            Coding Agent
          </span>
          <span className="text-[10px] lg:text-[11px] text-luxury-300 flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                isLoading
                  ? 'bg-accent-400 animate-glow-pulse shadow-[0_0_8px_rgba(212,166,90,0.5)]'
                  : 'bg-luxury-400'
              }`}
            />
            <span className="font-medium">{isLoading ? 'Working' : 'Ready'}</span>
          </span>
        </div>

        {writingStatus && (
          <div className="flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-accent-400/10 border border-accent-400/20 rounded-xl animate-scale-in">
            <Icon name="PenTool" size={12} className="text-accent-400 animate-float" />
            <span className="text-[10px] lg:text-[11px] font-mono font-medium text-accent-300">{writingStatus}</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4 lg:space-y-8 mac-scrollbar relative"
      >
        {messages.length === 0 && !isThreadLoading && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative mb-6 lg:mb-8">
              <div className="absolute inset-0 w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-accent-400/5 animate-ping-slow" />
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-luxury-800/50 border border-luxury-600/30 flex items-center justify-center">
                <Icon name="Sparkles" size={24} className="text-accent-400/60 lg:hidden" />
                <Icon name="Sparkles" size={28} className="text-accent-400/60 hidden lg:block" />
              </div>
            </div>
            <p className="text-base lg:text-lg font-display font-medium text-luxury-100 tracking-tight">Begin</p>
            <p className="text-xs lg:text-sm text-luxury-400 mt-2 text-center px-4">
              Describe what you want to build
            </p>
          </div>
        )}

        {isThreadLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative mb-6 lg:mb-8">
              <div className="absolute inset-0 w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-luxury-400/5 animate-ping-slow" />
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-luxury-800/50 border border-luxury-600/30 flex items-center justify-center">
                <Icon name="Loader2" size={24} className="text-luxury-300 animate-spin lg:hidden" />
                <Icon name="Loader2" size={28} className="text-luxury-300 animate-spin hidden lg:block" />
              </div>
            </div>
            <p className="text-base lg:text-lg font-display font-medium text-luxury-100 tracking-tight">Loading</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            allMessages={messages}
            messageIndex={idx}
          />
        ))}

        {/* Only show thinking bubble when loading AND no response is streaming yet */}
        {showThinkingBubble && <ThinkingBubble />}

        <div ref={chatEndRef} />
      </div>

      {/* New messages indicator */}
      {hasNewMessages && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 lg:bottom-24 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-accent-500 hover:bg-accent-400 text-luxury-900 rounded-full shadow-lg transition-all duration-200 animate-scale-in font-medium text-xs lg:text-sm"
        >
          <Icon name="ChevronDown" size={14} />
          <span>New messages</span>
        </button>
      )}

      {/* Input */}
      <ChatInput onSend={onSendMessage} onStop={onStop} isLoading={isLoading} />
    </div>
  );
}
