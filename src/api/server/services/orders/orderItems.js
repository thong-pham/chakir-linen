'use strict';

const settings = require('../../lib/settings');
const mongo = require('../../lib/mongo');
const utils = require('../../lib/utils');
const parse = require('../../lib/parse');
const ObjectID = require('mongodb').ObjectID;
const OrdersService = require('./orders');
const ProductsService = require('../products/products');
const ProductStockService = require('../products/stock');
const UsersService = require('../users/users');

class OrderItemsService {
  constructor() {}

  async addItem(order_id, data) {
    if (!ObjectID.isValid(order_id)) {
      return Promise.reject('Invalid identifier');
    }

    let newItem = this.getValidDocumentForInsert(data);
    const orderItem = await this.getOrderItemIfExists(order_id, newItem.product_id, newItem.variant_id);

    if (orderItem) {
      await this.updateItemQuantityIfAvailable(order_id, orderItem, newItem);
    } else {
      await this.addNewItem(order_id, newItem);
    }

    return OrdersService.getSingleOrder(order_id);
  }


  async addItemToCurrentOrder(currentOrderId, order_id){
      if (!ObjectID.isValid(currentOrderId) || !ObjectID.isValid(order_id)) {
        return Promise.reject('Invalid identifier');
      }
      const order = await OrdersService.getSingleOrder(order_id);
      var updatedOrder = null;
      for (let item of order.items) {
          updatedOrder = await this.addItem(currentOrderId, item);
      }
      await OrdersService.deleteOrder(order_id);
      return updatedOrder;
  }

  async updateItemQuantityIfAvailable(order_id, orderItem, newItem) {
    const quantityNeeded = orderItem.quantity + newItem.quantity;
    const availableQuantity = await this.getAvailableProductQuantity(newItem.product_id, newItem.variant_id, quantityNeeded);

    if(availableQuantity > 0) {
      await this.updateItem(order_id, orderItem.id, {
        quantity: availableQuantity
      });
    }
  }

  async addNewItem(order_id, newItem) {
    const orderObjectID = new ObjectID(order_id);
    const availableQuantity = await this.getAvailableProductQuantity(newItem.product_id, newItem.variant_id, newItem.quantity);
    if(availableQuantity > 0) {
      newItem.quantity = availableQuantity;
      await mongo.db.collection('orders').updateOne({
        _id: orderObjectID
      }, {
        $push: {
          items: newItem
        },
        $set:{
            shipping_method_id: null,
            shipping_price: 0
        }
      });

      await this.calculateAndUpdateItem(order_id, newItem.id);
      await ProductStockService.handleAddOrderItem(order_id, newItem.id);
    }
  }

  async getAvailableProductQuantity(product_id, variant_id, quantityNeeded) {
    const product = await ProductsService.getSingleProduct(product_id.toString());

    if(!product) {
      return 0;
    } else if(product.discontinued){
      return 0;
    } else if(product.stock_backorder) {
      return quantityNeeded;
    } else if (product.variable && variant_id) {
      const variant = this.getVariantFromProduct(product, variant_id);
      if(variant){
        return variant.stock_quantity >= quantityNeeded ? quantityNeeded : variant.stock_quantity;
      } else {
        return 0;
      }
    } else {
      return product.stock_quantity >= quantityNeeded ? quantityNeeded : product.stock_quantity;
    }
  }

  async getOrderItemIfExists(order_id, product_id, variant_id) {
    let orderObjectID = new ObjectID(order_id);
    const order = await mongo.db.collection('orders').findOne({
      _id: orderObjectID
    }, {
      items: 1
    });

    if(order && order.items && order.items.length > 0) {
      return order.items.find(item =>
        item.product_id.toString() === product_id.toString() &&
        (item.variant_id || '').toString() === (variant_id || '').toString()
      );
    } else {
      return null;
    }
  }

