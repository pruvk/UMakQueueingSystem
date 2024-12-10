import { useEffect, useState } from "react";
import { userService } from "@/lib/services/userService";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface User {
    userId: number;
    username: string;
    firstName: string;
    middleName: string | null;
    lastName: string | null;
    role: string;
    createdAt: string;
}

export default function StaffManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await userService.getUsers();
                setUsers(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch users");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Staff Management</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.userId}>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>
                                {[user.firstName, user.middleName, user.lastName]
                                    .filter(Boolean)
                                    .join(" ")}
                            </TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                                {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}