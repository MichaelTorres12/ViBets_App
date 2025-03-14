//app/(tabs)/bets.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useBetsStore } from '@/store/bets-store';
import { BetCard } from '@/components/BetCard';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { Search, Trophy, Filter, ArrowUpDown, TrendingUp, Calendar, DollarSign, Percent, BarChart3, PieChart, LineChart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart as ChartKit } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function BetsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { bets, participations, getBetById } = useBetsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'won' | 'lost'>('all');
  const [activeTab, setActiveTab] = useState<'bets' | 'statistics'>('bets');
  
  if (!user) {
    return null;
  }
  
  // Get user's bets with bet details
  const userBetsWithDetails = participations
    .filter(p => p.userId === user.id)
    .map(p => {
      const bet = getBetById(p.betId);
      return { participation: p, bet };
    })
    .filter(item => item.bet);
  
  // Apply filters
  const filteredBets = userBetsWithDetails
    .filter(({ participation, bet }) => {
      if (filter === 'active') return participation.status === 'active';
      if (filter === 'won') return participation.status === 'won';
      if (filter === 'lost') return participation.status === 'lost';
      return true;
    })
    .filter(({ bet }) => {
      // Si no existe bet, descartamos el elemento
      if (!bet) return false;
      
      if (!searchQuery) return true;
      
      return (
        bet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bet.description && bet.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
    
  
  const navigateToBet = (betId: string) => {
    router.push(`/bets/${betId}`);
  };
  
  // Calculate stats
  const totalBets = userBetsWithDetails.length;
  const wonBets = userBetsWithDetails.filter(({ participation }) => participation.status === 'won').length;
  const lostBets = userBetsWithDetails.filter(({ participation }) => participation.status === 'lost').length;
  const activeBets = userBetsWithDetails.filter(({ participation }) => participation.status === 'active').length;
  
  // Calculate win rate
  const winRate = totalBets > 0 ? Math.round((wonBets / (wonBets + lostBets)) * 100) : 0;
  
  // Mock data for statistics
  const monthlyWinRate = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 72],
        color: () => colors.primary,
        strokeWidth: 2
      }
    ],
  };
  
  const betTypeDistribution = {
    labels: ["Football", "Basketball", "Tennis", "Other"],
    datasets: [
      {
        data: [45, 25, 20, 10],
        color: () => colors.primary,
        strokeWidth: 2
      }
    ],
  };
  
  const profitLoss = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [500, -200, 300, 700, -150, 950],
        color: (opacity = 1) => `rgba(221, 255, 0, ${opacity})`,
        strokeWidth: 2
      }
    ],
  };
  
  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: colors.primary
    }
  };
  
  // Mock recent bets data
  const recentBets = [
    {
      id: 'rb1',
      team1: 'Chelsea',
      team2: 'Arsenal',
      score: '3 : 2',
      date: 'Today',
      odds: 2.56,
      stake: 200,
      result: 'win',
      profit: 500,
      logo1: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/800px-Chelsea_FC.svg.png',
      logo2: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
    },
    {
      id: 'rb2',
      team1: 'Man. United',
      team2: 'Everton',
      score: '1 : 2',
      date: 'Yesterday',
      odds: 1.99,
      stake: 250,
      result: 'loss',
      profit: -250,
      logo1: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
      logo2: 'https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg',
    },
    {
      id: 'rb3',
      team1: 'Liverpool',
      team2: 'Man. City',
      score: '2 : 2',
      date: '3 days ago',
      odds: 3.25,
      stake: 150,
      result: 'win',
      profit: 375,
      logo1: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
      logo2: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
    },
  ];
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance</Text>
        
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'bets' && styles.tabActive]}
            onPress={() => setActiveTab('bets')}
          >
            <Text style={[styles.tabText, activeTab === 'bets' && styles.tabTextActive]}>My Bets</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'statistics' && styles.tabActive]}
            onPress={() => setActiveTab('statistics')}
          >
            <Text style={[styles.tabText, activeTab === 'statistics' && styles.tabTextActive]}>Statistics</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {activeTab === 'bets' ? (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{totalBets}</Text>
                <Text style={styles.statLabel}>Total Bets</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{wonBets}</Text>
                <Text style={styles.statLabel}>Won</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{lostBets}</Text>
                <Text style={styles.statLabel}>Lost</Text>
              </View>
            </View>
            
            <View style={styles.winRateContainer}>
              <View style={styles.winRateHeader}>
                <Text style={styles.winRateLabel}>Win Rate</Text>
                <Text style={styles.winRateValue}>{winRate}%</Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${winRate}%` },
                    winRate >= 50 ? styles.progressBarGood : styles.progressBarBad,
                  ]} 
                />
              </View>
            </View>
          </View>
          
          <View style={styles.filterContainer}>
            <View style={styles.searchContainer}>
              <Input
                placeholder="Search bets..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                leftIcon={<Search size={20} color={colors.textSecondary} />}
                containerStyle={styles.searchInputContainer}
              />
            </View>
            
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                onPress={() => setFilter('all')}
              >
                <Text
                  style={[styles.filterText, filter === 'all' && styles.filterTextActive]}
                >
                  All
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
                onPress={() => setFilter('active')}
              >
                <Text
                  style={[styles.filterText, filter === 'active' && styles.filterTextActive]}
                >
                  Active
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.filterButton, filter === 'won' && styles.filterButtonActive]}
                onPress={() => setFilter('won')}
              >
                <Text
                  style={[styles.filterText, filter === 'won' && styles.filterTextActive]}
                >
                  Won
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.filterButton, filter === 'lost' && styles.filterButtonActive]}
                onPress={() => setFilter('lost')}
              >
                <Text
                  style={[styles.filterText, filter === 'lost' && styles.filterTextActive]}
                >
                  Lost
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {filteredBets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Card style={styles.emptyCard}>
                <Trophy size={48} color={colors.primary} />
                <Text style={styles.emptyTitle}>No bets found</Text>
                <Text style={styles.emptyText}>
                  {filter === 'all'
                    ? "You haven't placed any bets yet. Join a group and start betting!"
                    : `You don't have any ${filter} bets.`}
                </Text>
              </Card>
            </View>
          ) : (
            <FlatList
              data={filteredBets}
              keyExtractor={({ participation }) => participation.id}
              renderItem={({ item }) => (
                <BetCard
                  bet={item.bet!} // Aseguramos que bet no sea undefined
                  userParticipation={item.participation}
                  onPress={() => navigateToBet(item.bet!.id)}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      ) : (
        <ScrollView 
          style={styles.statisticsContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.statisticsContent}
        >
          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <Card style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <TrendingUp size={24} color={colors.primary} />
              </View>
              <Text style={styles.summaryValue}>{winRate}%</Text>
              <Text style={styles.summaryLabel}>Win Rate</Text>
            </Card>
            
            <Card style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <DollarSign size={24} color={colors.primary} />
              </View>
              <Text style={styles.summaryValue}>$1,250</Text>
              <Text style={styles.summaryLabel}>Total Profit</Text>
            </Card>
            
            <Card style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Percent size={24} color={colors.primary} />
              </View>
              <Text style={styles.summaryValue}>2.45x</Text>
              <Text style={styles.summaryLabel}>ROI</Text>
            </Card>
          </View>
          
          {/* Win Rate Chart */}
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Win Rate Trend</Text>
              <BarChart3 size={20} color={colors.primary} />
            </View>
            <ChartKit
              data={monthlyWinRate}
              width={width - 64}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Card>
          
          {/* Bet Type Distribution */}
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Bet Type Distribution</Text>
              <PieChart size={20} color={colors.primary} />
            </View>
            <ChartKit
              data={betTypeDistribution}
              width={width - 64}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Card>
          
          {/* Profit/Loss Chart */}
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Profit/Loss</Text>
              <LineChart size={20} color={colors.primary} />
            </View>
            <ChartKit
              data={profitLoss}
              width={width - 64}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Card>
          
          {/* Recent Bets */}
          <View style={styles.recentBetsContainer}>
            <Text style={styles.recentBetsTitle}>Recent Bets</Text>
            
            {recentBets.map((bet) => (
              <Card key={bet.id} style={styles.recentBetCard}>
                <View style={styles.recentBetHeader}>
                  <Text style={styles.recentBetDate}>{bet.date}</Text>
                  <View style={[
                    styles.recentBetResult, 
                    bet.result === 'win' ? styles.recentBetWin : styles.recentBetLoss
                  ]}>
                    <Text style={styles.recentBetResultText}>
                      {bet.result === 'win' ? 'Win' : 'Loss'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.matchContainer}>
                  <View style={styles.teamContainer}>
                    <View style={styles.teamLogo}>
                      {/* Replace with actual team logos */}
                    </View>
                    <Text style={styles.teamName}>{bet.team1}</Text>
                  </View>
                  
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreText}>{bet.score}</Text>
                    <Text style={styles.scoreLabel}>FT</Text>
                  </View>
                  
                  <View style={[styles.teamContainer, styles.teamRight]}>
                    <Text style={styles.teamName}>{bet.team2}</Text>
                    <View style={styles.teamLogo}>
                      {/* Replace with actual team logos */}
                    </View>
                  </View>
                </View>
                
                <View style={styles.betDetailsContainer}>
                  <View style={styles.betDetail}>
                    <Text style={styles.betDetailLabel}>Odds</Text>
                    <Text style={styles.betDetailValue}>{bet.odds}</Text>
                  </View>
                  
                  <View style={styles.betDetail}>
                    <Text style={styles.betDetailLabel}>Stake</Text>
                    <Text style={styles.betDetailValue}>${bet.stake}</Text>
                  </View>
                  
                  <View style={styles.betDetail}>
                    <Text style={[
                      styles.betDetailValue, 
                      bet.profit > 0 ? styles.profitText : styles.lossText
                    ]}>
                      {bet.profit > 0 ? `+$${bet.profit}` : `-$${Math.abs(bet.profit)}`}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: colors.card,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.cardLight,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.text,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  winRateContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  winRateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  winRateLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  winRateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.cardLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarGood: {
    backgroundColor: colors.success,
  },
  progressBarBad: {
    backgroundColor: colors.error,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInputContainer: {
    marginBottom: 0,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#000000',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding for tab bar
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
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Statistics styles
  statisticsContainer: {
    flex: 1,
  },
  statisticsContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding for tab bar
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    padding: 12,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(221, 255, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chartCard: {
    marginBottom: 16,
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  recentBetsContainer: {
    marginBottom: 16,
  },
  recentBetsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  recentBetCard: {
    marginBottom: 12,
  },
  recentBetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentBetDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recentBetResult: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recentBetWin: {
    backgroundColor: colors.success,
  },
  recentBetLoss: {
    backgroundColor: colors.error,
  },
  recentBetResultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  matchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamRight: {
    justifyContent: 'flex-end',
  },
  teamLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardLight,
    marginRight: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  scoreContainer: {
    flex: 1,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  betDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  betDetail: {
    alignItems: 'center',
  },
  betDetailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  betDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  profitText: {
    color: colors.success,
  },
  lossText: {
    color: colors.error,
  },
});