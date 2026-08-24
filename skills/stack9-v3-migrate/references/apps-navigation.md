# Stack9 v3 → v5: App Navigation Migration

## What Changes

v3 embedded all app navigation in a single `server/app.json` file.  
v5 uses **separate JSON files** per app under `src/apps/` with a new navigation structure.

## Source → Target Mapping

```
v3: stack9/server/app.json → apps[{ key, icon, name, menu: [...] }]

v5: packages/stack9-stack/src/apps/{app_key}.json (one file per app)
    packages/stack9-stack/src/app.json (simplified — apps: [], cronJobs: [...])
```

## v3 App Structure

```json
{
  "apps": [
    {
      "key": "my_app",
      "icon": "fas fa-th-large",
      "name": "My App",
      "menu": [
        {
          "key": "section_key",
          "label": "Section Label",
          "item_groups": [
            {
              "key": "group_key",
              "items": [
                {
                  "key": "item_key",
                  "entityKey": "entity",
                  "label": "Entity Label"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## v5 App Structure

```json
{
  "name": "My App",
  "key": "my_app",
  "nodeType": "appNode",
  "description": "Description of this app",
  "icon": "AppstoreOutlined",
  "order": 10,
  "children": [
    {
      "key": "section_group",
      "name": "Section Label",
      "nodeType": "menuGroup",
      "children": [
        {
          "key": "item_key",
          "name": "Entity Label",
          "nodeType": "link",
          "icon": "TableOutlined",
          "link": "/my_app/entity-list",
          "description": "Manage entity records"
        }
      ]
    }
  ]
}
```

## Node Types

| `nodeType` | Description |
|---|---|
| `appNode` | Root of the app (top-level element) |
| `menuGroup` | Collapsible group of links |
| `link` | Navigates to a screen route |

## Structural Mapping

| v3 | v5 |
|---|---|
| `apps[].key` | `key` in app JSON |
| `apps[].name` | `name` |
| `apps[].icon` | `icon` (convert to Ant Design) |
| `apps[].menu[]` | `children[]` with `nodeType: "menuGroup"` |
| `menu[].label` | `name` on menuGroup child |
| `menu[].item_groups[].items[]` | `children[]` of the menuGroup (nodeType: "link") |
| `items[].entityKey` | Link route: `/app_key/{entity-list}` |
| `items[].label` | `name` on link child |

## Icon Conversion: Font Awesome → Ant Design

v3 used Font Awesome class strings. v5 uses Ant Design icon component names.

| v3 Font Awesome | v5 Ant Design |
|---|---|
| `fas fa-th-large` | `AppstoreOutlined` |
| `fas fa-file-alt` | `FileTextOutlined` |
| `far fa-chart-line` | `LineChartOutlined` |
| `far fa-cogs` | `SettingOutlined` |
| `fas fa-users` | `TeamOutlined` |
| `fas fa-user` | `UserOutlined` |
| `fas fa-building` | `BankOutlined` |
| `fas fa-dollar-sign` | `DollarOutlined` |
| `fas fa-calendar` | `CalendarOutlined` |
| `fas fa-list` | `UnorderedListOutlined` |
| `fas fa-cog` | `SettingOutlined` |
| `fas fa-database` | `DatabaseOutlined` |
| `fas fa-envelope` | `MailOutlined` |
| `fas fa-chart-bar` | `BarChartOutlined` |
| `fas fa-home` | `HomeOutlined` |
| `fas fa-search` | `SearchOutlined` |
| `fas fa-plus` | `PlusOutlined` |

For icons not in this list, pick the closest Ant Design equivalent. Use `TableOutlined` for entity lists, `FormOutlined` for forms, `DashboardOutlined` for dashboards.

## Link Route Convention

Map the v3 `entityKey` to the v5 screen route:

```
/app_key/{entity-key converted to kebab-case}-list
```

Examples:
- `entityKey: "form_submission"` → `link: "/fnol/form-submission-list"`
- `entityKey: "customer"` → `link: "/report_portal/customer-list"`
- `entityKey: "report_menu"` → `link: "/report_portal/report-menu-list"`

The route must match the `head.route` in the corresponding screen JSON file.

## Migration Example

v3:
```json
{
  "key": "FNOL",
  "icon": "fas fa-file-alt",
  "name": "Online Claim Forms",
  "menu": [
    {
      "key": "transactions",
      "label": "Transactions",
      "item_groups": [
        {
          "key": "transactions",
          "items": [
            { "key": "form_submissions", "entityKey": "form_submission", "label": "Form Submissions" },
            { "key": "customers", "entityKey": "customer", "label": "Customers" }
          ]
        }
      ]
    },
    {
      "key": "configuration",
      "label": "Configuration",
      "item_groups": [
        {
          "key": "configuration",
          "items": [
            { "key": "claim_forms", "entityKey": "claim_form", "label": "Claim Forms" }
          ]
        }
      ]
    }
  ]
}
```

v5 (`src/apps/fnol.json`):
```json
{
  "name": "Online Claim Forms",
  "key": "fnol",
  "nodeType": "appNode",
  "description": "Manage online claim form submissions",
  "icon": "FileTextOutlined",
  "order": 10,
  "children": [
    {
      "key": "transactions_group",
      "name": "Transactions",
      "nodeType": "menuGroup",
      "children": [
        {
          "key": "form_submissions",
          "name": "Form Submissions",
          "nodeType": "link",
          "icon": "TableOutlined",
          "link": "/fnol/form-submission-list",
          "description": "Manage form submission records"
        },
        {
          "key": "customers",
          "name": "Customers",
          "nodeType": "link",
          "icon": "UserOutlined",
          "link": "/fnol/customer-list",
          "description": "Manage customers"
        }
      ]
    },
    {
      "key": "configuration_group",
      "name": "Configuration",
      "nodeType": "menuGroup",
      "children": [
        {
          "key": "claim_forms",
          "name": "Claim Forms",
          "nodeType": "link",
          "icon": "FormOutlined",
          "link": "/fnol/claim-form-list",
          "description": "Manage claim form configurations"
        }
      ]
    }
  ]
}
```

## app.json cronJobs Migration

v3 `app.json.cronJobs[]`:
```json
"cronJobs": [
  {
    "command": "create-eml-object",
    "cronTime": "*/5 * * * *"
  }
]
```

v5 `app.json.cronJobs[]` — same format but `command` must match the action type `description.key`:
```json
"cronJobs": [
  {
    "command": "create_eml_object",
    "cronTime": "*/5 * * * *"
  }
]
```
