const extractClassesFromString = (classString) => {
  if (!classString || typeof classString !== 'string') {
    return [];
  }
  
  return classString
    .split(/\s+/)
    .filter(cls => cls.length > 0)
    .map(cls => cls.trim());
};

const extractClassesFromTemplateLiteral = (node) => {
  const classes = [];
  
  if (node.type === 'TemplateLiteral') {
    // Check if this is a dynamic template (has expressions)
    const hasDynamicParts = node.expressions && node.expressions.length > 0;
    
    node.quasis.forEach((quasi, index) => {
      const value = quasi.value.cooked || quasi.value.raw;
      const extractedClasses = extractClassesFromString(value);
      
      // If this quasi is followed by an expression and ends with a partial class
      // (e.g., "theme-" in `theme-${variant}`), mark it as dynamic
      if (hasDynamicParts && index < node.expressions.length && value && !value.endsWith(' ')) {
        // Check if the last extracted class looks incomplete
        if (extractedClasses.length > 0) {
          const lastClass = extractedClasses[extractedClasses.length - 1];
          if (lastClass && lastClass.match(/^[a-z-]+$/i)) {
            // Mark as dynamic by adding a $ indicator
            extractedClasses[extractedClasses.length - 1] = lastClass + '$dynamic';
          }
        }
      }
      
      classes.push(...extractedClasses);
    });
    
    node.expressions.forEach(expr => {
      if (expr.type === 'Literal' && typeof expr.value === 'string') {
        classes.push(...extractClassesFromString(expr.value));
      }
      
      if (expr.type === 'ConditionalExpression') {
        if (expr.consequent.type === 'Literal' && typeof expr.consequent.value === 'string') {
          classes.push(...extractClassesFromString(expr.consequent.value));
        }
        if (expr.alternate.type === 'Literal' && typeof expr.alternate.value === 'string') {
          classes.push(...extractClassesFromString(expr.alternate.value));
        }
      }
    });
  }
  
  return classes;
};

const extractClassesFromJSXAttribute = (node) => {
  const classes = [];
  
  if (!node || !node.value) {
    return classes;
  }
  
  if (node.value.type === 'Literal' && typeof node.value.value === 'string') {
    classes.push(...extractClassesFromString(node.value.value));
  }
  
  if (node.value.type === 'JSXExpressionContainer') {
    const expr = node.value.expression;
    
    if (expr.type === 'Literal' && typeof expr.value === 'string') {
      classes.push(...extractClassesFromString(expr.value));
    }
    
    if (expr.type === 'TemplateLiteral') {
      classes.push(...extractClassesFromTemplateLiteral(expr));
    }
    
    if (expr.type === 'ConditionalExpression') {
      // Recursively handle nested conditionals
      if (expr.consequent.type === 'Literal' && typeof expr.consequent.value === 'string') {
        classes.push(...extractClassesFromString(expr.consequent.value));
      } else if (expr.consequent.type === 'TemplateLiteral') {
        classes.push(...extractClassesFromTemplateLiteral(expr.consequent));
      } else if (expr.consequent.type === 'ConditionalExpression') {
        // Recursive call for nested conditionals
        const nestedNode = { value: { type: 'JSXExpressionContainer', expression: expr.consequent } };
        classes.push(...extractClassesFromJSXAttribute(nestedNode));
      }
      
      if (expr.alternate.type === 'Literal' && typeof expr.alternate.value === 'string') {
        classes.push(...extractClassesFromString(expr.alternate.value));
      } else if (expr.alternate.type === 'TemplateLiteral') {
        classes.push(...extractClassesFromTemplateLiteral(expr.alternate));
      } else if (expr.alternate.type === 'ConditionalExpression') {
        // Recursive call for nested conditionals
        const nestedNode = { value: { type: 'JSXExpressionContainer', expression: expr.alternate } };
        classes.push(...extractClassesFromJSXAttribute(nestedNode));
      }
    }
    
    if (expr.type === 'CallExpression' && expr.callee && (expr.callee.name === 'clsx' || expr.callee.name === 'classNames' || expr.callee.name === 'cn')) {
      expr.arguments.forEach(arg => {
        if (arg.type === 'Literal' && typeof arg.value === 'string') {
          classes.push(...extractClassesFromString(arg.value));
        }
        if (arg.type === 'TemplateLiteral') {
          classes.push(...extractClassesFromTemplateLiteral(arg));
        }
        if (arg.type === 'ObjectExpression') {
          arg.properties.forEach(prop => {
            if (prop.key && prop.key.type === 'Identifier') {
              classes.push(prop.key.name);
            }
            if (prop.key && prop.key.type === 'Literal' && typeof prop.key.value === 'string') {
              classes.push(...extractClassesFromString(prop.key.value));
            }
          });
        }
        if (arg.type === 'ArrayExpression') {
          arg.elements.forEach(elem => {
            if (elem && elem.type === 'Literal' && typeof elem.value === 'string') {
              classes.push(...extractClassesFromString(elem.value));
            }
          });
        }
      });
    }
  }
  
  return classes;
};

