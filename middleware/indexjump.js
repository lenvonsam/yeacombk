import _ from 'lodash'
export default function({ redirect, route, store }) {
  // console.log('state', store)
  // redirect('/news')
  if (route.path === '/') {
    const u = store.state.user.currentUser
    if (u.acctLevel === 3) {
      store.state.currentMenus = store.state.allMenus
      redirect('/news')
    } else {
      const originMenus = u.perms.map(item => item.menu)
      let menus = []
      originMenus.map(item => {
        if (item.parent) {
          const parentMenu = item.parent
          const index = menus.findIndex(m => m.title === parentMenu.name)
          if (index < 0) {
            menus.push({
              title: parentMenu.name,
              icon: parentMenu.iconName,
              factOrder: parentMenu.factOrder,
              items: [
                {
                  title: item.name,
                  path: item.path
                }
              ]
            })
          } else {
            const subObj = menus[index]
            const subIdx = subObj.items.findIndex(m => m.title === item.name)
            if (subIdx < 0) {
              subObj.items.push({
                title: item.name,
                path: item.path,
                factOrder: item.factOrder
              })
              menus[index] = subObj
            }
          }
        } else {
          const index = menus.findIndex(m => m.title === item.name)
          if (index < 0) {
            const obj = {
              title: item.name,
              icon: item.iconName
            }
            if (item.path) {
              obj.path = item.path
            } else {
              obj.items = []
            }
            menus.push(obj)
          }
        }
      })
      menus = _.orderBy(menus, ['factOrder', 'asc'])
      store.state.currentMenus = menus
      const item = menus[0]
      let path = ''
      if (item.path) path = item.path
      else path = item.items[0]['path']
      redirect(path)
    }
  }
  // if (route.path === '/') redirect('/customManager/potentialCustom')
}
