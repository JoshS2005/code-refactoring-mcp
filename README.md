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
