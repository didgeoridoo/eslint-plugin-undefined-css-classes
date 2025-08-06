const fs = require('fs');
const path = require('path');
const os = require('os');
const TailwindDetector = require('../lib/utils/tailwind-detector');

describe('Tailwind 4 @theme Block Support', () => {
  let tempDir;
  let detector;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tw4-theme-test-'));
    detector = new TailwindDetector({ projectRoot: tempDir });
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('parseThemeVariables', () => {
    it('should extract color variables from @theme block', () => {
      const cssContent = `
        @import 'tailwindcss';
        
        @theme {
          --color-primary: #0d2742;
          --color-secondary: #1e4b67;
          --color-accent: #ddd59b;
          --color-surface-tertiary: #f0eeda;
          --color-text-inverse: #ffffff;
        }
      `;

      const themeVars = detector.parseThemeVariables(cssContent);
      
      expect(themeVars.colors).toContain('primary');
      expect(themeVars.colors).toContain('secondary');
      expect(themeVars.colors).toContain('accent');
      expect(themeVars.colors).toContain('surface-tertiary');
      expect(themeVars.colors).toContain('text-inverse');
    });

    it('should extract font variables from @theme block', () => {
      const cssContent = `
        @theme {
          --font-sans: 'League Spartan Variable', sans-serif;
          --font-serif: 'Fraunces', serif;
          --font-mono: ui-monospace, monospace;
          --font-display: 'Bebas Neue', sans-serif;
        }
      `;

      const themeVars = detector.parseThemeVariables(cssContent);
      
      expect(themeVars.fonts).toContain('sans');
      expect(themeVars.fonts).toContain('serif');
      expect(themeVars.fonts).toContain('mono');
      expect(themeVars.fonts).toContain('display');
    });

    it('should extract spacing variables from @theme block', () => {
      const cssContent = `
        @theme {
          --spacing-xs: 0.5rem;
          --spacing-sm: 1rem;
          --spacing-md: 1.5rem;
          --spacing-lg: 2rem;
          --spacing-xl: 3rem;
          --spacing-2xl: 4rem;
        }
      `;

      const themeVars = detector.parseThemeVariables(cssContent);
      
      expect(themeVars.spacing).toContain('xs');
      expect(themeVars.spacing).toContain('sm');
      expect(themeVars.spacing).toContain('md');
      expect(themeVars.spacing).toContain('lg');
      expect(themeVars.spacing).toContain('xl');
      expect(themeVars.spacing).toContain('2xl');
    });

    it('should extract radius variables from @theme block', () => {
      const cssContent = `
        @theme {
          --radius-sm: 0.25rem;
          --radius-md: 0.375rem;
          --radius-lg: 0.5rem;
          --radius-full: 9999px;
        }
      `;

      const themeVars = detector.parseThemeVariables(cssContent);
      
      expect(themeVars.radius).toContain('sm');
      expect(themeVars.radius).toContain('md');
      expect(themeVars.radius).toContain('lg');
      expect(themeVars.radius).toContain('full');
    });

    it('should extract shadow variables from @theme block', () => {
      const cssContent = `
        @theme {
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
          --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
        }
      `;

      const themeVars = detector.parseThemeVariables(cssContent);
      
      expect(themeVars.shadows).toContain('sm');
      expect(themeVars.shadows).toContain('md');
      expect(themeVars.shadows).toContain('lg');
      expect(themeVars.shadows).toContain('xl');
    });

    it('should handle complex theme with multiple variable types', () => {
      const cssContent = `
        @theme {
          /* Colors */
          --color-white: #ffffff;
          --color-black: #000000;
          --color-primary: var(--color-hadal);
          --color-hadal: #0d2742;
          
          /* Fonts */
          --font-sans: system-ui, sans-serif;
          
          /* Spacing */
          --spacing-xs: 0.5rem;
          --spacing-sm: 1rem;
          
          /* Other variables that should be ignored */
          --tw-prose-body: var(--color-text);
          --some-custom-var: 123px;
        }
      `;

      const themeVars = detector.parseThemeVariables(cssContent);
      
      expect(themeVars.colors).toContain('white');
      expect(themeVars.colors).toContain('black');
      expect(themeVars.colors).toContain('primary');
      expect(themeVars.colors).toContain('hadal');
      expect(themeVars.fonts).toContain('sans');
      expect(themeVars.spacing).toContain('xs');
      expect(themeVars.spacing).toContain('sm');
      
      // Should not include non-theme variables
      expect(themeVars.colors.has('tw-prose-body')).toBe(false);
      expect(themeVars.colors.has('some-custom-var')).toBe(false);
    });
  });

  describe('getThemeGeneratedClasses', () => {
    it('should generate color utility classes from theme variables', () => {
      const cssPath = path.join(tempDir, 'app.css');
      fs.writeFileSync(cssPath, `
        @import 'tailwindcss';
        
        @theme {
          --color-primary: #0d2742;
          --color-inverse: #ffffff;
          --color-surface-tertiary: #f0eeda;
        }
      `);

      const classes = detector.getThemeGeneratedClasses();
      
      // Background colors
      expect(classes.has('bg-primary')).toBe(true);
      expect(classes.has('bg-inverse')).toBe(true);
      expect(classes.has('bg-surface-tertiary')).toBe(true);
      
      // Text colors
      expect(classes.has('text-primary')).toBe(true);
      expect(classes.has('text-inverse')).toBe(true);
      expect(classes.has('text-surface-tertiary')).toBe(true);
      
      // Border colors
      expect(classes.has('border-primary')).toBe(true);
      expect(classes.has('border-inverse')).toBe(true);
      
      // Ring colors
      expect(classes.has('ring-primary')).toBe(true);
      
      // Other color utilities
      expect(classes.has('placeholder-primary')).toBe(true);
      expect(classes.has('fill-primary')).toBe(true);
      expect(classes.has('stroke-primary')).toBe(true);
    });

    it('should generate font utility classes from theme variables', () => {
      const cssPath = path.join(tempDir, 'styles.css');
      fs.writeFileSync(cssPath, `
        @import "tailwindcss";
        
        @theme {
          --font-display: 'Bebas Neue', sans-serif;
          --font-body: 'Inter', sans-serif;
        }
      `);

      const classes = detector.getThemeGeneratedClasses();
      
      expect(classes.has('font-display')).toBe(true);
      expect(classes.has('font-body')).toBe(true);
    });

    it('should generate spacing utility classes from theme variables', () => {
      const cssPath = path.join(tempDir, 'theme.css');
      fs.writeFileSync(cssPath, `
        @import 'tailwindcss';
        
        @theme {
          --spacing-xs: 0.5rem;
          --spacing-2xl: 4rem;
        }
      `);

      const classes = detector.getThemeGeneratedClasses();
      
      // Padding utilities
      expect(classes.has('p-xs')).toBe(true);
      expect(classes.has('pt-xs')).toBe(true);
      expect(classes.has('px-xs')).toBe(true);
      expect(classes.has('py-xs')).toBe(true);
      expect(classes.has('p-2xl')).toBe(true);
      
      // Margin utilities (including negative)
      expect(classes.has('m-xs')).toBe(true);
      expect(classes.has('mt-xs')).toBe(true);
      expect(classes.has('-m-xs')).toBe(true);
      expect(classes.has('-mt-xs')).toBe(true);
      
      // Gap utilities
      expect(classes.has('gap-xs')).toBe(true);
      expect(classes.has('gap-x-xs')).toBe(true);
      expect(classes.has('gap-y-xs')).toBe(true);
      
      // Width/height utilities
      expect(classes.has('w-xs')).toBe(true);
      expect(classes.has('h-xs')).toBe(true);
      expect(classes.has('min-w-xs')).toBe(true);
      expect(classes.has('max-h-xs')).toBe(true);
      
      // Position utilities
      expect(classes.has('top-xs')).toBe(true);
      expect(classes.has('inset-xs')).toBe(true);
    });

    it('should generate rounded utility classes from theme variables', () => {
      const cssPath = path.join(tempDir, 'theme.css');
      fs.writeFileSync(cssPath, `
        @import 'tailwindcss';
        
        @theme {
          --radius-sm: 0.25rem;
          --radius-full: 9999px;
        }
      `);

      const classes = detector.getThemeGeneratedClasses();
      
      expect(classes.has('rounded-sm')).toBe(true);
      expect(classes.has('rounded-full')).toBe(true);
      expect(classes.has('rounded-t-sm')).toBe(true);
      expect(classes.has('rounded-tl-full')).toBe(true);
    });

    it('should generate shadow utility classes from theme variables', () => {
      const cssPath = path.join(tempDir, 'theme.css');
      fs.writeFileSync(cssPath, `
        @import 'tailwindcss';
        
        @theme {
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
        }
      `);

      const classes = detector.getThemeGeneratedClasses();
      
      expect(classes.has('shadow-sm')).toBe(true);
      expect(classes.has('shadow-2xl')).toBe(true);
      expect(classes.has('drop-shadow-sm')).toBe(true);
      expect(classes.has('drop-shadow-2xl')).toBe(true);
    });

    it('should cache theme-generated classes', () => {
      const cssPath = path.join(tempDir, 'app.css');
      fs.writeFileSync(cssPath, `
        @import 'tailwindcss';
        
        @theme {
          --color-primary: #0d2742;
        }
      `);

      const classes1 = detector.getThemeGeneratedClasses();
      const classes2 = detector.getThemeGeneratedClasses();
      
      // Should return the same cached Set
      expect(classes1).toBe(classes2);
    });
  });

  describe('isTailwindClass with @theme support', () => {
    it('should recognize theme-generated classes as valid Tailwind classes', () => {
      const cssPath = path.join(tempDir, 'app.css');
      fs.writeFileSync(cssPath, `
        @import 'tailwindcss';
        
        @theme {
          --color-primary: #0d2742;
          --color-inverse: #ffffff;
          --color-surface-tertiary: #f0eeda;
          --font-display: 'Bebas Neue', sans-serif;
          --spacing-32: 8rem;
        }
      `);

      // User's reported classes that were false positives
      expect(detector.isTailwindClass('bg-primary')).toBe(true);
      expect(detector.isTailwindClass('text-inverse')).toBe(true);
      expect(detector.isTailwindClass('text-surface-tertiary')).toBe(true);
      expect(detector.isTailwindClass('font-display')).toBe(true);
      expect(detector.isTailwindClass('pt-32')).toBe(true);
      expect(detector.isTailwindClass('pb-16')).toBe(true);
      
      // Should still recognize non-theme classes as invalid
      expect(detector.isTailwindClass('bg-nonexistent')).toBe(false);
      expect(detector.isTailwindClass('text-undefined-color')).toBe(false);
    });

    it('should handle real-world Tailwind 4 app.css from bug report', () => {
      const cssPath = path.join(tempDir, 'app.css');
      // Using actual CSS from the bug report
      fs.writeFileSync(cssPath, `
        @import 'tailwindcss';
        @plugin '@tailwindcss/forms';
        @plugin '@tailwindcss/typography';

        @theme {
          /* neutrals */
          --color-white: #ffffff;
          --color-zinc: #f6f6f6;
          --color-chrome: #c9c9c9;
          --color-steel: #8e8e8e;
          --color-black: #000000;
          --color-canvas-1: #faf9f0;
          --color-canvas-2: #f6f4e7;
          --color-canvas-3: #f0eeda;
          --color-canvas-4: #e7e3ca;

          /* core brand colors */
          --color-gold: #ddd59b;
          --color-hadal: #0d2742;
          --color-benthic: #1e4b67;
          --color-pelagic: #55829a;
          --color-littoral: #8dc6cf;

          /* semantic tokens - surfaces and backgrounds */
          --color-background: var(--color-canvas-1);
          --color-surface: var(--color-white);
          --color-surface-secondary: var(--color-zinc);
          --color-surface-tertiary: var(--color-canvas-2);

          /* semantic tokens - text */
          --color-text: var(--color-black);
          --color-muted: var(--color-steel);
          --color-inverse: var(--color-white);
          --color-brand: var(--color-hadal);

          /* semantic tokens - brand */
          --color-primary: var(--color-hadal);
          --color-primary-hover: var(--color-benthic);

          /* typography tokens */
          --font-sans: 'League Spartan Variable', system-ui, sans-serif;
          --font-serif: 'Fraunces', Georgia, serif;
          --font-mono: ui-monospace, monospace;
          
          /* Custom font not in standard Tailwind */
          --font-display: 'Bebas Neue', sans-serif;
        }
      `);

      // All classes from the bug report's Svelte component should be recognized
      expect(detector.isTailwindClass('bg-primary')).toBe(true);
      expect(detector.isTailwindClass('text-inverse')).toBe(true);
      expect(detector.isTailwindClass('text-surface-tertiary')).toBe(true);
      expect(detector.isTailwindClass('font-display')).toBe(true);
      
      // Also check other theme-generated utilities
      expect(detector.isTailwindClass('bg-gold')).toBe(true);
      expect(detector.isTailwindClass('text-hadal')).toBe(true);
      expect(detector.isTailwindClass('border-benthic')).toBe(true);
      expect(detector.isTailwindClass('ring-pelagic')).toBe(true);
      expect(detector.isTailwindClass('bg-surface-secondary')).toBe(true);
    });
  });
});