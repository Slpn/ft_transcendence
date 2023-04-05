import React, { useState } from 'react';
import { httpClient } from '../../utils/http-client';
import DeleteUploadButton from './DeleteUploadButton';

const reloadPage = () => {
	window.location.reload();
}

const UploadButton = () => {
	const [file, setFile] = useState<File | null>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
	  const selectedFile = event.target.files ? event.target.files[0] : null;
	  setFile(selectedFile);
	};
  
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
	  event.preventDefault();
  
	  if (!file) {
			alert('You did not choose a file, try again');
			return;
	  }
  
	  const formData = new FormData();
	  formData.append('file', file);

	  let url : string = "http://localhost:3001/user/upload";

	  try {
		const response = await httpClient.post(url, formData);
		//alert('Upload successful, refresh page to see changes', response.data);
		// handle successful upload
	  } catch (error) {
		alert('Upload failed, try again', error);
		// handle failed upload
	  }
	};
	
	return (
		<>
			<div>
				<form onSubmit={handleSubmit}>
					<input type="file" onChange={handleFileChange} />
					<div className="m-4 flex flex-col justify-center items-center">
						<button className="btn-upload" onClick={reloadPage} type="submit">Upload Image</button>
						<DeleteUploadButton/>
					</div>
				</form>
			</div>
			
		</>
	)
}

export default UploadButton;
