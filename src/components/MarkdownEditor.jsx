import { useRef, useState, useEffect } from 'react';

function MarkdownEditor({ value, onChange, onScroll, previewRef, onLineChange, onCopy }) {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const [cursorInfo, setCursorInfo] = useState({ line: 1, col: 1 });
  const [totalLines, setTotalLines] = useState(1);
  
  // 計算實際行數
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // 使用 split('\n') 計算邏輯行數（換行符分隔的行）
    // 這是準確的方法，因為行號應該對應邏輯行，而不是視覺行（自動換行的行）
    const lines = value.split('\n');
    const logicalLines = value === '' ? 1 : lines.length;
    
    // 獲取實際的 line-height 和 padding
    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(computedStyle.lineHeight) || 24;
    const paddingTop = parseFloat(computedStyle.paddingTop) || 16;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 16;
    const totalPadding = paddingTop + paddingBottom;
    
    // 計算 textarea 實際需要的行數（考慮內容高度）
    const contentHeight = textarea.scrollHeight - totalPadding;
    const visualLines = Math.max(1, Math.ceil(contentHeight / lineHeight));
    
    // 使用邏輯行數和視覺行數中的較大值，確保行號足夠
    const actualLines = Math.max(logicalLines, visualLines);
    
    setTotalLines(actualLines);
  }, [value]);
  
  // 同步行號滾動
  const syncLineNumbersScroll = () => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;
    
    if (!textarea || !lineNumbers) return;
    
    // 直接同步，確保即時響應
    const textareaScrollTop = textarea.scrollTop;
    
    // 確保行號區域的滾動位置與 textarea 完全一致
    if (Math.abs(lineNumbers.scrollTop - textareaScrollTop) > 0.5) {
      lineNumbers.scrollTop = textareaScrollTop;
    }
  };
  
  // 更新游標位置
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const pos = textarea.selectionStart;
    const before = value.substring(0, pos);
    const line = before.split('\n').length;
    const col = before.split('\n').pop().length + 1;
    
    setCursorInfo({ line, col });
    if (onLineChange) {
      onLineChange(line);
    }
  }, [value, onLineChange]);

  // 當內容變化時，確保行號區域的滾動位置同步
  useEffect(() => {
    syncLineNumbersScroll();
  }, [value]);

  // 滾動同步
  const handleScroll = () => {
    if (onScroll && textareaRef.current && previewRef?.current) {
      const textarea = textareaRef.current;
      const preview = previewRef.current;
      
      // 計算滾動比例
      const scrollRatio = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
      const maxScroll = preview.scrollHeight - preview.clientHeight;
      
      preview.scrollTop = scrollRatio * maxScroll;
    }
  };


  const handleKeyDown = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 自動延續清單
    if (e.key === 'Enter') {
      const pos = textarea.selectionStart;
      const before = value.substring(0, pos);
      const lineText = before.split('\n').pop();
      const match = lineText.match(/^(\s*)([-*+]|\d+\.)\s+/);

      if (match) {
        e.preventDefault();
        const prefix = match[0]; // "- " 或 "1. " 或 "1. "
        const after = value.substring(pos);
        
        // 如果是有序列表，自動遞增數字
        const orderedMatch = prefix.match(/^(\s*)(\d+)\.\s+/);
        let newPrefix = prefix;
        if (orderedMatch) {
          const indent = orderedMatch[1];
          const num = parseInt(orderedMatch[2], 10);
          newPrefix = `${indent}${num + 1}. `;
        }

        const newText = before + '\n' + newPrefix + after;
        onChange(newText);

        // 移動游標
        setTimeout(() => {
          textarea.setSelectionRange(pos + 1 + newPrefix.length, pos + 1 + newPrefix.length);
        }, 0);

        return;
      }
    }

    // Tab → 插入 2 空格
    if (e.key === 'Tab') {
      e.preventDefault();
      const pos = textarea.selectionStart;
      const before = value.substring(0, pos);
      const after = value.substring(textarea.selectionEnd);

      const newText = before + '  ' + after;
      onChange(newText);

      setTimeout(() => {
        textarea.setSelectionRange(pos + 2, pos + 2);
      }, 0);

      return;
    }
  };

  const lineNumbers = Array.from({ length: totalLines }, (_, i) => i + 1);

  const handleTextareaScroll = () => {
    syncLineNumbersScroll();
    handleScroll();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      if (onCopy) {
        onCopy();
      }
    } catch (err) {
      console.error('複製失敗:', err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-2 rounded-tl-lg border-2 border-gray-800 border-r-0 flex justify-between items-center h-10">
        <h2 className="text-sm font-semibold">Markdown 編輯器</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-300">
            第 {cursorInfo.line} 行，第 {cursorInfo.col} 列
          </span>
          <button
            onClick={handleCopy}
            className="text-gray-300 hover:text-white p-1 rounded transition-colors focus:outline-none focus:ring-0 border-0"
            title="複製 Markdown 內容"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 flex border border-gray-300 border-t-0 overflow-hidden">
        {/* 行號區域 */}
        <div 
          ref={lineNumbersRef}
          className="line-numbers bg-gray-50 border-r border-gray-300 px-2 text-right text-xs text-gray-500 font-mono select-none overflow-y-auto"
          style={{ 
            minWidth: '3rem',
            lineHeight: '1.5rem',
            paddingTop: '1rem', // 與 textarea 的 padding-top 一致
            paddingBottom: '1rem' // 與 textarea 的 padding-bottom 一致
          }}
        >
          {lineNumbers.map((num) => (
            <div key={num} style={{ lineHeight: '1.5rem', minHeight: '1.5rem' }}>
              {num}
            </div>
          ))}
        </div>
        <style>{`
          .line-numbers {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .line-numbers::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {/* 編輯區域 */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            // 延遲更新，確保游標位置已更新
            setTimeout(() => {
              const textarea = textareaRef.current;
              if (!textarea) return;
              const pos = textarea.selectionStart;
              const before = e.target.value.substring(0, pos);
              const line = before.split('\n').length;
              const col = before.split('\n').pop().length + 1;
              setCursorInfo({ line, col });
            }, 0);
          }}
          onScroll={handleTextareaScroll}
          onKeyDown={(e) => {
            handleKeyDown(e);
            // 延遲更新，確保游標位置已更新
            setTimeout(() => {
              const textarea = textareaRef.current;
              if (!textarea) return;
              const pos = textarea.selectionStart;
              const before = value.substring(0, pos);
              const line = before.split('\n').length;
              const col = before.split('\n').pop().length + 1;
              setCursorInfo({ line, col });
            }, 0);
          }}
          onMouseUp={() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const pos = textarea.selectionStart;
            const before = value.substring(0, pos);
            const line = before.split('\n').length;
            const col = before.split('\n').pop().length + 1;
            setCursorInfo({ line, col });
          }}
          onClick={() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const pos = textarea.selectionStart;
            const before = value.substring(0, pos);
            const line = before.split('\n').length;
            const col = before.split('\n').pop().length + 1;
            setCursorInfo({ line, col });
          }}
          className="flex-1 w-full p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm bg-white text-black"
          placeholder="在此輸入 Markdown 內容..."
          style={{ lineHeight: '1.5rem' }}
        />
      </div>
    </div>
  );
}

export default MarkdownEditor;

