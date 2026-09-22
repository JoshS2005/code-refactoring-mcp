import type Parser from 'tree-sitter';
import { parseFile, parseSource } from '../parser/engine.js';
import type { OutlineItem, SymbolKind, NodeRange, SourceLocation } from '../types.js';

function toSourceLocation(point: Parser.Point): SourceLocation {
  return {
    line: point.row + 1, // tree-sitter is 0-indexed for row
    column: point.column,
  };
}

function getNodeRange(node: Parser.SyntaxNode): NodeRange {
  return {
    start: toSourceLocation(node.startPosition),
    end: toSourceLocation(node.endPosition),
    startIndex: node.startIndex,
    endIndex: node.endIndex,
  };
}

function extractSignature(node: Parser.SyntaxNode, sourceText: string): string {
  // Try to find the block/body and extract the signature up to that point
  const bodyNode = node.children.find(
    (c) => c.type === 'statement_block' || c.type === 'class_body' || c.type === 'enum_body' || c.type === 'object_type'
  );
  if (bodyNode) {
    const signatureEnd = bodyNode.startIndex;
    return sourceText.substring(node.startIndex, signatureEnd).trim();
  }
  // Fallback: take the first line of the node
  const text = node.text;
  const firstLineBreak = text.indexOf('\n');
  if (firstLineBreak > -1) {
    return text.substring(0, firstLineBreak).trim();
  }
  return text.trim();
}

/**
 * Traverses the AST recursively to build a hierarchical outline of the file.
 */
function buildOutline(node: Parser.SyntaxNode, sourceText: string): OutlineItem[] {
  const items: OutlineItem[] = [];

  for (const child of node.children) {
    let item: OutlineItem | null = null;

    if (child.type === 'class_declaration' || child.type === 'abstract_class_declaration') {
      const nameNode = child.childForFieldName('name');
      if (nameNode) {
        const bodyNode = child.childForFieldName('body');
        const children = bodyNode ? buildOutline(bodyNode, sourceText) : [];
        item = {
          name: nameNode.text,
          kind: 'class',
          range: getNodeRange(child),
          signature: extractSignature(child, sourceText),
          children: children.length > 0 ? children : undefined,
        };
      }
    } else if (child.type === 'interface_declaration') {
      const nameNode = child.childForFieldName('name');
      if (nameNode) {
        const bodyNode = child.childForFieldName('body');
        const children = bodyNode ? buildOutline(bodyNode, sourceText) : [];
        item = {
          name: nameNode.text,
          kind: 'interface',
          range: getNodeRange(child),
          signature: extractSignature(child, sourceText),
          children: children.length > 0 ? children : undefined,
        };
      }
    } else if (child.type === 'function_declaration' || child.type === 'generator_function_declaration') {
      const nameNode = child.childForFieldName('name');
      if (nameNode) {
        item = {
          name: nameNode.text,
          kind: 'function',
          range: getNodeRange(child),
          signature: extractSignature(child, sourceText),
        };
      }
    } else if (child.type === 'method_definition' || child.type === 'abstract_method_signature' || child.type === 'method_signature') {
      const nameNode = child.childForFieldName('name');
      if (nameNode) {
        item = {
          name: nameNode.text,
          kind: 'method',
          range: getNodeRange(child),
          signature: extractSignature(child, sourceText),
        };
      }
    } else if (child.type === 'type_alias_declaration') {
      const nameNode = child.childForFieldName('name');
      if (nameNode) {
        item = {
          name: nameNode.text,
          kind: 'typeAlias',
          range: getNodeRange(child),
          signature: extractSignature(child, sourceText),
        };
      }
    } else if (child.type === 'enum_declaration') {
      const nameNode = child.childForFieldName('name');
      if (nameNode) {
        item = {
          name: nameNode.text,
          kind: 'enum',
          range: getNodeRange(child),
          signature: extractSignature(child, sourceText),
        };
      }
    } else if (child.type === 'lexical_declaration' || child.type === 'variable_declaration') {
      // Look for arrow functions assigned to variables
      const declarators = child.children.filter((c) => c.type === 'variable_declarator');
      for (const decl of declarators) {
        const nameNode = decl.childForFieldName('name');
        const valueNode = decl.childForFieldName('value');
        if (nameNode && valueNode && valueNode.type === 'arrow_function') {
          items.push({
            name: nameNode.text,
            kind: 'function',
            range: getNodeRange(child),
            signature: extractSignature(child, sourceText),
          });
        }
      }
    } else if (child.type === 'export_statement' || child.type === 'declaration') {
      const exportedItems = buildOutline(child, sourceText);
      items.push(...exportedItems);
    }

    if (item) {
      items.push(item);
    }
  }

  return items;
}

/**
 * Extracts a structural outline from a given source code string.
 */
export function getOutlineFromSource(sourceCode: string, extension: string = '.ts'): OutlineItem[] {
  const tree = parseSource(sourceCode, extension);
  return buildOutline(tree.rootNode, sourceCode);
}

/**
 * Extracts a structural outline from a file on disk.
 */
export async function getFileOutline(filePath: string): Promise<OutlineItem[]> {
  const tree = await parseFile(filePath);
  const fs = await import('node:fs/promises');
  const sourceCode = await fs.readFile(filePath, 'utf-8');
  return buildOutline(tree.rootNode, sourceCode);
}
