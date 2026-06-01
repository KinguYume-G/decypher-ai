# Notes API — `/api/v1/notes` 🔒

> 用户笔记 CRUD。全局约定见 [conventions.md](./conventions.md)。

---

## GET `/api/v1/notes` — 笔记列表

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "AI Agent 调研笔记",
      "content": "...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## POST `/api/v1/notes` — 创建笔记

**Request Body**
```json
{
  "title": "笔记标题",
  "content": "笔记正文内容"
}
```

**Response 201** — 返回创建的 Note 对象（字段同列表单项）。

---

## PATCH `/api/v1/notes/{note_id}` — 更新笔记

所有字段可选。

**Request Body**
```json
{
  "title": "新标题",
  "content": "新内容"
}
```

**Response 200** — 返回更新后的 Note 对象。

---

## DELETE `/api/v1/notes/{note_id}` — 删除笔记

**Response 200**
```json
{ "success": true, "data": null }
```
