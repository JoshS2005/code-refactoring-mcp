import Parser from 'tree-sitter';
import ts from 'tree-sitter-typescript';
import path from 'node:path';
import fs from 'node:fs/promises';

/**
 * Gets an initialized Tree-sitter parser for the given file extension.
 * Supports .ts, .tsx, .js, .jsx, .mjs, .cjs.
 */
export function getParserForExtension(extension: string): Parser {
  const parser = new Parser();

  if (extension === '.tsx' || extension === '.jsx') {
    parser.setLanguage(ts.tsx);
  } else {
    parser.setLanguage(ts.typescript);
  }

  return parser;
}

/**
 * Parses a file from disk into a Tree-sitter AST.
 */
export async function parseFile(filePath: string): Promise<Parser.Tree> {
  const extension = path.extname(filePath);
  const parser = getParserForExtension(extension);
  const text = await fs.readFile(filePath, 'utf-8');
  return parser.parse(text);
}

/**
 * Parses a source code string into a Tree-sitter AST.
 */
export function parseSource(sourceCode: string, extension: string = '.ts'): Parser.Tree {
  const parser = getParserForExtension(extension);
  return parser.parse(sourceCode);
}
