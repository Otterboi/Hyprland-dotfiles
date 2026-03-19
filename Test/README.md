# ScribePilot
---
## Project summary / About
ScribePilot is a secure, enterprise-grade AI coding assistant that understands your codebase. Designed for organizations with proprietary APIs, frameworks, and coding standards, it delivers context-aware, trustworthy suggestions by ingesting internal documentation, code files and libraries, while ensuring sensitive code never leaves your infrastructure. By providing intelligent, domain-specific guidance, ScribePilot helps developers work faster, maintain higher code quality, and gain confidence in AI-assisted coding tailored to their unique environment.
---

## Continuous Integration (CI) Information

We maintain four modular GitHub Actions pipelines to ensure clarity and separation of concerns in our development process:

### 🔹 1. ScribePilot Pipeline (main one)
This is our **main CI pipeline** (`.github/workflows/main_pipeline.yaml`) that coordinates multiple checks and deployments:
- **Backend Checks** → Runs via a reusable workflow (`cicd_backend_checks.yaml`) to install dependencies, validate MongoDB connectivity, and prepare for tests (pytests - upcoming).
- **Frontend Checks** → Placeholder for future Node.js / TypeScript testing (mainly Jest).
- **AI Model Checks** → Placeholder for validating AI model setup and test execution once ML code is added.
- **SonarCloud & Code Coverage** (Integrated) →
  - Static analysis
  - Code quality gates
  - Coverage reporting across:
    - Python (pytest)
    - TypeScript (Mocha)
    - JavaScript (Jest)
  - Separately handles multi-language coverage to ensure accurate results for each module.
- **Docker Deployment** → Prepares Docker images and deployment steps for backend, frontend, and AI services.

> **Note:** Many steps are currently placeholders until more code is pushed. This pipeline is modular, allowing each component to evolve independently.

### 🔹 2. Backend Checks Pipeline
Defined in `.github/workflows/cicd_backend_checks.yaml`, this workflow is triggered by the main pipeline (`.github/workflows/main_pipeline.yaml`).  
It:
- Spins up a **MongoDB 6.0 service container**.  
- Sets up **Python 3.11** with a virtual environment.  
- Installs backend dependencies (`requirements.txt`).  
- Runs a **connection test** to validate database connectivity.  
- Is designed to later include **unit tests and integration tests**.

### 🔹 2. VS Extension Verification Checks Pipeline
Defined in `.github/workflows/vscode_extension_ci.yaml`, this workflow is triggered by the main pipeline (`.github/workflows/main_pipeline.yaml`).  
- Newly added pipeline for validating the VS Code extension → Builds and lints TypeScript code.
- Runs unit tests and ensures the extension activates correctly in VS Code.


The main motivation for having multiple pipelines is **clarity and separation of concerns**:  
Each domain (backend, frontend, deployment) will have its own pipeline, **reducing complexity and making debugging easier**.
