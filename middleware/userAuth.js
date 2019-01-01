export default function({ redirect, route, store }) {
  if (!store.state.user.isLogin && route.path !== '/login') {
    redirect('/login')
    return
  }
}
