const noUndefinedCssClasses = require('./rules/no-undefined-css-classes');

module.exports = {
  rules: {
    'no-undefined-css-classes': noUndefinedCssClasses
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