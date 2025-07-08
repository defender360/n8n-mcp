# n8n MCP Server

Este repositório contém duas opções de implementação:

## 🚀 Opção 1: MCP Server Simplificado (RECOMENDADO)

Um servidor MCP leve que se conecta ao seu n8n existente via API.

**Vantagens:**
- Deploy rápido e simples
- Menos recursos necessários
- Conecta-se a qualquer instância n8n existente

**Como usar:** Veja [MCP_SERVER_README.md](MCP_SERVER_README.md)

## 🔧 Opção 2: n8n Completo + MCP

Deploy completo do n8n com MCP server integrado.

**Vantagens:**
- Tudo em um só lugar
- Não precisa de n8n separado

**Como usar:** Veja [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md)

## Qual escolher?

- **Já tem n8n rodando?** → Use o MCP Server Simplificado
- **Precisa de tudo novo?** → Use o n8n Completo

## Quick Start (MCP Server)

1. **No seu n8n existente:**
   - Ative a API
   - Gere uma API key
   - Marque workflows com tag "mcp"

2. **No Railway:**
   - Deploy este repositório
   - Configure as variáveis:
     ```
     N8N_API_URL=https://seu-n8n.com
     N8N_API_KEY=sua-api-key
     ```

3. **No Claude Desktop:**
   ```json
   {
     "mcpServers": {
       "n8n": {
         "command": "npx",
         "args": [
           "-y",
           "@modelcontextprotocol/server-sse-client",
           "https://seu-server.railway.app"
         ]
       }
     }
   }
   ```

## Recursos

- [Documentação MCP](https://modelcontextprotocol.io)
- [n8n API Docs](https://docs.n8n.io/api/)
- [Railway Docs](https://docs.railway.app)

## Suporte

Abra uma issue neste repositório para reportar problemas ou sugestões.
