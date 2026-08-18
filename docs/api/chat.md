# Chat API

All routes require `Authorization: Bearer <token>`.

## `POST /api/v1/chat/stream`

Creates or continues a conversation and returns Server-Sent Events.

```json
{
  "message": "What should I validate first?",
  "opportunity_id": 7,
  "conversation_id": null,
  "conversation_history": []
}
```

The first event contains conversation metadata and citations:

```text
data: {"type":"meta","conversation_id":12,"citations":[...]}
```

Model output follows as delta events and ends with `[DONE]`:

```text
data: {"type":"delta","content":"Start"}

data: [DONE]
```

If inference fails, the stream emits a generic error event without exposing provider internals. Completed assistant content and citations are persisted.

## `POST /api/v1/chat/message`

Non-streaming equivalent. Returns `content`, `conversation_id`, and citations in the standard API envelope.

## `GET /api/v1/chat/conversations`

Returns up to 50 conversations owned by the authenticated user, newest first, including persisted messages and citations.
