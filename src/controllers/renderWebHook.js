/**
 *
 * @param req
 * @param res
 * @param next
 */
export function renderWebHook (req, res, next) {
  console.log('renderWebHook')
  try {
    console.log(req.body.user.avatar_url)
    console.log('hatt, n u skickas nåt' + JSON.stringify(req.body.author))
    const data = []
    const date = req.body.object_attributes.created_at.substring(0, 10)
    const time = req.body.object_attributes.created_at.substring(11, 19)
    data.push(req.body.object_attributes.title)
    data.push(req.body.object_attributes.iid)
    data.push(req.body.object_attributes.description)
    data.push(date + ' | ' + time)
    data.push(req.body.object_attributes.state)
    data.push(req.body.user.avatar_url)

    res.io.emit('issues/index', { data: data })
  } catch (error) {
    console.log(error)
    const err = new Error('Internal Server Error')
    err.status = 500
    next(err)
  }
}
