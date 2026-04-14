# Stack9 Screen Schema

## File location

`packages/stack9-stack/src/screens/{screen_key}.json`

## Naming conventions

- Screen `key` → `snake_case` (e.g. `support_ticket_detail`)
- Screen `route` → `kebab-case` (e.g. `support-ticket/:id`)

## List screen

```json
{
  "head": {
    "title": "Support Tickets",
    "key": "support_ticket_list",
    "route": "support-ticket-list",
    "app": "my_app",
    "accessLevel": "basic"
  },
  "screenType": "listView",
  "listQuery": "support_ticket_list",
  "entityKey": "support_ticket"
}
```

## Detail screen

```json
{
  "head": {
    "title": "Support Ticket",
    "key": "support_ticket_detail",
    "route": "support-ticket/:id",
    "app": "my_app",
    "accessLevel": "basic"
  },
  "screenType": "detailView",
  "entityKey": "support_ticket",
  "queries": [
    { "name": "support_ticket_detail", "queryKey": "support_ticket_detail" }
  ]
}
```

## App navigation

File: `packages/stack9-stack/src/apps/{app_name}.json`

Add new screens to navigation:

```json
{
  "key": "support_tickets",
  "name": "Support Tickets",
  "nodeType": "link",
  "link": "/my_app/support-ticket-list/list"
}
```

**Navigation `nodeType` values:** `appNode`, `menuGroup`, `link`
