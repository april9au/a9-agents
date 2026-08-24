# Stack9 React Patterns

## Query execution — decision tree

```
Need data in React?
├─ Fetching a LIST or running a SEARCH?
│  └─ useScreenQuery(queryName, { vars, filters, sorting })
│     from @april9/stack9-ui — auto-fetches on mount, SWR caching
│
├─ Fetching a SINGLE RECORD by ID?
│  └─ useScreenQueryById(queryName, id)
│     from @april9/stack9-ui — auto-unwraps to single object
│
└─ In an EVENT HANDLER (button click, form submit)?
   └─ queryService.runNamedQuery(screenKey, queryName, { vars })
      via const { queryService } = useStack9() from @april9/stack9-react
      Use for ALL mutations: create, update, delete, workflow moves

NEVER USE: fetch(), axios.post(), axios.get(), custom API clients
```

## TypeScript imports

```tsx
import * as ui from '@april9/stack9-ui';
import { useStack9 } from '@april9/stack9-react';
import { S9Page, S9PageHeader, S9Table, S9Form, S9TextField, S9Button, S9Tabs } from '@april9/stack9-ui';

// Generated types — run yarn generate-models first
import { SupportTicketListOutputItem } from 'stack9-models';
import { SupportTicketDetailOutputItem } from 'stack9-models';
```

## List view

```tsx
export const SupportTicketList: React.FC = () => {
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = ui.useScreenQuery<SupportTicketListOutputItem[]>(
    'support_ticket_list',
    { vars: { limit: 20, offset: page * 20 } }
  );

  if (isLoading) return <Skeleton active />;
  if (error) return <Alert type="error" message={error.message} />;

  return (
    <S9Table
      dataSource={data}
      columns={columns}
      pagination={{ current: page + 1, onChange: (p) => setPage(p - 1) }}
    />
  );
};
```

## Detail view

```tsx
export const SupportTicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: ticket, isLoading } = ui.useScreenQueryById<SupportTicketDetailOutputItem>(
    'support_ticket_detail',
    id ? parseInt(id) : undefined
  );

  if (isLoading) return <Skeleton active />;
  if (!ticket) return <Empty />;

  return (
    <S9Page>
      <S9PageHeader title={ticket.title} />
    </S9Page>
  );
};
```

## Mutations

```tsx
export const TicketActions: React.FC<{ ticketId: number }> = ({ ticketId }) => {
  const { queryService } = useStack9();
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    setLoading(true);
    try {
      await queryService.runNamedQuery(
        'support_ticket_detail',
        'update_support_ticket',
        { vars: { id: ticketId, body: { status: 'Closed' } } }
      );
      notification.success({ message: 'Ticket closed' });
    } catch {
      notification.error({ message: 'Failed to close ticket' });
    } finally {
      setLoading(false);
    }
  };

  return <S9Button onClick={handleClose} loading={loading}>Close Ticket</S9Button>;
};
```

## Create drawer

```tsx
export const SupportTicketCreateDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}> = ({ open, onClose, onSaved }) => {
  const [form] = S9Form.useForm();
  const { queryService } = useStack9();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      await queryService.runNamedQuery('support_ticket_detail', 'create_support_ticket', { vars: { body: values } });
      notification.success({ message: 'Ticket created' });
      form.resetFields();
      onSaved?.();
      onClose();
    } catch {
      notification.error({ message: 'Failed to create ticket' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title="New Support Ticket">
      <S9Form form={form} onFinish={handleSubmit} layout="vertical">
        <S9TextField name="title" label="Title" rules={[{ required: true }]} />
        <S9Button type="primary" htmlType="submit" loading={loading}>Create</S9Button>
      </S9Form>
    </Drawer>
  );
};
```

## Search with debouncing

```tsx
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');

useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
  return () => clearTimeout(timer);
}, [searchTerm]);

const { data, isLoading } = ui.useScreenQuery<SupportTicketListOutputItem[]>(
  'support_ticket_list',
  { querySearch: debouncedSearch, vars: { limit: 50, offset: 0 } }
);
```

## Table with row actions

```tsx
import { S9ActionsDropdown } from '@april9/stack9-ui';

const columns = [
  { title: 'Title', dataIndex: 'title', key: 'title' },
  {
    title: 'Actions',
    key: 'actions',
    render: (_: unknown, record: SupportTicketListOutputItem) => (
      <S9ActionsDropdown
        items={[
          { key: 'edit', label: 'Edit', onClick: () => handleEdit(record) },
          { key: 'delete', label: 'Delete', danger: true, onClick: () => handleDelete(record.id) },
        ]}
      />
    ),
  },
];
```

## Registering custom components

In `apps/stack9-frontend/src/app.stack9.instance.tsx`:

```tsx
import { UIProvider } from '@april9/stack9-react';
import { SupportTicketDetailView } from './pages/support/SupportTicketDetailView';

const components = [SupportTicketDetailView];

export const customRoutes = [
  { route: '/my_app/support-ticket/:id', component: <SupportTicketDetailView /> },
];

<UIProvider components={components}>
  <App customRoutes={customRoutes} />
</UIProvider>
```

Any component referenced by `resolvedName` in screen JSON must be listed in the `components` array.

## Component file locations

- Full page views → `apps/stack9-frontend/src/pages/{domain}/{ComponentName}/`
- Reusable parts → `apps/stack9-frontend/src/components/{ComponentName}/`
