
import React, {useState, useEffect} from 'react';
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
    Button
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import { Navigation } from "react-native-navigation";
const window = Dimensions.get('window');
//const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const BTScreen = () => {
    let [scanning, setScanning] = useState(false)
    let [peripherals, setPeripherals] = useState(new Map())
    let [appState, setAppState] = useState('')
    let [searchText, setSearchText] = useState('')

    let handlerDiscover, handlerStop, handlerDisconnect, handlerUpdate;

    useEffect(()=>{
      AppState.addEventListener('change', handleAppStateChange);
      BleManager.start({showAlert: false});
      handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral );
      handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan );
      handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral );
      handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic );

      if (Platform.OS === 'android' && Platform.Version >= 23) {
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
            if (result) {
              console.log("Permission is OK");
            } else {
              PermissionsAndroid.requestPermission(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                if (result) {
                  console.log("User accept");
                } else {
                  console.log("User refuse");
                }
              });
            }
        });
      }
        
    }, [])

    const handleAppStateChange = (nextAppState)=> {
        if (appState.match(/inactive|background/) && nextAppState === 'active') {
          console.log('App has come to the foreground!')
          BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
            console.log('Connected peripherals: ' + peripheralsArray.length);
          });
        }
        //this.setState({appState: nextAppState});
        setAppState(nextAppState)
    }
    const handleDisconnectedPeripheral = (data) => {
        let _peripherals = peripherals;
        let peripheral = _peripherals.get(data.peripheral);
        if (peripheral) {
          peripheral.connected = false;
          _peripherals.set(peripheral.id, peripheral);
          //this.setState({peripherals});
          setPeripherals(_peripherals)
        }
        console.warn('Disconnected from ' + data.peripheral);
    }
    
    const handleUpdateValueForCharacteristic = (data) => {
        console.warn('Received data from  ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
    }

    const handleStopScan = () => {
        console.warn('Scan is stopped');
        //this.setState({ scanning: false });
        setScanning(false)
    }
    
    const startScan = () => {
       
        console.log("scan start ! dfdf")
        
        if (!scanning) {
          console.warn("in not scanning")
            //this.setState({peripherals: new Map()});
            setPeripherals(new Map());
            BleManager.scan([], 3, true).then((results) => {
                console.log('Scanning...');
                //this.setState({scanning:true});
                setScanning(true);
            });
        }
    }
    
    const retrieveConnected = () => {
        BleManager.getConnectedPeripherals([]).then((results) => {
          if (results.length == 0) {
            console.log('No connected peripherals')
          }
          console.log(results);
          let _peripherals = peripherals;
          for (var i = 0; i < results.length; i++) {
            let peripheral = results[i];
            peripheral.connected = true;
            _peripherals.set(peripheral.id, peripheral);
            //this.setState({ peripherals });
            setPeripherals(_peripherals)
          }
        });
    }
    
    const handleDiscoverPeripheral = (peripheral) => {
        let _peripherals = peripherals;
        console.warn("in handlediscoreperipheral = ")
        //console.warn(peripheral)
        if (!_peripherals.has(peripheral.id)){
            console.log('Got ble peripheral', peripheral);
            _peripherals.set(peripheral.id, peripheral);
            //this.setState({ peripherals })
            setPeripherals(_peripherals)
        }
    }
    
     
    
    const test = (peripheral) => {
        console.warn("touch test", peripheral.id)
        if (peripheral){
          if (peripheral.connected){
            console.warn("disconnecting , ", peripheral.id)
            BleManager.disconnect(peripheral.id);
          }else{
            console.warn("before connect", peripheral.id)
            BleManager.connect(peripheral.id).then(() => {
              console.warn("connected ,", peripheral.id)
              let _peripherals = peripherals;
              let p = _peripherals.get(peripheral.id);
              if (p) {
                p.connected = true;
                _peripherals.set(peripheral.id, p);
                //this.setState({peripherals});
                setPeripherals(peripherals)
              }
              console.log('Connected to ' + peripheral.id);

              Navigation.push('modoo', {
                component: {
                    name: 'ComuPanel',
                    passProps: {
                        text: 'ComuPanel',
                        connectedPeri: peripheral.id
                    },
                    options: {
                        topBar: {
                            title: {
                                text: 'ComuPanel'
                            }
                        }
                    }
                }

            })
              
    
              setTimeout(() => {
    
                //notification fail에 대한 에러처리
                //
    
                BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {

                  
                  console.warn("notification success")
                  let promise = Promise.resolve();
                  for(let i=0; i<peripheralInfo.characteristics.length; i++){
                 
                    
                    let char  = peripheralInfo.characteristics[i]
                    promise = promise.then(()=>{
                      console.warn('before notification =', char)
                      BleManager.startNotification(peripheral.id, char.service, char.characteristic).then(() => {
                        console.warn('after startnotification =', char)
                      })
                     
                    })
                   
                  }
                
    
                })
    
              }, 900);
            }).catch((error) => {
              console.warn("Connection error", error)
              console.log('Connection error', error);
            });
          }
        }
    }

    const onRead = () => {
    
        let peripherals = peripherals;
        //let p = peripherals.get(peripheral.id);
        let peripheral;
        peripherals.forEach((v)=>{
          if(v.connected){
            peripheral = v;
            return;
          }
        })
    
        BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
          // let service = peripheralInfo.characteristics[peripheralInfo.characteristics.length -2].service;
          // let characteristic = peripheralInfo.characteristics[peripheralInfo.characteristics.length -2].characteristic;
    
          // console.warn(service, characteristic)
    
    


          setTimeout(() => {
    
            let promise = Promise.resolve();
            for(let i=0; i<peripheralInfo.characteristics.length; i++){
           
              
              let char  = peripheralInfo.characteristics[i]
              promise = promise.then(()=>{
                console.warn('before read =', char)
                return BleManager.read(peripheral.id, char.service, char.characteristic).then((readData) => {
                  console.warn('after  read =', readData);
                  
                })
                .catch((err)=>{
      
                  console.warn("read err= ", err)
                })
              })
             
            }
            
          }, 1500);
    
    
        })
    
    }

    const onMsgSubmit = (msg) => {
        console.warn("on msg submit", msg)
        let byteArr = msg.split(".");
        console.warn(byteArr)
        sendMsg(byteArr.map(v=>v*1))

    
    }
    const sendMsg = (byteArr) => {
    
        let peripherals = peripherals;
        //let p = peripherals.get(peripheral.id);
        let peripheral;
        peripherals.forEach((v)=>{
        if(v.connected){
            peripheral = v;
            return;
        }
        })
      
      
    
        BleManager.connect(peripheral.id).then(() => {
            console.warn("connected,", peripheral.id)
            // let peripherals = this.state.peripherals;
            // let p = peripherals.get(peripheral.id);
            // if (p) {
            //   p.connected = true;
            //   peripherals.set(peripheral.id, p);
            //   this.setState({peripherals});
            // }
            console.log('Connectedto' + peripheral.id);


        setTimeout(() => {

        
            BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
            console.warn(peripheralInfo);
        
            console.warn(peripheralInfo.characteristics[peripheralInfo.characteristics.length -2])
            let service = peripheralInfo.characteristics[peripheralInfo.characteristics.length -2].service;
            let characteristic = peripheralInfo.characteristics[peripheralInfo.characteristics.length -2].characteristic;

            console.warn(service, characteristic)


            setTimeout(() => {
                
                BleManager.write(peripheral.id, service, characteristic, byteArr).then((res) => {
                    console.warn('after write =', res);
                
                })
                .catch((err)=>{
                    console.warn("write err= ", err)
                })
                ;

            }, 1500);

            });

        }, 900);
        }).catch((error) => {
            console.warn("Connection error", error)
            console.log('Connection error', error);
        });


    }



    return (
        <View style={styles.container}>
          <TouchableHighlight style={{marginTop: 40,margin: 20, padding:20, backgroundColor:'#ccc'}} onPress={() => startScan() }>
            <Text>Scan Bluetooth ({scanning ? 'on' : 'off'})</Text>
          </TouchableHighlight>
          <TouchableHighlight style={{marginTop: 0,margin: 20, padding:20, backgroundColor:'#ccc'}} onPress={() => retrieveConnected() }>
            <Text>Retrieve connected peripherals</Text>
          </TouchableHighlight>
         
          <TextInput
            onChangeText = {(textEntry) => setSearchText(textEntry)}
            style={{height:40, borderColor: 'black', borderWidth: 1, color:"black"}}
            onSubmitEditing = {()=>{onMsgSubmit(this.state.searchText)}}
            vlaue={"gdgdg"}
          />
          
         
          <Button
            title="전송" 
            onPress={()=>onMsgSubmit(searchText)}
          >
              
          </Button>
          
          <Button
            title="읽기" 
            onPress={()=>onRead()}
          >
              
          </Button>
         
          <ScrollView style={styles.scroll}>
            {(peripherals.length == 0) &&
              <View style={{flex:1, margin: 20}}>
                <Text style={{textAlign: 'center'}}>No peripherals</Text>
              </View>
            }
            <FlatList
              
              data={Array.from(peripherals.values())}
              renderItem={({item}) => {
                //console.warn("item=")
                //console.warn(item)
                const color = item.connected ? 'green' : '#fff';
                return (
                  <TouchableHighlight onPress={() => test(item) }>
                    <View style={[styles.row, {backgroundColor: color}]}>
                      <Text style={{fontSize: 12, textAlign: 'center', color: '#333333', padding: 10}}>{item.name}</Text>
                      <Text style={{fontSize: 8, textAlign: 'center', color: '#333333', padding: 10}}>{item.id}</Text>
                    </View>
                  </TouchableHighlight>
                );
              }}
              keyExtractor={item => item.id}
            />
          </ScrollView>
        </View>
      );




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
  

export default BTScreen;