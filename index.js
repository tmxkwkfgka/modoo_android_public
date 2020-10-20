/**
 * @format
 */


import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { Navigation } from "react-native-navigation";
import {registerScreens} from './src/screens';
import {registerComponent} from './src/components';

Navigation.registerComponent(`navigation.playground.WelcomeScreen`, () => App);

 registerScreens()
  registerComponent()

Navigation.events().registerAppLaunchedListener(() => {
    Navigation.setRoot({

        root:{
            stack:{
                id: "modoo",
                children: [{
                    component:{
                        name: 'StartScreen',
                        passProps: {
                            text: 'stack with one child'
                        }
  
                    }
                    
                },
                
                
            ],
                options: {
                    topBar: {
                        title: {
                        text: 'Welcome screen'
                        }
                    }
                }
            }
        },
      
      
      
    });
});


