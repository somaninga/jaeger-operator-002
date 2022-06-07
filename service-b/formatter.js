const opentracing = require('opentracing')
const tracer = opentracing.globalTracer()

function formatGreeting(req, res) {
  // Parse the handler input
  const span = tracer.startSpan('format-greeting', { childOf: req.span })
  const name = req.query.name
  span.log({ event: 'format', message: `formatting message remotely for name ${name}` })
  const response = `Hello from service-b ${name}!`
  const baggage = span.getBaggageItem('my-baggage')
  span.log({ event: 'baggage', message: `this is baggage ${baggage}` })
  span.finish()
  res.send(response)
}
module.exports = formatGreeting
