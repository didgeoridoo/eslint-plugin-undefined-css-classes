#!/usr/bin/env node

/**
 * Verification script to ensure the plugin works correctly
 * Run with: node verify-plugin.js
 */

const { ESLint } = require('eslint');
const fs = require('fs');
const path = require('path');

async function verify() {
  console.log('🔍 Verifying eslint-plugin-undefined-css-classes...\n');

  // Create temporary test files
  const testDir = path.join(__dirname, 'verification-test');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  // Create test CSS
  fs.writeFileSync(path.join(testDir, 'styles.css'), `
    .defined-class { color: blue; }
    .btn { padding: 10px; }
    .container { width: 100%; }
  `);

  // Create test JSX
  fs.writeFileSync(path.join(testDir, 'test.jsx'), `
    import React from 'react';
    
    function TestComponent() {
      return (
        <div className="container defined-class">
          <button className="btn">Valid Button</button>
          <span className="undefined-class">This should error</span>
          <div className="flex items-center">Tailwind classes</div>
        </div>
      );
    }
  `);

  // Configure ESLint
  const eslint = new ESLint({
    useEslintrc: false,
    baseConfig: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      },
      plugins: ['undefined-css-classes'],
      rules: {
        'undefined-css-classes/no-undefined-css-classes': ['error', {
          cssFiles: ['*.css'],
          baseDir: testDir,
          ignoreTailwind: true,
          requireTailwindConfig: false
        }]
      }
    }
  });

  try {
    // Run ESLint
    const results = await eslint.lintFiles([path.join(testDir, 'test.jsx')]);
    const messages = results[0].messages;

    console.log('📋 Test Results:\n');
    
    // Verify results
    const tests = [
      {
        name: 'Detects undefined CSS class',
        pass: messages.some(m => m.message.includes('undefined-class'))
      },
      {
        name: 'Allows defined CSS classes (no false positives)',
        pass: messages.every(m => 
          !m.message.includes('"defined-class"') && 
          !m.message.includes('"container"') && 
          !m.message.includes('"btn"')
        )
      },
      {
        name: 'Ignores Tailwind classes',
        pass: !messages.some(m => m.message.includes('flex') || m.message.includes('items-center'))
      },
      {
        name: 'Reports correct number of errors',
        pass: messages.length === 1
      }
    ];

    let allPassed = true;
    tests.forEach(test => {
      const status = test.pass ? '✅' : '❌';
      console.log(`${status} ${test.name}`);
      if (!test.pass) allPassed = false;
    });

    console.log('\n📊 Summary:');
    console.log(`Total tests: ${tests.length}`);
    console.log(`Passed: ${tests.filter(t => t.pass).length}`);
    console.log(`Failed: ${tests.filter(t => !t.pass).length}`);

    if (allPassed) {
      console.log('\n✨ All verification tests passed! The plugin is working correctly.');
    } else {
      console.log('\n❌ Some tests failed. Please check the implementation.');
      console.log('\nDebug info - ESLint messages:');
      messages.forEach(m => {
        console.log(`  - ${m.message} (line ${m.line})`);
      });
    }

    // Test configuration options
    console.log('\n🔧 Testing configuration options...\n');

    // Test with strict mode (no Tailwind, no dynamic)
    const strictEslint = new ESLint({
      useEslintrc: false,
      baseConfig: {
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: { jsx: true }
        },
        plugins: ['undefined-css-classes'],
        rules: {
          'undefined-css-classes/no-undefined-css-classes': ['error', {
            cssFiles: ['*.css'],
            baseDir: testDir,
            ignoreTailwind: false,
            allowDynamicClasses: false
          }]
        }
      }
    });

    const strictResults = await strictEslint.lintFiles([path.join(testDir, 'test.jsx')]);
    const strictMessages = strictResults[0].messages;

    const configTests = [
      {
        name: 'Strict mode detects Tailwind classes',
        pass: strictMessages.some(m => m.message.includes('flex') || m.message.includes('items-center'))
      },
      {
        name: 'Configuration affects behavior',
        pass: strictMessages.length > messages.length
      }
    ];

    configTests.forEach(test => {
      const status = test.pass ? '✅' : '❌';
      console.log(`${status} ${test.name}`);
    });

    // Test predefined configs
    console.log('\n📦 Testing predefined configs...\n');
    
    const configs = ['recommended', 'strict', 'with-tailwind'];
    const plugin = require('./lib/index.js');
    
    configs.forEach(configName => {
      const config = plugin.configs[configName];
      const hasConfig = config && config.rules && config.rules['undefined-css-classes/no-undefined-css-classes'];
      console.log(`${hasConfig ? '✅' : '❌'} Config '${configName}' exists and is valid`);
    });

  } catch (error) {
    console.error('❌ Verification failed with error:', error.message);
  } finally {
    // Cleanup
    fs.unlinkSync(path.join(testDir, 'styles.css'));
    fs.unlinkSync(path.join(testDir, 'test.jsx'));
    fs.rmdirSync(testDir);
  }
}

// Run verification
verify().catch(console.error);