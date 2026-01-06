#!/usr/bin/env node
/**
 * build.js - Build static index.html from pattern fragments
 *
 * Usage: node build.js
 *
 * This script:
 * 1. Scans patterns/ directory for pattern folders
 * 2. Reads meta.json, card.html, ko.json, en.json from each
 * 3. Sorts patterns by order
 * 4. Generates index.html with all cards embedded
 * 5. Generates locales/ko.json and locales/en.json
 */

const fs = require('fs');
const path = require('path');

const PATTERNS_DIR = path.join(__dirname, 'patterns');
const OUTPUT_HTML = path.join(__dirname, 'index.html');
const LOCALES_DIR = path.join(__dirname, 'locales');

// Get all pattern directories (exclude _template and hidden)
function getPatternDirs() {
  return fs.readdirSync(PATTERNS_DIR)
    .filter(name => {
      if (name.startsWith('_') || name.startsWith('.')) return false;
      const stat = fs.statSync(path.join(PATTERNS_DIR, name));
      return stat.isDirectory();
    });
}

// Load pattern data
function loadPattern(patternId) {
  const dir = path.join(PATTERNS_DIR, patternId);

  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf-8'));
  const cardHtml = fs.readFileSync(path.join(dir, 'card.html'), 'utf-8');
  const ko = JSON.parse(fs.readFileSync(path.join(dir, 'ko.json'), 'utf-8'));
  const en = JSON.parse(fs.readFileSync(path.join(dir, 'en.json'), 'utf-8'));

  return { meta, cardHtml, ko, en };
}

// Category order (same as mkdocs.yaml)
const CATEGORY_ORDER = [
  'Context & Memory',
  'Feedback Loops',
  'Learning & Adaptation',
  'Orchestration & Control',
  'Reliability & Eval',
  'Security & Safety',
  'Tool Use & Environment',
  'UX & Collaboration'
];

// Generate TOC HTML grouped by category
function generateToc(patterns) {
  const grouped = {};
  patterns.forEach(p => {
    const cat = p.meta.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });

  let toc = '';
  // Iterate in defined order
  for (const category of CATEGORY_ORDER) {
    const items = grouped[category];
    if (!items || items.length === 0) continue;
    toc += `    <div class="toc-group">
      <div class="toc-category">${category}</div>
${items.map(p => `      <a href="#${p.meta.id}" class="toc-item">${p.meta.title}</a>`).join('\n')}
    </div>\n`;
  }
  return toc;
}

// Generate HTML template
function generateHtml(cards, toc) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agentic Patterns Snippets</title>
  <link rel="stylesheet" href="styles.css">
  <!-- Mermaid -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <!-- Highlight.js - github theme -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/python.min.js"></script>
  <!-- Fira Code font -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/firacode@6.2.0/distr/fira_code.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap');

    code, pre code, .hljs {
      font-family: 'Fira Code', 'JetBrains Mono', monospace;
      font-feature-settings: "liga" 1;
    }

    @supports (font-variation-settings: normal) {
      code, pre code, .hljs {
        font-family: 'Fira Code VF', 'JetBrains Mono', monospace;
      }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-content">
      <div class="header-left">
        <h1 data-i18n="site.title">Agentic Patterns Snippets</h1>
        <p class="subtitle" data-i18n="site.subtitle">AI 에이전트 설계 패턴 레퍼런스</p>
      </div>
      <div class="lang-switch">
        <button class="lang-btn active" data-lang="en">EN</button>
        <button class="lang-btn" data-lang="ko">KO</button>
      </div>
    </div>
  </header>

  <div class="page-layout">
    <aside class="sidebar">
      <nav class="toc">
${toc}
      </nav>
    </aside>

    <main class="container">
${cards}
    </main>
  </div>

  <footer class="footer">
    <p><span data-i18n="site.source">Source</span>: <a href="https://github.com/nibzard/awesome-agentic-patterns">awesome-agentic-patterns</a></p>
  </footer>

  <script>
    // Mermaid init
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        primaryColor: '#e8f0fe',
        primaryTextColor: '#222',
        primaryBorderColor: '#375EAB',
        lineColor: '#666',
        secondaryColor: '#f8f8f8',
        tertiaryColor: '#fff',
        background: '#fff',
        mainBkg: '#f8f8f8',
        textColor: '#444',
        fontSize: '11px'
      }
    });

    // Highlight.js init
    hljs.highlightAll();

    // Tab switching
    document.querySelectorAll('.tab-switch .tab').forEach(tab => {
      tab.addEventListener('click', function() {
        const box = this.closest('.diagram-box');
        const targetTab = this.dataset.tab;

        box.querySelectorAll('.tab-switch .tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        box.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
          if (content.dataset.content === targetTab) {
            content.classList.add('active');
          }
        });
      });
    });
  </script>
  <script src="i18n.js"></script>
