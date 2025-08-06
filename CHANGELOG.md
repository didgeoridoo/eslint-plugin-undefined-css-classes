# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.2] - 2025-01-06

### Added
- Support for parsing Svelte component `<style>` blocks - classes defined in component styles are now recognized
- Support for Tailwind CSS opacity modifiers (e.g., `bg-primary/50`, `from-surface-tertiary/50`)
- Recognition of special Tailwind utilities: `group`, `peer`, `container`, `prose`, and pseudo-element utilities
- Improved `@theme` variable parsing to handle single-word color names like `canvas`, `surface`, etc.

### Fixed  
- Fixed false positives for CSS classes defined in Svelte component `<style>` blocks
- Fixed recognition of Tailwind CSS `group` utility class
- Fixed parsing of Tailwind classes with opacity modifiers (e.g., `/50`, `/75`, `/100`)
- Fixed recognition of single-word theme variable names (not just prefixed ones)

## [0.1.1] - 2025-01-06

### Added
- Full Tailwind CSS 4 `@theme` block support - automatically generates utility classes from theme variables
- Enhanced security validation for path traversal protection
- Improved error reporting mechanism
- Input validation for user-provided regex patterns
- Performance optimization documentation
- GitHub Actions CI/CD workflow
- Pre-commit hooks for code quality

### Fixed
- Fixed false positives for Tailwind 4 projects using `@theme` variables to define custom colors, spacing, fonts, etc.
- Theme variables with prefixes (`--color-*`, `--font-*`, `--spacing-*`, `--radius-*`, `--shadow-*`) now correctly generate their corresponding utility classes

## [0.1.0] - 2025-01-06

### Added
- Initial beta release of eslint-plugin-undefined-css-classes
- Core rule: `no-undefined-css-classes` for validating CSS class usage
- Support for JSX and HTML template validation
- Automatic Tailwind CSS detection and support
  - Tailwind v3 and v4 compatibility
  - Arbitrary value support
  - Complex modifier detection
- CSS parsing with PostCSS
  - Media query support
  - Pseudo-class and pseudo-element handling
  - Nested selector support
- Dynamic class handling
  - Template literal support
  - Conditional class utilities (clsx, classnames, cn)
- Configuration options:
  - `cssFiles`: Glob patterns for CSS file discovery
  - `ignoreTailwind`: Auto-ignore Tailwind classes
  - `allowDynamicClasses`: Allow template literals
  - `requireTailwindConfig`: Require tailwind.config.js
  - `ignoreClassPatterns`: Custom ignore patterns
  - `baseDir`: Custom base directory
- Configuration presets:
  - `recommended`: Balanced defaults
  - `strict`: Strict validation
  - `with-tailwind`: Tailwind-optimized
- Comprehensive test suite (187 tests across 9 test suites)
- LRU caching for performance optimization
- Detailed documentation and examples

[Unreleased]: https://github.com/didgeoridoo/eslint-plugin-undefined-css-classes/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/didgeoridoo/eslint-plugin-undefined-css-classes/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/didgeoridoo/eslint-plugin-undefined-css-classes/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/didgeoridoo/eslint-plugin-undefined-css-classes/releases/tag/v0.1.0