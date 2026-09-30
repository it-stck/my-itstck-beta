import React, { useState } from 'react';
import { Check, Copy, Info, Lightbulb, AlertTriangle, ShieldAlert } from 'lucide-react';
import { ThemeDefinition, FontPairingDefinition, UserProfile } from '../types';
import { THEMES, FONT_PAIRINGS } from './themes';

interface MarkdownRendererProps {
  content: string;
  theme: ThemeDefinition;
  fontPairing: FontPairingDefinition;
  density?: 'compact' | 'comfortable' | 'spacious';
}

function parseInlineMarkdown(text: string, theme: ThemeDefinition): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={`code-${keyCounter++}`}
          style={{
            backgroundColor: theme.codeBg,
            borderColor: theme.borderSubtle,
            color: theme.accentText,
          }}
          className="px-1.5 py-0.5 text-[0.85em] font-mono border rounded"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong
          key={`bold-${keyCounter++}`}
          style={{ color: theme.textPrimary }}
          className="font-semibold"
        >
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`em-${keyCounter++}`} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        parts.push(
          <a
            key={`link-${keyCounter++}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: theme.accentText }}
            className="underline underline-offset-4 hover:opacity-80 transition-opacity"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        parts.push(token);
      }
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

const CodeBlockWithCopy: React.FC<{
  lang: string;
  code: string;
  theme: ThemeDefinition;
}> = ({ lang, code, theme }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      style={{
        backgroundColor: theme.codeBg,
        borderColor: theme.borderSubtle,
      }}
      className="my-4 rounded-lg border overflow-hidden"
    >
      <div
        style={{
          borderColor: theme.borderSubtle,
          backgroundColor: theme.bgSurface,
          color: theme.textMuted,
        }}
        className="flex items-center justify-between px-3.5 py-2 border-b text-xs font-mono"
      >
        <span>{lang || 'text'}</span>
        <button
          type="button"
          onClick={handleCopy}
          style={{ color: theme.textSecondary }}
          className="inline-flex items-center gap-1.5 hover:opacity-100 opacity-80 transition-opacity cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed">
        <code style={{ color: theme.textPrimary }}>{code}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  theme,
  fontPairing,
  density = 'comfortable',
}) => {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  const spacingClass =
    density === 'compact'
      ? 'space-y-2.5 text-sm'
      : density === 'spacious'
      ? 'space-y-5 text-base'
      : 'space-y-3.5 text-[15px]';

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      elements.push(
        <hr
          key={`hr-${i}`}
          style={{ borderColor: theme.borderSubtle }}
          className="my-6 border-t"
        />
      );
      i++;
      continue;
    }

    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push(
        <CodeBlockWithCopy
          key={`codeblock-${i}`}
          lang={lang}
          code={codeLines.join('\n')}
          theme={theme}
        />
      );
      continue;
    }

    if (line.trim().startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }

      const firstLine = quoteLines[0]?.trim() || '';
      const alertMatch = firstLine.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING)\]/i);

      if (alertMatch) {
        const alertType = alertMatch[1].toUpperCase();
        const bodyLines = quoteLines.slice(1).join(' ');
        const iconMap: Record<string, React.ReactNode> = {
          NOTE: <Info className="w-4 h-4 shrink-0" style={{ color: theme.accentText }} />,
          TIP: <Lightbulb className="w-4 h-4 shrink-0 text-emerald-500" />,
          IMPORTANT: <ShieldAlert className="w-4 h-4 shrink-0" style={{ color: theme.accentText }} />,
          WARNING: <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />,
        };
        const labelMap: Record<string, string> = {
          NOTE: 'Architecture Note',
          TIP: 'Collaboration & Advisory',
          IMPORTANT: 'High Priority Highlight',
          WARNING: 'Operational Constraint',
        };

        elements.push(
          <div
            key={`alert-${i}`}
            style={{
              backgroundColor: theme.bgSurface,
              borderColor: theme.borderSubtle,
              borderLeftColor:
                alertType === 'TIP'
                  ? '#10B981'
                  : alertType === 'WARNING'
                  ? '#F59E0B'
                  : theme.accentPrimary,
            }}
            className="my-4 p-4 rounded-r-lg border border-l-4"
          >
            <div className="flex items-center gap-2 text-xs font-semibold mb-1.5" style={{ color: theme.textPrimary }}>
              {iconMap[alertType]}
              <span>{labelMap[alertType] || alertType}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>
              {parseInlineMarkdown(bodyLines, theme)}
            </p>
          </div>
        );
      } else {
        elements.push(
          <blockquote
            key={`quote-${i}`}
            style={{
              borderColor: theme.accentPrimary,
              color: theme.textSecondary,
            }}
            className="my-4 pl-4 border-l-2 italic text-sm leading-relaxed"
          >
            {parseInlineMarkdown(quoteLines.join(' '), theme)}
          </blockquote>
        );
      }
      continue;
    }

    if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
      const parseRow = (rowStr: string) =>
        rowStr
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((cell) => cell.trim());

      const headers = parseRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        rows.push(parseRow(lines[i]));
        i++;
      }

      elements.push(
        <div
          key={`table-${i}`}
          style={{ borderColor: theme.borderSubtle }}
          className="my-4 overflow-x-auto rounded-lg border"
        >
          <table className="w-full text-left border-collapse text-xs sm:text-sm tabular-nums">
            <thead>
              <tr
                style={{
                  backgroundColor: theme.bgSurface,
                  borderBottomColor: theme.borderSubtle,
                }}
                className="border-b"
              >
                {headers.map((header, idx) => (
                  <th
                    key={idx}
                    style={{ color: theme.textPrimary }}
                    className="py-2.5 px-3.5 font-semibold whitespace-nowrap"
                  >
                    {parseInlineMarkdown(header, theme)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  style={{
                    borderBottomColor: theme.borderSubtle,
                  }}
                  className="border-b last:border-b-0 transition-colors"
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      style={{ color: cIdx === 0 ? theme.textPrimary : theme.textSecondary }}
                      className="py-2.5 px-3.5 align-top leading-relaxed"
                    >
                      {parseInlineMarkdown(cell, theme)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const sizeClasses: Record<number, string> = {
        1: 'text-xl sm:text-2xl font-bold mt-6 mb-2',
        2: 'text-lg sm:text-xl font-semibold mt-5 mb-2',
        3: 'text-base sm:text-lg font-semibold mt-4 mb-1',
        4: 'text-sm font-semibold mt-3 mb-1',
      };
      elements.push(
        <div
          key={`h-${i}`}
          style={{
            color: theme.textPrimary,
            fontFamily: fontPairing.headingFontFamily,
          }}
          className={sizeClasses[level] || sizeClasses[3]}
        >
          {parseInlineMarkdown(text, theme)}
        </div>
      );
      i++;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-2.5 space-y-1.5 pl-5 list-disc">
          {items.map((item, idx) => (
            <li
              key={idx}
              style={{ color: theme.textSecondary }}
              className="leading-relaxed"
            >
              {parseInlineMarkdown(item, theme)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-2.5 space-y-1.5 pl-5 list-decimal tabular-nums">
          {items.map((item, idx) => (
            <li
              key={idx}
              style={{ color: theme.textSecondary }}
              className="leading-relaxed"
            >
              {parseInlineMarkdown(item, theme)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('>') &&
      !lines[i].includes('|') &&
      !/^(-{3,}|\*{3,})$/.test(lines[i].trim()) &&
      !/^\s*([-*]|\d+\.)\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }

    if (paraLines.length > 0) {
      elements.push(
        <p
          key={`p-${i}`}
          style={{ color: theme.textSecondary }}
          className="leading-relaxed max-w-[75ch]"
        >
          {parseInlineMarkdown(paraLines.join(' '), theme)}
        </p>
      );
    } else {
      i++;
    }
  }

  return (
    <div
      style={{ fontFamily: fontPairing.bodyFontFamily }}
      className={spacingClass}
    >
      {elements}
    </div>
  );
};

function convertMarkdownBlockToHtml(md: string, theme: ThemeDefinition): string {
  const escapeHtml = (str: string) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const inlineFormat = (str: string) => {
    return escapeHtml(str)
      .replace(/`([^`]+)`/g, `<code style="background:${theme.codeBg};color:${theme.accentText};padding:2px 6px;border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:0.88em;border:1px solid ${theme.borderSubtle};">$1</code>`)
      .replace(/\*\*([^*]+)\*\*/g, `<strong style="color:${theme.textPrimary};font-weight:600;">$1</strong>`)
      .replace(/\*([^*]+)\*/g, `<em>$1</em>`)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer" style="color:${theme.accentText};text-decoration:underline;">$1</a>`);
  };

  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      out.push(`<hr style="border:0;border-top:1px solid ${theme.borderSubtle};margin:24px 0;" />`);
      i++;
      continue;
    }
    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(escapeHtml(lines[i]));
        i++;
      }
      i++;
      out.push(
        `<pre style="background:${theme.codeBg};border:1px solid ${theme.borderSubtle};padding:16px;border-radius:8px;overflow-x:auto;font-family:'JetBrains Mono',monospace;font-size:13px;color:${theme.textPrimary};margin:16px 0;"><code>${codeLines.join('\n')}</code></pre>`
      );
      continue;
    }
    if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
      const parseRow = (r: string) =>
        r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const headers = parseRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        rows.push(parseRow(lines[i]));
        i++;
      }
      const thHtml = headers
        .map(
          (h) =>
            `<th style="padding:10px 14px;text-align:left;background:${theme.bgSurface};color:${theme.textPrimary};border-bottom:1px solid ${theme.borderSubtle};font-weight:600;">${inlineFormat(h)}</th>`
        )
        .join('');
      const trHtml = rows
        .map(
          (r) =>
            `<tr>${r
              .map(
                (c, idx) =>
                  `<td style="padding:10px 14px;border-bottom:1px solid ${theme.borderSubtle};color:${
                    idx === 0 ? theme.textPrimary : theme.textSecondary
                  };">${inlineFormat(c)}</td>`
              )
              .join('')}</tr>`
        )
        .join('');
      out.push(
        `<div style="overflow-x:auto;margin:16px 0;border:1px solid ${theme.borderSubtle};border-radius:8px;"><table style="width:100%;border-collapse:collapse;font-size:14px;font-variant-numeric:tabular-nums;"><thead><tr>${thHtml}</tr></thead><tbody>${trHtml}</tbody></table></div>`
      );
      continue;
    }
    const hMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (hMatch) {
      const lvl = hMatch[1].length;
      const sizes: Record<number, string> = {
        1: '22px',
        2: '19px',
        3: '16px',
        4: '14px',
      };
      out.push(
        `<h${lvl} style="color:${theme.textPrimary};font-size:${sizes[lvl]};font-weight:600;margin:20px 0 8px;">${inlineFormat(
          hMatch[2]
        )}</h${lvl}>`
      );
      i++;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(`<li style="margin-bottom:6px;color:${theme.textSecondary};">${inlineFormat(lines[i].replace(/^\s*[-*]\s+/, ''))}</li>`);
        i++;
      }
      out.push(`<ul style="padding-left:20px;margin:12px 0;">${items.join('')}</ul>`);
      continue;
    }
    if (line.trim().startsWith('>')) {
      const qLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        qLines.push(lines[i].replace(/^\s*>\s?/, '').replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING)\]\s*/i, ''));
        i++;
      }
      out.push(
        `<blockquote style="margin:16px 0;padding:12px 16px;background:${theme.bgSurface};border-left:4px solid ${theme.accentPrimary};border-radius:0 8px 8px 0;color:${theme.textSecondary};">${inlineFormat(
          qLines.join(' ')
        )}</blockquote>`
      );
      continue;
    }
    out.push(`<p style="margin:10px 0;color:${theme.textSecondary};line-height:1.65;">${inlineFormat(line)}</p>`);
    i++;
  }
  return out.join('\n');
}

export function compileProfileToStaticHtml(profile: UserProfile): string {
  const theme = THEMES[profile.themeId] || THEMES['obsidian-slate'];
  const font = FONT_PAIRINGS[profile.fontPairingId] || FONT_PAIRINGS['jakarta-jetbrains'];
  const visibleSections = [...profile.sections]
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  const sectionsHtml = visibleSections
    .map(
      (section, idx) => `
      <section id="section-${section.id}" style="padding:28px 0;border-bottom:1px solid ${theme.borderSubtle};">
        <div style="font-family:${font.monoFontFamily};font-size:12px;color:${theme.textMuted};margin-bottom:6px;">
          0${idx + 1}. ${section.type.toUpperCase().replace('_', ' ')}
        </div>
        <h2 style="font-family:${font.headingFontFamily};font-size:22px;font-weight:700;color:${theme.textPrimary};margin:0 0 4px 0;">
          ${section.title}
        </h2>
        ${
          section.subtitle
            ? `<p style="font-size:13px;color:${theme.textMuted};margin:0 0 18px 0;">${section.subtitle}</p>`
            : ''
        }
        <div>
          ${convertMarkdownBlockToHtml(section.content, theme)}
        </div>
      </section>`
    )
    .join('\n');

  const stackText = profile.primaryStack.join(' · ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${profile.displayName} (@${profile.username}) — ItStack Portfolio</title>
  <meta name="description" content="${profile.headline} — ${profile.bio}" />
  <meta property="og:title" content="${profile.displayName} (@${profile.username}) · ItStack" />
  <meta property="og:description" content="${profile.headline}" />
  <meta property="og:url" content="https://my.itstck.com/@${profile.username}" />
  <link rel="canonical" href="https://my.itstck.com/@${profile.username}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap" rel="stylesheet" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "${profile.displayName}",
    "alternateName": "@${profile.username}",
    "jobTitle": "${profile.headline}",
    "worksFor": { "@type": "Organization", "name": "${profile.company}" },
    "url": "https://my.itstck.com/@${profile.username}"
  }
  </script>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background-color: ${theme.bgCanvas};
      color: ${theme.textPrimary};
      font-family: ${font.bodyFontFamily};
      -webkit-font-smoothing: antialiased;
      line-height: 1.6;
    }
    .container {
      max-width: 1040px;
      margin: 0 auto;
      padding: 48px 24px 80px;
    }
    ${profile.customCss || ''}
  </style>
</head>
<body>
  <div class="container">
    <header style="padding-bottom:32px;border-bottom:1px solid ${theme.borderSubtle};">
      <div style="font-family:${font.monoFontFamily};font-size:12px;color:${theme.accentText};margin-bottom:8px;">
        my.itstck.com/@${profile.username} · Alias: /u/${profile.username} · Build #${profile.staticBuildHash}
      </div>
      <h1 style="font-family:${font.headingFontFamily};font-size:36px;font-weight:700;margin:0 0 8px 0;color:${theme.textPrimary};">
        ${profile.displayName}
      </h1>
      <p style="font-size:18px;color:${theme.textSecondary};margin:0 0 12px 0;font-weight:500;">
        ${profile.headline}
      </p>
      <p style="font-size:14px;color:${theme.textMuted};margin:0 0 16px 0;max-width:72ch;">
        ${profile.bio}
      </p>
      <div style="font-size:13px;color:${theme.textMuted};font-family:${font.monoFontFamily};">
        ${profile.location} · ${profile.company} · ${profile.europassMeta.yearsOfExperience} yrs exp · ${profile.europassMeta.europassPassportId}
      </div>
      <div style="margin-top:12px;font-size:13px;color:${theme.accentText};font-family:${font.monoFontFamily};">
        Core Stack: ${stackText}
      </div>
    </header>
    <main>
      ${sectionsHtml}
    </main>
    <footer style="margin-top:48px;padding-top:24px;border-top:1px solid ${theme.borderSubtle};display:flex;justify-content:space-between;font-size:12px;color:${theme.textMuted};font-family:${font.monoFontFamily};">
      <span>Generated with ItStack Static Site Engine (my.itstck.com/@${profile.username})</span>
      <span>Europass &amp; GitHub GFM Compatible</span>
    </footer>
  </div>
</body>
</html>`;
}

export function compileProfileToReadmeMarkdown(profile: UserProfile): string {
  const visibleSections = [...profile.sections]
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  const header = `# ${profile.displayName} (@${profile.username})
### ${profile.headline}

> ${profile.bio}

- **Official Static Landing Page:** [my.itstck.com/@${profile.username}](https://my.itstck.com/@${profile.username}) (Alias: \`my.itstck.com/u/${profile.username}\`)
- **Location & Organization:** ${profile.location} · ${profile.company} (${profile.timezone})
- **Europass Passport ID:** \`${profile.europassMeta.europassPassportId}\` · **Experience:** ${profile.europassMeta.yearsOfExperience} years
- **Core IT Stack:** ${profile.primaryStack.join(' · ')}

---
`;

  const body = visibleSections
    .map(
      (sec) => `## ${sec.title}
${sec.subtitle ? `*${sec.subtitle}*\n` : ''}
${sec.content}
`
    )
    .join('\n---\n\n');

  return `${header}\n${body}\n---\n*Auto-generated via [my.itstck.com/@${profile.username}](https://my.itstck.com/@${profile.username})*`;
}
