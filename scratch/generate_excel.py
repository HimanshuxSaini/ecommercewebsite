import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = openpyxl.Workbook()
# Remove default sheet
wb.remove(wb.active)

# Color styles
HEADER_FILL = PatternFill(start_color="173F30", end_color="173F30", fill_type="solid")
HEADER_FONT = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
TITLE_FONT = Font(name="Calibri", size=14, bold=True, color="173F30")
SUBTITLE_FONT = Font(name="Calibri", size=10, italic=True, color="555555")

STATUS_FILLS = {
    "Pass": PatternFill(start_color="D1E7DD", end_color="D1E7DD", fill_type="solid"),
    "Fail": PatternFill(start_color="F8D7DA", end_color="F8D7DA", fill_type="solid"),
    "Not implemented": PatternFill(start_color="FFF3CD", end_color="FFF3CD", fill_type="solid"),
    "Not tested": PatternFill(start_color="E2E3E5", end_color="E2E3E5", fill_type="solid"),
    "Not applicable": PatternFill(start_color="E9ECEF", end_color="E9ECEF", fill_type="solid"),
}

SEV_FONTS = {
    "Critical": Font(name="Calibri", size=10, bold=True, color="842029"),
    "High": Font(name="Calibri", size=10, bold=True, color="B02A37"),
    "Medium": Font(name="Calibri", size=10, bold=True, color="664D03"),
    "Low": Font(name="Calibri", size=10, bold=True, color="0F5132"),
    "Informational": Font(name="Calibri", size=10, color="41464B"),
    "N/A": Font(name="Calibri", size=10, color="6C757D")
}

THIN_BORDER = Border(
    left=Side(style='thin', color='DDDDDD'),
    right=Side(style='thin', color='DDDDDD'),
    top=Side(style='thin', color='DDDDDD'),
    bottom=Side(style='thin', color='DDDDDD')
)

# -------------------------------------------------------------
# Sheet 1: Master Pre-Launch Security Audit Checklist
# -------------------------------------------------------------
ws1 = wb.create_sheet(title="Audit Checklist")

headers1 = [
    "Check ID",
    "Category",
    "Security Requirement",
    "Actual Result",
    "Evidence",
    "Status",
    "Severity",
    "What Needs Fixing",
    "Recommended Fix",
    "Retest Instructions",
    "Launch-Blocking"
]

