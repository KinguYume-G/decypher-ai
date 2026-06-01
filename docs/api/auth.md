# Auth API — `/api/v1/auth`

> 注册和登录无需认证，其余接口需要 Bearer Token。全局约定见 [conventions.md](./conventions.md)。

---

## POST `/api/v1/auth/register` — 注册

**Request Body**
```json
{
  "email": "user@example.com",
  "username": "decypher_user",
  "password": "password123"
}
```

密码规则：至少 8 位，包含字母和数字。

**Response 200**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJ...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "decypher_user",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

## POST `/api/v1/auth/login` — 登录

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** — 同注册。

---

## GET `/api/v1/auth/me` — 当前用户 🔒

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "decypher_user",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```
