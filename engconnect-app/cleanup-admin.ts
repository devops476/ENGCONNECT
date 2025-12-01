import { stackServerApp } from "./stack";

async function cleanupAndCreateAdmin() {
    const adminEmail = "admin@engconnect.com";
    const adminPassword = "Admin@123";

    console.log("\n=== Cleaning Up Duplicate Admin Accounts ===\n");

    try {
        // Get all users
        const users = await stackServerApp.listUsers();

        // Find all admin@engconnect.com accounts
        const adminUsers = users.filter(u => u.primaryEmail === adminEmail);

        console.log(`Found ${adminUsers.length} admin@engconnect.com accounts`);

        // Delete all existing admin accounts
        for (const admin of adminUsers) {
            console.log(`Deleting admin account: ${admin.id}`);
            await admin.delete();
            console.log(`✅ Deleted ${admin.id}`);
        }

        console.log("\n=== Creating Fresh Admin Account ===\n");

        // Create a fresh admin account
        const newAdmin = await stackServerApp.createUser({
            primaryEmail: adminEmail,
            password: adminPassword,
            displayName: "Admin",
            primaryEmailVerified: true,
        });

        console.log(`✅ Admin account created successfully!`);
        console.log(`   ID: ${newAdmin.id}`);
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log(`\n🎉 You can now login at http://localhost:3000/login\n`);

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

cleanupAndCreateAdmin().catch(console.error);
