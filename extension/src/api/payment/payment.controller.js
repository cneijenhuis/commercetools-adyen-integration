const serializeError = require('serialize-error')
const httpUtils = require('../../utils')
const creditCardHandler = require('../../paymentHandler/creditCard/credit-card.handler')
const paypalHandler = require('../../paymentHandler/paypal/paypal.handler')
const kcpHandler = require('../../paymentHandler/kcp/kcp-payment.handler')
const refundHandler = require('../../paymentHandler/cancel-or-refund.handler')
const fetchPaymentMethodsHandler = require('../../paymentHandler/fetch-payment-methods.handler')
const ValidatorBuilder = require('../../validator/validator-builder')

const paymentHandlers = {
  creditCardHandler,
  fetchPaymentMethodsHandler,
  paypalHandler,
  kcpHandler,
  refundHandler
}

async function processRequest (request, response) {
  if (request.method !== 'POST')
  // API extensions always calls this endpoint with POST, so if we got GET, we don't process further
  // https://docs.commercetools.com/http-api-projects-api-extensions#input
    return httpUtils.sendResponse({ response })

  const paymentObject = await _getPaymentObject(request)
  const paymentResult = await processPayment(paymentObject)

  return httpUtils.sendResponse({
    response,
    statusCode: paymentResult.success ? 200 : 400,
    data: paymentResult.data
  })
}

async function processPayment (paymentObject) {
  const validatorBuilder = ValidatorBuilder.withPayment(paymentObject)
  const adyenValidator = validatorBuilder
    .validateAdyen()
  if (adyenValidator.hasErrors())
  // if it's not adyen payment, ignore the payment
    return { success: true, data: null }
  const interfaceIdValidator = validatorBuilder
    .validateInterfaceIdField()
  if (interfaceIdValidator.hasErrors())
    return {
      success: false,
      data: interfaceIdValidator.buildCtpErrorResponse()
    }
  const paymentMethodValidator = validatorBuilder.validatePaymentMethod()
  if (paymentMethodValidator.hasErrors())
    return {
      success: false,
      data: paymentMethodValidator.buildCtpErrorResponse()
    }
  const handler = _getPaymentHandler(paymentObject)
  const handlerResponse = await handler.handlePayment(paymentObject)
  if (handlerResponse.errors)
    return { success: false, data: handlerResponse }
  return { success: true, data: handlerResponse }
}

async function _getPaymentObject (request) {
  const body = await httpUtils.collectRequestData(request)
  try {
    const requestBody = JSON.parse(body)
    return requestBody.resource.obj
  } catch (err) {
    throw new Error(`Error during parsing CTP request: '${body}'. Ending the process. `
      + `Error: ${JSON.stringify(serializeError(err))}`)
  }
}

function _getPaymentHandler (paymentObject) {
  const paymentValidator = ValidatorBuilder.withPayment(paymentObject)
  if (paymentValidator.isCancelOrRefund())
    return paymentHandlers.refundHandler
  if (paymentValidator.isPaypal())
    return paymentHandlers.paypalHandler
  if (paymentValidator.isCreditCard())
    return paymentHandlers.creditCardHandler
  if (paymentValidator.isKcp())
    return paymentHandlers.kcpHandler
  return paymentHandlers.fetchPaymentMethodsHandler
}

module.exports = { processRequest }
