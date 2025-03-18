import React, { useState, useRef } from 'react';
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
import { Group } from '@/types';

interface GroupChatProps {
  group: Group;
}

interface Message {
  id: string;
  text: string;
  userId: string;
  username: string;
  timestamp: Date;
  image?: string;
}

export function GroupChat({ group }: GroupChatProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Datos de mensajes ficticios para la UI
  const mockMessages: Message[] = [
    {
      id: '1',
      text: 'Hey everyone! Welcome to the group chat!',
      userId: 'admin',
      username: 'Admin',
      timestamp: new Date(Date.now() - 3600000 * 24)
    },
    {
      id: '2',
      text: 'Thanks for creating this group!',
      userId: group.members[0]?.userId,
      username: group.members[0]?.username || 'User 1',
      timestamp: new Date(Date.now() - 3600000 * 12)
    },
    {
      id: '3',
      text: 'I just created a new bet, check it out!',
      userId: group.members[1]?.userId,
      username: group.members[1]?.username || 'User 2',
      timestamp: new Date(Date.now() - 3600000 * 6)
    },
    {
      id: '4',
      text: 'Who wants to participate in my challenge?',
      userId: group.createdBy,
      username: group.members.find(m => m.userId === group.createdBy)?.username || 'Creator',
      timestamp: new Date(Date.now() - 3600000)
    }
  ];

  const handleSendMessage = () => {
    if (message.trim() === '') return;
    
    // Aquí iría la lógica para enviar el mensaje a Supabase
    console.log('Sending message:', message);
    
    // Limpiamos el input
    setMessage('');
    
    // Hacemos scroll al final de los mensajes
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  const handleAttachImage = () => {
    // Implementar lógica para adjuntar imagen
    console.log('Attach image');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
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

  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isCurrentUser = item.userId === user?.id;
    const showDateHeader = index === 0 || 
      formatDate(mockMessages[index - 1].timestamp) !== formatDate(item.timestamp);
    
    return (
      <>
        {showDateHeader && (
          <View style={styles.dateHeaderContainer}>
            <Text style={[styles.dateHeader, { color: colors.textSecondary }]}>
              {formatDate(item.timestamp)}
            </Text>
          </View>
        )}
        <View style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
        ]}>
          {!isCurrentUser && (
            <View style={styles.messageBubbleHeader}>
              <Text style={[styles.messageUsername, { color: colors.primary }]}>
                {item.username}
              </Text>
            </View>
          )}
          
          <View style={[
            styles.messageBubble,
            { 
              backgroundColor: isCurrentUser ? colors.primary : colors.card,
              alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
            }
          ]}>
            {item.image && (
              <Image source={{ uri: item.image }} style={styles.messageImage} />
            )}
            <Text style={[
              styles.messageText,
              { color: isCurrentUser ? '#FFFFFF' : colors.text }
            ]}>
              {item.text}
            </Text>
            <Text style={[
              styles.messageTime,
              { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary }
            ]}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={mockMessages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
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
          <Send size={20} color="#FFFFFF" />
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
    fontSize: 12,
    padding: 4,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  messageContainer: {
    marginBottom: 12,
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
    fontSize: 12,
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
    fontSize: 10,
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