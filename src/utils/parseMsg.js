function parse(data){

   try{
      let buflen = data.length;
      console.log('buflen = ', buflen);
   
      //rx
   //    1. 단말기 연결 rx_connect
   //    2. imei 수신 rx_imei_ask
   //    3. 네트워크 연결상태 rx_network_status_ask
   //    4. 사용자 메시지 rx_user_message_ask, rx_user_message_receive
   //    5. poll data  poll_rx_ask
   //    6. distress set응답  distress_rx_set
   //    7. 정기적 장소정보 수신    place_rx_ask
   //    8. 레포트 설정값 수신 report_rx_ask
   //    9. 단말기 ioport rx ack
   //    10. 단말기 세팅 ack report set rx
   
      let raw_content = data.map(v=>v.toString(16)).join("")
      if(buflen > 3){
          let ctoken = data[3];
          let dataLen = 256 * data[1] + data[2];
          let dataStart = 4;
   
          if(ctoken == 67){
   
            //    1. 단말기 연결 rx_connect
            return {
               type: "rx_connect",
               ok: true
            }
   
          }else if(ctoken == 73){
              //imei 
              //    2. imei 수신 rx_imei_ask
              let len = dataLen - 1
              let imeiArr = data.slice(dataStart, dataStart+len);
              console.warn("len = ")
              console.warn(len)
              console.warn(imeiArr)
              let imeiStr = imeiArr.map((v)=>{return String.fromCharCode(v)}).join('')
              return {
                  type: "rx_imei_ask",
                  imei: imeiStr,
                  raw_content
              }
   
          }else if(ctoken == 78){
           // 나중에 코드에 따른 정의내용을 노가다로 해서 연결해야함
           //    3. 네트워크 연결상태 rx_network_status_ask
           let len = dataLen - 1
           let status = data[dataStart];
           let regErr = data[dataStart + 1];
           let gps = data[dataStart + 2];
   
           return {
               type: "rx_network_status_ask",
               status: status,
               regErr: regErr,
               gps: gps,
               raw_content
           }
   
   
          }else if(ctoken == 77){
               //    4. 사용자 메시지 rx_user_message_ask, rx_user_message_receive
              let subtoken = data[dataStart];
              if(subtoken == 83){
                let status = data[dataStart + 1];
                let statusStr = ""
                if(status == 79){
                   statusStr = "ok"
                }else if(status == 87){
                   statusStr = "wait"
                }if(status == 83){
                   statusStr = "send"
   
                }
                return { 
                    type: "rx_user_message_ask",
                    status : statusStr,
                    raw_content
   
                }
              }
              else if(subtoken == 82){
                 // 메시지 받기 
                 // data length = ctoken + subtoken + data 갯수 
                 // 위성 연결이 안되어서 테스트는 힘듬
                 let payloadMsgLen = dataLen -2 // datalen - ctoken - subtoken
                 let messageHexStr = data.slice(5, 5+payloadMsgLen).map(v=>v.toString(16).padStart(2, '0')).join("") // stx datalen: msb lsb ctoken subctoken
   
                 return {
                    type: "rx_user_message_receive",
                    message_body: hexstr_to_hanguel_or_else(messageHexStr),
                    raw_content
   
                 }
                 
   
   
              }
   
         }else if(ctoken == 80){
             //    5. poll data  poll_rx_ask
            console.log("Data = ", data)
           let report_masking_bin = data[dataStart].toString(2).padStart(8, '0');
           let report_num = parseInt(report_masking_bin.substr(0,2), 2);
           let reportOn = Number(report_masking_bin.substr(2,1));
           let utcOn = Number(report_masking_bin.substr(3,1));
           let gpsOn = Number(report_masking_bin.substr(4,1));
           let altOn = Number(report_masking_bin.substr(5,1));
           let speedOn = Number(report_masking_bin.substr(6,1));
           let courseOn = Number(report_masking_bin.substr(7,1));
   
           let io_masking_bin = data[dataStart+1].toString(2).padStart(8, '0');
           let io1On = Number(io_masking_bin.substr(4,1));
           let io2On = Number(io_masking_bin.substr(5,1));
           let io3On = Number(io_masking_bin.substr(6,1));
           let io4On = Number(io_masking_bin.substr(7,1));
   
           let onArr = [].concat(utcOn, gpsOn, altOn, speedOn, courseOn);
   
           let datan = parsePayloadData(decArrToHexStr([data[dataStart]]), decArrToHexStr([data[dataStart+1]]), decArrToHexStr(data));
           datan["type"] = "poll_rx_ask"
           datan["raw_content"] = raw_content
   
           return datan;
   
          }else if(ctoken == 68){
              //    6. distress set응답  distress_rx_set
              let distress = data[dataStart];
              let report_masking_bin = data[dataStart+1].toString(2).padStart(8, '0');
              let datan = parsePayloadData(decArrToHexStr([data[dataStart + 1]]), decArrToHexStr([data[dataStart + 2]]), decArrToHexStr(data));
              datan["type"] = "distress_rx_set"
              datan["raw_content"] = raw_content
              return datan;
   
          }else if(ctoken == 76){
              // 정기적 위치 데이터 수신인데 이때는 파싱하고 confirm메시지를 whichi-10으로 날려야함
              // ack신호는 ctoken만 전송하면 된단다
                //    7. report data수신    place_rx_ask
              let datan = parsePayloadData(decArrToHexStr([data[dataStart]]), decArrToHexStr([data[dataStart+1]]), decArrToHexStr(data));
              datan["type"] = "place_rx_ask"
              datan["raw_content"] = raw_content
              return datan;
          }else if(ctoken == 83){
             //    8. 레포트 설정값 수신 report_rx_ask
              let subctoken = data[dataStart];
              reports = []
   
              if(subctoken == 82){
                 console.log("ctoekn 83 subctoken 82")
               for(let i=1; i<5; i++){
               
                   let start = dataStart + (4*(i-1)) + 1
                   let report_masking_bin = data[start].toString(2).padStart(8, '0');
                   let report_num = parseInt(report_masking_bin.substr(0,2), 2);
                   let reportOn = Number(report_masking_bin.substr(2,1));
                   let utcOn = Number(report_masking_bin.substr(3,1));
                   let gpsOn = Number(report_masking_bin.substr(4,1));
                   let altOn = Number(report_masking_bin.substr(5,1));
                   let speedOn = Number(report_masking_bin.substr(6,1));
                   let courseOn = Number(report_masking_bin.substr(7,1));
       
                   let periodTime = data[start+2];
                   let iomasking = data[start+3];
                   reports.push({ report_num, reportOn, utcOn, gpsOn, altOn, speedOn, courseOn, periodTime, iomasking})
               }
               console.log("reports = ", reports)
       
                  let ioportstatus_binstr = data.slice(dataStart + 16, dataStart + 18).map(v=>v.toString(2).padStart(8, '0')).join("")
                  console.log(ioportstatus_binstr)
                  port1_io_status = ioportstatus_binstr.substr(0,2);
                  port1_out_status = ioportstatus_binstr.charAt(3);
       
                  port2_io_status = ioportstatus_binstr.substr(4,2);
                  port2_out_status = ioportstatus_binstr.charAt(7);
       
                  port3_io_status = ioportstatus_binstr.substr(8,2);
                  port3_out_status = ioportstatus_binstr.charAt(11);
       
                  port4_io_status = ioportstatus_binstr.substr(12,2);
                  port4_out_status = ioportstatus_binstr.charAt(15);
       
                  return {
                      type: "report_rx_ask",
                      reports: reports,
                      port1_io_status, port1_out_status,
                      port2_io_status, port2_out_status,
                      port3_io_status, port3_out_status,
                      port4_io_status, port4_out_status,
                      raw_content
   
                  }
   
              }else if(subctoken == 87){
                  //02 00 03 53 57 00 ad 03  실제로 ioport set rx로 오는 데이터
                  let subctoken2 = data[dataStart+1];
                  if(subctoken2 == 73){
                      //ioport ack, 위치텐에서 오는 메시지에 그냥 에크만옴
                       //    9. 단말기 ioport rx ack
                      console.log("IOport set rx ");
                      return {
                         type: "Ioport_rx_set",
                         ok: true
                      }
   
                  }else if(subctoken2 == 82){
                      // report set ack, 위치텐에서 오는 메시지에 그냥 에크만옴
                        //    10. 단말기 세팅 ack report set rx
   
                      console.log("Report set ack ");
                      return {
                         type: "report_rx_set",
                         ok: true
                      }
                  }
              }
   
   
              
            
   
   
          }
   
   
      }else{
          console.log("error length too short")
      }

   }catch(err){
      console.log("parsemsg err= ", err)
   }


}

