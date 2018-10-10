'use strict';

const mongo = require('../../lib/mongo');
const parse = require('../../lib/parse');

class EmailTemplatesService {
  constructor() {}

  getEmailTemplate(name) {
    return mongo.db.collection('emailTemplates').findOne({name: name}).then(template => {
      return this.changeProperties(template);
    });
  }

  getEmailTemplates(){
      return mongo.db.collection('emailTemplates').find().toArray().then(templates => {
          return templates.map(template => this.changeProperties(template));
      })
  }

  addEmailTemplate(data) {
      const template = this.getValidDocumentForInsert(data);
      return mongo.db.collection('emailTemplates').insertMany([template]);
  }

  updateEmailTemplate(name, data) {
    const template = this.getValidDocumentForUpdate(data);
    return mongo.db.collection('emailTemplates').updateOne({name: name}, {
      $set: template
    }, {upsert: true}).then(res => this.getEmailTemplate(name));
  }

  getValidDocumentForUpdate(data) {
    if (Object.keys(data).length === 0) {
      return new Error('Required fields are missing');
    }

    let template = {}

    if (data.subject !== undefined) {
      template.subject = parse.getString(data.subject);
    }

    if (data.body !== undefined) {
      template.body = parse.getString(data.body);
    }

    return template;
  }

  getValidDocumentForInsert(data) {
    if (Object.keys(data).length === 0) {
      return new Error('Required fields are missing');
    }

    let template = {}

    if (data.name !== undefined){
        template.name = parse.getString(data.name);
    }

    if (data.subject !== undefined) {
      template.subject = parse.getString(data.subject);
    }

    if (data.body !== undefined) {
      template.body = parse.getString(data.body);
    }

    return template;
  }

  changeProperties(template) {
    if (template) {
      template.id = template._id;
      delete template._id;
    } else {
      return {
        subject: '',
        body: '',
        name: ''
      }
    }

    return template;
  }
}

module.exports = new EmailTemplatesService();
