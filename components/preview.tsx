'use client';

import { useEffect, useRef, useState } from 'react';
import { useCodeStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConsoleMessage {
  type: 'log' | 'error' | 'warn';
  content: string[];
  timestamp: number;
}

export function Preview() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { html, css, javascript } = useCodeStore();
  const [mounted, setMounted] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updatePreview = () => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const doc = iframe.contentDocument;
      if (!doc) return;

      const content = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                margin: 0;
                padding: 1rem;
                font-family: system-ui, -apple-system, sans-serif;
              }
              ${css}
            </style>
          </head>
          <body>
            ${html}
            <script>
              try {
                const console = {
                  log: function(...args) {
                    window.parent.postMessage({ type: 'console', method: 'log', args }, '*');
                  },
                  error: function(...args) {
                    window.parent.postMessage({ type: 'console', method: 'error', args }, '*');
                  },
                  warn: function(...args) {
                    window.parent.postMessage({ type: 'console', method: 'warn', args }, '*');
                  }
                };
                ${javascript}
              } catch (error) {
                console.error(error.message);
              }
            </script>
          </body>
        </html>
      `;

      doc.open();
      doc.write(content);
      doc.close();
    };

    updatePreview();
  }, [html, css, javascript, mounted]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'console') {
        const { method, args } = event.data;
        setConsoleMessages(prev => [...prev, {
          type: method,
          content: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ),
          timestamp: Date.now()
        }]);
        console[method](...args);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!mounted) {
    return (
      <Card className="h-full">
        <Skeleton className="w-full h-full" />
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={70} minSize={30}>
          <iframe
            ref={iframeRef}
            className="w-full h-full bg-white dark:bg-zinc-900 rounded-lg"
            sandbox="allow-scripts allow-same-origin allow-modals"
            title="preview"
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="h-full bg-zinc-950 text-white p-2 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Console</h3>
              {consoleMessages.length > 0 && (
                <button
                  onClick={() => setConsoleMessages([])}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <ScrollArea className="h-[calc(100%-2rem)]">
              {consoleMessages.length === 0 ? (
                <div className="text-zinc-500 text-sm">No console output</div>
              ) : (
                <div className="space-y-1">
                  {consoleMessages.map((msg, i) => (
                    <div
                      key={msg.timestamp + i}
                      className={`font-mono text-sm p-1 rounded ${
                        msg.type === 'error' ? 'text-red-400 bg-red-950/50' :
                        msg.type === 'warn' ? 'text-yellow-400 bg-yellow-950/50' :
                        'text-green-400 bg-green-950/50'
                      }`}
                    >
                      {msg.content.map((content, j) => (
                        <div key={j} className="whitespace-pre-wrap">{content}</div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Card>
  );
}