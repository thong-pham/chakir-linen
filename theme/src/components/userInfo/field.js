import React from 'react'


const InputField = ({type, value, trackValue}) => {

    return (
      <div className="info-field" >
        <input type={type} defaultValue={value} onChange={onc} />
      </div>
    )
}

export default InputField
