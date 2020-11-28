// 网络请求api列表
module.exports = {
  api() {
    return {
      login: '/backend/account/login',
      allBuckets: '/backend/account/allBuckets',
      accountCreate: '/backend/account/create',
      accountUpdate: '/backend/account/update',
      accounts: '/backend/account',
      accountRole: '/backend/account/bucket/roles',
      menus: '/backend/menu',
      parentMenus: '/backend/menu/parentMenus',
      menuCreate: '/backend/menu/create',
      menuUpdate: '/backend/menu/update',
      roles: '/backend/role',
      roleCreate: '/backend/role/create',
      roleUpdate: '/backend/role/update',
      roleMenus: '/backend/role/menus',
      roleAuths: '/backend/role/auths'
    }
  }
}
