# API Conventions — Decypher AI 接口全局约定

> 所有接口共用的约定。阅读各资源文档前先读此文件。

---

## 基础路径

```
所有接口：/api/v1/
Swagger UI：http://localhost:8000/api/docs
```

---

## 统一响应格式

```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {
    "total": 100,
    "page": 1,
    "page_size": 20
  }
}
```

- `data` — 实际数据，成功时存在
- `error` — 错误描述（中文），成功时为 `null`
- `meta` — 分页等元数据，无分页时省略

**错误响应**

```json
{
  "success": false,
  "data": null,
  "error": "具体错误描述（中文）",
  "meta": null
}
```

---

## HTTP 状态码

| 状态码 | 场景 |
|-|-|
| 200 | 成功（GET / PATCH / DELETE） |
| 201 | 创建成功（POST） |
| 400 | 请求参数错误 |
| 401 | 未认证或 Token 无效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 422 | 数据验证失败（Pydantic） |
| 500 | 服务器内部错误 |

---

## 认证方式

所有接口（除 `/health`、`/auth/register`、`/auth/login`）需要携带：

```
Authorization: Bearer <jwt_token>
```

文档中标注 🔒 的接口均需认证。

---

## 命名规范

| 元素 | 格式 | 示例 |
|-|-|-|
| URL 路径 | `kebab-case` | `/task-runs` |
| JSON 字段 | `snake_case` | `created_at` |
| 枚举值 | `lowercase` | `"pending"`, `"running"` |
| 时间格式 | ISO 8601 UTC | `"2024-01-01T00:00:00Z"` |
