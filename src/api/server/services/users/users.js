'use strict';

const mongo = require('../../lib/mongo');
const utils = require('../../lib/utils');
const parse = require('../../lib/parse');
const webhooks = require('../../lib/webhooks');
const mailer = require('../../lib/mailer');
const ObjectID = require('mongodb').ObjectID;
const PasswordService = require('./passwordUtil');
const uaParser = require('ua-parser-js');
const moment = require('moment');
const url = require('url');
const UserGroupsService = require('./userGroups')
const tokenService = require('../security/tokens')
const security = require('../../lib/security');
const settings = require('../../lib/settings');
const SettingsService = require('../settings/settings');

class UsersService {
  constructor() {}

  async addSystemAccount(data){
      const account = this.getValidDocumentForSystemAccount(data);
      if (account.email && account.email.length > 0) {
          const systemAccount = await mongo.db.collection('systemAccounts').count({email: account.email});
          if(systemAccount > 0){
            return Promise.reject('Account email must be unique')
          }
      }
      else {
          return Promise.reject('Invalid Email');
      }

      account.passwordHash = await PasswordService.generatePasswordHash(account.password);
      delete account.password;
      const insertResponse = await mongo.db.collection('systemAccounts').insertMany([account]);
      const tokenName = account.name;
      const dataToken = {
          name: tokenName,
          email: account.email,
          scopes: [security.scope.ADMIN],
          expiration: 720
      }
      const token = await tokenService.addToken(dataToken);
      const newAccountId = insertResponse.ops[0]._id.toString();
      const newAccount = await this.getSystemAccount(newAccountId);
      return newAccount;

  }

  getSystemAccount(id){
      if (!ObjectID.isValid(id)) {
        return Promise.reject('Invalid identifier');
      }
      const accountId = new ObjectID(id);
      return mongo.db.collection('systemAccounts').findOne({_id: accountId});
  }

  async loginSystem(data){
      if (data.email && data.email.length > 0 && data.password && data.password.length > 0){
          const account = await mongo.db.collection('systemAccounts').findOne({email: data.email});
          if (!account){
              return Promise.reject('This email does not exists. Please type again !')
          }
          else {
               const isSame = await PasswordService.validatePasswordHash(data.password, account.passwordHash);
               if (isSame){
                     const tokenAndAccount = await tokenService.getSingleTokenByEmail(data.email).then(token => {
                          if(token){
                              return tokenService.getSignedToken(token).then(signedToken => {
                                  account.id = account._id.toString();
                                  delete account._id;
                                  return {signedToken, account};
                              });
                          }
                          else{
                              return null;
                          }
                      });
                      return Promise.resolve(tokenAndAccount);
               }
               else {
                    return Promise.reject('This password is wrong. Please type again !');
               }
          }
      }
      else {
          return Promise.reject('Invalid Email or Password');
      }
  }


  getFilter(params = {}) {
    // tag
    // gender
    // date_created_to
    // date_created_from
    // total_spent_to
    // total_spent_from
    // orders_count_to
    // orders_count_from

    let filter = {};
    const id = parse.getObjectIDIfValid(params.id);
    const group_id = parse.getObjectIDIfValid(params.group_id);

    if (id) {
      filter._id = new ObjectID(id);
    }

    if (group_id) {
      filter.group_id = group_id;
    }

    if (params.email) {
      filter.email = params.email.toLowerCase();
    }

    if (params.search) {
      filter['$or'] = [
        { email: new RegExp(params.search, 'i') },
        { mobile: new RegExp(params.search, 'i') },
        { '$text': { '$search': params.search } }
      ];
    }

    return filter;
  }

  getUsers(params = {}) {
    let filter = this.getFilter(params);
    const limit = parse.getNumberIfPositive(params.limit) || 1000;
    const offset = parse.getNumberIfPositive(params.offset) || 0;

    return Promise.all([
      UserGroupsService.getGroups(),
      mongo.db.collection('users').find(filter).sort({date_created: -1}).skip(offset).limit(limit).toArray(),
      mongo.db.collection('users').find(filter).count()
    ]).then(([userGroups, users, usersCount]) => {
      const items = users.map(user => this.changeProperties(user, userGroups));
      const result = {
        total_count: usersCount,
        has_more: (offset + items.length) < usersCount,
        data: items
      };
      return result;
    })
  }

