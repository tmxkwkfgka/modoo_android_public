import React, {useState, useEffect} from 'react';
import BleManager from 'react-native-ble-manager';
import { Navigation } from "react-native-navigation";
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
    Picker
} from 'react-native';
import {imeiPayload, connectPayload, connectionStatusPayload, userMessagePayload, msgAckPayload, pollPayload, distressPayload, pollAckPayload, getSettingPayload, setIoportPayload, setReportPayload, getReportSetPayload,   networkStatusAck, placeAskAck, userMessageReceiveAck} from '../utils/sendMessageToBT'
import { parse } from "../utils/parseMsg";
import realm from '../realmdb'



const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
let handlerUpdate;

const ComuPanel = ({text, connectedPeri}) => {
    console.warn("connectedPer i")
    console.warn(connectedPeri)
    let [searchText, setSearchText] = useState('')
    let [messageKind, setMessageKind] = useState('')
    let [response, setResponse] = useState('response')
    

    useEffect(()=>{
        handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic );
        setTimeout(() => {
    
            //notification fail에 대한 에러처리
            //

            BleManager.retrieveServices(connectedPeri).then((peripheralInfo) => {

              
              console.warn("notification success")
              let promise = Promise.resolve();
              for(let i=0; i<peripheralInfo.characteristics.length; i++){
             
                
                let char  = peripheralInfo.characteristics[i]
                promise = promise.then(()=>{
                  console.warn('before notification =', char)
                  BleManager.startNotification(connectedPeri, char.service, char.characteristic).then(() => {
                    console.warn('after startnotification =', char)
                  })
                 
                })
               
              }
            

            })

          }, 900);

          return ()=>{
              console.log("커뮤패널 언마운트")
          }
    }, [])
    /*
        ..

        tx
        1. imei 수신 # 
        2. 단말기로 사용자 메시지 #
        3. 단말기로 poll data
        4. 단말기로 distress
        5. 단말기에서 설정값 읽기 #
        6. 단말기 ioport 설정  *
        7. 단말기 report 설정  *

        rx
        1. 네트워크 연결상태 networkStatusAck 
        2. 단말기에서 서버로 전송한 레포트 데이터 주기적 수신 placeAskAck

        ..
    */

    const onMsgSubmit = (messageKind) => {
        console.warn("on msg submit", messageKind)
        //let byteArr = msg.split(".");
        //console.warn(byteArr)
        // connectionStatusPayload, userMessagePayload, msgAckPayload, pollPayload, distressPayload, pollAckPayload, getSettingPayload, setIoportPayload, setReportPayload
        let msg = ""



        if("imei_tx_ask" == messageKind){
            msg = imeiPayload();
            sendMsg(msg)
            // realm.write(()=>{
            //     realm.create('Messages', {raw_content:"dgdgd", txrx:"tx", kind: "tx_imei_ask", message_body: "ex"})
            // })
           
           
            //let ms= realm.objects('messages')
            //console.warn("realm messages = ")
            //console.warn(ms)
            //AsyncStorage.setItem("messages", JSON.stringify({raw_content: "gdgd", txrx: "tx", kind: "tx_imei_ask", message_body: ""}))
          
        }
        else if("network_status_tx_ask" == messageKind){
            // 2 0 1 78 79 3 응답없음 
            msg = connectionStatusPayload()
            sendMsg(msg)
        }
        else if("message_tx" == messageKind){
            // 응답으로 2 0 3 77 83 79 242 3
            // status 79: ok 
            let usermessage = "aa"
            msg = userMessagePayload(usermessage)
            sendMsg(msg)
        }
        else if("poll_tx_ask" == messageKind){
            // 2 0 2 68 07 03
            msg = pollPayload(49)
            sendMsg(msg)
        }
        else if("distress_tx_set" == messageKind){
            //02 00 10 44 01 0b 00 00 12 d6 87 00 bc 61 4e 30 39 30 39 0c 03  distress tx on에 대한 응답

            let distressOn = true;
            msg = distressPayload(distressOn)
            sendMsg(msg)
        }
        // else if("place_rx_ask" == messageKind){
        //     sendMsg(getSettingPayload())
        // }
        else if("ioport_tx_set" == messageKind){
            //io_inout "00": none "01": digital output "10": digital input "11": analog input
            //io_output "1": high "0": low
           
            msg = setIoportPayload("00", "0", "00", "0", "00", "0", "00", "0")
            sendMsg(msg)
        }
        else if("report_tx_set" == messageKind){
            let periodTime  = 60
            msg = setReportPayload("00111111", periodTime.toString(2).padStart(16, '0'), "000000000000000")
            sendMsg(msg)
        }else if("report_tx_ask" == messageKind){
            sendMsg(getReportSetPayload());
        }
        
        
        
        //sendMsg(byteArr.map(v=>v*1))

    
    }

    const sendMsg = (byteArr) => {
    
       console.warn(byteArr)
    
        BleManager.connect(connectedPeri).then(() => {
            console.warn("connected,", connectedPeri)
            // let peripherals = this.state.peripherals;
            // let p = peripherals.get(peripheral.id);
            // if (p) {
            //   p.connected = true;
            //   peripherals.set(peripheral.id, p);
            //   this.setState({peripherals});
            // }
            console.log('Connectedto' + connectedPeri);


        setTimeout(() => {

           
        
            BleManager.retrieveServices(connectedPeri).then((peripheralInfo) => {
                console.warn(peripheralInfo);
            
                console.warn(peripheralInfo.characteristics[peripheralInfo.characteristics.length -2])
                // Write와 WriteWithoutResponse가 있는 characteristic 선택해서 그곳으로 메시지 보냄
                let writeChar = null;
                peripheralInfo.characteristics.forEach((characteristic)=>{
                    //console.log("in foreach")
                    //console.log(characteristic.properties["Write"])
                    if(characteristic.properties["Write"] && characteristic.properties["WriteWithoutResponse"]){
                        writeChar = characteristic
                    }
                })

                if(writeChar){
                     // write할수 있는 characteristic이 없을때
                     let service = writeChar.service;
                     let characteristic = writeChar.characteristic;
         
                     console.warn(service, characteristic)
         
         
                     setTimeout(() => {
                         
                         BleManager.write(connectedPeri, service, characteristic, byteArr).then((res) => {
                             console.warn('after write =', res);
                         })
                         .catch((err)=>{
                             console.warn("write err= ", err)
                         })
                         
         
                     }, 1500);

                }else{

                    console.warn(" 맞는 write char 없음")
                   
                }
           

            });

        }, 900);
        }).catch((error) => {
            console.warn("Connection error", error)
            console.log('Connection error', error);
        });


    }
    // 응답으로 여기에 업데이트 된다.
    const handleUpdateValueForCharacteristic = (data) => {
        console.warn('Received data from  ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
        setResponse(data.value.map(v=>v.toString(16) + " "))
        let parsed = parse(data.value)
        console.warn(parsed)
        // let rmessages = realm.objects('Messages')
        // console.log("all messages = ")
        // console.log(rmessages)
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
       
        
    }

    return (
        <View style={styles.container}>
            <TextInput
            onChangeText = {(textEntry) => setSearchText(textEntry)}
            style={{height:40, borderColor: 'black', borderWidth: 1, color:"black"}}
            //onSubmitEditing = {()=>{onMsgSubmit(this.state.searchText)}}
            vlaue={"gdgdg"}
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


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        width: window.width,
        height: window.height
    },
    scroll: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        margin: 10,
    },
    row: {
        margin: 10
    },
});
  
export default ComuPanel;