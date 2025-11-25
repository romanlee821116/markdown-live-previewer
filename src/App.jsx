import { useState, useRef, useEffect } from 'react';
import './App.css';
import MarkdownEditor from './components/MarkdownEditor';
import HtmlViewer from './components/HtmlViewer';
import MarkdownSyntaxGuide from './components/MarkdownSyntaxGuide';
import Toast from './components/Toast';
import { markDownSyntax } from './config/markDownSyntax';
import { markdownToHtml } from './utils/markdownParser';

function App() {
  const [markdown, setMarkdown] = useState(markDownSyntax);
  const html = markdownToHtml(markdown);
  const previewRef = useRef(null);
  const containerRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(50); // 百分比
  const [isResizing, setIsResizing] = useState(false);
  const [currentLine, setCurrentLine] = useState(1);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;
      
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // 限制在 20% 到 80% 之間
      const clampedWidth = Math.max(20, Math.min(80, newLeftWidth));
      setLeftWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 w-screen h-full">
      <div className="max-w-full mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Markdown 轉 HTML 工具
        </h1>
        
        {/* Markdown 語法指南 */}
        <div className="mb-4">
          <MarkdownSyntaxGuide />
        </div>

        <div 
          ref={containerRef}
          className="flex gap-0 border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg"
          style={{ height: 'calc(100vh - 12rem)' }}
        >
          {/* 左側編輯器 */}
          <div 
            className="h-full overflow-hidden"
            style={{ width: `${leftWidth}%` }}
          >
            <MarkdownEditor 
              value={markdown} 
              onChange={setMarkdown}
              previewRef={previewRef}
              onLineChange={setCurrentLine}
              onCopy={() => setShowToast(true)}
            />
          </div>

          {/* 調整大小的拖動條 */}
          <div
            className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors relative group"
            onMouseDown={() => setIsResizing(true)}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-0.5 h-12 bg-gray-400 group-hover:bg-blue-600"></div>
            </div>
          </div>

          {/* 右側預覽 */}
          <div 
            className="h-full overflow-hidden"
            style={{ width: `${100 - leftWidth}%` }}
          >
            <HtmlViewer html={html} ref={previewRef} currentLine={currentLine} />
          </div>
        </div>
      </div>
      
      <Toast 
        message="Content Copied" 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
}

export default App;
