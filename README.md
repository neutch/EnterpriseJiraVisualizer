# Enterprise Jira Visualizer 🚀

A powerful data visualization tool that transforms Jira issues into interactive Sankey diagrams, providing clear insights into your project hierarchy and workflow.

## ✨ Features

- **Interactive Sankey Diagrams**: Visualize project relationships using D3.js
- **Real-time Jira Integration**: Connect directly to your Jira instance
- **Hierarchical Data Flow**: Project → Feature → Epic → Story visualization
- **Comprehensive Statistics**: Detailed breakdown of issues, status, and metrics
- **Responsive Design**: Works on desktop and mobile devices
- **Docker Support**: Easy deployment with Docker and docker-compose

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Jira instance with API access
- API token for Jira authentication

### Development Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd EnterpriseJiraVisualizer

# 2. Install root dependencies
npm install

# 3. Install client dependencies
cd client && npm install && cd ..

# 4. Install server dependencies  
cd server && npm install && cd ..

# 5. Configure environment
cp .env.example .env
# Edit .env with your Jira credentials:
# - JIRA_BASE_URL (your Jira instance URL)
# - JIRA_EMAIL (your email)
# - JIRA_API_TOKEN (generate from Jira settings)

# 6. Start development servers
npm run server:dev  # Backend @ http://localhost:4000
npm run dev         # Frontend @ http://localhost:3000
```

**Important**: Never commit `node_modules/`, `.env`, or build artifacts. The project uses `.gitignore` to exclude these automatically.

### Docker Setup

```bash
# Copy environment file
cp .env.example .env
# Edit .env with your Jira credentials

# Start with Docker Compose
docker-compose up

# Access the application at http://localhost:3000
```

## ⚙️ Configuration

Create a `.env` file with your Jira settings:

```env
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_EMAIL=you@company.com
JIRA_API_TOKEN=your_api_token_here
JQL_FILTER=project in (ABC,XYZ) AND issuetype in (Feature,Epic,Story)
```

### Getting a Jira API Token

1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Copy the token to your `.env` file

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  React Client   │────│  Express Server  │────│   Jira API      │
│  (Port 3000)    │    │  (Port 4000)     │    │                 │
│                 │    │                  │    │                 │
│ • D3 Sankey     │    │ • REST API       │    │ • Issue Data    │
│ • Stats Panel   │    │ • Data Transform │    │ • Authentication│
│ • Responsive UI │    │ • Error Handling │    │ • JQL Queries   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📊 Data Flow

1. **Fetch**: Server retrieves issues from Jira using REST API
2. **Transform**: Issues are converted to hierarchical graph structure
3. **Visualize**: D3 renders interactive Sankey diagram
4. **Interact**: Users can explore relationships and view details

## 🧪 Testing

```bash
# Run all tests
npm test

# Run client tests
npm run test:client

# Run server tests  
npm run test:server

# Test with coverage
npm test -- --coverage
```

## 🔧 Development Commands

```bash
# Linting and formatting
npm run lint           # Check for lint errors
npm run lint:fix       # Fix lint errors
npm run format         # Format code with Prettier

# Building
npm run build         # Build both client and server
npm run build:client  # Build client only
npm run build:server  # Build server only

# Debugging
npm run debug:jira      # Test Jira connection
npm run debug:graph     # Validate graph generation
```

## 🐳 Docker Commands

```bash
# Production build
npm run docker:build
npm run docker:run

# Development with hot reload
docker-compose -f docker-compose.dev.yml up

# Production deployment
docker-compose up -d
```

## 🔍 Troubleshooting

### Common Issues

**401 Unauthorized**
- Check your JIRA_API_TOKEN and JIRA_EMAIL
- Ensure your API token hasn't expired

**Empty Visualization**
- Verify your JQL_FILTER returns data
- Test with: `project is not EMPTY`

**CORS Errors**
- Backend proxy is configured in vite.config.ts
- Ensure server is running on port 4000

### Debug Commands

```bash
# Test Jira API connection
npm run test:jira-connection

# View raw API response
curl -u "email:token" "JIRA_BASE_URL/rest/api/3/search?jql=YOUR_JQL"

# Check server logs
docker-compose logs app
```

## 📈 Performance

- **Large Datasets**: Implement pagination for >1000 issues
- **Frontend**: Use React.memo for expensive renders
- **Backend**: Consider Redis caching for frequent requests

## 🚢 Deployment

### Environment Variables

```env
NODE_ENV=production
PORT=4000
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_EMAIL=service-account@company.com
JIRA_API_TOKEN=production_token
JQL_FILTER=project in (PROJ1,PROJ2) AND created >= -30d
```

### Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Use service account credentials
- [ ] Configure proper JQL filter
- [ ] Set up monitoring and logging
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Enable HTTPS

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open pull request

### Commit Convention

```
feat(scope): description     # New feature
fix(scope): description      # Bug fix
docs(scope): description     # Documentation
style(scope): description    # Formatting
refactor(scope): description # Code restructuring
test(scope): description     # Tests
chore(scope): description    # Maintenance
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@yourcompany.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourcompany/enterprise-jira-visualizer/issues)
- 📖 Docs: [Full Documentation](https://docs.yourcompany.com/jira-visualizer)

---

Built with ❤️ using React, D3.js, Express, and TypeScript