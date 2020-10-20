package com.modoo_app;

import android.app.Application;
import android.content.Context;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;

import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.reactnativenavigation.react.ReactGateway;

import java.util.Arrays;
import java.lang.reflect.InvocationTargetException;
import java.util.List;

import it.innove.BleManagerPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import io.realm.react.RealmReactPackage; // add this import
import io.wifi.p2p.WiFiP2PManagerPackage;
import com.stonem.sockets.SocketsPackage;
import com.peel.react.TcpSocketsModule;  


public class MainApplication extends NavigationApplication {
  
      @Override
      protected ReactGateway createReactGateway() {
          ReactNativeHost host = new NavigationReactNativeHost(this, isDebug(), createAdditionalReactPackages()) {
              @Override
              protected String getJSMainModuleName() {
                  return "index";
              }
          };
          return new ReactGateway(this, isDebug(), host);
      }
  
      @Override
      public boolean isDebug() {
          return BuildConfig.DEBUG;
      }
  
      protected List<ReactPackage> getPackages() {
          // Add additional packages you require here
          // No need to add RnnPackage and MainReactPackage
          return Arrays.<ReactPackage>asList(
              // eg. new VectorIconsPackage()
              new BleManagerPackage(),
              new RealmReactPackage(),
              new SplashScreenReactPackage() ,
              new WiFiP2PManagerPackage(),
              new SocketsPackage(),
              new TcpSocketsModule()
            
          );
      }
  
      @Override
      public List<ReactPackage> createAdditionalReactPackages() {
          return getPackages();
      }

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
             //       new MainReactPackage(),
            new SplashScreenReactPackage()  //here
            );
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

  }