# ErrorPad

> **Write freely. Share easily.**

ErrorPad is a lightweight, collaborative notepad application that lets you create and share text pads instantly — no sign-up required. Pads can be password-protected, and each pad can also store downloadable files.

🔗 **Live Demo**: [https://errorpad.vercel.app/](https://errorpad.vercel.app/)

---

## Features

- **Protected pads** — optionally lock a pad with a password
- **Persistent storage** — pads are saved to MongoDB and retrieved on revisit
- **Shareable pads** — share a pad simply by sharing its URL
- **File uploads** — attach files to a pad and download them later
- **Modern UI** — polished dark editor with glassmorphism cards
- **Live save & sync** — content updates automatically in real time

---

## Tech Stack

### Frontend
| Technology | Version |
|---|---|
| React | 19 |
| Vite | 7 |
| TailwindCSS | 4 |
| React Router | 7 |
| Axios | 1 |

### Backend
| Technology | Version |
|---|---|
| Node.js | — |
| Express | 5 |
| MongoDB (Mongoose) | 9 |

---

## Project Structure

```
errorpad/
├── backend/                  # Express API server
│   ├── app.js                # App/server bootstrap
│   ├── config/               # DB + upload configuration
│   ├── controllers/          # Route handlers
│   ├── models/                # File metadata schema
│   ├── model/                # Pad schema
│   ├── routes/                # Express routers
│   ├── services/             # Socket + pad access helpers
│   ├── utils/                # Password hashing helpers
│   └── server.js             # Server entry point
└── frontend/                 # React + Vite application
    └── src/
    ├── components/       # Shared UI pieces
        ├── Pages/
        │   ├── Errorpadmainpage.jsx   # Home / pad creation page
        │   └── Res.jsx                # Pad editor page
    ├── services/         # API client
        ├── context/
        │   └── Textcontext.jsx        # Global state context
    └── utils/            # Helpers like file-size formatting
        └── App.jsx                    # Router setup
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the repository

```bash
git clone https://github.com/PRERAN001/errorpad.git
cd errorpad
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=8000
mongodburl=your_mongodb_connection_string
```

Start the backend server:

```bash
npm start
```

The server will start on `http://localhost:5000`.

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env.local` file inside `frontend/`:

```env
VITE_BASEURL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Reference

### Save pad content

```
POST /:padName
```

**Body** (JSON):
```json
{
  "usercontext": "Your text content here"
}
```

**Response**: Updated pad document.

---

### Get pad content

```
GET /:padName
```

**Response** (JSON):
```json
{
  "userquery": "padName",
  "usercontext": "Your text content here"
}
```

Returns `404` if the pad does not exist.

### Create protected pad

```
POST /api/pads/:padName/create
```

**Body** (JSON):
```json
{
  "protect": true,
  "password": "your-password"
}
```

### List pad files

```
GET /api/pads/:padName/files
```

### Upload file to pad

```
POST /api/pads/:padName/files
```

Send `multipart/form-data` with `file` and optionally `password`.

### Download file

```
GET /api/pads/:padName/files/:fileId/download
```

Protected pads require `?password=...`.

---

## Deployment

The frontend is deployed on **Vercel** and the backend can be hosted on any Node.js-compatible platform (e.g., Render, Railway, Fly.io).

For frontend deployment on Vercel:
1. Import the `frontend/` folder as a Vercel project.
2. Set the `VITE_BASEURL` environment variable to your hosted backend URL.

---

## License

This project is open source. Feel free to use, modify, and distribute it.
