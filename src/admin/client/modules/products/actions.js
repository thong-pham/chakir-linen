import * as t from './actionTypes'
import api from 'lib/api'
import restApi from 'lib/restApi'
import messages from 'lib/text'
import moment from 'moment';
import axios from 'axios';

function requestProduct() {
  return {
    type: t.PRODUCT_DETAIL_REQUEST
  }
}

function receiveProduct(item) {
  return {
    type: t.PRODUCT_DETAIL_RECEIVE,
    item
  }
}

function receiveProductError(error) {
  return {
    type: t.PRODUCT_DETAIL_FAILURE,
    error
  }
}

function receiveImages(images) {
  return {
    type: t.PRODUCT_IMAGES_RECEIVE,
    images
  }
}

function receiveVariants(variants) {
  return {
    type: t.PRODUCT_VARIANTS_RECEIVE,
    variants
  }
}

function receiveOptions(options) {
  return {
    type: t.PRODUCT_OPTIONS_RECEIVE,
    options
  }
}

export function cancelProductEdit() {
  return {
    type: t.PRODUCT_DETAIL_ERASE
  }
}

function requestProducts() {
  return {
    type: t.PRODUCTS_REQUEST
  }
}

function requestMoreProducts() {
  return {
    type: t.PRODUCTS_MORE_REQUEST
  }
}

function receiveProductsMore({ has_more, total_count, data }) {
  return {
    type: t.PRODUCTS_MORE_RECEIVE,
    has_more,
    total_count,
    data
  }
}

function receiveProducts({ has_more, total_count, data }) {
  return {
    type: t.PRODUCTS_RECEIVE,
    has_more,
    total_count,
    data
  }
}

function receiveProductsError(error) {
  return {
    type: t.PRODUCTS_FAILURE,
    error
  }
}

export function selectProduct(id) {
  return {
    type: t.PRODUCTS_SELECT,
    productId: id
  }
}

export function deselectProduct(id) {
  return {
    type: t.PRODUCTS_DESELECT,
    productId: id
  }
}

export function deselectAllProduct() {
  return {
    type: t.PRODUCTS_DESELECT_ALL
  }
}

export function selectAllProduct() {
  return {
    type: t.PRODUCTS_SELECT_ALL
  }
}

export function setFilter(filter) {
  return {
    type: t.PRODUCTS_SET_FILTER,
    filter: filter
  }
}

function deleteProductsSuccess() {
  return {
    type: t.PRODUCT_DELETE_SUCCESS
  }
}

function setCategorySuccess() {
  return {
    type: t.PRODUCT_SET_CATEGORY_SUCCESS
  }
}

function requestUpdateProduct() {
  return {
    type: t.PRODUCT_UPDATE_REQUEST
  }
}

function receiveUpdateProduct(item) {
  return {
    type: t.PRODUCT_UPDATE_SUCCESS,
    item
  }
}

function errorUpdateProduct(error) {
  return {
    type: t.PRODUCT_UPDATE_FAILURE,
    error
  }
}

function successCreateProduct(id) {
  return {
    type: t.PRODUCT_CREATE_SUCCESS
  }
}

function imagesUploadStart() {
  return {
    type: t.PRODUCT_IMAGES_UPLOAD_START
  }
}

function imagesUploadEnd() {
  return {
    type: t.PRODUCT_IMAGES_UPLOAD_END
  }
}

const getFilter = (state, offset = 0) => {
    const searchTerm = state.products.filter.search;
    const sortOrder = searchTerm && searchTerm.length > 0 ? 'search' : 'name';

    let filter = {
      limit: 50,
      fields: 'id,name,category_id,category_ids,category_name,sku,images,enabled,discontinued,stock_status,stock_quantity,price,on_sale,regular_price,url',
      search: searchTerm,
      offset: offset,
      sort: sortOrder
    }

    if(state.productCategories.selectedId !== null && state.productCategories.selectedId !== 'all') {
      filter.category_id = state.productCategories.selectedId;
    }

    if(state.products.filter.stockStatus !== null) {
      filter.stock_status = state.products.filter.stockStatus;
    }

    if(state.products.filter.enabled !== null) {
      filter.enabled = state.products.filter.enabled;
    }

    if(state.products.filter.discontinued !== null) {
      filter.discontinued =  state.products.filter.discontinued;
    }

    if(state.products.filter.onSale !== null) {
      filter.on_sale = state.products.filter.onSale;
    }

    return filter;
}

export function fetchProducts() {
    return (dispatch, getState) => {
        const state = getState();
        if (state.products.loadingItems) {
          // do nothing
        } else {
          dispatch(requestProducts());
          dispatch(deselectAllProduct());

          const filter = getFilter(state);
          const query = Object.keys(filter).map(key => key + '=' + filter[key]).join('&');

          return axios.get(restApi.url + "/products?" + query, { headers : restApi.headers })
                        .then(response => {
                              dispatch(receiveProducts(response.data));
                        })
                        .catch(error => {
                              dispatch(receiveProductsError(error));
                        })
                }
        }
}

