# Janardhan Bathula — HR Portfolio v2

Single-page freelance HR portfolio. Plain HTML · CSS · JavaScript. No framework, no database, no build step required.

**Live URL (after deployment):** `https://janardhanbathula.github.io/`

---

## 📁 Project Structure

```
jb-v2/
├── index.html                    ← Main single-page site
├── blog.html                     ← Blog listing + single-post viewer
├── sitemap.xml                   ← Submit to Google Search Console
├── robots.txt                    ← Search engine directives
│
├── css/
│   └── style.css                 ← All styles (design system + components)
│
├── js/
│   └── main.js                   ← Markdown parser, blog loader, animations, form
│
├── blog/                         ← Markdown posts (add new .md files here)
│   ├── ai-in-recruitment.md
│   ├── payroll-compliance-india.md
│   ├── employee-engagement-retention.md
│   └── welcome.md
│
├── images/                       ← Add your photos here
│   ├── janardhan-bathula.jpg     ← Profile photo, 440×540px
│   ├── og-card.jpg               ← Social share card, 1200×630px
│   ├── proj-jd-gen.jpg           ← Project screenshots (400×260px each)
│   ├── proj-attrition.jpg
│   ├── proj-checklist.jpg
│   ├── proj-payroll.jpg
│   └── proj-boolean.jpg
│
└── resume/
    └── Janardhan_Bathula_HR_Resume.pdf
```

---

## 🚀 GitHub Pages Deployment — Step by Step

### Step 1: Create the Repository

1. Go to **github.com** → sign in → **New repository**
2. Name it **exactly**: `janardhanbathula.github.io`
   - ⚠️ Must match your GitHub username for the root URL to work
3. Set to **Public** · Do NOT initialise with README
4. Click **Create repository**

### Step 2: Upload Files

**Via GitHub web (simplest):**
1. In your new repo, click **Add file → Upload files**
2. Drag and drop all project files
3. Maintain folder structure (`css/`, `js/`, `blog/`, `images/`, `resume/`)
4. Commit to `main`

**Via command line:**
```bash
cd path/to/jb-v2
git init
git add .
git commit -m "Launch HR portfolio"
git branch -M main
git remote add origin https://github.com/janardhanbathula/janardhanbathula.github.io.git
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Repository → **Settings** → **Pages**
2. Source: **Deploy from a branch** · Branch: **main** · Folder: **/ (root)**
3. Click **Save**
4. Wait 2–5 minutes → visit `https://janardhanbathula.github.io/`

### Step 4: Verify

- [ ] All sections visible and correctly styled
- [ ] Navigation scrolls to correct sections
- [ ] Blog posts load (check Network tab — `.md` files must be accessible)
- [ ] Mobile layout looks correct (test in DevTools)
- [ ] Contact form shows (submit requires Formspree setup below)

---

## 🔑 Minimal MVP Checklist (Priority Order)

### Phase 1 — Core (Do First)
- [x] `index.html` — complete single page with all sections
- [x] `css/style.css` — full design system
- [x] `js/main.js` — markdown parser, blog loader, form validation
- [ ] Add your profile photo → `images/janardhan-bathula.jpg`
- [ ] Add resume PDF → `resume/Janardhan_Bathula_HR_Resume.pdf`
- [ ] Deploy to GitHub Pages
- [ ] Submit sitemap to Google Search Console

### Phase 2 — Polish (After Launch)
- [ ] Add project screenshots to `images/`
- [ ] Update GitHub links in portfolio section
- [ ] Set up Formspree (see Contact Form section)
- [ ] Add og-card.jpg for social sharing preview
- [ ] Run PageSpeed Insights — fix any issues

### Phase 3 — Growth (Ongoing)
- [ ] Add new blog posts monthly
- [ ] Add Google Analytics (optional)
- [ ] Consider custom domain

---

## ✍️ Adding a New Blog Post

**3 steps, no tools required:**

### 1. Create the markdown file

```
blog/your-post-slug.md
```

Start with front matter:
```markdown
---
title: Your Post Title Here
date: 2025-04-20
category: Recruitment
slug: your-post-slug
excerpt: Optional — one-line summary for blog listings. Auto-generated if omitted.
---

## Your First Heading

Content here...
```

### 2. Register in main.js

Open `js/main.js` and add to `BLOG_INDEX`:
```javascript
const BLOG_INDEX = [
  'blog/ai-in-recruitment.md',
  'blog/payroll-compliance-india.md',
  'blog/employee-engagement-retention.md',
  'blog/welcome.md',
  'blog/your-post-slug.md',   // ← add here
];
```

### 3. Add to sitemap.xml

```xml
<url>
  <loc>https://janardhanbathula.github.io/blog.html?post=your-post-slug</loc>
  <lastmod>2025-04-20</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
```

