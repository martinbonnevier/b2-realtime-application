
/**
 *
 * @param req
 * @param res
 * @param next
 */
export function authenticate (req, res, next) {
  // Use the GitLab secret token to validate the received payload.
  console.log(req.headers['x-gitlab-token'])
  console.log(process.env.WEBHOOK_SECRET)

  if (req.headers['x-gitlab-token'] !== process.env.WEBHOOK_SECRET) {
    const error = new Error('Invalid token')
    error.status = 401
    next(error)
    return
  }

  next()
}

/**
 *
 * @param req
 * @param res
 * @param next
 */
export function sendOk (req, res, next) {
  try {
    res.status(200).end()

    console.log('Sent ok')
    // console.log(JSON.stringify(req.body.object_attributes))

    next()
  } catch (error) {
    const err = new Error('Internal Server Error')
    err.status = 500
    next(err)
  }
}
