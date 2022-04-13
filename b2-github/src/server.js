import express from 'express'
import session from 'express-session'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'
import { router } from './routes/router.js'
import helmet from 'helmet'
import cors from 'cors'
import bodyParser from 'body-parser'
try {
  const app = express()

  const httpServer = createServer(app)
  const io = new Server(httpServer)

  io.on('connection', (socket) => {
    console.log('socket.io: a user connected')

    socket.on('disconnect', () => {
      console.log('socket.io: a user disconnected')
    })
  })
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'default-src': ["'self'"],
          'script-src': ["'self'", 'https://kit.fontawesome.com/'],
          'img-src': ["'self'", 'https://gitlab.lnu.se/'],
          connectSrc: ["'self'", 'https://ka-f.fontawesome.com']
        }
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false
    })
  )
  app.set('view engine', 'ejs')

  app.use(express.json())

  app.use(express.static('./public'))

  const sessionOptions = {
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: 'strict'
    }
  }

  if (app.get('env') === 'production') {
    app.set('trust proxy', 1)
    sessionOptions.cookie.secure = true
  }
  const directoryFullName = dirname(fileURLToPath(import.meta.url))
  app.use((express.static(join(directoryFullName, '..', 'public'))))
  const baseURL = '/'
  app.use(session(sessionOptions))
  app.use((req, res, next) => {
    if (req.session.flash) {
      res.locals.flash = req.session.flash
      delete req.session.flash
    }
    res.locals.baseURL = baseURL
    res.io = io

    next()
  })

  app.use('/', cors(), router)

  app.use(function (err, req, res, next) {
    if (err.status === 404) {
      console.log(err)
      return res
        .status(404)

        .sendFile((join(directoryFullName, '..', 'views', 'errors', '404.html')))
    }

    if (req.app.get('env') !== 'development') {
      return res
        .status(500)
        .sendFile(join(directoryFullName, '..', 'views', 'errors', '500.html'))
    }

    res
      .status(err.status || 500)
      .render('errors/error', { error: err })
  })

  httpServer.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
    console.log('Press Ctrl-C to terminate...')
  })
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
