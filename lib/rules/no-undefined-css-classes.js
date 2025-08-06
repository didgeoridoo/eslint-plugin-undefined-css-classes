const CSSClassExtractor = require('../utils/css-parser');
const TailwindDetector = require('../utils/tailwind-detector');
const {
  extractClassesFromJSXAttribute,
  extractClassesFromHTMLAttribute,
  extractClassesFromSvelteAttribute
} = require('../utils/class-extractor');

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
    const options = context.options[0] || {};
    const config = {
      cssFiles: options.cssFiles || ['**/*.css'],
      excludePatterns: options.excludePatterns || ['**/node_modules/**'],
      ignoreTailwind: options.ignoreTailwind !== false,
      requireTailwindConfig: options.requireTailwindConfig !== false,
      ignoreClassPatterns: options.ignoreClassPatterns || [],
      allowDynamicClasses: options.allowDynamicClasses !== false,
      baseDir: options.baseDir || (context.getCwd ? context.getCwd() : process.cwd())
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

      if (config.allowDynamicClasses && className.includes('$')) {
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

      if (className.startsWith('module-') || className.startsWith('styles-')) {
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
        if (node.key && node.key.name === 'class') {
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