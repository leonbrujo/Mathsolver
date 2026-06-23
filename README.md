# MathSolver — Quiz Quests

App de resolución de problemas matemáticos paso a paso con IA (Claude).

## Stack
- **Next.js 14** (App Router)
- **Tailwind CSS**
- **KaTeX** (renderizado de fórmulas)
- **Claude Haiku 4.5** via Anthropic API

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar API key
cp .env.example .env.local
# Edita .env.local y agrega tu ANTHROPIC_API_KEY

# 3. Correr en desarrollo
npm run dev
# Abre http://localhost:3000
```

## Deploy en Vercel (recomendado)

1. Sube el proyecto a GitHub
2. Ve a https://vercel.com → Import → selecciona el repo
3. En **Environment Variables**, agrega:
   - `ANTHROPIC_API_KEY` = tu API key de Anthropic
4. Deploy → Vercel te da una URL automáticamente
5. En **Settings → Domains**, agrega `quiz-quests.com`
6. Apunta el DNS de tu dominio a Vercel (te da los nameservers)

## Obtener API Key

1. Ve a https://console.anthropic.com
2. Settings → API Keys → Create Key
3. Copia y pega en .env.local

## Funcionalidades
- ✅ Entrada por texto
- ✅ Entrada por foto (cámara o galería)
- ✅ Solución paso a paso en español
- ✅ Fórmulas con LaTeX/KaTeX
- ✅ Mobile-first
- ✅ API key segura (nunca expuesta al navegador)
