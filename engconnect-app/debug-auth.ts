import { stackServerApp } from "./stack";

async function debugAuth() {
    try {
        console.log("\n=== Debugging Stack Auth Setup ===\n");

        // List all users
        const users = await stackServerApp.listUsers();
        console.log(`Total users in system: ${users.length}`);

        users.forEach((user, index) => {
            console.log(`\nUser ${index + 1}:`);
            console.log(`  ID: ${user.id}`);
            console.log(`  Email: ${user.primaryEmail}`);
            console.log(`  Display Name: ${user.displayName}`);
            console.log(`  Email Verified: ${user.primaryEmailVerified}`);
        });

        console.log("\n=== End Debug Info ===\n");
    } catch (error) {
        console.error("Error debugging auth:", error);
    }
}

debugAuth().catch(console.error);
