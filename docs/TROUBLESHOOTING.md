# Troubleshooting Guide

## Common Issues and Solutions

### Issue: Plugin Not Found

**Error message:**
```
ESLint couldn't find the plugin "eslint-plugin-undefined-css-classes"
```

**Solutions:**

1. Ensure the plugin is installed:
   ```bash
   npm install --save-dev eslint-plugin-undefined-css-classes
   ```

2. Check your ESLint configuration syntax:
   ```json
   {
     "plugins": ["undefined-css-classes"],  // Correct (without "eslint-plugin-" prefix)
     "plugins": ["eslint-plugin-undefined-css-classes"]  // Incorrect
   }
   ```

3. If using a monorepo, ensure the plugin is installed at the correct level

### Issue: CSS Classes Not Being Found

**Problem:** The plugin reports errors for classes that are defined in CSS files

**Solutions:**

1. **Check `cssFiles` pattern:**
   ```json
   {
     "undefined-css-classes/no-undefined-css-classes": ["error", {
       "cssFiles": ["**/*.css", "**/*.scss"]  // Make sure patterns match your files
     }]
   }
   ```

2. **Verify `baseDir` setting:**
   ```json
   {
     "undefined-css-classes/no-undefined-css-classes": ["error", {
       "baseDir": "./src"  // Should point to your CSS files location
     }]
   }
   ```

3. **Check exclude patterns aren't too broad:**
   ```json
   {
     "undefined-css-classes/no-undefined-css-classes": ["error", {
       "excludePatterns": ["**/node_modules/**"]  // Don't exclude your own files
     }]
   }
   ```

4. **Clear the cache:** The plugin caches CSS parsing. Restart ESLint or your editor

### Issue: Tailwind Classes Reported as Errors

**Problem:** Tailwind utility classes are being flagged as undefined

**Solutions:**

1. **Ensure Tailwind detection is enabled (default):**
   ```json
   {
     "undefined-css-classes/no-undefined-css-classes": ["error", {
       "ignoreTailwind": true  // Should be true (default)
     }]
   }
   ```

2. **Check if Tailwind config exists:**
   - The plugin looks for: `tailwind.config.js`, `tailwind.config.cjs`, `tailwind.config.mjs`, `tailwind.config.ts`
   - Or `tailwindcss` in package.json dependencies

3. **Disable config requirement:**
   ```json
   {
     "undefined-css-classes/no-undefined-css-classes": ["error", {
       "ignoreTailwind": true,
       "requireTailwindConfig": false  // Don't require config file
     }]
   }
   ```

### Issue: Dynamic Classes Reported as Errors

**Problem:** Template literals and dynamic classes are flagged

**Example:**
```jsx
<div className={`theme-${variant}`}>  // Error reported
```

**Solutions:**

1. **Enable dynamic classes (default):**
   ```json
   {
     "undefined-css-classes/no-undefined-css-classes": ["error", {
       "allowDynamicClasses": true  // Should be true (default)
     }]
   }
   ```

2. **Use ignore patterns for specific prefixes:**
   ```json
   {
     "undefined-css-classes/no-undefined-css-classes": ["error", {
       "ignoreClassPatterns": ["^theme-", "^variant-"]
     }]
   }
   ```

### Issue: CSS Modules Classes Reported as Errors

**Problem:** Classes from CSS Modules are being flagged

**Solutions:**

1. **Ignore module patterns:**
   ```json
   {
     "undefined-css-classes/no-undefined-css-classes": ["error", {
       "ignoreClassPatterns": ["^styles-", "^module-"]
     }]
   }
   ```

2. **The plugin doesn't check object property access:**
   ```jsx
   // ✅ Not checked (CSS Module)
   <div className={styles.container}>
   
   // ❌ Will be checked (string literal)
   <div className="container">
   ```

### Issue: Performance Problems

**Problem:** ESLint runs slowly with this plugin

**Solutions:**

1. **Optimize CSS file patterns:**
   ```json
   {
     "cssFiles": ["src/**/*.css"],  // Be specific
     "excludePatterns": ["**/node_modules/**", "**/dist/**", "**/*.min.css"]
   }
   ```

2. **Use specific base directory:**
   ```json
   {
     "baseDir": "./src"  // Don't scan entire project
   }
   ```

3. **The plugin caches results** - First run will be slower

### Issue: False Positives in Specific Files

