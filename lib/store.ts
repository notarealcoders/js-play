import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CodeState {
  html: string;
  css: string;
  javascript: string;
  layout: {
    editorSize: number;
    consoleSize: number;
  };
  setHtml: (html: string) => void;
  setCss: (css: string) => void;
  setJavascript: (javascript: string) => void;
  setLayout: (layout: { editorSize: number; consoleSize: number }) => void;
  resetCode: () => void;
  formatCode: () => void;
}

const defaultState = {
  html: '<div class="container">\n  <h1>Welcome to Code Playground</h1>\n  <p>Start editing to see your changes!</p>\n  <button id="btn">Click me!</button>\n</div>',
  css: '.container {\n  max-width: 600px;\n  margin: 2rem auto;\n  padding: 2rem;\n  font-family: system-ui, sans-serif;\n  text-align: center;\n}\n\nh1 {\n  color: #2563eb;\n  margin-bottom: 1rem;\n}\n\np {\n  color: #4b5563;\n  margin-bottom: 2rem;\n}\n\nbutton {\n  background-color: #2563eb;\n  color: white;\n  border: none;\n  padding: 0.5rem 1rem;\n  border-radius: 0.25rem;\n  cursor: pointer;\n  transition: background-color 0.2s;\n}\n\nbutton:hover {\n  background-color: #1d4ed8;\n}',
  javascript: 'document.getElementById("btn").addEventListener("click", () => {\n  alert("Button clicked!");\n  console.log("Button event triggered");\n});',
  layout: {
    editorSize: 50,
    consoleSize: 30,
  },
};

export const useCodeStore = create<CodeState>()(
  persist(
    (set) => ({
      ...defaultState,
      setHtml: (html) => set({ html }),
      setCss: (css) => set({ css }),
      setJavascript: (javascript) => set({ javascript }),
      setLayout: (layout) => set({ layout }),
      resetCode: () => set(defaultState),
      formatCode: () => {
        // Simple formatting function that doesn't rely on prettier
        set((state) => ({
          html: state.html.trim(),
          css: state.css.trim(),
          javascript: state.javascript.trim(),
        }));
      },
    }),
    {
      name: 'code-playground-storage',
    }
  )
);