</body>
</html>`;
}

// Main build function
function build() {
  console.log('Building pattern snippets...');

  // Get all patterns
  const patternIds = getPatternDirs();
  console.log(`Found ${patternIds.length} patterns: ${patternIds.join(', ')}`);

  // Load all pattern data
  const patterns = patternIds.map(loadPattern);

  // Sort by order
  patterns.sort((a, b) => a.meta.order - b.meta.order);

  // Combine cards HTML
  const cardsHtml = patterns.map(p => {
    // Prefix data-i18n attributes with pattern ID
    let html = p.cardHtml.replace(
      /data-i18n="(\w+)"/g,
      `data-i18n="${p.meta.id}.$1"`
    );
    // Add id for anchor links
    html = html.replace(
      /data-pattern="([^"]+)"/,
      `data-pattern="$1" id="$1"`
    );
    // Add original link button after pattern header
    const originalUrl = `https://agentic-patterns.com/patterns/${p.meta.id}/`;
    html = html.replace(
      /<\/div>\s*<\/div>\s*<!-- \/pattern-header -->/,
      `</div>
      <a href="${originalUrl}" target="_blank" rel="noopener" class="original-link" data-i18n="site.viewOriginal">View Original</a>
    </div>
    <!-- /pattern-header -->`
    );
    // Fallback: Add link after the closing tag of pattern-header if comment not present
    if (!html.includes('original-link')) {
      html = html.replace(
        /(<div class="pattern-header">[\s\S]*?<\/span>\s*<\/div>)/,
        `$1\n      <a href="${originalUrl}" target="_blank" rel="noopener" class="original-link" data-i18n="site.viewOriginal">View Original</a>`
      );
    }
    // Indent each line for prettier output
    return html.split('\n').map(line => '      ' + line).join('\n');
  }).join('\n\n');

  // Generate TOC
  const tocHtml = generateToc(patterns);

  // Generate index.html
  const html = generateHtml(cardsHtml, tocHtml);
  fs.writeFileSync(OUTPUT_HTML, html);
  console.log(`Generated: ${OUTPUT_HTML}`);

  // Ensure locales directory exists
  if (!fs.existsSync(LOCALES_DIR)) {
    fs.mkdirSync(LOCALES_DIR);
  }

  // Generate combined locale files
  const koLocale = {
    site: {
      title: 'Agentic Patterns Snippets',
      subtitle: 'AI 에이전트 설계 패턴 레퍼런스',
      source: '소스',
      viewOriginal: '원본 보기'
    }
  };
  const enLocale = {
    site: {
      title: 'Agentic Patterns Snippets',
      subtitle: 'AI Agent Design Pattern Reference',
      source: 'Source',
      viewOriginal: 'View Original'
    }
  };

  patterns.forEach(p => {
    koLocale[p.meta.id] = p.ko;
    enLocale[p.meta.id] = p.en;
  });

  fs.writeFileSync(
    path.join(LOCALES_DIR, 'ko.json'),
    JSON.stringify(koLocale, null, 2)
  );
  fs.writeFileSync(
    path.join(LOCALES_DIR, 'en.json'),
    JSON.stringify(enLocale, null, 2)
  );
  console.log(`Generated: locales/ko.json, locales/en.json`);

  console.log('Build complete!');
}

build();
