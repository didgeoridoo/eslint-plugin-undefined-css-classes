/**
 * Comprehensive Tailwind CSS class definitions
 * Based on Tailwind CSS v3/v4 utilities
 * Organized by actual class prefixes for accurate matching
 */

// Import the official Tailwind scales
const {
  borderWidthScale,
  ringWidthScale,
  outlineWidthScale,
  divideWidthScale,
  spacingScale,
  textSizeScale,
  sizeScale,
  sizeFractions,
  colorNames,
  colorScales
} = require('./tailwind-scales');

// Aliases for backward compatibility
const spacing = spacingScale;
const colors = colorNames;
const sizes = sizeScale;  // Use sizeScale for width/height utilities
const textSizes = textSizeScale;  // Keep text sizes separate
const fractions = [...sizeFractions, 'full'];

/**
 * Map of Tailwind class patterns
 * Key is the prefix, value is array of valid suffixes or validation functions
 */
const classPatterns = {
  // Display
  'block': true,
  'inline-block': true,
  'inline': true,
  'flex': true,
  'inline-flex': true,
  'table': true,
  'inline-table': true,
  'table-caption': true,
  'table-cell': true,
  'table-column': true,
  'table-column-group': true,
  'table-footer-group': true,
  'table-header-group': true,
  'table-row-group': true,
  'table-row': true,
  'flow-root': true,
  'grid': true,
  'inline-grid': true,
  'contents': true,
  'list-item': true,
  'hidden': true,
  
  // Container
  'container': true,
  
  // Position
  'static': true,
  'fixed': true,
  'absolute': true,
  'relative': true,
  'sticky': true,
  
  // Visibility
  'visible': true,
  'invisible': true,
  'collapse': true,
  
  // Isolation
  'isolate': true,
  'isolation-auto': true,
  
  // Overflow
  'overflow': ['auto', 'hidden', 'clip', 'visible', 'scroll'],
  'overflow-x': ['auto', 'hidden', 'clip', 'visible', 'scroll'],
  'overflow-y': ['auto', 'hidden', 'clip', 'visible', 'scroll'],
  
  // Z-index
  'z': ['0', '10', '20', '30', '40', '50', 'auto'],
  
  // Flexbox
  'flex-row': true,
  'flex-row-reverse': true,
  'flex-col': true,
  'flex-col-reverse': true,
  'flex-wrap': true,
  'flex-wrap-reverse': true,
  'flex-nowrap': true,
  'flex-1': true,
  'flex-auto': true,
  'flex-initial': true,
  'flex-none': true,
  'flex-grow': true,
  'flex-grow-0': true,
  'flex-shrink': true,
  'flex-shrink-0': true,
  
  // Grid
  'grid-cols': ['none', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'subgrid'],
  'grid-rows': ['none', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'subgrid'],
  'col-span': ['auto', 'full', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  'col-start': ['auto', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
  'col-end': ['auto', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
  'row-span': ['auto', 'full', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  'row-start': ['auto', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
  'row-end': ['auto', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
  'grid-flow': ['row', 'col', 'dense', 'row-dense', 'col-dense'],
  
  // Gap
  'gap': spacing,
  'gap-x': spacing,
  'gap-y': spacing,
  
  // Justify & Align
  'justify-start': true,
  'justify-end': true,
  'justify-center': true,
  'justify-between': true,
  'justify-around': true,
  'justify-evenly': true,
  'justify-stretch': true,
  'justify-items-start': true,
  'justify-items-end': true,
  'justify-items-center': true,
  'justify-items-stretch': true,
  'justify-self-auto': true,
  'justify-self-start': true,
  'justify-self-end': true,
  'justify-self-center': true,
  'justify-self-stretch': true,
  'items-start': true,
  'items-end': true,
  'items-center': true,
  'items-baseline': true,
  'items-stretch': true,
  'content-normal': true,
  'content-center': true,
  'content-start': true,
  'content-end': true,
  'content-between': true,
  'content-around': true,
  'content-evenly': true,
  'content-baseline': true,
  'content-stretch': true,
  'self-auto': true,
  'self-start': true,
  'self-end': true,
  'self-center': true,
  'self-stretch': true,
  'self-baseline': true,
  'place-content-center': true,
  'place-content-start': true,
  'place-content-end': true,
  'place-content-between': true,
  'place-content-around': true,
  'place-content-evenly': true,
  'place-content-baseline': true,
  'place-content-stretch': true,
  'place-items-start': true,
  'place-items-end': true,
  'place-items-center': true,
  'place-items-baseline': true,
  'place-items-stretch': true,
  'place-self-auto': true,
  'place-self-start': true,
  'place-self-end': true,
  'place-self-center': true,
  'place-self-stretch': true,
  
  // Padding
  'p': spacing,
  'px': spacing,
  'py': spacing,
  'ps': spacing,
  'pe': spacing,
  'pt': spacing,
  'pr': spacing,
  'pb': spacing,
  'pl': spacing,
  
  // Margin
  'm': spacing,
  'mx': spacing,
  'my': spacing,
  'ms': spacing,
  'me': spacing,
  'mt': spacing,
  'mr': spacing,
  'mb': spacing,
  'ml': spacing,
  
  // Space between
  'space-x': spacing,
  'space-y': spacing,
  'space-x-reverse': true,
  'space-y-reverse': true,
  
  // Width
  'w': [...spacing, 'auto', 'full', 'screen', 'svw', 'lvw', 'dvw', 'min', 'max', 'fit', ...fractions],
  'min-w': ['0', 'full', 'min', 'max', 'fit', ...sizes],
  'max-w': ['0', 'none', ...sizes, 'full', 'min', 'max', 'fit', 'prose', 'screen-sm', 'screen-md', 'screen-lg', 'screen-xl', 'screen-2xl'],
  
  // Height
  'h': [...spacing, 'auto', 'full', 'screen', 'svh', 'lvh', 'dvh', 'min', 'max', 'fit', ...fractions],
  'min-h': ['0', 'full', 'screen', 'svh', 'lvh', 'dvh', 'min', 'max', 'fit'],
  'max-h': [...spacing, 'none', 'full', 'screen', 'svh', 'lvh', 'dvh', 'min', 'max', 'fit'],
  
  // Size
  'size': [...spacing, 'auto', 'full', 'min', 'max', 'fit'],
  
  // Typography
  'font-sans': true,
  'font-serif': true,
  'font-mono': true,
  // Text sizes - defined individually for clarity
  ...textSizes.map(size => [`text-${size}`, true]).reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
  'text-left': true,
  'text-center': true,
  'text-right': true,
  'text-justify': true,
  'text-start': true,
  'text-end': true,
  'font-thin': true,
  'font-extralight': true,
  'font-light': true,
  'font-normal': true,
  'font-medium': true,
  'font-semibold': true,
  'font-bold': true,
  'font-extrabold': true,
  'font-black': true,
  'italic': true,
  'not-italic': true,
  'uppercase': true,
  'lowercase': true,
  'capitalize': true,
  'normal-case': true,
  'truncate': true,
  'text-ellipsis': true,
  'text-clip': true,
  'text-wrap': true,
  'text-nowrap': true,
  'text-balance': true,
  'text-pretty': true,
  'break-normal': true,
  'break-words': true,
  'break-all': true,
  'break-keep': true,
  'leading': ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose', '3', '4', '5', '6', '7', '8', '9', '10'],
  'tracking': ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'],
  'line-clamp': ['none', '1', '2', '3', '4', '5', '6'],
  'indent': spacing,
  'underline': true,
  'overline': true,
  'line-through': true,
  'no-underline': true,
  'decoration': ['solid', 'double', 'dotted', 'dashed', 'wavy', 'auto', 'from-font', '0', '1', '2', '4', '8'],
  'underline-offset': ['auto', '0', '1', '2', '4', '8'],
  'whitespace': ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces'],
  'hyphens': ['none', 'manual', 'auto'],
  
  // Colors (text, bg, border, etc.)
  'text': [...colors, ...colors.flatMap(c => ['inherit', 'current', 'transparent', 'black', 'white'].includes(c) ? [] : colorScales.map(s => `${c}-${s}`))],
  'bg': [...colors, ...colors.flatMap(c => ['inherit', 'current', 'transparent', 'black', 'white'].includes(c) ? [] : colorScales.map(s => `${c}-${s}`))],
  // Border utilities - use proper borderWidthScale!
  'border': ['', ...borderWidthScale, ...colors, ...colors.flatMap(c => ['inherit', 'current', 'transparent', 'black', 'white'].includes(c) ? [] : colorScales.map(s => `${c}-${s}`))],
  'border-x': ['', ...borderWidthScale],
  'border-y': ['', ...borderWidthScale],
  'border-s': ['', ...borderWidthScale],
  'border-e': ['', ...borderWidthScale],
  'border-t': ['', ...borderWidthScale],
  'border-r': ['', ...borderWidthScale],
  'border-b': ['', ...borderWidthScale],
  'border-l': ['', ...borderWidthScale],
  'border-solid': true,
  'border-dashed': true,
  'border-dotted': true,
  'border-double': true,
  'border-hidden': true,
  'border-none': true,
  'divide-x': ['', ...divideWidthScale, 'reverse'],
  'divide-y': ['', ...divideWidthScale, 'reverse'],
  'divide': [...colors, ...colors.flatMap(c => ['inherit', 'current', 'transparent', 'black', 'white'].includes(c) ? [] : colorScales.map(s => `${c}-${s}`))],
  'divide-solid': true,
  'divide-dashed': true,
  'divide-dotted': true,
  'divide-double': true,
  'divide-none': true,
  'ring': ['', ...ringWidthScale, 'inset', ...colors, ...colors.flatMap(c => ['inherit', 'current', 'transparent', 'black', 'white'].includes(c) ? [] : colorScales.map(s => `${c}-${s}`))],
  'ring-offset': [...ringWidthScale, ...colors, ...colors.flatMap(c => ['inherit', 'current', 'transparent', 'black', 'white'].includes(c) ? [] : colorScales.map(s => `${c}-${s}`))],
  'outline': ['none', ...outlineWidthScale, ...colors, ...colors.flatMap(c => ['inherit', 'current', 'transparent', 'black', 'white'].includes(c) ? [] : colorScales.map(s => `${c}-${s}`))],
  'outline-none': true,
  'outline-solid': true,
  'outline-dashed': true,
  'outline-dotted': true,
  'outline-double': true,
  'outline-offset': [...outlineWidthScale],
  'fill': [...colors, ...colors.flatMap(c => ['inherit', 'current', 'transparent', 'black', 'white'].includes(c) ? [] : colorScales.map(s => `${c}-${s}`))],
  'stroke': [...colors, ...colors.flatMap(c => ['inherit', 'current', 'transparent', 'black', 'white'].includes(c) ? [] : colorScales.map(s => `${c}-${s}`))],
  'stroke-0': true,
  'stroke-1': true,
  'stroke-2': true,
  
  // Border radius
  'rounded': ['', 'none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'],
  'rounded-s': ['none', 'sm', '', 'md', 'lg', 'xl', '2xl', '3xl', 'full'],
  'rounded-e': ['none', 'sm', '', 'md', 'lg', 'xl', '2xl', '3xl', 'full'],
  'rounded-t': ['none', 'sm', '', 'md', 'lg', 'xl', '2xl', '3xl', 'full'],
  'rounded-r': ['none', 'sm', '', 'md', 'lg', 'xl', '2xl', '3xl', 'full'],
  'rounded-b': ['none', 'sm', '', 'md', 'lg', 'xl', '2xl', '3xl', 'full'],
  'rounded-l': ['none', 'sm', '', 'md', 'lg', 'xl', '2xl', '3xl', 'full'],
  'rounded-tl': ['none', 'sm', '', 'md', 'lg', 'xl', '2xl', '3xl', 'full'],
  'rounded-tr': ['none', 'sm', '', 'md', 'lg', 'xl', '2xl', '3xl', 'full'],
  'rounded-br': ['none', 'sm', '', 'md', 'lg', 'xl', '2xl', '3xl', 'full'],
  'rounded-bl': ['none', 'sm', '', 'md', 'lg', 'xl', '2xl', '3xl', 'full'],
  
  // Position values
  'top': [...spacing, 'auto', 'full', ...fractions],
  'right': [...spacing, 'auto', 'full', ...fractions],
  'bottom': [...spacing, 'auto', 'full', ...fractions],
  'left': [...spacing, 'auto', 'full', ...fractions],
  'inset': [...spacing, 'auto', 'full', ...fractions],
  'inset-x': [...spacing, 'auto', 'full', ...fractions],
  'inset-y': [...spacing, 'auto', 'full', ...fractions],
  
  // Shadow
  'shadow': ['', 'sm', 'md', 'lg', 'xl', '2xl', 'inner', 'none', ...colors, ...colors.flatMap(c => ['inherit', 'current', 'transparent', 'black', 'white'].includes(c) ? [] : colorScales.map(s => `${c}-${s}`))],
  'drop-shadow': ['', 'sm', 'md', 'lg', 'xl', '2xl', 'none'],
  
  // Opacity
  'opacity': ['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80', '85', '90', '95', '100'],
  
  // Filters
  'blur': ['', 'none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
  'brightness': ['0', '50', '75', '90', '95', '100', '105', '110', '125', '150', '200'],
  'contrast': ['0', '50', '75', '100', '125', '150', '200'],
  'grayscale': ['', '0'],
  'hue-rotate': ['0', '15', '30', '60', '90', '180'],
  'invert': ['', '0'],
  'saturate': ['0', '50', '100', '150', '200'],
  'sepia': ['', '0'],
  
  // Backdrop filters
  'backdrop-blur': ['', 'none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
  'backdrop-brightness': ['0', '50', '75', '90', '95', '100', '105', '110', '125', '150', '200'],
  'backdrop-contrast': ['0', '50', '75', '100', '125', '150', '200'],
  'backdrop-grayscale': ['', '0'],
  'backdrop-hue-rotate': ['0', '15', '30', '60', '90', '180'],
  'backdrop-invert': ['', '0'],
  'backdrop-opacity': ['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80', '85', '90', '95', '100'],
  'backdrop-saturate': ['0', '50', '100', '150', '200'],
  'backdrop-sepia': ['', '0'],
  
  // Transform
  'transform': true,
  'transform-none': true,
  'scale': ['0', '50', '75', '90', '95', '100', '105', '110', '125', '150'],
  'scale-x': ['0', '50', '75', '90', '95', '100', '105', '110', '125', '150'],
  'scale-y': ['0', '50', '75', '90', '95', '100', '105', '110', '125', '150'],
  'rotate': ['0', '1', '2', '3', '6', '12', '45', '90', '180'],
  'translate-x': [...spacing, 'full', ...fractions],
  'translate-y': [...spacing, 'full', ...fractions],
  'skew-x': ['0', '1', '2', '3', '6', '12'],
  'skew-y': ['0', '1', '2', '3', '6', '12'],
  'origin': ['center', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left', 'top-left'],
  
  // Transition & Animation
  'transition': ['', 'none', 'all', 'colors', 'opacity', 'shadow', 'transform'],
  'duration': ['0', '75', '100', '150', '200', '300', '500', '700', '1000'],
  'ease': ['linear', 'in', 'out', 'in-out'],
  'delay': ['0', '75', '100', '150', '200', '300', '500', '700', '1000'],
  'animate': ['none', 'spin', 'ping', 'pulse', 'bounce'],
  
  // Cursor
  'cursor': ['auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed', 'none', 'context-menu', 'progress', 'cell', 'crosshair', 'vertical-text', 'alias', 'copy', 'no-drop', 'grab', 'grabbing', 'all-scroll', 'col-resize', 'row-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'zoom-in', 'zoom-out'],
  
  // User select
  'select': ['none', 'text', 'all', 'auto'],
  
  // Resize
  'resize': ['', 'none', 'y', 'x'],
  
  // Scroll
  'scroll': ['auto', 'smooth'],
  'scroll-m': spacing,
  'scroll-mx': spacing,
  'scroll-my': spacing,
  'scroll-ms': spacing,
  'scroll-me': spacing,
  'scroll-mt': spacing,
  'scroll-mr': spacing,
  'scroll-mb': spacing,
  'scroll-ml': spacing,
  'scroll-p': spacing,
  'scroll-px': spacing,
  'scroll-py': spacing,
  'scroll-ps': spacing,
  'scroll-pe': spacing,
  'scroll-pt': spacing,
  'scroll-pr': spacing,
  'scroll-pb': spacing,
  'scroll-pl': spacing,
  'snap': ['start', 'end', 'center', 'align-none', 'normal', 'always'],
  'snap-x': true,
  'snap-y': true,
  'snap-both': true,
  'snap-mandatory': true,
  'snap-proximity': true,
  'snap-none': true,
  
  // Accessibility
  'sr-only': true,
  'not-sr-only': true,
  
  // Other utilities
  'appearance-none': true,
  'pointer-events-none': true,
  'pointer-events-auto': true,
  'will-change': ['auto', 'scroll', 'contents', 'transform'],
  'filter': true,
  'filter-none': true,
  'backdrop-filter': true,
  'backdrop-filter-none': true,
  
  // Aspect ratio
  'aspect': ['auto', 'square', 'video'],
  
  // Columns
  'columns': ['auto', '3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  
  // Break
  'break-after': ['auto', 'avoid', 'all', 'avoid-page', 'page', 'left', 'right', 'column'],
  'break-before': ['auto', 'avoid', 'all', 'avoid-page', 'page', 'left', 'right', 'column'],
  'break-inside': ['auto', 'avoid', 'avoid-page', 'avoid-column'],
  
  // Box
  'box-border': true,
  'box-content': true,
  'box-decoration-clone': true,
  'box-decoration-slice': true,
  
  // Float & Clear
  'float-right': true,
  'float-left': true,
  'float-none': true,
  'float-start': true,
  'float-end': true,
  'clear-left': true,
  'clear-right': true,
  'clear-both': true,
  'clear-none': true,
  'clear-start': true,
  'clear-end': true,
  
  // Object
  'object-contain': true,
  'object-cover': true,
  'object-fill': true,
  'object-none': true,
  'object-scale-down': true,
  'object-bottom': true,
  'object-center': true,
  'object-left': true,
  'object-left-bottom': true,
  'object-left-top': true,
  'object-right': true,
  'object-right-bottom': true,
  'object-right-top': true,
  'object-top': true,
  
  // List
  'list-inside': true,
  'list-outside': true,
  'list-none': true,
  'list-disc': true,
  'list-decimal': true,
  
  // Table
  'table-auto': true,
  'table-fixed': true,
  'caption-top': true,
  'caption-bottom': true,
  'border-collapse': true,
  'border-separate': true,
  'border-spacing': spacing,
  
  // Align
  'align-baseline': true,
  'align-top': true,
  'align-middle': true,
  'align-bottom': true,
  'align-text-top': true,
  'align-text-bottom': true,
  'align-sub': true,
  'align-super': true,
  
  // Mix blend
  'mix-blend-normal': true,
  'mix-blend-multiply': true,
  'mix-blend-screen': true,
  'mix-blend-overlay': true,
  'mix-blend-darken': true,
  'mix-blend-lighten': true,
  'mix-blend-color-dodge': true,
  'mix-blend-color-burn': true,
  'mix-blend-hard-light': true,
  'mix-blend-soft-light': true,
  'mix-blend-difference': true,
  'mix-blend-exclusion': true,
  'mix-blend-hue': true,
  'mix-blend-saturation': true,
  'mix-blend-color': true,
  'mix-blend-luminosity': true,
  
  // Background
  'bg-fixed': true,
  'bg-local': true,
  'bg-scroll': true,
  'bg-clip-border': true,
  'bg-clip-padding': true,
  'bg-clip-content': true,
  'bg-clip-text': true,
  'bg-origin-border': true,
  'bg-origin-padding': true,
  'bg-origin-content': true,
  'bg-transparent': true,
  'bg-current': true,
  'bg-inherit': true,
  'bg-black': true,
  'bg-white': true,
  'bg-auto': true,
  'bg-cover': true,
  'bg-contain': true,
  'bg-repeat': true,
  'bg-no-repeat': true,
  'bg-repeat-x': true,
  'bg-repeat-y': true,
  'bg-repeat-round': true,
  'bg-repeat-space': true,
  'bg-bottom': true,
  'bg-center': true,
  'bg-left': true,
  'bg-left-bottom': true,
  'bg-left-top': true,
  'bg-right': true,
  'bg-right-bottom': true,
  'bg-right-top': true,
  'bg-top': true,
  'bg-gradient-to-t': true,
  'bg-gradient-to-tr': true,
  'bg-gradient-to-r': true,
  'bg-gradient-to-br': true,
  'bg-gradient-to-b': true,
  'bg-gradient-to-bl': true,
  'bg-gradient-to-l': true,
  'bg-gradient-to-tl': true,
  'bg-none': true,
  
  // From/Via/To (gradients)
  'from': [...colors, ...colors.flatMap(c => ['inherit', 'current', 'transparent', 'black', 'white'].includes(c) ? [] : colorScales.map(s => `${c}-${s}`))],
  'via': [...colors, ...colors.flatMap(c => ['inherit', 'current', 'transparent', 'black', 'white'].includes(c) ? [] : colorScales.map(s => `${c}-${s}`))],
  'to': [...colors, ...colors.flatMap(c => ['inherit', 'current', 'transparent', 'black', 'white'].includes(c) ? [] : colorScales.map(s => `${c}-${s}`))],
  
  // Accent & Caret
  'accent': [...colors, ...colors.flatMap(c => ['inherit', 'current', 'transparent', 'black', 'white'].includes(c) ? [] : colorScales.map(s => `${c}-${s}`))],
  'caret': [...colors, ...colors.flatMap(c => ['inherit', 'current', 'transparent', 'black', 'white'].includes(c) ? [] : colorScales.map(s => `${c}-${s}`))],
  
  // Placeholder
  'placeholder': [...colors, ...colors.flatMap(c => ['inherit', 'current', 'transparent', 'black', 'white'].includes(c) ? [] : colorScales.map(s => `${c}-${s}`))],
  
  // Overscroll
  'overscroll-auto': true,
  'overscroll-contain': true,
  'overscroll-none': true,
  'overscroll-x-auto': true,
  'overscroll-x-contain': true,
  'overscroll-x-none': true,
  'overscroll-y-auto': true,
  'overscroll-y-contain': true,
  'overscroll-y-none': true,
  
  // Touch
  'touch-auto': true,
  'touch-none': true,
  'touch-pan-x': true,
  'touch-pan-left': true,
  'touch-pan-right': true,
  'touch-pan-y': true,
  'touch-pan-up': true,
  'touch-pan-down': true,
  'touch-pinch-zoom': true,
  'touch-manipulation': true,
  
  // Screen readers
  'forced-color-adjust-auto': true,
  'forced-color-adjust-none': true,
};

/**
 * Check if a class name is a valid Tailwind class
 */
function isValidTailwindClass(fullClassName) {
  // Handle important modifier
  if (fullClassName.startsWith('!')) {
    return isValidTailwindClass(fullClassName.slice(1));
  }
  
  // Handle variant modifiers (hover:, sm:, etc.)
  const parts = fullClassName.split(':');
  const className = parts[parts.length - 1];
  
  // If there are modifiers, validate them
  if (parts.length > 1) {
    const modifiers = parts.slice(0, -1);
    const validModifiers = [
      // Responsive
      'sm', 'md', 'lg', 'xl', '2xl',
      // Pseudo-classes
      'hover', 'focus', 'focus-within', 'focus-visible', 'active', 'visited', 'target',
      'first', 'last', 'only', 'odd', 'even', 'first-of-type', 'last-of-type', 'only-of-type',
      'empty', 'disabled', 'enabled', 'checked', 'indeterminate', 'default',
      'required', 'valid', 'invalid', 'in-range', 'out-of-range', 'placeholder-shown',
      'autofill', 'read-only', 'user-invalid',
      // Pseudo-elements
      'before', 'after', 'first-letter', 'first-line', 'marker', 'selection', 'file', 'backdrop', 'placeholder',
      // Theme
      'dark', 'light',
      // Motion
      'motion-safe', 'motion-reduce',
      // Contrast
      'contrast-more', 'contrast-less',
      // Orientation
      'portrait', 'landscape',
      // Print
      'print', 'screen',
      // Direction
      'rtl', 'ltr',
      // Forced colors
      'forced-colors'
    ];
    
    for (const modifier of modifiers) {
      // Check for group/peer modifiers
      if (modifier.startsWith('group') || modifier.startsWith('peer')) {
        continue;
      }
      // Check for arbitrary modifiers
      if (modifier.startsWith('[') && modifier.endsWith(']')) {
        continue;
      }
      // Check standard modifiers
      if (!validModifiers.includes(modifier)) {
        return false;
      }
    }
  }
  
  // Check for negative values
  const isNegative = className.startsWith('-');
  const positiveClass = isNegative ? className.slice(1) : className;
  
  // Check if it's a simple class (no dash)
  if (classPatterns[positiveClass] === true) {
    return true;
  }
  
  // Check if it's in the patterns with values
  if (Array.isArray(classPatterns[positiveClass])) {
    return true;
  }
  
  // Check classes with prefixes and values (e.g., p-4, text-blue-500, grid-cols-3)
  // We need to try different dash positions for multi-part prefixes
  const checkPrefixSuffix = (prefix, suffix) => {
    // Check for arbitrary values (e.g., w-[100px], bg-[#fff])
    if (suffix.startsWith('[') && suffix.endsWith(']')) {
      // Check if the prefix accepts arbitrary values
      const arbitraryAllowed = [
        'w', 'h', 'min-w', 'max-w', 'min-h', 'max-h', 'size',
        'p', 'px', 'py', 'ps', 'pe', 'pt', 'pr', 'pb', 'pl',
        'm', 'mx', 'my', 'ms', 'me', 'mt', 'mr', 'mb', 'ml',
        'gap', 'gap-x', 'gap-y', 'space-x', 'space-y',
        'top', 'right', 'bottom', 'left', 'inset', 'inset-x', 'inset-y',
        'text', 'bg', 'border', 'ring', 'outline', 'fill', 'stroke', 'divide',
        'shadow', 'opacity', 'blur', 'brightness', 'contrast', 'grayscale',
        'hue-rotate', 'saturate', 'scale', 'scale-x', 'scale-y',
        'rotate', 'translate-x', 'translate-y', 'skew-x', 'skew-y',
        'backdrop-blur', 'backdrop-brightness', 'backdrop-contrast',
        'backdrop-grayscale', 'backdrop-hue-rotate', 'backdrop-opacity',
        'backdrop-saturate', 'duration', 'delay', 'rounded',
        'rounded-s', 'rounded-e', 'rounded-t', 'rounded-r', 'rounded-b', 'rounded-l',
        'rounded-tl', 'rounded-tr', 'rounded-br', 'rounded-bl',
        'border-x', 'border-y', 'border-s', 'border-e', 'border-t', 'border-r', 'border-b', 'border-l',
        'from', 'via', 'to', 'accent', 'caret', 'placeholder',
        'scroll-m', 'scroll-mx', 'scroll-my', 'scroll-ms', 'scroll-me',
        'scroll-mt', 'scroll-mr', 'scroll-mb', 'scroll-ml',
        'scroll-p', 'scroll-px', 'scroll-py', 'scroll-ps', 'scroll-pe',
        'scroll-pt', 'scroll-pr', 'scroll-pb', 'scroll-pl',
        'grid-cols', 'grid-rows', 'col-span', 'col-start', 'col-end',
        'row-span', 'row-start', 'row-end', 'columns', 'aspect',
        'border-spacing', 'indent', 'scroll', 'snap', 'will-change',
        'decoration', 'underline-offset', 'leading', 'tracking', 'line-clamp'
      ];
      
      if (arbitraryAllowed.includes(prefix)) {
        return true;
      }
      return false;
    }
    
    // Check if prefix exists in patterns
    if (classPatterns[prefix]) {
      
      // If it's true, the prefix alone is valid
      if (classPatterns[prefix] === true) {
        return false; // Prefix exists but doesn't take suffixes
      }
      
      // If it's an array, check if suffix is valid
      if (Array.isArray(classPatterns[prefix])) {
        // Direct match
        if (classPatterns[prefix].includes(suffix)) {
          return true;
        }
        
        // Check for color patterns (e.g., blue-500)
        const colorMatch = suffix.match(/^([a-z]+)-(\d{2,3})$/);
        if (colorMatch) {
          const [, color, scale] = colorMatch;
          if (colors.includes(color) && colorScales.includes(scale)) {
            return true;
          }
        }
        
        // Check if it's just a color
        if (colors.includes(suffix)) {
          return true;
        }
        
        // DO NOT automatically accept custom color names!
        // Custom classes like text-primary or bg-surface should be
        // defined in actual CSS files and will be handled by the CSS parser
        
        // Check if it's a spacing value (but NOT for utilities with their own scales!)
        // These utilities have their own specific scales and shouldn't use generic spacing
        const hasOwnScale = ['border', 'border-x', 'border-y', 'border-t', 'border-r', 'border-b', 'border-l', 'border-s', 'border-e',
                             'ring', 'ring-offset', 'divide', 'divide-x', 'divide-y', 
                             'outline', 'outline-offset',
                             'grid-cols', 'grid-rows', 'columns'].includes(prefix);
        
        if (!hasOwnScale && spacing.includes(suffix)) {
          return true;
        }
        
        // Check if it's a number (for utilities that accept any number)
        if (/^\d+$/.test(suffix)) {
          // Grid columns/rows accept any number up to 12
          if (['grid-cols', 'grid-rows'].includes(prefix)) {
            const num = parseInt(suffix);
            const result = num >= 1 && num <= 12;
            return result;
          }
          // Columns utility
          if (prefix === 'columns') {
            const num = parseInt(suffix);
            return num >= 1 && num <= 12;
          }
          // z-index and order have specific values
          if (prefix === 'z' && ['0', '10', '20', '30', '40', '50'].includes(suffix)) {
            return true;
          }
          if (prefix === 'order' && parseInt(suffix) >= 1 && parseInt(suffix) <= 12) {
            return true;
          }
        }
        
        // Check if it's a fraction
        if (/^\d+\/\d+$/.test(suffix)) {
          return true;
        }
      }
    }
    return false;
  };
  
  // Try to find the right prefix-suffix split
  // For multi-part prefixes like 'grid-cols', we need to try different positions
  const dashPositions = [];
  let pos = -1;
  while ((pos = positiveClass.indexOf('-', pos + 1)) !== -1) {
    dashPositions.push(pos);
  }
  
  // Try each possible split point
  for (const dashIndex of dashPositions) {
    const prefix = positiveClass.substring(0, dashIndex);
    const suffix = positiveClass.substring(dashIndex + 1);
    
    if (checkPrefixSuffix(prefix, suffix)) {
      return true;
    }
  }
  
  // Allow negative values for certain utilities
  if (isNegative) {
    const negativeAllowed = [
      'top', 'right', 'bottom', 'left', 'inset', 'inset-x', 'inset-y',
      'translate-x', 'translate-y',
      'rotate', 'skew-x', 'skew-y',
      'scale', 'scale-x', 'scale-y',
      'm', 'mx', 'my', 'ms', 'me', 'mt', 'mr', 'mb', 'ml',
      'space-x', 'space-y',
      'scroll-m', 'scroll-mx', 'scroll-my', 'scroll-ms', 'scroll-me', 'scroll-mt', 'scroll-mr', 'scroll-mb', 'scroll-ml'
    ];
    
    for (const prefix of negativeAllowed) {
      if (positiveClass.startsWith(prefix + '-')) {
        const value = positiveClass.substring(prefix.length + 1);
        if (classPatterns[prefix]) {
          if (Array.isArray(classPatterns[prefix]) && classPatterns[prefix].includes(value)) {
            return true;
          }
          if (spacing.includes(value) || /^\d+$/.test(value) || /^\d+\/\d+$/.test(value)) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
}

module.exports = {
  isValidTailwindClass
};