# Forms & Validation — Conform + Zod

## Basic form with Conform + Zod

```tsx
import { useForm, getFormProps, getInputProps } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { z } from 'zod'
import type { Route } from './+types/users.new'

const UserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'user', 'viewer']),
})

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: UserSchema })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  await createUser(submission.value)
  return redirect('/users')
}

export default function NewUserPage({ actionData }: Route.ComponentProps) {
  const [form, fields] = useForm({
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: UserSchema })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  return (
    <form method="post" {...getFormProps(form)}>
      <div>
        <label htmlFor={fields.name.id}>Name</label>
        <input {...getInputProps(fields.name, { type: 'text' })} />
        <p id={fields.name.errorId} className="text-red-600 text-sm">
          {fields.name.errors}
        </p>
      </div>

      <div>
        <label htmlFor={fields.email.id}>Email</label>
        <input {...getInputProps(fields.email, { type: 'email' })} />
        <p id={fields.email.errorId} className="text-red-600 text-sm">
          {fields.email.errors}
        </p>
      </div>

      {form.errors && (
        <p id={form.errorId} className="text-red-600 text-sm">{form.errors}</p>
      )}

      <button type="submit">Create User</button>
    </form>
  )
}
```

## Zod schema patterns

```ts
import { z } from 'zod'

// Optional fields
const ProfileSchema = z.object({
  bio: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
})

// Refinements
const PasswordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// File uploads
const UploadSchema = z.object({
  file: z.instanceof(File).refine(f => f.size < 5_000_000, 'Max 5MB'),
})

// Transform on parse
const DateSchema = z.object({
  startDate: z.string().transform(s => new Date(s)),
})
```

## Select / checkbox / radio with Conform

```tsx
import { getSelectProps, getTextareaProps, getCollectionProps } from '@conform-to/react'

// Select
<select {...getSelectProps(fields.role)}>
  <option value="">Pick a role</option>
  <option value="admin">Admin</option>
  <option value="user">User</option>
</select>

// Textarea
<textarea {...getTextareaProps(fields.bio)} />

// Checkbox group
{getCollectionProps(fields.permissions, {
  type: 'checkbox',
  options: ['read', 'write', 'delete'],
}).map(props => (
  <label key={props.value}>
    <input {...props} />
    {props.value}
  </label>
))}
```

## Nested objects and arrays

```ts
const OrderSchema = z.object({
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
  }),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1, 'Add at least one item'),
})
```

```tsx
const [form, fields] = useForm({ ... })
const customerFields = fields.customer.getFieldset()
const items = fields.items.getFieldList()

// Customer fields
<input {...getInputProps(customerFields.name, { type: 'text' })} />

// Dynamic list
{items.map((item, index) => {
  const itemFields = item.getFieldset()
  return (
    <div key={item.key}>
      <input {...getInputProps(itemFields.quantity, { type: 'number' })} />
      <button {...form.remove.getButtonProps({ name: fields.items.name, index })}>
        Remove
      </button>
    </div>
  )
})}
<button {...form.insert.getButtonProps({ name: fields.items.name })}>
  Add Item
</button>
```

## Pending state during submission

```tsx
import { useNavigation } from 'react-router'

export default function CreatePage() {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <form method="post">
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create'}
      </button>
    </form>
  )
}
```

## Server-side only validation

For checks that require DB access (uniqueness, existence):

```tsx
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const submission = await parseWithZod(formData, {
    schema: UserSchema.superRefine(async (data, ctx) => {
      const exists = await db.user.findUnique({ where: { email: data.email } })
      if (exists) {
        ctx.addIssue({
          code: 'custom',
          message: 'Email already in use',
          path: ['email'],
        })
      }
    }),
    async: true,
  })

  if (submission.status !== 'success') return submission.reply()
  // ...
}
```
