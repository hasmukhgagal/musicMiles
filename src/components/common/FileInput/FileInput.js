import React, { useState } from 'react';

import './FileInput.css';

const FileInput = ({
  buttonText = 'Choose File',
  extension = '',
  multiple = false,
  onChange,
  id,
  name,
}) => {
  const [files, setFiles] = useState([]);

  const onChangeFile = (e) => {
    // map(e.target.files, (file) => {
    //   var reader = new FileReader();

    //   reader.onload = function (e) {
    //     file.src = e.target.result;
    //   };

    //   reader.readAsDataURL(file);
    // });

    setFiles(e.target.files);
    onChange(e.target.files);
  };

  return (
    <div>
      <label htmlFor={`${buttonText}${id}file`} className="btn btn-primary cursor-pointer">
        {buttonText}        
      </label>
      <input
        type="file"
        accept={extension}
        name={`${buttonText}${name}file`}
        id={`${buttonText}${id}file`}
        className="hidden"
        onChange={onChangeFile}
        multiple={multiple}
      />
      <br />
      {files.length > 0 && (multiple ? `${files.length} files` : files[0].name)}
    </div>
  );
};

export default FileInput;
