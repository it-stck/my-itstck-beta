"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import type { Section } from "@prisma/client";
import { Input } from "@/components/ui/index";
import { Eye, EyeOff } from "lucide-react";

// Dynamically import to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-muted/30 animate-pulse rounded-lg" />
  ),
});

interface MarkdownEditorProps {
  section: Section;
  onChange: (updated: Section) => void;
}

export function MarkdownEditor({ section, onChange }: MarkdownEditorProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const handleContentChange = useCallback(
    (value: string | undefined) => {
      onChange({ ...section, content: value ?? "" });
    },
    [section, onChange]
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...section, title: e.target.value });
    },
    [section, onChange]
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden" data-color-mode="auto">
      {/* Section title bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/20">
        {isEditingTitle ? (
          <Input
            ref={titleRef}
            value={section.title ?? ""}
            onChange={handleTitleChange}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") setIsEditingTitle(false);
            }}
            className="h-7 text-sm font-medium border-brand-500/50"
            autoFocus
          />
        ) : (
          <button
            className="flex-1 text-left text-sm font-medium hover:text-brand-500 transition-colors"
            onClick={() => setIsEditingTitle(true)}
          >
            {section.title || "Untitled section"}
            <span className="ml-2 text-xs text-muted-foreground font-normal">(click to rename)</span>
          </button>
        )}

        <button
          onClick={() => onChange({ ...section, isVisible: !section.isVisible })}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title={section.isVisible ? "Hide from profile" : "Show on profile"}
        >
          {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>

      {/* Markdown editor */}
      <div className="flex-1 overflow-hidden">
        <MDEditor
          value={section.content ?? ""}
          onChange={handleContentChange}
          height="100%"
          preview="edit"
          hideToolbar={false}
          visibleDragbar={false}
          style={{
            height: "100%",
            borderRadius: 0,
            border: "none",
          }}
          textareaProps={{
            placeholder: "Write your content in Markdown...\n\n# Heading\n\n- List item\n\n**Bold** and *italic*",
          }}
        />
      </div>

      {/* Character count */}
      <div className="px-3 py-1.5 border-t border-border bg-muted/20 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {(section.content ?? "").length} characters · {(section.content ?? "").split(/\s+/).filter(Boolean).length} words
        </span>
        <span className="text-xs text-muted-foreground">Markdown</span>
      </div>
    </div>
  );
}
