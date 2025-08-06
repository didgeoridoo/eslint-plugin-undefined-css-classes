const CSSClassExtractor = require('../utils/css-parser');
const TailwindDetector = require('../utils/tailwind-detector');
const {
  extractClassesFromJSXAttribute,
  extractClassesFromHTMLAttribute,
  extractClassesFromSvelteAttribute
} = require('../utils/class-extractor');

// Constants for magic strings
const CLASS_PREFIX_PATTERNS = {
  MODULE: 'module-',
  STYLES: 'styles-'
};

const DYNAMIC_CLASS_INDICATOR = '$';

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect undefined CSS classes in HTML/JSX',
      category: 'Possible Errors',
      recommended: true
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          cssFiles: {
            type: 'array',
            items: { type: 'string' },
            default: ['**/*.css']
          },
          excludePatterns: {
            type: 'array',
            items: { type: 'string' },
            default: ['**/node_modules/**']
          },
          ignoreTailwind: {
            type: 'boolean',
            default: true
          },
          requireTailwindConfig: {
            type: 'boolean',
            default: true
          },
          ignoreClassPatterns: {
            type: 'array',
            items: { type: 'string' },
            default: []
          },
          allowDynamicClasses: {
            type: 'boolean',
            default: true
          },
          baseDir: {
            type: 'string'
          },
          debug: {
            type: 'boolean',
            default: false
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      undefinedClass: "CSS class '{{className}}' is not defined in any CSS file",
      undefinedClasses: "CSS classes {{classNames}} are not defined in any CSS file"
    }
  },

  create(context) {
    const path = require('path');
    const options = context.options[0] || {};
    
    // Validate and sanitize baseDir to prevent path traversal
    const projectRoot = context.getCwd ? context.getCwd() : process.cwd();
    let baseDir = options.baseDir || projectRoot;
    
    // Enhanced path traversal protection
    // 1. Normalize the path to remove any . or .. segments
    baseDir = path.normalize(baseDir);
    
    // 2. Resolve to absolute path
    baseDir = path.resolve(projectRoot, baseDir);
    
    // 3. Normalize again after resolution to ensure consistency
    baseDir = path.normalize(baseDir);
    
    // 4. Check if resolved path is within project boundaries
    const normalizedProjectRoot = path.normalize(projectRoot);
    const relativePath = path.relative(normalizedProjectRoot, baseDir);
    
    // Ensure the path doesn't escape the project root
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      throw new Error(`Security Error: baseDir must be within project directory. Attempted path: ${baseDir}`);
    }
    
    // 5. Additional validation: ensure no null bytes or special characters
    if (baseDir.includes('\0')) {
      throw new Error('Security Error: baseDir contains invalid characters');
    }
    
    // Validate and sanitize ignoreClassPatterns
    let validatedPatterns = [];
    if (Array.isArray(options.ignoreClassPatterns)) {
      validatedPatterns = options.ignoreClassPatterns.filter(pattern => {
        if (typeof pattern !== 'string') return false;
        
        // Validate regex pattern for safety
        try {
          // Check for potential ReDoS patterns (basic check)
          if (pattern.includes('(') && pattern.includes('+') && pattern.includes('*')) {
            // Potentially dangerous nested quantifiers
            const nestedQuantifiers = /(\(.*[+*].*\)[+*])|([+*].*[+*])/;
            if (nestedQuantifiers.test(pattern)) {
              if (process.env.DEBUG) {
                process.stderr.write(`[DEBUG] Skipping potentially dangerous regex pattern: ${pattern}\n`);
              }
              return false;
            }
          }
          
          // Try to compile the regex with a timeout
          new RegExp(pattern);
          return true;
        } catch {
          if (process.env.DEBUG) {
            process.stderr.write(`[DEBUG] Invalid regex pattern skipped: ${pattern}\n`);
          }
          return false;
        }
      });
    }
    
    const config = {
      cssFiles: options.cssFiles || ['**/*.css'],
      excludePatterns: options.excludePatterns || ['**/node_modules/**'],
      ignoreTailwind: options.ignoreTailwind !== false,
      requireTailwindConfig: options.requireTailwindConfig === true,
      ignoreClassPatterns: validatedPatterns,
      allowDynamicClasses: options.allowDynamicClasses !== false,
      baseDir: baseDir,
      debug: options.debug || false
    };
    

    const cssExtractor = new CSSClassExtractor({
      cssFiles: config.cssFiles,
      excludePatterns: config.excludePatterns,
      baseDir: config.baseDir
    });

    const tailwindDetector = new TailwindDetector({
      projectRoot: config.baseDir
    });

    let definedClasses = null;
    let ignoreRegexes = null;

    const getDefinedClasses = () => {
      if (definedClasses === null) {
        definedClasses = new Set(cssExtractor.getAllDefinedClasses());
      }
      return definedClasses;
    };

    const getIgnoreRegexes = () => {
      if (ignoreRegexes === null) {
        ignoreRegexes = config.ignoreClassPatterns.map(pattern => {
          try {
            return new RegExp(pattern);
          } catch {
            return null;
          }
        }).filter(Boolean);
      }
      return ignoreRegexes;
    };

    const shouldIgnoreClass = (className) => {
      if (!className || typeof className !== 'string') {
        return true;
      }

      if (config.allowDynamicClasses && className.includes(DYNAMIC_CLASS_INDICATOR)) {
        return true;
      }

      if (config.ignoreTailwind) {
        if (tailwindDetector.shouldIgnoreClass(className, {
          ignoreTailwind: true,
          requireTailwindConfig: config.requireTailwindConfig
        })) {
          return true;
        }
      }

      const ignorePatterns = getIgnoreRegexes();
      if (ignorePatterns.some(regex => regex.test(className))) {
        return true;
      }

      if (className.startsWith(CLASS_PREFIX_PATTERNS.MODULE) || className.startsWith(CLASS_PREFIX_PATTERNS.STYLES)) {
        return true;
      }

      return false;
    };

    const checkClasses = (node, classes, attributeNode) => {
      const defined = getDefinedClasses();
      const undefinedClasses = [];

      classes.forEach(className => {
        if (!shouldIgnoreClass(className) && !defined.has(className)) {
          undefinedClasses.push(className);
        }
      });

      if (undefinedClasses.length > 0) {
        const reportNode = attributeNode || node;
        
        if (undefinedClasses.length === 1) {
          context.report({
            node: reportNode,
            messageId: 'undefinedClass',
            data: {
              className: undefinedClasses[0]
            }
          });
        } else {
          context.report({
            node: reportNode,
            messageId: 'undefinedClasses',
            data: {
              classNames: undefinedClasses.join(', ')
            }
          });
        }
      }
    };

    return {
      JSXAttribute(node) {
        if (node.name && (node.name.name === 'className' || node.name.name === 'class')) {
          const classes = extractClassesFromJSXAttribute(node);
          checkClasses(node, classes, node);
        }
      },

      VAttribute(node) {
        if (node.key && node.key.name && (node.key.name.name === 'class' || node.key.name.name === 'className')) {
          const classes = extractClassesFromHTMLAttribute(node);
          checkClasses(node, classes, node);
        }
      },

      // Support for Svelte components
      // Svelte parser generates SvelteAttribute nodes for attributes in Svelte templates
      SvelteAttribute(node) {
        
        // Check different possible structures for the class attribute name
        const isClassAttribute = 
          (node.key && node.key.name === 'class') ||
          (node.key && typeof node.key === 'object' && node.key.name === 'class') ||
          (node.name === 'class');
          
        if (isClassAttribute) {
          // Extract classes from Svelte attribute value
          const classes = extractClassesFromSvelteAttribute(node);
          
          checkClasses(node, classes, node);
        }
      },

      // Alternative handler for Svelte - some parsers may use regular Attribute nodes
      Attribute(node) {
        // Check if this is in a Svelte context and is a class attribute
        if (node.name === 'class' && node.value) {
          const classes = extractClassesFromSvelteAttribute(node);
          checkClasses(node, classes, node);
        }
      },

      AssignmentExpression(node) {
        if (
          node.left.type === 'MemberExpression' &&
          node.left.property &&
          (node.left.property.name === 'className' || node.left.property.name === 'classList')
        ) {
          if (node.right.type === 'Literal' && typeof node.right.value === 'string') {
            const classes = node.right.value.split(/\s+/).filter(Boolean);
            checkClasses(node, classes, node.right);
          }
        }
      },

      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.property &&
          node.callee.object &&
          node.callee.object.property &&
          node.callee.object.property.name === 'classList' &&
          (node.callee.property.name === 'add' || node.callee.property.name === 'toggle')
        ) {
          const classes = [];
          node.arguments.forEach(arg => {
            if (arg.type === 'Literal' && typeof arg.value === 'string') {
              classes.push(arg.value);
            }
          });
          checkClasses(node, classes, node);
        }
      }
    };
  }
};