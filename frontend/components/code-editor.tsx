"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function CodeEditor({
  value,
  onChange,
  className,
  placeholder,
}: CodeEditorProps) {
  const [lines, setLines] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const lineCount = value.split("\n").length;
    setLines(Array.from({ length: lineCount }, (_, i) => String(i + 1)));
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd, value } = textarea;

    if (e.key === "Tab") {
      e.preventDefault();
      const newValue =
        value.substring(0, selectionStart) +
        "  " +
        value.substring(selectionEnd);
      onChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 2;
      }, 0);
    }

    if (e.key === "Enter") {
      e.preventDefault();

      const currentLineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const currentLine = value.substring(currentLineStart, selectionStart);

      const indentMatch = currentLine.match(/^(\s*)/);
      const indentation = indentMatch ? indentMatch[1] : "";

      const extraIndent = currentLine.trimEnd().endsWith("{") ? "  " : "";

      const newValue =
        value.substring(0, selectionStart) +
        "\n" +
        indentation +
        extraIndent +
        value.substring(selectionEnd);

      onChange(newValue);

      const newCursorPos =
        selectionStart + 1 + indentation.length + extraIndent.length;
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      }, 0);
    }
  };

  const highlightedCode = () => {
    if (!value) return "";

    let code = value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return code;
  };

  return (
    <div
      className={cn(
        "relative font-mono text-sm border rounded-md overflow-hidden",
        className
      )}
    >
      <div className="absolute top-0 left-0 bottom-0 w-10 bg-slate-100 text-slate-500 text-right select-none pt-2 pb-2 px-2 overflow-hidden">
        {lines.map((line, i) => (
          <div key={i} className="leading-6">
            {line}
          </div>
        ))}
      </div>

      <div
        className="absolute top-0 left-10 right-0 bottom-0 overflow-hidden pointer-events-none pt-2 pb-2 pl-2"
        dangerouslySetInnerHTML={{ __html: highlightedCode() }}
        style={{
          whiteSpace: "pre",
          overflowWrap: "normal",
          overflowX: "hidden",
          overflowY: "hidden",
          lineHeight: "1.5rem",
        }}
      />

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full h-full min-h-[800px] pt-2 pb-2 pl-12 pr-2 bg-transparent text-transparent caret-slate-900 resize-none"
        placeholder={placeholder}
        spellCheck={false}
        style={{
          whiteSpace: "pre",
          overflowWrap: "normal",
          lineHeight: "1.5rem",
        }}
      />
    </div>
  );
}
