// CustomActions.js
import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CustomActions = (props) => {
  const { showActionSheetWithOptions } = useActionSheet();
  const storage = getStorage();

  const showActionSheet = () => {
    showActionSheetWithOptions(
      {
        options: ['Select an image from library', 'Take a photo', 'Share location', 'Cancel'],
        cancelButtonIndex: 3,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            await pickImage();
            break;
          case 1:
            await takePhoto();
            break;
          case 2:
            await shareLocation();
            break;
          default:
            break;
        }
      }
    );
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `images/${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);
        props.onSend([{ _id: Date.now(), text: '', createdAt: new Date(), user: props.user, image: downloadURL }]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const takePhoto = async () => {
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `images/${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);
        props.onSend([{ _id: Date.now(), text: '', createdAt: new Date(), user: props.user, image: downloadURL }]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const shareLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      if (location) {
        const { latitude, longitude } = location.coords;
        const locationMessage = `https://www.google.com/maps?q=${latitude},${longitude}`;
        props.onSend([{ _id: Date.now(), text: locationMessage, createdAt: new Date(), user: props.user, location: { latitude, longitude } }]);
      }
    } catch (error) {
      console.error('Error sharing location:', error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={showActionSheet}
    >
      <Text style={styles.icon}>+</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
  },
  icon: {
    color: '3A3B3C',
    fontSize: 40,
  },
});

export default CustomActions;
