
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
import {imeiPayload, connectionStatusPayload, userMessagePayload, msgAckPayload, pollPayload, distressPayload, pollAckPayload, getSettingPayload, setIoportPayload, setReportPayload, getReportSetPayload,   networkStatusAck, placeAskAck} from '../utils/sendMessageToBT'
import Sockets from 'react-native-sockets';

const SocketScreen = ()=>{
    let [searchText, setSearchText] = useState('')
    let [messageKind, setMessageKind] = useState('')
    let [response, setResponse] = useState('response')
    
    // var net = require('net');
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
    
        console.warn(byteArr)
        Sockets.byteWrite(byteArr);

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
            // realm.write(()=>{
            //     realm.create('Messages', {raw_content:"dgdgd", txrx:"tx", kind: "tx_imei_ask", message_body: parsed.imei})
            // })
           
           
            //let ms= realm.objects('messages')
            //console.warn("realm messages = ")
            //console.warn(ms)
            //AsyncStorage.setItem("messages", JSON.stringify({raw_content: "gdgd", txrx: "tx", kind: "tx_imei_ask", message_body: ""}))
          
        }
        else if("network_status_tx_ask" == messageKind){
            msg = connectionStatusPayload()
            sendMsg(msg)
        }
        else if("message_tx" == messageKind){
            let usermessge = ""
            msg = userMessagePayload(usermessage)
            sendMsg(msg)
        }
        else if("poll_tx_ask" == messageKind){
            msg = pollPayload()
            sendMsg(msg)
        }
        else if("distress_tx_set" == messageKind){
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

    const disconnect = () => {
        console.warn("disconnect")
        Sockets.disconnect();
    }

    const connect = () => {
        console.warn("connect")
        let config={
            address: "192.168.0.144", //ip address of server
            port: 1470, //port of socket server
            timeout: 5000, // OPTIONAL (default 60000ms): timeout for response
            reconnect:true, //OPTIONAL (default false): auto-reconnect on lost server
            reconnectDelay:500, //OPTIONAL (default 500ms): how often to try to auto-reconnect
            maxReconnectAttempts:10, //OPTIONAL (default infinity): how many time to attemp to auto-reconnect
    
        }
        Sockets.startClient(config);
       
        //Sockets.disconnect();

        DeviceEventEmitter.addListener('socketClient_connected', () => {
            console.log('socketClient_connected');
            Sockets.write("message to server");
          });
          //on timeout
          DeviceEventEmitter.addListener('socketClient_timeout', (data) => {
            console.log('socketClient_timeout',data.error);
          });
          //on error
          DeviceEventEmitter.addListener('socketClient_error', (data) => {
            console.log('socketClient_error',data.error);
          });
          //on new message
          DeviceEventEmitter.addListener('socketClient_data', (payload) => {
            console.warn('socketClient_data message:', payload.data);
          });
          //on client closed
          DeviceEventEmitter.addListener('socketClient_closed', (data) => {
            console.log('socketClient_closed',data.error);
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

export default SocketScreen;
