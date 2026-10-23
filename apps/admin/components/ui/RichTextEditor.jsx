"use client";

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Table as TableIcon,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  Code2,
  Eye,
} from "lucide-react";

/**
 * RichTextEditor - Fully self-contained, offline rich text WYSIWYG editor.
 * Supports bold, italic, headings, lists, quotes, links, tables, undo/redo, and HTML source mode.
 */
const RichTextEditor = forwardRef(
  (
    {
      value = "",
      content = "",
      onChange = () => {},
      placeholder = "Write content here...",
      className = "",
      minHeight = "min-h-[200px]",
    },
    ref
  ) => {
    const initialContent = value || content || "";
    const editorRef = useRef(null);
    const [html, setHtml] = useState(initialContent);
    const [isSourceMode, setIsSourceMode] = useState(false);
    const [wordCount, setWordCount] = useState(0);

    // Keep internal state in sync when parent switches content (e.g. selecting different page or tab)
    useEffect(() => {
      const incoming = value !== undefined ? value : content;
      if (incoming !== undefined && incoming !== html) {
        setHtml(incoming || "");
        if (editorRef.current && !isSourceMode) {
          editorRef.current.innerHTML = incoming || "";
        }
      }
    }, [value, content]);

    // Update word count
    useEffect(() => {
      const text = (html || "").replace(/<[^>]*>/g, " ").trim();
      const count = text ? text.split(/\s+/).filter(Boolean).length : 0;
      setWordCount(count);
    }, [html]);

    // Expose imperative API via ref
    useImperativeHandle(ref, () => ({
      getContent: () => {
        if (isSourceMode) return html;
        return editorRef.current ? editorRef.current.innerHTML : html;
      },
      setContent: (newContent) => {
        const val = newContent || "";
        setHtml(val);
        if (editorRef.current && !isSourceMode) {
          editorRef.current.innerHTML = val;
        }
        onChange(val);
      },
    }));

    const emitChange = useCallback(
      (newVal) => {
        setHtml(newVal);
        onChange(newVal);
      },
      [onChange]
    );

    const handleInput = () => {
      if (!editorRef.current) return;
      const currentHtml = editorRef.current.innerHTML;
      emitChange(currentHtml);
    };

    const execCmd = (command, cmdValue = null) => {
      if (isSourceMode) return;
      if (editorRef.current) {
        editorRef.current.focus();
      }
      try {
        document.execCommand(command, false, cmdValue);
        handleInput();
      } catch (e) {
        console.error("execCommand error:", e);
      }
    };

    const handleAddLink = () => {
      if (isSourceMode) return;
      const url = window.prompt("Enter link URL:", "https://");
      if (url) {
        execCmd("createLink", url);
      }
    };

    const handleInsertTable = () => {
      if (isSourceMode) return;
      const tableHtml = `
        <table style="width:100%; border-collapse:collapse; margin:14px 0; border:1px solid #cbd5e1;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="border:1px solid #cbd5e1; padding:8px 12px; text-align:left;">Section</th>
              <th style="border:1px solid #cbd5e1; padding:8px 12px; text-align:left;">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border:1px solid #cbd5e1; padding:8px 12px;">Item 1</td>
              <td style="border:1px solid #cbd5e1; padding:8px 12px;">Description 1</td>
            </tr>
            <tr>
              <td style="border:1px solid #cbd5e1; padding:8px 12px;">Item 2</td>
              <td style="border:1px solid #cbd5e1; padding:8px 12px;">Description 2</td>
            </tr>
          </tbody>
        </table>
        <p><br></p>
      `;
      execCmd("insertHTML", tableHtml);
    };

    const toggleSourceMode = () => {
      if (isSourceMode) {
        setIsSourceMode(false);
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.innerHTML = html;
          }
        }, 10);
      } else {
        if (editorRef.current) {
          setHtml(editorRef.current.innerHTML);
        }
        setIsSourceMode(true);
      }
    };

    return (
      <div
        className={`rounded-xl border border-border bg-card shadow-xs overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary ${className}`}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-1 p-2 bg-muted/30 border-b border-border">
          <div className="flex items-center flex-wrap gap-1">
            <button
              type="button"
              onClick={() => execCmd("bold")}
              disabled={isSourceMode}
              className="p-1.5 rounded-lg text-foreground hover:bg-background/90 hover:text-primary transition-colors disabled:opacity-40"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => execCmd("italic")}
              disabled={isSourceMode}
              className="p-1.5 rounded-lg text-foreground hover:bg-background/90 hover:text-primary transition-colors disabled:opacity-40"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => execCmd("underline")}
              disabled={isSourceMode}
              className="p-1.5 rounded-lg text-foreground hover:bg-background/90 hover:text-primary transition-colors disabled:opacity-40"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => execCmd("strikeThrough")}
              disabled={isSourceMode}
              className="p-1.5 rounded-lg text-foreground hover:bg-background/90 hover:text-primary transition-colors disabled:opacity-40"
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-4 bg-border mx-1" />

            <button
              type="button"
              onClick={() => execCmd("formatBlock", "<h2>")}
              disabled={isSourceMode}
              className="p-1.5 rounded-lg text-foreground hover:bg-background/90 hover:text-primary transition-colors disabled:opacity-40"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => execCmd("formatBlock", "<h3>")}
              disabled={isSourceMode}
              className="p-1.5 rounded-lg text-foreground hover:bg-background/90 hover:text-primary transition-colors disabled:opacity-40"
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-4 bg-border mx-1" />

            <button
              type="button"
              onClick={() => execCmd("insertUnorderedList")}
              disabled={isSourceMode}
              className="p-1.5 rounded-lg text-foreground hover:bg-background/90 hover:text-primary transition-colors disabled:opacity-40"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => execCmd("insertOrderedList")}
              disabled={isSourceMode}
              className="p-1.5 rounded-lg text-foreground hover:bg-background/90 hover:text-primary transition-colors disabled:opacity-40"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => execCmd("formatBlock", "<blockquote>")}
              disabled={isSourceMode}
              className="p-1.5 rounded-lg text-foreground hover:bg-background/90 hover:text-primary transition-colors disabled:opacity-40"
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleAddLink}
              disabled={isSourceMode}
              className="p-1.5 rounded-lg text-foreground hover:bg-background/90 hover:text-primary transition-colors disabled:opacity-40"
              title="Insert Link"
            >
              <Link2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleInsertTable}
              disabled={isSourceMode}
              className="p-1.5 rounded-lg text-foreground hover:bg-background/90 hover:text-primary transition-colors disabled:opacity-40"
              title="Insert Table"
            >
              <TableIcon className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => execCmd("removeFormat")}
              disabled={isSourceMode}
              className="p-1.5 rounded-lg text-foreground hover:bg-background/90 hover:text-destructive transition-colors disabled:opacity-40"
              title="Clear Formatting"
            >
              <RemoveFormatting className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-4 bg-border mx-1" />

            <button
              type="button"
              onClick={() => execCmd("undo")}
              disabled={isSourceMode}
              className="p-1.5 rounded-lg text-foreground hover:bg-background/90 hover:text-primary transition-colors disabled:opacity-40"
              title="Undo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => execCmd("redo")}
              disabled={isSourceMode}
              className="p-1.5 rounded-lg text-foreground hover:bg-background/90 hover:text-primary transition-colors disabled:opacity-40"
              title="Redo"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* HTML Source Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSourceMode}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                isSourceMode
                  ? "bg-primary text-white border-primary"
                  : "bg-background text-muted-foreground hover:text-foreground border-border hover:bg-muted"
              }`}
            >
              {isSourceMode ? (
                <>
                  <Eye className="w-3.5 h-3.5" /> Visual View
                </>
              ) : (
                <>
                  <Code2 className="w-3.5 h-3.5" /> HTML Source
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-3 relative">
          {isSourceMode ? (
            <textarea
              value={html}
              onChange={(e) => emitChange(e.target.value)}
              placeholder="Paste or write raw HTML markup..."
              rows={8}
              className={`w-full ${minHeight} p-3 text-xs font-mono bg-muted/20 text-foreground border-none rounded-lg focus:outline-none resize-y`}
            />
          ) : (
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onBlur={handleInput}
              dangerouslySetInnerHTML={{ __html: html }}
              data-placeholder={placeholder}
              className={`${minHeight} max-h-[460px] overflow-y-auto p-3 text-sm leading-relaxed text-foreground focus:outline-none prose dark:prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:pointer-events-none`}
            />
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-3 py-1.5 bg-muted/20 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{isSourceMode ? "HTML Source Editing Mode" : "Rich Text Visual Mode"}</span>
          <span>{wordCount} words</span>
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";
export default RichTextEditor;
