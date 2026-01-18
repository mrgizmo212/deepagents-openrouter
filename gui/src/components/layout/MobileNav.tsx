import { Icon } from '../ui/Icon';

interface MobileNavProps {
  activeTab: 'chat' | 'files' | 'preview';
  onTabChange: (tab: 'chat' | 'files' | 'preview') => void;
  hasFiles: boolean;
  todoCount: number;
}

export function MobileNav({ activeTab, onTabChange, hasFiles, todoCount }: MobileNavProps): JSX.Element {
  return (
    <div className="lg:hidden flex items-center justify-around px-2 py-2 border-t border-luxury-500/20 bg-luxury-900/95 backdrop-blur-xl shrink-0 safe-area-bottom">
      <button
        onClick={() => onTabChange('chat')}
        className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200 ${
          activeTab === 'chat'
            ? 'bg-accent-400/15 text-accent-400'
            : 'text-luxury-400 hover:text-luxury-200'
        }`}
      >
        <Icon name="MessageCircle" size={22} />
        <span className="text-[10px] font-medium">Chat</span>
      </button>

      <button
        onClick={() => onTabChange('files')}
        className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200 relative ${
          activeTab === 'files'
            ? 'bg-accent-400/15 text-accent-400'
            : 'text-luxury-400 hover:text-luxury-200'
        }`}
      >
        <div className="relative">
          <Icon name="FolderOpen" size={22} />
          {hasFiles && activeTab !== 'files' && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent-400 rounded-full" />
          )}
        </div>
        <span className="text-[10px] font-medium">Files</span>
      </button>

      <button
        onClick={() => onTabChange('preview')}
        className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200 relative ${
          activeTab === 'preview'
            ? 'bg-accent-400/15 text-accent-400'
            : 'text-luxury-400 hover:text-luxury-200'
        }`}
      >
        <div className="relative">
          <Icon name="Eye" size={22} />
          {todoCount > 0 && (
            <span className="absolute -top-1 -right-2 px-1.5 py-0.5 bg-violet-500 text-white text-[8px] font-bold rounded-full min-w-[16px] text-center">
              {todoCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium">Preview</span>
      </button>
    </div>
  );
}
