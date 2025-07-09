# 🚀 Railway Quick Start - n8n-MCP

Deploy n8n-MCP em 5 minutos no Railway!

## 📋 Pré-requisitos
- Conta no [Railway](https://railway.app)
- Conta no [GitHub](https://github.com)

## 🏃 Deploy Rápido

### 1️⃣ Fork e Clone
```bash
# Fork: https://github.com/czlonkowski/n8n-mcp
# Depois clone seu fork:
git clone https://github.com/SEU-USUARIO/n8n-mcp.git
cd n8n-mcp
```

### 2️⃣ Deploy Automático

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2Fczlonkowski%2Fn8n-mcp&envs=MCP_MODE%2CAUTH_TOKEN%2CUSE_FIXED_HTTP%2CTRUST_PROXY&MCP_MODEDesc=Modo+de+opera%C3%A7%C3%A3o+%28sempre+http+para+Railway%29&AUTH_TOKENDesc=Token+de+autentica%C3%A7%C3%A3o+seguro+%2832%2B+caracteres%29&USE_FIXED_HTTPDesc=Usar+implementa%C3%A7%C3%A3o+est%C3%A1vel&TRUST_PROXYDesc=Confiar+no+proxy+reverso+do+Railway&MCP_MODEDefault=http&USE_FIXED_HTTPDefault=true&TRUST_PROXYDefault=1)

### 3️⃣ Configurar Variáveis

No painel do Railway, adicione:

```env
MCP_MODE=http
AUTH_TOKEN=gere-um-token-seguro-aqui
USE_FIXED_HTTP=true
PORT=3000
TRUST_PROXY=1
NODE_ENV=production
LOG_LEVEL=info
```

**Gerar token seguro:**
```bash
openssl rand -base64 32
```

### 4️⃣ Verificar Deploy

Após o deploy, teste:
```bash
curl https://seu-app.up.railway.app/health
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

## ✅ Pronto!

Reinicie o Claude Desktop e teste:
```
Use a ferramenta tools_documentation para ver as ferramentas disponíveis
```

## 🆘 Problemas?

1. **Erro de autenticação**: Verifique o token em ambos os lados
2. **Connection refused**: Verifique se o app está rodando no Railway
3. **Database not found**: Certifique-se que `data/nodes.db` existe

## 📚 Documentação Completa

- [Guia Detalhado em Português](./RAILWAY_DEPLOY_PT_BR.md)
- [GitHub do Projeto](https://github.com/czlonkowski/n8n-mcp)
- [Suporte Railway](https://docs.railway.app)

---

<div align="center">
  <strong>Deploy em minutos, automatize para sempre! 🚀</strong>
</div>