function is_hangul_char(c) {
   //c = ch.charCodeAt(0);
   //console.log("in ishanguel c = ", c)
   //c = parseInt(c, 16)
   if( 0x1100<=c && c<=0x11FF ) return true;
   if( 0x3130<=c && c<=0x318F ) return true;
   if( 0xAC00<=c && c<=0xD7A3 ) return true;
   return false;
 }

 function hexstr_to_hanguel_or_else(hexstr){
   let pointer = 0;
   let retstr = ""
   while(pointer < hexstr.length){
     if(is_hangul_char(parseInt(hexstr.slice(pointer, pointer+4), 16))){
       //console.log("한글맞음")
       retstr += String.fromCharCode(parseInt(hexstr.slice(pointer, pointer+4),16))
       pointer += 4;
     }else{
       retstr += String.fromCharCode(parseInt(hexstr.slice(pointer, pointer+2),16))
       pointer += 2;
     }
   }
 
   return retstr;
 
 }


function parsePayloadData(report_masking, io_making, payload_data){
    console.log("in parsepayloaddata", hex2bin(report_masking));
    console.log("in parsepayload data payload = ", payload_data)
    let report_masking_bin = hex2bin(report_masking);
    let io_masking_bin = hex2bin(io_making)
    let ctoken = payload_data.substr(6,2)

    let masking = {
       "report_number": {
          "val": report_masking_bin.substr(0,2),
          "len": 0,
          "func": function(idx){
             return {"report_number" : parseInt(report_masking_bin.substr(0,2), 2)};
          }
       },
       "utc": {
         "val": report_masking_bin.substr(3,1),
         "len": 6 * 2,
         "func": function(idx){
            let utcString = getValidTwoThousand(parseInt(payload_data.substr(idx+10, 2), 16).toString())
            return {
               "utc": `${utcString}.${parseInt(payload_data.substr(idx+8, 2), 16).toString()}.${parseInt(payload_data.substr(idx+6, 2), 16).toString()} ${parseInt(payload_data.substr(idx, 2), 16).toString()}:${parseInt(payload_data.substr(idx+2, 2), 16).toString()}:${parseInt(payload_data.substr(idx+4, 2), 16).toString()}`
            }
 
         }
       },
       "gps": {
          "val": report_masking_bin.substr(4,1),
          "len": 8 * 2,
          "func": function(idx){
             return {
                "lat": hexToSignedInt(payload_data.substr(idx, 8)) / 100000,
                "lng": hexToSignedInt(payload_data.substr(idx+8, 8)) / 100000
             }
          }
       },
       "altitude": {
          "val": report_masking_bin.substr(5,1),
          "len": 3 * 2,
          "func": function(idx){
             return {
                "altitude": hexToSignedInt(payload_data.substr(idx, 6)) / 10
             }
             
          }
          
       },
       "speed": {
          "val": report_masking_bin.substr(6,1),
          "len": 2 * 2,
          "func": function(idx){
             return {
                "speed": parseInt(payload_data.substr(idx, 4), 16) / 100
             }
          }
          
       },
       "course": {
         "val" : report_masking_bin.substr(7,1),
         "len": 2 * 2,
         "func": function(idx){
            return {
               "course": parseInt(payload_data.substr(idx, 4), 16) / 100
            }
         }
       },
       "ioport1": {
          "val": io_masking_bin.substr(4,1),
          "len": 2*2,
          "func": function(idx){
            let ioport_bin = hex2bin(payload_data.substr(idx, 1)) + hex2bin(payload_data.substr(idx+1, 1))
             return {
             
                "port1_status": ioport_bin.substr(0, 2),
                "port1_io": ioport_bin.substr(3, 1),
                "port1_adc": parseInt(ioport_bin.substr(4, 12), 2)

             }
          }
       },
       "ioport2": {
         "val": io_masking_bin.substr(5,1),
         "len": 2*2,
         "func": function(idx){
           let ioport_bin = hex2bin(payload_data.substr(idx, 1)) + hex2bin(payload_data.substr(idx+1, 1))
            return {
              
               "port2_status": ioport_bin.substr(0, 2),
               "port2_io": ioport_bin.substr(3, 1),
               "port2_adc": parseInt(ioport_bin.substr(4, 12), 2)

            }
         }

       },
       "ioport3": {
         "val": io_masking_bin.substr(6,1),
         "len": 2*2,
         "func": function(idx){
           let ioport_bin = hex2bin(payload_data.substr(idx, 1)) + hex2bin(payload_data.substr(idx+1, 1))
            return {
              
               "port3_status": ioport_bin.substr(0, 2),
               "port3_io": ioport_bin.substr(3, 1),
               "port3_adc": parseInt(ioport_bin.substr(4, 12), 2)

            }
         }

       },
       "ioport4": {
         "val": io_masking_bin.substr(7,1),
         "len": 2*2,
         "func": function(idx){
           let ioport_bin = hex2bin(payload_data.substr(idx, 1)) + hex2bin(payload_data.substr(idx+1, 1))
            return {
              
               "port4_status": ioport_bin.substr(0, 2),
               "port4_io": ioport_bin.substr(3, 1),
               "port4_adc": parseInt(ioport_bin.substr(4, 12), 2)

            }
         }

       }

    }
 
   
    let ret = {};
    let idx = 6;
    //idx 시작점은 utc 즉 io masking다음 부터
    //poll_rx
    console.log("parse payload ctoken = ", ctoken)
    if(ctoken == "50")
      idx = 12
    else if (ctoken == "44") //distress_rx
      idx = 14
    else if(ctoken == "4c") //place_rx_ask
      idx = 12
    
    Object.keys(masking).forEach(function(key){
       let cur = masking[key];
      
       if(cur["val"]  == "1" || cur["len"] == 0){
          console.log("idx, key", idx, key)
          Object.keys(cur["func"](idx)).forEach(function(subvalKey){
             ret[subvalKey] = cur["func"](idx)[subvalKey];
 
          })
 
          idx += cur["len"];
       }
       
    })
 
    console.log("payload ret = ", ret);
 
    return ret;
 }



 function hex2bin(hex){
	let ret = ""
    hex.match(/.{1,2}/g).forEach(h=>{
		ret += parseInt(h,16).toString(2).padStart(8, '0')

    })
	return ret 
}


 function hexToSignedInt(hex) {
    if (hex.length % 2 != 0) {
        hex = "0" + hex;
    }
    var num = parseInt(hex, 16);
    var maxVal = Math.pow(2, hex.length / 2 * 8);
    if (num > maxVal / 2 - 1) {
        num = num - maxVal
    }
    return num;
 }
   
 function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
  }

  function decArrToHexStr(arr){
     return arr.map((dec)=>{
        return dec.toString(16).padStart(2, '0')
     }).join("")
  }

  function hexToUnsignedInt(hex){
    return parseInt(hex,16);
}

function getValidTwoThousand(year){
   let ret = "2";
   for(let i=0; i<(3-year.length ); i++){
      ret += "0";
   }
   ret += year;
   return ret;

}

// reportset tx에 대한 응답
// 02 00 14 53 52 2b 00 78 00 40 00 78 00 80 00 78 00 c0 00 78 00 00 00 44 03 
//console.log(parse([2, 0, 20, 83, 82, 43, 0, 120, 0, 64, 0, 120, 0, 128, 0, 120, 0, 192, 0, 120, 0, 0, 0, 68, 3]))
export {
    parse
}