  getSingleUser(id) {
    if (!ObjectID.isValid(id)) {
      return Promise.reject('Invalid identifier');
    }
    return this.getUsers({id: id}).then(items => items.data.length > 0 ? items.data[0] : {})
  }

  async addUser(req) {
      const ip = tokenService.getIP(req);
      const user_agent = tokenService.getUserAgent(req);
      let data = req.body;
      data.browser = {ip, user_agent};

      const groups = await UserGroupsService.getGroups();

      groups.forEach(group => {
          if (group.name === data.customerType){
              data.group_id = group.id;
              data.approved = data.customerType !== 'Reseller' ? true : false;
              delete data.customerType;
          }
      })

      const user = this.getValidDocumentForInsert(data);

      // is email unique
      if (user.email && user.email.length > 0) {
          const userCount = await mongo.db.collection('users').count({email: user.email});
          if(userCount > 0){
            return Promise.reject('Customer email must be unique')
          }
      }
      else {
          return Promise.reject('Invalid Email');
      }

      user.passwordHash = await PasswordService.generatePasswordHash(user.password);
      delete user.password;
      const insertResponse = await mongo.db.collection('users').insertMany([user]);
      const tokenName = user.firstName + " " + user.lastName;
      const dataToken = {
          name: tokenName,
          email: user.email,
          scopes: [
              security.scope.READ_PRODUCTS,
              security.scope.READ_PRODUCT_CATEGORIES,
              security.scope.WRITE_PRODUCTS,
              security.scope.READ_ORDERS,
              security.scope.WRITE_ORDERS,
              security.scope.READ_USERS,
              security.scope.WRITE_USERS,
              security.scope.READ_PAGES,
              security.scope.READ_SITEMAP,
              security.scope.READ_SHIPPING_METHODS,
              security.scope.READ_PAYMENT_METHODS,
              security.scope.WRITE_PAYMENT_METHODS
          ],
          expiration: 720
      }
      const token = await tokenService.addToken(dataToken);
      const newUserId = insertResponse.ops[0]._id.toString();
      const newUser = await this.getSingleUser(newUserId);
      await webhooks.trigger({ event: webhooks.events.USER_CREATED, payload: newUser });
      return newUser;
  }

  async login (data) {
      if (data.email && data.email.length > 0 && data.password && data.password.length > 0){
          const user = await mongo.db.collection('users').findOne({email: data.email});
          if (!user){
              return Promise.reject('This email does not exists. Please type again !')
          }
          else {
               if (user.verification === false){
                   return Promise.reject('Please verify your email');
               }
               else {
                   const isSame = await PasswordService.validatePasswordHash(data.password, user.passwordHash);
                   if (isSame){
                         const tokenAndUser = await tokenService.getSingleTokenByEmail(data.email).then(token => {
                              if(token){
                                  return tokenService.getSignedToken(token).then(signedToken => {
                                      user.id = user._id.toString();
                                      delete user._id;
                                      return {signedToken, user};
                                  });
                              }
                              else{
                                  return null;
                              }
                          });
                          if (data.order_id && tokenAndUser.user.currentOrderId === null){
                                const userObjectID = new ObjectID(tokenAndUser.user.id);
                                const userData = {
                                    currentOrderId: data.order_id
                                }

                                await mongo.db.collection('users').updateOne({
                                  _id: userObjectID
                                }, {
                                  $set: userData
                                });
                          }
                          return Promise.resolve(tokenAndUser);
                   }
                   else {
                        return Promise.reject('This password is wrong. Please type again !');
                   }
               }
          }
      }
      else {
            return Promise.reject('Invalid Email or Password');
      }
  }

  async confirmEmail(email){
      if (email && email.length > 0){
          const account = await mongo.db.collection('users').findOneAndUpdate({"email" : email}, {$set:{"verification" : true}});
          if (account){
              return Promise.resolve("Email Confirmation");
          }
      }
  }

  approveCustomer(userId){
      if (!ObjectID.isValid(userId)) {
        return Promise.reject('Invalid identifier');
      }
      const userObjectID = new ObjectID(userId);
      return mongo.db.collection('users').findOneAndUpdate({_id: userObjectID}, {$set:{"approved": true}});
  }

