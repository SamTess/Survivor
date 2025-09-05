# Security Configuration for EmailService

## Summary of Changes

The security vulnerability related to `rejectUnauthorized: false` has been fixed by making this parameter configurable via the `EMAIL_REJECT_UNAUTHORIZED` environment variable.

### Changes Made

1. **Updated EmailConfig Interface**: Added optional `rejectUnauthorized` property
2. **Enhanced Security Logic**: TLS validation is enabled by default
3. **Environment Configuration**: New `EMAIL_REJECT_UNAUTHORIZED` variable
4. **Updated Documentation**: Secure configuration guide

### Recommended Configuration

**Production (secure):**
```env
EMAIL_REJECT_UNAUTHORIZED=true  # or simply omit this line
```

**Local development with self-signed certificates:**
```env
EMAIL_REJECT_UNAUTHORIZED=false  # only if necessary
```

### Behavior

- **If undefined or `true`**: TLS validation enabled (secure)
- **If `false`**: TLS validation disabled (vulnerable, for dev only)

### Security

⚠️ **Important**: Never use `EMAIL_REJECT_UNAUTHORIZED=false` in production as it exposes the application to man-in-the-middle attacks and email communication interception.

The new implementation follows security best practices by enabling TLS validation by default.
