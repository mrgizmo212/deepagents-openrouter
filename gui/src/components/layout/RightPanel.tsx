import { useState } from 'react';
import { FileTree } from '../filesystem/FileTree';
import { CodePreview } from '../preview/CodePreview';
import { AppPreview } from '../preview/AppPreview';
import { PreviewModal } from '../preview/PreviewModal';
import { TodoList } from '../todos/TodoList';
import { Icon } from '../ui/Icon';
import { useResizable } from '../../hooks/useResizable';
import type { FileNode, PreviewMode, RightPanelTab, TodoItem } from '../../types';

interface RightPanelProps {
  fileTree: FileNode[];
  files: Record<string, string>;
  selectedNode: FileNode | null;
  streamingFileId: string | null;
  todos: TodoItem[];
  threadId: string | null;
  onSelectNode: (node: FileNode) => void;
  /** File ID currently being animated (for typewriter effect) */
  animatingFilePath?: string | null;
  /** Previous content of the animating file (for diff-based animation) */
  animatingPreviousContent?: string;
  /** Callback to send deployment error to chat for fixing */
  onAskToFix?: (error: string) => void;
  /** Current mobile tab */
  mobileTab?: 'chat' | 'files' | 'preview';
  /** Whether in mobile mode */
  isMobile?: boolean;
}

export function RightPanel({
  fileTree,
  files,
  selectedNode,
  streamingFileId,
  todos,
  threadId,
  onSelectNode,
  animatingFilePath,
  animatingPreviousContent = '',
  onAskToFix,
  mobileTab = 'files',
  isMobile = false,
}: RightPanelProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<RightPanelTab>('filesystem');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('code');
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);

  const { width, isDragging, handleMouseDown } = useResizable({
    initialWidth: 450,
    minWidth: 300,
    maxWidth: 800,
  });

  const handleNodeSelect = (node: FileNode) => {
    onSelectNode(node);
    setPreviewMode('code');
    if (node.content) {
      setHasGeneratedContent(true);
    }
  };

  // On mobile, determine what to show based on mobileTab
  const showFilesView = isMobile ? mobileTab === 'files' : true;
  const showPreviewView = isMobile ? mobileTab === 'preview' : true;

  // Mobile: show app preview when on preview tab
  const effectivePreviewMode = isMobile && mobileTab === 'preview' ? 'app' : previewMode;

  return (
    <>
      <div
        className={`flex flex-col bg-luxury-850/80 backdrop-blur-2xl border-l border-luxury-500/20 relative ${
          isMobile ? 'w-full h-full' : ''
        }`}
        style={isMobile ? {} : { width, cursor: isDragging ? 'col-resize' : 'default' }}
      >
        {/* Drag Handle - Desktop only */}
        {!isMobile && (
          <div
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-50 resizer-handle"
            onMouseDown={handleMouseDown}
          />
        )}

        {/* Header */}
        <div className={`${isMobile ? 'h-14' : 'h-18'} flex items-center px-3 lg:px-5 border-b border-luxury-500/20 bg-luxury-800/40 shrink-0 justify-between`}>
          {effectivePreviewMode !== 'app' ? (
            <div className="flex bg-luxury-900/60 p-1 rounded-xl border border-luxury-600/20">
              <button
                type="button"
                onClick={() => setActiveTab('todos')}
                className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                  activeTab === 'todos'
                    ? 'bg-gradient-to-br from-luxury-700 to-luxury-750 text-luxury-50 shadow-lg border border-luxury-500/30'
                    : 'text-luxury-400 hover:text-luxury-200 hover:bg-luxury-800/50'
                }`}
              >
                Tasks
                {todos.filter((t) => t.status !== 'completed').length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-[9px] font-bold tabular-nums">
                    {todos.filter((t) => t.status !== 'completed').length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('filesystem')}
                className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                  activeTab === 'filesystem'
                    ? 'bg-gradient-to-br from-luxury-700 to-luxury-750 text-luxury-50 shadow-lg border border-luxury-500/30'
                    : 'text-luxury-400 hover:text-luxury-200 hover:bg-luxury-800/50'
                }`}
              >
                Files
              </button>
            </div>
          ) : (
            <div className="text-xs font-display font-bold text-luxury-400 uppercase tracking-widest ml-2">
              Live Preview
            </div>
          )}

          {activeTab === 'filesystem' && !isMobile && (
            <div className="flex bg-luxury-900/60 p-1 rounded-xl border border-luxury-600/20">
              <button
                type="button"
                onClick={() => setPreviewMode('code')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  previewMode === 'code'
                    ? 'bg-luxury-700 text-luxury-50 shadow-md'
                    : 'text-luxury-400 hover:text-luxury-200'
                }`}
                title="Code View"
              >
                <Icon name="Code" size={14} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('app')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  previewMode === 'app'
                    ? 'bg-luxury-700 text-luxury-50 shadow-md'
                    : 'text-luxury-400 hover:text-luxury-200'
                }`}
                title="Live App Preview"
              >
                <Icon name="Eye" size={14} />
              </button>
            </div>
          )}

          {/* Mobile: Show code/preview toggle when on files tab */}
          {isMobile && mobileTab === 'files' && activeTab === 'filesystem' && (
            <div className="flex bg-luxury-900/60 p-1 rounded-xl border border-luxury-600/20">
              <button
                type="button"
                onClick={() => setPreviewMode('code')}
                className={`p-1.5 rounded-lg transition-all duration-300 ${
                  previewMode === 'code'
                    ? 'bg-luxury-700 text-luxury-50 shadow-md'
                    : 'text-luxury-400 hover:text-luxury-200'
                }`}
                title="Code View"
              >
                <Icon name="Code" size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
          {(isMobile && mobileTab === 'preview') || (!isMobile && activeTab === 'filesystem' && previewMode === 'app') ? (
            <div className="flex-1 bg-white animate-fade-in overflow-hidden">
              <AppPreview
                files={files}
                isStreaming={!!streamingFileId}
                hasNavbar={hasGeneratedContent}
                threadId={threadId}
                onAskToFix={onAskToFix}
              />
            </div>
          ) : (
            <>
              {/* File List */}
              <div className="flex-1 overflow-y-auto p-3 mac-scrollbar min-h-0">
                {activeTab === 'filesystem' && (
                  <FileTree
                    nodes={fileTree}
                    selectedNode={selectedNode}
                    streamingFileId={streamingFileId}
                    onSelectNode={handleNodeSelect}
                  />
                )}
                {activeTab === 'todos' && (
                  <TodoList todos={todos} />
                )}
              </div>

              {/* Code Preview Pane */}
              {activeTab === 'filesystem' && (
                <CodePreview
                  selectedNode={selectedNode}
                  streamingFileId={streamingFileId}
                  onExpand={() => setPreviewExpanded(true)}
                  animatingFilePath={animatingFilePath ?? null}
                  animatingPreviousContent={animatingPreviousContent}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewExpanded && selectedNode && selectedNode.content && (
        <PreviewModal
          file={selectedNode}
          content={selectedNode.content}
          isStreaming={streamingFileId === selectedNode.id}
          onClose={() => setPreviewExpanded(false)}
          animateTypewriter={animatingFilePath === selectedNode.id}
          previousContent={animatingFilePath === selectedNode.id ? animatingPreviousContent : ''}
        />
      )}
    </>
  );
}
