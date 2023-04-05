import React, { SyntheticEvent, useState, useRef } from 'react';
import { httpClient } from "../../utils/http-client";

const AddChannel = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [privateS, setPrivate] = useState(false);
  const [pwChan, setPw] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  // const [admin, setAdm] = useState("");
  const [ChanName, setname] = useState("");
  const toggleRef = useRef(null);

  const createChannel = async () => {
    let status: number ;
    const ret = await httpClient.post("http://localhost:3001/channel/createChannel", {nameChannel: ChanName, passwordChannel: pwChan, isPrivate: isPrivate});
    props.setRenderMessage(!props.renderMessage);
  }

  const handleReset = () => {
    Array.from(document.querySelectorAll("input")).forEach(
      input => (input.value = "")
    );
  };

  const handleClickOutside = (event) => {
    if (toggleRef.current && !toggleRef.current.contains(event.target)) {
      setIsOpen(false);
      handleReset();
      setIsPrivate(false);
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

  const sendChannel = async () => {
    if (ChanName == "" || (isPublic == false && isPrivate == false))
    {
      alert("Error channel");
      return;
    }
    createChannel();
    setPw("");
    setname("");
    handleReset();
    setIsOpen(!isOpen);
  }

  const onChangeState = async (e) => {
    if (e.target.value == "Protected")
    {
      setPrivate(true);
      setIsPrivate(false);
    }
    else
    {
      setPrivate(false);
      setPw("");
    }
  }

  return (
    <>
    <div className="relative">
      {isOpen && (
        <div ref={toggleRef}>
        <div className= "color-4 rounded-lg py-2 border">
          <h3 className="ml-2 items-center text-color-1">Create a new channel</h3>
          <div className="ml-2">
            <ul className="space-beetween">
              <li className="text-color-1">
                Name
                <input className='ml-2 custom-input w-40' type="text" placeholder="Set a name" onChange={e => setname(e.target.value)}/>
              </li>
                <form onChange={onChangeState}>
                  <div className="ratio">
                  <h1 className="text-color-1">Type of your channel</h1>
                  <ul>
                    <li>
                      <input className='custom-input text-color-2' type="radio" id="Public" name="choice" value="Public" onClick={() => {
                        setIsPublic(!isPublic);
                        {
                          if (isPrivate) {
                            setIsPrivate(false);
                          }
                        }
                      }}/>
                      <label className="text-color-1" htmlFor="Public">Public</label>
                    </li>
                    <li>
                      <input className='custom-input text-color-2' type="radio" id="Private" name="choice" value="Private" onClick={() =>{
                        setIsPrivate(!isPrivate);
                        {
                          if (isPublic) {
                            setIsPublic(false);
                          }
                        }
                      }}/>
                      <label className="text-color-1" htmlFor="Private">Private</label>
                    </li>
                    <li>
                      <input className="custom-input text-color-2" type="radio" id="Protected" name="choice" value="Protected"/>
                      <label className="text-color-1" htmlFor="Protected">
                        Protected
                        </label>
                    </li>
                  </ul>
                </div>
              </form>
                  {privateS && (
                      <input className='custom-input' type="password" placeholder="Set a password" onChange={e => setPw(e.target.value)}/>
                    )
                  }
            </ul>
              <li>
                <button 
                  className="color-1 p-2 rounded-lg text-gray-700 "
                  onClick={() => sendChannel()}>
                    <h1 className="text-color-3">
                        Validate
                    </h1>
                </button>
              </li>
          </div>
        </div>
        </div>
      )}
      <button 
        className="color-1 p-2 rounded-lg text-gray-700"
        onClick={handleToggleClick}>
        <h1 className="text-color-3">
            Create a channel
        </h1>
      </button>
    </div>
    </>
  );
}

export default AddChannel;
