# Usage Examples

## Table of Contents
- [React/JSX Examples](#reactjsx-examples)
- [Vue.js Examples](#vuejs-examples)
- [Next.js Examples](#nextjs-examples)
- [Vanilla JavaScript Examples](#vanilla-javascript-examples)
- [CSS Modules Examples](#css-modules-examples)
- [Tailwind CSS Examples](#tailwind-css-examples)
- [Common Patterns](#common-patterns)

## React/JSX Examples

### Basic React Component

```jsx
// Component.jsx
import React from 'react';
import './Component.css';

function Component() {
  return (
    <div className="container"> {/* ✅ Defined in Component.css */}
      <h1 className="title">Hello</h1> {/* ✅ Defined in Component.css */}
      <p className="undefined-class">Text</p> {/* ❌ ERROR: Not defined */}
    </div>
  );
}
```

```css
/* Component.css */
.container {
  max-width: 1200px;
}

.title {
  font-size: 2rem;
}
```

### Dynamic Classes with Conditionals

```jsx
function Button({ variant, size, disabled }) {
  return (
    <button 
      className={`
        btn 
        ${variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
        ${size === 'large' ? 'btn-lg' : 'btn-sm'}
        ${disabled ? 'btn-disabled' : ''}
      `}
    >
      Click me
    </button>
  );
}
```

### Using clsx Utility

```jsx
import clsx from 'clsx';

function Card({ isActive, isHighlighted, className }) {
  return (
    <div 
      className={clsx(
        'card',                    // ✅ Static class
        {
          'card-active': isActive,  // ✅ Conditional class
          'card-highlight': isHighlighted,
          'card-invalid': true     // ❌ ERROR if not defined
        },
        className                   // ✅ Dynamic from props
      )}
    >
      Card content
    </div>
  );
}
```

### ESLint Configuration for React

```json
{
  "extends": [
    "react-app",
    "plugin:undefined-css-classes/recommended"
  ],
  "rules": {
    "undefined-css-classes/no-undefined-css-classes": ["error", {
      "cssFiles": ["src/**/*.css", "src/**/*.scss"],
      "baseDir": "./src"
    }]
  }
}
```

## Vue.js Examples

### Vue Single File Component

```vue
<template>
  <div class="wrapper">  <!-- ✅ Defined in <style> -->
    <h1 :class="titleClass">{{ title }}</h1>  <!-- ✅ Dynamic -->
    <button 
      :class="{
        'btn': true,
        'btn-active': isActive,
        'btn-loading': isLoading,
        'btn-invalid': true  <!-- ❌ ERROR if not defined -->
      }"
      @click="handleClick"
    >
      Click
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      titleClass: 'title-large',
      isActive: false,
      isLoading: false
    };
  }
};
</script>

<style>
.wrapper {
  padding: 20px;
}

.title-large {
  font-size: 2rem;
}

.btn {
  padding: 10px 20px;
}

.btn-active {
  background: blue;
}

.btn-loading {
  opacity: 0.5;
}
</style>
```

### Vue 3 Composition API

```vue
<template>
  <div :class="containerClasses">
    <span :class="['badge', badgeVariant]">{{ count }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: String,
  size: String
});

const containerClasses = computed(() => ({
  'container': true,
  'container-fluid': props.size === 'fluid',
  [`container-${props.variant}`]: props.variant  // Dynamic class
}));

const badgeVariant = computed(() => 
  props.variant ? `badge-${props.variant}` : 'badge-default'
);
</script>
```

### ESLint Configuration for Vue

```json
{
  "extends": [
    "plugin:vue/vue3-recommended",
    "plugin:undefined-css-classes/recommended"
  ],
  "rules": {
    "undefined-css-classes/no-undefined-css-classes": ["error", {
      "cssFiles": ["src/**/*.css", "src/**/*.vue"],
      "baseDir": "./src"
    }]
  }
}
```

## Next.js Examples

### Next.js with CSS Modules

```jsx
// components/Card.jsx
import styles from './Card.module.css';

export default function Card({ title, content }) {
  return (
    <div className={styles.card}> {/* ✅ CSS Module */}
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.content}>{content}</p>
      <button className="global-button">Action</button> {/* ✅ Global CSS */}
    </div>
  );
}
```

```css
/* Card.module.css */
.card {
  border: 1px solid #ddd;
  padding: 1rem;
}

.title {
  font-size: 1.5rem;
}

.content {
  color: #666;
}
```

### Next.js with Tailwind CSS

```jsx
// app/page.jsx
export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl">
          Get started
        </p>
      </div>
    </main>
  );
}
```

### ESLint Configuration for Next.js

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:undefined-css-classes/with-tailwind"
  ],
  "rules": {
    "undefined-css-classes/no-undefined-css-classes": ["error", {
      "cssFiles": ["app/**/*.css", "styles/**/*.css"],
      "ignoreClassPatterns": ["^styles-", "^module-"],
      "baseDir": "./"
    }]
  }
}
```

## Vanilla JavaScript Examples

### DOM Manipulation

```javascript
// ✅ Direct className assignment
const element = document.getElementById('myElement');
element.className = 'container active'; // Both classes should be defined

// ✅ Using classList API
element.classList.add('visible');      // Should be defined
element.classList.remove('hidden');    // Should be defined
element.classList.toggle('expanded');  // Should be defined

// ❌ ERROR: Undefined class
element.classList.add('undefined-class');

// ✅ Conditional classes
if (isActive) {
  element.classList.add('active');
} else {
  element.classList.add('inactive');
}

// ✅ Multiple classes
element.classList.add('btn', 'btn-primary', 'btn-large');
```

### Creating Elements

```javascript
function createCard(title, content) {
  const card = document.createElement('div');
  card.className = 'card'; // Should be defined in CSS
  
  const cardTitle = document.createElement('h2');
  cardTitle.className = 'card-title'; // Should be defined
  cardTitle.textContent = title;
  
  const cardContent = document.createElement('p');
  cardContent.className = 'card-content'; // Should be defined
  cardContent.textContent = content;
  
  card.appendChild(cardTitle);
  card.appendChild(cardContent);
  
  return card;
}
```

## CSS Modules Examples

### React with CSS Modules

```jsx
import styles from './Button.module.css';

function Button({ variant, children }) {
  // ✅ CSS Modules are not checked (they're transformed)
  return (
    <button className={styles.button}>
      {children}
    </button>
  );
}

// To ignore CSS Module patterns in your config:
{
  "rules": {
    "undefined-css-classes/no-undefined-css-classes": ["error", {
      "ignoreClassPatterns": ["^styles-", "^module-"]
    }]
  }
}
```

### CSS Module with Global Classes

```jsx
import styles from './Component.module.css';

function Component() {
  return (
    <div className={`${styles.container} global-class`}>
      {/* styles.container is ignored, global-class is checked */}
      Content
    </div>
  );
}
```

## Tailwind CSS Examples

### Basic Tailwind Usage

```jsx
// With Tailwind detection enabled (default)
function Card() {
  return (
    <div className="rounded-lg shadow-md p-6 bg-white dark:bg-gray-800">
      {/* ✅ All Tailwind utilities are recognized */}
      <h2 className="text-2xl font-bold mb-4">Title</h2>
      <p className="text-gray-600 dark:text-gray-300">Content</p>
      <button className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
        Action
      </button>
    </div>
  );
}
```

### Tailwind with Arbitrary Values

```jsx
function CustomLayout() {
  return (
    <div className="w-[350px] h-[600px] bg-[#1da1f2]">
      {/* ✅ Arbitrary values are recognized */}
      <div className="grid grid-cols-[1fr_2fr_1fr] gap-[20px]">
        <div className="p-[clamp(1rem,2vw,2rem)]">Content</div>
      </div>
    </div>
  );
}
```

### Tailwind v3/v4 Advanced Features

```jsx
function ModernComponent() {
  return (
    <>
      {/* Container queries */}
      <div className="@container">
        <div className="@lg:flex @lg:items-center">Content</div>
      </div>
      
      {/* Has selector */}
      <div className="has-[:checked]:bg-blue-50">
        <input type="checkbox" />
      </div>
      
      {/* Data attributes */}
      <div className="data-[state=open]:block data-[state=closed]:hidden">
        Collapsible content
      </div>
      
      {/* Aria attributes */}
      <button className="aria-expanded:rotate-180">
        Expand
      </button>
    </>
  );
}
```

## Common Patterns

### Mixed Tailwind and Custom Classes

```jsx
function Component() {
  return (
    <div className="flex items-center custom-wrapper">
      {/* flex, items-center: Tailwind (ignored if enabled) */}
      {/* custom-wrapper: Must be defined in CSS */}
      <span className="text-lg app-title">App</span>
      {/* text-lg: Tailwind */}
      {/* app-title: Must be defined */}
    </div>
  );
}
```

### Dynamic Class Generation

```jsx
// With allowDynamicClasses: true (default)
function ThemedComponent({ theme, size }) {
  return (
    <div className={`theme-${theme} size-${size}`}>
      {/* ✅ Dynamic classes are allowed */}
      Content
    </div>
  );
}

// To disable dynamic classes:
{
  "rules": {
    "undefined-css-classes/no-undefined-css-classes": ["error", {
      "allowDynamicClasses": false
    }]
  }
}
```

### Ignoring Specific Patterns

```jsx
// Configure patterns to ignore
{
  "rules": {
    "undefined-css-classes/no-undefined-css-classes": ["error", {
      "ignoreClassPatterns": [
        "^test-",      // Ignore test classes
        "^e2e-",       // Ignore E2E selectors
        "^qa-",        // Ignore QA attributes
        "^analytics-"  // Ignore analytics classes
      ]
    }]
  }
}

function Component() {
  return (
    <div className="test-component e2e-main-container">
      {/* ✅ Both classes are ignored due to patterns */}
      <button className="qa-submit-button analytics-track-click">
        Submit
      </button>
    </div>
  );
}
```

### Working with Multiple CSS Files

```json
{
  "rules": {
    "undefined-css-classes/no-undefined-css-classes": ["error", {
      "cssFiles": [
        "src/**/*.css",
        "styles/**/*.scss",
        "components/**/*.module.css",
        "!**/*.min.css"  // Exclude minified files
      ],
      "baseDir": "./src"
    }]
  }
}
```

### Framework-Specific Patterns

```jsx
// Bootstrap-like classes (not Tailwind)
<div className="col-md-6 alert alert-warning">
  {/* ❌ These will error unless defined in CSS */}
</div>

// BEM methodology
<div className="block__element--modifier">
  {/* ❌ Must be defined in CSS */}
</div>

// Utility-first (non-Tailwind)
<div className="u-margin-top-large u-text-center">
  {/* ❌ Must be defined in CSS */}
</div>
```