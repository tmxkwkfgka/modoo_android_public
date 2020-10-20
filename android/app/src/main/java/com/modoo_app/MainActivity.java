package com.modoo_app;

import com.reactnativenavigation.NavigationActivity;
import android.os.Bundle; // here
import com.facebook.react.ReactActivity;

import org.devio.rn.splashscreen.SplashScreen; // here



  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  public class MainActivity extends NavigationActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this);  // here
        super.onCreate(savedInstanceState);
    }

  }

