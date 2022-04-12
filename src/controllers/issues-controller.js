import axios from 'axios'
/**
 *
 * @param req
 * @param res
 * @param next
 */
export async function close (req, res, next) {
  console.log('close')
  // console.log(req.params.id+process.env.GITLAB_ACCESS_TOKEN)
  const id = req.params.id.substring(1, req.params.id.length)
  console.log(id)

  const headers = {
    headers: {
      Authorization: `Bearer ${process.env.GITLAB_ACCESS_TOKEN}`
    }
  }
  try {
    const close = await axios.put(`https://gitlab.lnu.se/api/v4/projects/13956/issues/${id}?state_event=close`, {}, headers)
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
 *
 * @param req
 * @param res
 * @param next
 */
export async function update (req, res, next) {
  console.log('update')
  console.log(req.params.id)
  const url = 'https://gitlab.lnu.se/api/v4/projects/13956/issues/' + req.params.id.substring(1, req.params.id.length)

  const headers = {
    headers: {
      Authorization: `Bearer ${process.env.GITLAB_ACCESS_TOKEN}`
    }

    // res.render('pages/update-title', { id: data })

  }
  const issue = await axios.get(url, headers)
  // console.log(issue.data)
  res.render('pages/update-title', { issue: issue.data })
}

/**
 *
 * @param req
 * @param res
 * @param next
 */
export async function submitNewTitle (req, res, next) {
  console.log('submitNewTitle2')

  console.log(req.body.id)
  const id = req.body.id
  const newTitle = req.body.newTitle

  const headers = {
    headers: {
      Authorization: `Bearer ${process.env.GITLAB_ACCESS_TOKEN}`
    }
  }
  try {
    const updateTitle = await axios.put(`https://gitlab.lnu.se/api/v4/projects/13956/issues/${id}?title=${newTitle}`, {}, headers)
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
 *
 * @param req
 */
export async function getIssuesFromGitLabApi (req) {
  console.log('fläskis')
  const url = 'https://gitlab.lnu.se/api/v4/projects/13956/issues?state=opened'
  const headers = {
    headers: {
      Authorization: `Bearer ${process.env.GITLAB_ACCESS_TOKEN}`
    }
  }
  try {
    const issues = await axios.get(url, headers)
    // console.log(issues.data.iid)
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
