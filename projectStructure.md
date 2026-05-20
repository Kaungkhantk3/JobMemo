job-tracker/
├─ app/
│ ├─ api/
│ │ └─ applications/
│ │ ├─ route.ts
│ │ └─ [id]/
│ │ └─ route.ts
│ ├─ applications/
│ │ ├─ new/
│ │ │ └─ page.tsx
│ │ └─ [id]/
│ │ └─ edit/
│ │ └─ page.tsx
│ ├─ page.tsx
│ └─ layout.tsx
│
├─ components/
│ ├─ applications/
│ │ ├─ application-form.tsx
│ │ ├─ applications-table.tsx
│ │ ├─ status-badge.tsx
│ │ └─ delete-application-button.tsx
│ └─ ui/
│
├─ lib/
│ ├─ prisma.ts
│ ├─ validations/
│ │ └─ application.ts
│ └─ utils.ts
│
├─ prisma/
│ ├─ schema.prisma
│ └─ migrations/
│
├─ types/
│ └─ application.ts
│
├─ docker-compose.yml
├─ .env
└─ package.json
