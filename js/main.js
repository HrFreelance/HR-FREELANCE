/**
 * main.js — Janardhan Bathula HR Portfolio v2
 * ─────────────────────────────────────────────
 * 1. Markdown parser (headings, lists, blockquotes, code, inline styles)
 * 2. Blog registry & async loader (index + single-post)
 * 3. Intersection Observer (reveal animations + skill bars)
 * 4. Counter animations (hero metrics)
 * 5. Navigation (scroll class, mobile menu, active links)
 * 6. Portfolio filter
 * 7. Contact form (validation + Formspree submission)
 * 8. Misc (smooth scroll, back-to-top, copyright year)
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   1. MARKDOWN PARSER
   ═══════════════════════════════════════════════════════════ */
const MD = (() => {

  /** HTML-escape a string */
  function esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /** Process inline markdown: bold, italic, code, links, images, strikethrough */
  function inline(raw) {
    return esc(raw)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g,     '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>')
      .replace(/_([^_\n]+)_/g,   '<em>$1</em>')
      .replace(/~~(.+?)~~/g,     '<del>$1</del>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  /** Parse full markdown document */
  function parse(md) {
    if (!md) return '';
    const lines = md.split('\n');
    const out   = [];
    let i = 0;

    while (i < lines.length) {
      const ln = lines[i];

      // ── Fenced code block
      if (/^```/.test(ln.trim())) {
        const lang = ln.replace(/^```/, '').trim();
        const code = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i].trim())) {
          code.push(esc(lines[i]));
          i++;
        }
        out.push(`<pre><code class="lang-${lang}">${code.join('\n')}</code></pre>`);
        i++; continue;
      }

      // ── ATX Heading
      const hm = ln.match(/^(#{1,6})\s+(.+)/);
      if (hm) {
        const lvl = hm[1].length;
        const id  = hm[2].toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g,'');
        out.push(`<h${lvl} id="${id}">${inline(hm[2])}</h${lvl}>`);
        i++; continue;
      }

      // ── Horizontal rule
      if (/^[-*_]{3,}\s*$/.test(ln)) { out.push('<hr />'); i++; continue; }

      // ── Blockquote
      if (ln.startsWith('> ')) {
        const bq = [];
        while (i < lines.length && lines[i].startsWith('> ')) {
          bq.push(lines[i].slice(2));
          i++;
        }
        out.push(`<blockquote><p>${inline(bq.join(' '))}</p></blockquote>`);
        continue;
      }

      // ── Unordered list (-, *, +)
      if (/^[-*+]\s/.test(ln)) {
        const items = [];
        while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
          items.push(`<li>${inline(lines[i].replace(/^[-*+]\s/, ''))}</li>`);
          i++;
        }
        out.push(`<ul>${items.join('')}</ul>`);
        continue;
      }

      // ── Ordered list
      if (/^\d+\.\s/.test(ln)) {
        const items = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
          items.push(`<li>${inline(lines[i].replace(/^\d+\.\s/, ''))}</li>`);
          i++;
        }
        out.push(`<ol>${items.join('')}</ol>`);
        continue;
      }

      // ── Table (simple | delimited)
      if (ln.includes('|') && lines[i+1] && /^\|?\s*[-:]+/.test(lines[i+1])) {
        const headerCells = ln.split('|').map(c => c.trim()).filter(Boolean);
        const thead = headerCells.map(c => `<th>${inline(c)}</th>`).join('');
        i += 2; // skip header row + separator
        const rows = [];
        while (i < lines.length && lines[i].includes('|')) {
          const cells = lines[i].split('|').map(c => c.trim()).filter(Boolean);
          rows.push('<tr>' + cells.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>');
          i++;
        }
        out.push(`<table><thead><tr>${thead}</tr></thead><tbody>${rows.join('')}</tbody></table>`);
        continue;
      }

      // ── Blank line
      if (ln.trim() === '') { out.push(''); i++; continue; }

      // ── Paragraph (collect until blank / heading / block element)
      const para = [];
      while (i < lines.length) {
        const l = lines[i];
        if (l.trim() === '' || /^#{1,6}\s/.test(l) || /^```/.test(l.trim()) ||
            l.startsWith('> ') || /^[-*+]\s/.test(l) || /^\d+\.\s/.test(l) ||
            /^[-*_]{3,}\s*$/.test(l) || (l.includes('|') && lines[i+1]?.includes('---')))
          break;
        para.push(l);
        i++;
      }
      if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    }
    return out.filter(l => l !== '').join('\n');
  }

  /** Parse YAML-style front matter between --- delimiters */
  function frontMatter(raw) {
    const m = raw.match(/^---\n([\s\S]+?)\n---\n?([\s\S]*)$/);
    if (!m) return { meta: {}, body: raw };
    const meta = {};
    m[1].split('\n').forEach(line => {
      const [k, ...rest] = line.split(':');
      if (k) meta[k.trim()] = rest.join(':').trim().replace(/^["']|["']$/g,'');
    });
    return { meta, body: m[2] };
  }

  /** Plain-text excerpt */
  function excerpt(text, maxLen = 145) {
    const plain = text
      .replace(/^---[\s\S]+?---\n?/, '')
      .replace(/#{1,6}\s+/g,'')
      .replace(/\*\*|__|\*|_|`|~~|^>\s/gm,'')
      .replace(/\[([^\]]+)\]\([^)]+\)/g,'$1')
      .replace(/\n+/g,' ').trim();
    return plain.length > maxLen
      ? plain.slice(0, maxLen).replace(/\s\S+$/, '') + '…'
      : plain;
  }

  /** Estimated read time */
  function readTime(text) {
    return Math.max(1, Math.round(text.split(/\s+/).length / 200)) + ' min read';
  }

  return { parse, frontMatter, excerpt, readTime };
})();


/* ═══════════════════════════════════════════════════════════
   2. BLOG REGISTRY & LOADER
   ═══════════════════════════════════════════════════════════
   HOW TO ADD A NEW POST:
   1. Create blog/your-slug.md with front matter (see existing posts)
   2. Add its path to BLOG_INDEX below
   3. Add its URL to sitemap.xml
   4. Push to GitHub — done!
   ─────────────────────────────────────────────────────────── */
const BLOG_INDEX = [
  'blog/ai-in-recruitment.md',
  'blog/payroll-compliance-india.md',
  'blog/employee-engagement-retention.md',
  'blog/welcome.md',
];

async function fetchPost(path) {
  try {
    const res = await fetch(path, { cache: 'default' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw  = await res.text();
    const { meta, body } = MD.frontMatter(raw);
    return {
      title:    meta.title    || 'Untitled',
      date:     meta.date     || '',
      category: meta.category || 'HR Insights',
      slug:     meta.slug     || path.replace('blog/','').replace('.md',''),
      excerpt:  meta.excerpt  || MD.excerpt(body),
      readTime: MD.readTime(body),
      html:     MD.parse(body),
      path,
    };
  } catch(e) {
    console.warn(`Could not load ${path}:`, e.message);
    return null;
  }
}

function fmtDate(s) {
  if (!s) return '';
  try {
    return new Date(s).toLocaleDateString('en-IN', {year:'numeric',month:'long',day:'numeric'});
  } catch { return s; }
}

function blogCardHTML(post) {
  return `
  <a href="blog.html?post=${encodeURIComponent(post.slug)}" class="blog-card reveal"
     aria-label="Read: ${post.title}">
    <div class="bc-top">
      <span class="bc-cat">${post.category}</span>
      <span class="bc-date">${fmtDate(post.date)}</span>
      <span class="bc-rt">${post.readTime}</span>
    </div>
    <h3 class="bc-title">${post.title}</h3>
    <p class="bc-excerpt">${post.excerpt}</p>
    <span class="bc-more">Read more →</span>
  </a>`;
}

/** Render up to 3 blog cards in #blog-grid on index.html */
async function loadBlogGrid() {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;
  const posts = (await Promise.all(BLOG_INDEX.slice(0,3).map(fetchPost))).filter(Boolean);
  if (!posts.length) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--txt-light);padding:2rem;">Blog posts coming soon.</p>`;
    return;
  }
  grid.innerHTML = posts.map(blogCardHTML).join('');
  grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/** Render blog.html — listing or single post depending on ?post= param */
async function loadBlogPage() {
  const grid = document.getElementById('bp-grid');
  if (!grid) return;
  const slug = new URLSearchParams(window.location.search).get('post');
  if (slug) { await renderSinglePost(slug, grid); return; }

  // Hide hero title "Blog" (it stays) but populate grid
  grid.innerHTML = '<div class="blog-loader" role="status"><span class="ld"></span><span class="ld"></span><span class="ld"></span></div>';
  const posts = (await Promise.all(BLOG_INDEX.map(fetchPost))).filter(Boolean);
  if (!posts.length) {
    grid.innerHTML = '<p style="text-align:center;padding:3rem;color:var(--txt-mid);">No posts found.</p>';
    return;
  }
  grid.innerHTML = posts.map(blogCardHTML).join('');
  grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

async function renderSinglePost(slug, container) {
  const path = BLOG_INDEX.find(p => p.includes(slug));
  const post = path ? await fetchPost(path) : null;
  if (!post) {
    container.innerHTML = `<div style="padding:4rem 2rem;text-align:center;">
      <h2 style="color:var(--coal);font-family:var(--ff-display)">Post not found</h2>
      <a href="blog.html" class="btn btn-terra" style="margin-top:1.5rem;display:inline-flex;">← All Posts</a>
    </div>`;
    return;
  }
  // Update meta
  document.title = `${post.title} | Janardhan Bathula`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', post.excerpt);
  // Hide blog listing hero
  document.getElementById('bp-hero')?.remove();

  container.style.padding = '0';
  container.style.maxWidth = '100%';
  container.innerHTML = `
    <div class="post-hdr">
      <div class="post-hdr-inner">
        <a href="blog.html" class="btn btn-outline btn-sm" style="margin-bottom:1.5rem;display:inline-flex;">← All Posts</a>
        <span class="post-cat">${post.category}</span>
        <h1 class="post-h1">${post.title}</h1>
        <div class="post-meta">
          <span>${fmtDate(post.date)}</span>
          <span>·</span>
          <span>${post.readTime}</span>
        </div>
      </div>
    </div>
    <article class="post-body">${post.html}</article>
    <div style="max-width:720px;margin:0 auto;padding:0 var(--pad-x) 4rem;">
      <a href="blog.html" class="btn btn-outline-dark btn-sm">← Back to all posts</a>
    </div>`;
}


/* ═══════════════════════════════════════════════════════════
   3. INTERSECTION OBSERVER — REVEALS + SKILL BARS
   ═══════════════════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('vis');
    // Animate direct bar-fill children
    entry.target.querySelectorAll('.bar-fill').forEach((el, idx) => {
      setTimeout(() => { el.style.width = el.dataset.w + '%'; }, 120 + idx * 70);
    });
    // If the element itself is a bar-fill (inside already-revealed parent)
    if (entry.target.classList.contains('bar-fill')) {
      entry.target.style.width = entry.target.dataset.w + '%';
    }
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });

function initReveal() {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}


/* ═══════════════════════════════════════════════════════════
   4. COUNTER ANIMATIONS
   ═══════════════════════════════════════════════════════════ */
function animateCount(el) {
  const target = parseFloat(el.dataset.to);
  const start  = performance.now();
  const dur    = 1800;
  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const v = target * (1 - Math.pow(1 - t, 3));
    el.textContent = target % 1 !== 0 ? v.toFixed(1) : Math.round(v);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = target % 1 !== 0 ? target.toFixed(1) : target;
  }
  requestAnimationFrame(tick);
}

function initCounters() {
  const elems = document.querySelectorAll('.counter[data-to]');
  if (!elems.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  elems.forEach(el => obs.observe(el));
}


/* ═══════════════════════════════════════════════════════════
   5. NAVIGATION
   ═══════════════════════════════════════════════════════════ */
function initNav() {
  const header = document.getElementById('site-header');
  const burger = document.getElementById('nav-burger');
  const list   = document.getElementById('nav-list');
  const links  = document.querySelectorAll('.nav-item[href^="#"]');

  // Scroll class + back-to-top
  window.addEventListener('scroll', () => {
    header?.classList.toggle('solid', window.scrollY > 40);
    document.getElementById('btt')?.classList.toggle('vis', window.scrollY > 450);
  }, { passive: true });
  header?.classList.toggle('solid', window.scrollY > 40);

  // Mobile menu
  burger?.addEventListener('click', () => {
    const open = list?.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  function closeMenu() {
    list?.classList.remove('open');
    burger?.classList.remove('open');
    burger?.setAttribute('aria-expanded', 'false');
    burger?.setAttribute('aria-label', 'Open navigation menu');
    document.body.style.overflow = '';
  }

  links.forEach(l => l.addEventListener('click', closeMenu));
  document.addEventListener('click', e => {
    if (list?.classList.contains('open') && !list.contains(e.target) && !burger?.contains(e.target))
      closeMenu();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const activeObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        document.querySelector(`.nav-item[href="#${entry.target.id}"]`)?.classList.add('active');
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => activeObs.observe(s));

  // Back to top
  document.getElementById('btt')?.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Copyright year
  const yr = document.getElementById('ft-year');
  if (yr) yr.textContent = new Date().getFullYear();
}


/* ═══════════════════════════════════════════════════════════
   6. PORTFOLIO FILTER
   ═══════════════════════════════════════════════════════════ */
function initFilter() {
  const btns  = document.querySelectorAll('.flt-btn');
  const cards = document.querySelectorAll('.gal-card');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('active'); btn.setAttribute('aria-selected','true');
      cards.forEach(c => {
        const show = f === 'all' || c.dataset.cat === f;
        c.classList.toggle('hidden', !show);
      });
    });
  });
}


/* ═══════════════════════════════════════════════════════════
   7. CONTACT FORM
   ═══════════════════════════════════════════════════════════
   → Replace FORMSPREE_URL with your own endpoint.
     Sign up free at https://formspree.io
   ─────────────────────────────────────────────────────────── */
const FORMSPREE_URL = 'https://formspree.io/f/YOUR_FORM_ID';

function initContactForm() {
  const form    = document.getElementById('contact-form');
  if (!form) return;
  const name    = form.querySelector('#cf-name');
  const email   = form.querySelector('#cf-email');
  const msg     = form.querySelector('#cf-msg');
  const fchar   = document.getElementById('fchar');
  const submit  = document.getElementById('cf-submit');
  const success = document.getElementById('fsuccess');

  // Character counter
  msg?.addEventListener('input', () => {
    const n = msg.value.length;
    if (fchar) fchar.textContent = `${n} / 1000`;
  });

  // Validators
  const rules = {
    'cf-name':  v => v.trim().length >= 2  ? '' : 'Please enter your name (at least 2 characters).',
    'cf-email': v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email.',
    'cf-msg':   v => v.trim().length >= 20 ? '' : 'Please write at least 20 characters.',
  };

  function validate(input) {
    const rule = rules[input.id];
    const err  = rule ? rule(input.value) : '';
    const errEl = document.getElementById('err-' + input.id.replace('cf-',''));
    if (errEl) errEl.textContent = err;
    input.classList.toggle('err', !!err);
    input.setAttribute('aria-invalid', String(!!err));
    return !err;
  }

  [name, email, msg].forEach(el => {
    if (!el) return;
    el.addEventListener('blur',  () => validate(el));
    el.addEventListener('input', () => { if (el.classList.contains('err')) validate(el); });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const ok = [name, email, msg].map(validate).every(Boolean);
    if (!ok) { form.querySelector('.err')?.focus(); return; }

    submit.disabled = true;
    submit.querySelector('.cf-text').hidden = true;
    submit.querySelector('.cf-spin').hidden = false;

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    name.value.trim(),
          email:   email.value.trim(),
          service: form.querySelector('#cf-service')?.value || '',
          message: msg.value.trim(),
        }),
      });
      if (res.ok) {
        form.style.display = 'none';
        if (success) success.hidden = false;
      } else throw new Error('Submission failed');
    } catch {
      // Fallback: open mailto
      const sub  = encodeURIComponent('HR Consulting Inquiry');
      const body = encodeURIComponent(`Name: ${name.value}\nEmail: ${email.value}\n\n${msg.value}`);
      window.location.href = `mailto:hrfreelance.pro@gmail.com?subject=${sub}&body=${body}`;
    } finally {
      submit.disabled = false;
      submit.querySelector('.cf-text').hidden = false;
      submit.querySelector('.cf-spin').hidden = true;
    }
  });
}


/* ═══════════════════════════════════════════════════════════
   8. SMOOTH SCROLL + MISC
   ═══════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const tgt = document.querySelector(a.getAttribute('href'));
      if (!tgt) return;
      e.preventDefault();
      const offset = (document.getElementById('site-header')?.offsetHeight || 68) + 8;
      window.scrollTo({ top: tgt.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    });
  });
}

function initGalleryFallbacks() {
  document.querySelectorAll('.gal-img').forEach(img => {
    if (img.complete && img.naturalWidth === 0) {
      img.style.display = 'none';
      img.nextElementSibling && (img.nextElementSibling.style.display = 'flex');
    }
  });
}


/* ═══════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initCounters();
  initFilter();
  initContactForm();
  initSmoothScroll();
  initGalleryFallbacks();
  loadBlogGrid();   // populates #blog-grid on index.html
  loadBlogPage();   // populates #bp-grid on blog.html
});

/* For optional Node/build tooling */
if (typeof module !== 'undefined') module.exports = { MD };
