# Authentication System

The dev hub now includes a complete authentication system with role-based access control.

## User Roles

1. **Regular** - Default role for new signups
   - Access to public content
   - Can view all documentation

2. **Paid** - Premium users
   - Access to public content
   - Access to blog content
   - All features available to regular users

3. **Admin** - Administrators
   - All paid user features
   - Access to admin dashboard
   - Can manage Notion integration
   - Can manage content

## Features

### Authentication
- User signup with email/password
- User login
- JWT-based token authentication
- Password hashing with bcrypt
- Session persistence (7 days)

### Role-Based Access
- Navigation shows/hides based on user role
- Admin routes protected
- Blog only visible to paid users
- API routes check user roles

### User Management
- Users stored in `data/users.json`
- Password hashing for security
- JWT tokens for authentication
- Role management (can be extended)

## Setup

### 1. Environment Variables

Add to `.env.local`:

```env
JWT_SECRET=your-secure-jwt-secret-here
```

### 2. Create Admin User

You can create an admin user programmatically or through the signup flow and then manually update the role in `data/users.json`.

To create an admin user via API:

```typescript
// Use the signup API, then manually update the role in users.json
// Or create a script to create admin users
```

### 3. Update User Roles

Edit `data/users.json` to change user roles:

```json
{
  "id": "user_xxx",
  "email": "admin@example.com",
  "role": "admin",  // Change to "admin", "paid", or "regular"
  ...
}
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth token)

### Protected Routes
All admin API routes require:
- Authorization header: `Bearer <token>`
- User role must be `admin`

## Usage

### Login Flow
1. User visits `/login` or clicks "Login" in navigation
2. Enters email and password
3. Receives JWT token
4. Token stored in localStorage and cookie
5. User redirected to home page

### Signup Flow
1. User visits `/signup` or clicks "Sign Up"
2. Enters name (optional), email, and password
3. Account created with "regular" role
4. Automatically logged in
5. User redirected to home page

### Admin Access
1. Admin user logs in
2. "Admin" link appears in navigation
3. Can access `/admin` dashboard
4. Can manage Notion integration
5. Can manage content

### Paid User Access
1. Paid user logs in
2. "Blog" link appears in navigation
3. Can access `/blog` to view premium content

## Security Notes

- Passwords are hashed using bcrypt (10 rounds)
- JWT tokens expire after 7 days
- Tokens stored in localStorage and cookies
- API routes verify tokens and roles
- Middleware protects admin routes

## Future Enhancements

- Email verification
- Password reset
- Role management UI
- User profile pages
- Payment integration for paid users
- OAuth integration (Google, GitHub, etc.)