Push to GitHub → live in minutes.

### Supported Markdown

| Syntax | Output |
|--------|--------|
| `# H1` through `###### H6` | Headings with auto-IDs |
| `**bold**` / `__bold__` | **Bold** |
| `*italic*` / `_italic_` | *Italic* |
| `***bold italic***` | ***Bold italic*** |
| `` `code` `` | Inline code |
| ` ```lang ``` ` | Code block |
| `[text](url)` | Link (opens new tab) |
| `![alt](src)` | Image |
| `- item` / `* item` | Bullet list |
| `1. item` | Numbered list |
| `> quote` | Blockquote |
| `---` | Horizontal rule |
| `~~text~~` | ~~Strikethrough~~ |
| `\| col \| col \|` | Table |

---

## 📧 Activating the Contact Form

The form submits to Formspree (free tier: 50 submissions/month).

1. Sign up at **formspree.io**
2. Create a new form → copy your Form ID (e.g. `xkndpqwz`)
3. Open `js/main.js` and find:
   ```javascript
   const FORMSPREE_URL = 'https://formspree.io/f/YOUR_FORM_ID';
   ```
4. Replace `YOUR_FORM_ID` with your real ID
5. Push → form is live

**Fallback behaviour:** If Formspree fails or the form ID isn't set, the submit button opens a `mailto:` link automatically so you never lose a lead.

---

## 🔍 SEO Checklist

### ✅ Already Implemented
- [x] Unique title tags with keywords on every page
- [x] Meta descriptions (index + blog pages)
- [x] Canonical URLs
- [x] Open Graph tags (title, description, image, type)
- [x] Twitter Card tags
- [x] JSON-LD structured data (Person + ProfessionalService)
- [x] Semantic HTML5 (header, main, section, article, nav, footer)
- [x] ARIA labels and roles throughout
- [x] Alt text on all images (descriptive, not generic)
- [x] Heading hierarchy (H1 → H2 → H3, never skipped)
- [x] Keyboard navigability (Tab + Enter on all interactive elements)
- [x] `sitemap.xml` with all public URLs
- [x] `robots.txt` with sitemap reference
- [x] Mobile-responsive design (tested at 320px, 768px, 1200px)
- [x] `lang="en"` on `<html>`
- [x] `preconnect` for font origins
- [x] Lazy loading on all images (`loading="lazy"`)
- [x] `rel="noopener noreferrer"` on all external links
- [x] `prefers-reduced-motion` media query support

### 🔧 Complete After Deployment

- [ ] **Google Search Console:** Add property → Verify → Submit sitemap
- [ ] **Update canonical URLs:** Change `janardhanbathula.github.io` to custom domain if purchased
- [ ] **og-card.jpg:** Create a 1200×630px social preview image
- [ ] **PageSpeed Insights:** Run at `pagespeed.web.dev` — target 90+ mobile
- [ ] **Image compression:** Run all images through `squoosh.app` before uploading
- [ ] **LinkedIn:** Add portfolio URL to your profile
- [ ] **Naukri profile:** Add portfolio URL

### 🎯 Performance Tips
- Keep total page weight under 500KB (excluding images)
- Profile photo: compress to under 150KB (WebP preferred)
- Project images: compress to under 80KB each
- Google Fonts load via `preconnect` — already optimised

---

## 🎨 Customisation

All design tokens are CSS variables at the top of `css/style.css`:

```css
:root {
  --coal:  #1C1C1E;  /* Primary dark background */
  --terra: #C05A3A;  /* Terracotta accent */
  --stone: #F0EDE8;  /* Light section background */
  /* ... */
}
```

To change the accent colour (e.g. deep green `#2D6A4F`):
1. Replace `--terra` value
2. Replace `--terra-lt` (lighter variant) and `--terra-pale` (pale tint)

---

## 🛠️ Optional Enhancements

| Feature | Effort | Notes |
|---------|--------|-------|
| Custom domain | Low | GitHub Pages Settings → Custom domain |
| Google Analytics | Low | Add GA4 `<script>` before `</head>` |
| Dark mode | Medium | `prefers-color-scheme` + CSS variable overrides |
| Blog search | Medium | `Fuse.js` for client-side fuzzy search |
| Comments | Medium | Giscus (GitHub Discussions, free) |
| Newsletter | Low | Mailchimp embed form in footer |
| PWA offline | High | Service Worker + `manifest.json` |

---

## 📞 Contact

**Janardhan Bathula**
📧 hrfreelance.pro@gmail.com
📞 +91 89784 53605
🔗 linkedin.com/in/janardhanbathula-1593731a5
📍 Visakhapatnam, Andhra Pradesh
