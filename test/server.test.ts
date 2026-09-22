import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createAstRefactorServer } from '../src/server.js';

describe('AST Refactor MCP Server - Prototype 1 Bare Bones', () => {
  let client: Client;
  let serverTransport: InMemoryTransport;
  let clientTransport: InMemoryTransport;

  beforeEach(async () => {
    const server = createAstRefactorServer();
    client = new Client({ name: 'test-client', version: '1.0.0' }, { capabilities: {} });

    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);
  });

  afterEach(async () => {
    await client.close();
  });

  it('lists all three refactoring and inspection tools', async () => {
    const { tools } = await client.listTools();
    const toolNames = tools.map((t) => t.name);

    expect(toolNames).toContain('get_file_outline');
    expect(toolNames).toContain('find_symbol_references');
    expect(toolNames).toContain('safe_rename_identifier');
  });

  it('invokes get_file_outline successfully', async () => {
    const result = await client.callTool({
      name: 'get_file_outline',
      arguments: { filePath: 'src/server.ts' },
    });

    expect(result.isError).toBeFalsy();
    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(0);

    const firstContent = result.content[0];
    expect(firstContent.type).toBe('text');
    if (firstContent.type === 'text') {
      const parsed = JSON.parse(firstContent.text);
      expect(parsed.filePath).toBe('src/server.ts');
      expect(parsed.status).toBe('success');
      expect(parsed.outline.length).toBeGreaterThan(0);
      
      const functionNode = parsed.outline.find((o: any) => o.name === 'createAstRefactorServer');
      expect(functionNode).toBeDefined();
      expect(functionNode.kind).toBe('function');
    }
  });

  it('invokes find_symbol_references stub successfully', async () => {
    const result = await client.callTool({
      name: 'find_symbol_references',
      arguments: {
        filePath: 'src/index.ts',
        symbol: 'myVariable',
        scopeFunction: 'doCalculation',
      },
    });

    const firstContent = result.content[0];
    expect(firstContent.type).toBe('text');
    if (firstContent.type === 'text') {
      const parsed = JSON.parse(firstContent.text);
      expect(parsed.filePath).toBe('src/index.ts');
      expect(parsed.symbol).toBe('myVariable');
      expect(parsed.scopeFunction).toBe('doCalculation');
      expect(parsed.status).toBe('stub');
      expect(parsed.references).toEqual([]);
    }
  });

  it('invokes safe_rename_identifier stub successfully', async () => {
    const result = await client.callTool({
      name: 'safe_rename_identifier',
      arguments: {
        filePath: 'src/index.ts',
        oldName: 'cat',
        newName: 'feline',
        scopeFunction: 'feedAnimals',
      },
    });

    const firstContent = result.content[0];
    expect(firstContent.type).toBe('text');
    if (firstContent.type === 'text') {
      const parsed = JSON.parse(firstContent.text);
      expect(parsed.filePath).toBe('src/index.ts');
      expect(parsed.oldName).toBe('cat');
      expect(parsed.newName).toBe('feline');
      expect(parsed.scopeFunction).toBe('feedAnimals');
      expect(parsed.status).toBe('stub');
      expect(parsed.occurrencesRenamed).toBe(0);
      expect(parsed.applied).toBe(false);
    }
  });
});
