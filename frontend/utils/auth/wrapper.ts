import { GetServerSideProps, GetServerSidePropsContext } from "next";

export const getAuth = (context: GetServerSidePropsContext) => {
  const { req } = context;
  const { Auth } = req.cookies;
  return Auth;
};

export const authenticatedWrapper = (wrappedFunc: GetServerSideProps) => {
  return async (context: GetServerSidePropsContext) => {
    const Auth = getAuth(context);
    if (!Auth) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
    return wrappedFunc(context);
  };
};
