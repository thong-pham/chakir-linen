import React from 'react'
import {Field, reduxForm} from 'redux-form'
import {TextField, SelectField} from 'redux-form-material-ui'

import { CustomToggle } from 'modules/shared/form'
import * as helper from 'lib/helper'
import messages from 'lib/text'
import style from './style.css'

import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

const validate = values => {
  const errors = {}
  const requiredFields = []

  requiredFields.map(field => {
    if (values && !values[field]) {
      errors[field] = messages.errors_required;
    }
  })

  return errors
}

const getShippingFieldLabel = ({label, key}) => {
  return label && label.length > 0
    ? label
    : helper.getOrderFieldLabelByKey(key);
}

class ShippingAddressForm extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let {handleSubmit, pristine, submitting, initialValues, onCancel, shippingMethod} = this.props;
    const fields = [
        {key: "full_name", label: "Full Name"},
        {key: "address1", label: "Street Address"},
        {key: "city", label: "City"},
        {key: "state", label: "State/Province"},
        {key: "country", label: "Country"},
        {key: "postal_code", label: "Zip Code"},
        {key: "phone", label: "Phone"}
    ]
    let shippingFields = null;
    if(shippingMethod && shippingMethod.fields && shippingMethod.fields.length > 0){
      shippingFields = shippingMethod.fields.map((field, index) => {
        const fieldLabel = getShippingFieldLabel(field);

        return <Field
          key={index}
          component={TextField}
          fullWidth={true}
          name={field.key}
          floatingLabelText={fieldLabel}
        />
      })
    }
    else {
        shippingFields = fields.map((field, index) => {
          const fieldLabel = getShippingFieldLabel(field);

          return <Field
            key={index}
            component={TextField}
            fullWidth={true}
            name={field.key}
            floatingLabelText={fieldLabel}
          />
        })
    }

    return (
        <form onSubmit={handleSubmit}>
          <div>
            {shippingFields}
          </div>
          <div className={style.shippingButtons}>
            <FlatButton
              label={messages.cancel}
              onClick={onCancel}
            />
            <FlatButton
              label={messages.save}
              primary={true}
              type="submit"
              style={{ marginLeft: 12 }}
              disabled={pristine || submitting}
            />
          </div>
        </form>
    )
  }
}

export default reduxForm({form: 'ShippingAddressForm', validate, enableReinitialize: true})(ShippingAddressForm)
