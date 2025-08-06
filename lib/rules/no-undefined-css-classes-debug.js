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
      description: 'Detect undefined CSS classes in HTML/JSX/Svelte (DEBUG VERSION)',
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
          debug: {
            type: 'boolean',
            default: false
          }
        },
        additionalProperties: true
      }
    ],
    messages: {
      undefinedClass: "CSS class '{{className}}' is not defined in any CSS file",
      undefinedClasses: "CSS classes {{classNames}} are not defined in any CSS file"
    }
  },

  create(context) {
    const config = context.options[0] || {};
    const debug = config.debug !== false; // Default to true for debug version
    
    // Log all node types we receive
    const seenNodeTypes = new Set();
    
    const logNode = (nodeType, node) => {
      if (debug && !seenNodeTypes.has(nodeType)) {
        seenNodeTypes.add(nodeType);
        console.log(`[DEBUG] Found node type: ${nodeType}`);
        
        // Log node structure for class-related nodes
        if (nodeType.toLowerCase().includes('attribute') || 
            (node && node.name && (node.name === 'class' || node.name === 'className')) ||
            (node && node.key && node.key.name && (node.key.name === 'class' || node.key.name === 'className'))) {
          console.log(`[DEBUG] Node structure for ${nodeType}:`, JSON.stringify({
            type: node.type,
            name: node.name,
            key: node.key ? { 
              type: node.key.type, 
              name: node.key.name,
              raw: node.key.raw
            } : undefined,
            value: Array.isArray(node.value) ? 
              node.value.map(v => ({ type: v.type, value: v.value, raw: v.raw, data: v.data })) : 
              (node.value ? { type: node.value?.type, value: node.value?.value, raw: node.value?.raw } : node.value),
            boolean: node.boolean
          }, null, 2));
        }
      }
    };

    // Create a universal handler that logs everything
    const universalHandler = new Proxy({}, {
      get(target, prop) {
        if (typeof prop === 'string' && prop[0] === prop[0].toUpperCase()) {
          return (node) => {
            logNode(prop, node);
            
            // Try to handle class attributes regardless of node type
            if (prop.includes('Attribute')) {
              const isClassAttr = 
                (node.name && (node.name === 'class' || node.name === 'className')) ||
                (node.key && node.key.name && (node.key.name === 'class' || node.key.name === 'className')) ||
                (node.key && typeof node.key === 'string' && node.key === 'class');
              
              if (isClassAttr) {
                console.log(`[DEBUG] Found class attribute in ${prop} node`);
                console.log(`[DEBUG] Full node:`, JSON.stringify(node, null, 2));
              }
            }
          };
        }
      }
    });

    return universalHandler;
  }
};