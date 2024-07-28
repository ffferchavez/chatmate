import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView from 'react-native-maps';
import CustomActions from './CustomActions';

const Chat = ({ db, route, isConnected }) => {
  const { userId, userName, bgColor } = route.params;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (isConnected) {
        const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedMessages = snapshot.docs.map(doc => ({
            _id: doc.id,
            createdAt: doc.data().createdAt.toDate(),
            text: doc.data().text,
            user: doc.data().user,
            system: doc.data().system || false,
            image: doc.data().image || null,
            location: doc.data().location || null,
          }));
          setMessages(fetchedMessages);
          AsyncStorage.setItem('messages', JSON.stringify(fetchedMessages));
        }, (error) => {
          console.error("Error fetching messages: ", error);
        });
        return () => unsubscribe();
      } else {
        const cachedMessages = await AsyncStorage.getItem('messages');
        if (cachedMessages) {
          setMessages(JSON.parse(cachedMessages));
        }
      }
    };

    fetchMessages();
  }, [db, isConnected]);

  const onSend = useCallback((newMessages = []) => {
    addDoc(collection(db, "messages"), {
      ...newMessages[0],
      createdAt: Timestamp.fromDate(new Date()),
    }).catch((error) => {
      console.error("Error sending message: ", error);
    });
  }, [db]);

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: '#007AFF' },
        left: { backgroundColor: '#E4E4E4' }
      }}
    />
  );

  const renderInputToolbar = (props) => {
    if (!isConnected) {
      return <Text style={styles.offlineText}>You are offline. Messages will be sent when you're back online.</Text>;
    }
    return <InputToolbar {...props} />;
  };

  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{
            width: 150,
            height: 150,
            borderRadius: 13,
            margin: 3
          }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  };

  const renderCustomActions = (props) => {
    return <CustomActions user={{ _id: userId, name: userName }} onSend={onSend} {...props} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{
          _id: userId,
          name: userName,
        }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderCustomView={renderCustomView}
        renderActions={renderCustomActions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  offlineText: {
    textAlign: 'center',
    padding: 10,
    fontSize: 14,
    color: 'red',
  },
});

export default Chat;
