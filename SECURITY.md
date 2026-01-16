# Security Documentation

This document outlines the security measures implemented in the Pulse ISP Audit application.

## Overview

Pulse has been hardened against common web application attacks and follows security best practices for production deployments.

## Security Measures Implemented

### 1. Rate Limiting ⏱️

**Protection Against:** DDoS, API abuse, spam

- **POST /api/results**: 5 requests per minute per IP
- Uses Redis in production, memory fallback for development
- Returns HTTP 429 with `Retry-After` header when limit exceeded
- Tracks by IP address (uses `x-forwarded-for` and `x-real-ip` headers)

**Implementation:**
- File: `lib/security/rate-limit.ts`
- Uses Upstash Redis for distributed rate limiting
- Automatic expiration after time window

---

### 2. Input Validation & Sanitization 🔍

**Protection Against:** Injection attacks, data corruption, XSS

#### Numeric Field Validation
- All speeds: Must be positive, finite, < 100,000 Mbps
- Service score: 0-100 range enforced
- Packet loss: 0-100% range enforced
- Latency: < 10,000ms (sanity check)
- Delivery ratio: 0-10 range enforced

#### String Sanitization
- Removes control characters (`\x00-\x1F`, `\x7F`)
- Removes angle brackets (`<>`) to prevent XSS
- Trims whitespace
- Enforces length limits (100-200 chars depending on field)

#### Grade Validation
- Only accepts: A, B, C, D, F
- Rejects any other value

**Implementation:**
- File: `lib/security/validation.ts`
- Function: `validateSpeedTestResult()`
- Used in: `app/api/results/route.ts`

---

### 3. Request Size Limits 📏

**Protection Against:** Memory exhaustion, bandwidth abuse

- **POST /api/results**: 1MB max
- **POST /api/speed-test/upload**: 5MB max
- **GET /api/speed-test/download**: 2MB max (enforced)
- Validates both `Content-Length` header and actual payload size
- Returns HTTP 413 Payload Too Large when exceeded

**Implementation:**
- Upload endpoint: `app/api/speed-test/upload/route.ts`
- Download endpoint: `app/api/speed-test/download/route.ts`
- Results endpoint: `app/api/results/route.ts`

---

### 4. Redis Key Injection Prevention 🗝️

**Protection Against:** Database manipulation, key namespace pollution

- Sanitizes all user input used in Redis keys
- Replaces special characters: `:`, `*`, `?`, `[`, `]` → `_`
- Replaces whitespace with underscores
- Limits key component length to 50 characters

**Example:**
```javascript
// Input: "Evil:ISP:*:injection"
// Stored as: "Evil_ISP___injection"
```

**Implementation:**
- File: `lib/security/validation.ts`
- Function: `sanitizeRedisKey()`
- Used in: `lib/db/kv.ts` (leaderboard keys)

---

### 5. Security Headers 🛡️

**Protection Against:** Clickjacking, XSS, MIME sniffing

Headers set via middleware:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self';
  frame-ancestors 'none'
