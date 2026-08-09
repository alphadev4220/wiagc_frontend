# WIAGC Website Deployment Guide

This package contains the complete source code for the Word In Action Global Conference registration website, hosted by Churches in the Cities.

## Included functions

- Public conference website
- Key speaker and host profiles
- International delegate registration form
- Accommodation and transport requests
- Unique confirmation numbers
- Individual QR codes
- QR verification pages
- Registration database structure
- Email confirmation integration
- Mobile and desktop layouts

## Recommended hosting

Use Cloudflare Workers with a Cloudflare D1 database. The application uses the Cloudflare Worker environment and Drizzle ORM.

## Requirements

- Node.js 22.13 or newer
- npm
- A Cloudflare account
- A registered `wiagc.com` domain
- A Resend account for confirmation emails

## Install the project

```bash
npm ci
```

## Database setup

1. Create a Cloudflare D1 database.
2. Bind the database to the application with the binding name `DB`.
3. Apply the SQL migration files in the `drizzle` folder in number order.

The application stores registrations, conference packages, travel requests, accommodation requests, confirmation numbers and email delivery status.

## Email setup

Add these two encrypted environment values in the hosting dashboard:

```text
RESEND_API_KEY=your_resend_api_key
CONFIRMATION_FROM=WIAGC <registration@wiagc.com>
```

Verify `wiagc.com` in Resend before sending confirmation emails.

## Build

```bash
npm run build
```

## Connect the domain

1. Add `wiagc.com` to Cloudflare.
2. Add `www.wiagc.com` as a custom domain for the deployed Worker.
3. Redirect `wiagc.com` to `https://www.wiagc.com`.
4. Confirm that HTTPS is active.

## Important files

- `app/page.tsx`: website and registration form
- `app/globals.css`: website design
- `app/api/register/route.ts`: registration processing
- `app/api/qr/route.ts`: QR code generation
- `app/verify/[code]/page.tsx`: confirmation verification
- `db/schema.ts`: registration database structure
- `drizzle/`: database migrations
- `lib/email.ts`: confirmation email service
- `public/`: speaker and host images

## Security

- Never place API keys inside source files.
- Store all keys as encrypted hosting secrets.
- Restrict database access to the deployed application.
- Export registration records regularly.
- Publish a privacy notice before accepting public registrations.

