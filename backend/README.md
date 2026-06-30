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
