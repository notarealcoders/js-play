'use client';

import { useCodeStore } from '@/lib/store';
import { CodeEditor } from '@/components/code-editor';
import { Preview } from '@/components/preview';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Code2, Play, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { html, css, javascript, setHtml, setCss, setJavascript, resetCode } = useCodeStore();
  const [mounted, setMounted] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[calc(100vh-80px)] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-3 border-b">
        <div className="flex items-center space-x-2">
          <Code2 className="w-6 h-6" />
          <h1 className="text-xl font-bold">Code Playground</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetCode}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button 
            size="sm"
            onClick={() => setKey(k => k + 1)}
          >
            <Play className="w-4 h-4 mr-2" />
            Run
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={50} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={33} minSize={20}>
                <div className="h-full p-2">
                  <CodeEditor
                    language="html"
                    value={html}
                    onChange={(value) => setHtml(value || '')}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={33} minSize={20}>
                <div className="h-full p-2">
                  <CodeEditor
                    language="css"
                    value={css}
                    onChange={(value) => setCss(value || '')}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={33} minSize={20}>
                <div className="h-full p-2">
                  <CodeEditor
                    language="javascript"
                    value={javascript}
                    onChange={(value) => setJavascript(value || '')}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-2">
              <Preview key={key} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}