import React from "react"

function inputSigning({
  handleChange,
  value,
  placeholder,
  type,
  title,
  maxLength,
}) {
  return (
    <>
      <label htmlFor={type}>{title}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        className="form-input"
        onChange={handleChange}
        maxLength={maxLength}
      />
    </>
  )
}

export default inputSigning
