const { expect } = require('chai')

const ValidatorBuilder = require('../../src/validator/validator-builder')
const {
  GET_PAYMENT_METHODS_REQUEST_INVALID_JSON,
  MAKE_PAYMENT_REQUEST_INVALID_JSON,
  SUBMIT_ADDITIONAL_PAYMENT_DETAILS_REQUEST_INVALID_JSON,
  AMOUNT_PLANNED_NOT_SAME,
  MAKE_PAYMENT_REQUEST_MISSING_REFERENCE,
  MISSING_REQUIRED_FIELDS_ADYEN_MERCHANT_ACCOUNT,
  MISSING_REQUIRED_FIELDS_CTP_PROJECT_KEY,
  GET_CARBON_OFFSET_COSTS_REQUEST_INVALID_JSON,
} = require('../../src/validator/error-messages')

describe('Validator builder', () => {
  it('on invalid JSON validateRequestFields() should return error object', () => {
    const invalidJSONContent = '{"a"}'
    const invalidPayment = {
      custom: {
        fields: {
          getPaymentMethodsRequest: invalidJSONContent,
          makePaymentRequest: invalidJSONContent,
          submitAdditionalPaymentDetailsRequest: invalidJSONContent,
          getCarbonOffsetCostsRequest: invalidJSONContent,
        },
      },
    }
    const errorObject = ValidatorBuilder.withPayment(invalidPayment)
      .validateRequestFields()
      .getErrors()
    expect(errorObject[0].message).to.equal(
      GET_PAYMENT_METHODS_REQUEST_INVALID_JSON
    )
    expect(errorObject[1].message).to.equal(MAKE_PAYMENT_REQUEST_INVALID_JSON)
    expect(errorObject[2].message).to.equal(
      SUBMIT_ADDITIONAL_PAYMENT_DETAILS_REQUEST_INVALID_JSON
    )
    expect(errorObject[3].message).to.equal(
      GET_CARBON_OFFSET_COSTS_REQUEST_INVALID_JSON
    )
  })

  it(
    'payment has different amountPlanned and amount in makePaymentRequest custom field ' +
      'and interface interaction is empty, ' +
      'validateAmountPlanned() should return error object',
    () => {
      const payment = {
        amountPlanned: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 10,
          fractionDigits: 2,
        },
        custom: {
          fields: {
            makePaymentRequest: JSON.stringify({
              amount: {
                currency: 'EUR',
                value: 1000,
              },
            }),
          },
        },
        interfaceInteractions: [],
      }
      const errorObject = ValidatorBuilder.withPayment(payment)
        .validateAmountPlanned()
        .getErrors()
      expect(errorObject[0].message).to.equal(AMOUNT_PLANNED_NOT_SAME)
    }
  )

  it(
    'payment has different amountPlanned and amount in makePaymentRequest interface interaction, ' +
      'validateAmountPlanned() should return error object',
    () => {
      const payment = {
        amountPlanned: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 10,
          fractionDigits: 2,
        },
        custom: {
          fields: {
            makePaymentRequest: JSON.stringify({
              amount: {
                currency: 'EUR',
                value: 10,
              },
            }),
          },
        },
        interfaceInteractions: [
          {
            fields: {
              type: 'makePayment',
              request: JSON.stringify({
                amount: {
                  currency: 'EUR',
                  value: 10,
                },
              }),
              createdAt: '2018-05-14T07:18:37.560Z',
            },
          },
          {
            fields: {
              type: 'makePayment',
              request: JSON.stringify({
                amount: {
                  currency: 'EUR',
                  value: 1000,
                },
              }),
              createdAt: '2020-05-14T07:18:37.560Z',
            },
          },
          {
            fields: {
              type: 'makePayment',
              request: JSON.stringify({
                amount: {
                  currency: 'EUR',
                  value: 10,
                },
              }),
              createdAt: '2019-05-14T07:18:37.560Z',
            },
          },
        ],
      }

      const errorObject = ValidatorBuilder.withPayment(payment)
        .validateAmountPlanned()
        .getErrors()
      expect(errorObject[0].message).to.equal(AMOUNT_PLANNED_NOT_SAME)
    }
  )

  it('on missing reference in makePaymentRequest should return error object', () => {
    const makePaymentRequestDraft = {
      paymentMethod: {
        type: 'klarna',
      },
      amount: {
        currency: 'EUR',
        value: 1000,
      },
      shopperLocale: 'de_DE',
      countryCode: 'DE',
      shopperEmail: 'youremail@email.com',
      shopperReference: 'YOUR_UNIQUE_SHOPPER_ID',
      returnUrl: 'https://www.yourshop.com/checkout/result',
    }
    const invalidPayment = {
      custom: {
        fields: {
          makePaymentRequest: JSON.stringify(makePaymentRequestDraft),
        },
      },
    }
    const errorObject = ValidatorBuilder.withPayment(invalidPayment)
      .validateReference()
      .getErrors()

    expect(errorObject[0].message).to.equal(
      MAKE_PAYMENT_REQUEST_MISSING_REFERENCE
    )
  })

  it('on missing commercetoolsProjectKey in custom fields should return error object', () => {
    const invalidPayment = {
      custom: {
        fields: {
          adyenMerchantAccount: 'foo',
        },
      },
    }
    const errorObject = ValidatorBuilder.withPayment(invalidPayment)
      .validateMetadataFields()
      .getErrors()

    expect(errorObject[0].message).to.equal(
      MISSING_REQUIRED_FIELDS_CTP_PROJECT_KEY
    )
  })

  it('on missing adyenMerchantAccount in custom fields should return error object', () => {
    const invalidPayment = {
      custom: {
        fields: {
          commercetoolsProjectKey: 'bar',
        },
      },
    }
    const errorObject = ValidatorBuilder.withPayment(invalidPayment)
      .validateMetadataFields()
      .getErrors()

    expect(errorObject[0].message).to.equal(
      MISSING_REQUIRED_FIELDS_ADYEN_MERCHANT_ACCOUNT
    )
  })

  it('on missing required custom fields should return error object', () => {
    const invalidPayment = {
      custom: {
        fields: {
          commercetoolsProjectKey: ' white spaced projectKey',
          adyenMerchantAccount: ' ',
        },
      },
    }
    const errorObject = ValidatorBuilder.withPayment(invalidPayment)
      .validateMetadataFields()
      .getErrors()

    expect(errorObject[0].message).to.equal(
      MISSING_REQUIRED_FIELDS_CTP_PROJECT_KEY
    )
    expect(errorObject[1].message).to.equal(
      MISSING_REQUIRED_FIELDS_ADYEN_MERCHANT_ACCOUNT
    )
  })
})
