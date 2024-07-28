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
    console.log("Action Sheet Triggered");  // Debugging line
    showActionSheetWithOptions(
      {
        options: ['Select an image from library', 'Take a photo', 'Share location', 'Cancel'],
        cancelButtonIndex: 3,
      },
      async (buttonIndex) => {
        console.log("Button Index Selected: ", buttonIndex);  // Debugging line
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

  const uploadAndSendImage = async (imageURI) => {
    const uniqueRefString = `images/${Date.now()}`;
    const newUploadRef = ref(storage, uniqueRefString);
    const response = await fetch(imageURI);
    const blob = await response.blob();

    uploadBytes(newUploadRef, blob).then(async (snapshot) => {
      const imageURL = await getDownloadURL(snapshot.ref);
      props.onSend([{ _id: Date.now(), text: '', createdAt: new Date(), user: props.user, image: imageURL }]);
    }).catch(error => {
      console.error("Error uploading image: ", error);
    });
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
        uploadAndSendImage(result.assets[0].uri);
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
        uploadAndSendImage(result.assets[0].uri);
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
        props.onSend([{ _id: Date.now(), text: '', createdAt: new Date(), user: props.user, location: { latitude, longitude } }]);
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
    color: '#3A3B3C',  // Ensure this is a valid color
    fontSize: 40,
  },
});

export default CustomActions;
