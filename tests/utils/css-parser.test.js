const CSSClassExtractor = require('../../lib/utils/css-parser');
const fs = require('fs');
const path = require('path');

describe('CSSClassExtractor', () => {
  const fixturesDir = path.join(__dirname, '../fixtures/css-parser');
  
  beforeAll(() => {
    // Create test CSS files
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // Basic CSS file
    fs.writeFileSync(path.join(fixturesDir, 'basic.css'), `
      .simple-class { color: red; }
      #id-selector { background: blue; }
      .compound-class.another { margin: 0; }
      .parent .child { padding: 10px; }
      .class-with-pseudo:hover { color: green; }
      .class-with-pseudo::before { content: ""; }
      
      /* Multiple classes in one selector */
      .class1, .class2, .class3 { display: flex; }
      
      /* Attribute selectors */
      [data-theme="dark"] .themed-class { color: white; }
      input[type="text"].input-class { border: 1px solid; }
    `);

    // CSS with media queries
    fs.writeFileSync(path.join(fixturesDir, 'media.css'), `
      .mobile-class { display: none; }
      
      @media (min-width: 768px) {
        .tablet-class { display: block; }
        .responsive-grid { grid-template-columns: 1fr 1fr; }
      }
      
      @media print {
        .print-only { display: block; }
        .no-print { display: none; }
      }
    `);

    // CSS with animations and keyframes
    fs.writeFileSync(path.join(fixturesDir, 'animations.css'), `
      @keyframes slideIn {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }
      
      @keyframes fadeOut {
        to { opacity: 0; }
      }
      
      .animated-element {
        animation: slideIn 0.3s ease-in-out;
      }
      
      @supports (display: grid) {
        .grid-supported { display: grid; }
        .grid-item { grid-column: span 2; }
      }
    `);

    // Complex selectors
    fs.writeFileSync(path.join(fixturesDir, 'complex.css'), `
      /* Complex pseudo-selectors */
      .list-item:nth-child(2n) { background: #f0f0f0; }
      .form-input:not(:disabled):not(:read-only) { cursor: pointer; }
      
      /* Nested selectors */
      .card {
        .card-header { font-weight: bold; }
        .card-body { padding: 1rem; }
        
        &.card-primary {
          background: blue;
        }
      }
      
      /* CSS Variables */
      :root {
        --primary-color: blue;
      }
      
      .uses-var {
        color: var(--primary-color);
      }
    `);
  });

  afterAll(() => {
    // Clean up test files
    const files = fs.readdirSync(fixturesDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(fixturesDir, file));
    });
    fs.rmdirSync(fixturesDir);
  });

  test('extracts classes from basic CSS', () => {
    const extractor = new CSSClassExtractor({
      cssFiles: ['basic.css'],
      baseDir: fixturesDir
    });
    
    const classes = extractor.getAllDefinedClasses();
    
    expect(classes).toContain('simple-class');
    expect(classes).toContain('compound-class');
    expect(classes).toContain('another');
    expect(classes).toContain('parent');
    expect(classes).toContain('child');
    expect(classes).toContain('class-with-pseudo');
    expect(classes).toContain('class1');
    expect(classes).toContain('class2');
    expect(classes).toContain('class3');
    expect(classes).toContain('themed-class');
    expect(classes).toContain('input-class');
    expect(classes).not.toContain('id-selector');
  });

  test('extracts classes from media queries', () => {
    const extractor = new CSSClassExtractor({
      cssFiles: ['media.css'],
      baseDir: fixturesDir
    });
    
    const classes = extractor.getAllDefinedClasses();
    
    expect(classes).toContain('mobile-class');
    expect(classes).toContain('tablet-class');
    expect(classes).toContain('responsive-grid');
    expect(classes).toContain('print-only');
    expect(classes).toContain('no-print');
  });

  test('extracts classes from @supports rules', () => {
    const extractor = new CSSClassExtractor({
      cssFiles: ['animations.css'],
      baseDir: fixturesDir
    });
    
    const classes = extractor.getAllDefinedClasses();
    
    expect(classes).toContain('animated-element');
    expect(classes).toContain('grid-supported');
    expect(classes).toContain('grid-item');
    // Keyframe names are also captured
    expect(classes).toContain('slideIn');
    expect(classes).toContain('fadeOut');
  });

  test('handles complex and nested selectors', () => {
    const extractor = new CSSClassExtractor({
      cssFiles: ['complex.css'],
      baseDir: fixturesDir
    });
    
    const classes = extractor.getAllDefinedClasses();
    
    expect(classes).toContain('list-item');
    expect(classes).toContain('form-input');
    expect(classes).toContain('card');
    expect(classes).toContain('card-header');
    expect(classes).toContain('card-body');
    expect(classes).toContain('card-primary');
    expect(classes).toContain('uses-var');
  });

  test('handles glob patterns', () => {
    const extractor = new CSSClassExtractor({
      cssFiles: ['*.css'],
      baseDir: fixturesDir
    });
    
    const classes = extractor.getAllDefinedClasses();
    
    // Should get classes from all CSS files
    expect(classes).toContain('simple-class');
    expect(classes).toContain('tablet-class');
    expect(classes).toContain('animated-element');
    expect(classes).toContain('card');
  });

  test('excludes files based on patterns', () => {
    const extractor = new CSSClassExtractor({
      cssFiles: ['*.css'],
      excludePatterns: ['**/complex.css'],
      baseDir: fixturesDir
    });
    
    const classes = extractor.getAllDefinedClasses();
    
    expect(classes).toContain('simple-class');
    expect(classes).not.toContain('card'); // from complex.css
  });

  test('caches results', () => {
    const extractor = new CSSClassExtractor({
      cssFiles: ['basic.css'],
      baseDir: fixturesDir
    });
    
    const classes1 = extractor.getAllDefinedClasses();
    const classes2 = extractor.getAllDefinedClasses();
    
    expect(classes1).toBe(classes2); // Should be the same array reference
    
    extractor.clearCache();
    const classes3 = extractor.getAllDefinedClasses();
    
    expect(classes3).toEqual(classes1); // Same content
    expect(classes3).not.toBe(classes1); // Different array reference
  });

  test('handles non-existent files gracefully', () => {
    const extractor = new CSSClassExtractor({
      cssFiles: ['non-existent.css'],
      baseDir: fixturesDir
    });
    
    const classes = extractor.getAllDefinedClasses();
    expect(classes).toEqual([]);
  });

  test('handles malformed CSS gracefully', () => {
    const malformedPath = path.join(fixturesDir, 'malformed.css');
    // PostCSS will stop parsing at severe errors, so we test with minor issues
    fs.writeFileSync(malformedPath, `
      .valid-class { color: red; }
      .another-valid { display: block; }
      /* This will be parsed despite minor issues */
      .class-with-typo { colr: blue; }
      .final-class { margin: 0; }
    `);
    
    const extractor = new CSSClassExtractor({
      cssFiles: ['malformed.css'],
      baseDir: fixturesDir
    });
    
    const classes = extractor.getAllDefinedClasses();
    
    // Should extract all classes even with property typos
    expect(classes).toContain('valid-class');
    expect(classes).toContain('another-valid');
    expect(classes).toContain('class-with-typo');
    expect(classes).toContain('final-class');
    
    fs.unlinkSync(malformedPath);
  });
});