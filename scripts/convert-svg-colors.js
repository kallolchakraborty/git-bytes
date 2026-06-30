const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '..', 'content');

const replacements = [
  // Dark backgrounds (#0d1117)
  [/(fill=['"])#0d1117(['"])/gi, "$1var(--bg-secondary)$2"],
  // Card backgrounds (#161B22)
  [/(fill=['"])#161B22(['"])/gi, "$1var(--bg-secondary)$2"],
  [/(fill=['"])#161b22(['"])/gi, "$1var(--bg-secondary)$2"],
  // Dark box outlines (#24292F)
  [/(fill=['"])#24292F(['"])/gi, "$1var(--bg-secondary)$2"],
  [/(fill=['"])#24292f(['"])/gi, "$1var(--bg-secondary)$2"],
  // Code box fills (#21262d)
  [/(fill=['"])#21262d(['"])/gi, "$1var(--bg-secondary)$2"],
  [/(fill=['"])#21262D(['"])/gi, "$1var(--bg-secondary)$2"],
  // Dark borders (#30363D)
  [/(stroke=['"])#30363D(['"])/gi, "$1var(--border-default)$2"],
  [/(stroke=['"])#30363d(['"])/gi, "$1var(--border-default)$2"],
  // Gray muted text (#8B949E)
  [/(fill=['"])#8B949E(['"])/gi, "$1var(--text-secondary)$2"],
  [/(fill=['"])#8b949e(['"])/gi, "$1var(--text-secondary)$2"],
  // Light gray text on dark (#c9d1d9)
  [/(fill=['"])#c9d1d9(['"])/gi, "$1var(--text-primary)$2"],
  [/(fill=['"])#C9D1D9(['"])/gi, "$1var(--text-primary)$2"],
];

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf-8');
  let json;
  try {
    json = JSON.parse(original);
  } catch (e) {
    console.error(`Parse error: ${filePath} — ${e.message}`);
    return false;
  }

  if (!json.description) return false;

  let desc = json.description;
  const beforeDesc = desc;

  desc = desc.replace(/<svg[\s\S]*?<\/svg>/g, (svg) => {
    // Apply attribute color replacements
    for (const [pattern, replacement] of replacements) {
      svg = svg.replace(pattern, replacement);
    }
    // Handle colors in <style> blocks (CSS syntax, no quotes)
    svg = svg.replace(/<style>([\s\S]*?)<\/style>/g, (match, css) => {
      let newCss = css;
      newCss = newCss.replace(/#0d1117/gi, 'var(--bg-secondary)');
      newCss = newCss.replace(/#161B22/gi, 'var(--bg-secondary)');
      newCss = newCss.replace(/#161b22/gi, 'var(--bg-secondary)');
      newCss = newCss.replace(/#24292F/gi, 'var(--bg-secondary)');
      newCss = newCss.replace(/#24292f/gi, 'var(--bg-secondary)');
      newCss = newCss.replace(/#21262d/gi, 'var(--bg-secondary)');
      newCss = newCss.replace(/#21262D/gi, 'var(--bg-secondary)');
      newCss = newCss.replace(/#30363D/gi, 'var(--border-default)');
      newCss = newCss.replace(/#30363d/gi, 'var(--border-default)');
      newCss = newCss.replace(/#8B949E/gi, 'var(--text-secondary)');
      newCss = newCss.replace(/#8b949e/gi, 'var(--text-secondary)');
      newCss = newCss.replace(/#c9d1d9/gi, 'var(--text-primary)');
      newCss = newCss.replace(/#C9D1D9/gi, 'var(--text-primary)');
      return `<style>${newCss}</style>`;
    });
    // Handle stop-color in gradients
    svg = svg.replace(/(stop-color=['"])#0d1117(['"])/gi, "$1var(--bg-secondary)$2");
    svg = svg.replace(/(stop-color=['"])#161B22(['"])/gi, "$1var(--bg-secondary)$2");
    svg = svg.replace(/(stop-color=['"])#161b22(['"])/gi, "$1var(--bg-secondary)$2");
    svg = svg.replace(/(stop-color=['"])#24292F(['"])/gi, "$1var(--bg-secondary)$2");
    svg = svg.replace(/(stop-color=['"])#24292f(['"])/gi, "$1var(--bg-secondary)$2");
    svg = svg.replace(/(stop-color=['"])#21262d(['"])/gi, "$1var(--bg-secondary)$2");
    svg = svg.replace(/(stop-color=['"])#21262D(['"])/gi, "$1var(--bg-secondary)$2");
    svg = svg.replace(/(stop-color=['"])#30363D(['"])/gi, "$1var(--border-default)$2");
    svg = svg.replace(/(stop-color=['"])#30363d(['"])/gi, "$1var(--border-default)$2");
    svg = svg.replace(/(stop-color=['"])#8B949E(['"])/gi, "$1var(--text-secondary)$2");
    svg = svg.replace(/(stop-color=['"])#8b949e(['"])/gi, "$1var(--text-secondary)$2");
    svg = svg.replace(/(stop-color=['"])#c9d1d9(['"])/gi, "$1var(--text-primary)$2");
    svg = svg.replace(/(stop-color=['"])#C9D1D9(['"])/gi, "$1var(--text-primary)$2");
    return svg;
  });

  if (desc === beforeDesc) return false;

  json.description = desc;
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf-8');
  return true;
}

function walkDir(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += walkDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      if (processFile(fullPath)) {
        console.log(`✓ ${path.relative(path.join(__dirname, '..'), fullPath)}`);
        count++;
      }
    }
  }
  return count;
}

console.log('Converting SVG colors in content JSON files...');
const total = walkDir(contentDir);
console.log(`\nDone. ${total} files updated.`);
