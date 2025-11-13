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
- Multer (File Upload)

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

### AWS Elastic Beanstalk (Recommended for Production)

This application is configured for deployment on AWS Elastic Beanstalk with Docker Compose.

#### Prerequisites

- AWS Account
- EB CLI installed (`pip install awsebcli`)
- Docker and Docker Compose configured

#### Deployment Steps

1. **Initialize Elastic Beanstalk**
```bash
eb init -p docker waffle-chat --region ap-southeast-2
```

2. **Create Environment with Load Balancer**
```bash
eb create waffle-chat-env --instance-type t2.small --elb-type application
```

⚠️ **CRITICAL**: Always create with load balancer and enable sticky sessions from the start!

3. **Configure Environment Variables**
```bash
eb setenv \
  PORT=5000 \
  MONGO_URI="your-mongodb-uri" \
  NODE_ENV=production \
  JWT_SECRET="your-secret" \
  CLIENT_URL="http://your-domain.com" \
  CLOUDINARY_CLOUD_NAME="your-cloud-name" \
  CLOUDINARY_API_KEY="your-api-key" \
  CLOUDINARY_API_SECRET="your-api-secret"
```

4. **Enable Sticky Sessions** (REQUIRED for Socket.IO)
   - Go to AWS Console → Elastic Beanstalk → Configuration → Load Balancer
   - Edit default process
   - Enable **Stickiness** → `Load balancer generated cookie`
   - Set **Cookie duration**: `86400` (1 day)
   - Save and apply

5. **Deploy Application**
```bash
# Create deployment package
zip -r deploy.zip . -x "*.git*" "*node_modules/*" "*.env" "*.zip"

# Deploy
eb deploy
```

6. **Configure HTTPS** (Required for microphone access)
   - Request SSL certificate in AWS Certificate Manager
   - Add HTTPS listener on port 443 in Load Balancer configuration
   - Enable HTTP → HTTPS redirect

#### Common Deployment Issues & Solutions

##### Issue 1: CSP Blocking Resources
**Symptoms**: Image previews not showing, inline styles blocked, WebSocket connections failing

**Solution**: Update `nginx.conf` to include proper CSP directives:
```nginx
# Add blob: to img-src for image previews
set $CSP_image "img-src 'self' data: blob: https://res.cloudinary.com";

# Add media-src for audio/video
set $CSP_media "media-src 'self' blob: data: https://res.cloudinary.com";

# Include in final CSP
set $CSP "default-src 'self'; ${CSP_script}; ${CSP_style}; ${CSP_image}; ${CSP_media}; ${CSP_connect}; ${CSP_font}; ${CSP_frame}; ${CSP_object}; ${CSP_base}";
```

##### Issue 2: Socket.IO Connection Fails with Load Balancer
**Symptoms**: 500 errors, WebSocket upgrade fails, real-time features not working

**Root Cause**: Without sticky sessions, each request hits a different instance. Socket.IO's multi-step handshake breaks because:
- Step 1 (polling): Goes to Instance A → Creates session
- Step 2 (WebSocket upgrade): Goes to Instance B → Doesn't know about session → FAILS

**Solution**: ALWAYS enable sticky sessions (see step 4 above)

**Why it works**: Sticky sessions use cookies (AWSALB) to route all requests from same user to same instance, maintaining Socket.IO connection state.

##### Issue 3: Deployment Timeout
**Symptoms**: `Command execution completed on all instances. Summary: [Successful: 0, TimedOut: 1]`

**Solutions**:
1. Increase timeout: `eb deploy --timeout 20`
2. Terminate stuck instance via EC2 Console (load balancer auto-creates new one)
3. Restart environment: `eb restart`
4. If persistent, create new environment with clean state

##### Issue 4: Corrupted Dockerfile in Deployment
**Symptoms**: `ERROR: failed to solve: dockerfile parse error: unknown instruction: pax_global_header`

**Cause**: Archive created with tar before zip (double-archiving)

**Solution**: Create ZIP directly without tar:
```bash
zip -r deploy.zip . -x "*.git*" "*node_modules/*" "*.env"
```

Never do: `tar -czf project.tar.gz . && zip deploy.zip project.tar.gz`

##### Issue 5: SSM Agent Not Online / Can't SSH
**Symptoms**: Session Manager shows "SSM Agent is not online"

**Solutions**:
1. Use AWS Console → EC2 → Instance Connect (alternative to SSM)
2. Add EC2 key pair to environment:
   - Configuration → Security → Edit → Select EC2 key pair
   - Apply (will recreate instance)
3. For logs without SSH: `eb logs --all`

##### Issue 6: Missing Environment Variable Warnings
**Symptoms**: `The "CLIENT_URL" variable is not set. Defaulting to a blank string`

**Solution**: Set via EB CLI or Console:
```bash
eb setenv CLIENT_URL=https://your-domain.com
```

##### Issue 7: Microphone Access Denied
**Symptoms**: Browser blocks microphone access with "Not allowed" error

**Cause**: Modern browsers require HTTPS for microphone/camera access

**Solution**: Configure HTTPS with AWS Certificate Manager (see step 6 above)

#### Architecture Notes

- **nginx**: Serves frontend static files, proxies API and Socket.IO to backend
- **backend**: Node.js/Express container on port 5000
- **Load Balancer**: Routes traffic with sticky sessions for Socket.IO
- **MongoDB**: External (MongoDB Atlas recommended)
- **Cloudinary**: External for image/audio storage

#### Health Checks

Load balancer checks path `/` on port 80 (nginx). For better monitoring, add health endpoint to backend:

```javascript
// backend/server.js
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

Then configure load balancer health check path to `/api/health`.

#### Monitoring

```bash
# Check environment status
eb health

# View logs
eb logs --stream

# Check running containers
eb ssh
sudo docker ps
sudo docker logs waffle-chat-backend
```

### Alternative: Traditional Deployment

#### Backend

1. Set environment variables
2. Ensure MongoDB is accessible
3. Run `npm start` or use PM2

#### Frontend

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
