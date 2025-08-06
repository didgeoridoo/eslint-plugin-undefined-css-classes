# Svelte Integration Debugging Guide

## The Issue

The plugin includes handlers for Svelte AST nodes, but they may not be getting called due to how `eslint-plugin-svelte` exposes the AST. This debug guide will help identify the issue.

## Step 1: Use the Debug Rule

Replace your current rule configuration with the debug version:

```javascript
// In your eslint.config.js
{
  files: ['**/*.svelte'],
  plugins: {
    'undefined-css-classes': undefinedCssClasses
  },
  rules: {
    // Replace this:
    // 'undefined-css-classes/no-undefined-css-classes': ['warn', { ... }]
    
    // With this:
    'undefined-css-classes/no-undefined-css-classes-debug': ['warn', {
      debug: true,
      cssFiles: ['src/app.css'],
      // ... other options
    }]
  }
}
```

## Step 2: Run ESLint on a Single Svelte File

Run ESLint on a Svelte file with class attributes:

```bash
npx eslint src/lib/components/Hero.svelte
```

## Step 3: Check the Console Output

The debug rule will log:
1. All node types it encounters
2. Detailed structure of any attribute-related nodes
3. Full node data when a class attribute is found

Look for output like:
```
[DEBUG] Found node type: SvelteAttribute
[DEBUG] Node structure for SvelteAttribute: { ... }
[DEBUG] Found class attribute in SvelteAttribute node
```

## Step 4: Share the Debug Output

Please share the console output, particularly:
- What node types are being found (especially any containing "Attribute")
- The structure of any class attribute nodes
- Any nodes that look like they might contain class information

## What We're Looking For

We need to understand:
1. **Are SvelteAttribute nodes being visited?** If not, the handler isn't being called at all.
2. **What's the actual structure of the nodes?** The AST might differ from our expectations.
3. **Is the class attribute structured differently?** The key/name properties might be different.

## Alternative: Minimal Test Case

If the debug output is too verbose, create a minimal Svelte component:

```svelte
<!-- test.svelte -->
<div class="test-class">Hello</div>
```

And run the debug rule on just this file.

## Possible Outcomes

Based on what we find:

1. **If SvelteAttribute nodes aren't appearing**: The eslint-plugin-svelte might be preprocessing them away, and we need a different approach.

2. **If nodes appear but with different structure**: We'll update our handlers to match the actual AST structure.

3. **If no attribute nodes appear at all**: We might need to handle different node types or work with the preprocessed output.

## Temporary Workaround

While we debug this, you could:
1. Use the plugin on your CSS/SCSS files directly to find unused classes
2. Use it on non-Svelte files in your project
3. Manually check Svelte files against your CSS

## Next Steps

Once we have the debug output, we can:
1. Update the plugin to handle the correct AST structure
2. Add proper integration tests with eslint-plugin-svelte
3. Document the correct configuration for Svelte projects

Please run the debug rule and share the output so we can fix this integration issue!