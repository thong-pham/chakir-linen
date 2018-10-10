import * as t from './actionTypes'
import api from 'lib/api'
import restApi from 'lib/restApi'
import messages from 'lib/text'
import settings from 'lib/settings'
import axios from 'axios'

export function exportRequest() {
  return {
    type: t.THEME_EXPORT_REQUEST
  }
}

export function exportReceive() {
  return {
    type: t.THEME_EXPORT_RECEIVE
  }
}

export function installRequest() {
  return {
    type: t.THEME_INSTALL_REQUEST
  }
}

export function installReceive() {
  return {
    type: t.THEME_INSTALL_RECEIVE
  }
}

function receiveSettings(settings) {
  return {
    type: t.SETTINGS_RECEIVE,
    settings
  }
}

function receiveEmailSettings(emailSettings) {
  return {
    type: t.EMAIL_SETTINGS_RECEIVE,
    emailSettings
  }
}

export function receiveEmailTemplate(emailTemplate) {
  return {
    type: t.EMAIL_TEMPLATE_RECEIVE,
    emailTemplate
  }
}

function requestEmailTemplate() {
  return {
    type: t.EMAIL_TEMPLATE_REQUEST
  }
}

function receiveEmailTemplates(emailTemplates) {
  return {
    type: t.EMAIL_TEMPLATES_RECEIVE,
    emailTemplates
  }
}

function requestEmailTemplates() {
  return {
    type: t.EMAIL_TEMPLATES_REQUEST
  }
}

function receiveCheckoutFields(checkoutFields) {
  return {
    type: t.CHECKOUT_FIELDS_RECEIVE,
    checkoutFields
  }
}

function receiveCheckoutField(checkoutField) {
  return {
    type: t.CHECKOUT_FIELD_RECEIVE,
    checkoutField
  }
}

function requestCheckoutField() {
  return {
    type: t.CHECKOUT_FIELD_REQUEST
  }
}

function receiveShippingMethods(shippingMethods) {
  return {
    type: t.SHIPPING_METHODS_RECEIVE,
    shippingMethods
  }
}

function receivePaymentMethods(paymentMethods) {
  return {
    type: t.PAYMENT_METHODS_RECEIVE,
    paymentMethods
  }
}

function receivePaymentGateway(paymentGatewayEdit) {
  return {
    type: t.PAYMENT_GATEWAY_RECEIVE,
    paymentGatewayEdit
  }
}

export function receiveShippingMethod(shippingMethodEdit) {
  return {
    type: t.SHIPPING_METHOD_RECEIVE,
    shippingMethodEdit
  }
}

export function receivePaymentMethod(paymentMethodEdit) {
  return {
    type: t.PAYMENT_METHOD_RECEIVE,
    paymentMethodEdit
  }
}

function receiveTokens(tokens) {
  return {
    type: t.TOKENS_RECEIVE,
    tokens
  }
}

export function receiveToken(tokenEdit) {
  return {
    type: t.TOKEN_RECEIVE,
    tokenEdit
  }
}

export function receiveNewToken(newToken) {
  return {
    type: t.NEW_TOKEN_RECEIVE,
    newToken
  }
}

export function receiveThemeSettings(settings) {
  return {
    type: t.THEME_SETTINGS_RECEIVE,
    settings
  }
}

export function receiveThemeSettingsSchema(schema) {
  return {
    type: t.THEME_SETTINGS_SCHEMA_RECEIVE,
    schema
  }
}

function receiveWebhooks(webhooks) {
  return {
    type: t.WEBHOOKS_RECEIVE,
    webhooks
  }
}

export function receiveWebhook(webhookEdit) {
  return {
    type: t.WEBHOOK_RECEIVE,
    webhookEdit
  }
}

export function fetchSettings() {
  return (dispatch, getState) => {
    // API can be not init on app start
    if (restApi) {
        return axios.get(restApi.url + "/settings", { headers: restApi.headers })
                        .then(response => {
                            dispatch(receiveSettings(response.data));
                        })
                        .catch(error => {
                            console.log(error.response);
                        })

              }
      }
}

export function fetchEmailSettings() {
    return (dispatch, getState) => {
        return axios.get(restApi.url + "/settings/email", { headers: restApi.headers })
                        .then(response => {
                            dispatch(receiveEmailSettings(response.data));
                        })
                        .catch(error => {
                            console.log(error.response);
                        })
              }
}

export function updateSettings(settings) {
    return (dispatch, getState) => {
        delete settings.logo_file;
        return axios.put(restApi.url + "/settings", settings, { headers: restApi.headers })
                      .then(response => {
                          dispatch(receiveSettings(response.data));
                      })
                      .catch(error => {
                          console.log(error.response);
                      })

              }
}

