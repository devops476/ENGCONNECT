import { stackServerApp } from "./stack";

async function seedAdmin() {
    const email = "admin@engconnect.com";
    const password = "Admin@123";
    const displayName = "Admin";

    console.log(`Attempting to seed admin user: ${email}`);

    try {
        // Try to create the user first
        const user = await stackServerApp.createUser({
            primaryEmail: email,
            password: password,
            displayName: displayName,
            primaryEmailVerified: true,
        });
        console.log("Admin user created successfully:", user.id);
    } catch (error: any) {
        // Check if user already exists
        if (error.message?.includes("already exists") || error.code === "UserWithEmailAlreadyExists") {
            console.log("User already exists. Attempting to update password...");

            // Find the user
            const users = await stackServerApp.listUsers({ query: email });
            const existingUser = users.find(u => u.primaryEmail === email);

            if (existingUser) {
                await existingUser.update({
                    password: password,
                    displayName: displayName,
                });
                console.log("Admin user updated successfully:", existingUser.id);
            } else {
                console.error("Could not find existing user to update.");
            }
        } else {
            console.error("Failed to create admin user:", error);
        }
    }
}

seedAdmin().catch(console.error);
