/**
 * Test case for the exact bug report from the user about Tailwind 4 @theme support
 * Bug: Plugin not recognizing Tailwind 4 @theme-generated utilities
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { ESLint } = require('eslint');
const plugin = require('../lib/index.js');

describe('User Bug Report - Tailwind 4 @theme Support', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'user-bug-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('should NOT report warnings for Tailwind 4 @theme-generated utilities', async () => {
    // Create the exact app.css from the bug report
    const appCssPath = path.join(tempDir, 'app.css');
    fs.writeFileSync(appCssPath, `
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

    /* highlights and special colors */
    --color-snapper: #ffb700;
    --color-sunfish: #ff6600;
    --color-seaweed: #33ff00;
    --color-turtle: #06b600;
    --color-glint: #ff6600;

    /* semantic tokens - surfaces and backgrounds */
    --color-background: var(--color-canvas-1);
    --color-surface: var(--color-white);
    --color-surface-secondary: var(--color-zinc);
    --color-surface-tertiary: var(--color-canvas-2);
    --color-surface-muted: var(--color-chrome);

    /* semantic tokens - neutrals */
    --color-neutral: var(--color-canvas-3);
    --color-neutral-strong: var(--color-canvas-4);
    --color-border: var(--color-chrome);
    --color-border-light: var(--color-zinc);

    /* semantic tokens - text */
    --color-text: var(--color-black);
    --color-muted: var(--color-steel);
    --color-inverse: var(--color-white);
    --color-brand: var(--color-hadal);
    --color-brand-secondary: var(--color-benthic);

    /* semantic tokens - brand */
    --color-primary: var(--color-hadal);
    --color-primary-hover: var(--color-benthic);
    --color-primary-muted: var(--color-pelagic);
    --color-secondary: var(--color-littoral);
    --color-secondary-hover: var(--color-pelagic);
    --color-accent: var(--color-gold);

    /* semantic tokens - states */
    --color-success: var(--color-turtle);
    --color-warning: var(--color-sunfish);
    --color-error: var(--color-snapper);
    --color-highlight: var(--color-glint);
    --color-focus: var(--color-glint);

    /* typography tokens */
    --font-sans: 'League Spartan Variable', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    --font-serif: 'Fraunces', Georgia, Cambria, serif;
    --font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Monaco, monospace;
    --font-display: 'Bebas Neue', sans-serif;

    /* spacing scale */
    --spacing-xs: 0.5rem;
    --spacing-sm: 1rem;
    --spacing-md: 1.5rem;
    --spacing-lg: 2rem;
    --spacing-xl: 3rem;
    --spacing-2xl: 4rem;
    --spacing-3xl: 6rem;

    /* These specific spacing values were mentioned in the bug */
    --spacing-16: 4rem;
    --spacing-24: 6rem;
    --spacing-32: 8rem;
    --spacing-40: 10rem;

    /* border radius scale */
    --radius-sm: 0.25rem;
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;
    --radius-2xl: 1rem;
    --radius-full: 9999px;

    /* shadow scale */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
    --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
    `);

    // Create the exact Svelte component from the bug report
    const componentPath = path.join(tempDir, 'Component.svelte');
    fs.writeFileSync(componentPath, `
<script>
  export let title = 'Hello';
  export let subtitle = 'World';
</script>

<section class="relative overflow-hidden bg-primary pt-32 pb-16 md:pt-40 md:pb-24">
    <h1 class="font-display mx-auto mb-4 max-w-4xl text-4xl text-inverse md:text-5xl lg:text-6xl">
        {title}
    </h1>
    <p class="mx-auto mb-8 max-w-3xl text-lg text-surface-tertiary md:text-xl">
        {subtitle}
    </p>
</section>
    `);

    // Configure ESLint with the exact configuration from the bug report
    const eslint = new ESLint({
      overrideConfigFile: true,
      cwd: tempDir,  // Set the working directory
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
            'warn',
            {
              cssFiles: ['app.css'],  // Relative to cwd
              ignoreTailwind: true,
              requireTailwindConfig: false,
              allowDynamicClasses: false,
              baseDir: tempDir
            }
          ]
        }
      }
    });

    // Lint the component
    const results = await eslint.lintText(
      fs.readFileSync(componentPath, 'utf-8'),
      { filePath: componentPath }
    );

    const messages = results[0].messages;
    
    // Filter out any messages that aren't from our plugin
    const pluginMessages = messages.filter(m => 
      m.ruleId === 'undefined-css-classes/no-undefined-css-classes'
    );

    // These classes from the bug report should NOT generate warnings
    const expectedValidClasses = [
      'bg-primary',
      'pt-32',
      'pb-16',
      'md:pt-40',
      'md:pb-24',
      'font-display',
      'text-inverse',
      'text-surface-tertiary'
    ];

    // Check that none of the expected valid classes are reported as errors
    for (const className of expectedValidClasses) {
      const hasError = pluginMessages.some(m => 
        m.message.includes(className)
      );
      
      if (hasError) {
        console.error(`Unexpected error for class '${className}'`);
      }
      
      expect(hasError).toBe(false);
    }

    // The user reported 71 false positives - we should have 0 now
    expect(pluginMessages.length).toBe(0);
  });

  test('should still report actual undefined classes', async () => {
    // Create CSS with @theme
    const cssPath = path.join(tempDir, 'styles.css');
    fs.writeFileSync(cssPath, `
@import 'tailwindcss';

@theme {
    --color-primary: #0d2742;
    --font-display: 'Bebas Neue', sans-serif;
}
    `);

    // Create component with both valid and invalid classes
    const componentPath = path.join(tempDir, 'Test.jsx');
    fs.writeFileSync(componentPath, `
export default function Test() {
  return (
    <div className="bg-primary text-undefined-color font-display bg-nonexistent">
      Hello
    </div>
  );
}
    `);

    const eslint = new ESLint({
      overrideConfigFile: true,
      cwd: tempDir,  // Set the working directory
      overrideConfig: {
        files: ['**/*.jsx'],
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
              cssFiles: ['styles.css'],  // Relative to cwd
              ignoreTailwind: true,
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

    // Should report errors for undefined classes
    expect(messages.some(m => m.message.includes('text-undefined-color'))).toBe(true);
    expect(messages.some(m => m.message.includes('bg-nonexistent'))).toBe(true);
    
    // Should NOT report errors for @theme-generated classes
    expect(messages.some(m => m.message.includes('bg-primary'))).toBe(false);
    expect(messages.some(m => m.message.includes('font-display'))).toBe(false);
  });
});