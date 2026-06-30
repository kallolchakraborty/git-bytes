#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────
   add-date-fields.js
   Adds datePublished and lastModified to all guide JSON files
   that don't already have them.
   Run: node scripts/add-date-fields.js
   ───────────────────────────────────────────────────────── */

var fs = require('fs');
var path = require('path');

var CONTENT_DIR = path.join(__dirname, '..', 'content');
var DEFAULT_DATE = '2026-06-30';

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
  if (!data.datePublished) data.datePublished = DEFAULT_DATE;
  if (!data.lastModified) data.lastModified = DEFAULT_DATE;
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  count++;
});

console.log('Updated ' + count + ' files with date fields');
