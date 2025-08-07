# CLAUDE.md

## 🚀 Quick Start
```bash
git clone https://…/EnterpriseJiraVisualizer.git
cd EnterpriseJiraVisualizer
npm install
npm run dev             # frontend @ http://localhost:3000
npm run server:dev      # backend @ http://localhost:4000
# or Docker:
docker-compose up       # brings up frontend (3000) & backend (4000)
# then for Claude:
claude /init            # loads this CLAUDE.md automatically
```

## ⚙️ Env Vars
Copy .env.example → .env and set:
```
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_EMAIL=you@company.com
JIRA_API_TOKEN=xxxxxxxxxxxxxxxxxxxx
JQL_FILTER=project in (ABC,XYZ) AND issuetype in (Feature,Epic,Story)
```

## 🏗️ Architecture Overview
- **Pattern**: Client-Server with REST API
- **Data Transform**: Jira Issues → Hierarchical Graph (Project → Feature → Epic → Story)
- **Visualization**: D3 Sankey diagrams for flow visualization
- **Auth**: Jira API tokens (stored securely in .env)

## 📂 Repo Layout
```
/
├── client/             # React/TS + D3 Sankey frontend
│   └── src/
│   └── index.html
│   └── sankey.ts
├── server/             # Node/Express + TS backend
│   └── src/
│   └── jira.ts         # fetch & graph builder
├── docker/             # Dockerfile & docker-compose.yml
├── src/                # shared utils & types
│   └── types/
│       └── jira.ts     # TypeScript interfaces
├── tests/              # unit & integration tests
├── .env.example
└── CLAUDE.md           # ← this file
```

## 💾 Data Flow
1. **Backend** /api/issues reads auth, calls Jira REST API
2. **Transform** into { nodes:[], links:[] } (Project → Feature → Epic → Story)
3. **Frontend** feeds graph to d3-sankey for rendering

## 📦 Key Dependencies
- **Frontend**: React 18, D3 v7, TypeScript 5+
- **Backend**: Express 4, Axios, Node 18+
- **Dev Tools**: Vite, Jest 29, ESLint 8, Prettier 3

## 🎨 Tech & Style
- **Language**: TypeScript (safer, autocomplete, maintainable)
- **IDE**: VS Code (free, lightweight, top TS support)
- **Modules**: ES Modules (import/export)
- **Lint & Format**: ESLint + Prettier (npm run lint -- --fix)
- **Testing**: Jest + React Testing Library + Supertest

## 🔧 Common Development Tasks

### Adding New Jira Fields
1. Update `src/types/jira.ts` interface
2. Modify `server/src/jira.ts` transform logic
3. Update frontend rendering in `client/src/sankey.ts`

### Debugging Data Flow
```bash
# Test Jira connection
npm run test:jira-connection
# View raw API response
curl -u email:token "JIRA_BASE_URL/rest/api/3/search?jql=YOUR_JQL"
```

### Performance Monitoring
- Large datasets (>1000 issues): implement pagination
- Frontend: use React.memo for expensive renders
- Backend: cache Jira responses (Redis recommended)

## 🛠 Development Workflow
1. Branch: feature/<desc> or bugfix/<JIRA-KEY>
2. Code & Test (TDD if you can)
3. npm run test:client & npm run test:server
4. npm run lint & npm run build
5. Commit: feat(server): add JQL filter
6. PR: reference JIRA issue (e.g. ABC-123: fetch projects)

## 🐳 Docker
- **Dockerfile** builds TS + static client
- **docker-compose.yml**:
  - app → 3000
  - api → 4000
- Volumes for hot reload

## 🚀 Deployment
```bash
# Production build
npm run build:all
# Docker production
docker build -t jira-visualizer .
docker run -p 3000:3000 --env-file .env jira-visualizer
```

## 🚨 Troubleshooting

### Common Issues
- **401 Unauthorized**: Check JIRA_API_TOKEN and JIRA_EMAIL
- **Empty visualization**: Verify JQL_FILTER returns data
- **CORS errors**: Backend proxy configured in package.json
- **Memory issues**: Large datasets need streaming/pagination

### Debug Commands
```bash
npm run debug:jira      # test Jira API connection
npm run debug:graph     # validate graph structure
npm run debug:frontend  # React dev tools + network tab
```

## 📋 Repo Etiquette
- Branches: feature/, bugfix/, chore/
- Commits: imperative, reference JIRA keys
- PRs: tests must pass, lint/typecheck OK, update docs if needed