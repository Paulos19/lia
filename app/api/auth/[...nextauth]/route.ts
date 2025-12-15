// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth" // Importa da raiz onde configuramos o NextAuth

export const { GET, POST } = handlers