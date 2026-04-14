# Styling & Components — Tailwind 4, Radix UI, CVA

## cn() utility

Always use `cn()` for conditional class merging. Lives in `app/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Usage:

```tsx
<div className={cn('base-class', isActive && 'active-class', variant === 'large' && 'text-lg')} />
```

## Class Variance Authority (CVA)

Use CVA for component variants instead of inline ternaries:

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
}
```

## Radix UI patterns

### Dialog

```tsx
import * as Dialog from '@radix-ui/react-dialog'

export function ConfirmDialog({ trigger, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold">Confirm</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-500">
            Are you sure?
          </Dialog.Description>
          <div className="mt-4 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="outline">Cancel</Button>
            </Dialog.Close>
            <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### Dropdown Menu

```tsx
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export function ActionMenu({ items }: { items: MenuItem[] }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon"><MoreHorizontalIcon /></Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="min-w-[160px] rounded-md border bg-white p-1 shadow-md">
          {items.map(item => (
            <DropdownMenu.Item
              key={item.label}
              className="cursor-pointer rounded px-2 py-1.5 text-sm outline-none hover:bg-gray-100"
              onSelect={item.onSelect}
            >
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
```

### Select

```tsx
import * as Select from '@radix-ui/react-select'

export function RoleSelect({ value, onValueChange }: RoleSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm">
        <Select.Value placeholder="Select role" />
        <Select.Icon><ChevronDownIcon /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="rounded-md border bg-white shadow-md">
          <Select.Viewport className="p-1">
            {['admin', 'user', 'viewer'].map(role => (
              <Select.Item
                key={role}
                value={role}
                className="cursor-pointer rounded px-2 py-1.5 text-sm outline-none hover:bg-gray-100"
              >
                <Select.ItemText>{role}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
```

### Tooltip

```tsx
import * as Tooltip from '@radix-ui/react-tooltip'

export function TooltipWrapper({ children, content }: TooltipWrapperProps) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="rounded bg-gray-900 px-2 py-1 text-xs text-white"
            sideOffset={4}
          >
            {content}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
```

## Tailwind 4 conventions

- Mobile-first: base styles are mobile, add `sm:`, `md:`, `lg:` breakpoints for larger screens
- Use CSS variables for theme tokens (`--color-primary`, `--radius-md`)
- Prefer `gap-*` over `space-*` for flex/grid layouts
- Use `@layer components` for reusable component classes in `app.css`

```css
@layer components {
  .page-container {
    @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
  }
}
```

## Icon sprites

Using `vite-plugin-icons-spritesheet`:

```tsx
import { Icon } from '~/components/ui/icon'

<Icon name="arrow-right" className="h-4 w-4" />
```

Icon component:

```tsx
import spriteSrc from '~/assets/icons/sprite.svg'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string
}

export function Icon({ name, className, ...props }: IconProps) {
  return (
    <svg className={cn('shrink-0', className)} {...props}>
      <use href={`${spriteSrc}#${name}`} />
    </svg>
  )
}
```