```

**Implementation:**
- File: `middleware.ts`
- Applies to all routes except static files

---

### 6. CORS Protection 🌐

**Protection Against:** Cross-site request forgery, unauthorized API access

- **Write endpoints** (POST /api/results): Same-origin only
- **Read endpoints** (GET /api/leaderboard): CORS allowed
- Validates `Origin` header against `Host` header
- Returns HTTP 403 Forbidden for cross-origin write attempts

**Implementation:**
- File: `middleware.ts`
- Checks origin for all `/api/*` routes

---

### 7. Parameter Validation ✅

**Protection Against:** Type confusion, malicious inputs

- Validates all query parameters
- Rejects `NaN`, `Infinity`, negative values
- Enforces min/max bounds
- Type checking before arithmetic operations

**Example:**
```javascript
// size=NaN → HTTP 400
// size=-100 → HTTP 400
// size=999999999 → Capped at 2MB
```

**Implementation:**
- Download endpoint: `app/api/speed-test/download/route.ts`
- Upload endpoint: `app/api/speed-test/upload/route.ts`

---

### 8. Error Handling 🚨

**Protection Against:** Information disclosure

- Generic error messages for users
- Detailed errors only in server logs (console.error)
- No stack traces exposed in production
- Returns appropriate HTTP status codes:
  - 400: Bad Request (validation failed)
  - 413: Payload Too Large
  - 429: Too Many Requests
  - 500: Internal Server Error (generic)

---

## Security Testing

### Run All Tests

```bash
./test-security.sh https://your-deployment.vercel.app
```

### Quick Manual Test

See [QUICK-SECURITY-TEST.md](./QUICK-SECURITY-TEST.md) for simple curl commands.

### Full Test Documentation

See [security-tests.md](./security-tests.md) for detailed attack scenarios.

---

## Attack Vectors Blocked

| Attack Type | Status | Protection Method |
|-------------|--------|-------------------|
| DDoS / API Spam | ✅ Blocked | Rate limiting (5 req/min) |
| Fake Data Injection | ✅ Blocked | Input validation |
| XSS (Cross-Site Scripting) | ✅ Blocked | String sanitization + CSP |
| Redis Key Injection | ✅ Blocked | Key sanitization |
| CSRF (Cross-Site Request) | ✅ Blocked | CORS policy |
| Buffer Overflow | ✅ Blocked | Size limits |
| Type Confusion | ✅ Blocked | Type validation |
| Parameter Tampering | ✅ Blocked | Parameter validation |
| Clickjacking | ✅ Blocked | X-Frame-Options header |
| MIME Sniffing | ✅ Blocked | X-Content-Type-Options |

---

## Environment Security

### Required Environment Variables

```bash
# Upstash Redis (required for production)
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...

# Base URL (for share links)
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### DO NOT Commit
- `.env.local` - Contains secrets
- Any files with API tokens
- Database credentials

### Safe to Commit
- `.env.example` - Template only
- Public configuration

---

## Security Checklist for Deployment

- [x] Upstash Redis configured (persistent storage)
- [x] Rate limiting enabled
- [x] Input validation active
- [x] Security headers set
- [x] CORS configured
- [x] Size limits enforced
- [x] Environment variables set in Vercel
- [x] HTTPS enforced (automatic on Vercel)
- [ ] Run security tests: `./test-security.sh DEPLOYMENT_URL`
- [ ] Monitor Upstash Redis usage
- [ ] Set up error monitoring (optional: Sentry, LogRocket)

---

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** create a public GitHub issue
2. Email the maintainer directly (add your email)
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

---

## Security Updates

This app uses:
- Next.js 16.1.2
- React 19
- @vercel/kv (latest)

Keep dependencies updated:
```bash
npm audit
npm update
```

---

## Additional Security Considerations

### Not Currently Implemented (Future Enhancements)

1. **CAPTCHA** - Could add reCAPTCHA for additional spam protection
2. **Authentication** - Currently no user accounts (stateless design)
3. **Abuse Reporting** - No mechanism to report fake results
4. **IP Blocklist** - No persistent IP blocking (uses rate limits only)
5. **Webhook Verification** - If adding webhooks, verify signatures

### Why Not Needed Now

- App is read-only for most users (no accounts to hijack)
- Results are temporary (30-day expiration)
- No sensitive user data stored
- Rate limiting sufficient for current scale

---

## Compliance

### Data Privacy
- No personal data collected (except IP for rate limiting)
- No cookies set
- No tracking scripts
- Results are public (shareable URLs)

### GDPR Considerations
- Results auto-expire in 30 days
- No user profiles or accounts
- IP addresses used only for rate limiting (not stored long-term)

---

## Monitoring & Alerting

### Recommended Monitoring

1. **Upstash Redis Usage**
   - Monitor command count
   - Set up alerts for quota limits

2. **Vercel Analytics**
   - Monitor 429 responses (rate limit hits)
   - Track 400 responses (validation failures)
   - Watch for unusual traffic patterns

3. **Error Logging**
   - Server errors logged to console
   - Consider adding Sentry for production

---

## Security Audit History

| Date | Version | Changes |
|------|---------|---------|
| 2024-01-16 | 1.0 | Initial security hardening |
|  |  | - Added rate limiting |
|  |  | - Added input validation |
|  |  | - Added security headers |
|  |  | - Added CORS protection |
|  |  | - Added size limits |

---

**Last Updated:** January 16, 2024
**Security Level:** Production-Ready 🔒
