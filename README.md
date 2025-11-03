# Waffle Chat 🧇💬

A full-stack real-time chat application with support for private and group conversations.

## Features

✅ User Authentication (Register/Login with JWT)  
✅ Private Chat (1-on-1)  
✅ Group Chat (Multiple participants)  
✅ Real-time Messaging via Socket.IO  
✅ Typing Indicators  
✅ Online User Status  
✅ Message History  
✅ Modern Responsive UI

## Tech Stack

### Backend

- Node.js + Express
- MongoDB + Mongoose
- Socket.IO (WebSocket)
- JWT Authentication
- Cloudinary (Image uploads)

### Frontend

- React 19 + TypeScript
- Redux Toolkit (State management)
- Socket.IO Client
- Tailwind CSS
- Vite

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/098ff/waffle-chat.git
cd waffle-chat
```


### 2. Setup Backend

```bash
cd backend
npm install
```

# Create .env file

`cp config/config.env.example config/config.env`

Edit config/config.env with your MongoDB URI, JWT_SECRET, etc.

# Start backend server

`npm run dev`


Backend will run on http://localhost:5000

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

# Create .env file

cp .env.example .env

# Edit .env if needed (default: http://localhost:5000)

# Start frontend dev server

`npm run dev`


Frontend will run on http://localhost:5173

## Usage

1. **Register** - Create a new account at `/register`
2. **Login** - Sign in at `/login`
3. **Create Chat** - Click ➕ to create a private or group chat
4. **Send Messages** - Select a chat and start messaging in real-time

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/check` - Check auth status

### Chats

- `POST /api/chats` - Create chat (private/group)
- `GET /api/chats` - Get user's chats
- `GET /api/chats/:id/messages` - Get chat messages
- `POST /api/chats/:id/messages` - Send message (REST fallback)

### Messages

- `GET /api/messages/contacts` - Get all contacts
- `GET /api/messages/chats` - Get chat partners
- `GET /api/messages/:userId` - Get messages with user

## Socket.IO Events

### Client → Server

- `join-room` - Join chat room
- `leave-room` - Leave chat room
- `message:create` - Send message
- `typing` - Typing indicator

### Server → Client

- `message:new` - New message received
- `typing` - User typing
- `getOnlineUsers` - Online users list
- `member:joined` - Member joined room
- `member:left` - Member left room

## Project Structure

```
waffle-chat/
├── backend/
│ ├── config/ # DB, Socket, Cloudinary config
│ ├── controllers/ # Route handlers
│ ├── middleware/ # Auth middleware
│ ├── models/ # Mongoose schemas
│ ├── routes/ # API routes
│ └── server.js # Entry point
├── frontend/
│ └── src/
│ ├── pages/ # React pages
│ ├── services/ # API & Socket services
│ ├── store/ # Redux store
│ ├── types/ # TypeScript types
│ └── App.tsx # Main app
└── README.md
```

## Testing

### Backend

Test backend with the provided socket test script:
```bash
node backend/tests/test-socket.js http://localhost:5000 <JWT_TOKEN> <CHAT_ID>
```

Or use Postman/curl for REST API testing.

### Frontend

```bash
cd frontend
npm run build # Check for TypeScript errors
```

## Deployment

### Backend

1. Set environment variables
2. Ensure MongoDB is accessible
3. Run `npm start` or use PM2

### Frontend

1. Build: `npm run build`
2. Serve dist/ folder with nginx/vercel/netlify

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT

## Author
- [Chanatda Konchom](https://github.com/098ff)
- [Chatrin Yoonchalard](https://github.com/Mysterioucz)
- [Chayut Archamongkol]()
- [Suvijak]()
