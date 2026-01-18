import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { ChatArea } from '../components/chat/ChatArea';
import { RightPanel } from '../components/layout/RightPanel';
import { MobileNav } from '../components/layout/MobileNav';
import { useChat } from '../hooks/useChat';
import { useThreadHistory } from '../hooks/useThreadHistory';
import { useFileChangeDetection } from '../hooks/useFileChangeDetection';
import { useFileTree } from '../hooks/useFileTree';
import { normalizeFiles, getMessageText } from '../types';
import type { Message } from '../types';

export function ThreadView(): JSX.Element {
  const { threadId: paramThreadId } = useParams<{ threadId: string }>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'files' | 'preview'>('chat');

  const {
    threads,
    isLoading: isLoadingThreads,
    refetch: refetchThreads,
  } = useThreadHistory({ assistantId: 'frontend' });

  const {
    messages: rawMessages,
    files: rawFiles,
    todos,
    isLoading,
    isThreadLoading,
    threadId,
    setThreadId,
    sendMessage,
    stopStream,
  } = useChat({
    assistantId: 'frontend',
    onHistoryRevalidate: refetchThreads,
  });

  const [writingStatus, setWritingStatus] = useState<string | null>(null);

  // Normalize messages from LangGraph SDK format to UI format
  const messages: Message[] = useMemo(() => {
    return rawMessages.map((msg, idx) => {
      let role: Message['role'] = 'assistant';
      if (msg.type === 'human') {
        role = 'user';
      } else if (msg.type === 'tool') {
        role = 'tool';
      }

      // Extract tool calls if they exist (only on AI messages)
      const msgAny = msg as Record<string, unknown>;

      return {
        id: msg.id || `msg_${idx}`,
        role,
        content: getMessageText(msg.content),
        toolCalls: msgAny.tool_calls as Message['toolCalls'],
        toolCallId: msgAny.tool_call_id as string | undefined,
        toolName: msgAny.name as string | undefined,
      };
    });
  }, [rawMessages]);

  // Normalize files
  const files = useMemo(() => {
    return normalizeFiles(rawFiles);
  }, [rawFiles]);

  // Detect file changes for auto-selection and animation
  // Now returns all changes, not just the last one
  const { allChanges, changesCount } = useFileChangeDetection(files, isLoading);

  // Use the optimized file tree hook that handles:
  // - Incremental tree updates (only rebuild when structure changes)
  // - Synchronized auto-selection (no race conditions)
  // - Animation state management
  const {
    fileTree,
    selectedNode,
    setSelectedNode,
    animatingFilePath,
    animatingPreviousContent,
  } = useFileTree({
    files,
    allChanges,
    isLoading,
  });

  // Update writing status when loading - show file count if multiple files changed
  useEffect(() => {
    if (isLoading) {
      if (changesCount > 1) {
        setWritingStatus(`Working (${changesCount} files)`);
      } else {
        setWritingStatus('Working');
      }
    } else {
      setWritingStatus(null);
    }
  }, [isLoading, changesCount]);

  const handleNewThread = () => {
    // Clear the threadId query param and navigate to /new
    // Force page reload to reset the chat state completely
    window.location.href = '/new';
  };

  // Close sidebar when selecting a thread on mobile
  const handleSelectThread = (selectedThreadId: string) => {
    setThreadId(selectedThreadId);
    setIsSidebarOpen(false);
  };

  const handleSelectNode = useCallback((node: import('../types').FileNode) => {
    // setSelectedNode from useFileTree already handles clearing auto-selection
    setSelectedNode(node);
  }, [setSelectedNode]);

  const handleAskToFix = useCallback((error: string) => {
    const message = `The Vercel deployment failed with the following error:\n\n\`\`\`\n${error}\n\`\`\`\n\nPlease fix this error so the preview can be deployed successfully.`;
    sendMessage(message);
    setMobileTab('chat');
  }, [sendMessage]);

  return (
    <div className="mac-window flex flex-col lg:flex-row overflow-hidden text-gray-200 font-sans selection:bg-primary selection:text-white relative">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-luxury-500/20 bg-luxury-800/60 backdrop-blur-xl shrink-0">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-luxury-700/50 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6 text-luxury-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-display font-semibold text-luxury-50 tracking-tight">
          DeepAgents
        </span>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-[280px] bg-luxury-900 animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-luxury-500/20">
              <span className="font-display font-semibold text-luxury-50">Conversations</span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-luxury-700/50 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5 text-luxury-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar
              threads={threads}
              currentThreadId={threadId || paramThreadId || null}
              isLoadingThreads={isLoadingThreads}
              onSelectThread={handleSelectThread}
              onNewThread={handleNewThread}
              isMobile={true}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          threads={threads}
          currentThreadId={threadId || paramThreadId || null}
          isLoadingThreads={isLoadingThreads}
          onSelectThread={handleSelectThread}
          onNewThread={handleNewThread}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row bg-transparent overflow-hidden min-h-0">
        {/* Mobile Tab Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Chat - Always visible on desktop, conditional on mobile */}
          <div className={`flex-1 flex flex-col min-h-0 ${mobileTab !== 'chat' ? 'hidden lg:flex' : 'flex'}`}>
            <ChatArea
              messages={messages}
              isLoading={isLoading}
              isThreadLoading={isThreadLoading}
              writingStatus={writingStatus}
              onSendMessage={sendMessage}
              onStop={stopStream}
              isMobile={mobileTab === 'chat'}
            />
          </div>

          {/* Right Panel - Always visible on desktop, conditional on mobile */}
          <div className={`flex-1 lg:flex-none min-h-0 ${mobileTab === 'chat' ? 'hidden lg:flex' : 'flex'}`}>
            <RightPanel
              fileTree={fileTree}
              files={files}
              selectedNode={selectedNode}
              streamingFileId={isLoading ? 'streaming' : null}
              todos={todos}
              threadId={threadId || paramThreadId || null}
              onSelectNode={handleSelectNode}
              animatingFilePath={animatingFilePath}
              animatingPreviousContent={animatingPreviousContent}
              onAskToFix={handleAskToFix}
              mobileTab={mobileTab}
              isMobile={true}
            />
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav 
          activeTab={mobileTab} 
          onTabChange={setMobileTab}
          hasFiles={fileTree.length > 0}
          todoCount={todos.filter(t => t.status !== 'completed').length}
        />
      </div>
    </div>
  );
}