rows1 = [
    # 1. Existing code and API security
    [
        "SEC-01",
        "1. Code & API Security",
        "API endpoints must authenticate, authorize and validate all requests on the backend.",
        "No backend API endpoints exist. Only static SPA served via server.js with GET /health.",
        "server.js lines 53-93; no REST/GraphQL API controllers or DB handlers present.",
        "Not implemented",
        "Critical",
        "Frontend performs operations entirely in-memory and local storage with no backend API enforcement.",
        "Implement a hardened Node.js/Express or FastAPI API layer with controllers, services, and validation middleware.",
        "Execute automated endpoint tests against /api/* verifying JWT requirement and 401/403 responses.",
        "Yes"
    ],
    [
        "SEC-02",
        "1. Code & API Security",
        "Defense-in-depth security headers must be applied to all HTTP responses.",
        "Strict CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy configured.",
        "server.js lines 20-46; vercel.json headers; netlify.toml headers; index.html meta tags.",
        "Pass",
        "Low",
        "CSP script-src currently permits 'unsafe-inline' for client bundler scripts.",
        "Refactor to nonce-based or hash-based script execution when hosting production backend.",
        "Run curl -I http://localhost:3000 and verify all 7 security headers.",
        "No"
    ],
    [
        "SEC-03",
        "1. Code & API Security",
        "Client and server inputs must be sanitized against XSS attacks.",
        "HTML entity escaping and tag stripping implemented via utils/security.ts.",
        "src/utils/security.ts sanitizeInput(), stripHtmlTags(); used in CheckoutModal & AuthModal.",
        "Pass",
        "Medium",
        "Client sanitization alone is insufficient; server-side sanitization must be duplicated on all API routes.",
        "Add express-validator or Zod schemas on backend endpoints when API layer is created.",
        "Submit <script>alert(1)</script> payloads and verify string is rendered harmlessly without execution.",
        "No"
    ],
    [
        "SEC-04",
        "1. Code & API Security",
        "SQL and NoSQL injection attempts must be blocked.",
        "Client heuristics detect SQL/NoSQL injection signatures; no database connected to exploit.",
        "src/utils/security.ts detectSqlInjection(); no ORM/SQL drivers in package.json.",
        "Pass",
        "High",
        "Frontend heuristic patterns are bypassable; parameterized queries must be enforced at backend DB layer.",
        "Use parameterized queries (pg/Prisma) or schema-validated Mongoose queries in future backend.",
        "Send ' OR 1=1 -- via form inputs and verify request is blocked/sanitized.",
        "No"
    ],
    [
        "SEC-05",
        "1. Code & API Security",
        "State-modifying operations must be protected against CSRF.",
        "Client CSRF token generation implemented in sessionStorage; no backend state mutation endpoints exist.",
        "src/utils/security.ts getOrCreateCsrfToken(), validateCsrfToken().",
        "Pass",
        "Medium",
        "When REST API is deployed, anti-CSRF tokens or SameSite=Strict cookies must be enforced by server middleware.",
        "Implement csurf middleware or SameSite=Strict cookie policy on API gateway.",
        "Craft cross-origin POST request without token and verify 403 Forbidden rejection.",
        "No"
    ],

    # 2. Authentication and authorization
    [
        "AUTH-01",
        "2. Auth & Authorization",
        "Passwords must be hashed using robust algorithms (Argon2id/bcrypt) and never stored in plaintext.",
        "No password hashing or backend auth exists. Demo simulation logs in directly with email string.",
        "src/context/AppContext.tsx lines 420-454: login() matches plaintext email in localStorage.",
        "Fail",
        "Critical",
        "Passwords entered in AuthModal are not verified against salted hashes on a server; state is kept in browser localStorage.",
        "Build server-side auth service with bcrypt (cost 12) or Argon2id, HTTP-only JWT cookies, and session invalidation.",
        "Attempt login with invalid credentials; verify password hash stored in DB matches standard bcrypt format.",
        "Yes"
    ],
    [
        "AUTH-02",
        "2. Auth & Authorization",
        "Session tokens must be securely generated, signed, and transmitted via HTTP-only secure cookies.",
        "No session tokens or server-signed JWTs exist. Session stored in localStorage 'sv_currentUser'.",
        "src/context/AppContext.tsx lines 166-177; localStorage sv_currentUser.",
        "Fail",
        "Critical",
        "localStorage authentication is vulnerable to XSS token theft and lacks server-side expiration or revocation.",
        "Implement signed JWTs or Redis session store with Set-Cookie: HttpOnly; Secure; SameSite=Strict.",
        "Inspect Document.cookie in console; verify auth tokens are inaccessible to JavaScript.",
        "Yes"
    ],
    [
        "AUTH-03",
        "2. Auth & Authorization",
        "Rate limiting must be enforced on authentication endpoints to prevent brute-force attacks.",
        "Client-side RateLimiter class enforces 5 attempts/minute with progressive lockout delays.",
        "src/utils/security.ts loginRateLimiter; src/components/auth/AuthModal.tsx.",
        "Pass",
        "High",
        "Client-side rate limiting can be bypassed by clearing localStorage or making raw HTTP requests.",
        "Add express-rate-limit or Redis token-bucket rate limiting on backend POST /api/auth/login.",
        "Trigger 6 rapid login requests from curl; verify 429 Too Many Requests response.",
        "Yes"
    ],

    # 3. Admin panel security
    [
        "ADM-01",
        "3. Admin Panel Security",
        "Administrative routes and controls must enforce strict server-side authorization checks.",
        "Admin panel guarded solely by client-side React role check ('admin' | 'manager').",
        "src/components/admin/AdminLayout.tsx line 43: const canAccessAdmin = currentUser?.role === 'admin'...",
        "Fail",
        "Critical",
        "Anyone can edit localStorage 'sv_currentUser' to role: 'admin' in Developer Tools and gain full admin UI access.",
        "Protect admin endpoints with server-side middleware: verifyAdminToken(req, res, next) checking claims against DB.",
        "Attempt to query administrative data using a customer JWT; verify 403 Forbidden.",
        "Yes"
    ],
    [
        "ADM-02",
        "3. Admin Panel Security",
        "Admin account must mandate Multi-Factor Authentication (MFA/TOTP).",
        "No MFA mechanism implemented in application.",
        "src/components/auth/AuthModal.tsx, AppContext.tsx.",
        "Not implemented",
        "High",
        "Single-factor authentication exposes administrative controls if credentials are compromised.",
        "Integrate TOTP (speakeasy / otplib) requiring authenticator app 6-digit code for admin role login.",
        "Log in as admin; verify prompt for TOTP code before granting administrative session token.",
        "Yes"
    ],
    [
        "ADM-03",
        "3. Admin Panel Security",
        "Web crawlers must be forbidden from indexing admin control pages.",
        "public/robots.txt disallows /admin and /admin/*.",
        "public/robots.txt lines 4-5.",
        "Pass",
        "Low",
        "robots.txt is purely advisory; must be paired with authentication gates.",
        "Ensure server sends 401 Unauthorized for unauthenticated requests to any /admin backend route.",
        "Request /robots.txt and verify Disallow: /admin directives.",
        "No"
    ],

    # 4. Database and data protection
    [
        "DB-01",
        "4. Database & Protection",
        "Production database must use least-privilege credentials, encryption-at-rest, and TLS in transit.",
        "No database currently attached to the application. Data persists only in browser localStorage.",
        "package.json has no DB drivers (no mongoose, pg, mysql2, prisma); src/data/mockData.ts.",
        "Not implemented",
        "Critical",
        "Multi-user e-commerce platform cannot operate securely without an authoritative production database.",
        "Provision PostgreSQL or MongoDB with TLS connections, encrypted storage, and non-root service accounts.",
        "Inspect connection string; verify sslmode=require and test encrypted communication.",
        "Yes"
    ],
    [
        "DB-02",
        "4. Database & Protection",
        "Sensitive customer data must be isolated and protected against unauthorized horizontal access (IDOR).",
        "Customer profile reads from localStorage; no database IDOR attack surface exists currently.",
        "src/context/AppContext.tsx; src/components/profile/UserProfileModal.tsx.",
        "Not applicable",
        "High",
        "Future order/profile API endpoints must enforce user ID scoping (WHERE user_id = req.user.id).",
        "Implement object-level access control in service layer ensuring users can only query their own records.",
        "Attempt to fetch order #{id} belonging to user B while authenticated as user A; verify 403 response.",
        "Yes"
    ],

    # 5. E-commerce business logic
    [
        "BIZ-01",
        "5. Business Logic",
        "Item prices, discounts, shipping fees, and totals must be verified against canonical catalog on server.",
        "Client-side price verification implemented against canonical catalog array in AppContext.",
        "src/context/AppContext.tsx lines 1041-1070: canonical price recalculation in placeOrder().",
        "Pass",
        "Critical",
        "Currently validated in frontend JavaScript; must be duplicated on the server before payment creation.",
        "Ensure backend API recalculates cart total directly from DB prices before creating payment order.",
        "Tamper with product price in cart payload; verify server rejects or re-evaluates to correct amount.",
        "Yes"
    ],
    [
        "BIZ-02",
        "5. Business Logic",
        "Orders must not transition to 'Paid' or 'Processing' without cryptographically verified payment confirmation.",
        "Currently orders default to 'Processing' upon placement without payment gateway verification.",
        "src/context/AppContext.tsx line 1083: status: 'Processing'.",
        "Fail",
        "Critical",
        "Anyone can place orders marked 'Processing' without actual monetary settlement.",
        "Initialize orders in 'Pending_Payment' state; transition to 'Paid' only upon verified gateway webhook.",
        "Submit checkout request; verify order state remains 'Pending_Payment' until webhook event fires.",
        "Yes"
    ],
    [
        "BIZ-03",
        "5. Business Logic",
        "Inventory stock must be atomically decremented to prevent negative stock and race conditions.",
        "Client decrements local stock array with Math.max(0, stock - qty).",
        "src/context/AppContext.tsx lines 1088-1097.",
        "Fail",
        "High",
        "In a multi-user environment, client-side stock deduction does not prevent race conditions or overselling.",
        "Implement atomic database decrement (e.g. UPDATE products SET stock = stock - qty WHERE stock >= qty).",
        "Simulate concurrent checkouts exceeding available stock; verify excess orders are rejected.",
        "Yes"
    ],

    # 6. Dependency and secret scanning
    [
        "DEP-01",
        "6. Dependency & Secrets",
        "Third-party dependencies must have zero high or critical security vulnerabilities.",
        "npm audit reports 0 vulnerabilities across 297 total dependencies.",
        "npm audit result: 0 critical, 0 high, 0 moderate, 0 low.",
        "Pass",
        "Medium",
        "Continuous vulnerability monitoring is required as dependencies evolve.",
        "Enable GitHub Dependabot or npm audit step in CI/CD pipeline.",
        "Run npm audit in terminal; verify 0 vulnerabilities.",
        "No"
    ],
    [
        "DEP-02",
        "6. Dependency & Secrets",
        "No production secrets, API keys, or private certificates may be committed to version control.",
        ".env.example contains placeholder strings; no committed .env file found in repository.",
        ".env.example: GEMINI_API_KEY='MY_GEMINI_API_KEY'; .gitignore includes .env.",
        "Pass",
        "Critical",
        "Ensure deployment platform environment variables are configured with actual keys in runtime secrets vault.",
        "Use cloud secret managers (AWS Secrets Manager, Vercel Environment Secrets) for runtime keys.",
        "Run git log -p and truffleHog to confirm no past commits leaked credentials.",
        "No"
    ],

    # 7. File uploads and storage
    [
        "UPL-01",
        "7. File Upload Security",
        "File uploads must restrict MIME types, validate file headers, sanitize filenames, and store outside docroot.",
        "No file upload functionality exists in codebase; media URLs are accepted as external strings.",
        "src/components/admin/AdminProducts.tsx, AdminBanners.tsx; grep search for type='file' returned 0 results.",
        "Not implemented",
        "High",
        "If future catalog management allows direct image uploads, strict validation and S3/GCS bucket isolation is required.",
        "Use presigned S3 URLs, validate magic bytes, re-encode images via Sharp, and strip EXIF metadata.",
        "Upload executable .php or .exe disguised as .jpg; verify rejection.",
        "No"
    ],

    # 8. Local dev and staging configuration
    [
        "DEV-01",
        "8. Dev & Staging Config",
        "Production server must disable information disclosure headers and limit body size to prevent DoS.",
        "server.js disables x-powered-by, sets trust proxy, and limits JSON request body to 100kb.",
        "server.js lines 13-14, 49-50.",
        "Pass",
        "Low",
        "None for current server.js file.",
        "Maintain body size limits when expanding API handlers.",
        "Send 1MB payload to POST endpoint; verify 413 Payload Too Large.",
        "No"
    ],

    # 9. Domain and deployment readiness
    [
        "DOM-01",
        "9. Domain & Deployment",
        "Domain registration must be locked with registrar MFA and DNSSEC configured.",
        "Domain not purchased yet; deployment is in local development stage.",
        "User specification: 'Domain: Not purchased yet'.",
        "Not applicable",
        "High",
        "Pre-launch domain acquisition requires Registrar Lock, WHOIS privacy, and DNSSEC enablement.",
        "Follow Domain Readiness Checklist (Section 6A) upon domain acquisition.",
        "Query whois velneer.com and dig +dnssec velneer.com once live.",
        "Yes"
    ],
    [
        "DOM-02",
        "9. Domain & Deployment",
        "Production TLS certificates must enforce TLS 1.3 and HSTS preloading.",
        "HSTS header configured in server.js, vercel.json, and netlify.toml.",
        "Strict-Transport-Security: max-age=63072000; includeSubDomains; preload.",
        "Pass",
        "High",
        "TLS termination is dependent on future production hosting environment (Cloudflare, Vercel, or Nginx).",
        "Enforce TLS 1.3 with automated certificate renewal via Let's Encrypt or Managed Cloud Certificate.",
        "Test live URL with SSL Labs; verify A+ grade.",
        "Yes"
    ],

    # 10. Future payment gateway readiness
    [
        "PAY-01",
        "10. Payment Gateway",
        "Payment integration must never store raw card numbers or CVV codes (PCI DSS scope reduction).",
        "No payment gateway integrated yet; client UI provides mock method selection (UPI/Card/COD).",
        "User specification: 'Payment gateway: Not integrated yet'; CheckoutModal.tsx.",
        "Not implemented",
        "Critical",
        "Payment processing must use hosted checkout (Stripe Checkout, Razorpay Standard) or tokenized components.",
        "Follow Payment Security Checklist (Section 6B) during gateway onboarding.",
        "Inspect database schemas and log files to verify 0 instances of PAN or CVV storage.",
        "Yes"
    ],
    [
        "PAY-02",
        "10. Payment Gateway",
        "Payment gateway webhooks must be cryptographically verified using signing secrets.",
        "No payment webhooks implemented in codebase.",
        "server.js has no /webhook endpoint.",
        "Not implemented",
        "Critical",
        "Unverified webhooks allow attackers to spoof 'payment.succeeded' events and acquire goods for free.",
        "Implement raw body signature verification (e.g. stripe.webhooks.constructEvent / razorpay.validateWebhookSignature).",
        "Send forged webhook with invalid signature; verify 400 Bad Request rejection.",
        "Yes"
    ],

    # 11. Logging, backups and incident response
    [
        "LOG-01",
        "11. Logging & Incident Response",
        "Application must maintain structured security event audit logging.",
        "Client security event logging utility implemented with in-memory log buffer.",
        "src/utils/security.ts recordSecurityEvent(), getSecurityLogs().",
        "Pass",
        "Medium",
        "In-memory client logs are lost on page refresh and cannot be monitored by SIEM or security analysts.",
        "Implement centralized server logging with Winston or Pino feeding into CloudWatch or Datadog.",
        "Trigger security alert; verify log event appears in centralized log dashboard.",
        "No"
    ],
    [
        "LOG-02",
        "11. Logging & Incident Response",
        "Vulnerability disclosure policy must be published at /.well-known/security.txt.",
        "RFC 9116 security.txt file deployed in public/.well-known/security.txt.",
        "public/.well-known/security.txt verified in build distribution.",
        "Pass",
        "Informational",
        "Update contact email once official domain email (security@velneer.com) is operational.",
        "Ensure inbox security@velneer.com is monitored with automated incident ticketing.",
        "Request /.well-known/security.txt and verify HTTP 200 response.",
        "No"
    ],

    # 12. Final launch approval
    [
        "LNC-01",
        "12. Launch Approval",
        "All launch-blocking security requirements must be satisfied before production launch.",
        "Platform is in pre-launch development stage with mock backend data.",
        "Audit findings reveal 7 launch-blocking architecture items requiring backend implementation.",
        "Fail",
        "Critical",
        "Website cannot be published to real customers until authoritative backend, DB, and payment gateway exist.",
        "Implement Remediation Roadmap (Phase 1 through Phase 4) prior to production go-live.",
        "Perform end-to-end pre-launch signoff retest using this checklist.",
        "Yes"
    ]
]

