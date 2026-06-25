import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ socket, roomId }) => {
  const [code, setCode] = useState('// Write your code here\n');
  const [language, setLanguage] = useState('javascript');
  const editorRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('code-update', (newCode) => {
      if (newCode !== code) {
        setCode(newCode);
      }
    });

    return () => {
      socket.off('code-update');
    };
  }, [socket, code]);

  const handleEditorChange = (value) => {
    setCode(value);
    if (socket) {
      socket.emit('code-change', value);
    }
  };

  return (
    <div className="flex flex-col h-full border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Live Editor</h3>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 outline-none text-slate-800 dark:text-slate-200"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>
      <div className="flex-grow">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          onMount={(editor) => (editorRef.current = editor)}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
