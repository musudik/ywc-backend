🧠 App Summary – Backend (yourwealthcoach.de)
🔍 Overview
yourwealthcoach.de is a financial coaching platform that connects Coaches with multiple Clients to manage their personal financial services. Each client can access multiple business modules such as real estate, insurance, loans, tax returns, and more. Coaches supervise their clients' progress and submissions through forms, file uploads, and automated exports.

The backend is designed as a modular, secure, scalable Node.js service, using Prisma ORM, Firebase for storage, and PostgreSQL as the primary database. It also includes scheduler jobs, integrations with third-party APIs, and advanced features like PDF/Excel exports, QR code generation, and chatbot integration.


# Backend Summary  yourwealthcoach.de

yourwealthcoach.de is a financial coaching platform with two primary user roles: Coaches and Clients. Coaches manage multiple clients and their financial data across several business domains. Each client can submit dynamic forms, upload documents, and communicate with their coach.

Backend Modules & Responsibilities:

1. Authentication & Authorization:
- Firebase Auth based login with role-based access (Coach or Client).
- Middleware to decode token and enforce permissions.

2. Users Module:
- Shared user table with Coach/Client role.
- Clients linked to Coaches via foreign key.

3. Clients Module:
- CRUD for client data.
- Clients can manage forms, files, and see submissions.

4. Coaches Module:
- Dashboard to view and manage multiple clients.
- Download exports and monitor statuses.

5. Forms Module:
- Dynamic form schema (Zod/JSON-based) per business type.
- CRUD operations and validation.

6. File Uploads:
- Firebase Storage integration.
- File linkage to clients, forms, and modules.

7. Business Modules:
- immobilion (Real Estate), insurances, loans, electricity, tax returns, sanuspay, gems.
- APIs for form templates, logic, and summaries.

8. PDF & Excel Export:
- Uses pdf-lib and exceljs to export filled forms.

9. QR Code Generation:
- Generates QR codes for form links.

10. Scheduler:
- Periodic email reminders, syncs, status updates.

11. Chatbot:
- LLM-based assistant for client queries.

12. Integrations:
- Firebase, DATEV, SanusPay (future), modular API support.

13. i18n:
- i18next backend for sending translated content.

Tech Stack:
- Fastify + TypeScript
- PostgreSQL (Prisma ORM)
- Firebase Storage + Auth
- pdf-lib, exceljs, qrcode, node-cron, i18next
- CI/CD via GitHub Actions, deployed on Vercel/Render/Docker

Security:
- Token validation, role-based access, file permission rules, HTTPS enforced, signed URLs.

Scalable, modular, and designed for extensibility and third-party integrations.


🗃️ Data Structure Highlights
Users Table
| id | name | email | role (coach/client) | coach_id (nullable) |

Forms Table
| id | client_id | business_type | form_data (JSON) | status | created_at |

Files Table
| id | form_id | url | file_type | uploaded_by |



⚙️ Technical Stack
Component	Tech
Language	TypeScript
Runtime	Node.js
Framework	Fastify (or Express)
Database	PostgreSQL via Prisma ORM
File Storage	Firebase Storage
Auth	Firebase Authentication
Scheduler	node-cron
PDF/Excel	pdf-lib, exceljs
QR Codes	qrcode
Chatbot	OpenAI API or DialogFlow
i18n	i18next
Deployment	Railway / Render / Vercel / Docker
CI/CD	GitHub Actions



🔐 Security Features
Firebase token validation for secure access

Role-based route guards

File access restricted to form owners or their coach

Data encryption in transit (HTTPS)

Secure signed URLs for Firebase Storage access

📈 Scalability Considerations
Stateless backend → scalable via containers

Firebase handles file load off the backend

PostgreSQL optimized via indexing + Prisma performance

Modular architecture allows service splitting in future



===================================

CREATE USER yourwealthcoach WITH ENCRYPTED PASSWORD 'yourwealthcoach';
ALTER USER yourwealthcoach WITH SUPERUSER;
GRANT ALL PRIVILEGES ON DATABASE yourwealthcoach TO yourwealthcoach;
SELECT * FROM pg_user WHERE usename = 'yourwealthcoach';


git clone https://github.com/xxx/yourwealthcoach-backend.git
cd yourwealthcoach-backend

pnpm init -y  # or npm / yarn
pnpm add fastify @prisma/client zod firebase-admin pdf-lib exceljs qrcode i18next node-cron
pnpm add -D prisma typescript tsx ts-node @types/node
npx prisma init

 npx prisma init

✔ Your Prisma schema was created at prisma/schema.prisma
  You can now open it in your favorite editor.