ws1.append(["VELNEER E-COMMERCE PRE-LAUNCH SECURITY AUDIT CHECKLIST"])
ws1.append(["Brand: Velneer | Stage: Development (Pre-Launch) | Date: October 2026 | Auditor: Senior AppSec Engineer"])
ws1.append([])
ws1.append(headers1)

for r in rows1:
    ws1.append(r)

# Format Sheet 1
ws1.merge_cells("A1:K1")
ws1["A1"].font = TITLE_FONT
ws1.merge_cells("A2:K2")
ws1["A2"].font = SUBTITLE_FONT

for col_num in range(1, len(headers1) + 1):
    cell = ws1.cell(row=4, column=col_num)
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

for row_idx in range(5, 5 + len(rows1)):
    status_cell = ws1.cell(row=row_idx, column=6)
    status_val = status_cell.value
    if status_val in STATUS_FILLS:
        status_cell.fill = STATUS_FILLS[status_val]
        status_cell.alignment = Alignment(horizontal="center", vertical="center")
    
    sev_cell = ws1.cell(row=row_idx, column=7)
    sev_val = sev_cell.value
    if sev_val in SEV_FONTS:
        sev_cell.font = SEV_FONTS[sev_val]
        sev_cell.alignment = Alignment(horizontal="center", vertical="center")
        
    block_cell = ws1.cell(row=row_idx, column=11)
    if block_cell.value == "Yes":
        block_cell.font = Font(name="Calibri", size=10, bold=True, color="B02A37")
        block_cell.alignment = Alignment(horizontal="center", vertical="center")
    else:
        block_cell.alignment = Alignment(horizontal="center", vertical="center")

    for col_idx in range(1, len(headers1) + 1):
        c = ws1.cell(row=row_idx, column=col_idx)
        c.border = THIN_BORDER
        if col_idx in [3, 4, 5, 8, 9, 10]:
            c.alignment = Alignment(wrap_text=True, vertical="top")