  async addShippingAddress(userId, address) {
    if (!ObjectID.isValid(userId)) {
      return Promise.reject('Invalid identifier');
    }
    const userObjectID = new ObjectID(userId);
    const validAddress = parse.getCustomerAddress(address);

    const userAccount = await mongo.db.collection('users').findOne({_id: userObjectID});
    if (userAccount && userAccount.shipping_addresses.length === 0){
        validAddress.default_shipping = true;
    }

    return mongo.db.collection('users').updateOne({
      _id: userObjectID,
      'shipping_addresses.default_shipping': true
    }, {
      $set: {
        'shipping_addresses.$.default_shipping': false
      }
    }).then(res => {
      return mongo.db.collection('users').updateOne({
        _id: userObjectID
      }, {
          $push: {
              shipping_addresses: validAddress
            }
        });
    });
  }

  deleteShippingAddress(userId, addressId) {
    if (!ObjectID.isValid(userId) || !ObjectID.isValid(addressId)) {
      return Promise.reject('Invalid identifier');
    }
    let userObjectID = new ObjectID(userId);
    let addressObjectID = new ObjectID(addressId);

    return mongo.db.collection('users').updateOne({
      _id: userObjectID
    }, {
        $pull: {
          shipping_addresses: {
              id: addressObjectID
         }
       }
    });
  }


  async getShippingAddress(id){
      if (!ObjectID.isValid(id)) {
        return Promise.reject('Invalid identifier');
      }
      const userObjectID = new ObjectID(id);
      const user = await mongo.db.collection('users').findOne({_id: userObjectID});
      if (user){
          return Promise.resolve(user.shipping_addresses);
      }
      else {
          return Promise.reject('No User Data');
      }
  }

  updateShippingAddress(user_id, address_id, data) {
      if (!ObjectID.isValid(user_id) || !ObjectID.isValid(address_id)) {
        return Promise.reject('Invalid identifier');
      }
      let userObjectID = new ObjectID(user_id);
      let addressObjectID = new ObjectID(address_id);
      const addressFields = this.createObjectToUpdateAddressFields(data);

      return mongo.db.collection('users').updateOne({
        _id: userObjectID,
        'shipping_addresses.id': addressObjectID
      }, {$set: addressFields});
  }



  getValidDocumentForUpdateAddress(id, data, addressTypeName) {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return new Error('Required fields are missing');
    }

    let address = {}

    keys.forEach(key => {
      const value = data[key];
      if(key === 'coordinates' || key === 'details'){
        address[`${addressTypeName}.${key}`] = value;
      } else {
        address[`${addressTypeName}.${key}`] = parse.getString(value);
      }
    })

