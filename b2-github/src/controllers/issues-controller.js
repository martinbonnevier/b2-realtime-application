import axios from 'axios'

/**
 * Function for closing an issue.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function close (req, res, next) {
  const id = req.params.id.substring(1, req.params.id.length)
  const headers = {
    headers: {
      Authorization: `Bearer ${process.env.GITLAB_ACCESS_TOKEN}`
    }
  }
  try {
    await axios.put(`https://gitlab.lnu.se/api/v4/projects/13956/issues/${id}?state_event=close`, {}, headers)
    req.session.flash = { type: 'success', text: 'The issue was closed successfully.' }
    res.redirect('/')
  } catch (error) {
    console.log(error)
    const err = new Error('Internal Server Error')
    err.status = 500
    next(err)
  }
}
/**
 *  Function for updating an issue.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function update (req, res, next) {
  const url = 'https://gitlab.lnu.se/api/v4/projects/13956/issues/' + req.params.id.substring(1, req.params.id.length)
  const headers = {
    headers: {
      Authorization: `Bearer ${process.env.GITLAB_ACCESS_TOKEN}`
    }
  }
  const issue = await axios.get(url, headers)
  res.render('pages/update-title', { issue: issue.data })
}

/**
 *  Function for updating an issue title.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function submitNewTitle (req, res, next) {
  const id = req.body.id
  const newTitle = req.body.newTitle

  const headers = {
    headers: {
      Authorization: `Bearer ${process.env.GITLAB_ACCESS_TOKEN}`
    }
  }
  try {
    await axios.put(`https://gitlab.lnu.se/api/v4/projects/13956/issues/${id}?title=${newTitle}`, {}, headers)
    req.session.flash = { type: 'success', text: 'The issue title was updated successfully.' }
    res.redirect('/')
  } catch (error) {
    console.log(error)
    const err = new Error('Internal Server Error')
    err.status = 500
    next(err)
  }
}

/**
 *  Function for getting issues from GitLab.
 *
 * @param {object} req - Express request object.
 * @param {Function} next - Express next middleware function.
 */
export async function getIssuesFromGitLabApi (req, next) {
  const url = 'https://gitlab.lnu.se/api/v4/projects/13956/issues?state=opened'
  const headers = {
    headers: {
      Authorization: `Bearer ${process.env.GITLAB_ACCESS_TOKEN}`
    }
  }
  try {
    const issues = await axios.get(url, headers)
    for (let i = 0; i < issues.data.length; i++) {
      const date = issues.data[i].created_at.substring(0, 10)
      const time = issues.data[i].created_at.substring(11, 19)
      const avatarUrl = issues.data[i].author.avatar_url
      issues.data[i].date = date
      issues.data[i].time = time
      issues.data[i].avatarUrl = avatarUrl
    }

    return issues
  } catch (error) {
    console.log(error)
    const err = new Error('Internal Server Error')
    err.status = 500
    next(err)
  }
}
