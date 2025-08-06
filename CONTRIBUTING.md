# Contributing to eslint-plugin-undefined-css-classes

Thank you for your interest in contributing to eslint-plugin-undefined-css-classes! This document provides guidelines and instructions for contributing to the project.


## How to Contribute

### Reporting Issues

- Check if the issue already exists in our [issue tracker](https://github.com/didgeoridoo/eslint-plugin-undefined-css-classes/issues)
- Create a new issue with a clear title and description
- Include:
  - ESLint version
  - Plugin version
  - Minimal code example reproducing the issue
  - Expected vs actual behavior
  - Error messages (if any)

### Suggesting Features

- Open an issue with the "enhancement" label
- Describe the feature and its use case
- Provide examples of how it would work

### Submitting Pull Requests

1. **Fork and Clone**
   ```bash
   git clone https://github.com/didgeoridoo/eslint-plugin-undefined-css-classes.git
   cd eslint-plugin-undefined-css-classes
   npm install
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number
   ```

3. **Make Changes**
   - Follow existing code style
   - Add/update tests for your changes
   - Update documentation if needed

4. **Test Your Changes**
   ```bash
   npm test                    # Run all tests
   npm run lint               # Check code style
   node verify-plugin.js      # Manual verification
   ```

5. **Commit**
   - Use clear, descriptive commit messages
   - Follow conventional commits format:
     - `feat:` New feature
     - `fix:` Bug fix
     - `docs:` Documentation changes
     - `test:` Test additions/changes
     - `refactor:` Code refactoring
     - `chore:` Maintenance tasks

6. **Push and Create PR**
   - Push your branch to your fork
   - Create a pull request with:
     - Clear title and description
     - Link to related issues
     - Test results

## Development Setup

### Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0
- Git

### Project Structure

```
eslint-plugin-undefined-css-classes/
├── lib/
│   ├── index.js              # Plugin entry point
│   ├── rules/                # ESLint rules
│   └── utils/                # Utility modules
├── tests/
│   ├── lib/                  # Unit tests
│   └── fixtures/             # Test fixtures
├── docs/                     # Documentation
└── verify-plugin.js          # Manual verification script
```

### Key Commands

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run specific test file
npm test -- tests/lib/rules/no-undefined-css-classes.test.js

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Lint code
npm run lint

# Manual verification
node verify-plugin.js
```

### Testing Guidelines

- Write tests for all new functionality
- Maintain or improve code coverage
- Test edge cases and error conditions
- Use meaningful test descriptions
- Follow existing test patterns

### Code Style

- Use 2-space indentation
- Follow ESLint configuration in the project
- Use descriptive variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Architecture Overview

### Core Components

1. **Main Rule** (`lib/rules/no-undefined-css-classes.js`)
   - Validates CSS classes against definitions
   - Integrates utility modules

2. **Utilities** (`lib/utils/`)
   - `css-parser.js`: CSS file parsing and caching
   - `class-extractor.js`: Extract classes from JSX/HTML
   - `tailwind-detector.js`: Tailwind CSS detection

### Design Principles

- **Performance**: Use caching to avoid redundant operations
- **Modularity**: Keep utilities separate and reusable
- **Compatibility**: Support various CSS frameworks and build tools
- **User Experience**: Provide clear error messages and fixes

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. CI/CD will handle npm publishing

## Getting Help

- Check existing [documentation](README.md)
- Search [issues](https://github.com/didgeoridoo/eslint-plugin-undefined-css-classes/issues)
- Ask questions in discussions
- Contact maintainers

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes
- Special mentions for significant contributions

Thank you for contributing!