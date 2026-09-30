"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Section } from "@prisma/client";
import { SECTION_TYPE_META } from "@/lib/themes";

interface ProfileSectionProps {
  section: Section;
  accentColor: string;
}

export function ProfileSection({ section, accentColor }: ProfileSectionProps) {
  if (!section.isVisible) return null;

  const meta = SECTION_TYPE_META[section.type as keyof typeof SECTION_TYPE_META];

  return (
    <section
      className="profile-section py-6 border-b"
      style={{ borderColor: "var(--profile-section-separator)" }}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        {meta?.icon && (
          <span className="text-xl">{meta.icon}</span>
        )}
        <h2
          className="text-lg font-bold uppercase tracking-widest text-sm"
          style={{ color: accentColor }}
        >
          {section.title}
        </h2>
        <div
          className="flex-1 h-px"
          style={{ backgroundColor: accentColor, opacity: 0.3 }}
        />
      </div>

      {/* Markdown content */}
      <div className="profile-markdown">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Style heading levels
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--profile-text)" }}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold mb-2 mt-4" style={{ color: "var(--profile-text)" }}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base font-semibold mb-1 mt-3" style={{ color: "var(--profile-text)" }}>
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-3 leading-relaxed" style={{ color: "var(--profile-text)" }}>
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-3 space-y-1" style={{ color: "var(--profile-text)" }}>
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-3 space-y-1" style={{ color: "var(--profile-text)" }}>
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed" style={{ color: "var(--profile-text)" }}>
                {children}
              </li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold" style={{ color: "var(--profile-text)" }}>
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em style={{ color: "var(--profile-text-muted)" }}>{children}</em>
            ),
            code: ({ children, className }) => {
              const isBlock = className?.includes("language-");
              if (isBlock) {
                return (
                  <code
                    className={`block p-4 rounded-lg text-sm font-mono overflow-x-auto mb-3 ${className}`}
                    style={{
                      backgroundColor: "var(--profile-code-bg)",
                      color: "var(--profile-text)",
                      border: "1px solid var(--profile-border)",
                    }}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <code
                  className="text-sm font-mono px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: "var(--profile-code-bg)",
                    color: accentColor,
                    border: "1px solid var(--profile-border)",
                  }}
                >
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre
                className="rounded-lg overflow-x-auto mb-3"
                style={{
                  backgroundColor: "var(--profile-code-bg)",
                  border: "1px solid var(--profile-border)",
                }}
              >
                {children}
              </pre>
            ),
            blockquote: ({ children }) => (
              <blockquote
                className="border-l-4 pl-4 my-3 italic"
                style={{
                  borderColor: accentColor,
                  color: "var(--profile-text-muted)",
                  backgroundColor: "var(--profile-surface)",
                  padding: "0.75rem 1rem",
                  borderRadius: "0 0.5rem 0.5rem 0",
                }}
              >
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                style={{ color: accentColor }}
              >
                {children}
              </a>
            ),
            hr: () => (
              <hr
                className="my-4"
                style={{ borderColor: "var(--profile-section-separator)" }}
              />
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto mb-3">
                <table
                  className="w-full text-sm border-collapse"
                  style={{ color: "var(--profile-text)" }}
                >
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th
                className="border px-3 py-2 text-left font-semibold"
                style={{
                  borderColor: "var(--profile-border)",
                  backgroundColor: "var(--profile-surface)",
                }}
              >
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td
                className="border px-3 py-2"
                style={{ borderColor: "var(--profile-border)" }}
              >
                {children}
              </td>
            ),
          }}
        >
          {section.content ?? ""}
        </ReactMarkdown>
      </div>
    </section>
  );
}
