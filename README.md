## 💡 Usage

1. **Register/Login** to access the platform
   - Sign up with username, email, and password
   - Choose "Remember Me" for extended sessions
   - Automatic session validation on return visits

2. **Upload files** (.txt, .docx) or paste text directly
   - Drag and drop file upload
   - Real-time file validation
   - Custom prompt support for AI summarization

3. **Generate summaries** using AI (consumes credits)
   - Credit validation before processing
   - AI-powered summarization with GPT-4 Turbo
   - Automatic credit deduction and refund on failures

4. **Save and manage** your summaries
   - Create, read, update, delete summaries
   - Status management (draft, published)
   - Role-based access control

5. **Admin users** can manage all users and system settings
   - Complete user CRUD operations
   - Credit management for all users
   - System-wide summary access# AI Text Summarization Platform

A full-stack web application that provides AI-powered text summarization with comprehensive user management, credit system, and advanced caching capabilities.

## 🚀 Features

- **AI-Powered Summarization**: Generate summaries using OpenAI GPT-4 Turbo
- **File Support**: Upload and process `.txt` and `.docx` files
- **Advanced Authentication**: Secure login system with JWT tokens and session management
- **Credit System**: Track and manage user credits for AI operations
- **Admin Dashboard**: Complete user management and system administration
- **Smart Caching**: Redis/In-memory caching with automatic fallback
- **Role-Based Access**: Admin and user permissions with secure endpoints
- **Session Management**: Persistent login with "Remember Me" functionality
- **Responsive Design**: Modern React frontend with Redux state management

## 🛠️ Tech Stack

### Frontend
- **React** - User interface
- **Redux** - State management
- **Modern UI Components** - Responsive design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Redis** - Caching layer (with in-memory fallback)
- **OpenAI API** - AI text summarization

### Additional Features
- **Advanced Authentication** - JWT tokens with secure HTTP-only cookies
- **Session Management** - Persistent login with configurable expiration
- **File Processing** - Background workers for file handling
- **Cron Jobs** - Automated user management tasks
- **Role-based Access** - Admin and user permissions
- **Smart Caching** - Redis with automatic in-memory fallback
- **Credit Management** - Real-time credit tracking and validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis (optional - will fallback to in-memory cache)
- OpenAI API key

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-summarization-platform.git
   cd ai-summarization-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/ai-summarizer
   
   # Redis Configuration (optional)
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=your_redis_password
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_key
   
   # Server Configuration
   PORT=5000
   ```

4. **Start the backend application**
   ```bash
   npm start
   ```
5. **Start the frontend application **
   ```bash
   npm run dev
   ```
## 🔗 API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/sign-in` - User login
- `POST /api/logout` - User logout
- `GET /api/check-session` - Session validation

### AI Summarization
- `POST /api/generate-summary` - Generate AI summary (with file upload)
- `POST /api/save-summaries` - Save summary to database
- `GET /api/summaries` - Get all summaries
- `PUT /api/update-summaries/:id` - Update summary
- `DELETE /api/summaries/:id` - Delete summary

### Admin Management
- `GET /api/getAllUsers` - Get all users
- `GET /api/getUserById` - Get user by ID
- `POST /api/createUser` - Create new user
- `PUT /api/updateUser/:userId` - Update user
- `DELETE /api/deleteUser/:userId` - Delete user

## 🎯 Key Features Details

### Advanced Authentication System
- **JWT-based Authentication**: Secure token-based user sessions
- **HTTP-only Cookies**: Tokens stored securely in HTTP-only cookies
- **Session Management**: Persistent login with "Remember Me" (7 days) or standard (30 minutes)
- **Role-based Authorization**: Admin and user role separation
- **Secure Logout**: Proper session cleanup and token invalidation

### Credit System
- Users start with initial credits (100 by default)
- Each AI summary generation consumes 1 credit
- Real-time credit validation before processing
- Automatic credit refund on AI service failures
- Credits can be managed by administrators
- System prevents operations when credits are exhausted

### Smart Caching Strategy
- **Redis-first Architecture**: Primary caching with Redis
- **Automatic Fallback**: In-memory caching when Redis is unavailable
- **Intelligent Cache Keys**: Role-based and user-specific caching
- **Auto-invalidation**: Cache updates on data modifications
- **Performance Optimization**: Reduced database queries for frequently accessed data

### File Processing
- Support for text and Word documents (.txt, .docx)
- Background processing for large files
- Automatic file cleanup after processing
- Error handling with proper file system cleanup

## 📊 Project Structure

```
├── controller/
│   ├── AuthController.js      # Authentication & session management
│   ├── SummaryGenerate.js     # AI summarization with caching
│   └── userManagement.js     # User CRUD operations (Admin)
├── middleware/
│   ├── uploadMiddleware.js    # File upload handling
│   ├── authMiddleware.js      # JWT authentication
│   └── roleMiddleware.js      # Role-based access control
├── schemaModel/
│   ├── AuthSchemaModel.js     # User model with roles & credits
│   └── SummaryModel.js        # Summary model with user relations
├── routes/
│   └── mainRoutes.js          # All API endpoints
├── uploads/                   # Temporary file storage
└── .env                       # Environment configuration
```

## 🔧 Backend Architecture

### Authentication Flow
1. **User Registration**: Username, email, password validation
2. **Login Process**: Credential verification with bcrypt
3. **Token Generation**: JWT with user ID and role
4. **Session Management**: HTTP-only cookies with configurable expiration
5. **Authorization**: Role-based middleware for protected routes

### Caching Implementation
- **Redis Connection**: Primary caching with connection monitoring
- **Fallback Strategy**: Automatic switch to in-memory cache on Redis failure
- **Cache Keys**: Structured with user roles and query parameters
- **Invalidation**: Smart cache updates on data modifications
- **Performance**: Reduced database queries by up to 80%

### Credit System Flow
1. **Credit Check**: Validate user credits before AI operations
2. **Credit Deduction**: Atomic credit reduction on successful operations
3. **Credit Refund**: Automatic refund on AI service failures
4. **Credit Management**: Admin can update user credits

## 🔒 Security Features

- **JWT-based Authentication**: Secure token-based user sessions
- **HTTP-only Cookies**: Tokens stored securely, inaccessible to JavaScript
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Role-based Access Control**: Admin and user permission separation
- **Input Validation**: Comprehensive request validation and sanitization
- **Secure File Upload**: Validated file types and automatic cleanup
- **Session Management**: Configurable token expiration and secure logout
- **CORS Protection**: Proper cross-origin resource sharing configuration
- **Environment Variables**: Sensitive data stored securely in environment files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT-4 Turbo API
- MongoDB for the database solution
- Redis for caching capabilities
- All contributors and supporters

---

**Made with ❤️ by Md Rubel, full stack mern developer and author**
