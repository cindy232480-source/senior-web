import 'dotenv/config'
import { defineConfig } from '@prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: { path: './prisma/migrations' },

  // @ts-expect-error Prisma config 目前尚未宣告 seed 型別，但執行時有效
  seed: {
    run: async () => {
      // 注意路徑：prisma/seed.ts 相對於「專案根目錄的 prisma.config.ts」
      const { seed } = await import('./prisma/seed')
      await seed()
    },
  },
})
