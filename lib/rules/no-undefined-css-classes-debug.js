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
    
    // Log immediately to confirm rule is being instantiated
    console.log('[DEBUG] no-undefined-css-classes-debug rule instantiated');
    console.log('[DEBUG] Config:', JSON.stringify(config, null, 2));
    console.log('[DEBUG] Context filename:', context.filename || context.getFilename?.());
    
    // Track what we've seen
    const seenNodeTypes = new Set();
    let nodeCount = 0;
    
    const logNode = (nodeType, node) => {
      nodeCount++;
      if (debug) {
        if (!seenNodeTypes.has(nodeType)) {
          seenNodeTypes.add(nodeType);
          console.log(`[DEBUG] Found new node type: ${nodeType} (total nodes seen: ${nodeCount})`);
        }
        
        // Always log attribute nodes in detail
        if (nodeType.includes('Attribute')) {
          // Create a safe object without circular references
          const safeNode = {
            type: node.type,
            name: node.name,
            key: node.key ? { 
              type: node.key?.type, 
              name: node.key?.name,
              raw: node.key?.raw
            } : undefined,
            value: Array.isArray(node.value) ? 
              node.value.map(v => ({ 
                type: v?.type, 
                value: v?.value, 
                raw: v?.raw, 
                data: v?.data 
              })) : 
              (node.value ? { 
                type: node.value?.type, 
                value: node.value?.value, 
                raw: node.value?.raw 
              } : node.value),
            boolean: node.boolean
          };
          
          try {
            console.log(`[DEBUG] ${nodeType} node #${nodeCount}:`, JSON.stringify(safeNode, null, 2));
          } catch (e) {
            console.log(`[DEBUG] ${nodeType} node #${nodeCount} (cannot stringify):`, safeNode);
          }
          
          // Check if it's a class attribute
          const isClassAttr = 
            (node.name === 'class') ||
            (node.key && node.key.name === 'class') ||
            (node.key && typeof node.key === 'string' && node.key === 'class');
          
          if (isClassAttr) {
            console.log(`[DEBUG] *** This is a CLASS attribute! ***`);
          }
        }
      }
    };

    // Create explicit handlers for known node types
    const handlers = {
      Program(node) {
        console.log('[DEBUG] Program node visited - rule is active!');
        logNode('Program', node);
      },
      
      SvelteAttribute(node) {
        console.log('[DEBUG] SvelteAttribute handler called!');
        logNode('SvelteAttribute', node);
      },
      
      SvelteElement(node) {
        logNode('SvelteElement', node);
      },
      
      SvelteStartTag(node) {
        logNode('SvelteStartTag', node);
      },
      
      SvelteLiteral(node) {
        logNode('SvelteLiteral', node);
      },
      
      SvelteName(node) {
        logNode('SvelteName', node);
      },
      
      SvelteText(node) {
        logNode('SvelteText', node);
      },
      
      SvelteMustacheTag(node) {
        logNode('SvelteMustacheTag', node);
      },
      
      // Also try regular attribute handlers
      Attribute(node) {
        console.log('[DEBUG] Attribute handler called!');
        logNode('Attribute', node);
      },
      
      JSXAttribute(node) {
        console.log('[DEBUG] JSXAttribute handler called!');
        logNode('JSXAttribute', node);
      },
      
      VAttribute(node) {
        console.log('[DEBUG] VAttribute handler called!');
        logNode('VAttribute', node);
      },
      
      // Catch-all for any identifiers (might help debug)
      Identifier(node) {
        if (node.name === 'class' || node.name === 'className') {
          console.log('[DEBUG] Found class-related Identifier:', node.name);
          logNode('Identifier', node);
        }
      },
      
      Literal(node) {
        // Log string literals that might be classes
        if (typeof node.value === 'string' && node.value.includes('fake-undefined-class')) {
          console.log('[DEBUG] Found literal with fake class:', node.value);
          logNode('Literal', node);
        }
      }
    };
    
    console.log('[DEBUG] Returning handlers object with', Object.keys(handlers).length, 'handlers');
    console.log('[DEBUG] Handler names:', Object.keys(handlers).join(', '));
    
    return handlers;
  }
};