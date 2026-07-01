# Backend API Documentation

## User Registration Endpoint

### POST /users/register

Registers a new user account and returns a JWT token on success.

### Request Body

Send a JSON object with the following fields:

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "johndoe@example.com",
  "password": "123456"
}
```

### Required Fields

- fullname.firstname: required, minimum 3 characters
- fullname.lastname: optional, minimum 3 characters if provided
- email: required, must be a valid email address
- password: required, minimum 6 characters

### Success Response

#### Status: 201 Created

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64abc123...",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "johndoe@example.com",
    "password": "$2b$10$..."
  }
}
```

### Error Responses

#### Status: 400 Bad Request

Returned when request validation fails.

```json
{
  "errors": [
    {
      "msg": "invalid mail",
      "param": "email",
      "location": "body"
    }
  ]
}
```

#### Status: 409 Conflict

Returned when the provided email already exists.

```json
{
  "message": "Email already exists"
}
```

#### Status: 500 Internal Server Error

Returned if registration fails for another reason.

```json
{
  "message": "Registration failed",
  "error": "Some server error message"
}
```

### Example Request

```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "johndoe@example.com",
    "password": "123456"
  }'
```

---

## User Login Endpoint

### POST /users/login

Authenticates an existing user and returns a JWT token on success.

### Request Body

Send a JSON object with the following fields:

```json
{
  "email": "johndoe@example.com",
  "password": "123456"
}
```

### Required Fields

- email: required, must be a valid email address
- password: required

### Success Response

#### Status: 200 OK

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64abc123...",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "johndoe@example.com"
  }
}
```

### Error Responses

#### Status: 400 Bad Request

Returned when validation fails or required fields are missing.

```json
{
  "message": "Invalid credentials"
}
```

#### Status: 401 Unauthorized

Returned when the email or password is incorrect.

```json
{
  "message": "Invalid email or password"
}
```

#### Status: 500 Internal Server Error

Returned if login fails for another reason.

```json
{
  "message": "Login failed"
}
```

### Example Request

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "johndoe@example.com",
    "password": "123456"
  }'
```

---

## User Profile Endpoint

### GET /users/profile

Returns the authenticated user's profile information.

### Authentication

Requires a valid JWT token sent either as an HTTP-only cookie named `token` or in the `Authorization` header as `Bearer <token>`.

### Success Response

#### Status: 200 OK

```json
{
  "_id": "64abc123...",
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "johndoe@example.com",
  "socketId": null
}
```

### Error Responses

#### Status: 401 Unauthorized

Returned when the token is missing, invalid, expired, or blacklisted.

```json
{
  "message": "token not exist"
}
```

```json
{
  "message": "invalid token"
}
```

---

## User Logout Endpoint

### GET /users/logout

Logs out the authenticated user by blacklisting the current token and clearing the `token` cookie.

### Authentication

Requires a valid JWT token sent either as an HTTP-only cookie named `token` or in the `Authorization` header as `Bearer <token>`.

### Success Response

#### Status: 200 OK

```json
{
  "message": "Logout successful"
}
```

### Error Responses

#### Status: 401 Unauthorized

Returned when the token is missing or invalid.

```json
{
  "message": "Token not found"
}
```

```json
{
  "message": "unauthorized"
}
```

### Example Request

```bash
curl -X GET http://localhost:3000/users/logout \
  -H "Authorization: Bearer <token>"
```
