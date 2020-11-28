export default {
  navToggle: false,
  pageSize: 8,
  fileUploadUrl: '/fileUpload',
  globalSuccessMsg: '',
  globalErrorMsg: '',
  allMenus: [
    {
      title: '新闻管理',
      icon: 'el-icon-document',
      items: [
        { title: '文章分类', path: '/news/tags' },
        {
          title: '文章列表',
          path: '/news'
        }
      ]
    },
    {
      title: '招聘管理',
      icon: 'el-icon-news',
      path: '/recruit'
    }
    // {
    //   title: '培训成长',
    //   icon: 'el-icon-picture',
    //   path: '/trans'
    // }
  ]
}
