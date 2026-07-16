#!/usr/bin/env node
// Regenerates the blog card grid in blog.html from posts.json.
// Run manually with `node scripts/build-blog.js`, or automatically in CI
// (see .github/workflows/deploy.yml) before every deploy.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const POSTS_PATH = path.join(ROOT, "posts.json");
const BLOG_HTML_PATH = path.join(ROOT, "blog.html");

const START_MARKER = "<!-- BLOG_GRID_START -->";
const END_MARKER = "<!-- BLOG_GRID_END -->";

const TAG_EMOJI = {
  "Long-Term Rentals": "🔑",
  "Rideshare Driving": "🚗",
  "Delivery Driving": "📦",
  "Getting Started": "🧭",
  "Cost Savings": "💰",
  "Driver Life": "🏙️",
  "Insurance & Legal": "📋",
  "Earnings": "📈",
  "Vehicle Care": "🔧",
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderCard(post) {
  const emoji = TAG_EMOJI[post.tag] || "📰";
  return `      <a href="${post.slug}.html" class="blog-card reveal visible" style="text-decoration:none;display:block">
        <div class="blog-img-placeholder">${emoji}</div>
        <div class="blog-body">
          <div class="blog-tag">${escapeHtml(post.tag)}</div>
          <div class="blog-title">${escapeHtml(post.title)}</div>
          <div class="blog-excerpt">${escapeHtml(post.excerpt)}</div>
          <div class="blog-date">${escapeHtml(post.dateLabel)}</div>
        </div>
      </a>`;
}

function main() {
  const posts = JSON.parse(fs.readFileSync(POSTS_PATH, "utf8"));
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  const grid = posts.map(renderCard).join("\n");

  const html = fs.readFileSync(BLOG_HTML_PATH, "utf8");
  const startIdx = html.indexOf(START_MARKER);
  const endIdx = html.indexOf(END_MARKER);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`blog.html is missing ${START_MARKER} / ${END_MARKER} markers`);
  }

  const before = html.slice(0, startIdx + START_MARKER.length);
  const after = html.slice(endIdx);
  const updated = `${before}\n${grid}\n      ${after}`;

  fs.writeFileSync(BLOG_HTML_PATH, updated);
  console.log(`blog.html regenerated with ${posts.length} post(s).`);
}

main();
