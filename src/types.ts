/**
 * Core type definitions for AST Refactor MCP Server.
 */

export interface SourceLocation {
  line: number; // 1-indexed
  column: number; // 0-indexed or 1-indexed (tree-sitter provides 0-indexed column)
}

export interface NodeRange {
  start: SourceLocation;
  end: SourceLocation;
  startIndex: number; // byte offset
  endIndex: number; // byte offset
}

export type SymbolKind =
  | 'function'
  | 'method'
  | 'class'
  | 'interface'
  | 'typeAlias'
  | 'enum'
  | 'variable';

export interface OutlineItem {
  name: string;
  kind: SymbolKind;
  range: NodeRange;
  signature?: string;
  children?: OutlineItem[];
}

export interface OutlineResult {
  filePath: string;
  outline: OutlineItem[];
}

export interface SymbolReference {
  symbol: string;
  range: NodeRange;
  isDeclaration: boolean;
  contextSnippet: string;
}

export interface ReferencesResult {
  filePath: string;
  symbol: string;
  scopeFunction?: string;
  references: SymbolReference[];
}

export interface RenameResult {
  filePath: string;
  oldName: string;
  newName: string;
  scopeFunction: string;
  occurrencesRenamed: number;
  applied: boolean;
  errors?: string[];
}