  async updateItem(order_id, item_id, data) {
    if (!ObjectID.isValid(order_id) || !ObjectID.isValid(item_id)) {
      return Promise.reject('Invalid identifier');
    }
    let orderObjectID = new ObjectID(order_id);
    let itemObjectID = new ObjectID(item_id);
    const item = this.getValidDocumentForUpdate(data);

    if(parse.getNumberIfPositive(data.quantity) === 0) {
      // delete item
      return this.deleteItem(order_id, item_id);
    } else {
      // update
      await ProductStockService.handleDeleteOrderItem(order_id, item_id);
      await mongo.db.collection('orders').updateOne({
          _id: orderObjectID,
          'items.id': itemObjectID
        }, {
          $set: item
        }
      );

      await mongo.db.collection('orders').updateOne({
          _id: orderObjectID
        }, {
          $set: {
             shipping_method_id: null,
             shipping_price: 0
          }
        }
      );

      await this.calculateAndUpdateItem(order_id, item_id);
      await ProductStockService.handleAddOrderItem(order_id, item_id);
      return OrdersService.getSingleOrder(order_id);
    }
  }

  getVariantFromProduct(product, variantId) {
    if(product.variants && product.variants.length > 0) {
      return product.variants.find(variant => variant.id.toString() === variantId.toString());
    } else {
      return null;
    }
  }

  getOptionFromProduct(product, optionId){
    if(product.options && product.options.length > 0) {
      return product.options.find(item => item.id.toString() === optionId.toString());
    } else {
      return null;
    }
  }

  getOptionValueFromProduct(product, optionId, valueId){
    const option = this.getOptionFromProduct(product, optionId);
    if(option && option.values && option.values.length > 0) {
      return option.values.find(item => item.id.toString() === valueId.toString());
    } else {
      return null;
    }
  }

  getOptionNameFromProduct(product, optionId){
    const option = this.getOptionFromProduct(product, optionId);
    return option ? option.name : null;
  }

  getOptionValueNameFromProduct(product, optionId, valueId){
    const value = this.getOptionValueFromProduct(product, optionId, valueId)
    return value ? value.name : null;
  }

  getVariantNameFromProduct(product, variantId) {
    const variant = this.getVariantFromProduct(product, variantId);
    let optImage = null;
    if(variant) {
      let optionNames = [];
      for(const option of variant.options){
        const optionName = this.getOptionNameFromProduct(product, option.option_id);
        const optionValueName = this.getOptionValueNameFromProduct(product, option.option_id, option.value_id);
        optionNames.push(`${optionName}: ${optionValueName}`);
        if (optionName === 'Color'){
            optImage = optionValueName;
        }
      }
      const variantName = optionNames.join(', ');
      const data = {
          variantName: variantName,
          optImage: optImage
      }
      return data;
    }

    return null;
  }

  async calculateAndUpdateItem(order_id, item_id) {
    // TODO: tax_total, discount_total
    let orderObjectID = new ObjectID(order_id);
    let itemObjectID = new ObjectID(item_id);

    const order = await OrdersService.getSingleOrder(order_id);
    let user = null;
    if (order.user_id){
        user = await UsersService.getSingleUser(order.user_id);
    }
    const group_name = user ? user.group_name : '';

    if (order.items.length > 0) {
      let item = order.items.find(i => i.id.toString() === item_id.toString());
      if (item) {
        const itemData = await this.getCalculatedData(item, group_name);
        await mongo.db.collection('orders').updateOne({
          _id: orderObjectID,
          'items.id': itemObjectID
        }, {
          $set: itemData
        });
      }
    }
  }

