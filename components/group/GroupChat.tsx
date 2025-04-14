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
  Alert,
  Dimensions,
  Modal,
  StatusBar
} from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Send, PlusCircle, XCircle } from 'lucide-react-native';
import { useAuth } from '@/store/auth-context';
import { useGroupsStore } from '@/store/groups-store';
import { ChatMessage, Group } from '@/types';
import { supabase } from '@/services/supabaseClient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export function GroupChat({ group }: { group: Group }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // URI local de la imagen (NO subimos a Supabase aún)
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  
  // Estados para el visor de imágenes a pantalla completa
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get('window').width;
  const desiredWidth = screenWidth * 0.7; // 70% del ancho del dispositivo

  // Función para abrir el visor de imágenes
  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageViewerVisible(true);
  };

  // Función para cerrar el visor de imágenes
  const closeImageViewer = () => {
    setImageViewerVisible(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    async function fetchMessages() {
      const fetched = await useGroupsStore.getState().getChatMessages(group.id);
      setMessages(fetched);
    }
    fetchMessages();
  }, [group.id]);

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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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

  const getBubbleColors = (isCurrentUser: boolean) => {
    // Modo claro se detecta verificando si el fondo es claro
    const isLightMode = colors.background === '#FFFFFF' || colors.background === '#F6F8FA';
    
    return isCurrentUser 
      ? {
          // Para mensajes propios
          background: isLightMode ? '#2388FC' : colors.chatBubbleSender, // Azul en claro, color normal en oscuro
          text: '#FFFFFF', // Siempre texto blanco para mensajes propios
          time: 'rgba(255,255,255,0.8)', // Hora semitransparente
        }
      : {
          // Para mensajes de otros
          background: isLightMode ? '#dbe1ff' : colors.chatBubbleReceiver, // Azul muy claro en modo claro
          text: isLightMode ? '#1A1F36' : colors.text, // Texto oscuro en modo claro
          time: isLightMode ? '#8C93A4' : colors.textSecondary, // Gris azulado para la hora
        };
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isCurrentUser = item.sender === user?.id;
    const showDateHeader =
      index === 0 ||
      formatDate(messages[index - 1].timestamp) !== formatDate(item.timestamp);
    
    const bubbleColors = getBubbleColors(isCurrentUser);
    const isLightMode = colors.background === '#FFFFFF' || colors.background === '#F6F8FA';

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
                backgroundColor: bubbleColors.background,
                alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                // Añadir sombra sutil para el modo claro
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isLightMode ? 0.1 : 0,
                shadowRadius: 2,
                elevation: isLightMode ? 1 : 0
              },
            ]}
          >
            {item.image && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleImagePress(item.image!)}
              >
                <Image
                  source={{ uri: item.image }}
                  style={{
                    width: desiredWidth,
                    height: 300,
                    borderRadius: 8,
                    marginBottom: 8,
                    resizeMode: 'contain'
                  }}
                />
                <View style={[styles.imageOverlay, { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
                  <Text style={styles.imageHint}>
                    {t('tapToEnlarge') || 'Tap to enlarge'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            {item.message ? (
              <Text
                style={[
                  styles.messageText,
                  { color: bubbleColors.text },
                ]}
              >
                {item.message}
              </Text>
            ) : null}
            <Text
              style={[
                styles.messageTime,
                { color: bubbleColors.time },
              ]}
            >
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>
      </>
    );
  };

  const handleSendMessage = async () => {
    // si no hay texto ni imagen, no hacemos nada
    if (!message.trim() && !localImageUri) return;

    // Subimos la imagen a Supabase SOLO si hay localImageUri
    let finalImageUrl: string | null = null;
    if (localImageUri) {
      try {
        // Convertir la imagen a base64 -> ArrayBuffer
        const base64File = await FileSystem.readAsStringAsync(localImageUri, {
          encoding: 'base64',
        });
        const arrayBuffer = decode(base64File);

        // Definir nombre y MIME
        const fileExt = localImageUri.split('.').pop() || 'jpg';
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

        finalImageUrl = urlData.publicUrl;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        Alert.alert('Error', 'Failed to upload image.');
        return; // Podemos retornar para que no se envíe el mensaje sin imagen
      }
    }

    // Ahora construimos el objeto del mensaje
    const newMessage = {
      sender: user.id,
      username: user.user_metadata?.username || 'Unknown',
      message: message.trim() || '',
      image: finalImageUrl, // <-- si localImageUri era nulo, esto será null
      timestamp: new Date().toISOString(),
    };

    try {
      const insertedMessage = await useGroupsStore
        .getState()
        .addMessage(group.id, newMessage);


      // Limpiamos el input y la imagen local
      setMessage('');
      setLocalImageUri(null);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleAttachImage = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert('Permissions required', 'Permission to access gallery is needed to send images.');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
      if (pickerResult.cancelled) {
        return;
      }

      // Obtenemos la URI local (file://...)
      const uri = pickerResult.uri || (pickerResult.assets && pickerResult.assets[0].uri);
      if (!uri) throw new Error('No image URI found');

      // Simplemente guardamos la URI local sin subir aún
      setLocalImageUri(uri);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to pick image.');
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

      {/* Si tenemos una imagen local, la previsualizamos */}
      {localImageUri && (
        <View style={styles.previewContainer}>
          <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
            {t('selectedImage') || 'Selected Image:'}
          </Text>
          <View style={styles.previewImageWrapper}>
            <Image
              source={{ uri: localImageUri }}  // <-- Vista previa local
              style={styles.previewImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setLocalImageUri(null)}
            >
              <XCircle size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      )}

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
          disabled={!message.trim() && !localImageUri}
        >
          <Send size={20} color="#000000" />
        </TouchableOpacity>
      </View>
      
      {/* Modal del visor de imágenes a pantalla completa */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageViewer}
      >
        <StatusBar backgroundColor="#000" barStyle="light-content" />
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={closeImageViewer}
            activeOpacity={0.7}
          >
            <XCircle size={28} color="#fff" />
          </TouchableOpacity>
          
          {selectedImage && (
            <TouchableOpacity 
              style={styles.imageContainer}
              activeOpacity={1}
              onPress={closeImageViewer}
            >
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>
      </Modal>
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
  messageText: {
    fontSize: 14,
  },
  messageTime: {
    fontSize: 9,
    position: 'absolute',
    right: 12,
    bottom: 8,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 8, 
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  imageHint: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },

  // Preview
  previewContainer: {
    alignItems: 'center',
    paddingBottom: 8,
    paddingHorizontal: 10,
  },
  previewImageWrapper: {
    position: 'relative',
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 2,
    backgroundColor: '#fff',
    borderRadius: 16,
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
  
  // Estilos para el visor de imágenes a pantalla completa
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});
