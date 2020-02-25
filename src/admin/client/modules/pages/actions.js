import * as t from './actionTypes'
import api from 'lib/api'
import restApi from 'lib/restApi'
import axios from 'axios'
import messages from 'lib/text'

function receivePages(pages) {
  return {
    type: t.PAGES_RECEIVE,
    pages
  }
}

export function receivePage(pageEdit) {
  return {
    type: t.PAGE_RECEIVE,
    pageEdit
  }
}

export function fetchPages() {
    return (dispatch, getState) => {
        return axios.get(restApi.url + "/pages", { headers: restApi.headers})
                      .then(response => {
                          dispatch(receivePages(response.data));
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function fetchPage(id) {
    return (dispatch, getState) => {
        return axios.get(restApi.url + "/pages/" + id, { headers: restApi.headers})
                      .then(response => {
                          dispatch(receivePage(response.data));
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function createPage(page) {
    return (dispatch, getState) => {
        return axios.post(restApi.url + "/pages", page, { headers: restApi.headers})
                      .then(response => {
                          dispatch(fetchPages());
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function updatePage(page) {
    return (dispatch, getState) => {
        return axios.put(restApi.url + "/pages/" + page.id, page, { headers: restApi.headers})
                      .then(response => {
                          dispatch(receivePage(response.data));
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function deletePage(pageId) {
    return (dispatch, getState) => {
        return axios.delete(restApi.url + "/pages/" + pageId, { headers: restApi.headers})
                      .then(response => {
                          dispatch(fetchPages());
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}
