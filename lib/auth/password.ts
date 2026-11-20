import { hash, verify } from "@node-rs/argon2";

// Argon2id configuration: memoryCost 64MB (65536 KiB), 3 iterations, 4 parallelism lanes
const ARGON2_OPTIONS = {
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

export async function hashPassword(plainPassword: string): Promise<string> {
  return hash(plainPassword, ARGON2_OPTIONS);
}

export async function verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  try {
    return await verify(passwordHash, plainPassword);
  } catch (error) {
    return false;
  }
}