# Auto-adjust column widths
col_widths1 = [12, 22, 32, 32, 28, 18, 14, 34, 34, 30, 16]
for i, w in enumerate(col_widths1, 1):
    ws1.column_dimensions[get_column_letter(i)].width = w

# -------------------------------------------------------------
# Sheet 2: Remediation Plan
# -------------------------------------------------------------
ws2 = wb.create_sheet(title="Remediation Plan")

headers2 = [
    "Task ID",
    "Finding Ref",
    "Remediation Action",
    "Target Architecture / Component",
    "Priority",
    "Owner",
    "Target Phase",
    "Success Criteria",
    "Launch Blocker"
]

rows2 = [
    [
        "REM-01",
        "AUTH-01, AUTH-02",
        "Implement authoritative backend auth service with bcrypt and HTTP-only JWT cookies",
        "Backend / Auth Service (server/services/authService.js)",
        "P0 - Critical",
        "Backend Lead",
        "Phase 1: Backend Foundation",
        "Passwords hashed with bcrypt (cost 12); auth token stored in HTTP-only SameSite=Strict cookie; localStorage credentials eliminated.",
        "Yes"
    ],
    [
        "REM-02",
        "ADM-01, ADM-02",
        "Enforce server-side RBAC middleware and require TOTP MFA for admin accounts",
        "Backend / Middleware (server/middleware/rbacMiddleware.js)",
        "P0 - Critical",
        "Backend / Security",
        "Phase 1: Backend Foundation",
        "Direct API requests without valid admin token return 403 Forbidden; admin login requires verified 6-digit TOTP code.",
        "Yes"
    ],
    [
        "REM-03",
        "DB-01, DB-02",
        "Provision production database with encryption-at-rest, TLS in transit, and user-isolated queries",
        "Database Layer (PostgreSQL / MongoDB)",
        "P0 - Critical",
        "DevOps / DB Architect",
        "Phase 1: Backend Foundation",
        "Production DB operational; sslmode=require enforced; all customer queries filtered by req.user.id (preventing IDOR).",
        "Yes"
    ],
    [
        "REM-04",
        "BIZ-01, BIZ-02, BIZ-03",
        "Implement server-side order calculation, atomic stock deduction, and strict state machine",
        "Order Engine (server/services/orderService.js)",
        "P0 - Critical",
        "Backend Engineer",
        "Phase 2: Order Engine",
        "Order totals computed exclusively from DB catalog prices; orders created in Pending_Payment; stock decremented atomically.",
        "Yes"
    ],
    [
        "REM-05",
        "PAY-01, PAY-02",
        "Integrate hosted payment gateway with signed webhook validation and idempotent processing",
        "Payment Service (server/services/paymentService.js)",
        "P0 - Critical",
        "Full-Stack Engineer",
        "Phase 3: Payment Integration",
        "Payment signatures verified before marking order Paid; zero cardholder data touches Velneer server; duplicate webhooks handled idempotently.",
        "Yes"
    ],
    [
        "REM-06",
        "AUTH-03, SEC-01",
        "Deploy server-side IP and user-rate limiters on authentication and checkout APIs",
        "API Gateway / Rate Limiting (server/middleware/rateLimit.js)",
        "P1 - High",
        "DevOps / Backend",
        "Phase 2: Order Engine",
        "Exceeding 5 failed logins or 10 checkout calls triggers HTTP 429 Too Many Requests backed by Redis counters.",
        "Yes"
    ],
    [
        "REM-07",
        "DOM-01, DOM-02",
        "Execute Domain & DNS security hardening (Registrar MFA, Registrar Lock, DNSSEC, A+ TLS)",
        "Cloud & Registrar Infrastructure",
        "P1 - High",
        "DevOps Lead",
        "Phase 4: Launch Prep",
        "Registrar account secured with hardware MFA; DNSSEC validated; SSL Labs grade A+ confirmed; security headers verified.",
        "Yes"
    ],
    [
        "REM-08",
        "LOG-01",
        "Configure centralized structured logging and automated error alerts",
        "Observability (Winston / CloudWatch / Datadog)",
        "P2 - Medium",
        "DevOps / SRE",
        "Phase 4: Launch Prep",
        "All auth failures, webhook errors, and rate limit trips stream to centralized log aggregator with alerting on anomaly spikes.",
        "No"
    ]
]

