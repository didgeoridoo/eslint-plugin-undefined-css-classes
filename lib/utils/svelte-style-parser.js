const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');

/**
 * Extracts CSS classes from Svelte component <style> blocks
 */
class SvelteStyleParser {
  /**
   * Parse the source code to extract classes from <style> blocks
   * @param {string} sourceCode - The full source code of the Svelte component
   * @returns {Set<string>} Set of class names defined in style blocks
   */
  extractStyleBlockClasses(sourceCode) {
    const classes = new Set();
    
    // Match all <style> blocks (including those with attributes like lang="scss")
    const styleBlockRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let match;
    
    while ((match = styleBlockRegex.exec(sourceCode)) !== null) {
      const cssContent = match[1];
      
      // Extract classes from this style block
      const blockClasses = this.extractClassesFromCSS(cssContent);
      blockClasses.forEach(cls => classes.add(cls));
    }
    
    return classes;
  }

  /**
   * Extract class names from CSS content
   * @param {string} cssContent - CSS content to parse
   * @returns {Set<string>} Set of class names
   */
  extractClassesFromCSS(cssContent) {
    const classes = new Set();
    
    try {
      // Parse CSS with PostCSS
      const root = postcss.parse(cssContent);
      
      // Walk through all rules
      root.walkRules((rule) => {
        // Extract class selectors
        try {
          selectorParser((selectors) => {
            selectors.walkClasses((classNode) => {
              classes.add(classNode.value);
            });
          }).processSync(rule.selector);
        } catch {
          // Silently ignore selector parsing errors
          if (process.env.DEBUG) {
            process.stderr.write(`[DEBUG] Failed to parse selector: ${rule.selector}\n`);
          }
        }
      });
      
      // Also handle @keyframes names (though less common in component styles)
      root.walkAtRules('keyframes', (rule) => {
        classes.add(rule.params);
      });
      
    } catch {
      // If CSS parsing fails, try a simple regex fallback
      if (process.env.DEBUG) {
        process.stderr.write(`[DEBUG] PostCSS parsing failed, using regex fallback\n`);
      }
      
      // Simple regex to find class selectors
      const classRegex = /\.([a-zA-Z_-][\w-]*)/g;
      let match;
      
      while ((match = classRegex.exec(cssContent)) !== null) {
        classes.add(match[1]);
      }
    }
    
    return classes;
  }

  /**
   * Check if a file is a Svelte component
   * @param {string} filePath - Path to the file
   * @returns {boolean} True if it's a Svelte file
   */
  isSvelteFile(filePath) {
    return filePath && filePath.endsWith('.svelte');
  }
}

module.exports = SvelteStyleParser;