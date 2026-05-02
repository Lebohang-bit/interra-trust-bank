export const createSession = (userData) => {
  const session = {
    userId: userData.id,
    name: userData.name,
    accountNumber: userData.accountNumber,
    timestamp: Date.now(),
    expiresAt: Date.now() + 3600000
  };
  localStorage.setItem('session', btoa(JSON.stringify(session)));
};

export const getSession = () => {
  const session = localStorage.getItem('session');
  if (!session) return null;
  
  const decoded = JSON.parse(atob(session));
  if (decoded.expiresAt < Date.now()) {
    localStorage.removeItem('session');
    return null;
  }
  return decoded;
};

export const destroySession = () => {
  localStorage.removeItem('session');
  localStorage.removeItem('isLoggedIn');
};