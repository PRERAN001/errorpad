# ErrorPad

> **Write freely. Share easily.**

ErrorPad is a lightweight, collaborative notepad application that lets you create and share text pads instantly — no sign-up required. Just pick a pad name, write, and share the link.

🔗 **Live Demo**: [https://errorpad.vercel.app/](https://errorpad.vercel.app/)

---

## Features

- **No authentication** — open any pad by name and start writing
- **Persistent storage** — pads are saved to a database and retrieved on revisit
- **Shareable pads** — share a pad simply by sharing its URL
- **Clean, minimal UI** — distraction-free dark-themed editor
- **Instant save** — save your pad content with a single click

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
│   ├── model/
│   │   └── usermodel.js      # MongoDB schema
│   └── server.js             # API routes & server entry point
└── frontend/                 # React + Vite application
    └── src/
        ├── Pages/
        │   ├── Errorpadmainpage.jsx   # Home / pad creation page
        │   └── Res.jsx                # Pad editor page
        ├── context/
        │   └── Textcontext.jsx        # Global state context
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
port=5000
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
VITE_BASEURL=http://localhost:5000
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

---

## Deployment

The frontend is deployed on **Vercel** and the backend can be hosted on any Node.js-compatible platform (e.g., Render, Railway, Fly.io).

For frontend deployment on Vercel:
1. Import the `frontend/` folder as a Vercel project.
2. Set the `VITE_BASEURL` environment variable to your hosted backend URL.

---

## License

This project is open source. Feel free to use, modify, and distribute it.
