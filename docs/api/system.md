# System API — 系统接口

> 演示数据初始化和健康检查。全局约定见 [conventions.md](./conventions.md)。

---

## POST `/api/v1/seed` — 初始化演示数据 🔒

为 5 个分类（`market` / `research` / `startup` / `stocks` / `jobs`）各创建一个默认任务并立即触发分析。**数据库任务表非空时自动跳过，幂等安全。**

**Response 200**
```json
{
  "success": true,
  "data": { "message": "已初始化 5 个演示任务，分析结果稍后可查看" }
}
```

---

## GET `/health` — 健康检查（无需认证）

```json
{
  "status": "healthy",
  "service": "Decypher AI Backend",
  "version": "0.1.0"
}
```

---

## 规划中（Phase 3）

```
POST  /api/v1/reports/weekly   # 触发生成本周报告（异步）
GET   /api/v1/reports          # 报告列表
```
