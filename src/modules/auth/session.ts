import crypto from 'crypto';
import prisma from '../../config/database';
import { Session } from './types';
import { verifyUserPassword } from './userAuth';

const SESSION_DURATION_HOURS = 24;

export async function createSession(username: string, password: string): Promise<Session> {
  const user = await verifyUserPassword(username, password);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  return {
    id: session.id,
    userId: session.userId,
    tenantId: user.tenantId,
    token: session.token,
    expiresAt: session.expiresAt,
  };
}

export async function validateSession(token: string): Promise<Session | null> {
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  // Check if session is expired
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({
      where: { id: session.id },
    });
    return null;
  }

  return {
    id: session.id,
    userId: session.userId,
    tenantId: session.user.tenantId,
    token: session.token,
    expiresAt: session.expiresAt,
  };
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.delete({
    where: { token },
  });
}

export async function cleanupExpiredSessions(): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}
