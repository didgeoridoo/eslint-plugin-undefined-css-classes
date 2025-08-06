const fs = require('fs');
const path = require('path');

class TailwindDetector {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.configFiles = [
      'tailwind.config.js',
      'tailwind.config.cjs',
      'tailwind.config.mjs',
      'tailwind.config.ts'
    ];
    this.cache = null;
  }

  hasTailwindConfig() {
    if (this.cache !== null) {
      return this.cache;
    }

    // Check for Tailwind config files (v3 and earlier)
    for (const configFile of this.configFiles) {
      const configPath = path.join(this.projectRoot, configFile);
      if (fs.existsSync(configPath)) {
        this.cache = true;
        return true;
      }
    }

    // Check for Tailwind in package.json
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        };
        
        if ('tailwindcss' in deps) {
          this.cache = true;
          return true;
        }
      } catch (error) {
        console.warn('Failed to parse package.json:', error.message);
      }
    }

    // Check for Tailwind in PostCSS config
    const postcssConfigPath = path.join(this.projectRoot, 'postcss.config.js');
    if (fs.existsSync(postcssConfigPath)) {
      try {
        const content = fs.readFileSync(postcssConfigPath, 'utf-8');
        if (content.includes('tailwindcss')) {
          this.cache = true;
          return true;
        }
      } catch (error) {
        console.warn('Failed to read postcss.config.js:', error.message);
      }
    }

    // Check for Tailwind 4 in CSS files (new detection)
    const cssFiles = this.findCSSFilesWithTailwind4();
    if (cssFiles.length > 0) {
      this.cache = true;
      return true;
    }

    this.cache = false;
    return false;
  }

  findCSSFilesWithTailwind4() {
    const glob = require('glob');
    const cssFiles = glob.sync('**/*.css', {
      cwd: this.projectRoot,
      ignore: ['**/node_modules/**'],
      absolute: true
    });

    const tailwind4Files = [];
    for (const file of cssFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        // Check for Tailwind 4 indicators
        if (
          content.includes('@import "tailwindcss"') ||
          content.includes('@import \'tailwindcss\'') ||
          content.includes('@import `tailwindcss`') ||
          content.includes('@import tailwindcss') ||
          content.includes('@theme {') ||
          content.includes('@theme{') ||
          content.includes('@import "tailwindcss/theme"') ||
          content.includes('@import "tailwindcss/utilities"')
        ) {
          tailwind4Files.push(file);
        }
      } catch {
        // Silently ignore files we can't read
      }
    }
    return tailwind4Files;
  }

  isTailwindClass(className) {
    const tailwindPatterns = [
      // Responsive breakpoints
      /^(xs|sm|md|lg|xl|2xl):/,
      
      // State variants
      /^(hover|focus|active|disabled|visited|first|last|odd|even|focus-within|focus-visible):/,
      /^(checked|indeterminate|default|required|valid|invalid|in-range|out-of-range):/,
      /^(placeholder-shown|autofill|read-only|user-invalid):/,
      
      // Theme and media variants
      /^(dark|light|motion-safe|motion-reduce|print|screen|portrait|landscape):/,
      /^(forced-colors):/,
      
      // Pseudo-element variants
      /^(before|after|first-letter|first-line|marker|selection|file|placeholder|backdrop):/,
      
      // Group and peer variants (including named groups)
      /^(group|peer)(-[a-z]+)?(-hover|-focus|-checked|-disabled|\/).*:/,
      /^(group|peer)\[.*\].*:/,
      /^(group|peer)(-\[.*\])?\/[a-z]+:.*$/,
      
      // ARIA variants
      /^aria-(checked|disabled|expanded|hidden|pressed|readonly|required|selected):/,
      /^aria-\[.*\]:/,
      
      // Data attribute variants
      /^data-\[.*\]:/,
      /^group-data-\[.*\]:/,
      /^peer-data-\[.*\]:/,
      
      // Container queries
      /^@(container|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl):/,
      /^@\[.*\]:/,
      
      // Min/max breakpoints
      /^(min|max)-\[.*\]:/,
      
      // Supports queries
      /^supports-\[.*\]:/,
      
      // Has pseudo-class
      /^has-\[.*\]:/,
      /^group-has-\[.*\]:/,
      
      // Spacing utilities (including logical properties)
      /^-?(m|p|w|h|min-w|max-w|min-h|max-h)[tlrbxy]?-\d+$/,
      /^-?(m|p|w|h|min-w|max-w|min-h|max-h)[tlrbxy]?-(px|auto|full|screen|min|max|fit)$/,
      /^(w|h|min-w|max-w|min-h|max-h)-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)$/,
      /^max-w-(none|prose|screen-sm|screen-md|screen-lg|screen-xl|screen-2xl)$/,
      /^(ps|pe|ms|me|start|end)-\d+$/,
      /^(ps|pe|ms|me|start|end)-(px|auto|full)$/,
      /^(text|bg|border|ring|divide|outline|from|via|to|placeholder|caret|accent|fill|stroke)-(transparent|current|black|white|inherit|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate)(-\d{2,3})?/,
      /^(text|bg|border|ring|divide|outline|from|via|to|placeholder|caret|accent|fill|stroke)-([a-z]+)(-\d{2,3})?$/,
      /^(text|bg|border|ring|divide|outline)-(opacity|spacing)-\d+$/,
      /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/,
      /^text-(left|center|right|justify|start|end)$/,
      /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
      /^font-(sans|serif|mono)$/,
      /^(flex|grid|table|hidden|block|inline|inline-block|inline-flex|inline-grid|flow-root)$/,
      /^(static|fixed|absolute|relative|sticky)$/,
      /^(container)$/,
      /^(visible|invisible|collapse)$/,
      /^overflow-(auto|hidden|visible|scroll|clip|x-auto|y-auto|x-hidden|y-hidden|x-visible|y-visible|x-scroll|y-scroll|x-clip|y-clip)$/,
      /^(z|opacity|order|col|row)-(auto|\d+)$/,
      /^(rounded|border|shadow|opacity|transition|duration|ease|delay|animate|transform|scale|rotate|translate|skew|origin)(-\w+)?$/,
      /^rounded-(none|sm|md|lg|xl|2xl|3xl|full)$/,
      /^border-(solid|dashed|dotted|double|none)$/,
      /^border-[tlrbxy]?-\d+$/,
      /^-skew-[xy]-\d+$/,
      /^(backdrop)-(blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia)(-\w+)?$/,
      /^(space|gap|inset|top|right|bottom|left)-[xy]?-?\d+$/,
      /^(space|gap|inset|top|right|bottom|left)-[xy]?-(px|auto|full)$/,
      /^(decoration|underline|overline|line-through|no-underline)$/,
      /^(uppercase|lowercase|capitalize|normal-case)$/,
      /^(truncate|text-ellipsis|text-clip)$/,
      /^(break-normal|break-words|break-all|break-keep)$/,
      /^(list-none|list-disc|list-decimal|list-inside|list-outside)$/,
      /^(appearance-none|outline-none|resize-none|select-none|pointer-events-none)$/,
      /^(cursor-\w+)$/,
      /^(select-\w+)$/,
      /^(sr-only|not-sr-only)$/,
      /^(isolate|isolation-auto)$/,
      /^(mix-blend-\w+)$/,
      /^(filter|blur|brightness|contrast|grayscale|hue-rotate|invert|saturate|sepia|backdrop-\w+)$/,
      /^(items|justify|content|self|place)-(start|end|center|between|around|evenly|stretch|baseline|auto)/,
      /^(justify-items|justify-self|align-content|align-items|align-self)-(start|end|center|stretch|baseline|auto)/,
      /^(line-clamp)-(none|\d+)$/,
      /^(text)-(wrap|nowrap|balance|pretty)$/,
      /^(will-change)-(auto|scroll|contents|transform)$/,
      /^(content)-(none)$/,
      /^(align)-(baseline|top|middle|bottom|text-top|text-bottom)/,
      /^(flex)-(row|row-reverse|col|col-reverse|wrap|wrap-reverse|nowrap|1|auto|initial|none|grow|grow-0|shrink|shrink-0)$/,
      /^(grid-cols|grid-rows)-(none|\d+|subgrid)$/,
      /^(col|row)-(auto|span-\d+|start-\d+|end-\d+)$/,
      /^gap-[xy]?-\d+$/,
      /^(from|via|to)-(\d{1,3})%$/,
      /^(w|h)-(\d+)\/(\d+)$/,
      /^-?(translate|scale|rotate|skew)-[xy]?-(\d+)\/(\d+)$/,
      /^-?(translate)-[xy]-1\/2$/,
      /^-?(inset|top|right|bottom|left|z|order|translate|rotate|skew|scale)-(\d+|auto|px|full)$/,
      /^(animate)-(none|spin|ping|pulse|bounce)$/,
      /^!.*$/,
      /^\[.+\]$/,
      /^-\w+$/,
      /^@container(\/[a-z]+)?$/,
      
      // Additional common utilities
      /^object-(contain|cover|fill|none|scale-down|bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top)$/,
      /^overflow-(auto|hidden|clip|visible|scroll)$/,
      /^overscroll-(auto|contain|none)$/,
      /^(leading|tracking)-(tight|snug|normal|relaxed|loose|wide|wider|widest)$/,
      /^whitespace-(normal|nowrap|pre|pre-line|pre-wrap|break-spaces)$/,
      /^break-(after|before|inside)-(auto|avoid|all|avoid-page|page|left|right|column)$/,
      /^box-(border|content)$/,
      /^float-(left|right|none)$/,
      /^clear-(left|right|both|none)$/,
      /^aspect-(auto|square|video)$/,
      /^columns-\d+$/,
      /^scroll-(auto|smooth)$/,
      /^snap-(start|end|center|align-none|normal|always|proximity|mandatory)$/,
      /^touch-(auto|none|manipulation)$/,
      /^resize(-[xy])?$/,
      /^accent-(auto|current|transparent|black|white)$/,
      /^appearance-none$/,
      /^outline-(none|\d+|dashed|dotted|double)$/,
      /^outline-offset-\d+$/,
      /^ring(-\d+)?$/,
      /^ring-(inset|offset-\d+)$/,
      /^divide-[xy](-\d+)?$/,
      /^divide-(solid|dashed|dotted|double|none)$/,
      /^border-collapse$/,
      /^border-separate$/,
      /^table-(auto|fixed)$/,
      /^caption-(top|bottom)$/,
      /^isolate$/,
      /^isolation-auto$/,
      /^mix-blend-(normal|multiply|screen|overlay|darken|lighten|color-dodge|color-burn|hard-light|soft-light|difference|exclusion|hue|saturation|color|luminosity)$/,
      /^bg-(fixed|local|scroll)$/,
      /^bg-(clip|origin)-(border|padding|content|text)$/,
      /^bg-(bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top)$/,
      /^bg-(no-repeat|repeat|repeat-x|repeat-y|repeat-round|repeat-space)$/,
      /^bg-(auto|cover|contain)$/,
      /^bg-gradient-to-(t|tr|r|br|b|bl|l|tl)$/,
      /^decoration-(solid|double|dotted|dashed|wavy)$/,
      /^decoration-(from-font|\d+)$/,
      /^underline-offset-(auto|\d+)$/,
      /^indent-\d+$/,
      /^align-(sub|super)$/,
      /^(hyphens)-(none|manual|auto)$/,
      /^(text-wrap|text-nowrap|text-balance|text-pretty)$/,
      /^(break-all|break-keep|break-words)$/
    ];

    return tailwindPatterns.some(pattern => pattern.test(className));
  }

  isDynamicTailwindClass(className) {
    if (className.includes('${') || className.includes('{{')) {
      return true;
    }

    const dynamicPatterns = [
      // Color values with various formats
      /^(text|bg|border|ring|from|via|to|fill|stroke|outline|decoration|divide|placeholder|caret|accent)-\[#[0-9a-fA-F]{3,8}\]$/,
      /^(text|bg|border|ring|from|via|to|fill|stroke)-\[rgb\(.+\)\]$/,
      /^(text|bg|border|ring|from|via|to|fill|stroke)-\[rgba\(.+\)\]$/,
      /^(text|bg|border|ring|from|via|to|fill|stroke)-\[hsl\(.+\)\]$/,
      /^(text|bg|border|ring|from|via|to|fill|stroke)-\[hsla\(.+\)\]$/,
      /^(text|bg|border|ring|from|via|to|fill|stroke)-\[oklch\(.+\)\]$/,
      /^(text|bg|border|ring|from|via|to|fill|stroke)-\[lab\(.+\)\]$/,
      /^(text|bg|border|ring|from|via|to|fill|stroke)-\[lch\(.+\)\]$/,
      /^(text|bg|border|ring|from|via|to|fill|stroke)-\[color:.+\]$/,
      /^(text|bg|border|ring|from|via|to|fill|stroke)-\[var\(.+\)\]$/,
      
      // Spacing and sizing with arbitrary values
      /^-?(w|h|min-w|max-w|min-h|max-h|p|m|top|right|bottom|left|inset|gap|space|text|leading|tracking|indent|scroll|size)[tlrbxy]?-\[.+\]$/,
      /^-?(space|divide)-[xy]-\[.+\]$/,
      
      // Transform utilities with arbitrary values
      /^-?(translate|scale|rotate|skew)-[xy]?-\[.+\]$/,
      
      // Grid and flexbox with arbitrary values
      /^(grid-cols|grid-rows|gap|basis|grow|shrink|order)-\[.+\]$/,
      
      // Animation with arbitrary values
      /^animate-\[.+\]$/,
      
      // Content with arbitrary values
      /^(content|before:content|after:content)-\[.+\]$/,
      
      // Will-change with arbitrary values
      /^will-change-\[.+\]$/,
      
      // Gradient color stops percentages
      /^(from|via|to)-\[\d+%\]$/,
      
      // Arbitrary properties
      /^\[.+:.+\]$/,
      
      // Shadow with arbitrary values
      /^(shadow|drop-shadow)-\[.+\]$/,
      
      // Outline with arbitrary values
      /^outline-\[.+\]$/,
      
      // Background with arbitrary values (images, gradients)
      /^bg-\[url\(.+\)\]$/,
      /^bg-\[image:.+\]$/,
      /^bg-\[length:.+\]$/,
      /^bg-\[position:.+\]$/,
      
      // Before/after content
      /^(before|after):.+$/
    ];

    return dynamicPatterns.some(pattern => pattern.test(className));
  }

  shouldIgnoreClass(className, options = {}) {
    if (!options.ignoreTailwind) {
      return false;
    }

    if (!this.hasTailwindConfig() && options.requireTailwindConfig !== false) {
      return false;
    }

    // Check if it's a standard Tailwind class or dynamic class
    if (this.isTailwindClass(className) || this.isDynamicTailwindClass(className)) {
      return true;
    }

    // Check for custom Tailwind patterns (e.g., custom colors from @theme)
    // These are common patterns for custom utilities defined in @theme
    const customTailwindPatterns = [
      // Custom color utilities (e.g., text-primary, bg-surface-tertiary)
      /^(text|bg|border|ring|from|via|to|fill|stroke|outline|decoration|divide|placeholder|caret|accent)-[a-z]+(-[a-z]+)*$/,
      // Custom color with numeric variants (e.g., text-brand-500)
      /^(text|bg|border|ring|from|via|to|fill|stroke|outline|decoration|divide|placeholder|caret|accent)-[a-z]+(-[a-z]+)*-\d{2,3}$/,
    ];

    return customTailwindPatterns.some(pattern => pattern.test(className));
  }

  clearCache() {
    this.cache = null;
  }
}

module.exports = TailwindDetector;