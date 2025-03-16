import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Share, 
  Alert, 
  ScrollView, 
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useGroupsStore } from '@/store/groups-store';
import { useBetsStore } from '@/store/bets-store';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { BetCard } from '@/components/BetCard';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '@/components/LanguageContext';
import { useTheme } from '@/components/ThemeContext';
import { 
  Users, 
  Share2, 
  Plus, 
  Info, 
  LogOut,
  Trophy,
  Calendar,
  Home,
  History,
  Target,
  MessageSquare,
  Image as ImageIcon,
  Send,
  ChevronLeft,
  ArrowLeft,
  ChevronRight,
  BarChart,
  Clock,
  Medal,
  CheckCircle,
  X,
  Award
} from 'lucide-react-native';

type StatItem = { name: string; home: number; away: number };
type BetHistoryItem = {
  id: string;
  title: string;
  participants: number;
  totalAmount: number;
  winner: string;
  teams: {
    home: { name: string; logo: string; score: number };
    away: { name: string; logo: string; score: number };
  };
  stats: StatItem[];
  bets: { user: string; amount: number; prediction: string; result: string; profit: number }[];
};

export default function GroupDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { 
    getGroupById, 
    leaveGroup, 
    addMessage, 
    getChatMessages, 
    getGroupMember,
    updateGroupCoins,
    getGroupMembersSorted
  } = useGroupsStore();
  
  const { getGroupBets } = useBetsStore();
  
  const [activeTab, setActiveTab] = useState<'bets' | 'members'>('bets');
  const [activeSection, setActiveSection] = useState<'home' | 'history' | 'challenges' | 'leaderboard' | 'chat'>('home');
  const [messageText, setMessageText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);
  const flatListRef = useRef<FlatList>(null);
  
  const group = getGroupById(id);

  // Rest of your component code...
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen 
        options={{
          title: group?.name || 'Group Details',
          headerBackTitle: 'Back'
        }}
      />
      
      {/* Your component JSX here */}
      <Text>Group Details Screen</Text>
    </SafeAreaView>
  );
} 