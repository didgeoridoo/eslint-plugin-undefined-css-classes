/**
 * Tailwind CSS official scales and values
 * These are the actual values that Tailwind supports, not arbitrary numbers
 */

// Border width scale - very limited!
const borderWidthScale = ['0', '2', '4', '8'];

// Ring width scale
const ringWidthScale = ['0', '1', '2', '4', '8'];

// Outline width scale  
const outlineWidthScale = ['0', '1', '2', '4', '8'];

// Divide width scale
const divideWidthScale = ['0', '2', '4', '8'];

// Full spacing scale used by padding, margin, gap, etc.
const spacingScale = [
  '0', 'px', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '7', '8', '9', '10', 
  '11', '12', '14', '16', '20', '24', '28', '32', '36', '40', '44', '48', '52', '56', '60', 
  '64', '72', '80', '96'
];

// Inset/position scale (includes fractions)
const insetScale = [
  ...spacingScale,
  'auto', 'full',
  '1/2', '1/3', '2/3', '1/4', '2/4', '3/4'
];

// Text size scale
const textSizeScale = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'];

// Size scale for max-width, etc (includes 'md')
const sizeScale = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'];

// Font weight scale
const fontWeightScale = ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'];

// Tracking (letter-spacing) scale
const trackingScale = ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'];

// Leading (line-height) scale
const leadingScale = ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose', '3', '4', '5', '6', '7', '8', '9', '10'];

// Shadow scale
const shadowScale = ['', 'sm', 'md', 'lg', 'xl', '2xl', 'inner', 'none'];

// Blur scale
const blurScale = ['', 'none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

// Rounded scale
const roundedScale = ['', 'none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'];

// Opacity scale
const opacityScale = ['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80', '85', '90', '95', '100'];

// Z-index scale
const zIndexScale = ['0', '10', '20', '30', '40', '50', 'auto'];

// Order scale
const orderScale = ['first', 'last', 'none', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

// Grid columns/rows scale
const gridScale = ['none', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'subgrid'];

// Flex values
const flexScale = ['1', 'auto', 'initial', 'none'];

// Duration scale (transitions)
const durationScale = ['0', '75', '100', '150', '200', '300', '500', '700', '1000'];

// Delay scale (transitions)
const delayScale = durationScale;

// Width/Height fractions
const sizeFractions = [
  '1/2', '1/3', '2/3', '1/4', '2/4', '3/4', '1/5', '2/5', '3/5', '4/5', 
  '1/6', '2/6', '3/6', '4/6', '5/6', '1/12', '2/12', '3/12', '4/12', '5/12', 
  '6/12', '7/12', '8/12', '9/12', '10/12', '11/12'
];

// Common color names
const colorNames = [
  'inherit', 'current', 'transparent', 'black', 'white',
  'slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow',
  'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet',
  'purple', 'fuchsia', 'pink', 'rose'
];

// Color scales (50-950)
const colorScales = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

module.exports = {
  borderWidthScale,
  ringWidthScale,
  outlineWidthScale,
  divideWidthScale,
  spacingScale,
  insetScale,
  textSizeScale,
  sizeScale,
  fontWeightScale,
  trackingScale,
  leadingScale,
  shadowScale,
  blurScale,
  roundedScale,
  opacityScale,
  zIndexScale,
  orderScale,
  gridScale,
  flexScale,
  durationScale,
  delayScale,
  sizeFractions,
  colorNames,
  colorScales
};