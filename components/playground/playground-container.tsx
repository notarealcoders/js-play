'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Editor, useMonaco } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Trash2, Save, Share2, Code2, Copy, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';

const DEFAULT_CODE = `// Welcome to JavaScript Playground!
// Try writing some code and click "Run" to see the output

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));

// Try logging different types of data:
console.log({ object: 'example', array: [1, 2, 3] });
console.warn('This is a warning');
console.error('This is an error');`;

export function PlaygroundContainer() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const { toast } = useToast();
  const monaco = useMonaco();
  const editorRef = useRef(null);

  // Configure Monaco editor on mount
  useEffect(() => {
    if (monaco) {
      try {
        // Configure JavaScript defaults
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        });

        // Enable type definitions
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ESNext,
          allowNonTsExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          typeRoots: ['node_modules/@types'],
        });
      } catch (error) {
        console.error('Monaco editor configuration error:', error);
      }
    }
  }, [monaco]);

  // Load saved code on mount
  useEffect(() => {
    try {
      const savedCode = localStorage.getItem('playground-code');
      if (savedCode) {
        setCode(savedCode);
      }
    } catch (error) {
      console.error('Error loading saved code:', error);
    }
  }, []);

  // Auto-save code changes
  useEffect(() => {
    if (!code) return;
    
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('playground-code', code);
      } catch (error) {
        console.error('Error saving code:', error);
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [code]);

  const formatOutput = useCallback((args: any[]) => {
    if (!Array.isArray(args)) return '';
    
    return args.map(arg => {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  }, []);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    setIsEditorReady(true);
  };

  const handleRunCode = useCallback(() => {
    if (!code) return;
    
    setIsExecuting(true);
    setOutput('');
    
    try {
      // Create a secure sandbox environment
      const sandbox = {
        console: {
          log: (...args: any[]) => {
            setOutput(prev => prev + formatOutput(args) + '\n');
          },
          error: (...args: any[]) => {
            setOutput(prev => prev + '🔴 Error: ' + formatOutput(args) + '\n');
          },
          warn: (...args: any[]) => {
            setOutput(prev => prev + '⚠️ Warning: ' + formatOutput(args) + '\n');
          },
          info: (...args: any[]) => {
            setOutput(prev => prev + 'ℹ️ Info: ' + formatOutput(args) + '\n');
          }
        },
        setTimeout: (fn: Function, delay: number) => {
          if (delay > 5000) delay = 5000; // Limit timeout to 5 seconds
          return setTimeout(fn, delay);
        },
        clearTimeout,
        Math,
        Date,
        JSON,
        Number,
        String,
        Boolean,
        Array,
        Object,
        Error,
        RegExp,
      };

      // Wrap code in try-catch and async IIFE for better error handling
      const wrappedCode = `
        (async () => {
          try {
            ${code}
          } catch (error) {
            console.error(error.message);
          }
        })();
      `;

      // Execute in isolated context
      const executeCode = new Function('sandbox', `
        with (sandbox) {
          ${wrappedCode}
        }
      `);

      executeCode(sandbox);
    } catch (error: any) {
      setOutput(`🔴 Error: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  }, [code, formatOutput]);

  const handleFormat = useCallback(async () => {
    if (!code) return;
    
    try {
      const formatted = prettier.format(code, {
        parser: 'babel',
        plugins: [parserBabel],
        semi: true,
        singleQuote: true,
      });
      setCode(formatted);
      toast({
        title: "Formatted",
        description: "Code has been formatted successfully",
      });
    } catch (err: any) {
      toast({
        title: "Format Error",
        description: err.message,
        variant: "destructive",
      });
    }
  }, [code, toast]);

  const handleClear = useCallback(() => {
    setCode(DEFAULT_CODE);
    setOutput('');
    try {
      localStorage.removeItem('playground-code');
      toast({
        title: "Cleared",
        description: "The editor has been reset to default",
      });
    } catch (error) {
      console.error('Error clearing code:', error);
    }
  }, [toast]);

  const handleSave = useCallback(() => {
    if (!code) return;
    
    try {
      localStorage.setItem('playground-code', code);
      toast({
        title: "Saved",
        description: "Your code has been saved locally",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save code locally",
        variant: "destructive",
      });
    }
  }, [code, toast]);

  const handleShare = useCallback(async () => {
    if (!code) return;
    
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied to clipboard",
        description: "Code copied and ready to share",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
      });
    }
  }, [code, toast]);

  const handleDownload = useCallback(() => {
    if (!code) return;
    
    try {
      const blob = new Blob([code], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'playground-code.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Downloaded",
        description: "Code has been downloaded as JavaScript file",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download code",
        variant: "destructive",
      });
    }
  }, [code, toast]);

  const handleUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (content) {
            setCode(content);
            toast({
              title: "Uploaded",
              description: "Code has been loaded from file",
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to read uploaded file",
            variant: "destructive",
          });
        }
      };
      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to read uploaded file",
          variant: "destructive",
        });
      };
      reader.readAsText(file);
    }
  }, [toast]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Editor</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={handleFormat} disabled={!isEditorReady}>
              <Copy className="h-4 w-4 mr-1" />
              Format
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={!isEditorReady}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} disabled={!isEditorReady}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={!isEditorReady}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <label className="cursor-pointer">
              <Button variant="outline" size="sm" asChild disabled={!isEditorReady}>
                <span>
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </span>
              </Button>
              <input
                type="file"
                accept=".js,.txt"
                className="hidden"
                onChange={handleUpload}
                disabled={!isEditorReady}
              />
            </label>
            <Button 
              size="sm" 
              onClick={handleRunCode} 
              disabled={isExecuting || !isEditorReady}
            >
              <Play className="h-4 w-4 mr-1" />
              Run
            </Button>
          </div>
        </div>
        <Editor
          height="500px"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            formatOnPaste: true,
            formatOnType: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            wrappingIndent: 'indent',
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            formatOnSave: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            quickSuggestions: true,
            quickSuggestionsDelay: 100,
            parameterHints: {
              enabled: true,
            },
          }}
        />
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Output</h2>
        </div>
        <div className="h-[500px] bg-black rounded-md p-4 font-mono text-sm overflow-auto">
          <pre className="text-green-400 whitespace-pre-wrap">{output || 'Run your code to see the output here...\n\nTips:\n- Use console.log() to output values\n- Try console.warn() and console.error()\n- Objects and arrays are automatically formatted'}</pre>
        </div>
      </Card>
    </div>
  );
}