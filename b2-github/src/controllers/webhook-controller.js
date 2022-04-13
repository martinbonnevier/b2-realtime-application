
/**
 * Function for checking that secret token is valid.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export function authenticate (req, res, next) {
  if (req.headers['x-gitlab-token'] !== process.env.WEBHOOK_SECRET) {
    const error = new Error('Invalid token')
    error.status = 401
    next(error)
    return
  }
  next()
}

/**
 * Function for sending a response to GitLab.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export function sendOk (req, res, next) {
  try {
    res.status(200).end()
    next()
  } catch (error) {
    const err = new Error('Internal Server Error')
    err.status = 500
    next(err)
  }
}
