/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Button,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import {
  initialize,
  isSuccessfulInitialize,
  startDiscoveringPeers,
  stopDiscoveringPeers,
  unsubscribeFromPeersUpdates,
  unsubscribeFromConnectionInfoUpdates,
  subscribeOnConnectionInfoUpdates,
  subscribeOnPeersUpdates,
  connect,
  disconnect,
  createGroup,
  removeGroup,
  getAvailablePeers,

  sendFile,
  receiveFile,
  getConnectionInfo,
  receiveMessage,
  sendMessage
} from 'react-native-wifi-p2p';
import { PermissionsAndroid } from 'react-native';



export default class App extends Component {
  state = {
    devices: []
  };

  componentDidMount() {
    initialize();
    isSuccessfulInitialize()
        .then(status => console.warn(status));
    startDiscoveringPeers()
        .then(() => console.warn('Sucessfull'))
        .catch(err => console.log(err));

    subscribeOnPeersUpdates(({ devices }) => this.handleNewPeers(devices));
    subscribeOnConnectionInfoUpdates(this.handleNewInfo);
  }

  componentWillUnmount() {
    unsubscribeFromConnectionInfoUpdates((event) => console.warn('unsubscribeFromConnectionInfoUpdates', event));
    unsubscribeFromPeersUpdates((event) => console.warn('unsubscribeFromPeersUpdates', event));
  }

  handleNewInfo = (info, sceondParam) => {
    console.warn(64646776467, info);
  };

  handleNewPeers = (peers) => {
    console.warn(754862162442324, peers);
    console.log(`handle new  peer ${peers.length}` )
    this.setState({ devices: peers });
  };

  connectToFirstDevice = () => {
      console.log(this.state.devices[0]);
      connect(this.state.devices[0].deviceAddress)
          .then(() => console.warn('Successfully  connected'))
          .catch(err => console.error('Something  gone wrong. Details: ', err));
  };

  disconnectFromDevice = () => {
      disconnect()
          .then(() => console.warn(2423435423, 'Successfully disconnected'))
          .catch(err => console.error(2423435423, 'Something gone wrong. Details: ', err));
  };

  onCreateGroup = () => {
      createGroup()
          .then(() => console.warn('Group created successfully!'))
          .catch(err => console.error('Something gone wrong. Details: ', err));
  };

  onRemoveGroup = () => {
      removeGroup()
          .then(() => console.warn('Currently  you don\'t belong to group!'))
          .catch(err => console.error('Something gone wrong. Details: ', err));
  };

  onStopInvestigation = () => {
      stopDiscoveringPeers()
          .then(() => console.warn('Stopping of discovering was successful'))
          .catch(err => console.error(`Something is gone wrong. Maybe your WiFi is disabled? Error details`, err));
  };

  onStartInvestigate = () => {
      startDiscoveringPeers()
          .then(status => console.warn(33333333, `Status of discovering peers: ${status}`))
          .catch(err => console.error(`Something is gone wrong. Maybe your WiFi is disabled? Error details: ${err}`));
  };

  onGetAvailableDevices = () => {
    getAvailablePeers()
        .then((peers) => {
          console.warn("peers=")
          console.warn(peers)
          this.setState({
            devices: peers.devices
          });

          console.warn("this state = " )
          console.warn(this.state)
        });
  };
 

  onSendFile = () => {
      //const url = '/storage/sdcard0/Music/Rammstein:Amerika.mp3';
      const url = '/storage/emulated/0/Music/Bullet For My Valentine:Letting You Go.mp3';
      PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                  {
                      'title': 'Access to read',
                      'message': 'READ_EXTERNAL_STORAGE'
                  }
              )
          .then(granted => {
              if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                  console.log("You can use the camera")
              } else {
                  console.log("Camera permission denied")
              }
          })
          .then(() => {
              return PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                  {
                      'title': 'Access to write',
                      'message': 'WRITE_EXTERNAL_STORAGE'
                  }
              )
          })
          .then(() => {
              return sendFile(url)
                  .then(() => console.log('File sent successfully'))
                  .catch(err => console.log('Error  while file sending', err));
          })
          .catch(err => console.log(err));
  };

  onReceiveFile = () => {
    receiveFile()
        .then(() => console.log('File received successfully'))
        .catch(err => console.log('Error while file receiving', err))
  };

  onSendMessage = () => {
      sendMessage("Hello world!")
        .then(() => console.log('Message sent successfully'))
        .catch(err => console.log('Error while message sending', err));
  };

  onReceiveMessage = () => {
      receiveMessage()
          .then((msg) => console.log('Message received successfully', msg))
          .catch(err => console.log('Error while message receiving', err))
  };

  onGetConnectionInfo = () => {
    getConnectionInfo()
        .then(info => console.log(info));
  };

  onDiscover = () => {
    startDiscoveringPeers()
        .then(() => console.warn('Sucessfull'))
        .catch(err => console.log(err));

  }

  onSelect = (deviceAddress)=>{
    connect(deviceAddress)
    .then(() => console.warn('Successfully  connected'))
    .catch(err => console.error('Something  gone wrong. Details: ', err));
   
  }
   

  render() {

    let availableDevices = this.state.devices;
   
    
    return (


      <View style={styles.container}>
          <SafeAreaView >
          <FlatList
          
          data={availableDevices}
          renderItem={({item}) =>{
            return (
              <TouchableOpacity 
                onPress={() => this.onSelect(item.deviceAddress)}
                style={[
                  styles.item,
                
                ]}
              >
                <Text style={styles.title}>{item.deviceName}</Text>
                <Text style={styles.title}>{item.deviceAddress}</Text>
              </TouchableOpacity>
            );
          }}
          keyExtractor={item => item.deviceAddress}
        />


        </SafeAreaView>
        <Button
          title="Connect"
          onPress={this.connectToFirstDevice}
        />
        <Button
          title="Disconnect"
          onPress={this.disconnectFromDevice}
        />
        <Button
          title="Create group"
          onPress={this.onCreateGroup}
        />
        <Button
          title="Remove group"
          onPress={this.onRemoveGroup}
        />
        <Button
          title="Investigate"
          onPress={this.onStartInvestigate}
        />
        <Button
          title="Prevent Investigation"
          onPress={this.onStopInvestigation}
        />
        <Button
          title="Get Available Devices"
          onPress={this.onGetAvailableDevices}
        />
        <Button
          title="Get connection Info"
          onPress={this.onGetConnectionInfo}
        />
        <Button
          title="Send file"
          onPress={this.onSendFile}
        />
        <Button
          title="Receive file"
          onPress={this.onReceiveFile}
        />
        <Button
          title="Send message"
          onPress={this.onSendMessage}
        />
        <Button
          title="Receive message"
          onPress={this.onReceiveMessage}
        />
        <Button
          title="discover peers"
          onPress={this.onDiscover}
        />
    

    
      </View>


    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
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
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 12,
  }
});
