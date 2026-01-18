import { Icon } from '../ui/Icon';

export interface ThreadHistoryItem {
  id: string;
  title: string;
  createdAt: Date;
  isActive?: boolean;
}

interface SidebarProps {
  threads: ThreadHistoryItem[];
  currentThreadId: string | null;
  isLoadingThreads?: boolean;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
  isMobile?: boolean;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function Sidebar({
  threads,
  currentThreadId,
  isLoadingThreads,
  onSelectThread,
  onNewThread,
  isMobile = false,
}: SidebarProps): JSX.Element {
  return (
    <div className={`${isMobile ? 'w-full h-full' : 'w-[240px] h-full'} mac-sidebar flex flex-col shrink-0 ${isMobile ? 'pt-0' : 'pt-4'}`}>
      {/* New Thread button */}
      <div className={`px-3 mb-4 ${isMobile ? 'mt-4' : ''}`}>
        <div
          onClick={onNewThread}
          className="
            group
            flex items-center gap-2
            px-3 py-3
            rounded-lg
            bg-accent-400/10
            border border-accent-400/20
            hover:border-accent-400/40
            hover:bg-accent-400/15
            cursor-pointer
            transition-all duration-200
            active:scale-[0.98]
          "
        >
          <Icon name="Plus" size={18} className="text-accent-400" />
          <span className="text-sm font-medium text-accent-400 group-hover:text-accent-300">
            New Conversation
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 mb-3">
        <div className="relative group">
          <Icon
            name="Search"
            size={14}
            className="absolute left-3 top-3 text-luxury-400 group-focus-within:text-accent-400 transition-colors duration-200"
          />
          <input
            type="text"
            placeholder="Search conversations..."
            className="mac-input w-full rounded-lg py-2.5 pl-9 pr-3 text-sm bg-luxury-800/50"
          />
        </div>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto px-2 mac-scrollbar">

        {/* Loading state */}
        {isLoadingThreads && (
          <div className="space-y-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-14 mx-1 rounded-lg" />
            ))}
          </div>
        )}

        {/* Thread items */}
        {!isLoadingThreads && threads.map((thread, index) => (
          <div
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            className={`
              group
              flex flex-col
              px-3 py-3
              mx-1
              mb-1
              rounded-lg
              cursor-pointer
              transition-all duration-200
              animate-fade-in
              active:scale-[0.98]
              ${
                thread.id === currentThreadId
                  ? 'bg-primary/15 border border-primary/25 text-luxury-50'
                  : 'hover:bg-luxury-750/50 border border-transparent text-luxury-100 hover:text-luxury-50'
              }
            `}
            style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
          >
            <span className="text-sm font-medium truncate">{thread.title}</span>
            <span className="text-[10px] text-luxury-500 mt-0.5">{formatDate(thread.createdAt)}</span>
          </div>
        ))}

        {/* Empty state */}
        {!isLoadingThreads && threads.length === 0 && (
          <div className="px-3 py-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-luxury-800/50 border border-luxury-600/20 flex items-center justify-center animate-float">
              <Icon name="MessageCircle" size={20} className="text-luxury-400/40" />
            </div>
            <p className="text-sm font-medium text-luxury-400">No conversations yet</p>
            <p className="text-xs text-luxury-500 mt-1">Start a new conversation above</p>
          </div>
        )}
      </div>
    </div>
  );
}