Next steps:
1. Set the DATABASE_URL in the .env file to point to your existing database. If your database has no tables yet, read https://pris.ly/d/getting-started
2. Set the provider of the datasource block in schema.prisma to match your database: postgresql, mysql, sqlite, sqlserver, mongodb or cockroachdb.
3. Run prisma db pull to turn your database schema into a Prisma schema.
4. Run prisma generate to generate the Prisma Client. You can then start querying your database.
5. Tip: Explore how you can extend the ORM with scalable connection pooling, global caching, and real-time database events. Read: https://pris.ly/cli/beyond-orm     

More information in our documentation:
https://pris.ly/d/getting-started

# YourWealthCoach Backend

Backend service for yourwealthcoach.de platform that connects Coaches with multiple Clients to manage their personal financial services.

## Authentication System

The authentication system is built using Firebase Authentication combined with a custom database layer using Prisma to store extended user information.

### Key Features

- Firebase Authentication for secure user management
- JWT token-based authentication
- Role-based authorization
- Email verification
- Password reset functionality
- User profile management

### API Endpoints

#### Auth Routes

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/verify-email` - Verify user's email
- `POST /api/auth/forgot-password` - Send password reset email
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/firebase-webhook` - Firebase webhook endpoint

### Authentication Flow

1. **Registration**:
   - User registers with email/password
   - A Firebase user is created
   - A corresponding user record is created in our database
   - Verification email is sent to the user

2. **Login**:
   - User logs in with Firebase Auth credentials
   - Firebase returns a JWT token
   - Frontend stores the token and sends it with subsequent requests

3. **Authorization**:
   - The `authenticate` middleware verifies the JWT token
   - User information is loaded from the database with role information
   - The `requireRole` middleware can be used to restrict access based on user roles

### Technical Implementation

- `AuthService`: Handles user authentication, registration, and profile management
- `AuthController`: Exposes API endpoints for authentication operations
- `authenticate` middleware: Verifies JWT tokens and loads user information
- `requireAuth` middleware: Ensures the user is authenticated
- `requireRole` middleware: Restricts access based on user roles

## Getting Started

### Prerequisites

- Node.js 14+
- PostgreSQL
- Firebase project

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-username/ywc-backend.git
   cd ywc-backend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file with the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/ywc-backend?schema=public"
   PORT=3000
   FIREBASE_PROJECT_ID="your-firebase-project-id"
   FIREBASE_STORAGE_BUCKET="your-firebase-storage-bucket"
   ```

4. Generate Prisma client
   ```
   npm run prisma:generate
   ```

5. Run migrations
   ```
   npm run prisma:migrate
   ```

6. Start the server
   ```
   npm run dev
   ```

## Development

- `npm run dev` - Start the development server
- `npm run build` - Build the project
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Project Structure

The backend follows a modular approach with the following structure:

```
src/
├── auth/           # Authentication and authorization
├── coaches/        # Coach management
├── clients/        # Client management
├── forms/          # Dynamic form handling
├── business/       # Business-specific logic (insurance, real estate, etc.)
├── integrations/   # Third-party integrations (DATEV, SanusPay, etc.)
├── pdf-export/     # PDF/Excel export functionality
├── scheduler/      # Scheduled jobs and reminders
├── chatbot/        # Chatbot integration
└── config/         # Application configuration
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `GET /api/auth/me` - Get current user profile

### Coaches

- `GET /api/coaches` - Get all coaches
- `GET /api/coaches/:id` - Get coach by ID
- `GET /api/coaches/me/clients` - Get clients of the current coach
- `POST /api/coaches/me/clients/:clientId` - Assign a client to current coach
- `DELETE /api/coaches/me/clients/:clientId` - Remove a client from current coach

### Clients

- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create a new client
- `GET /api/clients/:id` - Get client by ID
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Forms

- `POST /api/forms` - Create a new form
- `GET /api/forms/:id` - Get form by ID
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form
- `GET /api/forms/client/:clientId` - Get all forms for a client

## Database Schema

- **Users**: Coaches and Clients with role differentiation
- **Forms**: Dynamic form data for different business types
- **Files**: File metadata linked to forms and users

## Security

- Firebase Authentication for secure access
- Role-based authorization
- Secure file access via signed URLs

## License

ISC License



To complete the project setup, you'll need to:
1. Install the dependencies with 
npm install
2. Create a .env file based on the structure we tried to provide
Add config in .env
3. Generate the Prisma client 
npm run prisma:generate
4. Create the database tables
npm run prisma:migrate
5. Populate the initial roles
npm run seed
6. Start the server 
npm run dev

Added test scripts in package.json:
npm run test: Run all tests
npm run test:auth: Run specifically the auth controller tests
npm run test:coverage: Run tests with coverage reporting