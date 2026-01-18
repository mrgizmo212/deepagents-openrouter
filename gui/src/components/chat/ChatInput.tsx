import { useState, useCallback, KeyboardEvent } from 'react';
import { Icon } from '../ui/Icon';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ChatInput({ onSend, onStop, disabled = false, isLoading = false }: ChatInputProps): JSX.Element {
  const [value, setValue] = useState('');

  const handleSend = useCallback(() => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue('');
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="p-3 lg:p-6 pt-2 lg:pt-4 safe-area-bottom">
      <div className="
        bg-luxury-800/80
        backdrop-blur-2xl
        border border-luxury-500/20
        rounded-xl lg:rounded-2xl
        p-1 lg:p-1.5
        flex items-center
        shadow-2xl shadow-black/30
        relative
        focus-within:border-accent-400/30
        focus-within:shadow-[0_0_30px_-8px_rgba(212,166,90,0.2)]
        transition-all duration-300
        max-w-4xl mx-auto
        hover:border-luxury-500/30
      ">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What shall we create?"
          disabled={disabled}
          className="
            bg-transparent
            flex-1
            px-3 lg:px-4 py-2.5 lg:py-3
            outline-none
            text-sm lg:text-base
            text-luxury-50
            placeholder-luxury-400
            disabled:opacity-50
            font-medium
            min-w-0
          "
        />

        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="
              p-2 lg:p-2.5
              rounded-lg lg:rounded-xl
              transition-all duration-300
              bg-gradient-to-br from-status-error/90 to-status-error/70
              hover:from-status-error hover:to-status-error/80
              text-white
              shadow-lg shadow-status-error/30
              hover:shadow-xl hover:shadow-status-error/40
              active:scale-95
              shrink-0
            "
          >
            <Icon name="Square" size={18} strokeWidth={2.5} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            className={`
              p-2 lg:p-2.5
              rounded-lg lg:rounded-xl
              transition-all duration-300
              shrink-0
              ${
                value.trim() && !disabled
                  ? 'bg-gradient-to-br from-accent-400 to-accent-500 text-luxury-900 shadow-lg shadow-accent-400/30 hover:shadow-xl hover:shadow-accent-400/40 hover:-translate-y-0.5 active:scale-95'
                  : 'bg-luxury-700/50 text-luxury-400 cursor-not-allowed'
              }
            `}
          >
            <Icon name="ArrowUp" size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