ws2.append(["VELNEER SECURITY REMEDIATION ROADMAP"])
ws2.append(["Actionable tasks, owners, and phase sequencing to achieve production security certification"])
ws2.append([])
ws2.append(headers2)

for r in rows2:
    ws2.append(r)

ws2.merge_cells("A1:I1")
ws2["A1"].font = TITLE_FONT
ws2.merge_cells("A2:I2")
ws2["A2"].font = SUBTITLE_FONT

for col_num in range(1, len(headers2) + 1):
    cell = ws2.cell(row=4, column=col_num)
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

for row_idx in range(5, 5 + len(rows2)):
    prio_cell = ws2.cell(row=row_idx, column=5)
    if "P0" in str(prio_cell.value):
        prio_cell.font = Font(name="Calibri", size=10, bold=True, color="842029")
    elif "P1" in str(prio_cell.value):
        prio_cell.font = Font(name="Calibri", size=10, bold=True, color="B02A37")
    prio_cell.alignment = Alignment(horizontal="center", vertical="center")

    block_cell = ws2.cell(row=row_idx, column=9)
    if block_cell.value == "Yes":
        block_cell.font = Font(name="Calibri", size=10, bold=True, color="B02A37")
    block_cell.alignment = Alignment(horizontal="center", vertical="center")

    for col_idx in range(1, len(headers2) + 1):
        c = ws2.cell(row=row_idx, column=col_idx)
        c.border = THIN_BORDER
        if col_idx in [3, 4, 8]:
            c.alignment = Alignment(wrap_text=True, vertical="top")

