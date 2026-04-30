# AzetoAI Dashboard

Dashboard web complet pour le plugin Roblox Studio AzetoAI.

## Stack

- **Frontend** : Next.js 14, TypeScript, TailwindCSS, Lucide React
- **Backend** : Next.js API Routes
- **Auth & DB** : Supabase
- **IA** : Anthropic Claude (claude-sonnet-4-20250514)

---

## Installation rapide

### 1. Cloner et installer

```bash
git clone <votre-repo>
cd azetoai
npm install
```

### 2. Configurer les variables d'environnement

Copiez `.env.local.example` → `.env.local` et remplissez :

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-api03-...
ADMIN_PASSWORD=Azetoadmin2746656
```

### 3. Configurer Supabase

Dans l'éditeur SQL de Supabase, exécutez le fichier `supabase-schema.sql`.

### 4. Lancer en développement

```bash
npm run dev
```

Accédez à [http://localhost:3000](http://localhost:3000)

---

## Déploiement sur Vercel

```bash
npm i -g vercel
vercel --prod
```

Ajoutez toutes les variables d'environnement dans le dashboard Vercel.

---

## Structure du projet

```
azetoai/
├── app/
│   ├── login/page.tsx              # Page de connexion/inscription
│   ├── dashboard/
│   │   ├── layout.tsx              # Sidebar + contexte user/apiKey
│   │   ├── chat/page.tsx           # Chat IA
│   │   ├── api-key/page.tsx        # Gestion clé API
│   │   ├── docs/page.tsx           # Documentation
│   │   └── admin/page.tsx          # Panel admin (protégé)
│   ├── api/
│   │   ├── plugin/chat/route.ts    # Endpoint chat plugin
│   │   ├── plugin/verify/route.ts  # Validation clé API
│   │   ├── admin/settings/route.ts # Paramètres admin
│   │   └── settings/plugin-url/route.ts
│   └── globals.css
├── lib/
│   ├── supabase.ts                 # Client Supabase
│   └── utils.ts                   # Utilitaires
├── types/index.ts                  # Types TypeScript
├── roblox-plugin/AzetoAI.lua       # Plugin Roblox Studio
├── supabase-schema.sql             # Schéma DB
└── .env.local.example
```

---

## Plugin Roblox Studio

1. Ouvrir Roblox Studio
2. Dans l'Explorer, créer un `Plugin` et un `LocalScript` dedans
3. Coller le contenu de `roblox-plugin/AzetoAI.lua`
4. Modifier `CONFIG.API_URL` avec votre URL de déploiement
5. Sauvegarder → le plugin apparaît dans la barre

---

## Endpoints API

### POST `/api/plugin/chat`

```json
Headers: { "Authorization": "Bearer <API_KEY>" }
Body: { "message": "...", "context": "..." }
Response: { "reply": "..." }
```

### POST `/api/plugin/verify`

```json
Headers: { "Authorization": "Bearer <API_KEY>" }
Response: { "valid": true, "user_id": "...", "email": "..." }
```

---

## Admin Panel

Accès : Dashboard → Admin Panel → Mot de passe : `Azetoadmin2746656`

- Ajouter/modifier jusqu'à 20 scripts Lua custom
- Modifier le lien de téléchargement du plugin
