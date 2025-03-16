// app/(tabs)/bets.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useBetsStore } from '@/store/bets-store';
import { BetCard } from '@/components/BetCard';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { Search, Trophy, TrendingUp, DollarSign, Percent, BarChart3, PieChart, LineChart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart as ChartKit } from 'react-native-chart-kit';
import { Bet, BetParticipation } from '@/types';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 120; // Altura estimada para cada BetCard

export default function BetsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { participations, getBetById } = useBetsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'won' | 'lost'>('all');
  const [activeTab, setActiveTab] = useState<'bets' | 'statistics'>('bets');

  if (!user) return null;

  // Filtramos las participaciones del usuario y obtenemos la apuesta asociada
  const userBetsWithDetails = useMemo(
    () =>
      participations
        .filter(p => p.userId === user.id)
        .map(p => {
          const bet = getBetById(p.betId);
          return { participation: p, bet };
        })
        // Aquí usamos un type guard para asegurarnos de que 'bet' es de tipo Bet
        .filter((item): item is { participation: BetParticipation; bet: Bet } => Boolean(item.bet)),
    [participations, user.id, getBetById]
  );

  const filteredBets = useMemo(
    () =>
      userBetsWithDetails
        .filter(({ participation }) => {
          if (filter === 'active') return participation.status === 'active';
          if (filter === 'won') return participation.status === 'won';
          if (filter === 'lost') return participation.status === 'lost';
          return true;
        })
        .filter(({ bet }) => {
          if (!searchQuery) return true;
          return (
            bet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (bet.description && bet.description.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }),
    [userBetsWithDetails, filter, searchQuery]
  );

  const navigateToBet = useCallback((betId: string) => {
    router.push(`/bets/${betId}`);
  }, [router]);

  const totalBets = userBetsWithDetails.length;
  const wonBets = userBetsWithDetails.filter(({ participation }) => participation.status === 'won').length;
  const lostBets = userBetsWithDetails.filter(({ participation }) => participation.status === 'lost').length;
  const winRate = totalBets > 0 ? Math.round((wonBets / (wonBets + lostBets)) * 100) : 0;

  const monthlyWinRate = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ data: [65, 59, 80, 81, 56, 72], color: () => colors.primary, strokeWidth: 2 }],
  };

  const betTypeDistribution = {
    labels: ["Football", "Basketball", "Tennis", "Other"],
    datasets: [{ data: [45, 25, 20, 10], color: () => colors.primary, strokeWidth: 2 }],
  };

  const profitLoss = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ data: [500, -200, 300, 700, -150, 950], color: (opacity = 1) => `rgba(221, 255, 0, ${opacity})`, strokeWidth: 2 }],
  };

  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "6", strokeWidth: "2", stroke: colors.primary },
  };

  // Memoizamos renderItem y keyExtractor para mejorar el rendimiento de FlatList
  const renderBetItem = useCallback(({ item }: { item: { participation: BetParticipation; bet: Bet } }) => (
    <BetCard
      bet={item.bet}
      userParticipation={item.participation}
      onPress={() => navigateToBet(item.bet.id)}
    />
  ), [navigateToBet]);

  const keyExtractor = useCallback((item: { participation: BetParticipation; bet: Bet }) => item.participation.id, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance</Text>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, activeTab === 'bets' && styles.tabActive]} onPress={() => setActiveTab('bets')}>
            <Text style={[styles.tabText, activeTab === 'bets' && styles.tabTextActive]}>My Bets</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'statistics' && styles.tabActive]} onPress={() => setActiveTab('statistics')}>
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
                <View style={[styles.progressBar, { width: `${winRate}%` }, winRate >= 50 ? styles.progressBarGood : styles.progressBarBad]} />
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
              {['all', 'active', 'won', 'lost'].map(f => (
                <TouchableOpacity key={f} style={[styles.filterButton, filter === f && styles.filterButtonActive]} onPress={() => setFilter(f as 'all' | 'active' | 'won' | 'lost')}>
                  <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
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
              keyExtractor={keyExtractor}
              renderItem={renderBetItem}
              getItemLayout={(_data, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              initialNumToRender={10}
              windowSize={5}
              removeClippedSubviews={true}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      ) : (
        <ScrollView style={styles.statisticsContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.statisticsContent}>
          {/* Estadísticas y gráficos (se omiten detalles para este ejemplo) */}
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
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Win Rate Trend</Text>
              <BarChart3 size={20} color={colors.primary} />
            </View>
            <ChartKit data={monthlyWinRate} width={width - 64} height={220} chartConfig={chartConfig} bezier style={styles.chart} />
          </Card>
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Bet Type Distribution</Text>
              <PieChart size={20} color={colors.primary} />
            </View>
            <ChartKit data={betTypeDistribution} width={width - 64} height={220} chartConfig={chartConfig} bezier style={styles.chart} />
          </Card>
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Profit/Loss</Text>
              <LineChart size={20} color={colors.primary} />
            </View>
            <ChartKit data={profitLoss} width={width - 64} height={220} chartConfig={chartConfig} bezier style={styles.chart} />
          </Card>
          {/* Se omiten los Recent Bets para este ejemplo */}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingVertical: 16 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 16 },
  tabs: { flexDirection: 'row', borderRadius: 12, backgroundColor: colors.card, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: colors.cardLight },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.text },
  statsContainer: { paddingHorizontal: 16, marginBottom: 24 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 12, alignItems: 'center', marginHorizontal: 4 },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 4 },
  statLabel: { fontSize: 12, color: colors.textSecondary },
  winRateContainer: { backgroundColor: colors.card, borderRadius: 12, padding: 16 },
  winRateHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  winRateLabel: { fontSize: 14, color: colors.textSecondary },
  winRateValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  progressBarContainer: { height: 8, backgroundColor: colors.cardLight, borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },
  progressBarGood: { backgroundColor: colors.success },
  progressBarBad: { backgroundColor: colors.error },
  filterContainer: { paddingHorizontal: 16, marginBottom: 16 },
  searchContainer: { marginBottom: 12 },
  searchInputContainer: { marginBottom: 0 },
  filterButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.card },
  filterButtonActive: { backgroundColor: colors.primary },
  filterText: { color: colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: '#000000' },
  listContent: { padding: 16, paddingBottom: 100 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  emptyCard: { alignItems: 'center', padding: 24, width: '100%' },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
  statisticsContainer: { flex: 1 },
  statisticsContent: { padding: 16, paddingBottom: 100 },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryCard: { flex: 1, marginHorizontal: 4, alignItems: 'center', padding: 12 },
  summaryIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(221, 255, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  summaryValue: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 },
  summaryLabel: { fontSize: 12, color: colors.textSecondary },
  chartCard: { marginBottom: 16, padding: 16 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  chartTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  chart: { marginVertical: 8, borderRadius: 16 },
  recentBetsContainer: { marginBottom: 16 },
  recentBetsTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 12 },
});