col_widths2 = [12, 16, 38, 34, 16, 18, 24, 40, 16]
for i, w in enumerate(col_widths2, 1):
    ws2.column_dimensions[get_column_letter(i)].width = w

# -------------------------------------------------------------
# Sheet 3: Domain & Deployment Readiness
# -------------------------------------------------------------
ws3 = wb.create_sheet(title="Domain & Deployment")

headers3 = [
    "Check ID",
    "Domain / Hosting Requirement",
    "Scope & Technical Specification",
    "Current Dev State",
    "Target Production Requirement",
    "Severity",
    "Pre-Launch Verification Command / Check",
    "Status"
]

rows3 = [
    [
        "DOM-REQ-01",
        "Registrar Account MFA",
        "Registrar account (Cloudflare / Namecheap / Google Domains) must enforce hardware key (WebAuthn/FIDO2) or TOTP MFA.",
        "Domain not purchased yet",
        "Mandatory 2FA/MFA on registrar dashboard; single-factor access prohibited.",
        "Critical",
        "Verify 2FA enabled badge in registrar account settings.",
        "Pending Acquisition"
    ],
    [
        "DOM-REQ-02",
        "Registrar Transfer Lock",
        "Enable Registrar-Lock (ClientTransferProhibited) and Registry-Lock if available to prevent domain hijacking.",
        "Domain not purchased yet",
        "Transfer lock active immediately upon domain registration.",
        "High",
        "whois velneer.com | grep -i 'Status' (expect clientTransferProhibited).",
        "Pending Acquisition"
    ],
    [
        "DOM-REQ-03",
        "DNSSEC Implementation",
        "Deploy Domain Name System Security Extensions (DNSSEC) with DS records at registrar to stop DNS spoofing/cache poisoning.",
        "Domain not purchased yet",
        "DNSSEC signing enabled via authoritative DNS provider.",
        "High",
        "dig +dnssec velneer.com (verify RRSIG records present).",
        "Pending Acquisition"
    ],
    [
        "DOM-REQ-04",
        "Email Authentication (SPF/DKIM/DMARC)",
        "Configure SPF (v=spf1), DKIM (2048-bit), and DMARC (p=reject) to stop brand phishing and transactional email spoofing.",
        "Domain not purchased yet",
        "Strict DMARC policy with rua/ruf reporting addresses.",
        "High",
        "dig TXT _dmarc.velneer.com (expect 'v=DMARC1; p=reject').",
        "Pending Acquisition"
    ],
    [
        "DOM-REQ-05",
        "Production TLS & HTTPS Enforcement",
        "Enforce TLS 1.3 only, disable insecure ciphers, and automate certificate renewal with CAA records.",
        "server.js sets HSTS; running locally on HTTP",
        "Valid TLS cert from Let's Encrypt / DigiCert; automatic renewal; CAA record restricting issuer.",
        "Critical",
        "curl -Iv https://velneer.com; ssllabs.com test (A+ score).",
        "Pending Deployment"
    ],
    [
        "DOM-REQ-06",
        "Cloud WAF & DDoS Shield",
        "Deploy Cloudflare WAF or AWS CloudFront/WAF with OWASP Core Rule Set and managed rate limiting.",
        "Local Express server with memory rate limiter",
        "Edge WAF blocking common SQLi, XSS, scanner bots, and layer 7 floods.",
        "High",
        "Send test SQLi attack string to edge endpoint; verify 403 from WAF.",
        "Pending Deployment"
    ],
    [
        "DOM-REQ-07",
        "Restricted Staging Environment",
        "Staging environments (staging.velneer.com) must be behind HTTP Basic Auth or VPN and block crawlers via X-Robots-Tag.",
        "Local development on localhost:3000",
        "Staging isolated from public access; no search indexing; separate staging DB.",
        "Medium",
        "Attempt unauthenticated request to staging URL; verify 401 prompt.",
        "Pending Deployment"
    ],
    [
        "DOM-REQ-08",
        "Production Environment Secrets Isolation",
        "Production runtime keys (DB password, gateway keys) stored exclusively in cloud secret manager, never in git repo.",
        ".env.example contains placeholder strings",
        "Zero secrets in source control or build artifacts; injected at container runtime.",
        "Critical",
        "Inspect compiled client assets; verify no API keys or backend secrets present.",
        "Ready for Config"
    ]
]