    return address;
  }

  async updateUser(id, data) {
    if (!ObjectID.isValid(id)) {
      return Promise.reject('Invalid identifier');
    }
    const userObjectID = new ObjectID(id);
    if (data.email){
         const userAccount = await mongo.db.collection('users').findOne({_id: userObjectID});
         if (!userAccount){
              return Promise.reject("This user does not exists");
         }
         else {
             if(data.password){
                 const isSame = await PasswordService.validatePasswordHash(data.password, userAccount.passwordHash);
                 if (!isSame){
                      return Promise.reject("The current password is wrong");
                 }
             }
         }
    }
    const user = this.getValidDocumentForUpdate(id, data);
    // is email unique
    if (user.email && user.email.length > 0) {
      const userCount = await mongo.db.collection('users').count({
        _id: {
          $ne: userObjectID
        },
        email: user.email
      });

      if(userCount > 0){
        return Promise.reject('User email must be unique')
      }
    }

    await mongo.db.collection('users').updateOne({
      _id: userObjectID
    }, {
      $set: user
    });

    const updatedUser = await this.getSingleUser(id);
    await webhooks.trigger({ event: webhooks.events.USER_UPDATED, payload: updatedUser });
    return updatedUser;
  }

  async changePassword(id, data){
      if (!ObjectID.isValid(id)){
          return Promise.reject('Invalid identifier');
      }
      const userObjectID = new ObjectID(id);
      const userAccount = await mongo.db.collection('users').findOne({_id: userObjectID});
      if (!userAccount){
          return Promise.reject("This user does not exists");
      }
      else {
          const isSame = await PasswordService.validatePasswordHash(data.oldPassword, userAccount.passwordHash);
          if (isSame){
               const hash = await PasswordService.generatePasswordHash(data.newPassword);
               const update = {
                  passwordHash: hash
               }
               const user = this.getValidDocumentForUpdate(id, update);
               await mongo.db.collection('users').updateOne({
                 _id: userObjectID
               }, {
                 $set: user
               });

               const updatedUser = await this.getSingleUser(id);
               await webhooks.trigger({ event: webhooks.events.USER_UPDATED, payload: updatedUser });
               return updatedUser;
          }
          else {
              return Promise.reject("The current password is wrong");
          }
      }

  }

  addCurrentOrder(user_id, order_id){
      if (!ObjectID.isValid(user_id) || !ObjectID.isValid(order_id)) {
        return Promise.reject('Invalid identifier');
      }
      const userObjectID = new ObjectID(user_id);
      const orderObjectID = new ObjectID(order_id);

      return mongo.db.collection('users').updateOne({
          _id: userObjectID
      },{
         $set: {
           currentOrderId: orderObjectID
         }
      });
  }

  deleteCurrentOrder(user_id){
      if (!ObjectID.isValid(user_id)) {
        return Promise.reject('Invalid identifier');
      }
      const userObjectID = new ObjectID(user_id);

      return mongo.db.collection('users').updateOne({
          _id: userObjectID
      },{
         $set: {
           currentOrderId: null
         }
      });
  }

  getCurrentOrder(user_id){
      if (!ObjectID.isValid(user_id)){
          return Promise.reject('Invalid identifier');
      }
      const userObjectID = new ObjectID(user_id);

      return mongo.db.collection('users').findOne({_id: userObjectID}).then(user => user.currentOrderId);
  }

  updateUserStatistics(userId, totalSpent, ordersCount) {
    if (!ObjectID.isValid(userId)) {
      return Promise.reject('Invalid identifier');
    }
    const userObjectID = new ObjectID(userId);
    const userData = {
      total_spent: totalSpent,
      orders_count: ordersCount
    };

    return mongo.db.collection('users').updateOne({_id: userObjectID}, {$set: userData});
  }

  async deleteUser(userId) {
    if (!ObjectID.isValid(userId)) {
      return Promise.reject('Invalid identifier');
    }
    const userObjectID = new ObjectID(userId);
    const user = await this.getSingleUser(userId);
    const deleteResponse = await mongo.db.collection('users').deleteOne({'_id': userObjectID});
    await webhooks.trigger({ event: webhooks.events.USER_DELETED, payload: user });
    return deleteResponse.deletedCount > 0;
  }

  getValidDocumentForSystemAccount(data){

      let account = {
        'date_created': new Date(),
        'date_updated': null
      };

      account.email = parse.getString(data.email).toLowerCase();
      account.name = parse.getString(data.name);
      account.password = parse.getString(data.password);
      account.role = parse.getString(data.role);

      return account;
  }

  getValidDocumentForInsert(data) {

    let customer = {
      'date_created': new Date(),
      'date_updated': null,
      'total_spent': 0,
      'orders_count': 0,
      'verification': false,
      'currentOrderId': null
    };

    customer.note = parse.getString(data.note);
    customer.email = parse.getString(data.email).toLowerCase();
    customer.mobile = parse.getString(data.mobile).toLowerCase();
    customer.firstName = parse.getString(data.firstName);
    customer.lastName = parse.getString(data.lastName);
    customer.gender = parse.getString(data.gender).toLowerCase();
    customer.group_id = parse.getObjectIDIfValid(data.group_id);
    customer.tags = parse.getArrayIfValid(data.tags) || [];
    customer.social_accounts = parse.getArrayIfValid(data.social_accounts) || [];
    customer.birthdate = parse.getDateIfValid(data.birthdate);
    customer.shipping_addresses = this.validateAddresses(data.shipping_addresses);
    customer.browser = parse.getBrowser(data.browser);
    customer.password = parse.getString(data.password);
    customer.businessName = parse.getString(data.businessName);
    customer.businessPhone = parse.getString(data.businessPhone);
    customer.businessCategory = parse.getString(data.businessCategory);
    customer.inState = parse.getBooleanIfValid(data.inState);
    customer.license = parse.getBooleanIfValid(data.license);
    customer.approved = parse.getBooleanIfValid(data.approved);

    return customer;
  }

  validateAddresses(addresses) {
    if (addresses && addresses.length > 0) {
      let validAddresses = addresses.map(addressItem => parse.getCustomerAddress(addressItem));
      return validAddresses;
    } else {
      return [];
    }
  }

  getValidDocumentForUpdate(id, data) {
    if (Object.keys(data).length === 0) {
      return new Error('Required fields are missing');
    }

    let customer = {
      'date_updated': new Date()
    };

    if (data.note !== undefined) {
      customer.note = parse.getString(data.note);
    }

    if (data.email !== undefined) {
      customer.email = parse.getString(data.email).toLowerCase();
    }

    if (data.mobile !== undefined) {
      customer.mobile = parse.getString(data.mobile).toLowerCase();
    }

    if (data.firstName !== undefined) {
      customer.firstName = parse.getString(data.firstName);
    }

    if (data.lastName !== undefined) {
      customer.lastName = parse.getString(data.lastName);
    }

    if (data.gender !== undefined) {
      customer.gender = parse.getString(data.gender);
    }

    if (data.group_id !== undefined) {
      customer.group_id = parse.getObjectIDIfValid(data.group_id);
    }

    if (data.tags !== undefined) {
      customer.tags = parse.getArrayIfValid(data.tags) || [];
    }

    if (data.social_accounts !== undefined) {
      customer.social_accounts = parse.getArrayIfValid(data.social_accounts) || [];
    }

    if (data.birthdate !== undefined) {
      customer.birthdate = parse.getDateIfValid(data.birthdate);
    }

    if (data.shipping_addresses !== undefined) {
      customer.shipping_addresses = this.validateAddresses(data.shipping_addresses);
    }

    if (data.customerType !== undefined) {
      customer.customerType = this.getString(data.customerType);
    }

    if (data.businessName !== undefined) {
      customer.businessName = this.getString(data.businessName);
    }

    if (data.businessPhone !== undefined) {
      customer.businessPhone = this.getString(data.businessPhone);
    }

    if (data.businessCategory !== undefined) {
      customer.businessCategory = this.getString(data.businessCategory);
    }

    if (data.browser !== undefined) {
      customer.browser = parse.getBrowser(data.browser);
    }

    if (data.passwordHash !== undefined){
        customer.passwordHash = parse.getString(data.passwordHash);
    }

    return customer;
  }

  changeProperties(customer, customerGroups) {
    if (customer) {
      customer.id = customer._id.toString();
      delete customer._id;

      const customerGroup = customer.group_id
        ? customerGroups.find(group => group.id === customer.group_id.toString())
        : null;

      customer.group_name = customerGroup && customerGroup.name
        ? customerGroup.name
        : '';

      if (customer.addresses && customer.addresses.length === 1) {
        customer.billing = customer.shipping = customer.addresses[0];
      } else if (customer.addresses && customer.addresses.length > 1) {
        let default_billing = customer.addresses.find(address => address.default_billing);
        let default_shipping = customer.addresses.find(address => address.default_shipping);
        customer.billing = default_billing
          ? default_billing
          : customer.addresses[0];
        customer.shipping = default_shipping
          ? default_shipping
          : customer.addresses[0];
      } else {
        customer.billing = {};
        customer.shipping = {};
      }
    }

    delete customer.passwordHash

    return customer;
  }

  createObjectToUpdateAddressFields(address) {
    let fields = {};

    if (address.address1 !== undefined) {
      fields['shipping_addresses.$.address1'] = parse.getString(address.address1);
    }

    if (address.address2 !== undefined) {
      fields['shipping_addresses.$.address2'] = parse.getString(address.address2);
    }

    if (address.city !== undefined) {
      fields['shipping_addresses.$.city'] = parse.getString(address.city);
    }

    if (address.country !== undefined) {
      fields['shipping_addresses.$.country'] = parse.getString(address.country).toUpperCase();
    }

    if (address.state !== undefined) {
      fields['shipping_addresses.$.state'] = parse.getString(address.state);
    }

    if (address.phone !== undefined) {
      fields['shipping_addresses.$.phone'] = parse.getString(address.phone);
    }

    if (address.postal_code !== undefined) {
      fields['shipping_addresses.$.postal_code'] = parse.getString(address.postal_code);
    }

    if (address.full_name !== undefined) {
      fields['shipping_addresses.$.full_name'] = parse.getString(address.full_name);
    }

    if (address.company !== undefined) {
      fields['shipping_addresses.$.company'] = parse.getString(address.company);
    }

    if (address.tax_number !== undefined) {
      fields['shipping_addresses.$.tax_number'] = parse.getString(address.tax_number);
    }

    if (address.coordinates !== undefined) {
      fields['shipping_addresses.$.coordinates'] = address.coordinates;
    }

    if (address.details !== undefined) {
      fields['shipping_addresses.$.details'] = address.details;
    }

    if (address.residential !== undefined){
        fields['shipping_addresses.$.residential'] = parse.getBooleanIfValid(address.residential, false);
    }

    if (address.default_billing !== undefined) {
      fields['shipping_addresses.$.default_billing'] = parse.getBooleanIfValid(address.default_billing, false);
    }

    if (address.default_shipping !== undefined) {
      fields['shipping_addresses.$.default_shipping'] = parse.getBooleanIfValid(address.default_shipping, false);
    }

    return fields;
  }


  setDefaultBilling(customer_id, address_id) {
    if (!ObjectID.isValid(customer_id) || !ObjectID.isValid(address_id)) {
      return Promise.reject('Invalid identifier');
    }
    let customerObjectID = new ObjectID(customer_id);
    let addressObjectID = new ObjectID(address_id);

    return mongo.db.collection('customers').updateOne({
      _id: customerObjectID,
      'addresses.default_billing': true
    }, {
      $set: {
        'addresses.$.default_billing': false
      }
    }).then(res => {
      return mongo.db.collection('customers').updateOne({
        _id: customerObjectID,
        'addresses.id': addressObjectID
      }, {
        $set: {
          'addresses.$.default_billing': true
        }
      });
    });
  }

  setDefaultShipping(user_id, address_id) {
    if (!ObjectID.isValid(user_id) || !ObjectID.isValid(address_id)) {
      return Promise.reject('Invalid identifier');
    }
    let userObjectID = new ObjectID(user_id);
    let addressObjectID = new ObjectID(address_id);

    return mongo.db.collection('users').updateOne({
      _id: userObjectID,
      'shipping_addresses.default_shipping': true
    }, {
      $set: {
        'shipping_addresses.$.default_shipping': false
      }
    }).then(res => {
      return mongo.db.collection('users').updateOne({
        _id: userObjectID,
        'shipping_addresses.id': addressObjectID
      }, {
        $set: {
          'shipping_addresses.$.default_shipping': true
        }
      });
    });
  }

  async sendConfirmationEmail(req) {
    const email = req.body.email || req.email;
    const userAgent = uaParser(req.get('user-agent'));
    const country = req.get('cf-ipcountry') || '';
    const ip = tokenService.getIP(req);
    const date = moment(new Date()).format('dddd, MMMM DD, YYYY h:mm A');
    const defaultDomain = await SettingsService.getSettings().then(generalSettings => generalSettings.domain);
    const link = defaultDomain + '/email-confirm/' + email;

    if(link) {
      const linkObj = url.parse(link);
      const domain = `${linkObj.protocol}//${linkObj.host}`;
      const device = userAgent.device.vendor ? userAgent.device.vendor + ' ' + userAgent.device.model + ', ' : '';
      const requestFrom = `${device}${userAgent.os.name}, ${userAgent.browser.name}<br />
      ${date}<br />
      IP: ${ip}<br />
      ${country}`;

      const message = {
        to: email,
        subject: tokenService.getTextFromHandlebars(tokenService.getSigninMailSubject(), { from: userAgent.os.name }),
        html: tokenService.getTextFromHandlebars(tokenService.getSigninMailBody(), { link, email, domain, requestFrom })
      };
      const emailSent = await mailer.send(message);
      return { sent: emailSent, error: null };
    } else {
      return { sent: false, error: 'Access Denied' };
    }
  }

}

module.exports = new UsersService();
