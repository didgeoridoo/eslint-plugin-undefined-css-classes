const { RuleTester } = require('eslint');
const rule = require('../../lib/rules/no-undefined-css-classes');
const CSSClassExtractor = require('../../lib/utils/css-parser');
const { extractClassesFromJSXAttribute } = require('../../lib/utils/class-extractor');
const path = require('path');
const fs = require('fs');

describe('Error Handling and Edge Cases', () => {
  const testDir = path.join(__dirname, '../fixtures/error-test');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      files.forEach(file => fs.unlinkSync(path.join(testDir, file)));
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Malformed Input Handling', () => {
    test('handles null and undefined gracefully', () => {
      const node = null;
      expect(extractClassesFromJSXAttribute(node)).toEqual([]);
      
      const undefinedNode = undefined;
      expect(extractClassesFromJSXAttribute(undefinedNode)).toEqual([]);
    });

    test('handles non-standard node structures', () => {
      const weirdNode = {
        value: {
          type: 'UnknownType',
          someProperty: 'value'
        }
      };
      expect(extractClassesFromJSXAttribute(weirdNode)).toEqual([]);
    });

    test('handles deeply nested conditionals', () => {
      const node = {
        value: {
          type: 'JSXExpressionContainer',
          expression: {
            type: 'ConditionalExpression',
            consequent: {
              type: 'ConditionalExpression',
              consequent: { type: 'Literal', value: 'class1' },
              alternate: { type: 'Literal', value: 'class2' }
            },
            alternate: {
              type: 'ConditionalExpression',
              consequent: { type: 'Literal', value: 'class3' },
              alternate: { type: 'Literal', value: 'class4' }
            }
          }
        }
      };
      
      const classes = extractClassesFromJSXAttribute(node);
      expect(classes).toContain('class1');
      expect(classes).toContain('class2');
      expect(classes).toContain('class3');
      expect(classes).toContain('class4');
    });

    test('handles binary expressions gracefully', () => {
      const node = {
        value: {
          type: 'JSXExpressionContainer',
          expression: {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Literal', value: 'class' },
            right: { type: 'Literal', value: '-name' }
          }
        }
      };
      
      // Binary expressions are not supported, should return empty
      expect(extractClassesFromJSXAttribute(node)).toEqual([]);
    });

    test('handles logical expressions', () => {
      const node = {
        value: {
          type: 'JSXExpressionContainer',
          expression: {
            type: 'LogicalExpression',
            operator: '&&',
            left: { type: 'Identifier', name: 'condition' },
            right: { type: 'Literal', value: 'conditional-class' }
          }
        }
      };
      
      // We can't extract from logical expressions with identifiers
      expect(extractClassesFromJSXAttribute(node)).toEqual([]);
    });

    test('handles member expressions', () => {
      const node = {
        value: {
          type: 'JSXExpressionContainer',
          expression: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'styles' },
            property: { type: 'Identifier', name: 'container' }
          }
        }
      };
      
      // CSS modules are not extracted
      expect(extractClassesFromJSXAttribute(node)).toEqual([]);
    });
  });

  describe('Special Characters and Encoding', () => {
    test('handles unicode characters in class names', () => {
      const node = {
        value: {
          type: 'Literal',
          value: 'class-name-😀 класс-имя 中文类名'
        }
      };
      
      const classes = extractClassesFromJSXAttribute(node);
      expect(classes).toContain('class-name-😀');
      expect(classes).toContain('класс-имя');
      expect(classes).toContain('中文类名');
    });

    test('handles escaped quotes in strings', () => {
      const node = {
        value: {
          type: 'Literal',
          value: 'class-with-\\"quotes\\" another-class'
        }
      };
      
      const classes = extractClassesFromJSXAttribute(node);
      expect(classes.length).toBeGreaterThan(0);
    });

    test('handles newlines and tabs in class strings', () => {
      const node = {
        value: {
          type: 'Literal',
          value: 'class1\n\tclass2\r\nclass3'
        }
      };
      
      const classes = extractClassesFromJSXAttribute(node);
      expect(classes).toEqual(['class1', 'class2', 'class3']);
    });
  });

  describe('CSS Parser Error Handling', () => {
    test('handles CSS with syntax errors', () => {
      // PostCSS will stop parsing at severe syntax errors
      // So we test that it handles the error gracefully without crashing
      const cssWithErrors = `
        .valid-class { color: red; }
        .broken-class { 
          color: ;
          background
        }
      `;
      
      fs.writeFileSync(path.join(testDir, 'broken.css'), cssWithErrors);
      
      const extractor = new CSSClassExtractor({
        cssFiles: ['broken.css'],
        baseDir: testDir
      });
      
      // Should not throw, but may return empty array due to parse error
      expect(() => extractor.getAllDefinedClasses()).not.toThrow();
      const classes = extractor.getAllDefinedClasses();
      // PostCSS stops parsing at severe errors, so we just check it doesn't crash
      expect(Array.isArray(classes)).toBe(true);
    });

    test('handles empty CSS files', () => {
      fs.writeFileSync(path.join(testDir, 'empty.css'), '');
      
      const extractor = new CSSClassExtractor({
        cssFiles: ['empty.css'],
        baseDir: testDir
      });
      
      const classes = extractor.getAllDefinedClasses();
      expect(classes).toEqual([]);
    });

    test('handles CSS with only comments', () => {
      const cssWithComments = `
        /* This is a comment */
        // Another comment
        /* 
          Multi-line
          comment
        */
      `;
      
      fs.writeFileSync(path.join(testDir, 'comments.css'), cssWithComments);
      
      const extractor = new CSSClassExtractor({
        cssFiles: ['comments.css'],
        baseDir: testDir
      });
      
      const classes = extractor.getAllDefinedClasses();
      expect(classes).toEqual([]);
    });

    test('handles circular @import statements gracefully', () => {
      // Note: PostCSS doesn't process @imports by default, so this is safe
      const css1 = `
        @import 'file2.css';
        .class1 { color: red; }
      `;
      const css2 = `
        @import 'file1.css';
        .class2 { color: blue; }
      `;
      
      fs.writeFileSync(path.join(testDir, 'file1.css'), css1);
      fs.writeFileSync(path.join(testDir, 'file2.css'), css2);
      
      const extractor = new CSSClassExtractor({
        cssFiles: ['*.css'],
        baseDir: testDir
      });
      
      const classes = extractor.getAllDefinedClasses();
      expect(classes).toContain('class1');
      expect(classes).toContain('class2');
    });
  });

  describe('Complex Class Name Patterns', () => {
    test('handles CSS modules naming patterns', () => {
      const cssModule = `
        .container_abc123 { width: 100%; }
        .button__primary--large { padding: 20px; }
        ._private-class { display: none; }
        .Component-root-3f4g5 { margin: 0; }
      `;
      
      fs.writeFileSync(path.join(testDir, 'module.css'), cssModule);
      
      const extractor = new CSSClassExtractor({
        cssFiles: ['module.css'],
        baseDir: testDir
      });
      
      const classes = extractor.getAllDefinedClasses();
      expect(classes).toContain('container_abc123');
      expect(classes).toContain('button__primary--large');
      expect(classes).toContain('_private-class');
      expect(classes).toContain('Component-root-3f4g5');
    });

    test('handles attribute selectors that look like classes', () => {
      const css = `
        [class*="btn-"] { cursor: pointer; }
        [class^="col-"] { float: left; }
        [class$="-active"] { background: blue; }
        [class~="selected"] { border: 2px solid; }
        .real-class { color: red; }
      `;
      
      fs.writeFileSync(path.join(testDir, 'attributes.css'), css);
      
      const extractor = new CSSClassExtractor({
        cssFiles: ['attributes.css'],
        baseDir: testDir
      });
      
      const classes = extractor.getAllDefinedClasses();
      // Should only extract actual class selectors
      expect(classes).toContain('real-class');
      expect(classes).not.toContain('btn-');
      expect(classes).not.toContain('col-');
    });

    test('handles pseudo-element and pseudo-class combinations', () => {
      const css = `
        .button:hover::before { content: "→"; }
        .input:focus:not(:disabled) { outline: blue; }
        .list > li:nth-child(odd):not(.excluded) { background: gray; }
        .complex:is(.active, .selected):where(.visible) { display: block; }
      `;
      
      fs.writeFileSync(path.join(testDir, 'pseudo.css'), css);
      
      const extractor = new CSSClassExtractor({
        cssFiles: ['pseudo.css'],
        baseDir: testDir
      });
      
      const classes = extractor.getAllDefinedClasses();
      expect(classes).toContain('button');
      expect(classes).toContain('input');
      expect(classes).toContain('list');
      expect(classes).toContain('excluded');
      expect(classes).toContain('complex');
      expect(classes).toContain('active');
      expect(classes).toContain('selected');
      expect(classes).toContain('visible');
    });
  });

  describe('Performance Edge Cases', () => {
    test('handles very long class names', () => {
      const longClassName = 'a'.repeat(1000);
      const node = {
        value: {
          type: 'Literal',
          value: longClassName
        }
      };
      
      const classes = extractClassesFromJSXAttribute(node);
      expect(classes).toContain(longClassName);
    });

    test('handles many classes in single attribute', () => {
      const manyClasses = Array.from({ length: 1000 }, (_, i) => `class-${i}`).join(' ');
      const node = {
        value: {
          type: 'Literal',
          value: manyClasses
        }
      };
      
      const classes = extractClassesFromJSXAttribute(node);
      expect(classes).toHaveLength(1000);
      expect(classes[0]).toBe('class-0');
      expect(classes[999]).toBe('class-999');
    });

    test('handles deeply nested CSS selectors', () => {
      const deepNesting = `
        .level1 {
          .level2 {
            .level3 {
              .level4 {
                .level5 {
                  .level6 {
                    .level7 {
                      .level8 {
                        .level9 {
                          .level10 { color: red; }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;
      
      fs.writeFileSync(path.join(testDir, 'nested.css'), deepNesting);
      
      const extractor = new CSSClassExtractor({
        cssFiles: ['nested.css'],
        baseDir: testDir
      });
      
      const classes = extractor.getAllDefinedClasses();
      // Should extract all levels
      for (let i = 1; i <= 10; i++) {
        expect(classes).toContain(`level${i}`);
      }
    });
  });

  describe('ESLint Rule Edge Cases', () => {
    const ruleTester = new RuleTester({
      languageOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        parserOptions: {
          ecmaFeatures: { jsx: true }
        }
      }
    });

    // Create a simple CSS file for tests
    beforeAll(() => {
      fs.writeFileSync(path.join(testDir, 'test.css'), '.defined { color: red; }');
    });

    ruleTester.run('edge cases', rule, {
      valid: [
        {
          code: '<div className={undefined}>Test</div>',
          options: [{ baseDir: testDir }]
        },
        {
          code: '<div className={null}>Test</div>',
          options: [{ baseDir: testDir }]
        },
        {
          code: '<div className="">Test</div>',
          options: [{ baseDir: testDir }]
        },
        {
          code: '<div className={false && "some-class"}>Test</div>',
          options: [{ baseDir: testDir }]
        },
        {
          code: '<div className={someVariable}>Test</div>',
          options: [{ baseDir: testDir }]
        },
        {
          code: '<div className={styles.container}>Test</div>',
          options: [{ baseDir: testDir }]
        },
        {
          code: '<div className={`${styles.container} defined`}>Test</div>',
          options: [{ baseDir: testDir, cssFiles: ['test.css'] }]
        }
      ],
      invalid: [
        {
          code: '<div className="undefined-class">Test</div>',
          options: [{ baseDir: testDir, cssFiles: ['test.css'] }],
          errors: [{ messageId: 'undefinedClass' }]
        },
        {
          code: '<div className="  undefined-class  ">Test</div>',
          options: [{ baseDir: testDir, cssFiles: ['test.css'] }],
          errors: [{ messageId: 'undefinedClass' }]
        },
        {
          code: '<div className={`undefined-class`}>Test</div>',
          options: [{ baseDir: testDir, cssFiles: ['test.css'] }],
          errors: [{ messageId: 'undefinedClass' }]
        }
      ]
    });
  });
});