ws3.append(["VELNEER DOMAIN & HOSTING DEPLOYMENT READINESS CHECKLIST"])
ws3.append(["Infrastructure, DNS, TLS, and perimeter security controls for production go-live"])
ws3.append([])
ws3.append(headers3)

for r in rows3:
    ws3.append(r)

ws3.merge_cells("A1:H1")
ws3["A1"].font = TITLE_FONT
ws3.merge_cells("A2:H2")
ws3["A2"].font = SUBTITLE_FONT

for col_num in range(1, len(headers3) + 1):
    cell = ws3.cell(row=4, column=col_num)
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

for row_idx in range(5, 5 + len(rows3)):
    sev_cell = ws3.cell(row=row_idx, column=6)
    if sev_cell.value in SEV_FONTS:
        sev_cell.font = SEV_FONTS[sev_cell.value]
        sev_cell.alignment = Alignment(horizontal="center", vertical="center")
        
    stat_cell = ws3.cell(row=row_idx, column=8)
    stat_cell.alignment = Alignment(horizontal="center", vertical="center")
    stat_cell.fill = PatternFill(start_color="FFF3CD", end_color="FFF3CD", fill_type="solid")

    for col_idx in range(1, len(headers3) + 1):
        c = ws3.cell(row=row_idx, column=col_idx)
        c.border = THIN_BORDER
        if col_idx in [2, 3, 4, 5, 7]:
            c.alignment = Alignment(wrap_text=True, vertical="top")

col_widths3 = [14, 28, 38, 28, 36, 14, 34, 20]
for i, w in enumerate(col_widths3, 1):
    ws3.column_dimensions[get_column_letter(i)].width = w

# -------------------------------------------------------------
# Sheet 4: Payment Gateway Integration Security
# -------------------------------------------------------------
ws4 = wb.create_sheet(title="Payment Security")

headers4 = [
    "Check ID",
    "Payment Security Area",
    "Requirement Specification",
    "Current Implementation Status",
    "Mandatory Security Architecture",
    "Severity",
    "Verification Procedure",
    "Gate Status"
]

