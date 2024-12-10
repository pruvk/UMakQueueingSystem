interface User {
    userId: number;
    username: string;
    firstName: string;
    middleName: string | null;
    lastName: string | null;
    role: string;
    createdAt: string;
}

export const userService = {
    async getUsers(): Promise<User[]> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token');

        const response = await fetch('http://localhost:5272/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        return response.json();
    }
}; 