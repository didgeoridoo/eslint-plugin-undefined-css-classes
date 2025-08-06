const fs = require('fs');
const path = require('path');
const { isValidTailwindClass } = require('./tailwind-class-definitions');
const LRUCache = require('./lru-cache');

class TailwindDetector {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.configFiles = [
      'tailwind.config.js',
      'tailwind.config.cjs',
      'tailwind.config.mjs',
      'tailwind.config.ts'
    ];
    this.configCache = null;  // For config detection result
    this.themeClassesCache = null;  // For theme-generated classes
    // Use LRU cache for class validation results (default 200 entries)
    this.classCache = new LRUCache(options.classCacheSize || 200);
    this.useComprehensiveCheck = options.useComprehensiveCheck !== false;
  }

  hasTailwindConfig() {
    if (this.configCache !== null) {
      return this.configCache;
    }

    // Check for Tailwind config files (v3 and earlier)
    for (const configFile of this.configFiles) {
      const configPath = path.join(this.projectRoot, configFile);
      if (fs.existsSync(configPath)) {
        this.configCache = true;
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
          this.configCache = true;
          return true;
        }
      } catch (error) {
        // Silently fail - package.json parsing errors are non-critical
        if (process.env.DEBUG) {
          process.stderr.write(`[DEBUG] Failed to parse package.json: ${error.message}\n`);
        }
      }
    }

    // Check for Tailwind in PostCSS config
    const postcssConfigPath = path.join(this.projectRoot, 'postcss.config.js');
    if (fs.existsSync(postcssConfigPath)) {
      try {
        const content = fs.readFileSync(postcssConfigPath, 'utf-8');
        if (content.includes('tailwindcss')) {
          this.configCache = true;
          return true;
        }
      } catch (error) {
        // Silently fail - PostCSS config errors are non-critical
        if (process.env.DEBUG) {
          process.stderr.write(`[DEBUG] Failed to read postcss.config.js: ${error.message}\n`);
        }
      }
    }

    // Check for Tailwind 4 in CSS files (new detection)
    const cssFiles = this.findCSSFilesWithTailwind4();
    if (cssFiles.length > 0) {
      this.configCache = true;
      return true;
    }

    this.configCache = false;
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

  parseThemeVariables(cssContent) {
    // Parse @theme block to extract CSS variables that generate utilities
    const themeVariables = {
      colors: new Set(),
      fonts: new Set(),
      spacing: new Set(),
      radius: new Set(),
      shadows: new Set()
    };

    // Match @theme block
    const themeMatch = cssContent.match(/@theme\s*{([^}]*)}/s);
    if (!themeMatch) return themeVariables;

    const themeContent = themeMatch[1];
    const variableRegex = /--([\w-]+):\s*[^;]+;/g;
    let match;

    while ((match = variableRegex.exec(themeContent)) !== null) {
      const varName = match[1];
      
      // Extract color variables (generate bg-, text-, border-, ring-, etc.)
      if (varName.startsWith('color-')) {
        const colorName = varName.replace('color-', '');
        themeVariables.colors.add(colorName);
      }
      // Also handle single-word color names like 'canvas', 'surface', etc.
      else if (varName.match(/^(color-)?(canvas|surface|background|foreground|primary|secondary|accent|muted|success|warning|error|info)(-\w+)?$/)) {
        themeVariables.colors.add(varName.replace(/^color-/, ''));
      }
      // Font variables (generate font- utilities)
      else if (varName.startsWith('font-')) {
        const fontName = varName.replace('font-', '');
        themeVariables.fonts.add(fontName);
      }
      // Spacing variables (generate p-, m-, gap-, space- utilities)
      else if (varName.startsWith('spacing-')) {
        const spacingName = varName.replace('spacing-', '');
        themeVariables.spacing.add(spacingName);
      }
      // Border radius variables (generate rounded- utilities)
      else if (varName.startsWith('radius-')) {
        const radiusName = varName.replace('radius-', '');
        themeVariables.radius.add(radiusName);
      }
      // Shadow variables (generate shadow- utilities)
      else if (varName.startsWith('shadow-')) {
        const shadowName = varName.replace('shadow-', '');
        themeVariables.shadows.add(shadowName);
      }
    }

    return themeVariables;
  }

  getThemeGeneratedClasses() {
    // Cache theme-generated classes
    if (this.themeClassesCache) {
      return this.themeClassesCache;
    }

    const generatedClasses = new Set();
    
    // Find and parse CSS files with @theme blocks
    const cssFiles = this.findCSSFilesWithTailwind4();
    
    for (const file of cssFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        if (content.includes('@theme')) {
          const themeVars = this.parseThemeVariables(content);
          
          // Generate color utilities
          for (const color of themeVars.colors) {
            // Background colors
            generatedClasses.add(`bg-${color}`);
            // Text colors
            generatedClasses.add(`text-${color}`);
            // Border colors
            generatedClasses.add(`border-${color}`);
            generatedClasses.add(`border-t-${color}`);
            generatedClasses.add(`border-r-${color}`);
            generatedClasses.add(`border-b-${color}`);
            generatedClasses.add(`border-l-${color}`);
            generatedClasses.add(`border-x-${color}`);
            generatedClasses.add(`border-y-${color}`);
            // Ring colors
            generatedClasses.add(`ring-${color}`);
            generatedClasses.add(`ring-offset-${color}`);
            // Outline colors
            generatedClasses.add(`outline-${color}`);
            // Divide colors
            generatedClasses.add(`divide-${color}`);
            // Placeholder colors
            generatedClasses.add(`placeholder-${color}`);
            // Caret colors
            generatedClasses.add(`caret-${color}`);
            // Accent colors
            generatedClasses.add(`accent-${color}`);
            // Fill and stroke for SVG
            generatedClasses.add(`fill-${color}`);
            generatedClasses.add(`stroke-${color}`);
            // Decoration colors
            generatedClasses.add(`decoration-${color}`);
            // Shadow colors
            generatedClasses.add(`shadow-${color}`);
            // From/via/to gradient colors
            generatedClasses.add(`from-${color}`);
            generatedClasses.add(`via-${color}`);
            generatedClasses.add(`to-${color}`);
          }
          
          // Generate font utilities
          for (const font of themeVars.fonts) {
            generatedClasses.add(`font-${font}`);
          }
          
          // Generate spacing utilities
          for (const spacing of themeVars.spacing) {
            // Padding
            generatedClasses.add(`p-${spacing}`);
            generatedClasses.add(`pt-${spacing}`);
            generatedClasses.add(`pr-${spacing}`);
            generatedClasses.add(`pb-${spacing}`);
            generatedClasses.add(`pl-${spacing}`);
            generatedClasses.add(`px-${spacing}`);
            generatedClasses.add(`py-${spacing}`);
            // Margin (including negative)
            generatedClasses.add(`m-${spacing}`);
            generatedClasses.add(`mt-${spacing}`);
            generatedClasses.add(`mr-${spacing}`);
            generatedClasses.add(`mb-${spacing}`);
            generatedClasses.add(`ml-${spacing}`);
            generatedClasses.add(`mx-${spacing}`);
            generatedClasses.add(`my-${spacing}`);
            generatedClasses.add(`-m-${spacing}`);
            generatedClasses.add(`-mt-${spacing}`);
            generatedClasses.add(`-mr-${spacing}`);
            generatedClasses.add(`-mb-${spacing}`);
            generatedClasses.add(`-ml-${spacing}`);
            generatedClasses.add(`-mx-${spacing}`);
            generatedClasses.add(`-my-${spacing}`);
            // Gap
            generatedClasses.add(`gap-${spacing}`);
            generatedClasses.add(`gap-x-${spacing}`);
            generatedClasses.add(`gap-y-${spacing}`);
            // Space between
            generatedClasses.add(`space-x-${spacing}`);
            generatedClasses.add(`space-y-${spacing}`);
            // Width and height
            generatedClasses.add(`w-${spacing}`);
            generatedClasses.add(`h-${spacing}`);
            // Min/max dimensions
            generatedClasses.add(`min-w-${spacing}`);
            generatedClasses.add(`min-h-${spacing}`);
            generatedClasses.add(`max-w-${spacing}`);
            generatedClasses.add(`max-h-${spacing}`);
            // Inset
            generatedClasses.add(`top-${spacing}`);
            generatedClasses.add(`right-${spacing}`);
            generatedClasses.add(`bottom-${spacing}`);
            generatedClasses.add(`left-${spacing}`);
            generatedClasses.add(`inset-${spacing}`);
            generatedClasses.add(`inset-x-${spacing}`);
            generatedClasses.add(`inset-y-${spacing}`);
          }
          
          // Generate border radius utilities
          for (const radius of themeVars.radius) {
            generatedClasses.add(`rounded-${radius}`);
            generatedClasses.add(`rounded-t-${radius}`);
            generatedClasses.add(`rounded-r-${radius}`);
            generatedClasses.add(`rounded-b-${radius}`);
            generatedClasses.add(`rounded-l-${radius}`);
            generatedClasses.add(`rounded-tl-${radius}`);
            generatedClasses.add(`rounded-tr-${radius}`);
            generatedClasses.add(`rounded-br-${radius}`);
            generatedClasses.add(`rounded-bl-${radius}`);
          }
          
          // Generate shadow utilities
          for (const shadow of themeVars.shadows) {
            generatedClasses.add(`shadow-${shadow}`);
            generatedClasses.add(`drop-shadow-${shadow}`);
          }
        }
      } catch {
        // Silently ignore files we can't read
      }
    }
    
    this.themeClassesCache = generatedClasses;
    return generatedClasses;
  }

  isTailwindClass(className) {
    // Handle opacity modifiers (e.g., bg-primary/50, from-surface-tertiary/50)
    let baseClass = className;
    
    if (className.includes('/')) {
      const parts = className.split('/');
      if (parts.length === 2 && /^\d+$/.test(parts[1])) {
        baseClass = parts[0];
      }
    }
    
    // Check if it's a theme-generated class (with or without opacity)
    const themeClasses = this.getThemeGeneratedClasses();
    if (themeClasses.has(baseClass)) {
      return true;
    }

    // Check special utility classes that don't follow standard patterns
    const specialUtilities = [
      'group',
      'peer',
      'container',
      'prose',
      'placeholder',
      'file',
      'marker',
      'selection',
      'first-line',
      'first-letter',
      'backdrop',
      'before',
      'after'
    ];
    
    if (specialUtilities.includes(className)) {
      return true;
    }

    // Try comprehensive check if enabled
    if (this.useComprehensiveCheck && isValidTailwindClass(className)) {
      return true;
    }
    
    // Fallback to regex patterns for edge cases
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
      /^(rounded|shadow|opacity|transition|duration|ease|delay|animate|transform|scale|rotate|translate|skew|origin)(-\w+)?$/,
      /^border(-[0248])?$/,  // Only valid border widths
      /^rounded-(none|sm|md|lg|xl|2xl|3xl|full)$/,
      /^border-(solid|dashed|dotted|double|none)$/,
      /^border-[tlrbxyse](-[0248])?$/,  // Directional borders with valid widths
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
      /^outline-(none|[01248]|dashed|dotted|double)$/,  // Only valid outline widths
      /^outline-offset-[01248]$/,  // Only valid outline offset values
      /^ring(-[01248])?$/,  // Only valid ring widths
      /^ring-(inset|offset-[01248])$/,  // Valid ring offset widths
      /^divide-[xy](-[0248])?$/,  // Only valid divide widths
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

    // DO NOT automatically accept custom patterns!
    // Custom classes like text-primary or bg-surface-tertiary should be
    // defined in actual CSS files. The CSS parser will handle those.
    // We only ignore actual Tailwind utilities here.
    
    return false;
  }

  clearCache() {
    this.configCache = null;
    this.classCache.clear();
  }
}

module.exports = TailwindDetector;