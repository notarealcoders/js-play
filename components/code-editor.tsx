'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { EditorProps } from '@monaco-editor/react';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  { ssr: false }
);

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
}

export function CodeEditor({ language, value, onChange }: CodeEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
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
      />
    </Card>
  );
}