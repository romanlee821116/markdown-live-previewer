import { forwardRef, useEffect, useRef } from 'react';

const HtmlViewer = forwardRef(({ html, currentLine }, ref) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current || !currentLine) return;

    // 找到對應行的元素（通過 data-line 屬性）
    const targetElement = contentRef.current.querySelector(`[data-line="${currentLine}"]`);
    
    if (targetElement && ref?.current) {
      // 滾動到對應元素
      const elementRect = targetElement.getBoundingClientRect();
      const containerRect = ref.current.getBoundingClientRect();
      const scrollTop = ref.current.scrollTop;
      const elementTop = elementRect.top - containerRect.top + scrollTop;
      
      ref.current.scrollTo({
        top: elementTop - 50, // 留一些頂部空間
        behavior: 'smooth'
      });
    }
  }, [currentLine, html, ref]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-2 rounded-tr-lg border-2 border-gray-800 border-l-0 flex items-center h-10">
        <h2 className="text-sm font-semibold">HTML 預覽</h2>
      </div>
      <div 
        ref={ref}
        className="flex-1 w-full p-4 border border-gray-300 border-t-0 bg-white overflow-auto text-black"
      >
        <div
          ref={contentRef}
          className="markdown-content text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
});

HtmlViewer.displayName = 'HtmlViewer';

export default HtmlViewer;

