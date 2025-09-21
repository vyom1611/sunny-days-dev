import React from 'react';
import './FileInput.css';

interface FileInputProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  acceptedFileType?: string;
}

const FileInput: React.FC<FileInputProps> = ({ file, onFileChange, acceptedFileType }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    onFileChange(selectedFile);
  };

  const handleClearFile = () => {
    onFileChange(null);
  };

  if (file) {
    return (
      <div className="file-display-container">
        <span className="file-name">{file.name}</span>
        <button onClick={handleClearFile} className="clear-button" title="Clear file">
          &times;
        </button>
      </div>
    );
  }

  return (
    <div className="file-input-container">
      <label htmlFor="file-upload" className="file-input-label">
        <svg className="file-input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
        </svg>
        <p className="file-input-text">Click to upload or drag and drop</p>
        <p className="file-input-hint">PowerPoint (.pptx)</p>
      </label>
      <input id="file-upload" name="file-upload" type="file" className="file-input" onChange={handleFileChange} accept={acceptedFileType} />
    </div>
  );
};

export default FileInput;
