# Performance Optimization Guide

This guide provides tips and best practices for optimizing the performance of eslint-plugin-undefined-css-classes in large projects.

## Table of Contents

- [Understanding Performance Impact](#understanding-performance-impact)
- [Configuration Optimizations](#configuration-optimizations)
- [Caching Strategy](#caching-strategy)
- [Large Project Recommendations](#large-project-recommendations)
- [Troubleshooting Performance Issues](#troubleshooting-performance-issues)

## Understanding Performance Impact

The plugin's performance is primarily affected by:

1. **Number of CSS files**: More files = more parsing time
2. **Size of CSS files**: Larger files take longer to parse
3. **Number of JSX/HTML files**: More files to lint
4. **Glob pattern complexity**: Broad patterns scan more files
5. **Dynamic class usage**: Template literals require additional processing

## Configuration Optimizations

### 1. Limit CSS File Scope

Instead of scanning all CSS files, be specific:

```javascript
// ❌ Slow - scans entire project
{
  "cssFiles": ["**/*.css"]
}

// ✅ Fast - only scans relevant directories
{
  "cssFiles": [
    "src/**/*.css",
    "styles/**/*.css"
  ]
}
```

### 2. Use Exclude Patterns

Exclude directories that don't contain relevant CSS:

```javascript
{
  "cssFiles": ["**/*.css"],
  "excludePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**",
    "**/.next/**",
    "**/vendor/**"
  ]
}
```

### 3. Optimize for Tailwind Projects

If using Tailwind CSS, ensure it's properly detected to avoid unnecessary CSS parsing:

```javascript
// For Tailwind projects
{
  "ignoreTailwind": true,
  "requireTailwindConfig": true,  // Skip if no config found
  "cssFiles": ["src/**/*.css"]    // Only your custom CSS
}
```

### 4. Disable Dynamic Class Checking

If you don't use template literals for classes:

```javascript
{
  "allowDynamicClasses": false  // Faster processing
}
```

## Caching Strategy

The plugin implements several caching mechanisms:

### CSS File Caching

- CSS files are parsed once and cached for the entire linting session
- Cache key includes file path and modification time
- Cache is automatically invalidated when files change

### Tailwind Detection Caching

- Tailwind presence is detected once per session
- Results are cached to avoid repeated file system checks

### Best Practices for Caching

1. **Run in watch mode**: Caches persist between file saves
2. **Use CI caching**: Cache `node_modules` and `.eslintcache`
3. **Incremental linting**: Only lint changed files in CI

```bash
# Use ESLint's built-in cache
eslint --cache --cache-location .eslintcache src/
```

## Large Project Recommendations

### Monorepo Setup

For monorepos, configure per-package:

```javascript
// packages/app/.eslintrc.js
{
  "rules": {
    "undefined-css-classes/no-undefined-css-classes": ["error", {
      "baseDir": "./",
      "cssFiles": ["./src/**/*.css"],
      "excludePatterns": ["../*//**"]  // Don't scan other packages
    }]
  }
}
```

### Parallel Processing

Use ESLint's parallel processing for large codebases:

```bash
# Use all available CPUs
eslint --parallel src/

# Specify number of threads
eslint --parallel --concurrency 4 src/
```

### Progressive Migration

When adding to existing projects:

```javascript
// Start with warnings
{
  "undefined-css-classes/no-undefined-css-classes": "warn"
}

// Gradually increase strictness
{
  "undefined-css-classes/no-undefined-css-classes": ["warn", {
    "ignoreClassPatterns": ["^legacy-", "^old-"]  // Ignore old classes
  }]
}
```

## Troubleshooting Performance Issues

### Enable Debug Mode

```bash
DEBUG=1 npx eslint --timing src/
```

This shows:
- CSS parsing time
- Cache hit/miss rates
- File discovery duration

### Profile ESLint

```bash
TIMING=1 npx eslint src/
```

Shows time spent in each rule.

### Common Issues and Solutions

#### Issue: Slow initial run

**Solution**: Reduce CSS file scope
```javascript
{
  "cssFiles": ["src/styles/**/*.css"]  // Not "**/*.css"
}
```

#### Issue: Memory usage high

**Solution**: Process files in batches
```bash
# Split linting into chunks
eslint src/components/
eslint src/pages/
eslint src/utils/
```

#### Issue: CI timeouts

**Solution**: Use caching and parallelization
```yaml
# GitHub Actions example
- uses: actions/cache@v3
  with:
    path: |
      .eslintcache
      node_modules
    key: ${{ runner.os }}-eslint-${{ hashFiles('**/package-lock.json') }}

- run: npm run lint -- --cache --parallel
```

### Performance Benchmarks

Typical performance for different project sizes:

| Project Size | Files | CSS Files | First Run | Cached Run |
|-------------|-------|-----------|-----------|------------|
| Small | 100 | 10 | ~2s | ~0.5s |
| Medium | 1,000 | 50 | ~10s | ~2s |
| Large | 10,000 | 200 | ~45s | ~8s |
| Enterprise | 50,000 | 1,000 | ~3min | ~30s |

## Advanced Optimizations

### Custom Ignore Patterns

Use regex patterns to ignore generated or third-party classes:

```javascript
{
  "ignoreClassPatterns": [
    "^generated-",      // Ignore generated classes
    "^vendor-",        // Ignore vendor prefixes
    "^wp-"            // Ignore WordPress classes
  ]
}
```

### Selective Rule Application

Apply the rule only to specific file patterns:

```javascript
{
  "overrides": [
    {
      "files": ["src/components/**/*.jsx"],
      "rules": {
        "undefined-css-classes/no-undefined-css-classes": "error"
      }
    },
    {
      "files": ["src/legacy/**/*.jsx"],
      "rules": {
        "undefined-css-classes/no-undefined-css-classes": "off"
      }
    }
  ]
}
```

### Memory Management

For very large projects, increase Node.js memory:

```bash
# Increase memory limit to 4GB
NODE_OPTIONS="--max-old-space-size=4096" npx eslint src/
```

## Monitoring Performance

### Create Performance Report

```bash
# Generate timing report
npx eslint --format json --output-file eslint-report.json src/

# Analyze with custom script
node analyze-performance.js eslint-report.json
```

### Track Performance Over Time

1. Record baseline metrics
2. Monitor after configuration changes
3. Set performance budgets

```javascript
// Example performance budget
{
  "linting": {
    "maxDuration": "60s",
    "maxMemory": "2GB",
    "cacheHitRate": ">80%"
  }
}
```

## Conclusion

By following these optimization strategies, you can significantly improve the plugin's performance:

1. **Be specific** with file patterns
2. **Use caching** effectively
3. **Parallelize** when possible
4. **Monitor** performance metrics
5. **Iterate** on configuration

For additional help, please refer to our [Troubleshooting Guide](./TROUBLESHOOTING.md) or open an issue on GitHub.