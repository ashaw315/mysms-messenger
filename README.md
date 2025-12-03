# MySMS Messenger

A full-stack SMS messaging application that allows users to sign up, log in, send SMS messages via Twilio, and view real-time delivery status updates. Built as an interview project to demonstrate full-stack development capabilities.

**Backend:** Rails 7 API + Mongoid (MongoDB) + Devise authentication + Twilio integration
**Frontend:** Angular 21 SPA with cookie-based authentication
**Deployment:** Backend on Render, Frontend on Netlify

Link: [https://mysms-messenger.netlify.app/]([URL](https://mysms-messenger.netlify.app/))

---

## 🏗 Tech Stack

### Backend

- **Ruby 3.2.2**
- **Ruby on Rails 7.1.5** (API-only)
- **Mongoid 9.0** (MongoDB ODM)
- **Devise** (cookie-based authentication)
- **Twilio REST API** (SMS sending + status callbacks)
- **RSpec** (testing)

### Frontend

- **Angular 21** (standalone components)
- **TypeScript 5.9**
- **HttpClient** (API communication with `withCredentials: true`)

### Deployment

- **Backend:** Render (Dockerized Rails app at `https://mysms-messenger-0b5d.onrender.com`)
- **Frontend:** Netlify (Angular SPA at `https://mysms-messenger.netlify.app`)
- **Database:** MongoDB Atlas

---

## 📂 Project Structure

```
mysms-messenger/
├── backend/                # Rails API (Mongo + Twilio + Devise)
│   ├── app/
│   ├── config/
│   ├── spec/
│   ├── Gemfile
│   ├── Gemfile.lock
│   └── ...
├── frontend/               # Angular SPA
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── ...
└── README.md
```

---

## ✨ Features

### 1. User Authentication (Devise + Angular)

- **User registration:** `POST /users.json` creates a new user account
- **Login:** `POST /users/sign_in.json` establishes a session via cookie
- **Logout:** `DELETE /users/sign_out.json` destroys the session
- **Session check:** `GET /users.json` returns current user details
- Angular `AuthService` manages authentication state via `BehaviorSubject` observable

### 2. Sending SMS Messages

- User submits a message form (recipient number + content) in Angular UI
- Angular `MessagesService` posts to `POST /api/messages.json`
- Rails `Api::MessagesController` validates authentication and creates message record
- `TwilioSmsSender` service sends the SMS via Twilio REST API
- Message persisted with:
  - `twilio_sid` (Twilio message identifier)
  - `status` (initial status from Twilio: "queued")
  - `recipient_number`, `content`, `user_id`
  - Timestamps (`created_at`, `updated_at`)

### 3. Real-time Delivery Status Updates

- **Twilio callbacks:** When message status changes (queued → sent → delivered), Twilio sends webhook to `POST /api/twilio/status_callback`
- **Rails callback handler:** `Api::TwilioCallbacksController` receives `MessageSid`, `MessageStatus`, and optional `ErrorMessage`/`ErrorCode`
- **Status updates:** Controller finds message by `twilio_sid` and updates `status` and `error_message` fields
- **Frontend polling:** Angular polls `GET /api/messages.json` every 10 seconds to fetch updated message list
- **UI updates:** User sees status changes in real-time without manual page refresh (queued → sent → delivered → failed)

### 4. Per-user Message History

- Each message is associated with a `User` via Mongoid `belongs_to` relationship
- `GET /api/messages.json` returns only messages belonging to the authenticated user
- Messages ordered by `created_at` (most recent first)

### 5. Testing

- **Model specs** for User and Message validation
- **Request specs** for API endpoints
- **Service specs** for `TwilioSmsSender` using test doubles to mock Twilio API

---

## 🔐 Authentication & Session Behavior

### How Authentication Works

This application uses **Devise cookie-based sessions** for authentication:

1. **Login flow:**
   - User submits email/password via Angular `LoginComponent`
   - Angular posts to `POST /users/sign_in.json` with `withCredentials: true`
   - Rails authenticates via Devise and sets a session cookie: `_mysms_backend_session`
   - Cookie is returned to the browser with `Secure; HttpOnly; SameSite=None` flags

2. **Subsequent requests:**
   - Angular sends all requests with `withCredentials: true`
   - Browser includes the `_mysms_backend_session` cookie
   - Rails reads the session and sets `current_user`
   - Controllers require authentication via `before_action :authenticate_user!`

### Current Deployment Setup

- **Frontend:** Hosted on Netlify at `https://mysms-messenger.netlify.app`
- **Backend:** Hosted on Render at `https://mysms-messenger-0b5d.onrender.com`
- **CORS:** Backend configured to allow Netlify origin with `credentials: true`
- **Session cookie:** Configured with `same_site: :none` and `secure: true` for cross-origin support

### ⚠️ Known Limitation: Session Persistence on Page Reload

**Current behavior:**
- Login works successfully and the session cookie is set
- User can send messages and interact with the app
- **On full page reload, the user appears logged out**

**Why this happens:**

Because the frontend and backend are deployed on **different domains** (Netlify vs. Render), the session cookie becomes a **third-party (cross-site) cookie**.

Modern browsers (especially Safari, Firefox, and Chrome with privacy settings) **block or aggressively clear third-party cookies** to protect user privacy and prevent tracking. This means:
- The cookie may not be sent on subsequent requests
- The cookie may be deleted when the user refreshes the page
- The backend sees no session, so `current_user` is `nil`
- The user appears logged out

**This is NOT a bug in the Rails or Angular code.** It's a consequence of:
1. Modern browser privacy policies (ITP, ETP, third-party cookie blocking)
2. Cross-origin deployment architecture (Netlify + Render on different domains)

**Local development note:**

When running both frontend and backend on `localhost` (even different ports), cookies behave more like **first-party cookies**, so the session persistence issue is less pronounced. The problem manifests primarily in the production deployment.

---

## 🏭 Production Notes: What I'd Do Differently

For this interview project, I chose to keep Devise cookie sessions and focus on building the complete Twilio integration with status callbacks and real-time UI updates. However, for a production system deployed across separate domains, I would implement one of these solutions:

### Option 1: Same-Site Deployment (Recommended for simplicity)

**Deploy both frontend and backend under the same domain:**
- Serve the Angular app and Rails API from the same root domain (e.g., `app.example.com`)
- Use a reverse proxy (nginx, Cloudflare) or subdirectories:
  - `app.example.com/` → Angular static files
  - `app.example.com/api` → Rails backend
- Alternatively, serve the Angular build from the Rails public directory

**Benefits:**
- Session cookie becomes **first-party** and works reliably across all browsers
- No changes needed to authentication logic
- Simple, proven architecture
- Better security (fewer CORS complications)

**Implementation:**
- Configure Rails to serve static files from `public/` (Angular dist output)
- Or use a reverse proxy to route `/api` to Rails and `/` to static files

### Option 2: Token-Based Authentication (Recommended for microservices)

**Switch from cookie sessions to JWT or token-based auth:**
- Use a gem like `devise-jwt` or implement custom token generation
- On login, backend returns a JWT token in the response body
- Frontend stores token in `localStorage` or `sessionStorage`
- Include token in `Authorization: Bearer <token>` header on all requests
- Backend verifies token and sets `current_user` from decoded payload

**Benefits:**
- Works seamlessly across any domain configuration
- No reliance on cookies or `SameSite` attributes
- Scales well for mobile apps, SPAs, and microservices
- Fine-grained token expiration control

**Tradeoffs:**
- Slightly more complex implementation
- Need to handle token refresh/expiration
- XSS risk if not careful with storage (httpOnly cookies with CSRF token is another approach)

### Why I Chose Cookies for This Project

1. **Simplicity:** Devise handles sessions out-of-the-box
2. **Security:** HttpOnly cookies can't be accessed by JavaScript (XSS protection)
3. **Focus:** Wanted to demonstrate Twilio integration, callbacks, and real-time status updates
4. **Interview context:** Shows awareness of the tradeoff and ability to articulate production solutions

In a real production scenario, I'd recommend **Option 1** (same-site deployment) for simpler apps or **Option 2** (JWT) for distributed architectures or mobile API support.

---

## 🛠 Running Locally

### Prerequisites

- **Ruby 3.2.2** (check with `ruby -v`)
- **Bundler** (`gem install bundler`)
- **Node.js & npm** (for Angular CLI)
- **Angular CLI** (`npm install -g @angular/cli`)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Twilio account** (with phone number for SMS)

### Backend Setup (Rails API)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   bundle install
   ```

3. **Configure environment variables:**

   Create `backend/.env` with:
   ```bash
   # Twilio credentials
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_FROM_NUMBER=+15551234567
   TWILIO_STATUS_CALLBACK_URL=http://localhost:3000/api/twilio/status_callback

   # MongoDB (local development)
   MONGODB_URI=mongodb://localhost:27017/mysms_backend_development

   # Devise secret
   DEVISE_SECRET_KEY=your-secret-key-here
   ```

4. **Ensure MongoDB is running:**
   ```bash
   # If using local MongoDB
   brew services start mongodb-community  # macOS with Homebrew
   # OR
   sudo systemctl start mongod  # Linux
   ```

5. **Start the Rails server:**
   ```bash
   rails s -p 3000
   ```

   Backend API is now running at `http://localhost:3000`

6. **Run tests (optional):**
   ```bash
   bundle exec rspec
   ```

### Frontend Setup (Angular)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment (already set for local development):**

   Check `frontend/src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     backendBaseUrl: 'http://localhost:3000',
     apiBaseUrl: 'http://localhost:3000/api'
   };
   ```

4. **Start the Angular development server:**
   ```bash
   ng serve --port 4200
   ```

   Frontend is now running at `http://localhost:4200`

5. **Open browser:**
   Navigate to `http://localhost:4200` and you should see the login screen

### Local Development Notes

- **CORS:** Backend is configured to allow `http://localhost:4200` origin
- **Cookies:** In local development (`localhost → localhost`), cookies behave more like first-party cookies, so session persistence typically works across page reloads
- **Twilio callbacks:** For local development, Twilio status callbacks won't work unless you expose your local server via ngrok or similar tunneling service
- **Database:** MongoDB creates collections automatically when you create your first user/message

---

## 📡 Twilio Configuration

### Required Twilio Setup

1. **Create a Twilio account** at [twilio.com](https://www.twilio.com)

2. **Purchase a phone number** capable of sending SMS

3. **Get your credentials** from the Twilio Console:
   - Account SID (starts with `AC...`)
   - Auth Token

4. **Configure status callbacks** (for production):
   - In Twilio Console → Phone Numbers → your number
   - Set "A Message Comes In" webhook to: `https://mysms-messenger-0b5d.onrender.com/api/twilio/status_callback`
   - Or configure `TWILIO_STATUS_CALLBACK_URL` environment variable (preferred method)

### Environment Variables

The backend requires these Twilio environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_FROM_NUMBER` | Your Twilio phone number (E.164 format) | `+15551234567` |
| `TWILIO_STATUS_CALLBACK_URL` | Full URL for status callbacks (optional) | `https://your-backend.onrender.com/api/twilio/status_callback` |

### How Status Callbacks Work

When `TWILIO_STATUS_CALLBACK_URL` is configured:

1. Twilio sends SMS and immediately returns status (typically "queued")
2. As the message progresses through Twilio's system, Twilio makes POST requests to the callback URL with updated status:
   - `queued` → Message accepted by Twilio
   - `sent` → Message sent to carrier
   - `delivered` → Message delivered to recipient
   - `failed` → Message failed (with error code/message)
3. The `Api::TwilioCallbacksController` receives these webhooks and updates the message record in MongoDB
4. Angular polls the messages endpoint and displays updated status in the UI

**Note:** Status callbacks require a publicly accessible URL. In local development, you can use [ngrok](https://ngrok.com) to expose your local server.

---

## 🔗 API Endpoints

### Authentication

| Method | Path                | Description                          | Auth Required |
|--------|---------------------|--------------------------------------|---------------|
| POST   | `/users.json`       | Create user (registration)           | No            |
| POST   | `/users/sign_in.json` | Log in (sets session cookie)       | No            |
| DELETE | `/users/sign_out.json` | Log out (destroys session)        | Yes           |
| GET    | `/users.json`       | Get current user details             | Yes           |

### Messages

| Method | Path                  | Description                                    | Auth Required |
|--------|-----------------------|------------------------------------------------|---------------|
| GET    | `/api/messages.json`  | List authenticated user's messages (newest first) | Yes       |
| POST   | `/api/messages.json`  | Send an SMS via Twilio + store message record  | Yes           |

### Twilio Webhooks

| Method | Path                          | Description                              | Auth Required |
|--------|-------------------------------|------------------------------------------|---------------|
| POST   | `/api/twilio/status_callback` | Receive status updates from Twilio       | No (CSRF skip)|

### POST /api/messages Request Example

```json
{
  "message": {
    "recipient_number": "+1234567890",
    "content": "Hello from MySMS!"
  }
}
```

### Response Example

```json
{
  "_id": "67923ec819db4e1082016641",
  "recipient_number": "+1234567890",
  "content": "Hello from MySMS!",
  "twilio_sid": "SM1234567890",
  "status": "queued"
}
```

---

## 🚀 Deployment

### Current Production Deployment

**Frontend:** `https://mysms-messenger.netlify.app` (Netlify)
**Backend:** `https://mysms-messenger-0b5d.onrender.com` (Render)
**Database:** MongoDB Atlas

### Backend Deployment (Render)

1. **Platform:** Render Web Service with Docker

2. **Configuration:**
   - **Dockerfile:** `backend/Dockerfile` (Ruby 3.2.2-slim base image)
   - **Build:** Automatically builds from Dockerfile
   - **Port:** 3000
   - **Health check:** `GET /up` (Rails health endpoint)

3. **Required Environment Variables on Render:**
   ```bash
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_FROM_NUMBER=+15551234567
   TWILIO_STATUS_CALLBACK_URL=https://mysms-messenger-0b5d.onrender.com/api/twilio/status_callback

   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mysms_backend_production

   DEVISE_SECRET_KEY=your-production-secret-key
   RAILS_ENV=production
   ```

4. **CORS Configuration:**
   - Configured in `backend/config/initializers/cors.rb`
   - Allows `https://mysms-messenger.netlify.app` origin
   - Credentials enabled for cookie-based auth

5. **Session Configuration:**
   - Cookie: `_mysms_backend_session`
   - `SameSite=None; Secure=true` for cross-origin support

### Frontend Deployment (Netlify)

1. **Platform:** Netlify static site hosting

2. **Build Settings:**
   - **Base directory:** `frontend`
   - **Build command:** `npm install && npm run build -- --configuration production`
   - **Publish directory:** `frontend/dist/frontend/browser`

3. **Configuration:**
   - **Routing:** `netlify.toml` configures SPA routing (all routes → `/index.html`)
   - **Environment:** Production build uses `environment.prod.ts` with Render backend URL

4. **Environment Variables:**
   - None required (backend URLs are baked into the production build via `environment.prod.ts`)

### Database Deployment (MongoDB Atlas)

1. **Platform:** MongoDB Atlas (cloud-hosted MongoDB)

2. **Configuration:**
   - Connection string stored in `MONGODB_URI` environment variable on Render
   - Database: `mysms_backend_production`
   - Collections: `users`, `messages` (created automatically by Mongoid)

3. **Network Access:**
   - Configured to allow connections from Render IP addresses
   - Or use "Allow access from anywhere" (0.0.0.0/0) for simplicity (with strong authentication)

### Deployment Flow

1. **Backend changes:**
   - Push to GitHub → Render auto-deploys from main branch
   - Docker build → Rails app starts → Health check passes

2. **Frontend changes:**
   - Push to GitHub → Netlify auto-deploys from main branch
   - Angular production build → Static files deployed

3. **Database migrations:**
   - MongoDB is schemaless via Mongoid
   - No explicit migrations needed; models define structure
