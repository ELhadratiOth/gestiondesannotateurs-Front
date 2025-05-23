export function redirectToUnauthorizedRoute() {
  console.log('Redirecting to unauthorized route');
  const user = localStorage.getItem('user');
  let role = null;

  try {
    role = JSON.parse(user)?.role || null;
  } catch {
    role = null;
  }
  console.log('User role:', role);

  const currentPath = window.location.pathname;

  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
//     window.location.href = '/dashboard';
  } else if (role === 'ANNOTATOR') {
    window.location.href = '/space';
  } else if (!role && currentPath !== '/') {
    window.location.href = '/';
  }
}
