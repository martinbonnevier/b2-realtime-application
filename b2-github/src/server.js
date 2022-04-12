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
  // Creates an Express application.
  const app = express()

  // Create an HTTP server and pass it to Socket.IO.
  const httpServer = createServer(app)
  const io = new Server(httpServer)

  // Not necessary, but nice to log when a user connects/disconnects.
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
    name: process.env.SESSION_NAME, // Don't use default session cookie name.
    secret: process.env.SESSION_SECRET, // Change it!!! The secret is used to hash the session with HMAC.
    resave: false, // Resave even if a request is not changing the session.
    saveUninitialized: false, // Don't save a created but not modified session.
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: 'strict'
    }
  }

  if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sessionOptions.cookie.secure = true // serve secure cookies
  }
  const directoryFullName = dirname(fileURLToPath(import.meta.url))
  console.log(directoryFullName)
  console.log(join(directoryFullName, '..', 'public'))
  app.use((express.static(join(directoryFullName, '..', 'public'))))
  // Set the base URL to use for all relative URLs in a document.
  const baseURL = '/'
  app.use(session(sessionOptions))
  app.use((req, res, next) => {
    // Flash messages - survives only a round trip.
    if (req.session.flash) {
      res.locals.flash = req.session.flash
      delete req.session.flash
    }

    // Pass the base URL to the views.
    res.locals.baseURL = baseURL

    // Add the io object to the response object to make it available in controllers.
    res.io = io

    next()
  })

  app.use('/', cors(), router)

  app.use(function (err, req, res, next) {
    // 404 Not Found.
    if (err.status === 404) {
      console.log(err)
      return res
        .status(404)

        .sendFile((join(directoryFullName, '..', 'views', 'errors', '404.html')))
    }

    // 500 Internal Server Error (in production, all other errors send this response).
    if (req.app.get('env') !== 'development') {
      return res
        .status(500)
        .sendFile(join(directoryFullName, '..', 'views', 'errors', '500.html'))
    }

    // Development only!
    // Only providing detailed error in development.

    // Render the error page.
    res
      .status(err.status || 500)
      .render('errors/error', { error: err })
  })
  // Starts the HTTP server listening for connections.
  httpServer.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
    console.log('Press Ctrl-C to terminate...')
  })
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
