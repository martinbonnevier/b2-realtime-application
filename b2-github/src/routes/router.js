import express from 'express'
import * as issuesController from '../controllers/issues-controller.js'
import * as webhookController from '../controllers/webhook-controller.js'
import * as renderWebHook from '../controllers/renderWebHook.js'

export const router = express.Router()

router.get('/close:id', (req, res, next) => {
  issuesController.close(req, res, next)
})

router.get('/updateTitle:id', (req, res, next) => {
  issuesController.update(req, res, next)
})

router.get('/', async (req, res, next) => {
  const issues = await issuesController.getIssuesFromGitLabApi(req, next)
  res.render('pages/index', { issues: issues.data })
})

router.post('/submitNewTitle', (req, res, next) => {
  issuesController.submitNewTitle(req, res, next)
})

router.post('/webhooks', (req, res, next) => {
  webhookController.sendOk(req, res, next)
  renderWebHook.renderWebHook(req, res, next)
})

router.use('*', (req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})
