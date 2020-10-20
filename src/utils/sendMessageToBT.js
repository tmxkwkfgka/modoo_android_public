let MT_stx = [2];
let MT_len = [0,20];    // 31 + payloadlen
let MT_ctoken = [65];
let MT_payload = [];
let MT_checksum = [0, 21];
let MT_etx = [3];

function makeMTMessage(ctoken, payload){

    let empty  = [];
    MT_ctoken = ctoken;
    MT_payload = payload;
    MT_len = [parseInt(( (ctoken.length + payload.length)/2 ).toString(16).padStart(4, '0').substr(0,2), 16), parseInt(( (ctoken.length + payload.length)/2 ).toString(16).padStart(4, '0').substr(2,2), 16)]
    MT_checksum = ctoken.length + payload.length + ctoken[0] + payload.reduce((prev, cur, i, arr)=>{return prev + cur}, 0);

    let MT_msg = empty.concat(MT_stx, MT_len, MT_ctoken, MT_payload, MT_checksum, MT_etx)
    return MT_msg;

}


function imeiPayload(){
    let ret = [2,0,1];
    let ctoken = [73];
    let checksum = [74];
    let etx = [3]
    return ret.concat(ctoken, checksum, etx)
}


function connectPayload(connect){
    // connect: boolean
    if(connect){
        return makePayload(67,null, null, null, [67])
    }else{
        return makePayload(67,null, null, null, [68])
    }
    
}

function connectionStatusPayload(){
    return makePayload(78, null, null, null, null);
}

function userMessagePayload(msg){
    return makePayload(77, 83, null, msg, null);
}

function msgAckPayload(){
    return makePayload(77, 82, null, null, null);
}

function pollPayload(reportNumHex){
    console.log("reportNumHex=", reportNumHex)
    return makePayload(80, reportNumHex, null, null, null);
}

function distressPayload(distressOn){
    let distressArr = [];
    if(distressOn==1)
        distressArr = [1]
    else if(distressOn == 0)
        distressArr = [0]
    
    return makePayload(68, null, null, null, distressArr);
}

function pollAckPayload(){
    return makePayload(76, null, null, null, null);
}

function getSettingPayload(){
    return makePayload(83, 82, null, null, null);
}

function setIoportPayload(port1_inout, port1_out, port2_inout, port2_out, port3_inout, port3_out, port4_inout, port4_out){
    //io_inout "00": none "01": digital output "10": digital input "11": analog input
    //io_output "1": high "0": low
    let ioport_status_str_msb = port1_inout + "0" + port1_out + port2_inout + "0" + port2_out;
    let ioport_status_str_lsb = port3_inout + "0" + port3_out + port4_inout + "0" + port4_out;


    return makePayload(83, 87, 49, null, [parseInt(ioport_status_str_msb, 2), parseInt(ioport_status_str_lsb, 2)]);
}

// "01" "1" peiroddtime = number , 
function setReportPayload(reportMaskingBinStr, periodTimeBinStr,  ioportStatusBinStr){

    return makePayload(83, 87, null, null, [82, parseInt(reportMaskingBinStr, 2), parseInt(periodTimeBinStr.slice(0, 8), 2), parseInt(periodTimeBinStr.slice(8, 16), 2), parseInt(ioportStatusBinStr.slice(0, 8), 2), parseInt(ioportStatusBinStr.slice(8, 16), 2)]);
}

function getReportSetPayload(){
    return makePayload(83, 82, null, null, null);
}

function networkStatusAck(){
    return makePayload(67, null, null, null, null);
}
function placeAskAck(){
    return makePayload(76, null, null, null, null);
}

function userMessageReceiveAck(){
    return makePayload(78, 82, null, null, null)
}

/*
    arrtypemsg : 10진수 숫자를 array로 인자로 제공
*/
function makePayload(ctokennum, subctokennum, subtoken2num, msg, arrtypemsg){
    let ret = [];
    
    let ctoken = [ctokennum];
    let subctoken = subctokennum? [subctokennum] : [];
    let subtoken2 = subtoken2num? [subtoken2num] : [];
    let datan = (msg && typeof msg == "string") ? msg.split('').map(x=>x.charCodeAt(0)) : [];
    let datan_arr = arrtypemsg && Array.isArray(arrtypemsg) ? arrtypemsg : [];
    let len = ctoken.length + (subctoken? subctoken.length : 0) + (subtoken2? subtoken2.length : 0) + (datan? datan.length : 0) + (datan_arr? datan_arr.length : 0);
    
    let checksum = (datan_arr.reduce((prev, cur, idx, arr) => {return prev+cur}, 0) + datan.reduce((prev, cur, idx, arr) => {return prev+cur}, 0) + (subctokennum? subctokennum : 0) + (ctokennum) + (subtoken2num? subtoken2num : 0) + len) % 256

    let stx = [2];
    let lenArr = len.toString(16).padStart(4, '0').match(/.{1,2}/g).map(v=>parseInt(v, 16));
    let etx = [3]
    
    return ret.concat(stx, lenArr, ctoken, subctoken, subtoken2, datan, datan_arr, checksum, etx);
}

export {
    connectPayload,
    imeiPayload,
    connectionStatusPayload,
    userMessagePayload,
    msgAckPayload,
    pollPayload,
    distressPayload,
    pollAckPayload,
    getSettingPayload,
    setIoportPayload,
    setReportPayload,
    getReportSetPayload,
    networkStatusAck,
    placeAskAck
}
