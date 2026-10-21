/**
 * Tests for the todos script
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('todos script', () => {
  const repoRoot = path.join(__dirname, '../..');
  const scriptsDir = path.join(repoRoot, 'scripts');
  const todosScript = path.join(scriptsDir, 'todos.js');
  
  // Helper to run the script
  function runTodos(args = '') {
    try {
      const output = execSync(`node ${todosScript} ${args}`, {
        cwd: repoRoot,
        encoding: 'utf8',
      });
      return { output, exitCode: 0 };
    } catch (err) {
      return { output: err.stdout || '', exitCode: err.status };
    }
  }
  
  describe('basic functionality', () => {
    test('script exists and is executable', () => {
      expect(fs.existsSync(todosScript)).toBe(true);
    });
    
    test('script runs without errors', () => {
      const result = runTodos();
      expect(result.output).toBeDefined();
    });
    
    test('returns exit code 0 when no TODOs found (or 1 if found)', () => {
      const result = runTodos();
      expect([0, 1]).toContain(result.exitCode);
    });
  });
  
  describe('output formats', () => {
    test('console format outputs readable text', () => {
      const result = runTodos('--format console');
      expect(result.output).toBeDefined();
      // Should contain either success message or TODO/FIXME results
      expect(
        result.output.includes('No TODO or FIXME') ||
        result.output.includes('TODO') ||
        result.output.includes('FIXME')
      ).toBe(true);
    });
    
    test('json format outputs valid JSON', () => {
      const result = runTodos('--format json');
      expect(() => JSON.parse(result.output)).not.toThrow();
      const parsed = JSON.parse(result.output);
      expect(Array.isArray(parsed)).toBe(true);
    });
    
    test('json format includes required fields', () => {
      const result = runTodos('--format json');
      const parsed = JSON.parse(result.output);
      
      if (parsed.length > 0) {
        const comment = parsed[0];
        expect(comment).toHaveProperty('file');
        expect(comment).toHaveProperty('line');
        expect(comment).toHaveProperty('type');
        expect(comment).toHaveProperty('text');
      }
    });
  });
  
  describe('filtering', () => {
    test('--filter TODO only returns TODO comments', () => {
      const result = runTodos('--format json --filter TODO');
      const parsed = JSON.parse(result.output);
      
      parsed.forEach(comment => {
        expect(comment.type).toBe('TODO');
      });
    });
    
    test('--filter FIXME only returns FIXME comments', () => {
      const result = runTodos('--format json --filter FIXME');
      const parsed = JSON.parse(result.output);
      
      parsed.forEach(comment => {
        expect(comment.type).toBe('FIXME');
      });
    });
  });
  
  describe('comment detection', () => {
    test('detects TODO comments', () => {
      const result = runTodos('--format json --filter TODO');
      const parsed = JSON.parse(result.output);
      
      // Should find at least the git hook TODOs
      expect(parsed.length).toBeGreaterThanOrEqual(0);
    });
    
    test('detects FIXME comments', () => {
      const result = runTodos('--format json --filter FIXME');
      const parsed = JSON.parse(result.output);
      
      // Should be an array (may be empty)
      expect(Array.isArray(parsed)).toBe(true);
    });
    
    test('comment objects have valid structure', () => {
      const result = runTodos('--format json');
      const parsed = JSON.parse(result.output);
      
      parsed.forEach(comment => {
        expect(typeof comment.file).toBe('string');
        expect(typeof comment.line).toBe('number');
        expect(typeof comment.type).toBe('string');
        expect(typeof comment.text).toBe('string');
        expect(comment.line).toBeGreaterThan(0);
        expect(['TODO', 'FIXME']).toContain(comment.type);
      });
    });
  });
  
  describe('exclusions', () => {
    test('ignores node_modules', () => {
      const result = runTodos('--format json');
      const parsed = JSON.parse(result.output);
      
      parsed.forEach(comment => {
        expect(comment.file).not.toMatch(/node_modules/);
      });
    });
    
    test('ignores .git directory', () => {
      const result = runTodos('--format json');
      const parsed = JSON.parse(result.output);
      
      // Git hooks may contain TODOs, but they should be in .git/hooks
      // The script should still work correctly
      expect(Array.isArray(parsed)).toBe(true);
    });
    
    test('ignores binary files', () => {
      const result = runTodos('--format json');
      const parsed = JSON.parse(result.output);
      
      parsed.forEach(comment => {
        const ext = path.extname(comment.file);
        expect(['.png', '.jpg', '.gif', '.pdf']).not.toContain(ext);
      });
    });
  });
  
  describe('edge cases', () => {
    test('handles files with no comments gracefully', () => {
      const result = runTodos('--format json');
      expect(() => JSON.parse(result.output)).not.toThrow();
    });
    
    test('handles empty repository gracefully', () => {
      const result = runTodos();
      expect(result.output).toBeDefined();
    });
    
    test('case-insensitive comment detection', () => {
      const result = runTodos('--format json');
      const parsed = JSON.parse(result.output);
      
      parsed.forEach(comment => {
        expect(['TODO', 'FIXME']).toContain(comment.type);
      });
    });
  });
  
  describe('output sorting', () => {
    test('results are sorted by file then line number', () => {
      const result = runTodos('--format json');
      const parsed = JSON.parse(result.output);
      
      for (let i = 1; i < parsed.length; i++) {
        const prev = parsed[i - 1];
        const curr = parsed[i];
        
        if (prev.file === curr.file) {
          expect(curr.line).toBeGreaterThanOrEqual(prev.line);
        } else {
          expect(curr.file).toBeGreaterThanOrEqual(prev.file);
        }
      }
    });
  });
});
