#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────
   watermark-svgs.js
   Adds a copyright watermark to all inline SVGs in content
   JSON files. Adds a semi-transparent attribution bar.
   Run: node scripts/watermark-svgs.js
   ───────────────────────────────────────────────────────── */

var fs = require('fs');
var path = require('path');

var CONTENT_DIR = path.join(__dirname, '..', 'content');

var WATERMARK_TEXT = 'git-bytes  © 2026';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(function (entry) {
    var full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      walk(full, callback);
    } else if (entry.endsWith('.json')) {
      callback(full);
    }
  });
}

var count = 0;
walk(CONTENT_DIR, function (file) {
  var data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  var modified = false;

  /* Helper: inject watermark into SVG markup */
  function watermarkSvg(svg) {
    /* Find the viewBox to determine SVG dimensions */
    var vbMatch = svg.match(/viewBox='([^']+)'/);
    if (!vbMatch) return svg;
    var parts = vbMatch[1].split(/\s+/);
    if (parts.length < 4) return svg;
    var w = parseFloat(parts[2]);
    var h = parseFloat(parts[3]);
    if (!w || !h) return svg;

    /* Find the closing </svg> tag */
    var closeIdx = svg.lastIndexOf('</svg>');
    if (closeIdx === -1) return svg;

    /* Insert a semi-transparent bar at the bottom with the watermark */
    var overlay =
      '<rect x="0" y="' + (h - 14) + '" width="' + w + '" height="14" fill="rgba(0,0,0,0.3)" rx="0" />' +
      '<text x="' + (w - 4) + '" y="' + (h - 4) + '" text-anchor="end" fill="rgba(255,255,255,0.5)" font-size="8" font-family="monospace">' +
      WATERMARK_TEXT + '</text>';

    svg = svg.slice(0, closeIdx) + overlay + svg.slice(closeIdx);
    return svg;
  }

  /* Process description field */
  if (data.description && data.description.indexOf('<svg') !== -1) {
    data.description = data.description.replace(/<svg[^>]*>[\s\S]*?<\/svg>/g, watermarkSvg);
    modified = true;
  }

  /* Process section descriptions */
  if (data.sections) {
    data.sections.forEach(function (section) {
      if (section.description && section.description.indexOf('<svg') !== -1) {
        section.description = section.description.replace(/<svg[^>]*>[\s\S]*?<\/svg>/g, watermarkSvg);
        modified = true;
      }
    });
  }

  /* Process details */
  if (data.details && data.details.indexOf('<svg') !== -1) {
    data.details = data.details.replace(/<svg[^>]*>[\s\S]*?<\/svg>/g, watermarkSvg);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
    count++;
    console.log('Watermarked: ' + path.relative(CONTENT_DIR, file));
  }
});

console.log('Done — ' + count + ' files updated with SVG watermarks');
