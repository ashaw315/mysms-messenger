# MySMS Messenger

A simple full-stack SMS messaging application built as part of a coding exercise for City Hive.

The project includes:

- A **Ruby on Rails API backend** (MongoDB + Devise + Twilio)
- An **Angular frontend** that sends and lists messages
- Authenticated messaging
- Real SMS sending via Twilio
- Clean project structure for easy review

---

## 🏗 Tech Stack

### Backend (Rails API)

- Ruby on Rails (API-only)
- MongoDB via Mongoid
- Devise authentication
- Twilio REST API for sending SMS
- RSpec for testing

### Frontend (Angular)

- Angular 17 (CLI-generated)
- TypeScript
- HttpClient for API requests
- Basic components & services

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

## 🔐 Features

### Authentication

- User registration
- Login + logout
- Authenticated message actions

### Messaging

- Send SMS directly through the API using Twilio
- Store messages in MongoDB
- Only return messages belonging to the logged-in user
- Store Twilio details:
  - `twilio_sid`
  - `status` (queued/sent/delivered/failed)
  - `error_message`

### Testing

- Model specs
- Request specs
- Service specs using Twilio test doubles

---

## ⚙️ Backend Setup (Rails API)

### Prerequisites

- Ruby (match version in `.ruby-version` or Gemfile)
- Bundler
- MongoDB installed or MongoDB Atlas
- Twilio account

### Environment Variables

Create `backend/.env` or export environment variables:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM_NUMBER=+15551234567

DEVISE_SECRET_KEY=your-secret-key-here
```

### Install dependencies

```bash
cd backend
bundle install
```

### Run the server

```bash
rails s
```

API is now at: `http://localhost:3000`

### Run RSpec tests

```bash
bundle exec rspec
```

---

## 🌐 Frontend Setup (Angular)

### Install dependencies

```bash
cd frontend
npm install
```

### Development server

```bash
ng serve
```

Frontend is now at: `http://localhost:4200`

### API URL Configuration

Update `frontend/src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api'
};
```

---

## 🔗 API Endpoints

### Authentication

| Method | Path              | Description  |
|--------|-------------------|--------------|
| POST   | /users            | Create user  |
| POST   | /users/sign_in    | Log in       |
| DELETE | /users/sign_out   | Log out      |

### Messages

| Method | Path          | Description                        |
|--------|---------------|------------------------------------|
| GET    | /api/messages | List authenticated user's messages |
| POST   | /api/messages | Send an SMS + store metadata       |

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

### Backend (Rails)

Suggested platforms:

- Render
- Fly.io
- Railway

You will need to set:

- MongoDB connection string
- Twilio environment variables
- Devise secret key

### Frontend (Angular)

Suggested platforms:

- Netlify
- Vercel
- GitHub Pages

Build command:

```bash
ng build --configuration production
```

Deploy the contents of `frontend/dist/frontend/`.