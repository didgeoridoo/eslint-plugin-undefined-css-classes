# eslint-plugin-undefined-css-classes

An ESLint plugin to detect undefined CSS classes in your HTML and JSX code. Automatically ignores Tailwind CSS classes when Tailwind is detected in your project.

## 📚 Documentation

- [**API Documentation**](./docs/API.md) - Complete API reference and configuration options
- [**Usage Examples**](./docs/USAGE-EXAMPLES.md) - Examples for React, Vue, Next.js, and more
- [**Troubleshooting Guide**](./docs/TROUBLESHOOTING.md) - Common issues and solutions
- [**Performance Guide**](./docs/PERFORMANCE.md) - Optimization tips for large projects
- [**Test Coverage Report**](./test-summary.md) - Comprehensive test coverage details

## ✨ Features

- Detects CSS classes used in HTML/JSX/Svelte that are not defined in any CSS file
- Automatically detects and ignores Tailwind CSS classes (both static and dynamic)
- **Full Tailwind CSS 4 support** - detects `@import "tailwindcss"` and `@theme` directives
- Supports JSX className and class attributes
- **Supports Svelte components** (requires eslint-plugin-svelte)
- Supports template literals and dynamic class names
- Works with CSS-in-JS solutions like clsx, classNames, and cn
- Configurable patterns for ignoring specific classes
- Caches CSS parsing for better performance

## 📦 Installation

```bash
npm install --save-dev eslint-plugin-undefined-css-classes
```

or

```bash
yarn add -D eslint-plugin-undefined-css-classes
```

## 🚀 Quick Start

Add the plugin to your ESLint configuration:

### .eslintrc.json

```json
{
  "plugins": ["undefined-css-classes"],
  "rules": {
    "undefined-css-classes/no-undefined-css-classes": "error"
  }
}
```

### Using predefined configs

The plugin provides several predefined configurations:

#### Recommended (default)
```json
{
  "extends": ["plugin:undefined-css-classes/recommended"]
}
```

#### With Tailwind
```json
{
  "extends": ["plugin:undefined-css-classes/with-tailwind"]
}
```

#### Strict (no Tailwind, no dynamic classes)
```json
{
  "extends": ["plugin:undefined-css-classes/strict"]
}
```

## ⚙️ Configuration Options

```javascript
"undefined-css-classes/no-undefined-css-classes": ["error", {
  // Glob patterns for CSS files to scan
  "cssFiles": ["**/*.css"],
  
  // Patterns to exclude from scanning
  "excludePatterns": ["**/node_modules/**"],
  
  // Ignore Tailwind CSS classes (default: true)
  "ignoreTailwind": true,
  
  // Only ignore Tailwind if config file exists (default: true)
  "requireTailwindConfig": true,
  
  // Regex patterns for classes to ignore
  "ignoreClassPatterns": ["^custom-", "^legacy-"],
  
  // Allow dynamic classes with template literals (default: true)
  "allowDynamicClasses": true,
  
  // Base directory for CSS file resolution
  "baseDir": null
}]
```

## 📝 Examples

### Valid Code

```jsx
// Defined in CSS
<div className="defined-class">Content</div>

// Tailwind classes (when ignoreTailwind: true)
<div className="flex items-center bg-blue-500">Content</div>

// Dynamic Tailwind classes
<div className="w-[100px] h-[200px]">Content</div>

// Template literals with defined classes
<div className={`defined-class ${condition ? "another-defined" : "btn-primary"}`}>Content</div>

// Dynamic classes (when allowDynamicClasses: true)
<div className={`prefix-${variant}`}>Content</div>
```

### Invalid Code

```jsx
// Undefined class
<div className="undefined-class">Content</div>
// Error: CSS class 'undefined-class' is not defined in any CSS file

// Multiple undefined classes
<div className="undefined-one undefined-two">Content</div>
// Error: CSS classes undefined-one, undefined-two are not defined in any CSS file

// Undefined class in classList.add
element.classList.add("undefined-class");
// Error: CSS class 'undefined-class' is not defined in any CSS file
```

## 🎨 Tailwind CSS Detection