export function fetchMoreProducts() {
    return (dispatch, getState) => {
        const state = getState();
        if (!state.products.loadingItems) {
          dispatch(requestMoreProducts());

          const offset = state.products.items.length;
          const filter = getFilter(state, offset);
          const query = Object.keys(filter).map(key => key + '=' + filter[key]).join('&');

          return axios.get(restApi.url + "/products?" + query, { headers : restApi.headers })
                        .then(response => {
                              dispatch(receiveProductsMore(response.data));
                        })
                        .catch(error => {
                              dispatch(receiveProductsError(error));
                        })
                }
        }
}

export function deleteCurrentProduct() {
    return (dispatch, getState) => {
        const state = getState();
        const product = state.products.editProduct;
        if(product && product.id) {
            return axios.delete(restApi.url + "/products/" + product.id, { headers : restApi.headers })
                          .then(response => response.status === 200 ? response.status : undefined)
                          .catch(error => { console.log(error.response) })
                }
        }
}

export function deleteProducts() {
    return (dispatch, getState) => {
        const state = getState();
        let promises = state.products.selected.map(productId => axios.delete(restApi.url + "/products/" + productId, { headers : restApi.headers }));

        return Promise.all(promises).then(values => {
            dispatch(deleteProductsSuccess());
            dispatch(deselectAllProduct());
            dispatch(fetchProducts());
        }).catch(error => {
            console.log(error);
        });
    }
}

export function setCategory(category_id) {
    return (dispatch, getState) => {
        const state = getState();
        let promises = state.products.selected.map(productId => axios.put(restApi.url + "/products/" + productId, { category_id: category_id }, { headers : restApi.headers }));

        return Promise.all(promises).then(values => {
            dispatch(setCategorySuccess());
            dispatch(deselectAllProduct());
            dispatch(fetchProducts());
        }).catch(error => {
            console.log(error)
        });
    }
}

export function updateProduct(data) {
    return (dispatch, getState) => {
        dispatch(requestUpdateProduct());
        return axios.put(restApi.url + "/products/" + data.id, data, { headers : restApi.headers })
                      .then(response => {
                            const product = fixProductData(response.data);
                            dispatch(receiveUpdateProduct(product));
                      })
                      .catch(error => {
                            dispatch(errorUpdateProduct(error));
                      })
              }
}

export function createProduct(history) {
    return (dispatch, getState) => {
        const state = getState();
        const productDraft = {
          enabled: false,
          category_id: state.productCategories.selectedId
        };
        return axios.post(restApi.url + "/products", productDraft, { headers : restApi.headers })
                      .then(response => {
                            dispatch(successCreateProduct(response.data.id));
                            history.push('/admin/product/' + response.data.id);
                      })
                      .catch(error => {
                            console.log(error.response);
                      })
              }
}

const fixProductData = (product) => {
    const saleFrom = moment(product.date_sale_from);
    const saleTo = moment(product.date_sale_to);
    const stockExpected = moment(product.date_stock_expected);

    product.date_sale_from = saleFrom.isValid() ? saleFrom.toDate() : null;
    product.date_sale_to = saleTo.isValid() ? saleTo.toDate() : null;
    product.date_stock_expected = stockExpected.isValid() ? stockExpected.toDate() : null;

    return product;
}

export function fetchProduct(id) {
    return (dispatch, getState) => {
        dispatch(requestProduct());
        return axios.get(restApi.url + "/products/" + id, { headers : restApi.headers })
                      .then(response => {
                            const product = fixProductData(response.data);
                            dispatch(receiveProduct(product));
                      })
                      .catch(error => {
                            dispatch(receiveProductError(error));
                      })
              }
}

export function fetchImages(productId) {
    return (dispatch, getState) => {
        return axios.get(restApi.url + "/products/" + productId + "/images", { headers : restApi.headers })
                      .then(response => {
                            dispatch(receiveImages(response.data));
                      })
                      .catch(error => {
                            console.log(error.response);
                      })
              }
}

export function fetchOptions(productId) {
    return (dispatch, getState) => {
        return axios.get(restApi.url + "/products/" + productId + "/options", { headers : restApi.headers })
                      .then(response => {
                            dispatch(receiveOptions(response.data));
                      })
                      .catch(error => {
                            console.log(error.response);
                      })
              }
}

export function fetchVariants(productId) {
    return (dispatch, getState) => {
        return axios.get(restApi.url + "/products/" + productId + "/variants", { headers : restApi.headers })
                      .then(response => {
                            dispatch(receiveVariants(response.data));
                      })
                      .catch(error => {
                            console.log(error.response);
                      })
              }
}

export function createVariant(productId) {
    return (dispatch, getState) => {
        const state = getState();
        const { regular_price, stock_quantity, weight } = state.products.editProduct;
        const variant = {
            price: regular_price,
            stock_quantity: stock_quantity,
            weight: weight
        };
        return axios.post(restApi.url + "/products/" + productId + "/variants", variant, { headers : restApi.headers })
                      .then(response => {
                            dispatch(receiveVariants(response.data));
                      })
                      .catch(error => {
                            console.log(error.response);
                      })
              }
}

