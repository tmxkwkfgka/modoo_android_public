
import {
   
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,    
    TouchableHighlight,
    NativeAppEventEmitter,
    NativeEventEmitter,
    NativeModules,
    Platform,
    PermissionsAndroid,
    FlatList,
    ScrollView,
    AppState,
    Dimensions,
    TextInput,
    Button,
    Picker,
    DeviceEventEmitter 
} from 'react-native';
import React, {useState, useEffect} from 'react';
import { parse } from "../utils/parseMsg";
import {imeiPayload, connectPayload, connectionStatusPayload, userMessagePayload, msgAckPayload, pollPayload, distressPayload, pollAckPayload, getSettingPayload, setIoportPayload, setReportPayload, getReportSetPayload,   networkStatusAck, placeAskAck, userMessageReceiveAck} from '../utils/sendMessageToBT'
import Sockets from 'react-native-sockets';
import Int8Array from 'core-js/features/typed-array/int8-array';
import { Buffer } from 'buffer'
import realm from '../realmdb'



const SocketScreen = ()=>{
    let [searchText, setSearchText] = useState('')
    let [messageKind, setMessageKind] = useState('')
    let [response, setResponse] = useState('response')
    var net = require('net');
    let [client, setClient] = useState(null)
// OR, if not shimming via package.json "browser" field:
// var net = require('react-native-tcp')

    // // OR, if not shimming via package.json "browser" field:
    // // var net = require('react-native-tcp')
    
   
    
    // var client = net.createConnection(1470, "192.168.0.144");
    
    // client.on('error', function(error) {
    //   console.log(error)
    // });
    
    // client.on('data', function(data) {
    //   console.log('message was received', data)
    // });

    const sendMsg = (byteArr) => {
        console.warn("byteArr = ")
        console.warn(byteArr)
        //Sockets.byteWrite(byteArr);
        let str = byteArr.map(v=>{
            let s = String.fromCharCode(v)
            console.warn(s)
            return s
        }).join("")
        //console.warn(str)
        //const stream = new Readable();
        let uintArr = new Int8Array(byteArr)
        //console.warn(Buffer.from(byteArr))
        //stream.push(Buffer.from(byteArr))
        console.warn(" client=")
        console.warn(client)
        client.write(Buffer.from(byteArr))
        //stream.pipe(client)
        

    }
  
    const onMsgSubmit = (messageKind) => {
        console.warn("on msg submit", messageKind)
        //let byteArr = msg.split(".");
        //console.warn(byteArr)
        // connectionStatusPayload, userMessagePayload, msgAckPayload, pollPayload, distressPayload, pollAckPayload, getSettingPayload, setIoportPayload, setReportPayload
        let msg = ""



        if("imei_tx_ask" == messageKind){
            msg = imeiPayload();
            sendMsg(msg)
            let messages = realm.objects("Messages")
            
            console.log(messages)
            
            realm.write(()=>{
                realm.create('Messages', {raw_content: msg.map(v=>v.toString(16)).join(""), txrx:"tx", kind: "imei_tx_ask", message_body: "", success: true, createdAt: new Date()})
            })
           
           
            //let ms= realm.objects('messages')
            //console.warn("realm messages = ")
            //console.warn(ms)
            //AsyncStorage.setItem("messages", JSON.stringify({raw_content: "gdgd", txrx: "tx", kind: "tx_imei_ask", message_body: ""}))
          
        }
        else if("network_status_tx_ask" == messageKind){
            msg = connectionStatusPayload()
            sendMsg(msg)
            realm.write(()=>{
                realm.create('Messages', {raw_content: msg.map(v=>v.toString(16)).join(""), txrx:"tx", kind: "network_status_tx_ask", message_body: "", success: true, createdAt: new Date()})
            })
        }
        else if("message_tx" == messageKind){
            let usermessage = ""
            msg = userMessagePayload(usermessage)
            sendMsg(msg)
            realm.write(()=>{
                realm.create('Messages', {raw_content: msg.map(v=>v.toString(16)).join(""), txrx:"tx", kind: "message_tx", message_body: "", success: true, createdAt: new Date()})
            })
        }
        else if("poll_tx_ask" == messageKind){
            msg = pollPayload()
            sendMsg(msg)
            realm.write(()=>{
                realm.create('Messages', {raw_content: msg.map(v=>v.toString(16)).join(""), txrx:"tx", kind: "poll_tx_ask", message_body: "", success: true, createdAt: new Date()})
            })
        }
        else if("distress_tx_set" == messageKind){
            let distressOn = true;
            msg = distressPayload(distressOn)
            sendMsg(msg)
            realm.write(()=>{
                realm.create('Messages', {raw_content: msg.map(v=>v.toString(16)).join(""), txrx:"tx", kind: "distress_tx_set", message_body: "", success: true, createdAt: new Date()})
            })
        }
        // else if("place_rx_ask" == messageKind){
        //     sendMsg(getSettingPayload())
        // }
        else if("ioport_tx_set" == messageKind){
            //io_inout "00": none "01": digital output "10": digital input "11": analog input
            //io_output "1": high "0": low
            msg = setIoportPayload("00", "0", "00", "0", "00", "0", "00", "0")
            sendMsg(msg)
            realm.write(()=>{
                realm.create('Messages', {raw_content: msg.map(v=>v.toString(16)).join(""), txrx:"tx", kind: "ioport_tx_set", message_body: "", success: true, createdAt: new Date()})
            })
        }
        else if("report_tx_set" == messageKind){
            let periodTime  = 60
            msg = setReportPayload("00111111", periodTime.toString(2).padStart(16, '0'), "000000000000000")
            sendMsg(msg)

            realm.write(()=>{
                realm.create('Messages', {raw_content: msg.map(v=>v.toString(16)).join(""), txrx:"tx", kind: "report_tx_set", message_body: "", success: true, createdAt: new Date()})
            })
        }else if("report_tx_ask" == messageKind){
            let periodTime  = 60
            msg = getReportSetPayload()
            sendMsg(msg)
            realm.write(()=>{
                realm.create('Messages', {raw_content: msg.map(v=>v.toString(16)).join(""), txrx:"tx", kind: "report_tx_set", message_body: "", success: true, createdAt: new Date()})
            })
        }
        
        
        
        //sendMsg(byteArr.map(v=>v*1))

    
    }

    const disconnect = () => {
     
    }

    const connect = () => {
        client = net.createConnection(1470, "192.168.0.144", ()=>{

            console.warn('connected to server!');
            setClient(client)
            //client.write('world!\r\n');
        });

        client.on('error', function(error) {
            console.warn(error)
        });

        client.on('data', function(data) {
            console.warn('message was received', data, Array.prototype.slice.call(data, 0))
            let numArr = Array.prototype.slice.call(data, 0)
            let parsed = parse(numArr)
            console.warn('parsed = ', parsed)

            if(parsed["type"] == "rx_imei_ask"){
                realm.write(()=>{
                    realm.create('Messages', {raw_content: parsed.raw_content, txrx:"rx", kind: "rx_imei_ask", message_body: parsed.imei, success:true, createdAt: new Date()})
                })
    
            }else if(parsed["type"] == "rx_network_status_ask"){
             console.log("in handleupdate rx_network_status_ask")
             realm.write(()=>{
                realm.create('Messages', {raw_content: parsed.raw_content, txrx:"rx", kind: "rx_network_status_ask", message_body: JSON.stringify({ status: parsed.status, regerr: parse.regerr, gps: parse.gps}), success:true, createdAt: new Date()})
             })
    
    
            }else if(parsed["type"] == "rx_user_message_ask"){
             console.log("in handleupdate rx_user_message_ask")
             realm.write(()=>{
                realm.create('Messages', {raw_content: parsed.raw_content, txrx:"rx", kind: "rx_user_message_ask", message_body: parsed.status || null, success:true, createdAt: new Date()})
             })
    
                
            }else if(parsed["type"] == "rx_user_message_receive"){
                console.log("in handleupdate rx_user_message_ask")
                realm.write(()=>{
                   realm.create('Messages', {raw_content: parsed.raw_content, txrx:"rx", kind: "rx_user_message_receive", message_body: parsed.message_body || null, success:true, createdAt: new Date()})
                })
                // 메시지 수신하고 ack신호 전달해야함
                sendMsg(userMessageReceiveAck())
       
                   
            }else if(parsed["type"] == "poll_rx_ask"){
              
            // "report_number": {
           
            //  "utc": {
          
            //  "gps": {
            //     "val": report_masking_bin.substr(4,1),
            //     "len": 8 * 2,
            //     "func": function(idx){
            //        return {
            //           "lat": hexToSignedInt(payload_data.substr(idx, 8)) / 100000,
            //           "lng": hexToSignedInt(payload_data.substr(idx+8, 8)) / 100000
            //        }
            //     }
            //  },
            //  "altitude": {
              
            //  "speed": {
             
            //  "course": {
           
            //  "ioport1" "ioport2" "ioport3" "ioport4": {
            //     "val": io_masking_bin.substr(4,1),
            //     "len": 2*2,
            //     "func": function(idx){
            //       let ioport_bin = hex2bin(payload_data.substr(idx, 1)) + hex2bin(payload_data.substr(idx+1, 1))
            //        return {
                   
            //           "port1_status": ioport_bin.substr(0, 2),
            //           "port1_io": ioport_bin.substr(3, 1),
            //           "port1_adc": parseInt(ioport_bin.substr(4, 12), 2)
      
            //        }
            //     }
             
    
             console.log("in handleupdate poll_rx_ask")
             realm.write(()=>{
                let now = new Date()
                let ips = []
                // port_num: 'int',
                // io_status: 'string',
                // out_status: 'string',
                // ADC: 'int',
                // createdAt: 'date',
                for(let p=1; p<5; p++){
                    if(parsed[`port${p.toString()}_status`]){
                        ips.push({
                            port_num: p,
                            io_status: parsed[`port${p.toString()}_status`] || null,
                            out_status: parsed[`port${p.toString()}_io`] || null,
                            ADC: parsed[`port${p.toString()}_adc`] || null,
                            createdAt: now
                        })
    
                    }
                }
                
                // string에 null 안되나? 안되나봄 Messages.message_body must be of type 'string', got null(null)
                realm.create('Messages', {raw_content: parsed.raw_content, txrx:"rx", kind: "poll_rx_ask", message_body: null, 
                place: {
                    report_number: parsed.report_number || null,
                    lat: parsed.lat || null,
                    lng: parsed.lng || null,
                    utc: parsed.utc && !isNaN(new Date(parsed.utc))? new Date(parsed.utc) : null,
                    alt: parsed.altitude || null,
                    speed: parsed.speed || null,
                    course: parsed.course || null,
                    createdAt: now,
    
    
                },
                ips: ips, 
                success:true, createdAt: now})
             })
                
            }else if(parsed["type"] == "distress_rx_set"){
    
             console.log("in handleupdate distress_rx_set")
             realm.write(()=>{
                realm.create('Messages', {raw_content: parsed.raw_content, txrx:"rx", kind: "distress_rx_set", message_body: parsed.imei, success:true, createdAt: new Date()})
             })
                
            }else if(parsed["type"] == "place_rx_ask"){
                console.log("in handleupdate place_rx_ask")
                sendMsg(placeAskAck());
            }else if(parsed["type"] == "Ioport_rx_set"){
                console.log("Ioport_rx_set ")
            }else if(parsed["type"] == "report_rx_set"){
                console.log("report_rx_set ")
            }
    
    
            let messages = realm.objects('Messages')
            console.log("all messages = ")
            console.log(messages)
      
            console.warn("handleUpdateValueForCharacteristic end = ")




            setResponse(data.toString())
        });
            

    }


    return (
        <View>
             <Button
                title="Connect"
                onPress={()=> connect()}
            />
            <Button
                title="disconnect"
                onPress={()=> disconnect()}
            />
            
            <TextInput
                onChangeText = {(textEntry) => setSearchText(textEntry)}
                style={{height:40, borderColor: 'black', borderWidth: 1, color:"black"}}
                //onSubmitEditing = {()=>{onMsgSubmit(this.state.searchText)}}
                value={"gdgdg"}
             />
        <Picker
            selectedValue={messageKind}
            style={{height: 50, width: 100}}
            onValueChange={(itemValue, itemIndex) =>{
                console.warn(itemValue)
                setMessageKind(itemValue)
            }
                //this.setState({language: itemValue})
                
        }>
            <Picker.Item label="imei_tx_ask" value="imei_tx_ask" />
            <Picker.Item label="network_status_tx_ask" value="network_status_tx_ask" />
            <Picker.Item label="message_tx" value="message_tx" />
            <Picker.Item label="poll_tx_ask" value="poll_tx_ask" />
            <Picker.Item label="distress_tx_set" value="distress_tx_set" />
         
            <Picker.Item label="ioport_tx_set" value="ioport_tx_set" />
            <Picker.Item label="report_tx_set" value="report_tx_set" />
            <Picker.Item label="report_tx_ask" value="report_tx_ask" />
            
        </Picker>
         
          <Button
            title="전송" 
            onPress={()=>onMsgSubmit(messageKind)}
          >
          </Button>
          <Text>{response}</Text>



        </View>
    )
}

export default SocketScreen;
