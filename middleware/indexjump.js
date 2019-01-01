export default function({ redirect, route }) {
  if (route.path === '/') redirect('/news')
  // if (route.path === '/') redirect('/customManager/potentialCustom')
}
