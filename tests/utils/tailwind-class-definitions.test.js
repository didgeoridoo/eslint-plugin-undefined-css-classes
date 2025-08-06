const { isValidTailwindClass } = require('../../lib/utils/tailwind-class-definitions');

describe('Tailwind Class Definitions', () => {
  describe('isValidTailwindClass', () => {
    test('detects basic utility classes', () => {
      expect(isValidTailwindClass('flex')).toBe(true);
      expect(isValidTailwindClass('block')).toBe(true);
      expect(isValidTailwindClass('hidden')).toBe(true);
      expect(isValidTailwindClass('inline-flex')).toBe(true);
      expect(isValidTailwindClass('grid')).toBe(true);
    });

    test('detects spacing utilities', () => {
      expect(isValidTailwindClass('p-4')).toBe(true);
      expect(isValidTailwindClass('m-2')).toBe(true);
      expect(isValidTailwindClass('px-6')).toBe(true);
      expect(isValidTailwindClass('my-8')).toBe(true);
      expect(isValidTailwindClass('mt-4')).toBe(true);
      expect(isValidTailwindClass('-mt-4')).toBe(true);
      expect(isValidTailwindClass('space-x-4')).toBe(true);
      expect(isValidTailwindClass('gap-2')).toBe(true);
    });

    test('detects sizing utilities with all variants', () => {
      // Basic sizes
      expect(isValidTailwindClass('w-full')).toBe(true);
      expect(isValidTailwindClass('h-screen')).toBe(true);
      expect(isValidTailwindClass('w-1/2')).toBe(true);
      expect(isValidTailwindClass('h-auto')).toBe(true);
      
      // Size variants that were previously failing
      expect(isValidTailwindClass('max-w-xs')).toBe(true);
      expect(isValidTailwindClass('max-w-sm')).toBe(true);
      expect(isValidTailwindClass('max-w-md')).toBe(true);
      expect(isValidTailwindClass('max-w-lg')).toBe(true);
      expect(isValidTailwindClass('max-w-xl')).toBe(true);
      expect(isValidTailwindClass('max-w-2xl')).toBe(true);
      expect(isValidTailwindClass('max-w-3xl')).toBe(true);
      expect(isValidTailwindClass('max-w-4xl')).toBe(true);
      expect(isValidTailwindClass('max-w-5xl')).toBe(true);
      expect(isValidTailwindClass('max-w-6xl')).toBe(true);
      expect(isValidTailwindClass('max-w-7xl')).toBe(true);
      
      // Special max-width values
      expect(isValidTailwindClass('max-w-none')).toBe(true);
      expect(isValidTailwindClass('max-w-prose')).toBe(true);
      expect(isValidTailwindClass('max-w-screen-lg')).toBe(true);
      
      // Min width/height
      expect(isValidTailwindClass('min-w-full')).toBe(true);
      expect(isValidTailwindClass('min-h-screen')).toBe(true);
    });

    test('detects color utilities', () => {
      expect(isValidTailwindClass('text-blue-500')).toBe(true);
      expect(isValidTailwindClass('bg-gray-100')).toBe(true);
      expect(isValidTailwindClass('border-red-600')).toBe(true);
      expect(isValidTailwindClass('text-black')).toBe(true);
      expect(isValidTailwindClass('bg-white')).toBe(true);
      expect(isValidTailwindClass('text-transparent')).toBe(true);
      
      // Custom theme colors should NOT be accepted by Tailwind detector
      // These should be found in actual CSS files
      expect(isValidTailwindClass('text-primary')).toBe(false);
      expect(isValidTailwindClass('bg-surface')).toBe(false);
      expect(isValidTailwindClass('text-surface-tertiary')).toBe(false);
      expect(isValidTailwindClass('bg-brand-500')).toBe(false);
      expect(isValidTailwindClass('text-inverse')).toBe(false);
    });

    test('detects typography utilities', () => {
      expect(isValidTailwindClass('text-xs')).toBe(true);
      expect(isValidTailwindClass('text-sm')).toBe(true);
      expect(isValidTailwindClass('text-base')).toBe(true);
      expect(isValidTailwindClass('text-lg')).toBe(true);
      expect(isValidTailwindClass('text-xl')).toBe(true);
      expect(isValidTailwindClass('text-2xl')).toBe(true);
      expect(isValidTailwindClass('text-3xl')).toBe(true);
      expect(isValidTailwindClass('text-4xl')).toBe(true);
      
      // Text alignment
      expect(isValidTailwindClass('text-left')).toBe(true);
      expect(isValidTailwindClass('text-center')).toBe(true);
      expect(isValidTailwindClass('text-right')).toBe(true);
      expect(isValidTailwindClass('text-justify')).toBe(true);
      
      // Font utilities
      expect(isValidTailwindClass('font-sans')).toBe(true);
      expect(isValidTailwindClass('font-serif')).toBe(true);
      expect(isValidTailwindClass('font-mono')).toBe(true);
      expect(isValidTailwindClass('font-bold')).toBe(true);
      expect(isValidTailwindClass('font-medium')).toBe(true);
    });

    test('detects flexbox and grid utilities', () => {
      expect(isValidTailwindClass('flex-row')).toBe(true);
      expect(isValidTailwindClass('flex-col')).toBe(true);
      expect(isValidTailwindClass('flex-wrap')).toBe(true);
      expect(isValidTailwindClass('items-center')).toBe(true);
      expect(isValidTailwindClass('justify-between')).toBe(true);
      expect(isValidTailwindClass('grid-cols-3')).toBe(true);
      expect(isValidTailwindClass('col-span-2')).toBe(true);
      expect(isValidTailwindClass('gap-4')).toBe(true);
    });

    test('detects container utility', () => {
      expect(isValidTailwindClass('container')).toBe(true);
    });

    test('detects arbitrary values', () => {
      expect(isValidTailwindClass('w-[100px]')).toBe(true);
      expect(isValidTailwindClass('h-[50vh]')).toBe(true);
      expect(isValidTailwindClass('text-[14px]')).toBe(true);
      expect(isValidTailwindClass('bg-[#1da1f2]')).toBe(true);
      expect(isValidTailwindClass('p-[2.5rem]')).toBe(true);
    });

    test('detects variant modifiers', () => {
      expect(isValidTailwindClass('hover:bg-blue-600')).toBe(true);
      expect(isValidTailwindClass('focus:outline-none')).toBe(true);
      expect(isValidTailwindClass('sm:flex')).toBe(true);
      expect(isValidTailwindClass('md:hidden')).toBe(true);
      expect(isValidTailwindClass('lg:grid-cols-3')).toBe(true);
      expect(isValidTailwindClass('xl:text-2xl')).toBe(true);
      expect(isValidTailwindClass('2xl:container')).toBe(true);
      expect(isValidTailwindClass('dark:bg-gray-800')).toBe(true);
      expect(isValidTailwindClass('group-hover:text-blue-500')).toBe(true);
    });

    test('detects important modifier', () => {
      expect(isValidTailwindClass('!mt-4')).toBe(true);
      expect(isValidTailwindClass('!text-center')).toBe(true);
      expect(isValidTailwindClass('!bg-red-500')).toBe(true);
    });

    test('detects combined modifiers', () => {
      expect(isValidTailwindClass('sm:hover:bg-blue-600')).toBe(true);
      expect(isValidTailwindClass('dark:md:text-white')).toBe(true);
      expect(isValidTailwindClass('group-hover:md:text-lg')).toBe(true);
    });

    test('detects border and outline utilities', () => {
      expect(isValidTailwindClass('border')).toBe(true);
      expect(isValidTailwindClass('border-2')).toBe(true);
      expect(isValidTailwindClass('border-t-4')).toBe(true);
      expect(isValidTailwindClass('border-solid')).toBe(true);
      expect(isValidTailwindClass('border-dashed')).toBe(true);
      expect(isValidTailwindClass('rounded')).toBe(true);
      expect(isValidTailwindClass('rounded-lg')).toBe(true);
      expect(isValidTailwindClass('rounded-full')).toBe(true);
      expect(isValidTailwindClass('ring-2')).toBe(true);
      expect(isValidTailwindClass('ring-offset-2')).toBe(true);
    });

    test('detects transform utilities', () => {
      expect(isValidTailwindClass('scale-50')).toBe(true);
      expect(isValidTailwindClass('scale-x-100')).toBe(true);
      expect(isValidTailwindClass('rotate-45')).toBe(true);
      expect(isValidTailwindClass('translate-x-4')).toBe(true);
      expect(isValidTailwindClass('translate-y-1/2')).toBe(true);
      expect(isValidTailwindClass('skew-x-12')).toBe(true);
    });

    test('detects position utilities', () => {
      expect(isValidTailwindClass('absolute')).toBe(true);
      expect(isValidTailwindClass('relative')).toBe(true);
      expect(isValidTailwindClass('fixed')).toBe(true);
      expect(isValidTailwindClass('sticky')).toBe(true);
      expect(isValidTailwindClass('top-0')).toBe(true);
      expect(isValidTailwindClass('right-4')).toBe(true);
      expect(isValidTailwindClass('bottom-2')).toBe(true);
      expect(isValidTailwindClass('left-1/2')).toBe(true);
      expect(isValidTailwindClass('inset-0')).toBe(true);
      expect(isValidTailwindClass('z-10')).toBe(true);
    });

    test('detects overflow utilities', () => {
      expect(isValidTailwindClass('overflow-auto')).toBe(true);
      expect(isValidTailwindClass('overflow-hidden')).toBe(true);
      expect(isValidTailwindClass('overflow-x-scroll')).toBe(true);
      expect(isValidTailwindClass('overflow-y-auto')).toBe(true);
    });

    test('rejects non-Tailwind classes', () => {
      expect(isValidTailwindClass('my-custom-class')).toBe(false);
      expect(isValidTailwindClass('header')).toBe(false);
      expect(isValidTailwindClass('container-custom')).toBe(false);
      expect(isValidTailwindClass('btn-primary-custom')).toBe(false);
      expect(isValidTailwindClass('foo-bar')).toBe(false);
    });

    test('detects negative values', () => {
      expect(isValidTailwindClass('-mt-4')).toBe(true);
      expect(isValidTailwindClass('-mx-2')).toBe(true);
      expect(isValidTailwindClass('-translate-x-1/2')).toBe(true);
      expect(isValidTailwindClass('-rotate-45')).toBe(true);
      expect(isValidTailwindClass('-skew-x-6')).toBe(true);
    });

    test('detects animation utilities', () => {
      expect(isValidTailwindClass('animate-spin')).toBe(true);
      expect(isValidTailwindClass('animate-ping')).toBe(true);
      expect(isValidTailwindClass('animate-pulse')).toBe(true);
      expect(isValidTailwindClass('animate-bounce')).toBe(true);
      expect(isValidTailwindClass('animate-none')).toBe(true);
    });

    test('detects transition utilities', () => {
      expect(isValidTailwindClass('transition')).toBe(true);
      expect(isValidTailwindClass('transition-all')).toBe(true);
      expect(isValidTailwindClass('transition-colors')).toBe(true);
      expect(isValidTailwindClass('duration-200')).toBe(true);
      expect(isValidTailwindClass('ease-in-out')).toBe(true);
      expect(isValidTailwindClass('delay-150')).toBe(true);
    });

    test('detects filter utilities', () => {
      expect(isValidTailwindClass('blur')).toBe(true);
      expect(isValidTailwindClass('blur-sm')).toBe(true);
      expect(isValidTailwindClass('brightness-50')).toBe(true);
      expect(isValidTailwindClass('contrast-125')).toBe(true);
      expect(isValidTailwindClass('grayscale')).toBe(true);
      expect(isValidTailwindClass('hue-rotate-90')).toBe(true);
      expect(isValidTailwindClass('invert')).toBe(true);
      expect(isValidTailwindClass('saturate-150')).toBe(true);
      expect(isValidTailwindClass('sepia')).toBe(true);
    });

    test('detects backdrop filter utilities', () => {
      expect(isValidTailwindClass('backdrop-blur-md')).toBe(true);
      expect(isValidTailwindClass('backdrop-brightness-75')).toBe(true);
      expect(isValidTailwindClass('backdrop-contrast-200')).toBe(true);
    });

    test('detects shadow utilities', () => {
      expect(isValidTailwindClass('shadow')).toBe(true);
      expect(isValidTailwindClass('shadow-md')).toBe(true);
      expect(isValidTailwindClass('shadow-lg')).toBe(true);
      expect(isValidTailwindClass('shadow-xl')).toBe(true);
      expect(isValidTailwindClass('shadow-2xl')).toBe(true);
      expect(isValidTailwindClass('shadow-inner')).toBe(true);
      expect(isValidTailwindClass('shadow-none')).toBe(true);
    });

    test('detects opacity utilities', () => {
      expect(isValidTailwindClass('opacity-0')).toBe(true);
      expect(isValidTailwindClass('opacity-50')).toBe(true);
      expect(isValidTailwindClass('opacity-100')).toBe(true);
    });

    test('detects cursor utilities', () => {
      expect(isValidTailwindClass('cursor-pointer')).toBe(true);
      expect(isValidTailwindClass('cursor-default')).toBe(true);
      expect(isValidTailwindClass('cursor-not-allowed')).toBe(true);
      expect(isValidTailwindClass('cursor-grab')).toBe(true);
    });

    test('detects select utilities', () => {
      expect(isValidTailwindClass('select-none')).toBe(true);
      expect(isValidTailwindClass('select-text')).toBe(true);
      expect(isValidTailwindClass('select-all')).toBe(true);
    });

    test('detects accessibility utilities', () => {
      expect(isValidTailwindClass('sr-only')).toBe(true);
      expect(isValidTailwindClass('not-sr-only')).toBe(true);
    });
  });
});