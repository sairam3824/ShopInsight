import prisma from '../../config/database';
import { encryptToken, decryptToken } from '../../utils/encryption';
import { Tenant, TenantService } from './tenant.types';

class TenantServiceImpl implements TenantService {
  async registerOrUpdateTenant(shopName: string, accessToken: string): Promise<Tenant> {
    const encryptedToken = encryptToken(accessToken);

    const tenant = await prisma.tenant.upsert({
      where: { shopName },
      update: {
        accessToken: encryptedToken,
      },
      create: {
        shopName,
        accessToken: encryptedToken,
      },
    });

    return {
      ...tenant,
      accessToken: decryptToken(tenant.accessToken),
    };
  }

  async registerTenant(shopName: string, accessToken: string): Promise<Tenant> {
    return this.registerOrUpdateTenant(shopName, accessToken);
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) return null;

    return {
      ...tenant,
      accessToken: decryptToken(tenant.accessToken),
    };
  }

  async getTenantByShopName(shopName: string): Promise<Tenant | null> {
    const tenant = await prisma.tenant.findUnique({
      where: { shopName },
    });

    if (!tenant) return null;

    return {
      ...tenant,
      accessToken: decryptToken(tenant.accessToken),
    };
  }

  async getAllTenants(): Promise<Tenant[]> {
    const tenants = await prisma.tenant.findMany();

    return tenants.map((tenant: any) => ({
      ...tenant,
      accessToken: decryptToken(tenant.accessToken),
    }));
  }

  async updateAccessToken(id: string, accessToken: string): Promise<Tenant> {
    const encryptedToken = encryptToken(accessToken);

    const tenant = await prisma.tenant.update({
      where: { id },
      data: { accessToken: encryptedToken },
    });

    return {
      ...tenant,
      accessToken: decryptToken(tenant.accessToken),
    };
  }

  async deleteTenant(id: string): Promise<void> {
    await prisma.tenant.delete({
      where: { id },
    });
  }
}

export const tenantService = new TenantServiceImpl();