const extractClassesFromHTMLAttribute = (node) => {
  const classes = [];
  
  if (!node || !node.value) {
    return classes;
  }
  
  if (node.value.type === 'VLiteral') {
    classes.push(...extractClassesFromString(node.value.value));
  }
  
  if (node.value.type === 'VExpressionContainer') {
    const expr = node.value.expression;
    
    if (expr && expr.type === 'Literal' && typeof expr.value === 'string') {
      classes.push(...extractClassesFromString(expr.value));
    }
    
    if (expr && expr.type === 'TemplateLiteral') {
      classes.push(...extractClassesFromTemplateLiteral(expr));
    }
  }
  
  return classes;
};

const extractClassesFromSvelteAttribute = (node) => {
  const classes = [];
  
  // Handle different Svelte attribute value types
  if (node.value) {
    // For SvelteAttribute nodes from eslint-plugin-svelte
    if (Array.isArray(node.value)) {
      // Svelte attributes can have multiple value nodes (text and mustache tags)
      node.value.forEach(valueNode => {
        // Handle various node type names that different versions might use
        if (valueNode.type === 'SvelteText' || valueNode.type === 'Text' || 
            valueNode.type === 'SvelteLiteral' || valueNode.type === 'Literal') {
          // Plain text value - check multiple possible property names
          const textValue = valueNode.value || valueNode.data || valueNode.raw;
          if (textValue) {
            classes.push(...extractClassesFromString(textValue));
          }
        } else if (valueNode.type === 'SvelteMustacheTag' || valueNode.type === 'MustacheTag' ||
                   valueNode.type === 'SvelteMustacheTagText') {
          // Dynamic expression like {className}
          // Mark as dynamic but try to extract if it's a literal
          const expr = valueNode.expression || valueNode;
          if (expr) {
            if (expr.type === 'Literal' && typeof expr.value === 'string') {
              classes.push(...extractClassesFromString(expr.value));
            } else if (expr.type === 'TemplateLiteral') {
              classes.push(...extractClassesFromTemplateLiteral(expr));
            }
          }
        }
      });
    } else if (typeof node.value === 'string') {
      // Simple string value (some parsers may provide this)
      classes.push(...extractClassesFromString(node.value));
    } else if (node.value.type === 'Literal' && typeof node.value.value === 'string') {
      // Literal node value
      classes.push(...extractClassesFromString(node.value.value));
    } else if (node.value.value && typeof node.value.value === 'string') {
      // Nested value property
      classes.push(...extractClassesFromString(node.value.value));
    }
  }
  
  // Handle raw text if value is not available (for basic Attribute nodes)
  if (!node.value && node.raw) {
    // Extract classes from raw attribute value
    const match = node.raw.match(/class\s*=\s*["']([^"']+)["']/);
    if (match && match[1]) {
      classes.push(...extractClassesFromString(match[1]));
    }
  }
  
  return classes;
};

module.exports = {
  extractClassesFromString,
  extractClassesFromTemplateLiteral,
  extractClassesFromJSXAttribute,
  extractClassesFromHTMLAttribute,
  extractClassesFromSvelteAttribute
};