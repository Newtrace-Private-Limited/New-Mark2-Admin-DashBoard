import React from 'react';
import { useWebSocket } from 'src/WebSocketProvider';

const Separator = () => {
  const data = useWebSocket();

  const separatorData = {
    'CR-LT-011': { value: data['CR-LT-011'], width: '80px' },
    'CR-PT-011': { value: data['CR-PT-011'], width: '20px' },
    'CR-LT-021': { value: data['CR-LT-021'], width: '80px' },
    'CR-PT-021': { value: data['CR-PT-021'], width: '20px' },
    'CW-TT-011': { value: data['CW-TT-011'], width: '60px' },
    'CR-TT-001': { value: data['CR-TT-001'], width: '60px' }, 
  };

  return (
    <div>
      <div className="flex gap-8 ">
        <div className="flex ">
          <div style={{ width: separatorData['CR-LT-011'].width, height: '220px', position: 'relative', margin: '0 10px', backgroundColor: "#121E34" }}>
            <h2 style={{ textAlign: "center" }}></h2>
            <div style={{ backgroundColor: "#09EAFC", width: '100%', height: `${(separatorData['CR-LT-011'].value / 3500) * 1000}px`, position: 'absolute', bottom: "0px" }}></div>
           
          </div>
          <div style={{ width: separatorData['CR-PT-021'].width, height: '220px', position: 'relative', margin: '0 10px', backgroundColor: "#121E34" }}>
            <h2 style={{ textAlign: "center", position:"relative", top:"-30px", right:"20px" ,fontFamily:"bold" }}>H<sub>2</sub></h2>
            <div style={{ backgroundColor: "#3333FF", width: '100%', height: `${(separatorData['CR-PT-021'].value / 3500) * 1000}px`, position: 'absolute', bottom: "0px" }}></div>
           
          </div>
        </div>
        <div className="flex">
          <div style={{ width: separatorData['CR-LT-021'].width, height: '220px', position: 'relative', margin: '0 10px', backgroundColor: "#121E34" }}>
            <h2 style={{ textAlign: "center" }}></h2>
            <div style={{ backgroundColor: "#09EAFC", width: '100%', height: `${(separatorData['CR-LT-021'].value / 3500) * 1000}px`, position: 'absolute', bottom: "0px" }}></div>
           
          </div>
          <div style={{ width: separatorData['CR-PT-021'].width, height: '220px', position: 'relative', margin: '0 10px', backgroundColor: "#121E34" }}>
            <h2 style={{ textAlign: "center", position:"relative", top:"-30px", right:"20px", fontFamily:"bold",  }}>O<sub>2</sub></h2>
            <div style={{ backgroundColor: "#3333FF", width: '100%', height: `${(separatorData['CR-PT-021'].value / 3500) * 1000}px`, position: 'absolute', bottom: "0px" }}></div>
          
          </div>
        </div>
      </div>
      <div className="relative bottom-[-14px] ml-4 font-bold">
        <p className="text-[#09EAFC]">{separatorData['CR-LT-011'].value.toFixed(0)} mm</p>
        <p className="text-[#3333FF]">{separatorData['CR-PT-011'].value.toFixed(0)} mbar</p>
        <div className="relative bottom-11 ml-44">
          <p className="text-[#09EAFC]">{separatorData['CR-LT-021'].value.toFixed(0)} mm</p>
          <p className="text-[#3333FF]">{separatorData['CR-PT-021'].value.toFixed(0)} mbar</p>
        </div>
      </div>
    </div>
  );
};

export default Separator;
