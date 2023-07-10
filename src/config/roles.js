const { ROLES } = require('../config/constant')
const roles = [ROLES.ADMIN, ROLES.STAFF_MEMBERS, ROLES.CLIENT, ROLES.CUSTOMER];
const roleRights = new Map();

roleRights.set(roles[0], ["customer", "dashboard", "profile", "job", 'support', 'dispute', 'staff', 'paymentHistory', 'notifications']);
roleRights.set(roles[1], ['customer', 'profile', 'support', 'dashboard', "job", 'dispute', 'staff', 'notifications']);
roleRights.set(roles[2], ['job', 'milestone', 'customer', 'dashboard', 'profile', 'milestone', 'payment', 'support', 'dispute', 'notifications']);

module.exports = {
  roles,
  roleRights,
};
