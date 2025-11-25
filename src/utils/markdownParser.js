/**
 * 處理行內 markdown 語法（粗體、斜體、連結等）
 */
export const processInlineMarkdown = (text) => {
  if (!text) return '';
  
  let result = text;
  
  // 處理行內代碼（必須先處理，避免其他規則影響）
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // 處理粗體和斜體（先處理粗斜體，再處理粗體，最後處理斜體）
  result = result.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  result = result.replace(/___(.*?)___/g, '<strong><em>$1</em></strong>');
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.*?)__/g, '<strong>$1</strong>');
  result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
  result = result.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // 處理刪除線
  result = result.replace(/~~(.*?)~~/g, '<del>$1</del>');
  
  // 處理連結
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // 處理圖片（支持可選的 title）
  result = result.replace(/!\[([^\]]*)\]\(([^)]+?)(?:\s+"([^"]+)")?\)/g, (match, alt, src, title) => {
    const titleAttr = title ? ` title="${title}"` : '';
    // 處理圖片路徑：如果是絕對路徑（以 / 開頭）且不是完整 URL，需要加上 base path
    let imageSrc = src;
    if (src.startsWith('/') && !src.startsWith('//') && !src.match(/^https?:\/\//)) {
      // 獲取 base URL（在 Vite 中，import.meta.env.BASE_URL 包含尾隨斜線）
      const baseUrl = import.meta.env.BASE_URL;
      // 移除 src 開頭的 /，然後加上 baseUrl
      imageSrc = baseUrl + src.substring(1);
    }
    return `<img src="${imageSrc}" alt="${alt}"${titleAttr} class="max-w-full h-auto" />`;
  });
  
  return result;
};

/**
 * 處理表格
 */
const processTable = (lines, startIndex, processInlineMarkdown) => {
  const tableRows = [];
  let i = startIndex;
  let alignments = [];
  
  // 讀取表頭
  const headerLine = lines[i];
  if (!headerLine || !headerLine.trim().startsWith('|')) {
    return { html: '', nextIndex: i };
  }
  
  // 解析表頭（移除首尾的 |）
  const headerParts = headerLine.split('|').map(cell => cell.trim());
  const headerCells = headerParts.slice(1, -1);
  if (headerCells.length === 0) {
    return { html: '', nextIndex: i + 1 };
  }
  tableRows.push(headerCells);
  i++;
  
  // 讀取分隔行（對齊方式）
  const separatorLine = lines[i];
  if (!separatorLine || !separatorLine.trim().startsWith('|')) {
    return { html: '', nextIndex: i };
  }
  
  const separatorParts = separatorLine.split('|').map(cell => cell.trim());
  const separatorCells = separatorParts.slice(1, -1);
  alignments = separatorCells.map(cell => {
    const left = cell.startsWith(':');
    const right = cell.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    return 'left';
  });
  i++;
  
  // 讀取表格行
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // 如果不是表格行，結束表格
    if (!trimmed.startsWith('|')) {
      break;
    }
    
    // 解析表格行（移除首尾的 |）
    const rowParts = trimmed.split('|').map(cell => cell.trim());
    const cells = rowParts.slice(1, -1);
    if (cells.length > 0) {
      tableRows.push(cells);
    }
    i++;
  }
  
  if (tableRows.length < 2) {
    return { html: '', nextIndex: i };
  }
  
  // 生成 HTML 表格
  let html = '<table class="border-collapse border border-gray-300 w-full my-4">';
  
  // 表頭
  html += '<thead><tr>';
  tableRows[0].forEach((cell, idx) => {
    const align = alignments[idx] || 'left';
    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
    html += `<th class="border border-gray-300 px-4 py-2 ${alignClass} font-semibold bg-gray-100">${processInlineMarkdown(cell)}</th>`;
  });
  html += '</tr></thead>';
  
  // 表格內容
  html += '<tbody>';
  for (let rowIdx = 1; rowIdx < tableRows.length; rowIdx++) {
    html += '<tr>';
    tableRows[rowIdx].forEach((cell, idx) => {
      const align = alignments[idx] || 'left';
      const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
      html += `<td class="border border-gray-300 px-4 py-2 ${alignClass}">${processInlineMarkdown(cell)}</td>`;
    });
    html += '</tr>';
  }
  html += '</tbody></table>';
  
  return { html, nextIndex: i };
};

