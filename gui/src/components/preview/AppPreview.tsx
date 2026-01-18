import { SandpackPreview } from './SandpackPreview';

interface AppPreviewProps {
  files: Record<string, string>;
  isStreaming: boolean;
  hasNavbar: boolean;
  threadId: string | null;
  /** Callback to send deployment error to chat for fixing */
  onAskToFix?: (error: string) => void;
}

export function AppPreview({
  files,
  isStreaming,
  hasNavbar,
}: AppPreviewProps): JSX.Element {
  return (
    <div className="w-full h-full bg-luxury-900 flex flex-col overflow-hidden relative">
      {/* Header with streaming indicator */}
      {hasNavbar && (
        <div className="h-8 bg-luxury-800 border-b border-luxury-600/30 flex items-center px-3 shrink-0">
          <span className="text-[10px] text-luxury-300 font-medium uppercase tracking-wider">
            Live Preview
          </span>
          {isStreaming && (
            <span className="ml-2 flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500" />
            </span>
          )}
        </div>
      )}

      {/* Preview content */}
      <div className="flex-1 overflow-hidden">
        <SandpackPreview files={files} isStreaming={isStreaming} />
      </div>
    </div>
  );
}
