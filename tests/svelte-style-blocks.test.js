const fs = require('fs');
const path = require('path');
const os = require('os');
const { ESLint } = require('eslint');
const plugin = require('../lib/index.js');
const SvelteStyleParser = require('../lib/utils/svelte-style-parser');

describe('Svelte Style Block Support', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svelte-style-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('SvelteStyleParser', () => {
    const parser = new SvelteStyleParser();

    test('should extract classes from simple style block', () => {
      const source = `
        <div class="navigation-root">
          Hello
        </div>
        
        <style>
          .navigation-root {
            position: relative;
          }
        </style>
      `;

      const classes = parser.extractStyleBlockClasses(source);
      expect(classes.has('navigation-root')).toBe(true);
    });

    test('should extract multiple classes from style block', () => {
      const source = `
        <div class="nav-wrapper">
          <a class="nav-link">
            <span class="badge">2</span>
            <svg class="dropdown-arrow">
          </a>
        </div>
        
        <style>
          .nav-wrapper {
            position: relative;
          }
          
          .nav-link {
            display: inline-flex;
          }
          
          .badge {
            display: inline-flex;
          }
          
          .dropdown-arrow {
            transition: transform 0.2s ease;
          }
        </style>
      `;

      const classes = parser.extractStyleBlockClasses(source);
      expect(classes.has('nav-wrapper')).toBe(true);
      expect(classes.has('nav-link')).toBe(true);
      expect(classes.has('badge')).toBe(true);
      expect(classes.has('dropdown-arrow')).toBe(true);
    });

    test('should handle style blocks with lang attribute', () => {
      const source = `
        <div class="scss-class"></div>
        
        <style lang="scss">
          .scss-class {
            color: red;
            
            &:hover {
              color: blue;
            }
          }
        </style>
      `;

      const classes = parser.extractStyleBlockClasses(source);
      expect(classes.has('scss-class')).toBe(true);
    });

    test('should handle nested selectors', () => {
      const source = `
        <style>
          .parent {
            .child {
              color: red;
            }
          }
          
          .wrapper > .item {
            display: block;
          }
        </style>
      `;

      const classes = parser.extractStyleBlockClasses(source);
      expect(classes.has('parent')).toBe(true);
      expect(classes.has('child')).toBe(true);
      expect(classes.has('wrapper')).toBe(true);
      expect(classes.has('item')).toBe(true);
    });

    test('should handle pseudo-classes and pseudo-elements', () => {
      const source = `
        <style>
          .button:hover {
            background: blue;
          }
          
          .input::placeholder {
            color: gray;
          }
          
          .list:first-child {
            margin-top: 0;
          }
        </style>
      `;

      const classes = parser.extractStyleBlockClasses(source);
      expect(classes.has('button')).toBe(true);
      expect(classes.has('input')).toBe(true);
      expect(classes.has('list')).toBe(true);
    });

    test('should handle multiple style blocks', () => {
      const source = `
        <style>
          .first-block {
            color: red;
          }
        </style>
        
        <div></div>
        
        <style>
          .second-block {
            color: blue;
          }
        </style>
      `;

      const classes = parser.extractStyleBlockClasses(source);
      expect(classes.has('first-block')).toBe(true);
      expect(classes.has('second-block')).toBe(true);
    });

    test('should handle keyframes', () => {
      const source = `
        <style>
          @keyframes slide-in {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
          
          .animated {
            animation: slide-in 0.3s;
          }
        </style>
      `;

      const classes = parser.extractStyleBlockClasses(source);
      expect(classes.has('animated')).toBe(true);
      expect(classes.has('slide-in')).toBe(true);
    });
  });

  describe('ESLint Integration', () => {
    test('should not report errors for classes defined in component style blocks', async () => {
      // Create a Svelte component with styles
      const componentPath = path.join(tempDir, 'Navigation.svelte');
      fs.writeFileSync(componentPath, `
<script>
  export let isOpen = false;
</script>

<div class="navigation-root">
  <button class="mobile-menu-toggle">
    <span class="hamburger">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </span>
  </button>
</div>

<style>
  .navigation-root {
    position: relative;
    width: 100%;
  }
  
  .mobile-menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .hamburger {
    display: flex;
    flex-direction: column;
  }
  
  .hamburger-line {
    width: 24px;
    height: 2px;
    background: currentColor;
    margin: 2px 0;
  }
</style>
      `);

      // Create a minimal CSS file
      fs.writeFileSync(path.join(tempDir, 'app.css'), '/* Global styles */');

      const eslint = new ESLint({
        overrideConfigFile: true,
        cwd: tempDir,
        overrideConfig: {
          files: ['**/*.svelte'],
          languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            parserOptions: {
              ecmaFeatures: { jsx: true }
            }
          },
          plugins: {
            'undefined-css-classes': plugin
          },
          rules: {
            'undefined-css-classes/no-undefined-css-classes': [
              'error',
              {
                cssFiles: ['app.css'],
                baseDir: tempDir
              }
            ]
          }
        }
      });

      const results = await eslint.lintText(
        fs.readFileSync(componentPath, 'utf-8'),
        { filePath: componentPath }
      );

      const messages = results[0].messages.filter(m => 
        m.ruleId === 'undefined-css-classes/no-undefined-css-classes'
      );

      // Should not report any errors for style block classes
      expect(messages.length).toBe(0);
    });

    test('parser can distinguish between defined and undefined classes', () => {
      const parser = new SvelteStyleParser();
      
      const source = `
<div class="defined-class undefined-class">
  Content
</div>

<style>
  .defined-class {
    color: blue;
  }
</style>
      `;
      
      const classes = parser.extractStyleBlockClasses(source);
      
      // Parser should find defined-class but not undefined-class
      expect(classes.has('defined-class')).toBe(true);
      expect(classes.has('undefined-class')).toBe(false);
      
      // This demonstrates that the parser correctly identifies
      // which classes are defined in style blocks
    });

    test('should handle complex real-world component', async () => {
      const componentPath = path.join(tempDir, 'DropdownTransitionShell.svelte');
      fs.writeFileSync(componentPath, `
<div class="dropdown-container">
  <div class="dropdown-shell">
    <div class="dropdown-arrow"></div>
    <div class="content-wrapper">
      <div class="sizing-content">
        <slot />
      </div>
      <div class="content-overlay"></div>
    </div>
  </div>
</div>

<style>
  .dropdown-container {
    position: absolute;
    z-index: 50;
  }
  
  .dropdown-shell {
    position: relative;
    background: white;
    border-radius: 8px;
  }
  
  .dropdown-arrow {
    position: absolute;
    width: 12px;
    height: 12px;
  }
  
  .content-wrapper {
    position: relative;
    overflow: hidden;
  }
  
  .sizing-content {
    padding: 1rem;
  }
  
  .content-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
</style>
      `);

      fs.writeFileSync(path.join(tempDir, 'app.css'), '/* Global styles */');

      const eslint = new ESLint({
        overrideConfigFile: true,
        cwd: tempDir,
        overrideConfig: {
          files: ['**/*.svelte'],
          languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            parserOptions: {
              ecmaFeatures: { jsx: true }
            }
          },
          plugins: {
            'undefined-css-classes': plugin
          },
          rules: {
            'undefined-css-classes/no-undefined-css-classes': [
              'error',
              {
                cssFiles: ['app.css'],
                baseDir: tempDir
              }
            ]
          }
        }
      });

      const results = await eslint.lintText(
        fs.readFileSync(componentPath, 'utf-8'),
        { filePath: componentPath }
      );

      const messages = results[0].messages.filter(m => 
        m.ruleId === 'undefined-css-classes/no-undefined-css-classes'
      );

      // All classes are defined in the style block, should have no errors
      expect(messages.length).toBe(0);
    });
  });
});