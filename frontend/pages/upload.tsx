import NavBar from "../components/menu&footer/navBar";
import { GetServerSidePropsContext } from "next";
import { authenticatedWrapper, getAuth } from "../utils/auth/wrapper";
import { httpClient } from "../utils/http-client";
import Footer from "../components/menu&footer/footer";
import UploadButton from "../components/Avatar/UploadButton";
import DeleteUploadButton from "../components/Avatar/DeleteUploadButton";

type User = {
  id: number;
  avatar42: string;
};

type UserProps = {
  user: User;
};

const Upload = ({ user }: UserProps) => {
	return (
    <div>
      <NavBar />
      <div className="page">
		{/* <UploadButton/>  */}
		<DeleteUploadButton/>
      </div>
      <Footer />
    </div>
  );
};

export const getServerSideProps = authenticatedWrapper(
	async (context: GetServerSidePropsContext) => {
	  const Auth = getAuth(context);
	  const user = await httpClient.get(`${process.env.NEXT_PUBLIC_ME_ROUTE}`, {
		headers: {
		  Cookie: `Auth=${Auth}`,
		},
	  });
	  return {
		props: {
		  user: user.data,
		},
	  };
	}
  );

export default Upload;

/* docker stop $(docker ps -qa); docker rm $(docker ps -qa); docker rmi -f $(docker images -qa); 
docker volume rm $(docker volume ls -q); docker network rm $(docker network ls -q) 2>/dev/null */

// http://localhost:3001/upload