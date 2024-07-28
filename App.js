import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from 'firebase/app';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { LogBox } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActionSheetProvider } from '@expo/react-native-action-sheet'; // Import ActionSheetProvider

// Ignore specific logs
LogBox.ignoreLogs(["AsyncStorage has been extracted from"]);
LogBox.ignoreLogs(["Avatar: Support for defaultProps will be removed from"]);

// Components
import Start from './components/Start';
import Chat from './components/Chat';

// Navigator
const Stack = createNativeStackNavigator();

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgyd4B-Is9lnfly-2zlL5gW05umPxfOEc",
  authDomain: "chatemate-app.firebaseapp.com",
  projectId: "chatemate-app",
  storageBucket: "chatemate-app.appspot.com",
  messagingSenderId: "730864187616",
  appId: "1:730864187616:web:3576953aed3a7006cc3885"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const App = () => {
  const netInfo = useNetInfo();
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (netInfo.isConnected !== null) {
      setIsConnected(netInfo.isConnected);
      if (netInfo.isConnected) {
        enableNetwork(db).catch((error) => console.log("Error enabling network: ", error));
      } else {
        disableNetwork(db).catch((error) => console.log("Error disabling network: ", error));
      }
    }
  }, [netInfo.isConnected]);

  return (
    <ActionSheetProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Start"
          screenOptions={{
            headerStyle: { backgroundColor: '#242526' },
            headerTintColor: '#fff',
            headerTitleAlign: 'center'
          }}
        >
          <Stack.Screen 
            name="Start" 
            component={Start}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Chat"
          >
            {(props) => <Chat db={db} isConnected={isConnected} {...props} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </ActionSheetProvider>
  );
};

export default App;
