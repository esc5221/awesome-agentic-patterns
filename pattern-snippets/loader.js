// loader.js - Dynamic pattern loader for development
(function() {
  const PATTERNS_DIR = 'patterns';

  // 언어: URL param > localStorage > 기본값 'en'
  function getInitialLang() {
    const params = new URLSearchParams(window.location.search);
    const paramLang = params.get('lang');
    if (paramLang === 'en' || paramLang === 'ko') return paramLang;
    return localStorage.getItem('lang') || 'en';
  }

  let currentLang = getInitialLang();
  let patternsData = [];

  // Fetch JSON with error handling
  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    return res.json();
  }

  // Fetch text with error handling
  async function fetchText(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    return res.text();
  }

  // Get list of pattern folders (excludes _template)
  async function getPatternList() {
    const patterns = [
      'abstracted-code-representation-for-review',
      'action-selector-pattern',
      'agent-assisted-scaffolding',
      'agent-driven-research',
      'agent-first-tooling-and-logging',
      'agent-friendly-workflow-design',
      'agent-reinforcement-fine-tuning',
      'agent-sdk-for-programmatic-control',
      'agentic-search-over-vector-embeddings',
      'anti-reward-hacking-grader-design',
      'asynchronous-coding-agent-pipeline',
      'autonomous-workflow-agent-architecture',
      'background-agent-ci',
      'chain-of-thought-monitoring-interruption',
      'cli-native-agent-orchestration',
      'code-first-tool-interface-pattern',
      'code-over-api-pattern',
      'code-then-execute-pattern',
      'coding-agent-ci-feedback-loop',
      'compounding-engineering-pattern',
      'context-minimization-pattern',
      'context-window-anxiety-management',
      'continuous-autonomous-task-loop-pattern',
      'criticgpt-style-evaluation',
      'curated-code-context-window',
      'curated-file-context-window',
      'deterministic-security-scanning-build-loop',
      'discrete-phase-separation',
      'disposable-scaffolding-over-durable-features',
      'distributed-execution-cloud-workers',
      'dogfooding-with-rapid-iteration-for-agent-improvement',
      'dual-llm-pattern',
      'dual-use-tool-design',
      'dynamic-code-injection-on-demand-file-fetch',
      'dynamic-context-injection',
      'egress-lockdown-no-exfiltration-channel',
      'episodic-memory-retrieval-injection',
      'explicit-posterior-sampling-planner',
      'extended-coherence-work-sessions',
      'feature-list-as-immutable-contract',
      'filesystem-based-agent-state',
      'graph-of-thoughts',
      'human-in-loop',
      'human-in-loop-approval-framework',
      'inference-healed-code-review-reward',
      'inference-time-scaling',
      'initializer-maintainer-dual-agent',
      'inversion-of-control',
      'isolated-vm-per-rl-rollout',
      'iterative-multi-agent-brainstorming',
      'language-agent-tree-search-lats',
      'latent-demand-product-discovery',
      'layered-configuration-context',
      'lethal-trifecta-threat-model',
      'llm-friendly-api-design',
      'llm-map-reduce-pattern',
      'memory-synthesis-from-execution-logs',
      'merged-code-language-skill-model',
      'multi-model-orchestration-for-complex-edits',
      'no-token-limit-magic',
      'opponent-processor-multi-agent-debate',
      'oracle-and-worker-multi-model',
      'parallel-tool-call-learning',
      'parallel-tool-execution',
      'patch-steering-via-prompted-tool-selection',
      'pii-tokenization',
      'plan-then-execute-pattern',
      'proactive-agent-state-externalization',
      'progressive-autonomy-with-model-evolution',
      'progressive-complexity-escalation',
      'progressive-tool-discovery',
      'reflection-loop',
      'rich-feedback-loops',
      'rlaif-reinforcement-learning-from-ai-feedback',
      'seamless-background-to-foreground-handoff',
      'self-critique-evaluator-loop',
      'self-discover-reasoning-structures',
      'self-rewriting-meta-prompt-loop',
      'shell-command-contextualization',
      'skill-library-evolution',
      'spec-as-test-feedback-loop',
      'specification-driven-agent-development',
      'spectrum-of-control-blended-initiative',
      'stop-hook-auto-continue-pattern',
      'structured-output-specification',
      'sub-agent-spawning',
      'subagent-compilation-checker',
      'swarm-migration-pattern',
      'team-shared-agent-configuration',
      'three-stage-perception-architecture',
      'tool-capability-compartmentalization',
      'tool-use-incentivization-via-reward-shaping',
      'tool-use-steering-via-prompting',
      'tree-of-thought-reasoning',
      'variance-based-rl-sample-selection',
      'verbose-reasoning-transparency',
      'versioned-constitution-governance',
      'virtual-machine-operator-agent',
      'visual-ai-multimodal-integration'
    ];
    return patterns;
  }

  // Load a single pattern
  async function loadPattern(patternId) {
    const basePath = `${PATTERNS_DIR}/${patternId}`;

    const [meta, cardHtml, locale] = await Promise.all([
      fetchJSON(`${basePath}/meta.json`),
      fetchText(`${basePath}/card.html`),
      fetchJSON(`${basePath}/${currentLang}.json`)
    ]);

    return { meta, cardHtml, locale };
  }

  // Apply locale to a card element
  function applyLocale(cardEl, locale) {
    cardEl.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const value = locale[key];

      if (value === undefined) return;

      if (Array.isArray(value)) {
        el.innerHTML = value.map(item => `<li>${item}</li>`).join('');
      } else {
        el.textContent = value;
      }
    });
  }

  // Initialize tab switching for a card
  function initTabs(cardEl) {
    cardEl.querySelectorAll('.tab-switch .tab').forEach(tab => {
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

  // Generate TOC grouped by category
  function generateToc(patterns) {
    const grouped = {};
    patterns.forEach(p => {
      const cat = p.meta.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(p);
    });

    let html = '';
    for (const category of CATEGORY_ORDER) {
      const items = grouped[category];
      if (!items || items.length === 0) continue;
      html += `<div class="toc-group">
        <div class="toc-category">${category}</div>
        ${items.map(p => `<a href="#${p.meta.id}" class="toc-item">${p.meta.title}</a>`).join('\n')}
      </div>`;
    }
    return html;
  }

  // Render all patterns
  async function renderPatterns() {
    const container = document.getElementById('patterns-container');
    const tocContainer = document.getElementById('toc-container');

    container.innerHTML = '';

    try {
      const patternIds = await getPatternList();

      // Load all patterns in parallel
      const loadPromises = patternIds.map(id => loadPattern(id));
      patternsData = await Promise.all(loadPromises);

      // Sort by order
      patternsData.sort((a, b) => a.meta.order - b.meta.order);

      // Generate and render TOC
      if (tocContainer) {
        tocContainer.innerHTML = generateToc(patternsData);
      }

      // Clear and render patterns
      container.innerHTML = '';

      for (const pattern of patternsData) {
        // Create temporary container to parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = pattern.cardHtml;
        const cardEl = temp.firstElementChild;

        // Add id for anchor links
        cardEl.id = pattern.meta.id;

        // Apply locale
        applyLocale(cardEl, pattern.locale);

        // Init tabs
        initTabs(cardEl);

        container.appendChild(cardEl);
      }

      // Re-init Mermaid for new elements
      if (window.mermaid) {
        mermaid.run({
          nodes: container.querySelectorAll('.mermaid')
        });
      }

      // Re-init highlight.js
      if (window.hljs) {
        container.querySelectorAll('pre code').forEach(block => {
          hljs.highlightElement(block);
        });
      }

    } catch (err) {
      container.innerHTML = `<p class="error">Error loading patterns: ${err.message}</p>`;
      console.error(err);
    }
  }

  // Switch language
  async function switchLang(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // Update button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Reload patterns with new language
    await renderPatterns();
  }

  // Initialize
  function init() {
    // Set up language toggle
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => switchLang(btn.dataset.lang));
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });

    // Load patterns
    renderPatterns();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
