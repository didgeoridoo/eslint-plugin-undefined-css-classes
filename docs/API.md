# eslint-plugin-undefined-css-classes API Documentation

## Table of Contents
- [Installation](#installation)
- [Configuration](#configuration)
- [Rule: no-undefined-css-classes](#rule-no-undefined-css-classes)
- [Configuration Options](#configuration-options)
- [Predefined Configs](#predefined-configs)
- [API Reference](#api-reference)
- [Supported Syntax](#supported-syntax)
- [Tailwind CSS Support](#tailwind-css-support)

## Installation

```bash
npm install --save-dev eslint-plugin-undefined-css-classes
# or
yarn add -D eslint-plugin-undefined-css-classes
# or
pnpm add -D eslint-plugin-undefined-css-classes
```

## Configuration

### Basic Setup

Add the plugin to your `.eslintrc.json`:

```json
{
  "plugins": ["undefined-css-classes"],
  "rules": {
    "undefined-css-classes/no-undefined-css-classes": "error"
  }
}
```

### Using Predefined Configs

```json
{
  "extends": ["plugin:undefined-css-classes/recommended"]
}
```

## Rule: no-undefined-css-classes

Detects CSS classes used in JavaScript/JSX that are not defined in any CSS file.

### Rule Details

This rule will report an error when:
- A CSS class is used in JSX/HTML but not defined in any CSS file
- The class is not a recognized Tailwind utility (when Tailwind detection is enabled)
- The class doesn't match any configured ignore patterns

### Examples

❌ **Incorrect** (class not defined in CSS):
```jsx
<div className="undefined-class">Content</div>
<button className="btn btn-danger">Delete</button> // if btn-danger is not defined
element.classList.add("missing-class");
```

✅ **Correct**:
```jsx
<div className="defined-class">Content</div> // class exists in CSS
<div className="flex items-center">Content</div> // Tailwind classes (when enabled)
<div className={`theme-${variant}`}>Content</div> // Dynamic classes (when allowed)
```

## Configuration Options

### Complete Options Schema

```javascript
{
  "undefined-css-classes/no-undefined-css-classes": ["error", {
    // Glob patterns for CSS files to scan
    "cssFiles": ["**/*.css", "**/*.scss", "**/*.less"],
    
    // Patterns to exclude from scanning
    "excludePatterns": ["**/node_modules/**", "**/dist/**"],
    
    // Ignore Tailwind CSS utility classes
    "ignoreTailwind": true,
    
    // Only ignore Tailwind if config file exists
    "requireTailwindConfig": true,
    
    // Regex patterns for classes to ignore
    "ignoreClassPatterns": ["^custom-", "^legacy-"],
    
    // Allow dynamic classes with template literals
    "allowDynamicClasses": true,
    
    // Base directory for CSS file resolution
    "baseDir": "src"
  }]
}
```

### Option Details

#### `cssFiles`
- **Type**: `Array<string>`
- **Default**: `["**/*.css"]`
- **Description**: Glob patterns to find CSS files
- **Example**:
  ```json
  {
    "cssFiles": ["src/**/*.css", "styles/**/*.scss"]
  }
  ```

#### `excludePatterns`
- **Type**: `Array<string>`
- **Default**: `["**/node_modules/**"]`
- **Description**: Glob patterns for files/directories to exclude
- **Example**:
  ```json
  {
    "excludePatterns": ["**/node_modules/**", "**/vendor/**", "**/*.min.css"]
  }
  ```

#### `ignoreTailwind`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to ignore Tailwind CSS utility classes
- **Note**: Automatically detects Tailwind presence via config files or package.json

#### `requireTailwindConfig`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Only ignore Tailwind classes if a Tailwind config file is found
- **Detection checks**:
  - `tailwind.config.js`, `tailwind.config.cjs`, `tailwind.config.mjs`, `tailwind.config.ts`
  - `tailwindcss` in package.json dependencies/devDependencies
  - `tailwindcss` in postcss.config.js

#### `ignoreClassPatterns`
- **Type**: `Array<string>`
- **Default**: `[]`
- **Description**: Regular expression patterns for class names to ignore
- **Example**:
  ```json
  {
    "ignoreClassPatterns": [
      "^module-",     // CSS Modules
      "^styles-",     // Style objects
      "^test-",       // Test classes
      "^e2e-"         // E2E test selectors
    ]
  }
  ```

#### `allowDynamicClasses`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Allow template literals and dynamic class generation
- **Affects**:
  - Template literals: `` `class-${variant}` ``
  - Expressions with variables: `${color}-500`
  - Partially dynamic classes: `theme-${theme}`

#### `baseDir`
- **Type**: `string`
- **Default**: Current working directory
- **Description**: Base directory for resolving CSS file paths
- **Example**:
  ```json
  {
    "baseDir": "./src"
  }
  ```

## Predefined Configs

### `recommended`
Default configuration with Tailwind support:
```json
{
  "plugins": ["undefined-css-classes"],
  "rules": {
    "undefined-css-classes/no-undefined-css-classes": "error"
  }
}
```

### `with-tailwind`
Explicitly configured for Tailwind projects:
```json
{
  "plugins": ["undefined-css-classes"],
  "rules": {
    "undefined-css-classes/no-undefined-css-classes": ["error", {
      "ignoreTailwind": true,
      "requireTailwindConfig": true,
      "allowDynamicClasses": true
    }]
  }
}
```

### `strict`
No Tailwind support, no dynamic classes:
```json
{
  "plugins": ["undefined-css-classes"],
  "rules": {
    "undefined-css-classes/no-undefined-css-classes": ["error", {
      "ignoreTailwind": false,
      "allowDynamicClasses": false
    }]
  }
}
```

## API Reference

### Main Export

```javascript
module.exports = {
  rules: {
    'no-undefined-css-classes': Rule
  },
  configs: {
    recommended: Config,
    strict: Config,
    'with-tailwind': Config
  }
}
```

### Rule Object Structure

```javascript
{
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect undefined CSS classes in HTML/JSX',
      category: 'Possible Errors',
      recommended: true
    },
    fixable: null,
    schema: [OptionsSchema],
    messages: {
      undefinedClass: "CSS class '{{className}}' is not defined in any CSS file",
      undefinedClasses: "CSS classes {{classNames}} are not defined in any CSS file"
    }
  },
  create(context) { /* ... */ }
}
```

## Supported Syntax

### JSX/React

#### Basic className
```jsx
<div className="class-name">Content</div>
<div className="class1 class2 class3">Multiple classes</div>
```

#### Dynamic className
```jsx
<div className={someVariable}>Variable</div>
<div className={condition ? "class1" : "class2"}>Conditional</div>
<div className={`base ${modifier}`}>Template literal</div>
```

#### CSS-in-JS Utilities
```jsx
// clsx
<div className={clsx('base', { active: isActive })}>clsx</div>

// classNames (classnames package)
<div className={classNames('base', { active: isActive })}>classNames</div>

// cn (shadcn/ui)
<div className={cn('base', variant && 'variant-class')}>cn</div>
```

### Vue Templates
```vue
<template>
  <div class="static-class">Static</div>
  <div :class="dynamicClass">Dynamic</div>
  <div :class="{ active: isActive }">Object</div>
  <div :class="['base', conditionalClass]">Array</div>
</template>
```

### Vanilla JavaScript
```javascript
element.className = "class-name";
element.classList.add("new-class");
element.classList.toggle("active");
element.classList.remove("old-class");
```

### HTML (in .html files with ESLint HTML plugin)
```html
<div class="static-class">Content</div>
```

## Tailwind CSS Support

### Detected Tailwind Patterns

#### Core Utilities
- Layout: `flex`, `grid`, `block`, `hidden`, `inline`
- Spacing: `p-4`, `m-2`, `px-6`, `my-8`, `-mt-4`
- Sizing: `w-full`, `h-screen`, `min-w-0`, `max-h-96`
- Colors: `text-blue-500`, `bg-gray-100`, `border-red-600`
- Typography: `text-lg`, `font-bold`, `uppercase`, `truncate`

#### Tailwind v3 Features
- Container queries: `@container`, `@lg:flex`
- Logical properties: `ps-4`, `pe-6`, `ms-auto`, `start-0`
- Has selector: `has-[:checked]:bg-blue-500`
- Aria variants: `aria-expanded:rotate-180`
- Data attributes: `data-[state=open]:bg-white`
- Supports queries: `supports-[display:grid]:grid`
- Min/max breakpoints: `min-[320px]:text-sm`, `max-[639px]:hidden`

#### Tailwind v4 Alpha Features
- New color scales: `gray-950`, `zinc-950`
- Gradient stops: `from-5%`, `via-50%`, `to-95%`
- Enhanced backdrop: `backdrop-blur-3xl`
- Forced colors: `forced-colors:outline`

#### Arbitrary Values
- Spacing: `w-[100px]`, `h-[50vh]`, `p-[2rem]`
- Colors: `bg-[#ff0000]`, `text-[rgb(255,0,0)]`, `border-[oklch(59%_0.2_233)]`
- CSS Functions: `w-[calc(100%-2rem)]`, `h-[min(100vh,800px)]`
- Variables: `bg-[var(--primary-color)]`
- Animations: `animate-[wiggle_1s_ease-in-out_infinite]`
- Content: `content-["→"]`, `before:content-["*"]`

### Tailwind Detection

The plugin automatically detects Tailwind in your project by checking for:

1. **Config files**: 
   - `tailwind.config.js`
   - `tailwind.config.cjs`
   - `tailwind.config.mjs`
   - `tailwind.config.ts`

2. **Package.json**:
   ```json
   {
     "dependencies": {
       "tailwindcss": "^3.0.0"
     }
   }
   ```

3. **PostCSS config**:
   ```javascript
   module.exports = {
     plugins: {
       tailwindcss: {},
       autoprefixer: {}
     }
   }
   ```

### Disabling Tailwind Detection

To disable Tailwind class ignoring:
```json
{
  "undefined-css-classes/no-undefined-css-classes": ["error", {
    "ignoreTailwind": false
  }]
}
```

To ignore Tailwind classes even without a config file:
```json
{
  "undefined-css-classes/no-undefined-css-classes": ["error", {
    "ignoreTailwind": true,
    "requireTailwindConfig": false
  }]
}
```