// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.EMAIL_ADMIN
  const password = process.env.PASSWORD_ADMIN

  if (!email || !password) {
    console.error('❌ EMAIL_ADMIN ou PASSWORD_ADMIN não definidos no .env')
    return
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {}, // Se já existe, não faz nada
    create: {
      email,
      password: hashedPassword,
      name: 'Admin Neusilene',
      role: Role.ADMIN, // AQUI GARANTIMOS A ROLE
    },
  })

  console.log(`✅ Usuário Admin criado/verificado: ${user.email}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })