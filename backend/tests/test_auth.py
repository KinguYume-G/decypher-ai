# Tests for POST /register, POST /login, and GET /me auth endpoints.
# 测试 POST /register、POST /login 及 GET /me 认证端点。
import pytest


class TestRegister:
    async def test_register_success(self, client):
        res = await client.post("/api/v1/auth/register", json={
            "email": "new@decypher.ai",
            "username": "newuser",
            "password": "password123",
        })
        assert res.status_code == 201
        data = res.json()
        assert data["success"] is True
        assert "access_token" in data["data"]
        assert data["data"]["user"]["email"] == "new@decypher.ai"

    async def test_register_duplicate_email(self, client):
        payload = {"email": "dup@decypher.ai", "username": "user1", "password": "password123"}
        await client.post("/api/v1/auth/register", json=payload)
        res = await client.post("/api/v1/auth/register", json={**payload, "username": "user2"})
        assert res.status_code == 400

    async def test_register_duplicate_username(self, client):
        await client.post("/api/v1/auth/register", json={
            "email": "a@decypher.ai", "username": "sameuser", "password": "password123"
        })
        res = await client.post("/api/v1/auth/register", json={
            "email": "b@decypher.ai", "username": "sameuser", "password": "password123"
        })
        assert res.status_code == 400

    async def test_register_weak_password(self, client):
        res = await client.post("/api/v1/auth/register", json={
            "email": "weak@decypher.ai", "username": "weakuser", "password": "short",
        })
        assert res.status_code == 422

    async def test_register_invalid_email(self, client):
        res = await client.post("/api/v1/auth/register", json={
            "email": "not-an-email", "username": "someuser", "password": "password123",
        })
        assert res.status_code == 422


class TestLogin:
    async def test_login_success(self, client):
        await client.post("/api/v1/auth/register", json={
            "email": "login@decypher.ai", "username": "loginuser", "password": "password123",
        })
        res = await client.post("/api/v1/auth/login", json={
            "email": "login@decypher.ai", "password": "password123",
        })
        assert res.status_code == 200
        assert res.json()["data"]["access_token"] is not None

    async def test_login_wrong_password(self, client):
        await client.post("/api/v1/auth/register", json={
            "email": "wp@decypher.ai", "username": "wpuser", "password": "password123",
        })
        res = await client.post("/api/v1/auth/login", json={
            "email": "wp@decypher.ai", "password": "wrongpassword",
        })
        assert res.status_code == 401

    async def test_login_nonexistent_user(self, client):
        res = await client.post("/api/v1/auth/login", json={
            "email": "ghost@decypher.ai", "password": "password123",
        })
        assert res.status_code == 401


class TestMe:
    async def test_me_success(self, auth_client):
        res = await auth_client.get("/api/v1/auth/me")
        assert res.status_code == 200
        assert res.json()["data"]["email"] == "test@decypher.ai"

    async def test_me_unauthenticated(self, client):
        res = await client.get("/api/v1/auth/me")
        assert res.status_code == 401

    async def test_me_invalid_token(self, client):
        client.headers.update({"Authorization": "Bearer invalidtoken"})
        res = await client.get("/api/v1/auth/me")
        assert res.status_code == 401
