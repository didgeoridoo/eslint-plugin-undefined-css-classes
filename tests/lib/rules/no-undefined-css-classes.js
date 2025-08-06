const { RuleTester } = require('eslint');
const rule = require('../../lib/rules/no-undefined-css-classes');
const path = require('path');
const fs = require('fs');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: {
        jsx: true
      }
    }
  }
});

// Create test fixtures directory and CSS file before running tests
const testCSSDir = path.join(__dirname, '../fixtures');
const testCSSFile = path.join(testCSSDir, 'test.css');

// Setup function to create test fixtures
function setupTestFixtures() {
  if (!fs.existsSync(testCSSDir)) {
    fs.mkdirSync(testCSSDir, { recursive: true });
  }

  fs.writeFileSync(testCSSFile, `
.defined-class { color: red; }
.another-defined { color: blue; }
.btn-primary { background: blue; }
.container { width: 100%; }

@media (min-width: 768px) {
  .responsive-class { display: block; }
}

@keyframes slide-in {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
`);
}

// Call setup before tests
setupTestFixtures();

ruleTester.run('no-undefined-css-classes', rule, {
  valid: [
    {
      code: '<div className="defined-class">Test</div>',
      options: [{ baseDir: path.join(__dirname, '../fixtures') }]
    },
    {
      code: '<div className="defined-class another-defined">Test</div>',
      options: [{ baseDir: path.join(__dirname, '../fixtures') }]
    },
    {
      code: '<div className="flex items-center">Test</div>',
      options: [{ ignoreTailwind: true, requireTailwindConfig: false }]
    },
    {
      code: '<div className="bg-blue-500 hover:bg-blue-700">Test</div>',
      options: [{ ignoreTailwind: true, requireTailwindConfig: false }]
    },
    {
      code: '<div className="w-[100px] h-[200px]">Test</div>',
      options: [{ ignoreTailwind: true, requireTailwindConfig: false }]
    },
    {
      code: '<div className={`defined-class ${condition ? "another-defined" : "btn-primary"}`}>Test</div>',
      options: [{ baseDir: path.join(__dirname, '../fixtures') }]
    },
    {
      code: '<div className="responsive-class">Test</div>',
      options: [{ baseDir: path.join(__dirname, '../fixtures') }]
    },
    {
      code: 'element.classList.add("defined-class")',
      options: [{ baseDir: path.join(__dirname, '../fixtures') }]
    },
    {
      code: '<div className="custom-${variant}">Test</div>',
      options: [{ allowDynamicClasses: true }]
    },
    {
      code: '<div className="ignored-class">Test</div>',
      options: [{ ignoreClassPatterns: ['^ignored-'] }]
    }
  ],

  invalid: [
    {
      code: '<div className="undefined-class">Test</div>',
      options: [{ baseDir: path.join(__dirname, '../fixtures') }],
      errors: [{
        messageId: 'undefinedClass',
        data: { className: 'undefined-class' }
      }]
    },
    {
      code: '<div className="defined-class undefined-one undefined-two">Test</div>',
      options: [{ baseDir: path.join(__dirname, '../fixtures') }],
      errors: [{
        messageId: 'undefinedClasses',
        data: { classNames: 'undefined-one, undefined-two' }
      }]
    },
    {
      code: '<div className="not-tailwind-class">Test</div>',
      options: [{ 
        baseDir: path.join(__dirname, '../fixtures'),
        ignoreTailwind: true,
        requireTailwindConfig: false
      }],
      errors: [{
        messageId: 'undefinedClass',
        data: { className: 'not-tailwind-class' }
      }]
    },
    {
      code: 'element.classList.add("undefined-class")',
      options: [{ baseDir: path.join(__dirname, '../fixtures') }],
      errors: [{
        messageId: 'undefinedClass',
        data: { className: 'undefined-class' }
      }]
    },
    {
      code: 'element.className = "undefined-class another-undefined"',
      options: [{ baseDir: path.join(__dirname, '../fixtures') }],
      errors: [{
        messageId: 'undefinedClasses',
        data: { classNames: 'undefined-class, another-undefined' }
      }]
    },
    {
      code: '<div className="flex items-center">Test</div>',
      options: [{ 
        baseDir: path.join(__dirname, '../fixtures'),
        ignoreTailwind: false
      }],
      errors: [{
        messageId: 'undefinedClasses',
        data: { classNames: 'flex, items-center' }
      }]
    }
  ]
});

// Cleanup after tests
afterAll(() => {
  if (fs.existsSync(testCSSFile)) {
    fs.unlinkSync(testCSSFile);
  }
  if (fs.existsSync(testCSSDir)) {
    fs.rmSync(testCSSDir, { recursive: true, force: true });
  }
});