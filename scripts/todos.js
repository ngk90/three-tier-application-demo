#!/usr/bin/env node

/**
 * Scans the repository for TODO and FIXME comments.
 * 
 * Usage:
 *   npm run todos
 *   npm run todos -- --format json
 *   npm run todos -- --filter FIXME
 */

const fs = require('fs');
const path = require('path');

// Configuration
const IGNORE_DIRS = new Set([
  '.git',
  'node_modules',
  '.next',
  'dist',
  'build',
  '.terraform',
  '.venv',
  '__pycache__',
  '.env',
  '.env.local',
]);

const IGNORE_FILES = new Set([
  '.DS_Store',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
]);

const IGNORE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
]);

/**
 * Check if a path should be ignored
 */
function shouldIgnore(filePath, isDir) {
  const basename = path.basename(filePath);
  
  if (isDir) {
    return IGNORE_DIRS.has(basename);
  }
  
  if (IGNORE_FILES.has(basename)) {
    return true;
  }
  
  const ext = path.extname(filePath);
  if (IGNORE_EXTENSIONS.has(ext)) {
    return true;
  }
  
  return false;
}

/**
 * Recursively scan directory for files
 */
function scanDirectory(dir, results = []) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!shouldIgnore(fullPath, true)) {
          scanDirectory(fullPath, results);
        }
      } else if (entry.isFile()) {
        if (!shouldIgnore(fullPath, false)) {
          results.push(fullPath);
        }
      }
    }
  } catch (err) {
    // Skip directories we can't read
  }
  
  return results;
}

/**
 * Extract TODO/FIXME comments from a file
 */
function extractComments(filePath) {
  const comments = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Match TODO or FIXME (case-insensitive)
      const match = line.match(/(TODO|FIXME):\s*(.+?)(?:\s*$|\/\/|#|\*\/)/i);
      
      if (match) {
        const type = match[1].toUpperCase();
        const text = match[2].trim();
        
        comments.push({
          file: filePath,
          line: index + 1,
          type,
          text,
        });
      }
    });
  } catch (err) {
    // Skip files we can't read
  }
  
  return comments;
}

/**
 * Format comments for console output
 */
function formatConsole(comments) {
  if (comments.length === 0) {
    console.log('✓ No TODO or FIXME comments found');
    return;
  }
  
  console.log(`\nFound ${comments.length} TODO/FIXME comment(s):\n`);
  
  // Group by file
  const byFile = {};
  comments.forEach(comment => {
    if (!byFile[comment.file]) {
      byFile[comment.file] = [];
    }
    byFile[comment.file].push(comment);
  });
  
  // Print grouped by file
  Object.keys(byFile).sort().forEach(file => {
    console.log(`  ${file}`);
    byFile[file].forEach(comment => {
      const icon = comment.type === 'FIXME' ? '⚠️ ' : '📝';
      console.log(`    ${icon} Line ${comment.line}: [${comment.type}] ${comment.text}`);
    });
    console.log();
  });
}

/**
 * Format comments as JSON
 */
function formatJson(comments) {
  console.log(JSON.stringify(comments, null, 2));
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  let format = 'console';
  let filter = null;
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--format' && args[i + 1]) {
      format = args[i + 1];
      i++;
    } else if (args[i] === '--filter' && args[i + 1]) {
      filter = args[i + 1].toUpperCase();
      i++;
    }
  }
  
  // Scan repository
  const repoRoot = path.join(__dirname, '..');
  const files = scanDirectory(repoRoot);
  
  // Extract comments
  let comments = [];
  files.forEach(file => {
    comments = comments.concat(extractComments(file));
  });
  
  // Apply filter
  if (filter) {
    comments = comments.filter(c => c.type === filter);
  }
  
  // Sort by file and line
  comments.sort((a, b) => {
    if (a.file !== b.file) {
      return a.file.localeCompare(b.file);
    }
    return a.line - b.line;
  });
  
  // Output
  if (format === 'json') {
    formatJson(comments);
  } else {
    formatConsole(comments);
  }
  
  // Exit with appropriate code
  process.exit(comments.length > 0 ? 1 : 0);
}

main();
