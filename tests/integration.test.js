const { ESLint } = require('eslint');
const path = require('path');
const fs = require('fs');

describe('Integration Tests', () => {
  const fixturesDir = path.join(__dirname, 'fixtures/integration');
  let eslint;

  beforeAll(() => {
    // Create test fixtures
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // Create CSS file
    fs.writeFileSync(path.join(fixturesDir, 'styles.css'), `
      .defined-class { color: blue; }
      .btn { padding: 10px; }
      .btn-primary { background: blue; }
      .container { width: 100%; }
    `);

    // Create tailwind.config.js for Tailwind detection test
    fs.writeFileSync(path.join(fixturesDir, 'tailwind.config.js'), `
      module.exports = {
        content: ['./src/**/*.{js,jsx}'],
        theme: { extend: {} },
        plugins: []
      }
    `);

    // Initialize ESLint
    eslint = new ESLint({
      useEslintrc: false,
      baseConfig: {
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: { jsx: true }
        },
        plugins: ['undefined-css-classes'],
        rules: {
          'undefined-css-classes/no-undefined-css-classes': ['error', {
            cssFiles: ['*.css'],
            baseDir: fixturesDir,
            ignoreTailwind: true,
            requireTailwindConfig: true
          }]
        }
      }
    });
  });

  afterAll(() => {
    // Clean up
    const files = fs.readdirSync(fixturesDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(fixturesDir, file));
    });
    fs.rmdirSync(fixturesDir);
  });

  test('detects undefined classes in JSX', async () => {
    const code = `
      import React from 'react';
      
      function Component() {
        return (
          <div className="container">
            <button className="btn btn-primary">Valid</button>
            <button className="btn btn-danger">Invalid</button>
            <span className="undefined-class">Error</span>
          </div>
        );
      }
    `;

    const filePath = path.join(fixturesDir, 'test.jsx');
    fs.writeFileSync(filePath, code);

    const results = await eslint.lintFiles([filePath]);
    const messages = results[0].messages;

    expect(messages).toHaveLength(2);
    expect(messages[0].message).toContain('btn-danger');
    expect(messages[1].message).toContain('undefined-class');

    fs.unlinkSync(filePath);
  });

  test('ignores Tailwind classes when config exists', async () => {
    const code = `
      import React from 'react';
      
      function Component() {
        return (
          <div className="flex items-center justify-between p-4">
            <span className="text-blue-500 hover:text-blue-700">Tailwind</span>
            <button className="bg-red-500 undefined-class">Mixed</button>
          </div>
        );
      }
    `;

    const filePath = path.join(fixturesDir, 'tailwind-test.jsx');
    fs.writeFileSync(filePath, code);

    const results = await eslint.lintFiles([filePath]);
    const messages = results[0].messages;

    // Should only report undefined-class, not Tailwind classes
    expect(messages).toHaveLength(1);
    expect(messages[0].message).toContain('undefined-class');

    fs.unlinkSync(filePath);
  });

  test('handles dynamic classes with template literals', async () => {
    const code = `
      import React from 'react';
      
      function Component({ variant, size }) {
        return (
          <div className={\`container \${variant}\`}>
            <button className={\`btn btn-\${size}\`}>Dynamic</button>
          </div>
        );
      }
    `;

    const filePath = path.join(fixturesDir, 'dynamic-test.jsx');
    fs.writeFileSync(filePath, code);

    const eslintWithDynamic = new ESLint({
      useEslintrc: false,
      baseConfig: {
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: { jsx: true }
        },
        plugins: ['undefined-css-classes'],
        rules: {
          'undefined-css-classes/no-undefined-css-classes': ['error', {
            cssFiles: ['*.css'],
            baseDir: fixturesDir,
            allowDynamicClasses: true
          }]
        }
      }
    });

    const results = await eslintWithDynamic.lintFiles([filePath]);
    const messages = results[0].messages;

    // Dynamic classes should be allowed
    expect(messages).toHaveLength(0);

    fs.unlinkSync(filePath);
  });

  test('works with clsx and classNames utilities', async () => {
    const code = `
      import React from 'react';
      import clsx from 'clsx';
      
      function Component({ isActive }) {
        return (
          <div className={clsx(
            'container',
            'defined-class',
            {
              'active-class': isActive,
              'btn-primary': true
            }
          )}>
            Content
          </div>
        );
      }
    `;

    const filePath = path.join(fixturesDir, 'clsx-test.jsx');
    fs.writeFileSync(filePath, code);

    const results = await eslint.lintFiles([filePath]);
    const messages = results[0].messages;

    // Should only report active-class as undefined
    expect(messages).toHaveLength(1);
    expect(messages[0].message).toContain('active-class');

    fs.unlinkSync(filePath);
  });

  test('respects ignore patterns', async () => {
    const code = `
      import React from 'react';
      
      function Component() {
        return (
          <div className="container custom-ignored legacy-class">
            <span className="undefined-class">Text</span>
          </div>
        );
      }
    `;

    const filePath = path.join(fixturesDir, 'ignore-test.jsx');
    fs.writeFileSync(filePath, code);

    const eslintWithIgnore = new ESLint({
      useEslintrc: false,
      baseConfig: {
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: { jsx: true }
        },
        plugins: ['undefined-css-classes'],
        rules: {
          'undefined-css-classes/no-undefined-css-classes': ['error', {
            cssFiles: ['*.css'],
            baseDir: fixturesDir,
            ignoreClassPatterns: ['^custom-', '^legacy-']
          }]
        }
      }
    });

    const results = await eslintWithIgnore.lintFiles([filePath]);
    const messages = results[0].messages;

    // Should only report undefined-class, not the ignored patterns
    expect(messages).toHaveLength(1);
    expect(messages[0].message).toContain('undefined-class');

    fs.unlinkSync(filePath);
  });

  test('handles multiple CSS files', async () => {
    // Create additional CSS file
    fs.writeFileSync(path.join(fixturesDir, 'components.css'), `
      .card { border: 1px solid #ddd; }
      .card-header { font-weight: bold; }
      .card-body { padding: 1rem; }
    `);

    const code = `
      import React from 'react';
      
      function Component() {
        return (
          <div className="container card">
            <div className="card-header">Header</div>
            <div className="card-body">Body</div>
            <div className="card-footer">Footer</div>
          </div>
        );
      }
    `;

    const filePath = path.join(fixturesDir, 'multi-css-test.jsx');
    fs.writeFileSync(filePath, code);

    const results = await eslint.lintFiles([filePath]);
    const messages = results[0].messages;

    // Should only report card-footer as undefined
    expect(messages).toHaveLength(1);
    expect(messages[0].message).toContain('card-footer');

    fs.unlinkSync(filePath);
    fs.unlinkSync(path.join(fixturesDir, 'components.css'));
  });
});