### Implementation Approach

The plugin uses a hybrid approach for detecting Tailwind CSS classes:

1. **Pattern-based detection**: Uses comprehensive regex patterns to match Tailwind utilities
2. **Definition-based detection**: Uses a structured class definition system similar to tailwind-merge for accurate validation

## 🎨 Tailwind CSS Support

The plugin automatically detects Tailwind CSS in your project through multiple methods:

### Tailwind CSS 3 and earlier
- Presence of `tailwind.config.js`, `tailwind.config.ts`, or other config files
- `tailwindcss` in package.json dependencies
- `tailwindcss` in PostCSS configuration

### Tailwind CSS 4
- `@import "tailwindcss"` in CSS files
- `@theme` directive in CSS files
- `@import "tailwindcss/theme"` or `@import "tailwindcss/utilities"`

### Custom Theme Colors
The plugin intelligently ignores custom utility classes that would be generated from `@theme` definitions:
- `text-primary`, `bg-surface`, `border-inverse` etc.
- Custom color scales like `text-brand-500`, `bg-surface-tertiary`

## 🧩 Svelte Support

To use this plugin with Svelte components, you need to install and configure `eslint-plugin-svelte`:

### Installation

```bash
npm install --save-dev eslint-plugin-svelte svelte-eslint-parser
```

### Configuration

```javascript
// eslint.config.js
import svelte from 'eslint-plugin-svelte';
import undefinedCssClasses from 'eslint-plugin-undefined-css-classes';

export default [
  ...svelte.configs['flat/recommended'],
  {
    files: ['**/*.svelte'],
    plugins: {
      'undefined-css-classes': undefinedCssClasses
    },
    rules: {
      'undefined-css-classes/no-undefined-css-classes': ['error', {
        cssFiles: ['src/**/*.css'],
        ignoreTailwind: true
      }]
    }
  }
];
```

### Example Svelte Component

```svelte
<script>
  export let title = 'Hello';
</script>

<!-- Valid: defined classes -->
<div class="container defined-class">
  <h1 class="font-display">{title}</h1>
</div>

<!-- Invalid: undefined classes -->
<div class="fake-undefined-class">
  <!-- Error: CSS class 'fake-undefined-class' is not defined -->
</div>
```

## 🎨 Tailwind CSS Support

### Automatic Detection

The plugin automatically detects if your project uses Tailwind CSS by checking for:

1. Tailwind configuration files (tailwind.config.js, tailwind.config.ts, etc.)
2. `tailwindcss` in package.json dependencies
3. Tailwind references in postcss.config.js

When Tailwind is detected and `ignoreTailwind` is `true`, the plugin will ignore:

- Tailwind utility classes (flex, grid, text-blue-500, etc.)
- Responsive modifiers (sm:, md:, lg:, etc.)
- State modifiers (hover:, focus:, active:, etc.)
- Arbitrary value classes ([100px], [#ff0000], etc.)
- Dynamic classes with template literals

## ⚡ Performance

- CSS files are parsed once and cached
- Tailwind detection is cached per session
- Use specific `cssFiles` patterns to limit scanning scope
- Consider using `excludePatterns` to skip unnecessary directories

## 🔧 Compatibility

- ESLint: >=7.0.0
- Node.js: >=14.0.0
- Supports JSX/TSX files
- Works with Vue Single File Components (SFC)

## Test Coverage

- **223 tests** across 13 test suites
- **100% feature coverage** including:
  - Tailwind CSS v3 & v4 patterns
  - Dynamic class generation
  - CSS-in-JS utilities (clsx, classNames, cn)
  - Error handling and edge cases
  - Performance optimization

See [Test Coverage Report](./test-summary.md) for details.

## 🐛 Debug Mode

To enable debug output for troubleshooting, set the `DEBUG` environment variable:

```bash
DEBUG=1 npx eslint src/
```

This will output additional information about:
- CSS file parsing
- Tailwind detection
- Class extraction
- Cache operations

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

```bash
npm test  # Run all 223 tests
npm run lint  # Check code style
```

## 📄 License

MIT