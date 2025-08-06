const TailwindDetector = require('../../lib/utils/tailwind-detector');
const fs = require('fs');
const path = require('path');

describe('TailwindDetector', () => {
  const testProjectDir = path.join(__dirname, '../fixtures/tailwind-test');
  
  beforeEach(() => {
    if (!fs.existsSync(testProjectDir)) {
      fs.mkdirSync(testProjectDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testProjectDir)) {
      const files = fs.readdirSync(testProjectDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(testProjectDir, file));
      });
      fs.rmSync(testProjectDir, { recursive: true, force: true });
    }
  });

  describe('hasTailwindConfig', () => {
    test('detects tailwind.config.js', () => {
      fs.writeFileSync(path.join(testProjectDir, 'tailwind.config.js'), 'module.exports = {}');
      const detector = new TailwindDetector({ projectRoot: testProjectDir });
      
      expect(detector.hasTailwindConfig()).toBe(true);
    });

    test('detects tailwind.config.ts', () => {
      fs.writeFileSync(path.join(testProjectDir, 'tailwind.config.ts'), 'export default {}');
      const detector = new TailwindDetector({ projectRoot: testProjectDir });
      
      expect(detector.hasTailwindConfig()).toBe(true);
    });

    test('detects tailwind in package.json dependencies', () => {
      const packageJson = {
        dependencies: {
          'tailwindcss': '^3.0.0'
        }
      };
      fs.writeFileSync(path.join(testProjectDir, 'package.json'), JSON.stringify(packageJson));
      const detector = new TailwindDetector({ projectRoot: testProjectDir });
      
      expect(detector.hasTailwindConfig()).toBe(true);
    });

    test('detects tailwind in package.json devDependencies', () => {
      const packageJson = {
        devDependencies: {
          'tailwindcss': '^3.0.0'
        }
      };
      fs.writeFileSync(path.join(testProjectDir, 'package.json'), JSON.stringify(packageJson));
      const detector = new TailwindDetector({ projectRoot: testProjectDir });
      
      expect(detector.hasTailwindConfig()).toBe(true);
    });

    test('detects tailwind in postcss.config.js', () => {
      fs.writeFileSync(path.join(testProjectDir, 'postcss.config.js'), `
        module.exports = {
          plugins: {
            tailwindcss: {},
            autoprefixer: {}
          }
        }
      `);
      const detector = new TailwindDetector({ projectRoot: testProjectDir });
      
      expect(detector.hasTailwindConfig()).toBe(true);
    });

    test('detects Tailwind 4 with @import "tailwindcss"', () => {
      fs.writeFileSync(path.join(testProjectDir, 'app.css'), `
        @import "tailwindcss";
        
        .custom-class {
          color: red;
        }
      `);
      const detector = new TailwindDetector({ projectRoot: testProjectDir });
      
      expect(detector.hasTailwindConfig()).toBe(true);
    });

    test('detects Tailwind 4 with @theme directive', () => {
      fs.writeFileSync(path.join(testProjectDir, 'styles.css'), `
        @import 'tailwindcss';
        
        @theme {
          --color-primary: #3b82f6;
          --color-secondary: #8b5cf6;
        }
      `);
      const detector = new TailwindDetector({ projectRoot: testProjectDir });
      
      expect(detector.hasTailwindConfig()).toBe(true);
    });

    test('detects Tailwind 4 with various import formats', () => {
      fs.writeFileSync(path.join(testProjectDir, 'main.css'), `
        @import tailwindcss;
      `);
      const detector = new TailwindDetector({ projectRoot: testProjectDir });
      
      expect(detector.hasTailwindConfig()).toBe(true);
    });

    test('detects Tailwind 4 theme utilities import', () => {
      fs.writeFileSync(path.join(testProjectDir, 'app.css'), `
        @import "tailwindcss/theme";
        @import "tailwindcss/utilities";
      `);
      const detector = new TailwindDetector({ projectRoot: testProjectDir });
      
      expect(detector.hasTailwindConfig()).toBe(true);
    });

    test('returns false when no tailwind config found', () => {
      const detector = new TailwindDetector({ projectRoot: testProjectDir });
      
      expect(detector.hasTailwindConfig()).toBe(false);
    });

    test('caches detection result', () => {
      const detector = new TailwindDetector({ projectRoot: testProjectDir });
      
      const result1 = detector.hasTailwindConfig();
      
      // Add tailwind config after first check
      fs.writeFileSync(path.join(testProjectDir, 'tailwind.config.js'), 'module.exports = {}');
      
      const result2 = detector.hasTailwindConfig();
      
      // Should still return cached false result
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      
      // Clear cache and check again
      detector.clearCache();
      const result3 = detector.hasTailwindConfig();
      
      expect(result3).toBe(true);
    });
  });

  describe('isTailwindClass', () => {
    const detector = new TailwindDetector({ projectRoot: testProjectDir });

    test('detects utility classes', () => {
      expect(detector.isTailwindClass('flex')).toBe(true);
      expect(detector.isTailwindClass('grid')).toBe(true);
      expect(detector.isTailwindClass('hidden')).toBe(true);
      expect(detector.isTailwindClass('block')).toBe(true);
      expect(detector.isTailwindClass('inline-block')).toBe(true);
    });

    test('detects spacing utilities', () => {
      expect(detector.isTailwindClass('p-4')).toBe(true);
      expect(detector.isTailwindClass('m-2')).toBe(true);
      expect(detector.isTailwindClass('px-6')).toBe(true);
      expect(detector.isTailwindClass('my-8')).toBe(true);
      expect(detector.isTailwindClass('-mt-4')).toBe(true);
      expect(detector.isTailwindClass('p-px')).toBe(true);
      expect(detector.isTailwindClass('m-auto')).toBe(true);
    });

    test('detects width and height utilities with size variants', () => {
      expect(detector.isTailwindClass('w-full')).toBe(true);
      expect(detector.isTailwindClass('h-screen')).toBe(true);
      expect(detector.isTailwindClass('max-w-xs')).toBe(true);
      expect(detector.isTailwindClass('max-w-sm')).toBe(true);
      expect(detector.isTailwindClass('max-w-md')).toBe(true);
      expect(detector.isTailwindClass('max-w-lg')).toBe(true);
      expect(detector.isTailwindClass('max-w-xl')).toBe(true);
      expect(detector.isTailwindClass('max-w-2xl')).toBe(true);
      expect(detector.isTailwindClass('max-w-3xl')).toBe(true);
      expect(detector.isTailwindClass('max-w-4xl')).toBe(true);
      expect(detector.isTailwindClass('max-w-5xl')).toBe(true);
      expect(detector.isTailwindClass('max-w-6xl')).toBe(true);
      expect(detector.isTailwindClass('max-w-7xl')).toBe(true);
      expect(detector.isTailwindClass('max-w-none')).toBe(true);
      expect(detector.isTailwindClass('max-w-prose')).toBe(true);
      expect(detector.isTailwindClass('max-w-screen-lg')).toBe(true);
      expect(detector.isTailwindClass('min-w-full')).toBe(true);
      expect(detector.isTailwindClass('min-h-screen')).toBe(true);
    });

    test('detects color utilities', () => {
      expect(detector.isTailwindClass('text-blue-500')).toBe(true);
      expect(detector.isTailwindClass('bg-gray-100')).toBe(true);
      expect(detector.isTailwindClass('border-red-600')).toBe(true);
      expect(detector.isTailwindClass('ring-green-400')).toBe(true);
      expect(detector.isTailwindClass('from-purple-400')).toBe(true);
      expect(detector.isTailwindClass('via-pink-500')).toBe(true);
      expect(detector.isTailwindClass('to-red-500')).toBe(true);
    });

    test('detects responsive prefixes', () => {
      expect(detector.isTailwindClass('sm:flex')).toBe(true);
      expect(detector.isTailwindClass('md:hidden')).toBe(true);
      expect(detector.isTailwindClass('lg:grid-cols-3')).toBe(true);
      expect(detector.isTailwindClass('xl:text-2xl')).toBe(true);
      expect(detector.isTailwindClass('2xl:container')).toBe(true);
    });

    test('detects state modifiers', () => {
      expect(detector.isTailwindClass('hover:bg-blue-600')).toBe(true);
      expect(detector.isTailwindClass('focus:outline-none')).toBe(true);
      expect(detector.isTailwindClass('active:scale-95')).toBe(true);
      expect(detector.isTailwindClass('disabled:opacity-50')).toBe(true);
      expect(detector.isTailwindClass('dark:bg-gray-800')).toBe(true);
    });

    test('detects arbitrary values', () => {
      // These are actually dynamic classes, not static Tailwind classes
      expect(detector.isDynamicTailwindClass('w-[100px]')).toBe(true);
      expect(detector.isDynamicTailwindClass('h-[50vh]')).toBe(true);
      expect(detector.isDynamicTailwindClass('text-[14px]')).toBe(true);
      expect(detector.isDynamicTailwindClass('bg-[#1da1f2]')).toBe(true);
      
      // The base pattern for arbitrary values
      expect(detector.isTailwindClass('[display:grid]')).toBe(true);
    });

    test('detects important modifier', () => {
      expect(detector.isTailwindClass('!mt-4')).toBe(true);
      expect(detector.isTailwindClass('!text-center')).toBe(true);
    });

    test('detects flexbox and grid utilities', () => {
      expect(detector.isTailwindClass('flex-row')).toBe(true);
      expect(detector.isTailwindClass('flex-col')).toBe(true);
      expect(detector.isTailwindClass('flex-wrap')).toBe(true);
      expect(detector.isTailwindClass('items-center')).toBe(true);
      expect(detector.isTailwindClass('justify-between')).toBe(true);
      expect(detector.isTailwindClass('content-center')).toBe(true);
      expect(detector.isTailwindClass('self-start')).toBe(true);
    });

    test('detects container and common utilities', () => {
      expect(detector.isTailwindClass('container')).toBe(true);
      expect(detector.isTailwindClass('text-center')).toBe(true);
      expect(detector.isTailwindClass('text-left')).toBe(true);
      expect(detector.isTailwindClass('text-right')).toBe(true);
      expect(detector.isTailwindClass('font-sans')).toBe(true);
      expect(detector.isTailwindClass('font-serif')).toBe(true);
      expect(detector.isTailwindClass('font-mono')).toBe(true);
    });

    test('does not detect non-Tailwind classes', () => {
      expect(detector.isTailwindClass('my-custom-class')).toBe(false);
      expect(detector.isTailwindClass('header')).toBe(false);
      expect(detector.isTailwindClass('container-custom')).toBe(false);
      expect(detector.isTailwindClass('btn-primary-custom')).toBe(false);
    });
  });

  describe('isDynamicTailwindClass', () => {
    const detector = new TailwindDetector({ projectRoot: testProjectDir });

    test('detects template literal indicators', () => {
      expect(detector.isDynamicTailwindClass('text-${color}')).toBe(true);
      expect(detector.isDynamicTailwindClass('bg-{{color}}')).toBe(true);
    });

    test('detects arbitrary color values', () => {
      expect(detector.isDynamicTailwindClass('text-[#ff0000]')).toBe(true);
      expect(detector.isDynamicTailwindClass('bg-[rgb(255,0,0)]')).toBe(true);
      expect(detector.isDynamicTailwindClass('border-[rgba(255,0,0,0.5)]')).toBe(true);
      expect(detector.isDynamicTailwindClass('from-[hsl(200,100%,50%)]')).toBe(true);
      expect(detector.isDynamicTailwindClass('text-[var(--primary-color)]')).toBe(true);
    });

    test('detects arbitrary spacing values', () => {
      expect(detector.isDynamicTailwindClass('w-[300px]')).toBe(true);
      expect(detector.isDynamicTailwindClass('h-[50vh]')).toBe(true);
      expect(detector.isDynamicTailwindClass('p-[2rem]')).toBe(true);
      expect(detector.isDynamicTailwindClass('top-[10%]')).toBe(true);
    });

    test('detects pseudo-element classes', () => {
      expect(detector.isDynamicTailwindClass('before:content-[""]')).toBe(true);
      expect(detector.isDynamicTailwindClass('after:block')).toBe(true);
    });
  });

  describe('shouldIgnoreClass', () => {
    test('ignores Tailwind classes when ignoreTailwind is true and config exists', () => {
      fs.writeFileSync(path.join(testProjectDir, 'tailwind.config.js'), 'module.exports = {}');
      const detector = new TailwindDetector({ projectRoot: testProjectDir });
      
      expect(detector.shouldIgnoreClass('flex', { ignoreTailwind: true })).toBe(true);
      expect(detector.shouldIgnoreClass('text-blue-500', { ignoreTailwind: true })).toBe(true);
    });

    test('does not ignore Tailwind classes when ignoreTailwind is false', () => {
      fs.writeFileSync(path.join(testProjectDir, 'tailwind.config.js'), 'module.exports = {}');
      const detector = new TailwindDetector({ projectRoot: testProjectDir });
      
      expect(detector.shouldIgnoreClass('flex', { ignoreTailwind: false })).toBe(false);
    });

    test('does not ignore when requireTailwindConfig is true but no config exists', () => {
      const detector = new TailwindDetector({ projectRoot: testProjectDir });
      
      expect(detector.shouldIgnoreClass('flex', { 
        ignoreTailwind: true,
        requireTailwindConfig: true 
      })).toBe(false);
    });

    test('ignores when requireTailwindConfig is false even without config', () => {
      const detector = new TailwindDetector({ projectRoot: testProjectDir });
      
      expect(detector.shouldIgnoreClass('flex', { 
        ignoreTailwind: true,
        requireTailwindConfig: false 
      })).toBe(true);
    });

    test('does NOT ignore custom color utilities', () => {
      fs.writeFileSync(path.join(testProjectDir, 'tailwind.config.js'), 'module.exports = {}');
      const detector = new TailwindDetector({ projectRoot: testProjectDir });
      
      // Custom color utilities should NOT be automatically accepted
      // These need to be defined in actual CSS files
      expect(detector.shouldIgnoreClass('text-primary', { ignoreTailwind: true })).toBe(false);
      expect(detector.shouldIgnoreClass('bg-surface', { ignoreTailwind: true })).toBe(false);
      expect(detector.shouldIgnoreClass('text-surface-tertiary', { ignoreTailwind: true })).toBe(false);
      expect(detector.shouldIgnoreClass('bg-brand-500', { ignoreTailwind: true })).toBe(false);
      expect(detector.shouldIgnoreClass('border-inverse', { ignoreTailwind: true })).toBe(false);
      expect(detector.shouldIgnoreClass('text-inverse', { ignoreTailwind: true })).toBe(false);
    });

    test('detects Tailwind 4 but still does not ignore custom colors', () => {
      // Simulate Tailwind 4 detection
      fs.writeFileSync(path.join(testProjectDir, 'app.css'), `
        @import "tailwindcss";
        @theme {
          --color-primary: #3b82f6;
        }
      `);
      const detector = new TailwindDetector({ projectRoot: testProjectDir });
      
      // Custom colors should NOT be ignored even with @theme
      expect(detector.shouldIgnoreClass('text-primary', { ignoreTailwind: true })).toBe(false);
      expect(detector.shouldIgnoreClass('bg-primary', { ignoreTailwind: true })).toBe(false);
      
      // Standard Tailwind utilities should still be ignored
      expect(detector.shouldIgnoreClass('container', { ignoreTailwind: true })).toBe(true);
      expect(detector.shouldIgnoreClass('text-center', { ignoreTailwind: true })).toBe(true);
    });
  });
});