export function updateEmailSettings(emailSettings) {
    return (dispatch, getState) => {
        return axios.put(restApi.url + "/settings/email", emailSettings, { headers: restApi.headers })
                      .then(response => {
                          dispatch(receiveEmailSettings(response.data));
                      })
                      .catch(error => {
                          console.log(error.response);
                      })

               }
}

export function fetchEmailTemplates(){
    return (dispatch, getState) => {
        dispatch(requestEmailTemplates());
        return axios.get(restApi.url + "/settings/email/templates", { headers: restApi.headers })
                        .then(response => {
                            dispatch(receiveEmailTemplates(response.data));
                        })
                        .catch(error => {
                            console.log(error.response);
                        })
               }
}

export function addEmailTemplate(data){
    return (dispatch, getState) => {
        return axios.post(restApi.url + "settings/email/templates", data, { headers: restApi.headers })
                        .then(response => {
                            return response.data;
                        })
                        .catch(error => {
                            console.log(error.response);
                        })
               }
}

export function fetchEmailTemplate(templateName) {
    return (dispatch, getState) => {
        dispatch(requestEmailTemplate())
        return axios.get(restApi.url + "/settings/email/templates/" + templateName, { headers: restApi.headers })
                        .then(response => {
                            dispatch(receiveEmailTemplate(response.data));
                        })
                        .catch(error => {
                            console.log(error.response);
                        })
              }
}

