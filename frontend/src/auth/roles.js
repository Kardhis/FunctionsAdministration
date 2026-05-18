/**
 * @param {string[]|unknown} roles
 * @returns {boolean}
 */
export function isAdmin(roles) {
  return Array.isArray(roles) && roles.includes('ADMIN')
}
