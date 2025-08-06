const noUndefinedCssClasses = require('./rules/no-undefined-css-classes');
const noUndefinedCssClassesDebug = require('./rules/no-undefined-css-classes-debug');

module.exports = {
  rules: {
    'no-undefined-css-classes': noUndefinedCssClasses,
    'no-undefined-css-classes-debug': noUndefinedCssClassesDebug
  },
  configs: {
    recommended: {
      plugins: ['undefined-css-classes'],
      rules: {
        'undefined-css-classes/no-undefined-css-classes': 'error'
      }
    },
    strict: {
      plugins: ['undefined-css-classes'],
      rules: {
        'undefined-css-classes/no-undefined-css-classes': ['error', {
          ignoreTailwind: false,
          allowDynamicClasses: false
        }]
      }
    },
    'with-tailwind': {
      plugins: ['undefined-css-classes'],
      rules: {
        'undefined-css-classes/no-undefined-css-classes': ['error', {
          ignoreTailwind: true,
          requireTailwindConfig: true,
          allowDynamicClasses: true
        }]
      }
    }
  }
};