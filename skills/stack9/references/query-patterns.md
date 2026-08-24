# Stack9 Query Patterns

## File location

`packages/stack9-stack/src/query-library/{entity_key}_{operation}.json`

## Naming conventions

- File name: `snake_case` (e.g. `support_ticket_list.json`)
- `key`: `snake_case` (e.g. `support_ticket_list`)
- `name`: `camelCase` (e.g. `supportTicketList`)

## List query (stack9_api)

```json
{
  "key": "support_ticket_list",
  "name": "supportTicketList",
  "connector": "stack9_api",
  "queryTemplate": {
    "method": "post",
    "path": "/support_ticket/search",
    "bodyParams": "{\n  \"$select\": [\"id\", \"title\", \"status\", \"priority\", \"_created_at\"],\n  \"$where\": {\n    \"_is_deleted\": false\n  },\n  \"$orderBy\": [{\"column\": \"_created_at\", \"order\": \"desc\"}],\n  \"$limit\": {{limit}},\n  \"$offset\": {{offset}}\n}"
  },
  "userParams": {
    "limit": "20",
    "offset": "0"
  }
}
```

## Detail query with relationships

```json
{
  "key": "support_ticket_detail",
  "name": "supportTicketDetail",
  "connector": "stack9_api",
  "queryTemplate": {
    "method": "post",
    "path": "/support_ticket/search",
    "bodyParams": "{\n  \"$select\": [\"*\", \"customer.id\", \"customer.name\", \"assigned_to.full_name\"],\n  \"$where\": {\n    \"id\": {{id}},\n    \"_is_deleted\": false\n  },\n  \"$withRelated\": [\"customer\", \"assigned_to\"]\n}"
  },
  "userParams": { "id": "0" }
}
```

Use `$withRelated` to eager-load related entities — avoids N+1 problems in detail views.

## Raw SQL query (stack9_db — aggregates and dashboards only)

```json
{
  "key": "support_ticket_summary",
  "name": "supportTicketSummary",
  "connector": "stack9_db",
  "queryTemplate": {
    "query": "SELECT status, COUNT(*) AS count FROM support_ticket WHERE _is_deleted = false GROUP BY status"
  }
}
```

Use `stack9_db` only for aggregations and reports that cannot be expressed in `stack9_api` syntax. Use `stack9_api` for all entity CRUD.

## Query operators (stack9_api)

| Operator | Example |
|---|---|
| Equals | `"status": "Open"` |
| Not equals | `"status": { "$ne": "Closed" }` |
| Greater than | `"_created_at": { "$gt": "{{date}}" }` |
| Like (search) | `"title": { "$like": "%{{search}}%" }` |
| In array | `"status": { "$in": ["Open", "In Progress"] }` |
| OR condition | `"$or": [{ "title": { "$like": "%{{q}}%" } }, { "description": { "$like": "%{{q}}%" } }]` |

## Query best practices

- Always include `"_is_deleted": false` in WHERE clauses
- Set `index: true` on entity fields used in WHERE or ORDER BY
- Use `$select` to fetch only needed fields — never `SELECT *` in list queries
- Use `$limit` and `$offset` for pagination
- Define default values in `userParams`
