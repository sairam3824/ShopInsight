import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/encryption';

const prisma = new PrismaClient();

async function createAdmin() {
  const username = process.argv[2];
  const password = process.argv[3];
  const shopName = process.argv[4];

  if (!username || !password || !shopName) {
    console.error('❌ Missing required arguments');
    console.log('');
    console.log('Usage:');
    console.log('  npm run create-admin <username> <password> <shop-name>');
    console.log('');
    console.log('Example:');
    console.log('  npm run create-admin admin mypassword store.myshopify.com');
    console.log('');
    process.exit(1);
  }

  try {
    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        shopName,
        accessToken: 'placeholder_token_will_be_set_via_oauth',
      },
    });

    console.log('✅ Tenant created:', tenant.shopName);

    // Create admin user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        tenantId: tenant.id,
      },
    });

    console.log('✅ Admin user created');
    console.log('');
    console.log('Login credentials:');
    console.log(`  Username: ${user.username}`);
    console.log(`  Password: ${password}`);
    console.log(`  Tenant: ${tenant.shopName}`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Start the application: npm run dev');
    console.log('2. Go to: http://localhost:3001');
    console.log('3. Login with the credentials above');
    console.log('4. Connect your Shopify store via OAuth');

  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error('❌ Error: Username or shop name already exists');
    } else {
      console.error('❌ Error creating admin:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
