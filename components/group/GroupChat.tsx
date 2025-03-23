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
  Image
} from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Send, PlusCircle, Image as ImageIcon } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useGroupsStore } from '@/store/groups-store';
import { ChatMessage, Group } from '@/types';
import { supabase } from '@/services/supabaseClient';

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
            <Text style={{ color: colors.primary }}>
                (We Just save last 50 messages)
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
              <Image source={{ uri: item.image }} style={styles.messageImage} />
            )}
            <Text
              style={[
                styles.messageText,
                { color: isCurrentUser ? '#FFFFFF' : colors.text },
              ]}
            >
              {item.message}
            </Text>
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

  // Enviar mensaje
  const handleSendMessage = async () => {
    if (message.trim() === '') return;
  
    const newMessage = {
      sender: user.id,
      username: user.user_metadata?.username || 'Unknown',
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };
  
    try {
      // Insertamos el mensaje en la base de datos y obtenemos el mensaje insertado
      const insertedMessage = await useGroupsStore.getState().addMessage(group.id, newMessage);
  
      // Actualizamos el estado local inmediatamente (evitando duplicados)
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
  

  const handleAttachImage = () => {
    // Implementa la lógica para adjuntar imagen
    console.log('Attach image');
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
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
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
    marginVertical: 8,
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
    width: '100%',
    height: 150,
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
