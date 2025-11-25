import { useState } from 'react';

function MarkdownSyntaxGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-800 text-white px-4 py-2 rounded-t-lg border-2 border-gray-800 flex items-center justify-between h-10 hover:bg-gray-700 transition-colors"
      >
        <h2 className="text-sm font-semibold">Markdown 語法指南</h2>
        <span className="text-gray-300 text-xs">
          {isOpen ? '▼' : '▶'}
        </span>
      </button>
      
      {isOpen && (
        <div className="bg-white border border-gray-300 border-t-0 rounded-b-lg p-4 shadow-sm text-black">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2 text-gray-800">標題</h3>
              <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto font-mono"><code># H1
## H2
### H3</code></pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-gray-800">文字格式</h3>
              <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto font-mono"><code>**粗體**
*斜體*
~~刪除線~~</code></pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-gray-800">列表</h3>
              <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto font-mono"><code>- 無序列表
1. 有序列表</code></pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-gray-800">連結與圖片</h3>
              <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto font-mono"><code>[連結文字](URL)
![圖片](URL)</code></pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-gray-800">代碼</h3>
              <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto font-mono"><code>`行內代碼`
```
代碼塊
```</code></pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-gray-800">引用</h3>
              <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto font-mono"><code>&gt; 引用內容</code></pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-gray-800">表格</h3>
              <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto font-mono"><code>| 標題1 | 標題2 |
|-------|:-----:|
| 內容1 | 內容2 |</code></pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-gray-800">水平線</h3>
              <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto font-mono"><code>---</code></pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarkdownSyntaxGuide;

