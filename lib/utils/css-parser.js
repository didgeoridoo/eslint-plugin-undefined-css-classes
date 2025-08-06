const fs = require('fs');
const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');
const glob = require('glob');

class CSSClassExtractor {
  constructor(options = {}) {
    this.cssFiles = options.cssFiles || ['**/*.css'];
    this.excludePatterns = options.excludePatterns || ['**/node_modules/**'];
    this.baseDir = options.baseDir || process.cwd();
    this.cache = new Map();
  }

  extractClassesFromSelector(selector) {
    const classes = new Set();
    
    try {
      selectorParser((selectors) => {
        selectors.walkClasses((classNode) => {
          classes.add(classNode.value);
        });
      }).processSync(selector);
    } catch (error) {
      console.warn(`Failed to parse selector: ${selector}`, error.message);
    }
    
    return Array.from(classes);
  }

  extractClassesFromCSS(cssContent, filePath) {
    const classes = new Set();
    
    try {
      const root = postcss.parse(cssContent, { from: filePath });
      
      root.walkRules((rule) => {
        const selectorClasses = this.extractClassesFromSelector(rule.selector);
        selectorClasses.forEach(cls => classes.add(cls));
      });
      
      root.walkAtRules('keyframes', (rule) => {
        classes.add(rule.params);
      });
      
      root.walkAtRules('supports', (rule) => {
        rule.walkRules((innerRule) => {
          const selectorClasses = this.extractClassesFromSelector(innerRule.selector);
          selectorClasses.forEach(cls => classes.add(cls));
        });
      });
      
      root.walkAtRules('media', (rule) => {
        rule.walkRules((innerRule) => {
          const selectorClasses = this.extractClassesFromSelector(innerRule.selector);
          selectorClasses.forEach(cls => classes.add(cls));
        });
      });
    } catch (error) {
      console.warn(`Failed to parse CSS file: ${filePath}`, error.message);
    }
    
    return Array.from(classes);
  }

  findCSSFiles() {
    const files = [];
    
    this.cssFiles.forEach(pattern => {
      const matches = glob.sync(pattern, {
        cwd: this.baseDir,
        ignore: this.excludePatterns,
        absolute: true
      });
      files.push(...matches);
    });
    
    return [...new Set(files)];
  }

  getAllDefinedClasses() {
    const cacheKey = `${this.baseDir}-${this.cssFiles.join(',')}-${this.excludePatterns.join(',')}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const allClasses = new Set();
    const cssFiles = this.findCSSFiles();
    
    cssFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const classes = this.extractClassesFromCSS(content, filePath);
        classes.forEach(cls => allClasses.add(cls));
      } catch (error) {
        console.warn(`Failed to read CSS file: ${filePath}`, error.message);
      }
    });
    
    const result = Array.from(allClasses);
    this.cache.set(cacheKey, result);
    
    return result;
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = CSSClassExtractor;