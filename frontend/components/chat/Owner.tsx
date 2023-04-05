import React, { SyntheticEvent, useState, useRef } from 'react';
import Image from 'next/image'
import { httpClient } from '../../utils/http-client';


function Owner(props)
{
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(false);
    const [password, setPassword] = useState("");
    const toggleRef = useRef(null);
    
    const handleReset = () => {
        Array.from(document.querySelectorAll("input")).forEach(
            input => (input.value = "")
        );
    };

    const sendData = async () => {
        setIsOpen(!isOpen);
        handleReset();
    }

    const handleClickOutside = (event) => {
        if (toggleRef.current && !toggleRef.current.contains(event.target)) {
          setIsOpen(false);
          handleReset();
        }
      };
    
      const handleToggleClick = () => {
        setIsOpen(!isOpen);
      };
    
    React.useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      });
    
    const handleChangeMute = (event) => {
        const onlyNumbers = event.target.value.replace(/[^0-9]/g, "");
        setMuteTime(onlyNumbers);
    };

    const handleChangeBan = (event) => {
        const onlyNumbers = event.target.value.replace(/[^0-9]/g, "");
        setBanTime(onlyNumbers);
    };

    const resetPwd = async () => {
      await httpClient.post("http://localhost:3001/channel/resetPassword", {channel_id: props.channel_id});
    };

    const changePassword = async () => {
      await httpClient.post("http://localhost:3001/channel/changePassword", {channel_id: props.channel_id, password: password});
    };

    const switchToPrivate = async () => {
      await httpClient.post("http://localhost:3001/channel/switchToPrivate", {channel_id: props.channel_id});
    };

    const changeName = async () => {
      await httpClient.post("http://localhost:3001/channel/changeName", {channel_id: props.channel_id, name: name});
    };

    const switchToPublic = async () => {
      const ret = await httpClient.post("http://localhost:3001/channel/switchToPublic", {channel_id: props.channel_id});
    };

    return (
        <>
        <div className="relative absolute">
          {isOpen && (
            <div ref={toggleRef}>
            <div className= "color-2 rounded-lg py-2 items-center">
              <h3 className="items-center text-color-3">Owner Controller</h3>
              <div className="text-color-5">
                <ul className="space-beetween overflow-auto h-[12rem] w-[15rem]">
                  <li>
                    <input className="custom-input" type="text" placeholder="Name of the channel" onChange={e => setName(e.target.value)}/>
                      <button className="color-1 p-2 rounded-lg text-gray-700 mb-2" onClick={changeName}>
                      <h1 className="text-color-4">
                        change channel name
                      </h1>
                      </button>
                  </li>

                  <li>
                    <input className="custom-input" type="passwpord" placeholder="password of the channel" onChange={e => setPassword(e.target.value)}/>
                      <button className="color-1 p-2 rounded-lg text-gray-700 mb-4" onClick={changePassword}>
                        <h1 className="text-color-4">
                          change channel password
                        </h1>
                      </button>
                  </li>

                  <li>
                      <button className="color-1 p-2 rounded-lg text-gray-700" onClick={resetPwd}>
                      <h1 className="text-color-4">
                        reset password
                      </h1>
                      </button>
                  </li>
                  <li>
                      <button className="color-1 p-2 rounded-lg text-gray-700" onClick={switchToPrivate}>
                      <h1 className="text-color-4">
                        Switch to private
                      </h1>
                      </button>
                  </li>

                  <li>
                      <button className="color-1 p-2 rounded-lg text-gray-700" onClick={switchToPublic}>
                      <h1 className="text-color-4">
                        Switch to public
                      </h1>
                      </button>
                  </li>

                </ul>
              </div>
              </div>
            </div>
          )}
          <button 
            className="p-2 rounded-lg text-gray-700"
            onClick={handleToggleClick}>
            <Image className="" src="/owner.svg" width="40" height="40" alt="owner" />
          </button>
    </div>
  </>
  )
}

export default Owner;
