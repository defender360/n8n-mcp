# 🚂 Deploy do n8n-MCP no Railway

## 🎯 Solução dos Problemas de Cache Mount

### Problema Identificado
O Railway tem requisitos específicos para cache mounts Docker que causavam falhas no deployment:
- "Cache mounts MUST be in the format --mount=type=cache,id=<cache-id>"
- "Cache mount ID is not prefixed with cache key"

### Solução Implementada
Removemos completamente os cache mounts do Dockerfile para garantir 100% de compatibilidade com Railway. Isso faz o build um pouco mais lento, mas garante que o deployment sempre funcione.

**Antes:**
```dockerfile
RUN --mount=type=cache,id=${BUILDKIT_CACHE_KEY}-npm-builder,target=/root/.npm \
    npm install --no-save typescript@^5.8.3 ...
```

**Depois:**
```dockerfile
RUN npm install --no-save typescript@^5.8.3 ...
```

## 🚀 Deploy Rápido no Railway

### 1. Preparação
```bash
# Clone o repositório
git clone https://github.com/defender360/n8n-mcp.git
cd n8n-mcp

# Mude para a branch railway-deploy
git checkout railway-deploy
```

### 2. Deploy no Railway

1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project" 
3. Selecione "Deploy from GitHub repo"
4. Escolha este repositório na branch `railway-deploy`
5. Railway detectará automaticamente o Dockerfile

### 3. Configurar Variáveis de Ambiente

No painel do Railway, adicione estas variáveis:

```env
# Essencial
MCP_MODE=http
AUTH_TOKEN=gere-um-token-seguro-aqui
USE_FIXED_HTTP=true
PORT=3000

# Produção
NODE_ENV=production
LOG_LEVEL=info
TRUST_PROXY=1
```

**Gerar token seguro:**
```bash
openssl rand -base64 32
```

### 4. Verificar Deploy

Após o deploy, teste:
```bash
curl https://seu-app.up.railway.app/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "mode": "http",
  "timestamp": "2025-01-08T13:30:00.000Z"
}
```

## 🖥️ Configurar Claude Desktop

Edite `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "n8n-remote": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/mcp-remote@latest",
        "connect",
        "https://seu-app.up.railway.app/mcp"
      ],
      "env": {
        "MCP_AUTH_TOKEN": "seu-token-aqui"
      }
    }
  }
}
```

Reinicie o Claude Desktop e teste:
```
Use a ferramenta tools_documentation para ver as ferramentas disponíveis
```

## 🔧 Arquivos Modificados

### 1. `railway.toml`
Configuração otimizada para Railway:
- Build via Dockerfile
- Health check em `/health`
- Restart policy configurado
- Porta 3000 exposta

### 2. `Dockerfile`
Otimizado para Railway:
- ✅ Removidos cache mounts para compatibilidade
- ✅ Multi-stage build para tamanho mínimo (~280MB)
- ✅ Usuário não-root para segurança
- ✅ Health check integrado

### 3. `package.runtime.json`
Dependencies mínimas para runtime:
- Apenas o necessário para executar o servidor MCP
- Sem dependências do n8n em runtime
- Otimizado para performance

## 🛡️ Segurança

- ✅ SSL automático pelo Railway
- ✅ Autenticação via token
- ✅ TRUST_PROXY=1 para logging correto de IPs
- ✅ Usuário não-root no container
- ✅ Variáveis de ambiente seguras

## 💰 Custos

O Railway oferece $5/mês de créditos grátis. Para o n8n-MCP:
- **CPU**: ~0.1 vCPU = $0.50/mês
- **RAM**: 512MB = $2.50/mês  
- **Total**: ~$3/mês (dentro do plano gratuito)

## 🆘 Solução de Problemas

### "Authentication failed"
- Verifique se o token está correto em ambos os lados
- Use MCP_AUTH_TOKEN no Claude (não AUTH_TOKEN)

### "Connection refused"  
- Verifique se o app está rodando no Railway
- Teste: `curl https://seu-app.up.railway.app/health`

### "Out of memory"
- Considere upgrade do Railway para mais RAM
- Verifique se LOG_LEVEL não está em "debug"

## ✅ Status do Deploy

Com as correções implementadas, o deployment no Railway deve funcionar perfeitamente. Os cache mounts foram removidos para garantir compatibilidade total com a infraestrutura do Railway.

---

**Deploy funcional garantido! 🚀**