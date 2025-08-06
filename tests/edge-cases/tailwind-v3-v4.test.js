const TailwindDetector = require('../../lib/utils/tailwind-detector');
const { extractClassesFromJSXAttribute } = require('../../lib/utils/class-extractor');

describe('Tailwind CSS v3 and v4 Edge Cases', () => {
  const detector = new TailwindDetector({ projectRoot: '.' });

  describe('Tailwind v3 Specific Patterns', () => {
    test('detects container queries (v3.2+)', () => {
      expect(detector.isTailwindClass('@container')).toBe(true);
      expect(detector.isTailwindClass('@lg:flex')).toBe(true);
      expect(detector.isTailwindClass('@md:grid-cols-2')).toBe(true);
      expect(detector.isTailwindClass('@container/sidebar')).toBe(true);
    });

    test('detects logical properties utilities', () => {
      expect(detector.isTailwindClass('ps-4')).toBe(true);
      expect(detector.isTailwindClass('pe-4')).toBe(true);
      expect(detector.isTailwindClass('ms-auto')).toBe(true);
      expect(detector.isTailwindClass('me-2')).toBe(true);
      expect(detector.isTailwindClass('start-0')).toBe(true);
      expect(detector.isTailwindClass('end-4')).toBe(true);
    });

    test('detects has: pseudo-class variants', () => {
      expect(detector.isTailwindClass('has-[:checked]:bg-blue-500')).toBe(true);
      expect(detector.isTailwindClass('has-[:focus]:ring-2')).toBe(true);
      expect(detector.isTailwindClass('group-has-[:checked]:text-blue-900')).toBe(true);
    });

    test('detects aria-* variants', () => {
      expect(detector.isTailwindClass('aria-checked:bg-blue-500')).toBe(true);
      expect(detector.isTailwindClass('aria-disabled:opacity-50')).toBe(true);
      expect(detector.isTailwindClass('aria-expanded:rotate-180')).toBe(true);
      expect(detector.isTailwindClass('aria-selected:bg-gray-100')).toBe(true);
      expect(detector.isTailwindClass('aria-[sort=ascending]:bg-blue-50')).toBe(true);
    });

    test('detects data-* attribute variants', () => {
      expect(detector.isTailwindClass('data-[state=open]:bg-white')).toBe(true);
      expect(detector.isTailwindClass('data-[disabled]:opacity-50')).toBe(true);
      expect(detector.isTailwindClass('data-[size=large]:p-8')).toBe(true);
      expect(detector.isTailwindClass('group-data-[state=open]:rotate-180')).toBe(true);
    });

    test('detects supports-* variants', () => {
      expect(detector.isTailwindClass('supports-[display:grid]:grid')).toBe(true);
      expect(detector.isTailwindClass('supports-[backdrop-filter]:backdrop-blur')).toBe(true);
      expect(detector.isTailwindClass('supports-[container-type:inline-size]:@container')).toBe(true);
    });

    test('detects min-*, max-* and range variants', () => {
      expect(detector.isTailwindClass('min-[320px]:text-sm')).toBe(true);
      expect(detector.isTailwindClass('max-[639px]:hidden')).toBe(true);
      expect(detector.isTailwindClass('min-[80ch]:text-lg')).toBe(true);
      expect(detector.isTailwindClass('max-[50rem]:flex-col')).toBe(true);
    });

    test('detects arbitrary properties', () => {
      expect(detector.isDynamicTailwindClass('[mask-type:luminance]')).toBe(true);
      expect(detector.isDynamicTailwindClass('[backdrop-filter:blur(10px)]')).toBe(true);
      expect(detector.isDynamicTailwindClass('[--my-var:100px]')).toBe(true);
      expect(detector.isDynamicTailwindClass('[counter-reset:section]')).toBe(true);
    });

    test('detects new color formats', () => {
      expect(detector.isDynamicTailwindClass('bg-[oklch(59%_0.2_233)]')).toBe(true);
      expect(detector.isDynamicTailwindClass('text-[color:oklch(70%_0.15_60)]')).toBe(true);
      expect(detector.isDynamicTailwindClass('border-[lab(50%_40_59)]')).toBe(true);
      expect(detector.isDynamicTailwindClass('from-[lch(70%_50_180)]')).toBe(true);
    });

    test('detects space and divide with arbitrary values', () => {
      expect(detector.isDynamicTailwindClass('space-x-[2.5rem]')).toBe(true);
      expect(detector.isDynamicTailwindClass('space-y-[clamp(1rem,5vw,3rem)]')).toBe(true);
      expect(detector.isDynamicTailwindClass('divide-x-[3px]')).toBe(true);
      expect(detector.isDynamicTailwindClass('divide-y-[calc(1rem-1px)]')).toBe(true);
    });

    test('detects line-clamp utilities', () => {
      expect(detector.isTailwindClass('line-clamp-1')).toBe(true);
      expect(detector.isTailwindClass('line-clamp-2')).toBe(true);
      expect(detector.isTailwindClass('line-clamp-3')).toBe(true);
      expect(detector.isTailwindClass('line-clamp-none')).toBe(true);
    });

    test('detects text-wrap utilities', () => {
      expect(detector.isTailwindClass('text-wrap')).toBe(true);
      expect(detector.isTailwindClass('text-nowrap')).toBe(true);
      expect(detector.isTailwindClass('text-balance')).toBe(true);
      expect(detector.isTailwindClass('text-pretty')).toBe(true);
    });
  });

  describe('Tailwind v4 Alpha Patterns', () => {
    test('detects new v4 color palette names', () => {
      // v4 uses new color names
      expect(detector.isTailwindClass('bg-gray-950')).toBe(true);
      expect(detector.isTailwindClass('text-zinc-950')).toBe(true);
      expect(detector.isTailwindClass('border-neutral-950')).toBe(true);
      expect(detector.isTailwindClass('ring-stone-950')).toBe(true);
    });

    test('detects new gradient color stops', () => {
      expect(detector.isTailwindClass('from-5%')).toBe(true);
      expect(detector.isTailwindClass('via-50%')).toBe(true);
      expect(detector.isTailwindClass('to-95%')).toBe(true);
      expect(detector.isDynamicTailwindClass('from-[13%]')).toBe(true);
    });

    test('detects new backdrop utilities', () => {
      expect(detector.isTailwindClass('backdrop-blur-3xl')).toBe(true);
      expect(detector.isTailwindClass('backdrop-saturate-200')).toBe(true);
      expect(detector.isTailwindClass('backdrop-brightness-200')).toBe(true);
    });

    test('detects forced-colors variants', () => {
      expect(detector.isTailwindClass('forced-colors:outline')).toBe(true);
      expect(detector.isTailwindClass('forced-colors:border-2')).toBe(true);
      expect(detector.isTailwindClass('forced-colors:text-[CanvasText]')).toBe(true);
    });

    test('detects modern pseudo-class variants', () => {
      expect(detector.isTailwindClass('in-range:border-green-500')).toBe(true);
      expect(detector.isTailwindClass('out-of-range:border-red-500')).toBe(true);
      expect(detector.isTailwindClass('placeholder-shown:border-gray-300')).toBe(true);
      expect(detector.isTailwindClass('autofill:bg-yellow-50')).toBe(true);
      expect(detector.isTailwindClass('user-invalid:border-red-500')).toBe(true);
    });
  });

  describe('Complex Tailwind Combinations', () => {
    test('detects stacked variants', () => {
      expect(detector.isTailwindClass('dark:md:hover:bg-gray-800')).toBe(true);
      expect(detector.isTailwindClass('sm:dark:disabled:opacity-50')).toBe(true);
      expect(detector.isTailwindClass('lg:hover:focus:ring-4')).toBe(true);
      expect(detector.isTailwindClass('group-hover:peer-checked:text-blue-500')).toBe(true);
    });

    test('detects peer and group modifiers with arbitrary names', () => {
      expect(detector.isTailwindClass('peer-checked/published:text-sky-500')).toBe(true);
      expect(detector.isTailwindClass('group-hover/item:visible')).toBe(true);
      expect(detector.isTailwindClass('peer-focus/email:ring-2')).toBe(true);
      expect(detector.isTailwindClass('group-[.is-published]/item:block')).toBe(true);
    });

    test('detects negative values with all utilities', () => {
      expect(detector.isTailwindClass('-inset-1')).toBe(true);
      expect(detector.isTailwindClass('-translate-x-1/2')).toBe(true);
      expect(detector.isTailwindClass('-rotate-12')).toBe(true);
      expect(detector.isTailwindClass('-skew-x-6')).toBe(true);
      expect(detector.isTailwindClass('-order-1')).toBe(true);
      expect(detector.isTailwindClass('-z-10')).toBe(true);
      expect(detector.isDynamicTailwindClass('-space-x-[5px]')).toBe(true);
    });

    test('detects fractional values', () => {
      expect(detector.isTailwindClass('w-1/2')).toBe(true);
      expect(detector.isTailwindClass('w-1/3')).toBe(true);
      expect(detector.isTailwindClass('w-2/3')).toBe(true);
      expect(detector.isTailwindClass('w-1/4')).toBe(true);
      expect(detector.isTailwindClass('w-11/12')).toBe(true);
      expect(detector.isTailwindClass('translate-x-1/2')).toBe(true);
      expect(detector.isTailwindClass('translate-y-1/4')).toBe(true);
    });

    test('detects calc and CSS functions in arbitrary values', () => {
      expect(detector.isDynamicTailwindClass('w-[calc(100%-2rem)]')).toBe(true);
      expect(detector.isDynamicTailwindClass('h-[min(100vh,800px)]')).toBe(true);
      expect(detector.isDynamicTailwindClass('max-w-[clamp(200px,50%,600px)]')).toBe(true);
      expect(detector.isDynamicTailwindClass('p-[max(1rem,2vw)]')).toBe(true);
      expect(detector.isDynamicTailwindClass('text-[clamp(1rem,2.5vw,2rem)]')).toBe(true);
    });

    test('detects CSS variable usage', () => {
      expect(detector.isDynamicTailwindClass('bg-[var(--primary-color)]')).toBe(true);
      expect(detector.isDynamicTailwindClass('text-[var(--text-color,#000)]')).toBe(true);
      expect(detector.isDynamicTailwindClass('w-[var(--sidebar-width)]')).toBe(true);
      expect(detector.isDynamicTailwindClass('h-[var(--header-height,4rem)]')).toBe(true);
    });

    test('detects animation utilities with arbitrary values', () => {
      expect(detector.isTailwindClass('animate-none')).toBe(true);
      expect(detector.isTailwindClass('animate-spin')).toBe(true);
      expect(detector.isTailwindClass('animate-ping')).toBe(true);
      expect(detector.isTailwindClass('animate-pulse')).toBe(true);
      expect(detector.isTailwindClass('animate-bounce')).toBe(true);
      expect(detector.isDynamicTailwindClass('animate-[wiggle_1s_ease-in-out_infinite]')).toBe(true);
      expect(detector.isDynamicTailwindClass('animate-[slideIn_0.5s_forwards]')).toBe(true);
    });

    test('detects content utilities with arbitrary values', () => {
      expect(detector.isTailwindClass('content-none')).toBe(true);
      expect(detector.isDynamicTailwindClass('content-[""]')).toBe(true);
      expect(detector.isDynamicTailwindClass('content-["→"]')).toBe(true);
      expect(detector.isDynamicTailwindClass('before:content-["*"]')).toBe(true);
      expect(detector.isDynamicTailwindClass('after:content-[attr(data-content)]')).toBe(true);
    });

    test('detects will-change utilities', () => {
      expect(detector.isTailwindClass('will-change-auto')).toBe(true);
      expect(detector.isTailwindClass('will-change-scroll')).toBe(true);
      expect(detector.isTailwindClass('will-change-contents')).toBe(true);
      expect(detector.isTailwindClass('will-change-transform')).toBe(true);
      expect(detector.isDynamicTailwindClass('will-change-[opacity,transform]')).toBe(true);
    });
  });

  describe('Non-Tailwind Classes (Should Not Match)', () => {
    test('does not match custom BEM classes', () => {
      expect(detector.isTailwindClass('header__nav')).toBe(false);
      expect(detector.isTailwindClass('button--primary')).toBe(false);
      expect(detector.isTailwindClass('card__body--expanded')).toBe(false);
      expect(detector.isTailwindClass('menu-item--active')).toBe(false);
    });

    test('does not match Bootstrap-like classes', () => {
      expect(detector.isTailwindClass('col-md-6')).toBe(false);
      expect(detector.isTailwindClass('btn-success')).toBe(false);
      expect(detector.isTailwindClass('alert-warning')).toBe(false);
      expect(detector.isTailwindClass('navbar-expand-lg')).toBe(false);
    });

    test('does not match semantic class names', () => {
      expect(detector.isTailwindClass('navigation')).toBe(false);
      expect(detector.isTailwindClass('sidebar')).toBe(false);
      expect(detector.isTailwindClass('footer')).toBe(false);
      expect(detector.isTailwindClass('logo')).toBe(false);
      expect(detector.isTailwindClass('hero-section')).toBe(false);
    });
  });

  describe('Edge Cases in Class Extraction', () => {
    test('handles classes with special characters in arbitrary values', () => {
      const node = {
        value: {
          type: 'Literal',
          value: 'bg-[url("/image.jpg")] hover:bg-[url("/image-hover.jpg")]'
        }
      };
      
      const classes = extractClassesFromJSXAttribute(node);
      expect(classes).toContain('bg-[url("/image.jpg")]');
      expect(classes).toContain('hover:bg-[url("/image-hover.jpg")]');
    });

    test('handles whitespace in arbitrary values correctly', () => {
      const node = {
        value: {
          type: 'Literal',
          value: 'shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]'
        }
      };
      
      const classes = extractClassesFromJSXAttribute(node);
      expect(classes).toContain('shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]');
    });

    test('handles escaped characters in content', () => {
      const node = {
        value: {
          type: 'Literal',
          value: 'before:content-[\\"\\\\2192\\"] after:content-[\\"\\"]'
        }
      };
      
      const classes = extractClassesFromJSXAttribute(node);
      expect(classes.length).toBeGreaterThan(0);
    });

    test('handles multiple arbitrary values in one class', () => {
      const node = {
        value: {
          type: 'Literal',
          value: 'grid-cols-[1fr_500px_2fr] gap-[10px_20px]'
        }
      };
      
      const classes = extractClassesFromJSXAttribute(node);
      expect(classes).toContain('grid-cols-[1fr_500px_2fr]');
      expect(classes).toContain('gap-[10px_20px]');
    });
  });

  describe('shouldIgnoreClass Integration', () => {
    test('correctly identifies Tailwind classes to ignore', () => {
      const testCases = [
        // Should be ignored (Tailwind classes)
        { class: 'flex', shouldIgnore: true },
        { class: 'hover:bg-blue-500', shouldIgnore: true },
        { class: 'md:grid-cols-3', shouldIgnore: true },
        { class: 'w-[100px]', shouldIgnore: true },
        { class: 'animate-[fadeIn_1s]', shouldIgnore: true },
        { class: 'aria-checked:bg-blue-500', shouldIgnore: true },
        { class: 'data-[state=open]:block', shouldIgnore: true },
        
        // Should NOT be ignored (custom classes)
        { class: 'my-custom-class', shouldIgnore: false },
        { class: 'btn-primary-custom', shouldIgnore: false },
        { class: 'header__nav', shouldIgnore: false },
      ];

      testCases.forEach(({ class: className, shouldIgnore }) => {
        const result = detector.shouldIgnoreClass(className, {
          ignoreTailwind: true,
          requireTailwindConfig: false
        });
        expect(result).toBe(shouldIgnore);
      });
    });
  });
});