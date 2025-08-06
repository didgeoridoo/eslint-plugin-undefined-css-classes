const {
  extractClassesFromString,
  extractClassesFromTemplateLiteral,
  extractClassesFromJSXAttribute,
  extractClassesFromHTMLAttribute
} = require('../../lib/utils/class-extractor');

describe('Class Extraction Utilities', () => {
  describe('extractClassesFromString', () => {
    test('extracts single class', () => {
      expect(extractClassesFromString('single-class')).toEqual(['single-class']);
    });

    test('extracts multiple classes', () => {
      expect(extractClassesFromString('class1 class2 class3')).toEqual(['class1', 'class2', 'class3']);
    });

    test('handles extra whitespace', () => {
      expect(extractClassesFromString('  class1   class2  ')).toEqual(['class1', 'class2']);
    });

    test('handles tabs and newlines', () => {
      expect(extractClassesFromString('class1\tclass2\nclass3')).toEqual(['class1', 'class2', 'class3']);
    });

    test('returns empty array for empty string', () => {
      expect(extractClassesFromString('')).toEqual([]);
    });

    test('returns empty array for null/undefined', () => {
      expect(extractClassesFromString(null)).toEqual([]);
      expect(extractClassesFromString(undefined)).toEqual([]);
    });

    test('returns empty array for non-string', () => {
      expect(extractClassesFromString(123)).toEqual([]);
      expect(extractClassesFromString({})).toEqual([]);
    });
  });

  describe('extractClassesFromTemplateLiteral', () => {
    test('extracts classes from template literal quasis', () => {
      const node = {
        type: 'TemplateLiteral',
        quasis: [
          { value: { cooked: 'class1 ', raw: 'class1 ' } },
          { value: { cooked: ' class2', raw: ' class2' } }
        ],
        expressions: []
      };
      
      expect(extractClassesFromTemplateLiteral(node)).toEqual(['class1', 'class2']);
    });

    test('extracts classes from literal expressions', () => {
      const node = {
        type: 'TemplateLiteral',
        quasis: [
          { value: { cooked: 'base ', raw: 'base ' } },
          { value: { cooked: '', raw: '' } }
        ],
        expressions: [
          { type: 'Literal', value: 'dynamic-class' }
        ]
      };
      
      expect(extractClassesFromTemplateLiteral(node)).toEqual(['base', 'dynamic-class']);
    });

    test('extracts classes from conditional expressions', () => {
      const node = {
        type: 'TemplateLiteral',
        quasis: [
          { value: { cooked: '', raw: '' } },
          { value: { cooked: '', raw: '' } }
        ],
        expressions: [
          {
            type: 'ConditionalExpression',
            consequent: { type: 'Literal', value: 'true-class' },
            alternate: { type: 'Literal', value: 'false-class' }
          }
        ]
      };
      
      expect(extractClassesFromTemplateLiteral(node)).toEqual(['true-class', 'false-class']);
    });

    test('handles missing cooked value', () => {
      const node = {
        type: 'TemplateLiteral',
        quasis: [
          { value: { raw: 'class1' } }
        ],
        expressions: []
      };
      
      expect(extractClassesFromTemplateLiteral(node)).toEqual(['class1']);
    });
  });

  describe('extractClassesFromJSXAttribute', () => {
    test('extracts from literal value', () => {
      const node = {
        value: {
          type: 'Literal',
          value: 'class1 class2'
        }
      };
      
      expect(extractClassesFromJSXAttribute(node)).toEqual(['class1', 'class2']);
    });

    test('extracts from JSXExpressionContainer with literal', () => {
      const node = {
        value: {
          type: 'JSXExpressionContainer',
          expression: {
            type: 'Literal',
            value: 'dynamic-class'
          }
        }
      };
      
      expect(extractClassesFromJSXAttribute(node)).toEqual(['dynamic-class']);
    });

    test('extracts from JSXExpressionContainer with template literal', () => {
      const node = {
        value: {
          type: 'JSXExpressionContainer',
          expression: {
            type: 'TemplateLiteral',
            quasis: [
              { value: { cooked: 'template-class', raw: 'template-class' } }
            ],
            expressions: []
          }
        }
      };
      
      expect(extractClassesFromJSXAttribute(node)).toEqual(['template-class']);
    });

    test('extracts from conditional expression', () => {
      const node = {
        value: {
          type: 'JSXExpressionContainer',
          expression: {
            type: 'ConditionalExpression',
            consequent: { type: 'Literal', value: 'true-class' },
            alternate: { type: 'Literal', value: 'false-class' }
          }
        }
      };
      
      expect(extractClassesFromJSXAttribute(node)).toEqual(['true-class', 'false-class']);
    });

    test('extracts from clsx/classNames call with string arguments', () => {
      const node = {
        value: {
          type: 'JSXExpressionContainer',
          expression: {
            type: 'CallExpression',
            callee: { name: 'clsx' },
            arguments: [
              { type: 'Literal', value: 'base-class' },
              { type: 'Literal', value: 'additional-class' }
            ]
          }
        }
      };
      
      expect(extractClassesFromJSXAttribute(node)).toEqual(['base-class', 'additional-class']);
    });

    test('extracts from clsx with object argument', () => {
      const node = {
        value: {
          type: 'JSXExpressionContainer',
          expression: {
            type: 'CallExpression',
            callee: { name: 'classNames' },
            arguments: [
              {
                type: 'ObjectExpression',
                properties: [
                  {
                    key: { type: 'Identifier', name: 'active' },
                    value: { type: 'Literal', value: true }
                  },
                  {
                    key: { type: 'Literal', value: 'hover:bg-blue' },
                    value: { type: 'Literal', value: true }
                  }
                ]
              }
            ]
          }
        }
      };
      
      expect(extractClassesFromJSXAttribute(node)).toEqual(['active', 'hover:bg-blue']);
    });

    test('extracts from cn (shadcn) helper', () => {
      const node = {
        value: {
          type: 'JSXExpressionContainer',
          expression: {
            type: 'CallExpression',
            callee: { name: 'cn' },
            arguments: [
              { type: 'Literal', value: 'base-class' }
            ]
          }
        }
      };
      
      expect(extractClassesFromJSXAttribute(node)).toEqual(['base-class']);
    });

    test('extracts from array expression in clsx', () => {
      const node = {
        value: {
          type: 'JSXExpressionContainer',
          expression: {
            type: 'CallExpression',
            callee: { name: 'clsx' },
            arguments: [
              {
                type: 'ArrayExpression',
                elements: [
                  { type: 'Literal', value: 'array-class-1' },
                  { type: 'Literal', value: 'array-class-2' },
                  null // sparse array
                ]
              }
            ]
          }
        }
      };
      
      expect(extractClassesFromJSXAttribute(node)).toEqual(['array-class-1', 'array-class-2']);
    });

    test('returns empty array for null node', () => {
      expect(extractClassesFromJSXAttribute(null)).toEqual([]);
    });

    test('returns empty array for node without value', () => {
      expect(extractClassesFromJSXAttribute({})).toEqual([]);
    });

    test('handles non-clsx call expressions', () => {
      const node = {
        value: {
          type: 'JSXExpressionContainer',
          expression: {
            type: 'CallExpression',
            callee: { name: 'someOtherFunction' },
            arguments: []
          }
        }
      };
      
      expect(extractClassesFromJSXAttribute(node)).toEqual([]);
    });
  });

  describe('extractClassesFromHTMLAttribute', () => {
    test('extracts from VLiteral value', () => {
      const node = {
        value: {
          type: 'VLiteral',
          value: 'vue-class-1 vue-class-2'
        }
      };
      
      expect(extractClassesFromHTMLAttribute(node)).toEqual(['vue-class-1', 'vue-class-2']);
    });

    test('extracts from VExpressionContainer with literal', () => {
      const node = {
        value: {
          type: 'VExpressionContainer',
          expression: {
            type: 'Literal',
            value: 'dynamic-vue-class'
          }
        }
      };
      
      expect(extractClassesFromHTMLAttribute(node)).toEqual(['dynamic-vue-class']);
    });

    test('extracts from VExpressionContainer with template literal', () => {
      const node = {
        value: {
          type: 'VExpressionContainer',
          expression: {
            type: 'TemplateLiteral',
            quasis: [
              { value: { cooked: 'vue-template', raw: 'vue-template' } }
            ],
            expressions: []
          }
        }
      };
      
      expect(extractClassesFromHTMLAttribute(node)).toEqual(['vue-template']);
    });

    test('returns empty array for null node', () => {
      expect(extractClassesFromHTMLAttribute(null)).toEqual([]);
    });

    test('returns empty array for node without value', () => {
      expect(extractClassesFromHTMLAttribute({})).toEqual([]);
    });

    test('handles null expression', () => {
      const node = {
        value: {
          type: 'VExpressionContainer',
          expression: null
        }
      };
      
      expect(extractClassesFromHTMLAttribute(node)).toEqual([]);
    });
  });
});