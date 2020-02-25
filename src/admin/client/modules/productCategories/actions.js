import * as t from './actionTypes'
import api from 'lib/api'
import restApi from 'lib/restApi'
import messages from 'lib/text'
import axios from 'axios'

function requestCategories() {
  return {
    type: t.CATEGORIES_REQUEST
  }
}

function receiveCategories(items) {
  return {
    type: t.CATEGORIES_RECEIVE,
    items
  }
}

function receiveErrorCategories(error) {
  return {
    type: t.CATEGORIES_FAILURE,
    error
  }
}

export function selectCategory(id) {
  return {
    type: t.CATEGORIES_SELECT,
    selectedId: id
  }
}

export function deselectCategory() {
  return {
    type: t.CATEGORIES_DESELECT
  }
}

function requestUpdateCategory(id) {
  return {
    type: t.CATEGORY_UPDATE_REQUEST
  }
}

function receiveUpdateCategory() {
  return {
    type: t.CATEGORY_UPDATE_SUCCESS
  }
}

function errorUpdateCategory(error) {
  return {
    type: t.CATEGORY_UPDATE_FAILURE,
    error
  }
}

function successCreateCategory(id) {
  return {
    type: t.CATEGORY_CREATE_SUCCESS
  }
}

function successDeleteCategory(id) {
  return {
    type: t.CATEGORY_DELETE_SUCCESS
  }
}

function successMoveUpDownCategory(newPosition) {
  return {
    type: t.CATEGORY_MOVE_UPDOWN_SUCCESS,
    position: newPosition
  }
}

function successReplaceCategory(newParentId) {
  return {
    type: t.CATEGORY_REPLACE_SUCCESS
  }
}

function imageUploadStart() {
  return {
    type: t.CATEGORY_IMAGE_UPLOAD_START
  }
}

function imageUploadEnd() {
  return {
    type: t.CATEGORY_IMAGE_UPLOAD_END
  }
}

export function fetchCategories() {
    return dispatch => {
        dispatch(requestCategories());
        return axios.get(restApi.url + "/product_categories", { headers : restApi.headers })
                      .then(response => {
                            response.data.forEach((element, index, theArray) => {
                                if (theArray[index].name === ''){
                                    theArray[index].name = `<${messages.draft}>`;
                                }
                            })
                            dispatch(receiveCategories(response.data));
                      })
                      .catch(error => {
                            dispatch(receiveErrorCategories(error));
                      })
              }
}

function shouldFetchCategories(state) {
    const categories = state.productCategories
    if (categories.isFetched || categories.isFetching) {
        return false
    } else {
        return true
    }
}

export function fetchCategoriesIfNeeded() {
    return (dispatch, getState) => {
        if (shouldFetchCategories(getState())) {
            return dispatch(fetchCategories())
        }
    }
}

function sendUpdateCategory(id, data) {
    return dispatch => {
        dispatch(requestUpdateCategory(id));
        return axios.put(restApi.url + "/product_categories/" + id, data, { headers : restApi.headers })
                      .then(response => {
                          dispatch(receiveUpdateCategory());
                          dispatch(fetchCategories());
                      })
                      .catch(error => {
                          dispatch(errorUpdateCategory(error));
                      })
              }
}

export function updateCategory(data) {
    return (dispatch, getState) => {
        return dispatch(sendUpdateCategory(data.id, data))
    }
}

export function createCategory() {
    return (dispatch, getState) => {
        return axios.post(restApi.url + "/product_categories", ({ enabled: false }), { headers : restApi.headers })
                      .then(response => {
                          dispatch(successCreateCategory(response.data.id));
                          dispatch(fetchCategories());
                          dispatch(selectCategory(response.data.id));
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function deleteImage() {
    return (dispatch, getState) => {
        const state = getState();
        const categoryId = state.productCategories.selectedId;
        return axios.delete(restApi.url + "/product_categories/" + categoryId + "/image", { headers : restApi.headers })
                      .then(response => {
                          if (response.status === 200){
                              dispatch(fetchCategories());
                          } else {
                              console.log(response.status)
                          }
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function deleteCategory(id) {
    return (dispatch, getState) => {
        return axios.delete(restApi.url + "/product_categories/" + id, { headers : restApi.headers })
                      .then(response => {
                          if(response.status === 200) {
                              dispatch(successDeleteCategory(id));
                              dispatch(deselectCategory());
                              dispatch(fetchCategories());
                          } else {
                              console.log(response.status);
                          }
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

function moveCategory(allCategories = [], selectedCategory, isUp = true) {
    return new Promise((resolve, reject) => {
        if(isUp) {
            allCategories = allCategories.filter(e => e.parent_id === selectedCategory.parent_id && e.id !== selectedCategory.id && e.position < selectedCategory.position).sort((a, b) => b.position - a.position);
        } else {
            allCategories = allCategories.filter(e => e.parent_id === selectedCategory.parent_id && e.id !== selectedCategory.id && e.position > selectedCategory.position).sort((a, b) => a.position - b.position);
        }

        if(allCategories.length > 0) {
            let targetCategory = allCategories[0];
            let newPosition = targetCategory.position;
            return axios.put(restApi.url + "/product_categories/" + selectedCategory.id, ({ position: targetCategory.position }), { headers : restApi.headers })
                          .then(response => {
                              axios.put(restApi.url + "/product_categories/" + targetCategory.id, ({ position: selectedCategory.position }), { headers : restApi.headers })
                                      .then(response => {
                                            return newPosition;
                                      })
                                      .catch(error => {
                                            console.log(error.response);
                                      })
                          })
                          .catch(error => {
                              console.log(error.response);
                          })
                  }
        });
}

export function moveUpCategory() {
    return (dispatch, getState) => {
        let state = getState();
        var allCategories = state.productCategories.items;
        var selectedCategory = allCategories.find((item) => (item.id === state.productCategories.selectedId));
        var isUp = true;

        return moveCategory(allCategories, selectedCategory, isUp)
            .then((newPosition) => {
                dispatch(successMoveUpDownCategory(newPosition));
                dispatch(fetchCategories());
        });
    }
}

export function moveDownCategory() {
    return (dispatch, getState) => {
        let state = getState();
        var allCategories = state.productCategories.items;
        var selectedCategory = allCategories.find((item) => (item.id === state.productCategories.selectedId));
        var isUp = false;

        return moveCategory(allCategories, selectedCategory, isUp)
            .then((newPosition) => {
                dispatch(successMoveUpDownCategory(newPosition));
                dispatch(fetchCategories());
        });
    }
}

export function replaceCategory(parentId) {
    return (dispatch, getState) => {
        let state = getState();
        var selectedCategory = state.productCategories.items.find((item) => (item.id === state.productCategories.selectedId));
        return axios.put(restApi.url + "/product_categories/" + selectedCategory.id, ({ parend_id: parentId }), { headers : restApi.headers })
                      .then(response => {
                          dispatch(successReplaceCategory());
                          dispatch(fetchCategories());
                      })
                      .catch(error => {
                          console.log(error.response);
                      })
              }
}

export function uploadImage(form) {
    return (dispatch, getState) => {
        const state = getState();
        const categoryId = state.productCategories.selectedId;
        dispatch(imageUploadStart());
        return axios.post(restApi.url + "/product_categories/" + categoryId, form, { headers : restApi.headers })
                      .then(response => {
                          dispatch(imageUploadEnd());
                          dispatch(fetchCategories());
                      })
                      .catch(error => {
                          console.log(error.response);
                          dispatch(imageUploadEnd());
                      })
              }
}
