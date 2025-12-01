import { stackServerApp } from './stack';

async function updateUserPassword() {
    try {
        const app = stackServerApp;
        console.log('Using Stack Server App:', {
            projectId: app.projectId,
            hasServerKey: !!process.env.STACK_SECRET_SERVER_KEY
        });

        // Get all users
        const users = await app.listUsers();
        console.log(`\nTotal users: ${users.length}`);

        // Find admin user
        const adminUser = users.find(u => u.primaryEmail === 'admin@engconnect.com');

        if (!adminUser) {
            console.error('Admin user not found!');
            return;
        }

        console.log('\nFound admin user:');
        console.log('  ID:', adminUser.id);
        console.log('  Email:', adminUser.primaryEmail);
        console.log('  Display Name:', adminUser.displayName);

        // Try to update the password using Stack Auth REST API
        console.log('\nAttempting to update password via REST API...');

        const response = await fetch(`https://api.stack-auth.com/api/v1/projects/${app.projectId}/users/${adminUser.id}/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-stack-project-id': app.projectId!,
                'x-stack-secret-server-key': process.env.STACK_SECRET_SERVER_KEY!,
                'x-stack-access-type': 'server'
            },
            body: JSON.stringify({
                password: 'Admin@123'
            })
        });

        if (response.ok) {
            console.log('✅ Password updated successfully!');
        } else {
            const error = await response.text();
            console.log('❌ Failed to update password:', response.status);
            console.log('Error details:', error);
            console.log('\n📝 You may need to reset the password manually in the Stack Auth dashboard');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

updateUserPassword();