/**
 * 計算縮進級別
 */
const getIndent = (line) => {
  let indent = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === ' ') {
      indent++;
    } else if (line[i] === '\t') {
      indent += 4; // tab 視為 4 個空格
    } else {
      break;
    }
  }
  return indent;
};

/**
 * 處理列表（支持嵌套）
 */
const processList = (lines, startIndex, indentLevel, processInlineMarkdown) => {
  const listItems = [];
  let i = startIndex;
  let listType = null; // 'ul' or 'ol'
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // 如果已經是 HTML 標籤，結束列表
    if (trimmed.startsWith('<')) {
      break;
    }
    
    const currentIndent = getIndent(line);
    
    // 檢查是否是列表項（允許行首有空格）
    const unorderedMatch = line.match(/^(\s*)(\*|-|\+)\s+(.+)$/);
    const orderedMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
    
    // 如果縮進級別不對，或者不是列表項，結束當前列表
    if (currentIndent < indentLevel || (!unorderedMatch && !orderedMatch)) {
      break;
    }
    
    // 如果是嵌套列表
    if (currentIndent > indentLevel) {
      const nestedResult = processList(lines, i, currentIndent, processInlineMarkdown);
      if (listItems.length > 0) {
        const lastItem = listItems[listItems.length - 1];
        listItems[listItems.length - 1] = lastItem.replace('</li>', nestedResult.html + '</li>');
      }
      i = nestedResult.nextIndex;
      continue;
    }
    
    // 確定列表類型
    const isOrdered = !!orderedMatch;
    const content = unorderedMatch ? unorderedMatch[3] : orderedMatch[3];
    
    // 如果列表類型改變，結束當前列表
    if (listType !== null && listType !== (isOrdered ? 'ol' : 'ul')) {
      break;
    }
    
    listType = isOrdered ? 'ol' : 'ul';
    listItems.push(`<li>${processInlineMarkdown(content)}</li>`);
    i++;
  }
  
  if (listItems.length > 0) {
    return {
      html: `<${listType}>${listItems.join('')}</${listType}>`,
      nextIndex: i
    };
  }
  
  return { html: '', nextIndex: i };
};

/**
 * 原生 markdown 轉 HTML 函數
 */