export function updateVariant(productId, variantId, variant) {
    return (dispatch, getState) => {
        return axios.put(restApi.url + "/products/" + productId + "/variants/" + variantId, variant, { headers : restApi.headers })
                      .then(response => {
                            dispatch(receiveVariants(response.data));
                      })
                      .catch(error => {
                            console.log(error.response);
                      })
              }
}

export function setVariantOption(productId, variantId, optionId, valueId) {
    return (dispatch, getState) => {
        const option = { option_id: optionId, value_id: valueId };
        return axios.put(restApi.url + "/products/" + productId + "/variants/" + variantId + "/options", option, { headers : restApi.headers })
                      .then(response => {
                            dispatch(receiveVariants(response.data));
                      })
                      .catch(error => {
                            console.log(error.response);
                      })
              }
}

export function createOptionValue(productId, optionId, valueName) {
    return (dispatch, getState) => {
        return axios.post(restApi.url + "/products/" + productId + "/options/" + optionId + "/values", { name: valueName }, { headers : restApi.headers })
                      .then(response => {
                            dispatch(fetchOptions(productId));
                      })
                      .catch(error => {
                            console.log(error.response);
                      })
              }
}

export function createOption(productId, option) {
    return (dispatch, getState) => {
        return axios.post(restApi.url + "/products/" + productId + "/options", option, { headers : restApi.headers })
                      .then(response => {
                            dispatch(receiveOptions(response.data));
                      })
                      .catch(error => {
                            console.log(error.response);
                      })
              }
}

export function updateOptionValue(productId, optionId, valueId, valueName) {
    return (dispatch, getState) => {
        return axios.post(restApi.url + "/products/" + productId + "/options/" + optionId + "/values/" + valueId, { name: valueName }, { headers : restApi.headers })
                      .then(response => {
                            dispatch(fetchOptions(productId));
                      })
                      .catch(error => {
                            console.log(error.response);
                      })
              }
}

export function updateOption(productId, optionId, option) {
    return (dispatch, getState) => {
        return axios.put(restApi.url + "/products/" + productId + "/options/" + optionId, option, { headers : restApi.headers })
                      .then(response => {
                            dispatch(receiveOptions(response.data));
                      })
                      .catch(error => {
                            console.log(error.response);
                      })
              }
}

export function deleteOptionValue(productId, optionId, valueId) {
    return (dispatch, getState) => {
        return axios.delete(restApi.url + "/products/" + productId + "/options/" + optionId + "/values/" + valueId, { headers : restApi.headers })
                      .then(response => {
                            dispatch(fetchOptions(productId));
                      })
                      .catch(error => {
                            console.log(error.response);
                      })
              }
}

export function deleteOption(productId, optionId) {
    return (dispatch, getState) => {
        return axios.delete(restApi.url + "/products/" + productId + "/options/" + optionId, { headers : restApi.headers })
                      .then(response => {
                            dispatch(receiveOptions(response.data));
                      })
                      .catch(error => {
                            console.log(error.response);
                      })
              }
}


export function deleteVariant(productId, variantId) {
    return (dispatch, getState) => {
        return axios.delete(restApi.url + "/products/" + productId + "/variants/" + variantId, { headers : restApi.headers })
                      .then(response => {
                            dispatch(receiveVariants(response.data));
                      })
                      .catch(error => {
                            console.log(error.response);
                      })
              }
}

export function deleteImage(productId, imageId) {
    return (dispatch, getState) => {
        return axios.delete(restApi.url + "/products/" + productId + "/images/" + imageId, { headers : restApi.headers })
                      .then(response => {
                            dispatch(fetchImages(productId));
                      })
                      .catch(error => {
                            console.log(error.response);
                      })
              }
}

export function updateImage(productId, image) {
    return (dispatch, getState) => {
        return axios.put(restApi.url + "/products/" + productId + "/images/" + image.id, image, { headers : restApi.headers })
                      .then(response => {
                            dispatch(fetchImages(productId));
                      })
                      .catch(error => {
                            console.log(error.response);
                      })
              }
}

export function updateImages(productId, images) {
    return (dispatch, getState) => {
        let promises = images.map(image => axios.put(restApi.url + "/products/" + productId + "/images/" + image.id, image, { headers : restApi.headers }));

        return Promise.all(promises)
          .then(() => {
              dispatch(fetchImages(productId))
          })
          .catch(error => {
              console.log(error.response);
          });
    }
}

export function uploadImages(productId, form) {
    return (dispatch, getState) => {
        dispatch(imagesUploadStart());
        return axios.post(restApi.url + "/products/" + productId + "/images", form, { headers : restApi.headers })
                      .then(response => {
                          dispatch(imagesUploadEnd());
                          dispatch(fetchImages(productId));
                      })
                      .catch(error => {
                            console.log(error.response);
                            dispatch(imagesUploadEnd());
                      })
              }
}
