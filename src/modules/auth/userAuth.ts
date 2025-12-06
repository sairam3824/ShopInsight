import prisma from '../../config/database';
import { hashPassword, verifyPassword } from '../../utils/encryption';

export async function createUser(username: string, password: string, tenantId: string) {
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      tenantId,
    },
  });

  return user;
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
  });
}

export async function verifyUserPassword(username: string, password: string) {
  const user = await getUserByUsername(username);
  
  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  
  return isValid ? user : null;
}
