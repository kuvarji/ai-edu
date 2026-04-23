# Testing AI Education Platform

## Local Development Setup

### Backend
```bash
cd edutech/backend
# Create .env with required vars (see below)
poetry install
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd edutech/frontend
npm install
npm run dev
```

The frontend defaults to the deployed backend at `https://app-iiglqgra.fly.dev` if `VITE_API_URL` is not set. For local testing against deployed backend, just start the frontend.

## Required Environment Variables (Backend .env)
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — Any string for JWT signing
- `GEMINI_API_KEY` — Google Gemini API key for AI features
- `RAZORPAY_KEY_ID` — Razorpay test mode key ID (`rzp_test_...`)
- `RAZORPAY_KEY_SECRET` — Razorpay test mode key secret

## Devin Secrets Needed
- `MONGODB_URI` — MongoDB Atlas connection string
- `GEMINI_API_KEY` — Google Gemini API key
- `RAZORPAY_KEY_ID` — Razorpay API key ID
- `RAZORPAY_KEY_SECRET` — Razorpay API key secret

## Razorpay Payment Testing (Test Mode)

### Key Details
- Razorpay test mode uses `rzp_test_` prefixed keys
- No real money is charged in test mode
- The Razorpay checkout popup loads from `checkout.razorpay.com`

### Test Payment Flow
1. Navigate to `/membership` page
2. Click "Subscribe Now — ₹299"
3. Razorpay checkout popup opens
4. A "Contact details" dialog may appear — enter any 10-digit Indian mobile number (e.g., `9000090000`)
5. **Use Netbanking** (not Cards) for reliable test payments:
   - Click "Netbanking" in payment options
   - Select any bank (e.g., Bank of Baroda)
   - Click "Success" on the test bank page
6. Payment completes and membership activates

### Common Gotchas
- **Test card `4111 1111 1111 1111` may fail** with "International cards are not supported" — this happens when international payments are not enabled on the Razorpay test account. Use Netbanking instead.
- **Fly.io cold starts**: The deployed backend on Fly.io may take 10-30 seconds to wake up on first request. If signup/login hangs, wait or send a warm-up request first: `curl https://app-iiglqgra.fly.dev/auth/me`
- **Razorpay library removed**: The backend uses direct REST API calls via `httpx` instead of the `razorpay` Python library. This avoids `pkg_resources` errors on slim Docker images.
- **Receipt field limit**: Razorpay receipts must be ≤40 characters.

## Testing User Accounts
- Register new test users via `/signup` with any email
- Admin account: `admin@aiedu.com` / `admin123`
- After purchasing membership, user becomes "Pro" with unlimited AI features

## Deployment
- **Frontend**: Vercel (auto-deploys from GitHub)
- **Backend**: Fly.io (`app-iiglqgra.fly.dev`)
- Deploy backend: Use `deploy` tool with `command="backend"` and `dir="edutech/backend"`