export const markdownToHtml = (md) => {
  if (!md) return '';
  
  const lines = md.split('\n');
  const processedLines = [];
  const lineNumbers = []; // 追蹤每行的原始行號
  let inCodeBlock = false;
  let codeBlockContent = [];
  let codeBlockStartLine = 0;
  
  // 第一遍：處理代碼塊
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        processedLines.push(`<pre><code data-line="${codeBlockStartLine}">${codeBlockContent.join('\n')}</code></pre>`);
        lineNumbers.push(codeBlockStartLine);
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeBlockStartLine = i + 1;
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }
    
    processedLines.push(line);
    lineNumbers.push(i + 1); // 行號從 1 開始
  }
  
  if (inCodeBlock && codeBlockContent.length > 0) {
    processedLines.push(`<pre><code data-line="${codeBlockStartLine}">${codeBlockContent.join('\n')}</code></pre>`);
    lineNumbers.push(codeBlockStartLine);
  }
  
  // 處理標題
  for (let i = 0; i < processedLines.length; i++) {
    let line = processedLines[i];
    if (line.trim().startsWith('#')) {
      const lineNum = lineNumbers[i];
      line = line.replace(/^###### (.*)$/, `<h6 data-line="${lineNum}">$1</h6>`);
      line = line.replace(/^##### (.*)$/, `<h5 data-line="${lineNum}">$1</h5>`);
      line = line.replace(/^#### (.*)$/, `<h4 data-line="${lineNum}">$1</h4>`);
      line = line.replace(/^### (.*)$/, `<h3 data-line="${lineNum}">$1</h3>`);
      line = line.replace(/^## (.*)$/, `<h2 data-line="${lineNum}">$1</h2>`);
      line = line.replace(/^# (.*)$/, `<h1 data-line="${lineNum}">$1</h1>`);
      processedLines[i] = line;
    }
  }
  
  // 處理水平線
  for (let i = 0; i < processedLines.length; i++) {
    const line = processedLines[i].trim();
    if (line === '---' || line === '***') {
      const lineNum = lineNumbers[i];
      processedLines[i] = `<hr data-line="${lineNum}" />`;
    }
  }
  
  // 處理引用
  for (let i = 0; i < processedLines.length; i++) {
    const line = processedLines[i];
    if (line.trim().startsWith('>')) {
      const lineNum = lineNumbers[i];
      const content = line.replace(/^>\s*/, '');
      processedLines[i] = `<blockquote data-line="${lineNum}">${processInlineMarkdown(content)}</blockquote>`;
    }
  }
  
  const finalLines = [];
  let i = 0;
  
  while (i < processedLines.length) {
    const line = processedLines[i];
    const trimmed = line.trim();
    const lineNum = lineNumbers[i] || i + 1;
    
    // 如果已經是 HTML 標籤，直接添加（如果沒有 data-line，則添加）
    if (trimmed.startsWith('<')) {
      if (!trimmed.includes('data-line=')) {
        // 為沒有 data-line 的標籤添加
        const tagMatch = trimmed.match(/^<(\w+)/);
        if (tagMatch) {
          const tagName = tagMatch[1];
          const updatedLine = trimmed.replace(`<${tagName}`, `<${tagName} data-line="${lineNum}"`);
          finalLines.push(updatedLine);
        } else {
          finalLines.push(line);
        }
      } else {
        finalLines.push(line);
      }
      i++;
      continue;
    }
    
    // 檢查是否是表格行
    if (trimmed.startsWith('|')) {
      const tableResult = processTable(processedLines, i, processInlineMarkdown);
      if (tableResult.html) {
        // 為表格添加行號
        const tableWithLine = tableResult.html.replace(/<table/, `<table data-line="${lineNum}"`);
        finalLines.push(tableWithLine);
      }
      i = tableResult.nextIndex;
      continue;
    }
    
    // 檢查是否是列表項（允許行首有空格）
    const unorderedMatch = line.match(/^(\s*)(\*|-|\+)\s+(.+)$/);
    const orderedMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
    
    if (unorderedMatch || orderedMatch) {
      const listResult = processList(processedLines, i, 0, processInlineMarkdown);
      if (listResult.html) {
        // 為列表添加行號
        const listWithLine = listResult.html.replace(/<(ul|ol)/, `<$1 data-line="${lineNum}"`);
        finalLines.push(listWithLine);
      }
      i = listResult.nextIndex;
    } else if (trimmed === '') {
      // 空行
      finalLines.push('');
      i++;
    } else {
      // 檢查是否是圖片行
      const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+?)(?:\s+"([^"]+)")?\)$/);
      if (imageMatch) {
        // 圖片行，不包在段落中
        const titleAttr = imageMatch[3] ? ` title="${imageMatch[3]}"` : '';
        finalLines.push(`<img src="${imageMatch[2]}" alt="${imageMatch[1]}"${titleAttr} class="max-w-full h-auto" data-line="${lineNum}" />`);
      } else {
        // 普通文本，處理為段落
        finalLines.push(`<p data-line="${lineNum}">${processInlineMarkdown(trimmed)}</p>`);
      }
      i++;
    }
  }
  
  // 清理多餘的段落標籤
  let html = finalLines.join('\n');
  html = html.replace(/<p><(h[1-6]|ul|ol|pre|blockquote|hr)/g, '<$1');
  html = html.replace(/(<\/h[1-6]|<\/ul>|<\/ol>|<\/pre>|<\/blockquote>|<\/hr>)<\/p>/g, '$1');
  html = html.replace(/<p><\/p>/g, '');
  
  // 將換行轉換為 <br>（但不在 pre 標籤內）
  html = html.replace(/\n/g, '<br />');
  
  return html;
};

