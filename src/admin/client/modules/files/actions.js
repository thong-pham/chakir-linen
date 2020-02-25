import * as t from './actionTypes'
import api from 'lib/api'
import restApi from 'lib/restApi'
import axios from 'axios'
import messages from 'lib/text'

function receiveFiles(files) {
  return { type: t.FILES_RECEIVE, files }
}

function filesUploadStart() {
  return { type: t.FILES_UPLOAD_START }
}

function filesUploadEnd() {
  return { type: t.FILES_UPLOAD_END }
}

export function fetchFiles() {
    return (dispatch, getState) => {
        return axios.get(restApi.url + "/files", { headers: restApi.headers})
                      .then(response => { dispatch(receiveFiles(response.data)) })
                      .catch(error => { console.log(error.response) })
              }
}

export function uploadFiles(form) {
    return (dispatch, getState) => {
        dispatch(filesUploadStart());
        return axios.post(restApi.url + "/files", form, { headers: restApi.headers})
                      .then(response => {
                          dispatch(filesUploadEnd());
                          dispatch(fetchFiles());
                      })
                      .catch(error => {
                          dispatch(filesUploadEnd());
                          console.log(error.response);
                      })
              }
}

export function deleteFile(fileName) {
    return (dispatch, getState) => {
        return axios.delete(restApi.url + "/files/" + fileName, { headers: restApi.headers})
                      .then(response => { dispatch(fetchFiles()) })
                      .catch(error => { console.log(error.response) })
              }
}
