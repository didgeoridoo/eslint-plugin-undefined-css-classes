import React from 'react';
import clsx from 'clsx';

// This file demonstrates various class usage patterns

function App() {
  const isActive = true;
  const theme = 'dark';
  
  return (
    <div className="container">
      {/* Valid: defined class */}
      <header className="header">
        {/* Valid: multiple defined classes */}
        <nav className="nav-menu mobile-hidden">
          <li className="nav-item">Home</li>
          <li className="nav-item">About</li>
        </nav>
        
        {/* Invalid: undefined class */}
        <div className="logo-wrapper">Logo</div>
      </header>
      
      {/* Valid: defined btn classes */}
      <button className="btn btn-primary">
        Click me
      </button>
      
      {/* Invalid: btn-danger is not defined */}
      <button className="btn btn-danger">
        Delete
      </button>
      
      {/* Valid: using clsx with defined classes */}
      <div className={clsx('card', {
        'card-active': isActive, // Invalid: card-active not defined
      })}>
        <div className="card-header">Title</div>
        <div className="card-body">Content</div>
      </div>
      
      {/* Dynamic classes - can be configured to allow or disallow */}
      <div className={`theme-${theme}`}>
        Dynamic theme
      </div>
      
      {/* Template literal with conditional */}
      <button className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}>
        Conditional
      </button>
      
      {/* Invalid: misspelled class */}
      <div className="containr">
        Typo in class name
      </div>
      
      {/* If Tailwind is installed, these would be ignored */}
      <div className="flex items-center justify-between p-4">
        <span className="text-blue-500">Tailwind classes</span>
        <span className="bg-red-100 hover:bg-red-200">More Tailwind</span>
      </div>
    </div>
  );
}

export default App;