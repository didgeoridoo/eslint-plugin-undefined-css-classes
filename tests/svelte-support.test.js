const { RuleTester } = require('eslint');
const rule = require('../lib/rules/no-undefined-css-classes');
const path = require('path');
const fs = require('fs');

// Note: For actual Svelte testing, you would need eslint-plugin-svelte installed
// This test simulates the AST nodes that Svelte parser would generate

describe('Svelte Support', () => {
  const testCSSDir = path.join(__dirname, 'fixtures');
  const testCSSFile = path.join(testCSSDir, 'svelte-test.css');

  beforeAll(() => {
    if (!fs.existsSync(testCSSDir)) {
      fs.mkdirSync(testCSSDir, { recursive: true });
    }
    fs.writeFileSync(testCSSFile, `
      .defined-class { color: red; }
      .btn { padding: 10px; }
      .container { width: 100%; }
      .font-display { font-family: serif; }
    `);
  });

  afterAll(() => {
    if (fs.existsSync(testCSSFile)) {
      fs.unlinkSync(testCSSFile);
    }
  });

  describe('SvelteAttribute node handling', () => {
    test('extracts classes from Svelte attributes with text values', () => {
      const { extractClassesFromSvelteAttribute } = require('../lib/utils/class-extractor');
      
      // Simulate a SvelteAttribute node with text value
      const node = {
        key: { name: 'class' },
        value: [
          { type: 'SvelteText', value: 'container btn defined-class' }
        ]
      };
      
      const classes = extractClassesFromSvelteAttribute(node);
      expect(classes).toEqual(['container', 'btn', 'defined-class']);
    });

    test('extracts classes from Svelte attributes with mustache tags', () => {
      const { extractClassesFromSvelteAttribute } = require('../lib/utils/class-extractor');
      
      // Simulate a SvelteAttribute with dynamic content
      const node = {
        key: { name: 'class' },
        value: [
          { type: 'SvelteText', value: 'static-class ' },
          { 
            type: 'SvelteMustacheTag',
            expression: {
              type: 'Literal',
              value: 'dynamic-class'
            }
          }
        ]
      };
      
      const classes = extractClassesFromSvelteAttribute(node);
      expect(classes).toContain('static-class');
      expect(classes).toContain('dynamic-class');
    });

    test('handles mixed static and dynamic classes', () => {
      const { extractClassesFromSvelteAttribute } = require('../lib/utils/class-extractor');
      
      const node = {
        key: { name: 'class' },
        value: [
          { type: 'Text', data: 'container ' },
          { 
            type: 'MustacheTag',
            expression: {
              type: 'ConditionalExpression',
              consequent: { type: 'Literal', value: 'active' },
              alternate: { type: 'Literal', value: 'inactive' }
            }
          },
          { type: 'Text', data: ' btn' }
        ]
      };
      
      const classes = extractClassesFromSvelteAttribute(node);
      expect(classes).toContain('container');
      expect(classes).toContain('btn');
    });

    test('handles string value directly', () => {
      const { extractClassesFromSvelteAttribute } = require('../lib/utils/class-extractor');
      
      // Some parsers might provide string directly
      const node = {
        name: 'class',
        value: 'foo bar baz'
      };
      
      const classes = extractClassesFromSvelteAttribute(node);
      expect(classes).toEqual(['foo', 'bar', 'baz']);
    });

    test('handles Literal node value', () => {
      const { extractClassesFromSvelteAttribute } = require('../lib/utils/class-extractor');
      
      const node = {
        name: 'class',
        value: {
          type: 'Literal',
          value: 'class1 class2'
        }
      };
      
      const classes = extractClassesFromSvelteAttribute(node);
      expect(classes).toEqual(['class1', 'class2']);
    });
  });

  describe('Rule integration with Svelte', () => {
    const ruleTester = new RuleTester({
      languageOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      }
    });

    // These tests simulate what would happen if eslint-plugin-svelte was installed
    // In real usage, the user would need to install and configure eslint-plugin-svelte
    
    describe('simulated Svelte AST', () => {
      test('validates that Attribute handler is available', () => {
        const create = rule.create({
          options: [{
            cssFiles: ['*.css'],
            baseDir: testCSSDir
          }]
        });
        
        expect(create.Attribute).toBeDefined();
        expect(create.SvelteAttribute).toBeDefined();
      });
    });
  });

  describe('Documentation examples', () => {
    test('user reported case should work with proper parser', () => {
      const { extractClassesFromSvelteAttribute } = require('../lib/utils/class-extractor');
      
      // Simulate the user's reported case
      const node1 = {
        name: 'class',
        value: 'relative overflow-hidden bg-primary pt-32 pb-16'
      };
      
      const node2 = {
        name: 'class',
        value: 'relative z-10 container mx-auto px-4 text-center fake-undefined-class-test'
      };
      
      const node3 = {
        name: 'class',
        value: 'font-display mx-auto mb-4 another-fake-class'
      };
      
      const classes1 = extractClassesFromSvelteAttribute(node1);
      const classes2 = extractClassesFromSvelteAttribute(node2);
      const classes3 = extractClassesFromSvelteAttribute(node3);
      
      expect(classes2).toContain('fake-undefined-class-test');
      expect(classes3).toContain('another-fake-class');
      
      // These would be caught as undefined if the CSS doesn't define them
      expect(classes2.includes('fake-undefined-class-test')).toBe(true);
      expect(classes3.includes('another-fake-class')).toBe(true);
    });
  });
});