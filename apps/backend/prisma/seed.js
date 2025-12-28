import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // Seed data would go here if needed
    // For now, we'll just verify the connection
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected. Current users: ${userCount}`);
}
main()
    .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map