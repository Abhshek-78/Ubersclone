# Backend API Documentation

## Map endpoints

All map endpoints use the `/maps` prefix and require a user JWT:

```text
Authorization: Bearer <token>
```

Examples:

```text
GET /maps/getCoordinates?address=Bhopal
GET /maps/get-distance-time?origin=Bhopal&destination=Indore
GET /maps/get-suggestion?suggestion=Bhopal
```

The `address`, `origin`, `destination`, and `suggestion` values are query parameters, not JSON body fields. Add your Mapbox public token in the backend `.env` as `MAPBOX_API`.

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

## Captain Registration Endpoint

### POST /captains/register

Registers a new captain account and returns a JWT token on success.

### Request Body

Send a JSON object with the following fields:

```json
{
  "fullname": {
    "firstname": "Jane",
    "lastname": "Doe"
  },
  "email": "janedoe@example.com",
  "password": "1234",
  "vehical": {
    "color": "Red",
    "plate": "XYZ123",
    "capacity": 4,
    "vehicaltype": "car"
  }
}
```

Notes:
- The endpoint also accepts alternative field shapes (flat fields or `vehicle`) and will normalize them internally.

### Required Fields

- `fullname.firstname`: required
- `fullname.lastname`: required
- `email`: required, must be a valid email address
- `password`: required, minimum 4 characters
- `vehical.color`: required
- `vehical.plate`: required
- `vehical.capacity`: required, integer >= 1
- `vehical.vehicaltype`: required, one of `car`, `bike`, `auto`

### Success Response

#### Status: 201 Created

```json
{
  "token": "<jwt>",
  "captain": {
    "_id": "64abc123...",
    "fullname": {
      "firstname": "Jane",
      "lastname": "Doe"
    },
    "email": "janedoe@example.com",
    "vehical": {
      "color": "Red",
      "plate": "XYZ123",
      "capacity": 4,
      "vehicaltype": "car"
    }
  }
}
```

### Error Responses

#### Status: 400 Bad Request

Returned when request validation fails or required fields are missing.

```json
{
  "error": [
    {"msg": "Email is required", "param": "email", "location": "body"},
    {"msg": "First name is required", "param": "fullname.firstname", "location": "body"}
  ]
}
```

#### Status: 409 Conflict

Returned when the provided email already exists.

```json
{
  "message": "Captain already exists"
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
curl -X POST http://localhost:3000/captains/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": { "firstname": "Jane", "lastname": "Doe" },
    "email": "janedoe@example.com",
    "password": "1234",
    "vehical": { "color": "Red", "plate": "XYZ123", "capacity": 4, "vehicaltype": "car" }
  }'
```

---

## Captain Login Endpoint

### POST /captains/login

Authenticates an existing captain and returns a JWT token on success.

### Request Body

Send a JSON object with the following fields:

```json
{
  "email": "janedoe@example.com",
  "password": "123456"
}
```

### Required Fields

- `email`: required, must be a valid email address
- `password`: required, minimum 6 characters

### Success Response

#### Status: 200 OK

```json
{
  "token": "<jwt>",
  "captain": {
    "_id": "64abc123...",
    "firstname": "Jane",
    "lastname": "Doe",
    "email": "janedoe@example.com"
  }
}
```

### Error Responses

#### Status: 400 Bad Request

Returned when request validation fails.

```json
{
  "error": [
    {
      "msg": "Invalid email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

#### Status: 401 Unauthorized

Returned when the email or password is incorrect.

```json
{
  "message": "invalid email and password"
}
```

### Example Request

```bash
curl -X POST http://localhost:3000/captains/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "janedoe@example.com",
    "password": "123456"
  }'
```

---

## Captain Profile Endpoint

### GET /captains/profile

Returns the authenticated captain's profile information.

### Authentication

Requires a valid JWT token sent either as an HTTP-only cookie named `token` or in the `Authorization` header as `Bearer <token>`.

### Success Response

#### Status: 200 OK

```json
{
  "captain": {
    "_id": "64abc123...",
    "firstname": "Jane",
    "lastname": "Doe",
    "email": "janedoe@example.com"
  }
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

## Captain Logout Endpoint

### GET /captains/logout

Logs out the authenticated captain by blacklisting the current token and clearing the `token` cookie.

### Authentication

Requires a valid JWT token sent either as an HTTP-only cookie named `token` or in the `Authorization` header as `Bearer <token>`.

### Success Response

#### Status: 200 OK

```json
{
  "message": "logout success"
}
```

### Error Responses

#### Status: 401 Unauthorized

Returned when the token is missing or invalid.

```json
{
  "message": "token not exist"
}
```

```json
{
  "message": "unauthorized"
}
```

### Example Request

```bash
curl -X GET http://localhost:3000/captains/logout \
  -H "Authorization: Bearer <token>"
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

---

## Get Ride Fare Endpoint

### GET /rides/getFare

Calculates the estimated fare for a ride using the pickup and destination locations. The endpoint requires an authenticated user JWT.

The same endpoint is also available through the `/ride/getFare` alias.

### Authentication

Send a valid JWT either as an HTTP-only cookie named `token` or in the `Authorization` header:

```text
Authorization: Bearer <token>
```

### Query Parameters

- `pickup`: required, minimum 3 characters
- `destination`: required, minimum 3 characters

Query parameters must be sent in the URL, not in a JSON request body.

### Success Response

#### Status: 200 OK

```json
{
  "car": 193,
  "motorcycle": 108,
  "auto": 143
}
```

Fare values are estimated amounts based on the route distance and duration. The response contains fares for all supported vehicle types.

### Error Responses

#### Status: 400 Bad Request

Returned when `pickup` or `destination` is missing or shorter than 3 characters.

```json
{
  "errors": [
    {
      "msg": "invalid pickup",
      "param": "pickup",
      "location": "query"
    }
  ]
}
```

#### Status: 401 Unauthorized

Returned when the user JWT is missing, invalid, expired, or blacklisted.

#### Status: 500 Internal Server Error

Returned when fare calculation or route lookup fails.

```json
{
  "message": "Choose pickup and destination address"
}
```

### Example Request

```bash
curl -G http://localhost:3000/rides/getFare \
  -H "Authorization: Bearer <token>" \
  --data-urlencode "pickup=Bhopal" \
  --data-urlencode "destination=Indore"
```
