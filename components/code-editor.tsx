'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { EditorProps } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => {
    // Initialize Monaco Editor
    mod.loader.config({
      paths: {
        vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
      }
    });
    return mod;
  }),
  { 
    ssr: false,
    loading: () => (
      <Card className="h-full">
        <Skeleton className="w-full h-full" />
      </Card>
    )
  }
);

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
}

export function CodeEditor({ language, value, onChange }: CodeEditorProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleEditorDidMount: EditorProps['onMount'] = (editor) => {
    editor.focus();
  };

  if (!mounted) {
    return (
      <Card className="h-full">
        <Skeleton className="w-full h-full" />
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-hidden border">
      <MonacoEditor
        height="100%"
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          wrappingIndent: 'indent',
          padding: { top: 10, bottom: 10 },
        }}
        onMount={handleEditorDidMount}
        loading={
          <Card className="h-full">
            <Skeleton className="w-full h-full" />
          </Card>
        }
      />
    </Card>
  );
}