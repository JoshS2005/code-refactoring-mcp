import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

export function createAstRefactorServer(): McpServer {
  const server = new McpServer({
    name: 'ast-refactor-mcp',
    version: '0.1.0',
  });

  // Tool 1: get_file_outline (Prototype 1: Bare-bones stub)
  server.tool(
    'get_file_outline',
    'Extracts function signatures, classes, interfaces, and boundary ranges from a source file.',
    {
      filePath: z.string().describe('The absolute or relative path to the source file to outline.'),
    },
    async ({ filePath }: { filePath: string }) => {
      const result = {
        filePath,
        status: 'stub',
        message: 'Prototype 1 stub: get_file_outline will be fully implemented in Prototype 3.',
        outline: [],
      };
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Tool 2: find_symbol_references (Prototype 1: Bare-bones stub)
  server.tool(
    'find_symbol_references',
    'Finds symbol references, optionally constrained to a specific function or class scope.',
    {
      filePath: z.string().describe('The path to the source file.'),
      symbol: z.string().describe('The identifier name to find references for.'),
      scopeFunction: z
        .string()
        .optional()
        .describe('Optional enclosing function or method name to bound the search scope.'),
    },
    async ({ filePath, symbol, scopeFunction }: { filePath: string; symbol: string; scopeFunction?: string }) => {
      const result = {
        filePath,
        symbol,
        scopeFunction: scopeFunction ?? null,
        status: 'stub',
        message: 'Prototype 1 stub: find_symbol_references will be fully implemented in Prototype 4.',
        references: [],
      };
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Tool 3: safe_rename_identifier (Prototype 1: Bare-bones stub)
  server.tool(
    'safe_rename_identifier',
    'Renames an identifier within a specific scope and verifies AST validity before saving.',
    {
      filePath: z.string().describe('The path to the source file to modify.'),
      oldName: z.string().describe('The identifier name to replace.'),
      newName: z.string().describe('The replacement identifier name.'),
      scopeFunction: z.string().describe('The enclosing function or method name bounding the refactoring.'),
    },
    async ({ filePath, oldName, newName, scopeFunction }: { filePath: string; oldName: string; newName: string; scopeFunction: string }) => {
      const result = {
        filePath,
        oldName,
        newName,
        scopeFunction,
        status: 'stub',
        message: 'Prototype 1 stub: safe_rename_identifier will be fully implemented in Prototype 5.',
        occurrencesRenamed: 0,
        applied: false,
      };
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  return server;
}

export async function main() {
  const server = createAstRefactorServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AST Refactor MCP Server running on stdio (Prototype 1)');
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  main().catch((err) => {
    console.error('Fatal error in MCP server:', err);
    process.exit(1);
  });
}
