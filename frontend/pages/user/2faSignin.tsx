import { GetServerSidePropsContext } from "next";
import { httpClient } from "../../utils/http-client";
import { SyntheticEvent, useState } from 'react';
import { useRouter } from "next/router";
import Image from 'next/image'
import Footer from "../../components/menu&footer/footer";

const body = {};

const twoFactorAuth = ({qrcode}) => {

    const router = useRouter();
    const [code, setCode] = useState("");
    const validateCode = async (e: SyntheticEvent) => {
        e.preventDefault();
        const url = `${process.env.NEXT_PUBLIC_VERIFY2FA_ROUTE}`;
        if (!code) {
            alert("No change...");
            return;
        }
        else {
            body["code"] = code;
            body["loginchallenge"] = router.query["loginchallenge"];
        }
        const ret = await httpClient.post(url , body, {withCredentials: true});
        if (ret.data.message == 'success'){
            router.push("/user/settings");
        }
        
    }

    return (
    <>
    <form>
      <div className="page_welcome justify-center ">
        <div className="form-2fa my-10 w-1/2 mr-4 mb-4 text-center">
          <div className="title_2fa">
          Google Authenticator
          </div>
        <div className="my-4 center_2fa ">
          {qrcode?<img src={qrcode} alt="qr authenticator"/>:null}
        </div>
        <div className="center_2facode">
          <input className="w-16" type="text" placeholder="000000" onChange={e => setCode(e.target.value)} onKeyDown={(e) => {
            if(e.key === 'Enter'){
            validateCode(e);
            }
            } }/>
          <button className="center_2facode" type="button" onClick={validateCode}>
            <Image src="/entrer.svg" width="48" height="48" alt="enter" />
          </button>
        </div>
        </div>
      </div>
    </form>
    <Footer/>
    </>
    );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const url = `${process.env.NEXT_PUBLIC_QRCODE_ROUTE}`;
    const loginChallenge = context.query["loginchallenge"];
    const qrcode = await httpClient.post(url, {loginchallenge: loginChallenge});
    return {
        props: {
          qrcode: qrcode.data, 
        }
      }; 
};

export default twoFactorAuth;
