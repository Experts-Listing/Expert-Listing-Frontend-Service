# Expert Listing – Frontend Service

React (Vite) single-page app that lists experts from the backend API.

> **Deployment infrastructure and CD are managed by [Experts-Listing/Infra-Service](https://github.com/Experts-Listing/Infra-Service).**
> This repository only builds, tests, scans and publishes an immutable container image. It contains no Terraform, Helm or Kubernetes configuration.

## How it talks to the API

The app calls the relative path `/api/experts`. In Kubernetes, the shared Ingress (defined in Infra-Service) routes `/api/experts` to the backend and `/` to this service, so the same image works in every environment without a rebuild. In local development, Vite proxies `/api` to `API_PROXY_TARGET` (default `http://localhost:3000`).

## Local development

Requires Node 22 (`.nvmrc`).

```bash
npm ci
npm run dev      # http://localhost:5173, run the backend on :3000 for data
npm test         # Vitest + Testing Library
npm run lint     # ESLint
npm run build    # production bundle in dist/
```

## Docker

```bash
docker build -t frontend:local .
docker run --rm -p 8080:8080 frontend:local
curl localhost:8080/healthz
```

Multi-stage build: `node:22-alpine` builds the bundle, and `nginx-unprivileged` serves it on port 8080 as a non-root user, with SPA fallback, long-lived caching for hashed assets and a `/healthz` endpoint. Run standalone, the page shows an error state because `/api` is only routed by the Ingress.

## Branch strategy

```
feature/* ──PR──▶ dev ──PR──▶ stage ──PR──▶ prod
```

- Every PR into `dev`, `stage` or `prod` runs validation CI. Nothing is published from a PR.
- A push (merge) to `dev`, `stage` or `prod` publishes an image and requests a deploy to the environment with the same name.

## CI/CD flow

```mermaid
flowchart TD
    dev[Developer] --> fb[Feature branch] --> pr[Pull request]
    pr --> ci{{CI}}
    ci --> t[Tests] & l[ESLint] & s[Gitleaks] & tv[Trivy fs]
    t & l & s & tv --> merge[Merge to dev / stage / prod]
    merge --> build[Docker build] --> scan[Trivy image scan]
    scan --> ghcr[(GHCR)] & ecr[(AWS ECR)]
    ghcr & ecr --> trig[repository_dispatch: deploy]
    trig --> infra[Infra-Service CD]
    infra --> helm[Helm] --> k8s[EKS]
    k8s --> DEV & STAGE & PROD
```

`.github/workflows/ci.yml` jobs:

| Job | Runs on | What it does |
|---|---|---|
| `test` | PR + push | `npm ci`, `npm test` |
| `lint` | PR + push | `npm ci`, `npm run lint` |
| `secret-scan` | PR + push | Gitleaks over the full git history, fails on any finding |
| `trivy-fs` | PR + push | Trivy vuln/secret/misconfig scan of the repo. HIGH+CRITICAL reported, fixable CRITICAL fails |
| `image` | PR + push | Builds the image and scans it with Trivy (fixable CRITICAL fails). **On push only:** pushes to GHCR and ECR |
| `trigger-deploy` | push | Sends a `deploy` event to Infra-Service |
| `notify` | PR + push | Slack message on any failed job, and on a successful publish + deploy trigger |

### Security gates

- **Gitleaks** blocks committed API keys, tokens, passwords, private keys and cloud credentials.
- **Trivy** fails the build on CRITICAL vulnerabilities that have a fix available, in both dependencies and the final image. HIGH findings and unfixable CRITICALs are printed in the job log so they stay visible, but they do not block.
- No credentials exist in the repo: GHCR uses the workflow `GITHUB_TOKEN`, AWS uses GitHub OIDC, and the deploy trigger uses the `INFRA_DISPATCH_TOKEN` secret.

### Images

The only deployment tag is the full Git commit SHA, and the same locally built image is pushed to both registries:

```
ghcr.io/experts-listing/frontend:<git-sha>
<account-id>.dkr.ecr.<region>.amazonaws.com/expert-listing/frontend:<git-sha>
```

ECR tags are immutable. If a SHA already exists (for example, a fast-forward promotion from `dev` to `stage`), the ECR push is skipped and the existing image is deployed.

### Deployment trigger

After publishing, CI calls `POST /repos/Experts-Listing/Infra-Service/dispatches` using the `INFRA_DISPATCH_TOKEN` secret:

```json
{
  "event_type": "deploy",
  "client_payload": {
    "service": "frontend",
    "environment": "dev",
    "registry": "<account-id>.dkr.ecr.<region>.amazonaws.com",
    "repository": "expert-listing/frontend",
    "tag": "<git-sha>",
    "commit": "<git-sha>",
    "source_repository": "Experts-Listing/Expert-Listing-Frontend-Service",
    "source_run_url": "https://github.com/..."
  }
}
```

Infra-Service validates the event, deploys the exact image with Helm, waits for the rollout and reports the result. Production approval is enforced by the `prod` environment in Infra-Service.

## Required GitHub configuration

| Kind | Name | Purpose |
|---|---|---|
| Variable | `AWS_REGION` | Region of the ECR registry |
| Variable | `AWS_ECR_PUSH_ROLE_ARN` | IAM role assumed via OIDC. It can only push to `expert-listing/frontend` (output of Infra-Service Terraform) |
| Secret | `INFRA_DISPATCH_TOKEN` | Fine-grained token limited to `Infra-Service` with **Contents: Read and write** (required by `repository_dispatch`) |
| Secret | `SLACK_WEBHOOK_URL` | Slack incoming webhook (org-level). Notifications are skipped if it is not set |

GHCR needs no extra secret, because it uses `GITHUB_TOKEN` with `packages: write`.

Recommended repository settings (not created by this repo):

- Default branch `dev`.
- Rulesets for `dev`, `stage`, `prod`: require a pull request, require the `test`, `lint`, `secret-scan`, `trivy-fs` and `image` checks, and block force-pushes and deletion.
- At least one approving review for PRs into `stage` and `prod`.
