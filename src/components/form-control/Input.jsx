import React, { useMemo } from 'react';
import './styles.css';
import FileInput from '../common/FileInput/FileInput';

function InputControl({
  label,
  name,
  id,
  type = 'text',
  placeholder,
  required = false,
  message,
  options = [],
  onChange,
  value,
  extension,
  min
}) {
  const showFileInput = useMemo(() => {
    if(value === null) {
      return false
    }
    return true
  }, [value])

  function getInput() {
    switch (type) {
      case 'radio':
        return (
          <ul className="list-unstyled mb-0">
            {options.map((option, index) => (
              <li key={index} className="d-inline-block mr-2">
                <fieldset>
                  <div className="vs-radio-con">
                    <input
                      type={type}
                      name={name}
                      checked={option.key === value[0].key}
                      value={option.key}
                      onClick={() =>
                        onChange({ target: { name, value: option } })
                      }
                    />
                    <span className="vs-radio">
                      <span className="vs-radio--border"></span>
                      <span className="vs-radio--circle"></span>
                    </span>
                    <span className="">{option.key}</span>
                  </div>
                </fieldset>
              </li>
            ))}
          </ul>
        );

      case 'select':
        return (
          <select
            className="form-control"
            id={id}
            name={name}
            value={value || ""}
            onChange={onChange}
          >
            <option value="">{placeholder}</option>
            {options.map((option, index) => (
              <option key={index} value={option.value || option.label}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'file':
        return (
          <div>
            {showFileInput && <FileInput
              id={id}
              onChange={onChange}
              buttonText={placeholder}
              extension={extension}
            />}
          </div>
        );

      case 'textarea':
        return (
          <textarea
            type={type}
            id={id}
            className="form-control"
            name={name}
            placeholder={placeholder}
            required
            value={value || ''}
            data-validation-required-message={
              message || `${label} field is required`
            }
            onChange={onChange}
          />
        );

      case 'checkbox':
        return (
          <input
            type={type}
            id={id}
            className="form-control custom-checkbox"
            name={name}
            value={value}
            checked={value}
            required
            data-validation-required-message={
              message || `${label} field is required`
            }
            onChange={() => onChange({ target: { name, value: !value } })}
          />
        );

      default:
        return (
          <input
            type={type}
            id={id}
            className="form-control"
            name={name}
            value={value || ""}
            placeholder={placeholder}
            required
            min={min}
            data-validation-required-message={
              message || `${label} field is required`
            }
            onChange={onChange}
          />
        );
    }
  }

  return (
    <div className="col-12">
      <div className="form-group row">
        {label && (
          <div className="col-md-4">
            <span>
              {required ? '*' : ''}
              {label}
            </span>
          </div>
        )}
        <div className={label ? 'col-md-8' : 'col-md-12'}>{getInput()}</div>
      </div>
    </div>
  );
}

export default InputControl;
