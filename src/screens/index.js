import {Navigation} from 'react-native-navigation';

import StartScreen from './StartScreen'
import BTScreen from './BTScreen'
import ComuPanel from './ComuPanel'
import WifiScreen from './WifiScreen'
import SocketScreen from './SocketScreen'
import SocketScreen2 from './SocketScreen2'

export function registerScreens(){
    Navigation.registerComponent('StartScreen', () => StartScreen);
    Navigation.registerComponent('BTScreen', () => BTScreen);
    Navigation.registerComponent('ComuPanel', () => ComuPanel);
    Navigation.registerComponent('WifiScreen', () => WifiScreen);
    Navigation.registerComponent('SocketScreen', () => SocketScreen)
    Navigation.registerComponent('SocketScreen2', () => SocketScreen2)
}