// next-auth.d.ts
import { Role } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

// 1. Estende a Sessão (usado no useSession e auth())
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
    } & DefaultSession["user"]
  }

  // Estende o objeto User (usado no adapter e callbacks iniciais)
  interface User {
    role: Role
  }
}

// 2. Estende o Token JWT (usado internamente na sessão)
declare module "next-auth/jwt" {
  interface JWT {
    role: Role
  }
}