# Markdown 轉 HTML 工具

一個功能完整的 Markdown 編輯器，支援即時預覽和原生 Markdown 轉 HTML 轉換。

## 功能特色

- ✨ **即時預覽**：左側編輯，右側即時顯示 HTML 預覽
- 📝 **行號顯示**：編輯器左側顯示行號，方便定位
- 🎯 **游標追蹤**：顯示當前游標位置（行數和列數）
- 🔄 **滾動同步**：編輯器和預覽區滾動同步
- 📋 **一鍵複製**：快速複製 Markdown 內容
- 📏 **可調整大小**：左右兩個區塊可以拖動調整寬度
- 📚 **語法指南**：內建 Markdown 語法指南，可展開查看
- 🎨 **原生實現**：使用原生 JavaScript 實現 Markdown 轉換，無需額外套件

## 支援的 Markdown 語法

- 標題（H1-H6）
- 文字格式（粗體、斜體、刪除線）
- 無序和有序列表（支援嵌套）
- 連結和圖片
- 行內代碼和代碼塊
- 引用
- 表格（支援對齊）
- 水平線

## 技術棧

- React 19
- Vite
- Tailwind CSS 4
- 原生 JavaScript（無 Markdown 解析套件）

## 安裝與運行

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 建置
npm run build

# 預覽建置結果
npm run preview
```

## 專案結構

```
src/
├── components/
│   ├── MarkdownEditor.jsx    # Markdown 編輯器元件
│   ├── HtmlViewer.jsx        # HTML 預覽元件
│   ├── MarkdownSyntaxGuide.jsx  # 語法指南元件
│   └── Toast.jsx             # Toast 提示元件
├── utils/
│   └── markdownParser.js     # Markdown 轉 HTML 解析器
├── config/
│   └── markDownSyntax.ts     # Markdown 範例內容
└── App.jsx                   # 主應用程式
```

## 使用說明

1. 在左側編輯器中輸入 Markdown 內容
2. 右側會即時顯示轉換後的 HTML 預覽
3. 點擊複製按鈕可複製 Markdown 內容
4. 拖動中間的分隔線可調整左右區塊寬度
5. 點擊「Markdown 語法指南」查看常用語法

## License

MIT