  async getCalculatedData(item, group_name) {
    const product = await ProductsService.getSingleProduct(item.product_id.toString());

    if(item.custom_price && item.custom_price > 0) {
      // product with custom price - can set on client side

      return {
        'items.$.sku': product.sku,
        'items.$.name': product.name,
        'items.$.variant_name': item.custom_note || '',
        'items.$.price': item.custom_price,
        'items.$.tax_class': product.tax_class,
        'items.$.tax_total': 0,
        'items.$.weight': product.weight || 0,
        'items.$.discount_total': 0,
        'items.$.price_total': item.custom_price * item.quantity,
        'items.$.image_url': product.images[0].url,
        'items.$.path': product.path
      }
    } else if(item.variant_id) {
      // product with variant
      const variant = this.getVariantFromProduct(product, item.variant_id);
      const {variantName, optImage} = this.getVariantNameFromProduct(product, item.variant_id);
      const variantPrice = variant.price && variant.price > 0 ? variant.price: product.price;
      let index = 0;
      for (var i = 0; i < product.images.length; i++){
          if (product.images[i].alt.toLowerCase() === optImage.toLowerCase()){
              index = i;
          }
      }
      if(variant) {
        let price_total;
        if (group_name === 'Reseller' && product.prices && product.prices.length > 0){
            product.prices.forEach(price => {
                if (item.quantity >= price.quantity){
                    price_total = item.quantity * price.price;
                }
            })
        }
        if (price_total === undefined){
            price_total = item.quantity * variantPrice;
        }
        return {
          'items.$.sku': variant.sku,
          'items.$.name': product.name,
          'items.$.variant_name': variantName,
          'items.$.price': variantPrice,
          'items.$.tax_class': product.tax_class,
          'items.$.tax_total': 0,
          'items.$.weight': variant.weight || 0,
          'items.$.discount_total': 0,
          'items.$.price_total': price_total,
          'items.$.image_url': product.images[index].url,
          'items.$.path': product.path
        }
      } else {
        // variant not exists
        return null;
      }
    } else {
      // normal product
      let price_total;
      if (group_name === 'Reseller' && product.prices && product.prices.length > 0){
          product.prices.forEach(price => {
              if (item.quantity >= price.quantity){
                  price_total = item.quantity * price.price;
              }
          })
      }
      if (price_total === undefined){
          price_total = item.quantity * product.price;
      }
      return {
        'items.$.sku': product.sku,
        'items.$.name': product.name,
        'items.$.variant_name': '',
        'items.$.price': product.price,
        'items.$.tax_class': product.tax_class,
        'items.$.tax_total': 0,
        'items.$.weight': product.weight || 0,
        'items.$.discount_total': 0,
        'items.$.price_total': price_total,
        'items.$.image_url': product.images[0].url,
        'items.$.path': product.path
      }
    }
  }

  async calculateAndUpdateAllItems(order_id) {
    const order = await OrdersService.getSingleOrder(order_id);

    if (order && order.items) {
      for(const item of order.items){
        await this.calculateAndUpdateItem(order_id, item.id);
      }
      return OrdersService.getSingleOrder(order_id);
    } else {
      // order.items is empty
      return null;
    }
  }

  async deleteItem(order_id, item_id) {
    if (!ObjectID.isValid(order_id) || !ObjectID.isValid(item_id)) {
      return Promise.reject('Invalid identifier');
    }
    let orderObjectID = new ObjectID(order_id);
    let itemObjectID = new ObjectID(item_id);

    await ProductStockService.handleDeleteOrderItem(order_id, item_id);
    await mongo.db.collection('orders').updateOne({
      _id: orderObjectID
    }, {
      $pull: {
        items: {
          id: itemObjectID
        }
      },
      $set:{
          shipping_method_id: null,
          shipping_price: 0
      }
    });

    const updatedOrder = await OrdersService.getSingleOrder(order_id);
    if (updatedOrder.items.length === 0){
        return OrdersService.deleteOrder(order_id);
    }
    else return OrdersService.getSingleOrder(order_id);
  }

  getValidDocumentForInsert(data) {
    let item = {
      'id': new ObjectID(),
      'product_id': parse.getObjectIDIfValid(data.product_id),
      'variant_id': parse.getObjectIDIfValid(data.variant_id),
      'quantity': parse.getNumberIfPositive(data.quantity) || 1
    };

    if (data.custom_price) {
      item.custom_price = parse.getNumberIfPositive(data.custom_price);
    }

    if (data.custom_note) {
      item.custom_note = parse.getString(data.custom_note);
    }

    return item;
  }

  getValidDocumentForUpdate(data) {
    if (Object.keys(data).length === 0) {
      return new Error('Required fields are missing');
    }

    let item = {};

    if (data.variant_id !== undefined) {
      item['items.$.variant_id'] = parse.getObjectIDIfValid(data.variant_id);
    }

    if (data.quantity !== undefined) {
      item['items.$.quantity'] = parse.getNumberIfPositive(data.quantity);
    }

    if (data.custom_price !== undefined) {
       item['items.$.custom_price'] = parse.getNumberIfPositive(data.custom_price);
    }

    return item;
  }
}

module.exports = new OrderItemsService();
