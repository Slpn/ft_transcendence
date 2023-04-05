import { useEffect, useState } from 'react';
import { httpClient } from '../../utils/http-client';

const reloadPage = () => {
	window.location.reload();
}

const DeleteUploadButton = () => {
	const [data, setData] = useState(null);
	const [error, setError] = useState(null);
	const [avatar, setAvatar] = useState(null);
	useEffect(() => {
		httpClient.get("http://localhost:3001/user/me")
		  .then((response) => {
			setData(response.data);
			setAvatar(response.data.avatar);
		  })
		  .catch((error) => {
			setError(error);
		  })
	  }, []);
  
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
	  let url : string = "http://localhost:3001/user/upload/delete";

	  try {
		const response = await httpClient.post(url, data);
		if (!avatar) {
			alert("There is no image to delete");
		}
		else {
			//alert('Your custom avatar was deleted successfully, refresh page to see changes', response.data);
		}
	  } catch (error) {
		console.error('Delete failed', error);
	  }
	};
    return (
        <>
			<div className="btn-upload m-4 flex justify-center items-center"  onClick={handleSubmit}>
				<button onClick={reloadPage} type="submit">Delete Image</button>
			</div>
		</>
    )
}

export default DeleteUploadButton;

