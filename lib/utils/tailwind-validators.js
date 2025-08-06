/**
 * Validator functions for Tailwind CSS class patterns
 * Based on patterns from tailwind-merge
 */

const TSHIRT_UNIT_REGEX = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
const LENGTH_UNIT_REGEX = /^\d+(\.\d+)?(px|em|rem|vh|vw|ch|ex|%|cm|mm|in|pc|pt)$/;

/**
 * Check if value is an arbitrary value (wrapped in square brackets)
 */
function isArbitraryValue(value) {
  return value.startsWith('[') && value.endsWith(']');
}

/**
 * Check if value is a number (integer or decimal)
 */
function isNumber(value) {
  return !Number.isNaN(Number(value));
}

/**
 * Check if value is an integer
 */
function isInteger(value) {
  return Number.isInteger(Number(value));
}

/**
 * Check if value is a t-shirt size
 */
function isTshirtSize(value) {
  return TSHIRT_UNIT_REGEX.test(value);
}

/**
 * Check if value is a length unit
 */
function isLength(value) {
  return isNumber(value) || LENGTH_UNIT_REGEX.test(value) || value === '0';
}

/**
 * Check if value is arbitrary length
 */
function isArbitraryLength(value) {
  if (!isArbitraryValue(value)) {
    return false;
  }
  const innerValue = value.slice(1, -1);
  return LENGTH_UNIT_REGEX.test(innerValue) || innerValue.includes('calc(') || innerValue.includes('var(');
}

/**
 * Check if value is a percentage
 */
function isPercentage(value) {
  return value.endsWith('%') && isNumber(value.slice(0, -1));
}

/**
 * Check if value is arbitrary position
 */
function isArbitraryPosition(value) {
  if (!isArbitraryValue(value)) {
    return false;
  }
  const innerValue = value.slice(1, -1);
  return innerValue.includes(' ') || innerValue.includes('_');
}

/**
 * Check if value is arbitrary size
 */
function isArbitrarySize(value) {
  return isArbitraryValue(value) && !value.includes(' ');
}

/**
 * Check if value is arbitrary color
 */
function isArbitraryColor(value) {
  if (!isArbitraryValue(value)) {
    return false;
  }
  const innerValue = value.slice(1, -1);
  return (
    innerValue.startsWith('#') ||
    innerValue.startsWith('rgb') ||
    innerValue.startsWith('rgba') ||
    innerValue.startsWith('hsl') ||
    innerValue.startsWith('hsla') ||
    innerValue.startsWith('var(--') ||
    innerValue.startsWith('color(')
  );
}

/**
 * Check if value is arbitrary shadow
 */
function isArbitraryShadow(value) {
  if (!isArbitraryValue(value)) {
    return false;
  }
  const innerValue = value.slice(1, -1);
  return innerValue.includes(' ') && (
    innerValue.includes('px') ||
    innerValue.includes('em') ||
    innerValue.includes('rem') ||
    innerValue.includes('blur')
  );
}

/**
 * Check if value is an arbitrary image (url, gradient, etc.)
 */
function isArbitraryImage(value) {
  if (!isArbitraryValue(value)) {
    return false;
  }
  const innerValue = value.slice(1, -1);
  return (
    innerValue.startsWith('url(') ||
    innerValue.includes('gradient') ||
    innerValue.startsWith('image(')
  );
}

/**
 * Check if value is a valid opacity value (0-100)
 */
function isOpacity(value) {
  const num = Number(value);
  return !Number.isNaN(num) && num >= 0 && num <= 100;
}

/**
 * Check if value matches any of the provided options
 */
function isAny(_value) {
  return true;
}

/**
 * Check if value is never valid
 */
function isNever(_value) {
  return false;
}

/**
 * Create a validator from theme values
 */
function fromTheme(_themeKey) {
  return function(_value) {
    // This is a placeholder - in real implementation, 
    // this would check against actual theme values
    return true;
  };
}

module.exports = {
  isArbitraryValue,
  isNumber,
  isInteger,
  isTshirtSize,
  isLength,
  isArbitraryLength,
  isPercentage,
  isArbitraryPosition,
  isArbitrarySize,
  isArbitraryColor,
  isArbitraryShadow,
  isArbitraryImage,
  isOpacity,
  isAny,
  isNever,
  fromTheme
};