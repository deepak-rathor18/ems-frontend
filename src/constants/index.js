export const ROLES = { SUPER_ADMIN: 'SUPER_ADMIN', ORG_ADMIN: 'ORG_ADMIN', EMPLOYEE: 'EMPLOYEE' };
export const TOKEN_KEY = 'ems_token';
export const LEAVE_TYPES = [
  { value: 'CASUAL', label: 'Casual' },
  { value: 'SICK', label: 'Sick' },
  { value: 'PAID', label: 'Paid' },
];
export const NAV = {
  ORG_ADMIN: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/employees', label: 'Employees' },
    { to: '/departments', label: 'Departments' },
    { to: '/leaves', label: 'Leave Requests' },
  ],
  EMPLOYEE: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/profile', label: 'My Profile' },
    { to: '/my-leaves', label: 'My Leaves' },
    { to: '/leaves/apply', label: 'Apply Leave' },
  ],
  SUPER_ADMIN: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/organizations', label: 'Organizations' },
  ],
};
