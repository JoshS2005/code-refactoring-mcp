import { describe, it, expect } from 'vitest';
import { getOutlineFromSource } from '../src/tools/outline.js';

describe('Outline Tool (Prototype 3)', () => {
  it('extracts class with methods', () => {
    const code = `
      export class Calculator {
        private value: number = 0;

        add(a: number): void {
          this.value += a;
        }

        subtract(b: number): void {
          this.value -= b;
        }
      }
    `;

    const outline = getOutlineFromSource(code, '.ts');
    
    expect(outline).toHaveLength(1);
    expect(outline[0].name).toBe('Calculator');
    expect(outline[0].kind).toBe('class');
    expect(outline[0].signature).toBe('class Calculator');
    
    const children = outline[0].children;
    expect(children).toBeDefined();
    expect(children!).toHaveLength(2);
    expect(children![0].name).toBe('add');
    expect(children![0].kind).toBe('method');
    expect(children![1].name).toBe('subtract');
  });

  it('extracts interfaces and type aliases', () => {
    const code = `
      interface User {
        id: string;
        name: string;
      }

      type UserId = string;
    `;

    const outline = getOutlineFromSource(code, '.ts');
    
    expect(outline).toHaveLength(2);
    expect(outline[0].name).toBe('User');
    expect(outline[0].kind).toBe('interface');
    expect(outline[1].name).toBe('UserId');
    expect(outline[1].kind).toBe('typeAlias');
  });

  it('extracts functions and arrow functions', () => {
    const code = `
      export function parse(text: string): void {
        console.log(text);
      }

      const process = (data: any) => {
        return data;
      };
    `;

    const outline = getOutlineFromSource(code, '.ts');
    
    expect(outline).toHaveLength(2);
    expect(outline[0].name).toBe('parse');
    expect(outline[0].kind).toBe('function');
    expect(outline[1].name).toBe('process');
    expect(outline[1].kind).toBe('function');
  });
});
