import {StyleSheet, Text, View, Image, Button} from 'react-native';
import {Navigation} from 'react-native-navigation';
import React, {useEffect} from 'react';
import SplashScreen from 'react-native-splash-screen'

const StartScreen  = () => {

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide()
    }, 300)
  }, [])
    
    
    return (
        <View style={styles.container}>
          <View style={styles.header} />
          <View style={styles.title}>
            <Text style={{fontSize:35,color:'white'}}>모두텔,{'\n'}whichi-10</Text>
          </View>
          <View style={styles.content}>
            <Image
              style={{height:'100%',width:'100%',resizeMode:'contain'}}
           
              />
          </View>
          <View style={styles.footer}>
            <Button title="bt" onPress={()=>{
                Navigation.push('modoo', {
                    component: {
                        name: 'BTScreen',
                        passProps: {
                            text: 'BTScreen'
                        },
                        options: {
                            topBar: {
                                title: {
                                    text: 'SecondScreen'
                                }
                            }
                        }
                    }

                })
            }}/>
            <Button title="wifi" onPress={()=>{
                Navigation.push('modoo', {
                    component: {
                        name: 'WifiScreen',
                        passProps: {
                            text: 'WifiScreen'
                        },
                        options: {
                            topBar: {
                                title: {
                                    text: 'SecondScreen'
                                }
                            }
                        }
                    }

                })
            }}/>
            <Button title="socket" onPress={()=>{
                Navigation.push('modoo', {
                    component: {
                        name: 'SocketScreen',
                        passProps: {
                            text: 'SocketScreen'
                        },
                        options: {
                            topBar: {
                                title: {
                                    text: 'SecondScreen'
                                }
                            }
                        }
                    }

                })
            }}/>
             <Button title="socket2" onPress={()=>{
                Navigation.push('modoo', {
                    component: {
                        name: 'SocketScreen2',
                        passProps: {
                            text: 'SocketScreen2'
                        },
                        options: {
                            topBar: {
                                title: {
                                    text: 'SecondScreen2'
                                }
                            }
                        }
                    }

                })
              }}/>
          


          </View>
        </View>
  
      );
}

const styles = StyleSheet.create({

    container: {
  
      flex: 1,
  
      padding: 10,
  
      backgroundColor: 'black',
  
    },
  
    header: {
  
      width:'100%',
  
      height:'5%',
  
      //backgroundColor: '#ff9a9a',
  
    },
  
    title: {
  
      width:'100%',
  
      height:'18%',
  
      justifyContent: 'center',
  
      //backgroundColor: '#9aa9ff',
  
    },
  
    content: {
  
      flex: 1,
  
      justifyContent: 'center',
  
      alignItems: 'center',
  
      paddingBottom:15,
  
      //backgroundColor: '#d6ca1a',
  
    },
  
    footer: {
  
      width:'100%',
  
      height:'40%',
  
      //backgroundColor: '#1ad657',
  
    },
  
  });
  

  export default StartScreen;