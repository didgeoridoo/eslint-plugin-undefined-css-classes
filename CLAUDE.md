# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Testing
- `npm test` - Run all tests (223 tests across 13 test suites)
- `npm test -- tests/lib/rules/no-undefined-css-classes.test.js` - Run specific test file
- `npm test -- --watch` - Run tests in watch mode
- `npm test -- --coverage` - Run tests with coverage report

### Code Quality
- `npm run lint` - Run ESLint checks on the codebase
- `node verify-plugin.js` - Verify plugin functionality with example code

### Development
- `npm install` - Install dependencies
- No build step required (plain JavaScript)

## Architecture

### Core Components
The plugin follows a modular architecture with clear separation between rule logic and utilities:

1. **Entry Point** (`lib/index.js`): Exports the main rule and configuration presets (recommended, strict, with-tailwind)

2. **Main Rule** (`lib/rules/no-undefined-css-classes.js`): 
   - Validates CSS classes in JSX/HTML against actual CSS definitions
   - Integrates all utility modules for CSS parsing, class extraction, and Tailwind detection
   - Handles configuration options and caching

3. **Utility Modules** (`lib/utils/`):
   - `css-parser.js`: Parses CSS files using PostCSS, extracts class names, implements caching
   - `class-extractor.js`: Extracts class names from JSX/HTML, handles template literals, utilities like clsx/cn
   - `tailwind-detector.js`: Auto-detects Tailwind CSS installation and configuration

### Key Design Patterns
- **Caching Strategy**: Both CSS parsing and Tailwind detection use Map-based caches to avoid redundant file operations
- **AST Traversal**: Uses ESLint's visitor pattern to traverse JSX/HTML nodes
- **Dynamic Class Handling**: Supports template literals and conditional classes through configurable options

### Testing Approach
- Uses Jest with ESLint's RuleTester for rule validation
- Tests organized by component (rules, utils) and integration scenarios
- Fixtures in `tests/fixtures/` for isolated test environments

## Important Context

### Tailwind CSS Integration
The plugin automatically detects and ignores Tailwind classes when:
- Tailwind is installed in package.json dependencies
- A tailwind.config.js file exists (when `requireTailwindConfig: true`)
- PostCSS configuration includes Tailwind

### Configuration Options
The rule accepts these key options:
- `cssFiles`: Glob patterns for CSS files (default: `["**/*.css"]`)
- `ignoreTailwind`: Auto-ignore Tailwind classes (default: `true`)
- `allowDynamicClasses`: Allow template literal dynamics (default: `true`)
- `ignoreClassPatterns`: Array of regex patterns to ignore

### Recent Updates (v0.1.2)
- **Svelte style blocks**: Parse and recognize classes from component `<style>` blocks
- **Tailwind opacity modifiers**: Support for `/50`, `/75`, `/100` opacity syntax
- **Enhanced Tailwind support**: Recognition of `group`, `peer`, and other special utilities
- **Improved @theme parsing**: Handle single-word color names like `canvas`, `surface`

### Version
Current version: 0.1.2 (beta - API may change)