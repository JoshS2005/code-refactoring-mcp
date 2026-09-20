# AST Refactor MCP Server

A Model Context Protocol (MCP) server that provides deterministic, scope-safe Abstract Syntax Tree (AST) code inspection and refactoring tools for AI assistants and agentic workflows.

Unlike standard LLM coding workflows that rely on naive string replacement or regular expressions—often introducing syntax errors, modifying substrings, or leaking across variable scopes—this server uses [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) to parse source files into concrete syntax trees. Mutations are executed strictly against targeted AST node ranges using precise byte offsets, followed by an immediate AST re-parse validation step to guarantee structural integrity.

---

## Key Features

- **Structural Outlines (`get_file_outline`):** Extracts top-level declarations, method signatures, parameters, and type annotations without sending full function bodies into the LLM context window.
- **Scope-Bounded Symbol Search (`find_symbol_references`):** Locates identifier occurrences constrained strictly within designated AST scope boundaries (e.g., inside a single function or class).
- **Deterministic Renaming (`safe_rename_identifier`):** Replaces identifiers using reverse byte-offset ordering, preventing offset drift and eliminating accidental substring mutations (e.g., renaming `cat` will never touch `catalog`).
- **Post-Mutation AST Validation:** Automatically parses modified files before writing to disk, aborting the operation if syntax errors (`ERROR` nodes) are detected.

---

## System Architecture

```
                  +------------------------------------------+
                  |   AI Host (Claude Desktop, Cursor, CLI)  |
                  +--------------------+---------------------+
                                       |
                            JSON-RPC 2.0 (stdio)
                                       |
                  +--------------------v---------------------+
                  |           AST Refactor MCP Server        |
                  |                                          |
                  |   [Tools: Outline | Find | SafeRename]   |
                  +--------------------+---------------------+
                                       |
                S-Expression Queries / AST Traversals
                                       |
                  +--------------------v---------------------+
                  |         Tree-sitter Parser Engine        |
                  |                                          |
                  |   - TypeScript / JavaScript Grammars     |
                  |   - Node Range & Scope Resolution        |
                  |   - Reverse Byte-Offset Patching         |
                  |   - Syntax Tree Error Validation         |
                  +--------------------+---------------------+
                                       |
                              Target Source Files
```

---

## Tech Stack

- **Runtime:** Node.js (v20+)
- **Language:** TypeScript
- **Protocol:** [Model Context Protocol (MCP) SDK](https://github.com/modelcontextprotocol)
- **Grammar Engine:** `tree-sitter`, `tree-sitter-typescript`
- **Schema Validation:** `zod`
- **Testing:** `vitest`

---

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/JoshS2005/code-refactoring-mcp.git
cd code-refactoring-mcp

# Install dependencies
npm install

# Build the TypeScript project
npm run build

# Run unit tests
npm test
```

---

## MCP Configuration

To use this server with an MCP client (such as Claude Desktop or Cursor), add the server definition to your configuration file:

```json
{
  "mcpServers": {
    "ast-refactor": {
      "command": "node",
      "args": ["/path/to/code-refactoring-mcp/dist/server.js"]
    }
  }
}
```

---

## Available Tools

| Tool | Parameters | Description |
| --- | --- | --- |
| `get_file_outline` | `filePath: string` | Extracts function signatures, classes, interfaces, and boundary ranges from a source file. |
| `find_symbol_references` | `filePath: string`<br>`symbol: string`<br>`scopeFunction?: string` | Finds symbol references, optionally constrained to a specific function's scope. |
| `safe_rename_identifier` | `filePath: string`<br>`oldName: string`<br>`newName: string`<br>`scopeFunction: string` | Renames an identifier within a specific scope and verifies AST validity before saving. |

---

## Roadmap

* [x] Prototype 1: Bare-bones project scaffolding and MCP server skeleton with stubbed tools
* [ ] Prototype 2: Tree-sitter parser initialization and AST syntax error validator
* [ ] Prototype 3: `get_file_outline` structural outline tool implementation
* [ ] Prototype 4: `find_symbol_references` with lexical scope resolution
* [ ] Prototype 5: `safe_rename_identifier` with reverse byte-offset replacement & error rollback
* [ ] Multi-language support (Python and Go grammars)

---

## License

MIT