export function updateEmailTemplate(emailTemplate) {
    return (dispatch, getState) => {
        return axios.put(restApi.url + "/settings/email/templates/" + emailTemplate.name, emailTemplate, { headers: restApi.headers })
                      .then(response => {
                          dispatch(receiveEmailTemplate(response.data));
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function fetchCheckoutFields() {
    return (dispatch, getState) => {
        return api.checkoutFields.list().then(({status, json}) => {
          dispatch(receiveCheckoutFields(json))
        }).catch(error => {});
    }
}

export function fetchCheckoutField(fieldName) {
    return (dispatch, getState) => {
        dispatch(requestCheckoutField())
        return api.checkoutFields.retrieve(fieldName).then(({status, json}) => {
          json.fieldName = fieldName;
          dispatch(receiveCheckoutField(json))
        }).catch(error => {});
    }
}

export function updateCheckoutField(checkoutField) {
    return (dispatch, getState) => {
        return api.checkoutFields.update(checkoutField.fieldName, checkoutField).then(({status, json}) => {
          json.fieldName = fieldName;
          dispatch(receiveCheckoutField(json))
        }).catch(error => {});
    }
}

export function fetchShippingMethods() {
    return (dispatch, getState) => {
        return axios.get(restApi.url + "/shipping_methods", { headers: restApi.headers })
                      .then(response => {
                          dispatch(receiveShippingMethods(response.data));
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function fetchPaymentMethods() {
    return (dispatch, getState) => {
        return axios.get(restApi.url + "/payment_methods", { headers: restApi.headers })
                      .then(response => {
                          dispatch(receivePaymentMethods(response.data));
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function updateShippingMethod(method) {
    return (dispatch, getState) => {
        return axios.put(restApi.url + "/shipping_methods/" + method.id, method, { headers: restApi.headers })
                      .then(response => {
                          dispatch(fetchShippingMethods());
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function updatePaymentMethod(method) {
    return (dispatch, getState) => {
        return axios.put(restApi.url + "/payment_methods/" + method.id, method, { headers: restApi.headers })
                      .then(response => {
                          dispatch(fetchPaymentMethods());
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function fetchShippingMethod(id) {
    return (dispatch, getState) => {
        return axios.get(restApi.url + "/shipping_methods/" + id, { headers: restApi.headers })
                      .then(response => {
                          dispatch(receiveShippingMethod(response.data));
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
               }
}

export function fetchPaymentMethod(id) {
    return (dispatch, getState) => {
        return axios.get(restApi.url + "/payment_methods/" + id, { headers: restApi.headers })
                      .then(response => {
                          dispatch(receivePaymentMethod(response.data));
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function deleteShippingMethod(methodId) {
    return (dispatch, getState) => {
        return axios.delete(restApi.url + "/shipping_methods/" + id, { headers: restApi.headers })
                      .then(response => {
                          dispatch(fetchShippingMethods());
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function deletePaymentMethod(methodId) {
    return (dispatch, getState) => {
        return axios.delete(restApi.url + "/payment_methods/" + id, { headers: restApi.headers })
                      .then(response => {
                          dispatch(fetchPaymentMethods());
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function createShippingMethod(method) {
    return (dispatch, getState) => {
        return axios.post(restApi.url + "/shipping_methods", method, { headers: restApi.headers })
                      .then(response => {
                          dispatch(fetchShippingMethods());
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function createPaymentMethod(method) {
    return (dispatch, getState) => {
        return axios.post(restApi.url + "/payments_methods", method, { headers: restApi.headers })
                      .then(response => {
                          dispatch(fetchPaymentMethods());
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
               }
}

export function fetchTokens() {
    return (dispatch, getState) => {
        return axios.get(restApi.url + "/security/tokens", { headers: restApi.headers })
                      .then(response => {
                          dispatch(receiveTokens(response.data));
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function fetchToken(id) {
    return (dispatch, getState) => {
        return axios.get(restApi.url + "/security/tokens/" + id, { headers: restApi.headers })
                      .then(response => {
                          dispatch(receiveToken(response.data));
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function createToken(token) {
    return (dispatch, getState) => {
        return axios.post(restApi.url + "/security/tokens", token, { headers: restApi.headers })
                      .then(response => {
                          dispatch(fetchTokens());
                          dispatch(receiveNewToken(response.data.token))
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function updateToken(token) {
    return (dispatch, getState) => {
        return axios.put(restApi.url + "/security/tokens/" + token.id, token, { headers: restApi.headers })
                      .then(response => {
                          dispatch(fetchTokens());
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function deleteToken(tokenId) {
    return (dispatch, getState) => {
        return axios.delete(restApi.url + "/security/tokens/" + tokenId, { headers: restApi.headers })
                      .then(response => {
                          dispatch(fetchTokens());
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function fetchPaymentGateway(gatewayName) {
    return (dispatch, getState) => {
        if(gatewayName && gatewayName.length > 0){
            return axios.get(restApi.url + "/payment_gateways/" + gatewayName, { headers: restApi.headers })
                          .then(response => {
                              dispatch(receivePaymentGateway(response.data));
                          })
                          .catch(error => {
                              console.log(error.response);
                          })
        } else {
            dispatch(receivePaymentGateway(null))
        }
    }
}

export function updatePaymentGateway(gatewayName, data) {
    return (dispatch, getState) => {
        return axios.put(restApi.url + "/payment_gateways/" + gatewayName, data, { headers: restApi.headers })
                      .then(response => {
                          dispatch(receivePaymentGateway(response.data));
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function uploadLogo(form) {
    return (dispatch, getState) => {
        return axios.post(restApi.url + "/settings/logo", form, { headers: restApi.headers })
                      .then(response => {
                          dispatch(fetchSettings());
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function deleteLogo() {
    return (dispatch, getState) => {
        return axios.delete(restApi.url + "/settings/logo", { headers: restApi.headers })
                      .then(response => {
                          if (response.status === 200){
                              dispatch(fetchSettings());
                          } else {
                              console.log(response.status);
                          }
                      })
                      .catch(error => {
                          console.log(error.response);
                      })

               }
}

export function fetchThemeSettings() {
    return (dispatch, getState) => {
        return Promise.all([
            axios.get(restApi.url + "/theme/settings", { headers: restApi.headers }),
            axios.get(restApi.url + "/theme/settings_schema", { headers: restApi.headers })
        ])
        .then(([ settingsResponse, schemaResponse ]) => {
            dispatch(receiveThemeSettings(settingsResponse.data));
            dispatch(receiveThemeSettingsSchema(schemaResponse.data));
        })
        .catch(error => {
            console.log(error.response);
        });
    }
}

export function updateThemeSettings(settings) {
    return (dispatch, getState) => {
        return axios.put(restApi.url + "/theme/settings", settings, { headers: restApi.headers })
                      .then(response => {
                          dispatch(fetchThemeSettings());
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function fetchWebhooks() {
    return (dispatch, getState) => {
        return axios.get(restApi.url + "/webhooks", { headers: restApi.headers })
                      .then(response => {
                          dispatch(receiveWebhooks(response.data));
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function fetchWebhook(id) {
    return (dispatch, getState) => {
        return axios.get(restApi.url + "/webhooks/" + id, { headers: restApi.headers })
                      .then(response => {
                          dispatch(receiveWebhook(response.data));
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function createWebhook(webhook) {
    return (dispatch, getState) => {
        return axios.post(restApi.url + "/webhooks", webhook, { headers: restApi.headers })
                      .then(response => {
                          dispatch(fetchWebhooks());
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function updateWebhook(webhook) {
    return (dispatch, getState) => {
        return axios.put(restApi.url + "/webhooks/" + webhook.id, webhook, { headers: restApi.headers })
                      .then(response => {
                          dispatch(fetchWebhooks());
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function deleteWebhook(webhookId) {
    return (dispatch, getState) => {
        return axios.delete(restApi.url + "/webhooks/" + webhookId, { headers: restApi.headers })
                      .then(response => {
                          dispatch(fetchWebhooks());
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}
