export const isAdmin = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'admin';
  } catch {
    return false;
  }
};

export const getUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return {
      username: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/name'],
      role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    };
  } catch {
    return null;
  }
}; 