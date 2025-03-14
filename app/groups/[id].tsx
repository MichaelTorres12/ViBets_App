//app/groups/[id].tsx
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
  date: string;
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
    getChallenges,
    getChallengeById,
    completeChallenge,
    completeTask,
    getGroupMembersSorted
  } = useGroupsStore();
  const { getGroupBets, getBetParticipations, getUserParticipationInBet } = useBetsStore();
  
  const [activeTab, setActiveTab] = useState<'bets' | 'members'>('bets');
  const [activeSection, setActiveSection] = useState<'home' | 'history' | 'challenges' | 'leaderboard' | 'chat'>('home');
  const [messageText, setMessageText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);
  const flatListRef = useRef<FlatList>(null);
  
  const group = getGroupById(id);
  
  if (!group || !user) {
    return (
      <SafeAreaView style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>{t('groupNotFound')}</Text>
        <Button title={t('back')} onPress={() => router.back()} />
      </SafeAreaView>
    );
  }
  
  // Get current user's group-specific coins
  const groupMember = getGroupMember(id, user.id);
  const userGroupCoins = groupMember?.groupCoins || 0;
  
  const groupBets = getGroupBets(id);
  const chatMessages = getChatMessages(id);
  const challenges = getChallenges(id);
  
  // Get sorted members for leaderboard
  const sortedMembers = getGroupMembersSorted(id);
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${t('joinMyBettingGroup')} "${group.name}" ${t('onFriendsBet')}! ${t('useInviteCode')}: ${group.inviteCode}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  const handleLeaveGroup = () => {
    Alert.alert(
      t('leaveGroup'),
      t('leaveGroupConfirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('leave'),
          onPress: async () => {
            try {
              await leaveGroup(id);
              router.replace('/groups');
            } catch (error) {
              Alert.alert(t('error'), t('failedToLeaveGroup'));
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  // Mock data for history
  const betHistory: BetHistoryItem[] = [
    {
      id: 'h1',
      title: 'Champions League Final',
      date: '15 May 2023',
      participants: 8,
      totalAmount: 1200,
      winner: 'John Doe',
      teams: {
        home: {
          name: 'Manchester City',
          logo: 'https://images.unsplash.com/photo-1589279715734-6631a314dfa2?q=80&w=100&auto=format&fit=crop',
          score: 3
        },
        away: {
          name: 'Inter Milan',
          logo: 'https://images.unsplash.com/photo-1589279715734-6631a314dfa2?q=80&w=100&auto=format&fit=crop',
          score: 1
        }
      },
      stats: [
        { name: 'Possession', home: 65, away: 35 },
        { name: 'Shots', home: 12, away: 8 },
        { name: 'Shots on Target', home: 7, away: 3 },
        { name: 'Corners', home: 9, away: 4 },
        { name: 'Fouls', home: 6, away: 11 }
      ],
      bets: [
        { user: 'John Doe', amount: 200, prediction: 'Manchester City Win', result: 'Won', profit: 350 },
        { user: 'Jane Smith', amount: 150, prediction: 'Draw', result: 'Lost', profit: -150 },
        { user: 'Mike Johnson', amount: 100, prediction: 'Inter Milan Win', result: 'Lost', profit: -100 }
      ]
    },
    {
      id: 'h2',
      title: 'NBA Finals Game 7',
      date: '2 Apr 2023',
      participants: 6,
      totalAmount: 900,
      winner: 'Jane Smith',
      teams: {
        home: {
          name: 'Boston Celtics',
          logo: 'https://images.unsplash.com/photo-1589279715734-6631a314dfa2?q=80&w=100&auto=format&fit=crop',
          score: 103
        },
        away: {
          name: 'Golden State Warriors',
          logo: 'https://images.unsplash.com/photo-1589279715734-6631a314dfa2?q=80&w=100&auto=format&fit=crop',
          score: 90
        }
      },
      stats: [
        { name: 'Field Goal %', home: 48, away: 42 },
        { name: '3-Point %', home: 38, away: 33 },
        { name: 'Rebounds', home: 45, away: 38 },
        { name: 'Assists', home: 25, away: 22 },
        { name: 'Turnovers', home: 12, away: 15 }
      ],
      bets: [
        { user: 'Jane Smith', amount: 200, prediction: 'Boston Celtics Win', result: 'Won', profit: 380 },
        { user: 'John Doe', amount: 150, prediction: 'Golden State Warriors Win', result: 'Lost', profit: -150 },
        { user: 'Sarah Williams', amount: 100, prediction: 'Over 200 Points', result: 'Lost', profit: -100 }
      ]
    },
    {
      id: 'h3',
      title: 'Super Bowl LVII',
      date: '12 Feb 2023',
      participants: 12,
      totalAmount: 2400,
      winner: 'Mike Johnson',
      teams: {
        home: {
          name: 'Kansas City Chiefs',
          logo: 'https://images.unsplash.com/photo-1589279715734-6631a314dfa2?q=80&w=100&auto=format&fit=crop',
          score: 38
        },
        away: {
          name: 'Philadelphia Eagles',
          logo: 'https://images.unsplash.com/photo-1589279715734-6631a314dfa2?q=80&w=100&auto=format&fit=crop',
          score: 35
        }
      },
      stats: [
        { name: 'Total Yards', home: 340, away: 417 },
        { name: 'Passing Yards', home: 182, away: 304 },
        { name: 'Rushing Yards', home: 158, away: 113 },
        { name: 'Turnovers', home: 0, away: 1 },
        { name: 'Possession', home: 28, away: 32 }
      ],
      bets: [
        { user: 'Mike Johnson', amount: 300, prediction: 'Kansas City Chiefs Win', result: 'Won', profit: 570 },
        { user: 'John Doe', amount: 250, prediction: 'Philadelphia Eagles Win', result: 'Lost', profit: -250 },
        { user: 'Jane Smith', amount: 200, prediction: 'Over 50 Points', result: 'Won', profit: 380 }
      ]
    },
  ];
  
  const pickImage = async () => {
    try {
      setIsUploading(true);
      
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(t('permissionNeeded'), t('pleaseGrantPhotoPermission'));
        setIsUploading(false);
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('error'), t('failedToPickImage'));
    } finally {
      setIsUploading(false);
    }
  };
  
  const sendMessage = () => {
    if ((!messageText || messageText.trim() === '') && !selectedImage) return;
    
    addMessage(id, {
      id: `m${Date.now()}`,
      sender: user.username,
      avatar: user.avatar,
      message: messageText.trim(),
      image: selectedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    
    setMessageText('');
    setSelectedImage(null);
    
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };
  
  const handleCompleteTask = (challengeId: string, taskId: string) => {
    completeTask(id, challengeId, taskId);
    
    const challenge = getChallengeById(id, challengeId);
    if (challenge) {
      const allTasksCompleted = challenge.tasks.every((task: any) => task.completed);
      if (allTasksCompleted) {
        completeChallenge(id, challengeId, user.id);
        Alert.alert(
          t('challengeCompleted'),
          t('challengeCompletedMessage'),
          [{ text: t('ok') }]
        );
      }
    }
  };
  
  const renderHomeContent = () => (
    <>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab, 
            activeTab === 'bets' && [styles.activeTab, { borderBottomColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('bets')}
        >
          <Text
            style={[
              styles.tabText, 
              { color: colors.textSecondary },
              activeTab === 'bets' && [styles.activeTabText, { color: colors.primary }]
            ]}
          >
            {t('bets')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab, 
            activeTab === 'members' && [styles.activeTab, { borderBottomColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('members')}
        >
          <Text
            style={[
              styles.tabText, 
              { color: colors.textSecondary },
              activeTab === 'members' && [styles.activeTabText, { color: colors.primary }]
            ]}
          >
            {t('members')}
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'bets' ? (
        groupBets.length > 0 ? (
          <FlatList
            data={groupBets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const participations = getBetParticipations(item.id);
              const userParticipation = getUserParticipationInBet(item.id, user.id);
              
              return (
                <BetCard
                  bet={item}
                  participations={participations}
                  userParticipation={userParticipation}
                  onPress={(bet) => router.push(`/bets/${bet.id}`)}
                />
              );
            }}
            contentContainerStyle={[styles.listContent, { paddingBottom: 80 }]}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Card style={styles.emptyCard}>
              <Calendar size={48} color={colors.primaryLight} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('noBetsYet')}</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('createFirstBetMessage')}
              </Text>
              <Button
                title={t('createBet')}
                onPress={() => router.push(`/groups/${id}/create-bet`)}
                style={styles.emptyButton}
              />
            </Card>
          </View>
        )
      ) : (
        <View style={styles.membersContainer}>
          <Text style={[styles.membersTitle, { color: colors.text }]}>
            {t('members')} ({group.members.length})
          </Text>
          
          <View style={styles.membersList}>
            <View style={[styles.memberItem, { borderBottomColor: colors.border }]}>
              <Avatar name="John Doe" size={40} />
              <Text style={[styles.memberName, { color: colors.text }]}>John Doe</Text>
              <View style={[styles.memberBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.memberBadgeText}>{t('admin')}</Text>
              </View>
            </View>
            
            <View style={[styles.memberItem, { borderBottomColor: colors.border }]}>
              <Avatar name="Jane Smith" size={40} />
              <Text style={[styles.memberName, { color: colors.text }]}>Jane Smith</Text>
            </View>
            
            {group.members.length > 2 && (
              <View style={[styles.memberItem, { borderBottomColor: colors.border }]}>
                <Avatar name="Mike Johnson" size={40} />
                <Text style={[styles.memberName, { color: colors.text }]}>Mike Johnson</Text>
              </View>
            )}
          </View>
          
          <Button
            title={t('inviteFriends')}
            variant="outline"
            onPress={handleShare}
            style={styles.inviteButton}
          />
          
          <Button
            title={t('leaveGroup')}
            variant="ghost"
            leftIcon={<LogOut size={18} color={colors.error} />}
            textStyle={{ color: colors.error }}
            onPress={handleLeaveGroup}
            style={styles.leaveButton}
          />
        </View>
      )}
    </>
  );
  
  const renderHistoryContent = () => {
    if (selectedHistoryItem) {
      return (
        <ScrollView 
          style={styles.sectionContainer} 
          contentContainerStyle={[styles.sectionContent, { paddingBottom: 80 }]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedHistoryItem(null)}
          >
            <ArrowLeft size={20} color={colors.text} />
            <Text style={[styles.backButtonText, { color: colors.text }]}>{t('backToHistory')}</Text>
          </TouchableOpacity>
          
          <View style={styles.historyDetailHeader}>
            <Text style={[styles.historyDetailTitle, { color: colors.text }]}>{selectedHistoryItem.title}</Text>
            <Text style={[styles.historyDetailDate, { color: colors.textSecondary }]}>{selectedHistoryItem.date}</Text>
          </View>
          
          <Card style={styles.matchCard}>
            <View style={styles.matchTeams}>
              <View style={styles.teamContainer}>
                <Image 
                  source={{ uri: selectedHistoryItem.teams.home.logo }} 
                  style={styles.teamLogo} 
                />
                <Text style={[styles.teamName, { color: colors.text }]}>{selectedHistoryItem.teams.home.name}</Text>
              </View>
              
              <View style={styles.scoreContainer}>
                <Text style={[styles.scoreText, { color: colors.text }]}>
                  {selectedHistoryItem.teams.home.score} - {selectedHistoryItem.teams.away.score}
                </Text>
                <Text style={[styles.matchStatus, { color: colors.textSecondary, backgroundColor: colors.cardLight }]}>
                  {t('final')}
                </Text>
              </View>
              
              <View style={styles.teamContainer}>
                <Image 
                  source={{ uri: selectedHistoryItem.teams.away.logo }} 
                  style={styles.teamLogo} 
                />
                <Text style={[styles.teamName, { color: colors.text }]}>{selectedHistoryItem.teams.away.name}</Text>
              </View>
            </View>
          </Card>
          
          <Text style={[styles.sectionSubtitle, { color: colors.text }]}>{t('matchStatistics')}</Text>
          
          <Card style={styles.statsCard}>
            {selectedHistoryItem.stats.map((stat: StatItem, index: number) => (
              <View key={index} style={styles.statRow}>
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.home}%</Text>
                <View style={styles.statBarContainer}>
                  <View style={styles.statLabel}>
                    <Text style={[styles.statLabelText, { color: colors.textSecondary }]}>{stat.name}</Text>
                  </View>
                  <View style={[styles.statBars, { backgroundColor: colors.cardLight }]}>
                    <View style={[styles.statBar, styles.homeStatBar, { backgroundColor: colors.primary }]} />
                    <View style={[styles.statBar, styles.awayStatBar, { backgroundColor: '#FF4D4D' }]} />
                  </View>
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.away}%</Text>
              </View>
            ))}
          </Card>
          
          <Text style={[styles.sectionSubtitle, { color: colors.text }]}>{t('betsPlaced')}</Text>
          
          <Card style={styles.betsCard}>
            <View style={styles.betHeader}>
              <Text style={[styles.betHeaderText, { color: colors.textSecondary }]}>{t('user')}</Text>
              <Text style={[styles.betHeaderText, { color: colors.textSecondary }]}>{t('prediction')}</Text>
              <Text style={[styles.betHeaderText, { color: colors.textSecondary }]}>{t('result')}</Text>
            </View>
            
            {selectedHistoryItem.bets.map((betItem: any, index: number) => (
              <View key={betItem.id ? betItem.id : `bet-${index}`} style={[styles.betRow, { borderBottomColor: colors.border }]}>
                <View style={styles.betUser}>
                  <Avatar name={betItem.user} size={24} />
                  <Text style={[styles.betUserName, { color: colors.text }]}>{betItem.user}</Text>
                </View>
                <Text style={[styles.betPrediction, { color: colors.text }]}>{betItem.prediction}</Text>
                <View style={styles.betResult}>
                  <Text style={[styles.betResultText, { color: colors.text }]}>{betItem.result}</Text>
                  <Text style={[styles.betProfit, betItem.profit > 0 ? { color: colors.success } : { color: colors.error }]}>
                    {betItem.profit > 0 ? '+' : ''}{betItem.profit}
                  </Text>
                </View>
              </View>
            ))}
            
            <View style={[styles.betSummary, { borderTopColor: colors.border }]}>
              <Text style={[styles.betSummaryText, { color: colors.text }]}>
                {t('totalPot')}: ${selectedHistoryItem.totalAmount}
              </Text>
              <Text style={[styles.betSummaryText, { color: colors.text }]}>
                {t('winner')}: {selectedHistoryItem.winner}
              </Text>
            </View>
          </Card>
        </ScrollView>
      );
    }
    
    return (
      <ScrollView 
        style={styles.sectionContainer} 
        contentContainerStyle={[styles.sectionContent, { paddingBottom: 80 }]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('betHistory')}</Text>
        
        {betHistory.map((item: BetHistoryItem) => (
          <Card key={item.id} style={styles.historyCard}>
            <Text style={[styles.historyTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.historyDate, { color: colors.textSecondary }]}>{item.date}</Text>
            
            <View style={styles.historyDetails}>
              <View style={styles.historyDetail}>
                <Text style={[styles.historyDetailLabel, { color: colors.textSecondary }]}>{t('participants')}</Text>
                <Text style={[styles.historyDetailValue, { color: colors.text }]}>{item.participants}</Text>
              </View>
              
              <View style={styles.historyDetail}>
                <Text style={[styles.historyDetailLabel, { color: colors.textSecondary }]}>{t('totalAmount')}</Text>
                <Text style={[styles.historyDetailValue, { color: colors.text }]}>${item.totalAmount}</Text>
              </View>
              
              <View style={styles.historyDetail}>
                <Text style={[styles.historyDetailLabel, { color: colors.textSecondary }]}>{t('winner')}</Text>
                <Text style={[styles.historyDetailValue, { color: colors.text }]}>{item.winner}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.historyButton, { backgroundColor: colors.cardLight }]}
              onPress={() => setSelectedHistoryItem(item)}
            >
              <Text style={[styles.historyButtonText, { color: colors.text }]}>{t('viewDetails')}</Text>
              <ChevronRight size={16} color={colors.text} />
            </TouchableOpacity>
          </Card>
        ))}
      </ScrollView>
    );
  };
  
  const renderChallengesContent = () => {
    if (selectedChallenge) {
      return (
        <ScrollView 
          style={styles.sectionContainer} 
          contentContainerStyle={[styles.sectionContent, { paddingBottom: 80 }]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedChallenge(null)}
          >
            <ArrowLeft size={20} color={colors.text} />
            <Text style={[styles.backButtonText, { color: colors.text }]}>{t('backToChallenges')}</Text>
          </TouchableOpacity>
          
          <Card style={styles.challengeDetailCard}>
            <View style={styles.challengeDetailHeader}>
              <View style={[styles.challengeIconContainer, { backgroundColor: colors.cardLight }]}>
                <Trophy size={24} color={colors.primary} />
              </View>
              <View style={styles.challengeDetailTitleContainer}>
                <Text style={[styles.challengeDetailTitle, { color: colors.text }]}>{selectedChallenge.title}</Text>
                <Text style={[styles.challengeDetailDescription, { color: colors.textSecondary }]}>
                  {selectedChallenge.description}
                </Text>
              </View>
            </View>
            
            <View style={[styles.challengeRewardContainer, { borderBottomColor: colors.border }]}>
              <Text style={[styles.challengeRewardLabel, { color: colors.textSecondary }]}>{t('reward')}</Text>
              <Text style={[styles.challengeRewardValue, { color: colors.primary }]}>{selectedChallenge.reward}</Text>
            </View>
            
            <View style={styles.challengeProgressContainer}>
              <View style={[styles.challengeProgressBar, { backgroundColor: colors.cardLight }]}>
                <View 
                  style={[
                    styles.challengeProgress, 
                    { width: `${selectedChallenge.progress}%`, backgroundColor: colors.primary },
                    selectedChallenge.progress === 100 ? { backgroundColor: colors.success } : null
                  ]} 
                />
              </View>
              <Text style={[styles.challengeProgressText, { color: colors.text }]}>{selectedChallenge.progress}%</Text>
            </View>
            
            <Text style={[styles.challengeEndDate, { color: colors.textSecondary }]}>
              {selectedChallenge.progress === 100 ? t('completed') : selectedChallenge.endDate}
            </Text>
          </Card>
          
          <Text style={[styles.sectionSubtitle, { color: colors.text }]}>{t('tasks')}</Text>
          
          {selectedChallenge.tasks.map((task: any) => (
            <Card key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View style={styles.taskTitleContainer}>
                  {task.completed ? (
                    <CheckCircle size={20} color={colors.success} />
                  ) : (
                    <Clock size={20} color={colors.textSecondary} />
                  )}
                  <Text style={[
                    styles.taskTitle,
                    { color: colors.text },
                    task.completed ? { textDecorationLine: 'line-through', color: colors.textSecondary } : null
                  ]}>
                    {task.description}
                  </Text>
                </View>
                <Text style={[styles.taskReward, { color: colors.primary }]}>{task.reward}</Text>
              </View>
              
              <View style={styles.taskProgressContainer}>
                <View style={[styles.taskProgressBar, { backgroundColor: colors.cardLight }]}>
                  <View 
                    style={[
                      styles.taskProgress, 
                      { 
                        width: `${(task.progress / task.total) * 100}%`,
                        backgroundColor: colors.primary
                      },
                      task.completed ? { backgroundColor: colors.success } : null
                    ]} 
                  />
                </View>
                <Text style={[styles.taskProgressText, { color: colors.text }]}>
                  {task.progress}/{task.total}
                </Text>
              </View>
              
              {!task.completed && selectedChallenge.progress < 100 && (
                <TouchableOpacity
                  style={[styles.completeTaskButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleCompleteTask(selectedChallenge.id, task.id)}
                >
                  <Text style={styles.completeTaskButtonText}>{t('completeTask')}</Text>
                </TouchableOpacity>
              )}
            </Card>
          ))}
          
          {selectedChallenge.id === 'c1' && (
            <>
              <Text style={[styles.sectionSubtitle, { color: colors.text }]}>{t('leaderboard')}</Text>
              <Card style={styles.leaderboardCard}>
                {selectedChallenge.leaderboard.map((player: { rank: number; name: string; wins: number; avatar?: string }) => (
                  <View key={player.rank} style={[styles.leaderboardRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.leaderboardRank}>
                      <Text style={[
                        styles.leaderboardRankText,
                        { color: colors.textSecondary },
                        player.rank <= 3 ? { color: colors.primary } : null
                      ]}>
                        {player.rank}
                      </Text>
                    </View>
                    <View style={styles.leaderboardUser}>
                      <Avatar name={player.name} size={32} />
                      <Text style={[styles.leaderboardName, { color: colors.text }]}>{player.name}</Text>
                    </View>
                    <View style={styles.leaderboardStats}>
                      <Text style={[styles.leaderboardWins, { color: colors.text }]}>{player.wins} {t('wins')}</Text>
                    </View>
                  </View>
                ))}
              </Card>
            </>
          )}
          
          {selectedChallenge.id === 'c2' && (
            <>
              <Text style={[styles.sectionSubtitle, { color: colors.text }]}>{t('currentParticipants')}</Text>
              <Card style={styles.participantsCard}>
                {selectedChallenge.participants.map((player: any, index: number) => (
                  <View key={`participant-${index}`} style={[styles.participantRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.participantUser}>
                      <Avatar name={player.name} size={32} />
                      <Text style={[styles.participantName, { color: colors.text }]}>{player.name}</Text>
                    </View>
                    <View style={styles.participantStats}>
                      <View style={styles.participantStat}>
                        <Text style={[styles.participantStatLabel, { color: colors.textSecondary }]}>{t('current')}</Text>
                        <Text style={[styles.participantStatValue, { color: colors.text }]}>{player.currentStreak}</Text>
                      </View>
                      <View style={styles.participantStat}>
                        <Text style={[styles.participantStatLabel, { color: colors.textSecondary }]}>{t('best')}</Text>
                        <Text style={[styles.participantStatValue, { color: colors.text }]}>{player.bestStreak}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </Card>
            </>
          )}
          
          {selectedChallenge.id === 'c3' && selectedChallenge.progress === 100 && (
            <>
              <Text style={[styles.sectionSubtitle, { color: colors.text }]}>{t('completedBy')}</Text>
              <Card style={styles.completedByCard}>
                {selectedChallenge.completedBy.map((player: any, index: number) => (
                  <View key={`completed-${index}`} style={[styles.completedByRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.completedByUser}>
                      <Avatar name={player.name} size={32} />
                      <View style={styles.completedByUserInfo}>
                        <Text style={[styles.completedByName, { color: colors.text }]}>{player.name}</Text>
                        <Text style={[styles.completedByDate, { color: colors.textSecondary }]}>{player.date}</Text>
                      </View>
                    </View>
                    <View style={styles.completedByAmount}>
                      <Text style={[styles.completedByAmountValue, { color: colors.text }]}>${player.betAmount}</Text>
                      <Medal size={16} color={colors.primary} />
                    </View>
                  </View>
                ))}
              </Card>
            </>
          )}
          
          {selectedChallenge.progress < 100 && (
            <Button
              title={t('viewActiveBets')}
              onPress={() => {
                setSelectedChallenge(null);
                setActiveSection('home');
              }}
              style={styles.viewBetsButton}
            />
          )}
        </ScrollView>
      );
    }
    
    return (
      <ScrollView 
        style={styles.sectionContainer} 
        contentContainerStyle={[styles.sectionContent, { paddingBottom: 80 }]}
      >
        <View style={styles.challengesHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('challenges')}</Text>
          <Button
            title={t('createChallenge')}
            size="small"
            leftIcon={<Plus size={16} color="#FFFFFF" />}
            onPress={() => router.push(`/groups/${id}/create-challenge`)}
            style={styles.createChallengeButton}
          />
        </View>
        
        {challenges.length > 0 ? (
          challenges.map((challenge: any) => (
            <Card key={challenge.id} style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <Text style={[styles.challengeTitle, { color: colors.text }]}>{challenge.title}</Text>
                <Text style={[styles.challengeReward, { color: colors.primary }]}>{challenge.reward}</Text>
              </View>
              
              <Text style={[styles.challengeDescription, { color: colors.textSecondary }]}>
                {challenge.description}
              </Text>
              
              <View style={styles.challengeProgressContainer}>
                <View style={[styles.challengeProgressBar, { backgroundColor: colors.cardLight }]}>
                  <View 
                    style={[
                      styles.challengeProgress, 
                      { width: `${challenge.progress}%`, backgroundColor: colors.primary },
                      challenge.progress === 100 ? { backgroundColor: colors.success } : null
                    ]} 
                  />
                </View>
                <Text style={[styles.challengeProgressText, { color: colors.text }]}>{challenge.progress}%</Text>
              </View>
              
              <View style={styles.challengeFooter}>
                <Text style={[styles.challengeEndDate, { color: colors.textSecondary }]}>{challenge.endDate}</Text>
                
                {challenge.progress < 100 ? (
                  <TouchableOpacity 
                    style={[styles.challengeButton, { backgroundColor: colors.cardLight }]}
                    onPress={() => setSelectedChallenge(challenge)}
                  >
                    <Text style={[styles.challengeButtonText, { color: colors.text }]}>{t('viewTasks')}</Text>
                    <ChevronRight size={16} color={colors.text} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.challengeCompletedButton, { backgroundColor: colors.success }]}
                    onPress={() => setSelectedChallenge(challenge)}
                  >
                    <Text style={styles.challengeCompletedText}>{t('viewDetails')}</Text>
                    <ChevronRight size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyChallengesContainer}>
            <Card style={styles.emptyChallengesCard}>
              <Target size={48} color={colors.primaryLight} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('noChallengesYet')}</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('createFirstChallengeMessage')}
              </Text>
              <Button
                title={t('createChallenge')}
                onPress={() => router.push(`/groups/${id}/create-challenge`)}
                style={styles.emptyButton}
              />
            </Card>
          </View>
        )}
      </ScrollView>
    );
  };
  
  const renderLeaderboardContent = () => {
    return (
      <ScrollView 
        style={styles.sectionContainer} 
        contentContainerStyle={[styles.sectionContent, { paddingBottom: 80 }]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('groupLeaderboard')}</Text>
        
        <Card style={styles.podiumCard}>
          {/* Top 3 Podium */}
          <View style={styles.podiumContainer}>
            {sortedMembers.length > 1 && (
              <View style={styles.podiumPosition}>
                <View style={[styles.podiumAvatar, { marginTop: 40 }]}>
                  <Avatar 
                    name={sortedMembers[1].username} 
                    size={60} 
                    uri={sortedMembers[1].avatar}
                  />
                  <View style={[styles.podiumRank, { backgroundColor: colors.primary }]}>
                    <Text style={styles.podiumRankText}>2</Text>
                  </View>
                </View>
                <View style={[styles.podiumPillar, { height: 80, backgroundColor: colors.cardLight }]}>
                  <Text style={[styles.podiumCoins, { color: colors.primary }]}>
                    {sortedMembers[1].groupCoins}
                  </Text>
                </View>
                <Text style={[styles.podiumName, { color: colors.text }]}>
                  {sortedMembers[1].username}
                </Text>
              </View>
            )}
            
            {sortedMembers.length > 0 && (
              <View style={styles.podiumPosition}>
                <View style={styles.podiumAvatar}>
                  <Avatar 
                    name={sortedMembers[0].username} 
                    size={70} 
                    uri={sortedMembers[0].avatar}
                  />
                  <View style={[styles.podiumRank, { backgroundColor: colors.primary }]}>
                    <Text style={styles.podiumRankText}>1</Text>
                  </View>
                  <View style={styles.crownContainer}>
                    <Award size={24} color="#FFD700" />
                  </View>
                </View>
                <View style={[styles.podiumPillar, { height: 120, backgroundColor: colors.primary }]}>
                  <Text style={styles.podiumCoins}>
                    {sortedMembers[0].groupCoins}
                  </Text>
                </View>
                <Text style={[styles.podiumName, { color: colors.text }]}>
                  {sortedMembers[0].username}
                </Text>
              </View>
            )}
            
            {sortedMembers.length > 2 && (
              <View style={styles.podiumPosition}>
                <View style={[styles.podiumAvatar, { marginTop: 60 }]}>
                  <Avatar 
                    name={sortedMembers[2].username} 
                    size={50} 
                    uri={sortedMembers[2].avatar}
                  />
                  <View style={[styles.podiumRank, { backgroundColor: colors.primary }]}>
                    <Text style={styles.podiumRankText}>3</Text>
                  </View>
                </View>
                <View style={[styles.podiumPillar, { height: 60, backgroundColor: colors.cardLight }]}>
                  <Text style={[styles.podiumCoins, { color: colors.primary }]}>
                    {sortedMembers[2].groupCoins}
                  </Text>
                </View>
                <Text style={[styles.podiumName, { color: colors.text }]}>
                  {sortedMembers[2].username}
                </Text>
              </View>
            )}
          </View>
        </Card>
        
        {/* Rest of the leaderboard */}
        <Text style={[styles.sectionSubtitle, { color: colors.text, marginTop: 24 }]}>
          {t('rankings')}
        </Text>
        
        <Card style={styles.rankingsCard}>
          {sortedMembers.slice(3).map((member: any, index: number) => (
            <View key={`ranking-${index}`} style={[styles.rankingRow, { borderBottomColor: colors.border }]}>
              <View style={styles.rankingPosition}>
                <Text style={[styles.rankingNumber, { color: colors.textSecondary }]}>
                  {index + 4}
                </Text>
              </View>
              
              <View style={styles.rankingUser}>
                <Avatar name={member.username} size={40} uri={member.avatar} />
                <Text style={[styles.rankingName, { color: colors.text }]}>
                  {member.username}
                </Text>
              </View>
              
              <View style={styles.rankingCoins}>
                <Text style={[styles.rankingCoinsValue, { color: colors.primary }]}>
                  {member.groupCoins}
                </Text>
                <Text style={[styles.rankingCoinsLabel, { color: colors.textSecondary }]}>
                  {t('coins')}
                </Text>
              </View>
            </View>
          ))}
          
          {sortedMembers.length <= 3 && (
            <View style={styles.noMoreRankings}>
              <Text style={[styles.noMoreRankingsText, { color: colors.textSecondary }]}>
                {t('noMoreMembers')}
              </Text>
            </View>
          )}
        </Card>
        
        <View style={styles.leaderboardStats}>
          <Card style={styles.leaderboardStatCard}>
            <View style={styles.leaderboardStatContent}>
              <Trophy size={24} color={colors.primary} />
              <Text style={[styles.leaderboardStatValue, { color: colors.text }]}>
                {sortedMembers.length > 0 ? sortedMembers[0].username : '-'}
              </Text>
              <Text style={[styles.leaderboardStatLabel, { color: colors.textSecondary }]}>
                {t('topEarner')}
              </Text>
            </View>
          </Card>
          
          <Card style={styles.leaderboardStatCard}>
            <View style={styles.leaderboardStatContent}>
              <Award size={24} color={colors.primary} />
              <Text style={[styles.leaderboardStatValue, { color: colors.text }]}>
                {sortedMembers.reduce((sum: number, member: any) => sum + member.groupCoins, 0)}
              </Text>
              <Text style={[styles.leaderboardStatLabel, { color: colors.textSecondary }]}>
                {t('totalCoins')}
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    );
  };
  
  const renderChatContent = () => (
    <KeyboardAvoidingView 
      style={styles.chatContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={chatMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.chatMessageContainer}>
            <Avatar name={item.sender} size={36} />
            
            <View style={[styles.chatMessage, { backgroundColor: colors.card }]}>
              <View style={styles.chatMessageHeader}>
                <Text style={[styles.chatMessageSender, { color: colors.text }]}>{item.sender}</Text>
                <Text style={[styles.chatMessageTime, { color: colors.textSecondary }]}>{item.timestamp}</Text>
              </View>
              
              {item.message && (
                <Text style={[styles.chatMessageText, { color: colors.text }]}>{item.message}</Text>
              )}
              
              {item.image && (
                <TouchableOpacity 
                  activeOpacity={0.9}
                  onPress={() => {
                    // Preview de imagen
                  }}
                >
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.chatMessageImage} 
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />
      
      {selectedImage && (
        <View style={styles.selectedImageContainer}>
          <Image 
            source={{ uri: selectedImage }} 
            style={styles.selectedImage} 
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={[styles.removeImageButton, { backgroundColor: colors.error }]}
            onPress={() => setSelectedImage(null)}
          >
            <X size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
      
      <View style={[styles.chatInputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.chatAttachButton, { backgroundColor: colors.cardLight }]}
          onPress={pickImage}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <ImageIcon size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
        
        <View style={[styles.chatInputWrapper, { backgroundColor: colors.cardLight }]}>
          <TextInput
            style={[styles.chatInput, { color: colors.text }]}
            placeholder={t('typeMessage')}
            placeholderTextColor={colors.textSecondary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
        </View>
        
        <TouchableOpacity 
          style={[
            styles.chatSendButton,
            { backgroundColor: colors.cardLight },
            (!messageText && !selectedImage) ? { opacity: 0.6 } : null
          ]}
          onPress={sendMessage}
          disabled={!messageText && !selectedImage}
        >
          <Send 
            size={20} 
            color={(!messageText && !selectedImage) ? colors.textSecondary : colors.primary} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
  
  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return renderHomeContent();
      case 'history':
        return renderHistoryContent();
      case 'challenges':
        return renderChallengesContent();
      case 'leaderboard':
        return renderLeaderboardContent();
      case 'chat':
        return renderChatContent();
      default:
        return renderHomeContent();
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: group.name,
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerBackButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push(`/groups/${id}/info`)}>
              <Info size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.groupInfo}>
          <Avatar uri={group.avatar} name={group.name} size={60} />
          <View style={styles.groupDetails}>
            <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
            {group.description && (
              <Text style={[styles.groupDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                {group.description}
              </Text>
            )}
            <View style={styles.groupStats}>
              <View style={styles.groupStat}>
                <Users size={16} color={colors.textSecondary} />
                <Text style={[styles.groupStatText, { color: colors.textSecondary }]}>
                  {group.members.length} {t('members')}
                </Text>
              </View>
              <View style={styles.groupStat}>
                <Trophy size={16} color={colors.textSecondary} />
                <Text style={[styles.groupStatText, { color: colors.textSecondary }]}>
                  {groupBets.length} {t('bets')}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.actions}>
          <View style={styles.coinsDisplay}>
            <Text style={[styles.coinsLabel, { color: colors.textSecondary }]}>{t('yourGroupCoins')}</Text>
            <Text style={[styles.coinsValue, { color: colors.primary }]}>{userGroupCoins}</Text>
          </View>
          <Button
            title={t('newBet')}
            size="small"
            leftIcon={<Plus size={16} color="#FFFFFF" />}
            onPress={() => router.push(`/groups/${id}/create-bet`)}
            style={styles.actionButton}
          />
        </View>
      </View>
      
      {renderContent()}
      
      {/* Group Bottom Navigation */}
      <View style={[styles.groupNavbar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.groupNavItem}
          onPress={() => {
            setActiveSection('home');
            setSelectedHistoryItem(null);
            setSelectedChallenge(null);
          }}
        >
          <Home 
            size={24} 
            color={activeSection === 'home' ? colors.primary : colors.textSecondary} 
          />
          <Text 
            style={[
              styles.groupNavText, 
              { color: colors.textSecondary },
              activeSection === 'home' && { color: colors.primary }
            ]}
          >
            {t('home')}
          </Text>
        </TouchableOpacity>
        

        
        <TouchableOpacity
          style={styles.groupNavItem}
          onPress={() => {
            setActiveSection('challenges');
            setSelectedHistoryItem(null);
          }}
        >
          <Target 
            size={24} 
            color={activeSection === 'challenges' ? colors.primary : colors.textSecondary} 
          />
          <Text 
            style={[
              styles.groupNavText, 
              { color: colors.textSecondary },
              activeSection === 'challenges' && { color: colors.primary }
            ]}
          >
            {t('challenges')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.groupNavItem}
          onPress={() => {
            setActiveSection('leaderboard');
            setSelectedHistoryItem(null);
            setSelectedChallenge(null);
          }}
        >
          <Award
            size={24} 
            color={activeSection === 'leaderboard' ? colors.primary : colors.textSecondary} 
          />
          <Text 
            style={[
              styles.groupNavText, 
              { color: colors.textSecondary },
              activeSection === 'leaderboard' && { color: colors.primary }
            ]}
          >
            {t('leaderboard')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.groupNavItem}
          onPress={() => {
            setActiveSection('history');
            setSelectedChallenge(null);
          }}
        >
          <History 
            size={24} 
            color={activeSection === 'history' ? colors.primary : colors.textSecondary} 
          />
          <Text 
            style={[
              styles.groupNavText, 
              { color: colors.textSecondary },
              activeSection === 'history' && { color: colors.primary }
            ]}
          >
            {t('history')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.groupNavItem}
          onPress={() => {
            setActiveSection('chat');
            setSelectedHistoryItem(null);
            setSelectedChallenge(null);
          }}
        >
          <MessageSquare 
            size={24} 
            color={activeSection === 'chat' ? colors.primary : colors.textSecondary} 
          />
          <Text 
            style={[
              styles.groupNavText, 
              { color: colors.textSecondary },
              activeSection === 'chat' && { color: colors.primary }
            ]}
          >
            {t('chat')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  notFoundText: {
    fontSize: 18,
    marginBottom: 16,
  },
  headerBackButton: {
    marginRight: 8,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  groupInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  groupDetails: {
    flex: 1,
    marginLeft: 12,
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  groupStats: {
    flexDirection: 'row',
    gap: 16,
  },
  groupStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupStatText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coinsDisplay: {
    flex: 1,
  },
  coinsLabel: {
    fontSize: 12,
  },
  coinsValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionButton: {
    paddingHorizontal: 16,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    width: '100%',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    width: '100%',
  },
  membersContainer: {
    flex: 1,
    padding: 16,
  },
  membersTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  membersList: {
    marginBottom: 24,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  memberName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  memberBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberBadgeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '500',
  },
  inviteButton: {
    marginBottom: 16,
  },
  leaveButton: {
    marginTop: 24,
  },
  // Group navbar styles
  groupNavbar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  groupNavItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupNavText: {
    fontSize: 12,
    marginTop: 4,
  },
  // Section styles
  sectionContainer: {
    flex: 1,
  },
  sectionContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
  },
  // History styles
  historyCard: {
    marginBottom: 16,
    padding: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    marginBottom: 16,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  historyDetail: {
    alignItems: 'center',
  },
  historyDetailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  historyDetailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  historyButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  historyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  // History detail styles
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  historyDetailHeader: {
    marginBottom: 16,
  },
  historyDetailTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  historyDetailDate: {
    fontSize: 14,
  },
  matchCard: {
    padding: 16,
    marginBottom: 16,
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamContainer: {
    alignItems: 'center',
    width: '35%',
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    width: '30%',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  matchStatus: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statsCard: {
    padding: 16,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    width: 40,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  statBarContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  statLabel: {
    alignSelf: 'center',
    marginBottom: 4,
  },
  statLabelText: {
    fontSize: 12,
  },
  statBars: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
  },
  homeStatBar: {
    
  },
  awayStatBar: {
    
  },
  betsCard: {
    padding: 16,
  },
  betHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  betHeaderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  betRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  betUser: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%',
  },
  betUserName: {
    fontSize: 14,
    marginLeft: 8,
  },
  betPrediction: {
    width: '40%',
    fontSize: 14,
  },
  betResult: {
    width: '30%',
    alignItems: 'flex-end',
  },
  betWon: {
    
  },
  betLost: {
    
  },
  betResultText: {
    fontSize: 14,
    fontWeight: '600',
  },
  betProfit: {
    fontSize: 12,
    fontWeight: '500',
  },
  profitPositive: {
    
  },
  profitNegative: {
    
  },
  betSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  betSummaryText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  // Challenge styles
  challengesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  createChallengeButton: {
    paddingHorizontal: 12,
  },
  challengeCard: {
    marginBottom: 16,
    padding: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  challengeReward: {
    fontSize: 14,
    fontWeight: '600',
  },
  challengeDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  challengeProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeProgressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  challengeProgress: {
    height: '100%',
    borderRadius: 4,
  },
  challengeCompleted: {
    
  },
  challengeProgressText: {
    fontSize: 14,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeEndDate: {
    fontSize: 14,
  },
  challengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  challengeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  challengeCompletedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  challengeCompletedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 4,
  },
  // Challenge detail styles
  challengeDetailCard: {
    padding: 16,
    marginBottom: 16,
  },
  challengeDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  challengeDetailTitleContainer: {
    flex: 1,
  },
  challengeDetailTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  challengeDetailDescription: {
    fontSize: 14,
  },
  challengeRewardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  challengeRewardLabel: {
    fontSize: 14,
  },
  challengeRewardValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  taskCard: {
    padding: 16,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
  },
  taskReward: {
    fontSize: 14,
    fontWeight: '600',
  },
  taskProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  taskProgress: {
    height: '100%',
    borderRadius: 3,
  },
  taskProgressCompleted: {
    
  },
  taskProgressText: {
    fontSize: 12,
    fontWeight: '500',
    width: 30,
    textAlign: 'right',
  },
  completeTaskButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  completeTaskButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  leaderboardCard: {
    padding: 16,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  leaderboardRank: {
    width: 30,
    alignItems: 'center',
  },
  leaderboardRankText: {
    fontSize: 16,
    fontWeight: '700',
  },
  topRank: {
    
  },
  leaderboardUser: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  leaderboardName: {
    fontSize: 16,
    marginLeft: 12,
  },
  leaderboardWins: {
    fontSize: 14,
    fontWeight: '600',
  },
  participantsCard: {
    padding: 16,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  participantUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantName: {
    fontSize: 16,
    marginLeft: 12,
  },
  participantStats: {
    flexDirection: 'row',
    gap: 16,
  },
  participantStat: {
    alignItems: 'center',
  },
  participantStatLabel: {
    fontSize: 12,
  },
  participantStatValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  completedByCard: {
    padding: 16,
  },
  completedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  completedByUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedByUserInfo: {
    marginLeft: 12,
  },
  completedByName: {
    fontSize: 16,
  },
  completedByDate: {
    fontSize: 12,
  },
  completedByAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedByAmountValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewBetsButton: {
    marginTop: 24,
  },
  emptyChallengesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChallengesCard: {
    alignItems: 'center',
    padding: 24,
    width: '100%',
  },
  // Chat styles
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for input and navbar
  },
  chatMessageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chatMessage: {
    flex: 1,
    marginLeft: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 12,
  },
  chatMessageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatMessageSender: {
    fontSize: 14,
    fontWeight: '600',
  },
  chatMessageTime: {
    fontSize: 12,
  },
  chatMessageText: {
    fontSize: 14,
  },
  chatMessageImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  selectedImageContainer: {
    margin: 12,
    marginBottom: 0,
    position: 'relative',
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 60, // Position above the group navbar
    left: 0,
    right: 0,
  },
  chatAttachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chatInputWrapper: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  chatInput: {
    fontSize: 14,
    maxHeight: 80,
  },
  chatSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  chatSendButtonDisabled: {
    opacity: 0.6,
  },
  // Leaderboard styles
  podiumCard: {
    padding: 16,
    marginBottom: 16,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: 16,
  },
  podiumPosition: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  podiumAvatar: {
    position: 'relative',
    marginBottom: 8,
  },
  podiumRank: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumRankText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  crownContainer: {
    position: 'absolute',
    top: -15,
    left: '50%',
    marginLeft: -12,
  },
  podiumPillar: {
    width: 60,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumCoins: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  podiumName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    width: 80,
  },
  rankingsCard: {
    padding: 16,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rankingPosition: {
    width: 30,
    alignItems: 'center',
  },
  rankingNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  rankingUser: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankingName: {
    fontSize: 16,
    marginLeft: 12,
  },
  rankingCoins: {
    alignItems: 'flex-end',
  },
  rankingCoinsValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  rankingCoinsLabel: {
    fontSize: 12,
  },
  noMoreRankings: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  noMoreRankingsText: {
    fontSize: 14,
  },
  leaderboardStats: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
  leaderboardStatCard: {
    flex: 1,
    padding: 16,
  },
  leaderboardStatContent: {
    alignItems: 'center',
  },
  leaderboardStatValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  leaderboardStatLabel: {
    fontSize: 14,
  },
});