**Problem:** Certain files have special classes that shouldn't be checked

**Solutions:**

1. **Use ESLint disable comments:**
   ```jsx
   /* eslint-disable undefined-css-classes/no-undefined-css-classes */
   <div className="special-class">Content</div>
   /* eslint-enable undefined-css-classes/no-undefined-css-classes */
   ```

2. **Disable for specific line:**
   ```jsx
   // eslint-disable-next-line undefined-css-classes/no-undefined-css-classes
   <div className="unchecked-class">Content</div>
   ```

3. **Configure file-specific rules in .eslintrc:**
   ```json
   {
     "overrides": [
       {
         "files": ["**/tests/**/*.jsx"],
         "rules": {
           "undefined-css-classes/no-undefined-css-classes": "off"
         }
       }
     ]
   }
   ```

### Issue: Classes in Media Queries Not Detected

**Problem:** Classes defined inside @media rules aren't recognized

**This should work correctly.** The plugin extracts classes from:
- Regular rules
- `@media` queries
- `@supports` rules
- `@keyframes` animations

**If not working, check:**
1. CSS syntax is valid
2. File is included in `cssFiles` pattern
3. Cache might need clearing (restart ESLint)

### Issue: Vue/HTML Files Not Checked

**Problem:** The plugin doesn't check .vue or .html files

**Solutions:**

1. **Ensure you have the appropriate parser:**
   - For Vue: Use `vue-eslint-parser`
   - For HTML: Use `@html-eslint/parser`

2. **Configure for Vue:**
   ```json
   {
     "parser": "vue-eslint-parser",
     "extends": ["plugin:vue/vue3-recommended"],
     "plugins": ["undefined-css-classes"]
   }
   ```

### Issue: Malformed CSS Causes Problems

**Problem:** CSS with syntax errors causes the plugin to fail

**The plugin handles this gracefully:** 
- It logs warnings for unparseable CSS
- Continues processing other files
- Won't crash ESLint

**To fix:**
1. Check console for CSS parsing warnings
2. Fix CSS syntax errors
3. The plugin will then detect classes correctly

## Debugging Tips

### Enable Verbose Logging

Check the console output when running ESLint for warnings about:
- CSS files that couldn't be parsed
- Pattern matching issues

### Test Configuration

Create a minimal test case:

```jsx
// test.jsx
<div className="test-class">Test</div>
```

```css
/* test.css */
.test-class { color: red; }
```

```json
// .eslintrc.json
{
  "plugins": ["undefined-css-classes"],
  "rules": {
    "undefined-css-classes/no-undefined-css-classes": ["error", {
      "cssFiles": ["test.css"],
      "baseDir": "."
    }]
  }
}
```

Run: `npx eslint test.jsx`

### Check What Classes Are Detected

To debug what CSS classes the plugin finds:

1. Temporarily add a console.log in `node_modules/eslint-plugin-undefined-css-classes/lib/utils/css-parser.js`:
   ```javascript
   getAllDefinedClasses() {
     // ... existing code ...
     const result = Array.from(allClasses);
     console.log('Found CSS classes:', result);  // Add this
     return result;
   }
   ```

2. Run ESLint and check the output

## Getting Help

If you're still experiencing issues:

1. **Check existing issues:** https://github.com/user/eslint-plugin-undefined-css-classes/issues
2. **Create a new issue with:**
   - Your ESLint configuration
   - Example code that reproduces the problem
   - Expected vs actual behavior
   - Plugin version and ESLint version

## Performance Optimization

### For Large Projects

1. **Be specific with patterns:**
   ```json
   {
     "cssFiles": ["src/**/*.css"],  // Don't use "**/*.css"
     "excludePatterns": ["**/build/**", "**/dist/**", "**/coverage/**"]
   }
   ```

2. **Use multiple configs for different parts:**
   ```json
   {
     "overrides": [
       {
         "files": ["src/components/**/*.jsx"],
         "rules": {
           "undefined-css-classes/no-undefined-css-classes": ["error", {
             "cssFiles": ["src/components/**/*.css"]
           }]
         }
       }
     ]
   }
   ```

3. **Consider disabling in development:**
   ```javascript
   // .eslintrc.js
   module.exports = {
     rules: {
       "undefined-css-classes/no-undefined-css-classes": 
         process.env.NODE_ENV === 'production' ? 'error' : 'warn'
     }
   };
   ```