export interface Tenant {
  id: string;
  shopName: string;
  accessToken: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantService {
  registerTenant(shopName: string, accessToken: string): Promise<Tenant>;
  getTenantById(id: string): Promise<Tenant | null>;
  getTenantByShopName(shopName: string): Promise<Tenant | null>;
  getAllTenants(): Promise<Tenant[]>;
  updateAccessToken(id: string, accessToken: string): Promise<Tenant>;
  deleteTenant(id: string): Promise<void>;
}
