const opentracing = require('opentracing')
const tracer = opentracing.globalTracer()

let counter = 1
const sayHello = async (req, res) => {
  // Parse the handler input
  const span = tracer.startSpan('say-hello', { childOf: req.span })
  const name = req.params.name
  // simulate a slow request every 3 requests
  span.log({ event: 'name', message: `this is a log message for name ${name}` })
  span.setBaggageItem('my-baggage', name)
  const response = await formatGreetingRemote(name, span);
  span.setTag('response', response)
  span.finish()
  res.send(response)

}

function formatGreeting(name, parent) {
  const span = tracer.startSpan('format-greeting', { childOf: parent })
  span.log({ event: 'format', message: `formatting message locally for name ${name}` })
  const response = `Hello ${name}!`
  span.finish()
  return response
}

const bent = require('bent')

const formatGreetingRemote = async (name, span) => {
  const service = process.env.SERVICE_FORMATTER || 'service-b.observability'
  const servicePort = process.env.SERVICE_FORMATTER_PORT || '8081'
  const url = `http://${service}:${servicePort}/formatGreeting?name=${name}`
  const headers = {}
  tracer.inject(span, opentracing.FORMAT_HTTP_HEADERS, headers)
  const request = bent('string', headers)
  const response = await request(url)
  return response
}

module.exports = sayHello
