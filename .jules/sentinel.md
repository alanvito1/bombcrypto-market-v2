## 2026-02-06 - Unauthenticated Microservice Control Plane
**Vulnerability:** The `blockchain-center-api` microservice exposed an unauthenticated administrative endpoint (`/rpc/toggle`) that allows pausing critical infrastructure (RPC nodes).
**Learning:** Microservices in a monorepo can sometimes be treated as "internal-only" and lack default security controls, but in a real deployment (even internal), lack of auth allows for lateral movement and accidental DoS.
**Prevention:** Enforce "Secure by Default" for all services. Administrative endpoints must always require authentication, even for internal tools. Added `x-api-key` check.
