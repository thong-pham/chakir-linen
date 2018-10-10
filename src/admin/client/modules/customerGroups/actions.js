import * as t from './actionTypes'
import api from 'lib/api'
import restApi from 'lib/restApi'
import messages from 'lib/text'
import axios from 'axios'

function requestGroups() {
  return {
    type: t.GROUPS_REQUEST
  }
}

function receiveGroups(items) {
  return {
    type: t.GROUPS_RECEIVE,
    items
  }
}

function receiveErrorGroups(error) {
  return {
    type: t.GROUPS_FAILURE,
    error
  }
}

export function selectGroup(id) {
  return {
    type: t.GROUPS_SELECT,
    selectedId: id
  }
}

export function deselectGroup() {
  return {
    type: t.GROUPS_DESELECT
  }
}

function requestUpdateGroup(id) {
  return {
    type: t.GROUP_UPDATE_REQUEST
  }
}

function receiveUpdateGroup() {
  return {
    type: t.GROUP_UPDATE_SUCCESS
  }
}

function errorUpdateGroup(error) {
  return {
    type: t.GROUP_UPDATE_FAILURE,
    error
  }
}

function successCreateGroup(id) {
  return {
    type: t.GROUP_CREATE_SUCCESS
  }
}

function successDeleteGroup(id) {
  return {
    type: t.GROUP_DELETE_SUCCESS
  }
}



function fetchGroups() {
  return dispatch => {
    dispatch(requestGroups());
    return axios.get(restApi.url + "/user_groups", { headers: restApi.headers })
      .then(response => {
          let data = response.data.sort((a,b) => (a.position - b.position ));
          data.forEach((element, index, theArray) => {
              if(theArray[index].name === '') {
                theArray[index].name = `<${messages.draft}>`;
              }
          })
          dispatch(receiveGroups(data))
      })
      .catch(error => { dispatch(receiveErrorGroups(error)) })
  }
}

function shouldFetchGroups(state) {
  const groups = state.customerGroups
  if (groups.isFetched || groups.isFetching) {
    return false
  } else {
    return true
  }
}

export function fetchGroupsIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchGroups(getState())) {
      return dispatch(fetchGroups())
    }
  }
}

export function updateGroup(data) {
  return (dispatch, getState) => {
    dispatch(requestUpdateGroup(data.id));
    return axios.put(restApi.url + "/user_groups/" + data.id, data, { headers: restApi.headers })
      .then(response => {
          dispatch(receiveUpdateGroup());
          dispatch(fetchGroups());
      })
      .catch(error => { dispatch(errorUpdateGroup(error)) });
  }
}

export function createGroup(data) {
   return (dispatch, getState) => {
      return axios.post(restApi.url + "/user_groups", data, { headers: restApi.headers })
        .then(response => {
            dispatch(successCreateGroup(response.data.id));
            dispatch(fetchGroups());
            dispatch(selectGroup(response.data.id));
        })
        .catch(error => { console.log(error.response) })
    }
}

export function deleteGroup(id) {
  return (dispatch, getState) => {
    return axios.delete(restApi.url + "/user_groups/" + id, { headers: restApi.headers })
      .then(response => {
          if(response.status === 200) {
            dispatch(successDeleteGroup(id));
            dispatch(deselectGroup());
            dispatch(fetchGroups());
          } else {
            console.log(response.status);
          }
      })
      .catch(error => { console.log(error.response) })
  }
}
