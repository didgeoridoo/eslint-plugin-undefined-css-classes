const fs = require('fs');
const path = require('path');
const os = require('os');
const TailwindDetector = require('../lib/utils/tailwind-detector');

describe('Tailwind Opacity Modifiers and Special Utilities', () => {
  let tempDir;
  let detector;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tw-opacity-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Opacity Modifiers', () => {
    test('should recognize theme colors with opacity modifiers', () => {
      const cssPath = path.join(tempDir, 'app.css');
      fs.writeFileSync(cssPath, `
        @import 'tailwindcss';
        
        @theme {
          --color-primary: #0d2742;
          --color-surface-tertiary: #f0eeda;
          --color-canvas: #f5f5f5;
        }
      `);

      detector = new TailwindDetector({ projectRoot: tempDir });

      // Base classes should work
      expect(detector.isTailwindClass('bg-primary')).toBe(true);
      expect(detector.isTailwindClass('text-surface-tertiary')).toBe(true);
      expect(detector.isTailwindClass('from-canvas')).toBe(true);
      
      // With opacity modifiers
      expect(detector.isTailwindClass('bg-primary/50')).toBe(true);
      expect(detector.isTailwindClass('bg-primary/25')).toBe(true);
      expect(detector.isTailwindClass('bg-primary/75')).toBe(true);
      expect(detector.isTailwindClass('bg-primary/100')).toBe(true);
      
      expect(detector.isTailwindClass('text-surface-tertiary/50')).toBe(true);
      expect(detector.isTailwindClass('from-surface-tertiary/50')).toBe(true);
      expect(detector.isTailwindClass('to-canvas/10')).toBe(true);
      expect(detector.isTailwindClass('border-primary/20')).toBe(true);
    });

    test('should handle single-word color names like canvas', () => {
      const cssPath = path.join(tempDir, 'app.css');
      fs.writeFileSync(cssPath, `
        @import 'tailwindcss';
        
        @theme {
          --canvas: #f5f5f5;
          --surface: #ffffff;
          --background: #fafafa;
          --foreground: #000000;
        }
      `);

      detector = new TailwindDetector({ projectRoot: tempDir });

      // These single-word colors should be recognized
      expect(detector.isTailwindClass('bg-canvas')).toBe(true);
      expect(detector.isTailwindClass('bg-surface')).toBe(true);
      expect(detector.isTailwindClass('text-background')).toBe(true);
      expect(detector.isTailwindClass('text-foreground')).toBe(true);
      
      // With opacity
      expect(detector.isTailwindClass('bg-canvas/50')).toBe(true);
    });

    test('should not recognize invalid opacity values', () => {
      const cssPath = path.join(tempDir, 'app.css');
      fs.writeFileSync(cssPath, `
        @import 'tailwindcss';
        
        @theme {
          --color-primary: #0d2742;
        }
      `);

      detector = new TailwindDetector({ projectRoot: tempDir });

      // Valid
      expect(detector.isTailwindClass('bg-primary/50')).toBe(true);
      
      // Invalid - not a number after slash
      expect(detector.isTailwindClass('bg-primary/abc')).toBe(false);
      expect(detector.isTailwindClass('bg-primary/')).toBe(false);
      
      // But these are different valid Tailwind patterns (not opacity)
      // Group/peer patterns would be handled differently
    });
  });

  describe('Special Utility Classes', () => {
    test('should recognize group utility', () => {
      detector = new TailwindDetector({ projectRoot: tempDir });
      
      expect(detector.isTailwindClass('group')).toBe(true);
    });

    test('should recognize peer utility', () => {
      detector = new TailwindDetector({ projectRoot: tempDir });
      
      expect(detector.isTailwindClass('peer')).toBe(true);
    });

    test('should recognize container utility', () => {
      detector = new TailwindDetector({ projectRoot: tempDir });
      
      expect(detector.isTailwindClass('container')).toBe(true);
    });

    test('should recognize prose utility (typography plugin)', () => {
      detector = new TailwindDetector({ projectRoot: tempDir });
      
      expect(detector.isTailwindClass('prose')).toBe(true);
    });

    test('should recognize pseudo-element utilities', () => {
      detector = new TailwindDetector({ projectRoot: tempDir });
      
      expect(detector.isTailwindClass('before')).toBe(true);
      expect(detector.isTailwindClass('after')).toBe(true);
      expect(detector.isTailwindClass('placeholder')).toBe(true);
      expect(detector.isTailwindClass('file')).toBe(true);
      expect(detector.isTailwindClass('marker')).toBe(true);
      expect(detector.isTailwindClass('selection')).toBe(true);
      expect(detector.isTailwindClass('first-line')).toBe(true);
      expect(detector.isTailwindClass('first-letter')).toBe(true);
      expect(detector.isTailwindClass('backdrop')).toBe(true);
    });

    test('should handle group variants correctly', () => {
      detector = new TailwindDetector({ projectRoot: tempDir });
      
      // Standalone group
      expect(detector.isTailwindClass('group')).toBe(true);
      
      // These would be handled by variant patterns, not as standalone
      // Just verifying the base 'group' works
    });
  });

  describe('Real-world Bug Report Cases', () => {
    test('should handle all classes from bug report', () => {
      const cssPath = path.join(tempDir, 'app.css');
      fs.writeFileSync(cssPath, `
        @import 'tailwindcss';
        @plugin '@tailwindcss/forms';
        @plugin '@tailwindcss/typography';

        @theme {
          --color-canvas: #f5f5f5;
          --color-surface-tertiary: #e0e0e0;
        }
      `);

      detector = new TailwindDetector({ projectRoot: tempDir });

      // From bug report - should all be recognized
      expect(detector.isTailwindClass('group')).toBe(true);
      expect(detector.isTailwindClass('bg-canvas')).toBe(true);
      expect(detector.isTailwindClass('from-surface-tertiary/50')).toBe(true);
    });
  });
});