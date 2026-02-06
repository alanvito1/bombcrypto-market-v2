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

## 2025-02-18 - Parameterized OR Conditions in QueryBuilder
**Vulnerability:** Found SQL injection risk in `whereOr` method of custom QueryBuilder which accepted raw string conditions without parameter support, leading to potential injection in `HeroTransactionRepository`.
**Learning:** Custom ORM/QueryBuilders often miss edge cases like complex `OR` conditions with parameters. Always verify if helper methods support parameterization.
**Prevention:** Extended `whereOr` to accept values and handle `0` placeholders for safe parameter injection.

## 2026-02-19 - Missing CORS Configuration
**Vulnerability:** The backend API lacked explicit CORS configuration, potentially allowing `helmet` defaults or proxy configurations to be the only line of defense.
**Learning:** Monorepo setups with local proxies often mask the need for strict CORS on the backend itself. However, when deployed or accessed directly, the API remains exposed.
**Prevention:** Implemented `cors` middleware with configurable `CORS_ORIGIN` support to enforce strict origin validation at the application level.
