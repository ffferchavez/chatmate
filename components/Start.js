import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ImageBackground, Alert } from 'react-native';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Static color data
const colors = ['#090C08', '#F3F5F2', '#bfbfbf', '#bf9b63'];

const Start = ({ navigation }) => {
  const [name, setName] = useState('');
  const [bgColor, setBgColor] = useState(colors[0]);

  const auth = getAuth();

  const signInUser = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter your name to continue.');
      return;
    }

    signInAnonymously(auth)
      .then(result => {
        navigation.navigate('Chat', { 
          userId: result.user.uid,
          userName: name, 
          bgColor: bgColor 
        });
      })
      .catch((error) => {
        console.log('Error signing in: ', error);
      });
  };

  return (
    <ImageBackground
      source={require('../assets/background1.jpg')}
      resizeMode="cover"
      style={styles.backgroundImage}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>ChatMate</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              onChangeText={setName}
              value={name}
              placeholder="Your Name"
              placeholderTextColor="#757083"
            />
          </View>
          <Text style={styles.colorText}>Choose Background Color:</Text>
          <View style={styles.colorContainer}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.colorOption, { backgroundColor: color }, bgColor === color && styles.selectedColor]}
                onPress={() => setBgColor(color)}
              />
            ))}
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={signInUser}
          >
            <Text style={styles.buttonText}>Start Chatting</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: '88%',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 45,
    fontWeight: '600',
    color: '#696969',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#757083',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    fontWeight: '300',
    color: '#090C08',
  },
  colorText: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    marginBottom: 10,
  },
  colorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 30,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#5f5f5f',
  },
  button: {
    backgroundColor: '#272a3b',
    width: '100%',
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Start;