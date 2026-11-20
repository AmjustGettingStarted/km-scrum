import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";

const prisma = new PrismaClient();

const ARGON2_OPTIONS = {
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

async function main() {
  console.log("🌱 Starting seed script...");

  const adminUsername = "admin";
  const defaultPassword = process.env.ADMIN_INITIAL_PASSWORD || "Admin@123456";

  const passwordHash = await hash(defaultPassword, ARGON2_OPTIONS);

  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      password_hash: passwordHash,
      full_name: "Workspace Manager",
      email: "manager@internal.local",
      role: "MANAGER",
      is_active: true,
      must_change_password: true,
    },
  });

  console.log(`✅ Default Manager account ready:`);
  console.log(`   Username: ${admin.username}`);
  console.log(`   Initial Temporary Password: ${defaultPassword}`);
  console.log(`   Role: ${admin.role}`);
  console.log(`   Must Change Password: ${admin.must_change_password}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
