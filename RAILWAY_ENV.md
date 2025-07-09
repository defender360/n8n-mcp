# 🚂 Railway Environment Variables

## Required Variables for Railway Deployment

Set these in Railway Dashboard > Settings > Environment Variables:

### Essential Variables
```bash
AUTH_TOKEN=your-secure-token-here
MCP_MODE=http
NODE_ENV=production
LOG_LEVEL=info
TRUST_PROXY=1
USE_FIXED_HTTP=true
```

### Optional Variables (for n8n Integration)
```bash
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your-n8n-api-key
```

### How to Generate AUTH_TOKEN
```bash
# Local generation
openssl rand -base64 32
```

## Railway Configuration Status

### Current Configuration:
- **Domain**: n8n-mcp-production-51de.up.railway.app
- **Branch**: railway-deploy
- **Dockerfile**: Dockerfile.railway
- **Health Check**: /health endpoint
- **Port**: 3000

### Testing the Deployment:
```bash
# Health check
curl https://n8n-mcp-production-51de.up.railway.app/health

# MCP endpoint
curl -H "Authorization: Bearer your-token" \
  https://n8n-mcp-production-51de.up.railway.app/mcp
```

## Common Issues and Solutions

### 1. Health Check Fails
- Verify /health endpoint is accessible
- Check Railway logs for startup errors
- Ensure AUTH_TOKEN is set

### 2. MCP Endpoint Not Working
- Verify USE_FIXED_HTTP=true is set
- Check Authorization header format
- Verify MCP_MODE=http is configured

### 3. Railway Build Fails
- Ensure railway-deploy branch is up to date
- Check Dockerfile.railway exists
- Verify no cache mount issues

## Environment Variables in Railway UI

Add these in Railway Dashboard:
1. Go to Settings > Environment Variables
2. Add each variable with its value
3. Click "Deploy" to apply changes

## Testing Checklist

- [ ] Health check returns 200 OK
- [ ] MCP endpoint accepts requests
- [ ] Authorization working correctly
- [ ] All environment variables configured
- [ ] Logs show successful startup