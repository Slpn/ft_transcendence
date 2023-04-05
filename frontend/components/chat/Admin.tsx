import React, { SyntheticEvent, useState, useRef } from 'react';
import Image from 'next/image'

function Admin()
{
    const [isOpen, setIsOpen] = useState(false);
    const toggleRef = useRef(null);
    const [timeMute, setMuteTime] = useState("");
    const [timeBan, setBanTime] = useState("");


    const handleReset = () => {
      Array.from(document.querySelectorAll("input")).forEach(
        input => (input.value = "")
      );
    };

    const handleClickOutside = (event) => {
      if (toggleRef.current && !toggleRef.current.contains(event.target)) {
        setIsOpen(false);
        handleReset();
      }
    };

    const sendData = async () => {
      setIsOpen(!isOpen);
      handleReset();
    }

    const handleToggleClick = () => {
      setIsOpen(!isOpen);
    };

    React.useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    });

     const handleChangeBan = (event) => {
        const onlyNumbers = event.target.value.replace(/[^0-9]/g, "");
        setBanTime(onlyNumbers);
    };
    
    const handleChangeMute = (event) => {
        const onlyNumbers = event.target.value.replace(/[^0-9]/g, "");
        setMuteTime(onlyNumbers);
    };

    return (
        <>
        <div className="relative absolute">
          {isOpen && (
            <div ref={toggleRef}>
            <div className= "color-3 rounded-lg py-2">
              <h3 className="items-center">Admin Controller</h3>
              <div>
                <ul className="space-beetween">
                  <li>
                    Mute
                    <input className='custom-input' type="text" placeholder="User to mute"/>
                    <input className="custom-input w-24" pattern="[0-9]*" type="number"  value={timeMute} onChange={handleChangeMute} placeholder="Time sec"/>
                  </li>
                  <li>
                    Ban
                    <input className='custom-input' type="text" placeholder="User to ban"/>
                    <input className="custom-input w-24" pattern="[0-9]*" type="number" value={timeBan} onChange={handleChangeBan} placeholder="Time sec"/>
                  </li>
                  <li>
                    <button 
                        className="color-1 p-2 rounded-lg text-gray-700"
                        onClick={() => sendData()}>
                    <h1 className="text-color-4">
                        Sent
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
            <Image className="" src="/admin.svg" width="40" height="40" alt="admin"/>
          </button>
        </div>
        </>
    )
}

export default Admin;