rows4 = [
    [
        "PAY-SEC-01",
        "PCI DSS Compliance Scope",
        "Never handle, transmit, or store raw Card Primary Account Numbers (PAN), expiration dates, or CVV/CVC codes on Velneer servers.",
        "Not implemented (Mock checkout in UI)",
        "Use Hosted Checkout (Stripe Checkout / Razorpay Standard) or PCI SAQ-A compliant iframe/tokenized elements.",
        "Critical",
        "Inspect backend network traffic and database tables; verify 0 card numbers captured.",
        "Pre-Integration Requirement"
    ],
    [
        "PAY-SEC-02",
        "Server-Side Amount Calculation",
        "Payment intent / order amount must be generated on the server from verified database product prices, not client-supplied sums.",
        "Client recomputes locally against mock array",
        "API receives only { items: [{ id, quantity }] } and recalculates total from authoritative database prices.",
        "Critical",
        "Send payment initiation request with price: 1; verify server overrides with true catalog price.",
        "Pre-Integration Requirement"
    ],
    [
        "PAY-SEC-03",
        "Cryptographic Webhook Signatures",
        "All asynchronous payment notification webhooks must verify HMAC-SHA256 signatures using raw request bodies and secret keys.",
        "Not implemented (No payment webhook exists)",
        "Validate stripe-signature / X-Razorpay-Signature using webhook secret before processing event payload.",
        "Critical",
        "Post forged payload with invalid HMAC signature; verify immediate HTTP 400 rejection.",
        "Pre-Integration Requirement"
    ],
    [
        "PAY-SEC-04",
        "Webhook Idempotency & Replay Protection",
        "Webhook consumer must track gateway event IDs in database and ignore duplicate deliveries to prevent duplicate orders/fulfillments.",
        "Not implemented",
        "Atomic transaction: INSERT INTO processed_events (event_id) ON CONFLICT DO NOTHING. Return HTTP 200 on repeats.",
        "High",
        "Replay identical successful webhook payload 5 times; verify order state and fulfillment triggered exactly once.",
        "Pre-Integration Requirement"
    ],
    [
        "PAY-SEC-05",
        "Secure Order State Machine",
        "Enforce strict unidirectional order states: Created -> Pending_Payment -> Paid -> Processing -> Shipped -> Delivered / Refunded.",
        "Orders transition directly to 'Processing'",
        "No order can transition to 'Paid' or 'Processing' without cryptographic gateway confirmation or verified manual COD approval.",
        "Critical",
        "Attempt direct API call to transition unpaid order to 'Shipped'; verify 403/400 rejection.",
        "Pre-Integration Requirement"
    ],
    [
        "PAY-SEC-06",
        "Gateway Credentials & Secret Segregation",
        "Payment provider publishable/client keys may appear in frontend; secret API keys and webhook secrets must remain on server only.",
        "No keys configured",
        "Secret keys injected strictly via runtime environment variables; sandbox and production keys strictly segregated.",
        "Critical",
        "Grep production client JS build for secret key prefix (e.g. sk_live_, rzp_live_secret); verify 0 occurrences.",
        "Pre-Integration Requirement"
    ],
    [
        "PAY-SEC-07",
        "Sandbox Scenario Test Battery",
        "Execute end-to-end sandbox tests covering successful payments, card declines, 3D Secure challenges, timeouts, and user cancellations.",
        "Not implemented",
        "Full test suite passing in staging environment before requesting live API credentials.",
        "High",
        "Run automated gateway sandbox test suite and document outcome logs for all 5 core transaction flows.",
        "Pre-Integration Requirement"
    ],
    [
        "PAY-SEC-08",
        "Refund & Authorization Controls",
        "Refund initiation must require privileged role ('admin' only), reason logging, two-person rule for large sums, and rate limits.",
        "Not implemented",
        "Refund API endpoints guarded by RBAC, MFA confirmation for amounts over threshold, and audit trails.",
        "High",
        "Attempt refund as manager or customer; verify 403 Forbidden.",
        "Pre-Integration Requirement"
    ]
]

ws4.append(["VELNEER PAYMENT GATEWAY INTEGRATION SECURITY CHECKLIST"])
ws4.append(["PCI-DSS scope reduction, webhook verification, and transaction integrity standards"])
ws4.append([])
ws4.append(headers4)

for r in rows4:
    ws4.append(r)

ws4.merge_cells("A1:H1")
ws4["A1"].font = TITLE_FONT
ws4.merge_cells("A2:H2")
ws4["A2"].font = SUBTITLE_FONT

for col_num in range(1, len(headers4) + 1):
    cell = ws4.cell(row=4, column=col_num)
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

for row_idx in range(5, 5 + len(rows4)):
    sev_cell = ws4.cell(row=row_idx, column=6)
    if sev_cell.value in SEV_FONTS:
        sev_cell.font = SEV_FONTS[sev_cell.value]
        sev_cell.alignment = Alignment(horizontal="center", vertical="center")
        
    gate_cell = ws4.cell(row=row_idx, column=8)
    gate_cell.alignment = Alignment(horizontal="center", vertical="center")
    gate_cell.fill = PatternFill(start_color="FFF3CD", end_color="FFF3CD", fill_type="solid")

    for col_idx in range(1, len(headers4) + 1):
        c = ws4.cell(row=row_idx, column=col_idx)
        c.border = THIN_BORDER
        if col_idx in [2, 3, 4, 5, 7]:
            c.alignment = Alignment(wrap_text=True, vertical="top")

col_widths4 = [14, 26, 38, 28, 38, 14, 34, 24]
for i, w in enumerate(col_widths4, 1):
    ws4.column_dimensions[get_column_letter(i)].width = w

# Save workbook to project root
wb.save("d:/vikas project/Velneer_PreLaunch_Security_Audit_Checklist.xlsx")
print("Workbook saved successfully as Velneer_PreLaunch_Security_Audit_Checklist.xlsx")
