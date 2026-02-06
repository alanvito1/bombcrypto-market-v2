## 2026-02-06 - Unauthenticated Microservice Control Plane
**Vulnerability:** The `blockchain-center-api` microservice exposed an unauthenticated administrative endpoint (`/rpc/toggle`) that allows pausing critical infrastructure (RPC nodes).
**Learning:** Microservices in a monorepo can sometimes be treated as "internal-only" and lack default security controls, but in a real deployment (even internal), lack of auth allows for lateral movement and accidental DoS.
**Prevention:** Enforce "Secure by Default" for all services. Administrative endpoints must always require authentication, even for internal tools. Added `x-api-key` check.

## 2026-02-07 - Timing Attack in Admin Authentication
**Vulnerability:** The admin authentication middleware used insecure string comparison (`!==`) for API keys, making it susceptible to timing attacks.
**Learning:** Simple equality checks in authentication logic are insufficient for secrets. Developers might default to `===` or `!==` without realizing the side-channel implications.
**Prevention:** Use `crypto.timingSafeEqual` for all secret comparisons. Ensure buffers are used and length checks are performed explicitly to avoid runtime errors.

## 2026-02-08 - SQL Injection in Dynamic ORDER BY
**Vulnerability:** The `HeroTransactionRepository` and `HouseTransactionRepository` directly interpolated the `orderBy` query parameter into the SQL string via a custom `QueryBuilder`, allowing SQL injection.
**Learning:** Even with parameterized queries for values (WHERE clauses), dynamic column names in `ORDER BY` are often overlooked and cannot be parameterized. Custom QueryBuilders often lack automatic sanitization for identifiers.
**Prevention:** Always whitelist dynamic column names against a strict set of allowed identifiers before using them in SQL construction. Implement "Safe by Default" sorting fallbacks.
