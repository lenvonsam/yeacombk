const Koa = require('koa')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const axios = require('axios')
const Qs = require('qs')

const bodyParser = require('koa-bodyparser')
const Router = require('koa-router')
const koaBody = require('koa-body')
const request = require('request')
const fs = require('fs')
const session = require('koa-session')
const app = new Koa()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 4000
const APILIST = require('../utils/apiList').api()
// const bkProxyUrl = 'http://localhost:8668'
// const bkProxyUrl = 'http://showcase.thinkingsam.cn/yeacom-server'
const bkProxyUrl = 'http://server.yeacom.cn/yeacom-server'

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(app.env === 'production')

async function start() {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }
  app.keys = ['yeacom backend client']
  app.use(bodyParser())
  app.use(session(config.sessionConfig, app))
  let router = new Router()
  // router.get('/hello', async ctx => {
  //   console.log(ctx.session)
  //   let keys = Object.keys(ctx.session)
  //   console.log('session keys', ctx.session.text)
  //   if (ctx.session.currentUser) {
  //     console.log('session exist', ctx.session)
  //   } else {
  //     console.log('没有值')
  //     ctx.session = {
  //       currentUser: {
  //         id: 1,
  //         name: '133123'
  //       }
  //     }
  //   }

  //   ctx.body = {
  //     return_code: 0
  //   }
  // })

  router.post('/logout', async ctx => {
    if (ctx.session.currentUser) delete ctx.session.currentUser
    ctx.body = { return_code: 0 }
  })

  router.post(
    '/fileupload',
    koaBody({
      multipart: true,
      formidable: {
        maxFileSize: 20 * 1024 * 1024 // 设置上传文件大小最大限制，默认2M
      }
    }),
    async ctx => {
      console.log('reqbody', ctx.request.body)
      console.log('filepath:>>', ctx.request.files.img.path)
      // ctx.body = {
      //   code: 0,
      //   data: { url: 'xxx' }
      // }
      // return
      let reqBody = ctx.request.body
      let data = await fileRequst({
        formData: {
          file: fs.createReadStream(ctx.request.files.img.path),
          prefix: reqBody.action || ''
        },
        headers: {
          Authorization: ctx.session.usertk
        }
      })
      console.log('resp data', data)
      // 'http://pic1.win4000.com/wallpaper/3/53e1baf5d6ce4.jpg'
      if (data.status == 403 && data.error == 'Forbidden')
        delete ctx.session.currentUser
      ctx.body = {
        code: 0,
        data: { url: data.filePath }
      }
    }
  )

  router.post('/proxy', bodyParser(), async ctx => {
    console.log('body:>.', ctx.request.body)
    console.log(ctx.request.header)
    const body = ctx.request.body

    try {
      let header = {}
      if (ctx.session.usertk) header.Authorization = ctx.session.usertk
      let { data } = await axiosRequest({
        method: body.method,
        url: bkProxyUrl + body.url,
        params: body.params,
        headers: header
      })
      console.log('result>>', data)
      if (body.url == APILIST.login && data.return_code == 0) {
        delete data.user.pwd
        const u = data.user
        if (data.permissions) {
          u.perms = data.permissions
        }
        ctx.session = {
          usertk: data.token,
          currentUser: u
        }
        delete data.token
      }
      if (data.status == 403 && data.error == 'Forbidden')
        delete ctx.session.currentUser
      ctx.body = data
    } catch (e) {
      console.error(e)
      ctx.body = {
        code: -1
      }
    }
  })

  app.use(router.routes()).use(router.allowedMethods())

  app.use(ctx => {
    ctx.status = 200 // koa defaults to 404 when it sees that status is unset
    ctx.req.session = ctx.session
    return new Promise((resolve, reject) => {
      ctx.res.on('close', resolve)
      ctx.res.on('finish', resolve)
      nuxt.render(ctx.req, ctx.res, promise => {
        // nuxt.render passes a rejected promise into callback on error.
        promise.then(resolve).catch(reject)
      })
    })
  })

  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}

start()

function axiosRequest(config) {
  return axios({
    method: config.method,
    url: config.url,
    params: config.params,
    paramsSerializer: function(params) {
      return Qs.stringify(params, { arrayFormat: 'brackets' })
    },
    headers: config.headers || {}
  })
}

function fileRequst(config) {
  return new Promise((resolve, reject) => {
    request.post(
      {
        url: bkProxyUrl + '/backend/file/upload',
        formData: config.formData,
        headers: config.headers
      },
      function(err, resp, body) {
        if (err) {
          reject(err)
        } else {
          resolve(JSON.parse(body))
        }
      }
    )
  })
}
