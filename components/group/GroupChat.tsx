// components/group/GroupChat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert
} from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Send, PlusCircle } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useGroupsStore } from '@/store/groups-store';
import { ChatMessage, Group } from '@/types';
import { supabase } from '@/services/supabaseClient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode, encode } from 'base64-arraybuffer';
import { Dimensions } from 'react-native';


interface GroupChatProps {
  group: Group;
}

export function GroupChat({ group }: GroupChatProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get('window').width;
  const desiredWidth = screenWidth * 0.7; // 70% del ancho del dispositivo

  // Cargar mensajes reales desde Supabase al montar el componente
  useEffect(() => {
    async function fetchMessages() {
      const fetched = await useGroupsStore.getState().getChatMessages(group.id);
      setMessages(fetched);
    }
    fetchMessages();
  }, [group.id]);

  // Suscripción en tiempo real: solo para el grupo actual
  useEffect(() => {
    const channel = supabase
      .channel(`groups:${group.id}:chat`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `group_id=eq.${group.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [group.id]);

  // Función para formatear la hora
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Función para formatear la fecha
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffTime = Math.abs(today.getTime() - messageDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return t('today') || 'Today';
    } else if (diffDays === 1) {
      return t('yesterday') || 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Renderiza cada mensaje
  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isCurrentUser = item.sender === user?.id;
    const showDateHeader = index === 0 || 
      formatDate(messages[index - 1].timestamp) !== formatDate(item.timestamp);

    return (
      <>
        {showDateHeader && (
          <View style={styles.dateHeaderContainer}>
            <Text style={[styles.dateHeader, { color: colors.textSecondary }]}>
              {formatDate(item.timestamp)}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.messageContainer,
            isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
          ]}
        >
          {!isCurrentUser && (
            <View style={styles.messageBubbleHeader}>
              <Text style={[styles.messageUsername, { color: colors.primary }]}>
                {item.username}
              </Text>
            </View>
          )}
          <View
            style={[
              styles.messageBubble,
              {
                backgroundColor: isCurrentUser ? colors.chatBubbleSender : colors.card,
                alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
              },
            ]}
          >
          {item.image && (
            <>
              {console.log('DEBUG - IMAGE URL =>', item.image)}
              <Image
                source={{ uri: item.image }}
                style={{
                  width: desiredWidth,
                  height: 300, // o la altura que quieras
                  borderRadius: 8,
                  marginBottom: 8,
                  resizeMode: 'contain',
                }}
              />
            </>
          )}
            {item.message ? (
              <Text
                style={[
                  styles.messageText,
                  { color: isCurrentUser ? '#FFFFFF' : colors.text },
                ]}
              >
                {item.message}
              </Text>
            ) : null}
            <Text
              style={[
                styles.messageTime,
                { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary },
              ]}
            >
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>
      </>
    );
  };

  // Enviar mensaje de texto
  const handleSendMessage = async () => {
    if (message.trim() === '') return;

    const newMessage = {
      sender: user.id,
      username: user.user_metadata?.username || 'Unknown',
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      const insertedMessage = await useGroupsStore.getState().addMessage(group.id, newMessage);
      setMessages((prev) => {
        if (prev.some((m) => m.id === insertedMessage.id)) return prev;
        return [...prev, insertedMessage];
      });
      setMessage('');
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleAttachImage = async () => {
    try {
      // Pedir permiso
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert('Permissions required', 'Permission to access gallery is needed to send images.');
        return;
      }
  
      // Abrir la galería
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Versión 16
        allowsEditing: true,
        quality: 0.7,
      });
      if (pickerResult.cancelled) {
        return;
      }
  
      // Obtener la URI
      const uri = pickerResult.uri || (pickerResult.assets && pickerResult.assets[0].uri);
      if (!uri) throw new Error('No image URI found');
  
      // Convertir a base64 -> ArrayBuffer
      const base64File = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const arrayBuffer = decode(base64File);
  
      // Definir nombre y MIME
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const mimeType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
  
      // Subir a Supabase
      const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, arrayBuffer, {
          contentType: mimeType,
          upsert: false,
        });
      if (error) throw error;
  
      // Obtener URL pública
      const { data: urlData, error: urlError } = supabase
      .storage
      .from('chat-images')
      .getPublicUrl(fileName);
    
    if (urlError) throw urlError;
    if (!urlData?.publicUrl) throw new Error('Error obtaining public URL');
    
    const publicUrl = urlData.publicUrl;  // esta es la URL real
  
      // Insertar el mensaje en tu chat
      const newMessage = {
        sender: user.id,
        username: user.user_metadata?.username || 'Unknown',
        message: '',
        image: publicUrl,   // <-- Asegúrate de meter aquí `publicUrl`
        timestamp: new Date().toISOString(),
      };
      const insertedMessage = await useGroupsStore
        .getState()
        .addMessage(group.id, newMessage);
  
      setMessages((prev) => {
        if (prev.some((m) => m.id === insertedMessage.id)) return prev;
        return [...prev, insertedMessage];
      });
  
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
  
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.attachButton} onPress={handleAttachImage}>
          <PlusCircle size={24} color={colors.primary} />
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={t('typeAMessage') || 'Type a message...'}
          placeholderTextColor={colors.textSecondary}
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={handleSendMessage}
          disabled={message.trim() === ''}
        >
          <Send size={20} color="#000000" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    flexGrow: 1,
  },
  dateHeaderContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 25,
  },
  dateHeader: {
    fontSize: 14,
    padding: 4,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  messageBubbleHeader: {
    marginBottom: 2,
    paddingHorizontal: 12,
  },
  messageUsername: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    paddingBottom: 24,
  },
  messageImage: {
    width: 300, 
    height: 300,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
  },
  messageTime: {
    fontSize: 9,
    position: 'absolute',
    right: 12,
    bottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    padding: 10,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
