import { useMemo } from 'react';
import {
  SandpackProvider,
  SandpackPreview as SandpackPreviewComponent,
  SandpackLayout,
} from '@codesandbox/sandpack-react';
import { Icon } from '../ui/Icon';

interface SandpackPreviewProps {
  files: Record<string, string>;
  isStreaming: boolean;
}

// Convert our file structure to Sandpack format
function convertToSandpackFiles(files: Record<string, string>): Record<string, { code: string }> {
  const sandpackFiles: Record<string, { code: string }> = {};
  
  for (const [path, content] of Object.entries(files)) {
    // Skip memory files
    if (path.includes('/memory/')) continue;
    
    // Sandpack expects paths starting with /
    const sandpackPath = path.startsWith('/') ? path : `/${path}`;
    sandpackFiles[sandpackPath] = { code: content || '' };
  }
  
  return sandpackFiles;
}

// Detect the template based on files
function detectTemplate(files: Record<string, string>): 'react' | 'react-ts' | 'vanilla' | 'vanilla-ts' {
  const hasTypeScript = Object.keys(files).some(f => f.endsWith('.tsx') || f.endsWith('.ts'));
  const hasReact = Object.keys(files).some(f => 
    f.includes('App.tsx') || f.includes('App.jsx') || f.includes('App.js')
  ) || Object.values(files).some(content => 
    content?.includes('import React') || content?.includes('from "react"') || content?.includes("from 'react'")
  );
  
  if (hasReact && hasTypeScript) return 'react-ts';
  if (hasReact) return 'react';
  if (hasTypeScript) return 'vanilla-ts';
  return 'vanilla';
}

// Check if we have the minimum files needed for a preview
function hasMinimumFiles(files: Record<string, string>): boolean {
  const fileKeys = Object.keys(files);
  // Need at least one JS/TS/JSX/TSX file
  return fileKeys.some(f => 
    f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.ts') || f.endsWith('.tsx')
  );
}

export function SandpackPreview({ files, isStreaming }: SandpackPreviewProps): JSX.Element {
  const sandpackFiles = useMemo(() => convertToSandpackFiles(files), [files]);
  const template = useMemo(() => detectTemplate(files), [files]);
  const hasFiles = useMemo(() => hasMinimumFiles(files), [files]);

  // Show placeholder if no files yet
  if (!hasFiles) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-luxury-900 text-luxury-400">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full bg-luxury-800/50 border border-luxury-600/30 flex items-center justify-center">
            <Icon name="Code" size={24} className="text-luxury-500" />
          </div>
        </div>
        <p className="text-sm font-medium text-luxury-300">No Preview Available</p>
        <p className="text-xs text-luxury-500 mt-2 text-center px-4">
          Start a conversation to generate code
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white">
      <SandpackProvider
        template={template}
        files={sandpackFiles}
        theme="dark"
        options={{
          recompileMode: 'delayed',
          recompileDelay: 500,
          autorun: !isStreaming, // Don't auto-run while streaming
          autoReload: true,
        }}
        customSetup={{
          dependencies: {
            'react': '^18.2.0',
            'react-dom': '^18.2.0',
            'lucide-react': '^0.263.1',
            'tailwindcss': '^3.3.0',
            'clsx': '^2.0.0',
            'framer-motion': '^10.16.0',
          },
        }}
      >
        <SandpackLayout style={{ height: '100%', border: 'none' }}>
          <SandpackPreviewComponent
            showNavigator={false}
            showRefreshButton={true}
            showOpenInCodeSandbox={false}
            style={{ height: '100%' }}
          />
        </SandpackLayout>
      </SandpackProvider>
      
      {/* Streaming overlay */}
      {isStreaming && (
        <div className="absolute top-2 right-2 flex items-center gap-2 px-2 py-1 bg-luxury-900/80 rounded-lg border border-luxury-600/30">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500" />
          </span>
          <span className="text-[10px] text-luxury-300 font-medium">Updating...</span>
        </div>
      )}
    </div>
  );
}
