import { describe, it, expect } from 'vitest';
import { parseSource } from '../src/parser/engine.js';
import { validateAST, hasSyntaxErrors } from '../src/parser/validator.js';

describe('Parser Engine & AST Validator (Prototype 2)', () => {
  it('parses valid TypeScript code without errors', () => {
    const validCode = `
      export function add(a: number, b: number): number {
        return a + b;
      }
      
      const result = add(1, 2);
    `;
    
    const tree = parseSource(validCode, '.ts');
    
    // Quick root check
    expect(hasSyntaxErrors(tree)).toBe(false);
    
    // Deep traversal check
    const diagnostics = validateAST(tree);
    expect(diagnostics).toHaveLength(0);
  });

  it('detects syntax errors in malformed TypeScript', () => {
    const invalidCode = `
      export function add(a: number, b: number): number {
        return a + b;
      }
      
      // Missing value in assignment
      const result = ;
    `;
    
    const tree = parseSource(invalidCode, '.ts');
    
    expect(hasSyntaxErrors(tree)).toBe(true);
    
    const diagnostics = validateAST(tree);
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics[0].type).toBe('ERROR');
  });

  it('detects MISSING nodes', () => {
    // Missing closing brace for the block
    const missingClosingBraceCode = `
      if (true) {
        console.log("hello");
    `;
    
    const tree = parseSource(missingClosingBraceCode, '.ts');
    
    expect(hasSyntaxErrors(tree)).toBe(true);
    
    const diagnostics = validateAST(tree);
    expect(diagnostics.length).toBeGreaterThan(0);
    // Depending on the parser, it might flag it as MISSING '}' or just ERROR
    const hasMissingOrError = diagnostics.some(d => d.type === 'MISSING' || d.type === 'ERROR');
    expect(hasMissingOrError).toBe(true);
  });

  it('parses TSX syntax correctly', () => {
    const tsxCode = `
      import React from 'react';
      
      export const Button = ({ children }) => (
        <button className="btn">{children}</button>
      );
    `;
    
    // Parse as .ts first - it should fail because of JSX tags
    const tsTree = parseSource(tsxCode, '.ts');
    expect(hasSyntaxErrors(tsTree)).toBe(true);
    
    // Now parse as .tsx - it should succeed
    const tsxTree = parseSource(tsxCode, '.tsx');
    expect(hasSyntaxErrors(tsxTree)).toBe(false);
    expect(validateAST(tsxTree)).toHaveLength(0);
  });
});
