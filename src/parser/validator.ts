import type Parser from 'tree-sitter';

export interface SyntaxDiagnostic {
  type: 'ERROR' | 'MISSING';
  message: string;
  startIndex: number;
  endIndex: number;
  startPosition: Parser.Point;
  endPosition: Parser.Point;
}

/**
 * Traverses a Tree-sitter AST to find syntax errors and missing nodes.
 * Returns an array of diagnostics. Returns an empty array if the tree is structurally sound.
 */
export function validateAST(tree: Parser.Tree): SyntaxDiagnostic[] {
  const diagnostics: SyntaxDiagnostic[] = [];
  const cursor = tree.walk();

  let reachedRoot = false;
  while (!reachedRoot) {
    const nodeType = cursor.nodeType;
    const isError = nodeType === 'ERROR';
    const isMissing = cursor.nodeIsMissing;

    if (isError || isMissing) {
      diagnostics.push({
        type: isMissing ? 'MISSING' : 'ERROR',
        message: isMissing ? `Missing expected syntax node: ${nodeType}` : 'Syntax error',
        startIndex: cursor.startIndex,
        endIndex: cursor.endIndex,
        startPosition: cursor.startPosition,
        endPosition: cursor.endPosition,
      });
    }

    // Traverse the tree: go down, then right, then up.
    if (cursor.gotoFirstChild()) {
      continue;
    }
    
    if (cursor.gotoNextSibling()) {
      continue;
    }

    // Go up until we can go right, or until we reach the root
    let retracing = true;
    while (retracing) {
      if (!cursor.gotoParent()) {
        reachedRoot = true;
        retracing = false;
      } else if (cursor.gotoNextSibling()) {
        retracing = false;
      }
    }
  }

  return diagnostics;
}

/**
 * Helper to check if a parsed AST contains any syntax errors.
 */
export function hasSyntaxErrors(tree: Parser.Tree): boolean {
  return tree.rootNode.hasError;
}
