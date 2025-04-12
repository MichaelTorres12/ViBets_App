// app/(tabs)/bets.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { useBetsStore } from '@/store/bets-store';
import { useAuth } from '@/store/auth-context';
import { useGroupsStore } from '@/store/groups-store';
import { BetCard } from '@/components/BetCard';
import { Clock, TrendingUp, Award, Ban, Search, DollarSign, Percent, Trophy, LineChart, ArrowUpRight } from 'lucide-react-native';
import { colors as constantColors } from '@/constants/colors';

// Componente para gráfico lineal simple (mock)
const LineChartMock = ({ color, data = [62, 58, 80, 82, 55, 70] }) => (
  <View style={styles.chartContainer}>
    <View style={styles.gridLines}>
      {[0, 1, 2, 3].map((_, i) => (
        <View key={i} style={styles.gridLine} />
      ))}
    </View>
    <View style={styles.lineContainer}>
      {data.map((value, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <View
              style={[
                styles.lineSegment,
                {
                  left: `${(index - 1) * (100 / (data.length - 1))}%`,
                  width: `${100 / (data.length - 1)}%`,
                  bottom: `${data[index - 1]}%`,
                  height: `${Math.abs(data[index] - data[index - 1])}%`,
                  backgroundColor: 'transparent',
                  borderTopWidth: data[index] > data[index - 1] ? 2 : 0,
                  borderBottomWidth: data[index] < data[index - 1] ? 2 : 0,
                  borderColor: color,
                },
              ]}
            />
          )}
          <View
            style={[
              styles.dataPoint,
              {
                left: `${index * (100 / (data.length - 1))}%`,
                bottom: `${value}%`,
                backgroundColor: color,
              },
            ]}
          />
        </React.Fragment>
      ))}
    </View>
  </View>
);

// Componente mejorado para gráfico de barras
const BarChartMock = ({ wins, losses, winColor = '#4CAF50', lossColor = '#F44336' }) => {
  const maxValue = Math.max(wins, losses, 1); // Evitar división por cero
  const winBarHeight = (wins / maxValue) * 100;
  const lossBarHeight = (losses / maxValue) * 100;
  const { t } = useLanguage();

  return (
    <View style={{ 
      flexDirection: 'row', 
      height: 220, // Reducir la altura total para evitar sobreposición
      alignItems: 'flex-end', 
      justifyContent: 'space-around',
      marginTop: 10, // Añadir margen superior para separar del título
      paddingBottom: 24 // Espacio para las etiquetas inferiores
    }}>
      <View style={{ alignItems: 'center' }}>
        <View 
          style={{ 
            height: `${winBarHeight}%`, 
            width: 100, 
            backgroundColor: winColor, 
            borderRadius: 4,
            maxHeight: 220 // Limitar altura máxima
          }} 
        />
        <Text style={{ marginTop: 8, color: winColor, fontWeight: 'bold', position: 'absolute', bottom: -24 }}>
        {t('wins') || 'Wins'} ({wins})
        </Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <View 
          style={{ 
            height: `${lossBarHeight}%`, 
            width: 100, 
            backgroundColor: lossColor, 
            borderRadius: 4,
            maxHeight: 220 // Limitar altura máxima
          }} 
        />
        <Text style={{ marginTop: 8, color: lossColor, fontWeight: 'bold', position: 'absolute', bottom: -24 }}>
        {t('lost') || 'Lost'} ({losses})
        </Text>
      </View>
    </View>
  );
};


// Componente para tarjeta de apuesta reciente
const RecentBetCard = ({ match, result, odds, stake, profit, status }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.recentBetCard, { backgroundColor: colors.card }]}>
      <View style={styles.recentBetHeader}>
        <Text style={[styles.recentBetDate, { color: colors.textSecondary }]}>Today</Text>
        <View style={[
          styles.statusPill, 
          { backgroundColor: status === 'Win' ? '#4CAF50' : status === 'Loss' ? '#F44336' : colors.card }
        ]}>
          <Text style={styles.statusPillText}>{status}</Text>
        </View>
      </View>
      
      <View style={styles.matchContainer}>
        <Text style={[styles.teamName, { color: colors.text }]}>{match.teamA}</Text>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreText, { color: colors.text }]}>{result}</Text>
          <Text style={[styles.resultType, { color: colors.textSecondary }]}>FT</Text>
        </View>
        <Text style={[styles.teamName, { color: colors.text }]}>{match.teamB}</Text>
      </View>
      
      <View style={styles.betDetailsContainer}>
        <View style={styles.betDetailItem}>
          <Text style={[styles.betDetailLabel, { color: colors.textSecondary }]}>Odds</Text>
          <Text style={[styles.betDetailValue, { color: colors.text }]}>{odds}</Text>
        </View>
        
        <View style={styles.betDetailItem}>
          <Text style={[styles.betDetailLabel, { color: colors.textSecondary }]}>Stake</Text>
          <Text style={[styles.betDetailValue, { color: colors.text }]}>${stake}</Text>
        </View>
        
        <Text style={[
          styles.profitText, 
          { color: profit > 0 ? '#4CAF50' : '#F44336' }
        ]}>
          {profit > 0 ? '+' : ''}{profit}
        </Text>
      </View>
    </View>
  );
};

export default function BetsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { bets, fetchBets, fetchUserBets, loading } = useBetsStore();
  const { getGroupById } = useGroupsStore();
  
  const [activeTab, setActiveTab] = useState('all');
  const [activeView, setActiveView] = useState('myBets');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cargar apuestas al iniciar y cuando cambie el usuario
  useEffect(() => {
    if (user) {
      console.log("Cargando apuestas para usuario:", user.id);
      fetchUserBets(user.id);
    }
  }, [user, fetchUserBets]);

  // Calcular estadísticas basadas en el campo winner
  const stats = useMemo(() => {
    if (!bets || !user) return { 
      total: 0, 
      won: 0, 
      lost: 0, 
      active: 0, 
      winRate: 0,
      totalProfit: 0,
      winRateByMonth: [62, 58, 80, 82, 55, 70],
      profitByMonth: [100, 200, -50, 300, 150, 250],
    };
    
    console.log("Calculando estadísticas con", bets.length, "apuestas");
    
    // Filtrar apuestas en las que el usuario participó
    const userBets = bets.filter(bet => 
      bet.participations?.some(p => (p.userId === user.id || p.user_id === user.id)) ||
      bet.winner === user.id
    );
    
    // Apuestas que ganó el usuario (donde él es el winner)
    const won = userBets.filter(bet => bet.status === 'settled' && bet.winner === user.id).length;
    
    // Apuestas activas en las que el usuario participó
    const active = userBets.filter(bet => bet.status === 'open').length;
    
    // Apuestas cerradas en las que participó pero no ganó
    const lost = userBets.filter(bet => 
      bet.status === 'settled' && 
      bet.winner && 
      bet.winner !== user.id &&
      bet.participations?.some(p => p.userId === user.id || p.user_id === user.id)
    ).length;
    
    // Calcular estadísticas
    const total = userBets.length;
    
    // NUEVA FÓRMULA: (Ganadas / Total) * 100 en lugar de (Ganadas / Completadas) * 100
    const winRate = total > 0 ? (won / total * 100) : 0;
    
    console.log(`Estadísticas: Total: ${total}, Won: ${won}, Lost: ${lost}, Active: ${active}, WinRate: ${winRate}%`);
    
    return { 
      total, 
      won, 
      lost, 
      active, 
      winRate,
      totalProfit: 1250, // Mock para demostración
      winRateByMonth: [62, 58, 80, 82, 55, 70],
      profitByMonth: [100, 200, -50, 300, 150, 250],
    };
  }, [bets, user]);

  // Filtrar apuestas según la pestaña activa y la búsqueda
  const filteredBets = useMemo(() => {
    if (!bets || !user) return [];
    
    console.log(`Filtrando ${bets.length} apuestas para tab: ${activeTab}`);
    
    let filtered = [...bets];
    
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter(bet => bet.status === 'open');
        break;
      case 'won':
        // Apuestas donde el usuario es explícitamente el ganador
        filtered = filtered.filter(bet => bet.status === 'settled' && bet.winner === user.id);
        break;
      case 'lost':
        // Apuestas donde el usuario participó pero no ganó
        filtered = filtered.filter(bet => 
          bet.status === 'settled' && 
          bet.winner && 
          bet.winner !== user.id &&
          bet.participations?.some(p => p.userId === user.id || p.user_id === user.id)
        );
        break;
      case 'mine':
        filtered = filtered.filter(bet => 
          bet.participations?.some(p => p.userId === user.id || p.user_id === user.id)
        );
        break;
      // La pestaña 'all' no necesita filtrado adicional
    }
    
    console.log(`Después de filtrar por tab: ${filtered.length} apuestas`);
    
    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bet => 
        bet.title?.toLowerCase().includes(query) ||
        bet.description?.toLowerCase().includes(query)
      );
    }
    
    // Ordenar de la más reciente a la más antigua
    filtered.sort((a, b) => {
      // Primero intentamos usar created_at
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      
      // Si ambas tienen created_at, ordenamos por esa fecha
      if (dateA && dateB) {
        return dateB - dateA; // Orden descendente (más reciente primero)
      }
      
      // Si no tienen created_at, intentamos con end_date
      const endDateA = a.end_date ? new Date(a.end_date).getTime() : 0;
      const endDateB = b.end_date ? new Date(b.end_date).getTime() : 0;
      
      if (endDateA && endDateB) {
        return dateB - dateA; // Orden descendente
      }
      
      // Si no tienen ninguna fecha, mantenemos el orden actual
      return 0;
    });
    
    return filtered;
  }, [bets, activeTab, user, searchQuery]);

  const handleBetPress = (betId: string) => {
    const bet = bets.find(b => b.id === betId);
    if (bet && bet.group_id) {
      router.push(`/groups/${bet.group_id}/bet/${betId}`);
    } else {
      router.push(`/bets/${betId}`);
    }
  };

  // Componente para botón de filtro
  const FilterButton = ({ title, active, onPress }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        active && { backgroundColor: '#DDFF00', borderColor: '#DDFF00' }
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterButtonText,
        { color: active ? '#000' : colors.text }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  // Componente para botón de pestaña principal
  const MainTabButton = ({ title, active, onPress }) => (
    <TouchableOpacity
      style={[
        styles.mainTabButton,
        active && { backgroundColor: colors.primary }
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.mainTabButtonText, 
        { color: active ? colors.textInverted : colors.text }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  // Vista de estadísticas
  const renderStatisticsView = () => (
    <ScrollView contentContainerStyle={styles.statisticsContainer}>
      <View style={styles.statsGrid}>
        <View style={[styles.statCardLarge, { backgroundColor: colors.card }]}>
          <TrendingUp size={20} color="#DDFF00" style={styles.statIcon} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.winRate.toFixed(1)}%</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('winRate') || 'Win Rate'}</Text>
        </View>
        <View style={[styles.statCardLarge, { backgroundColor: colors.card }]}>
          <Trophy size={20} color="#DDFF00" style={styles.statIcon} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.won}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('won') || 'Wins'}</Text>
        </View>
        <View style={[styles.statCardLarge, { backgroundColor: colors.card }]}>
          <DollarSign size={20} color="#DDFF00" style={styles.statIcon} />
          <Text style={[styles.statValue, { color: colors.text }]}>${stats.totalProfit}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('totalProfit') || 'Total Profit'}</Text>
        </View>
      </View>
      
      <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
      <View style={styles.chartHeader}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>{t('profitLoss') || 'Profit/Loss'}</Text>
        <ArrowUpRight size={18} color="#DDFF00" />
      </View>
      <BarChartMock wins={stats.won} losses={stats.lost} />
    </View>

    </ScrollView>
  );

  // Vista de My Bets
  const renderMyBetsView = () => (
    <View>
      <View style={styles.statsRow}>
        <View style={[styles.smallStatCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.smallStatValue, { color: colors.text }]}>{stats.total}</Text>
          <Text style={[styles.smallStatLabel, { color: colors.textSecondary }]}>{t('totalBets') || 'Total Bets'}</Text>
        </View>
        <View style={[styles.smallStatCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.smallStatValue, { color: '#4CAF50' }]}>{stats.won}</Text>
          <Text style={[styles.smallStatLabel, { color: colors.textSecondary }]}>{t('won') || 'Won'}</Text>
        </View>
        <View style={[styles.smallStatCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.smallStatValue, { color: '#F44336' }]}>{stats.lost}</Text>
          <Text style={[styles.smallStatLabel, { color: colors.textSecondary }]}>{t('lost') || 'Lost'}</Text>
        </View>
      </View>
      
      <View style={[styles.winRateCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.winRateLabel, { color: colors.textSecondary }]}>{t('winRate') || 'Win Rate'}</Text>
        <Text style={[styles.winRateValue, { color: colors.text }]}>{stats.winRate.toFixed(1)}%</Text>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Search size={16} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('searchBets') || 'Search bets...'}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.filtersContainer}>
        <FilterButton title={t('all') || 'All'} active={activeTab === 'all'} onPress={() => setActiveTab('all')} />
        <FilterButton title={t('active') || 'Active'} active={activeTab === 'active'} onPress={() => setActiveTab('active')} />
        <FilterButton title={t('won') || 'Won'} active={activeTab === 'won'} onPress={() => setActiveTab('won')} />
        <FilterButton title={t('lost') || 'Lost'} active={activeTab === 'lost'} onPress={() => setActiveTab('lost')} />
      </View>
      
      <FlatList
        scrollEnabled={false}
        data={filteredBets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.betsList}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
            <View style={styles.trophyIconContainer}>
              <Trophy size={32} color="#DDFF00" />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('noBetsFound') || 'No bets found'}</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noBetsDescription') || "You haven't placed any bets yet. Join a group and start betting!"}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const userParticipation = item.participations?.find(p => p.userId === user?.id || p.user_id === user?.id);
  return (
            <BetCard
              bet={item}
              userParticipation={userParticipation}
              onPress={() => handleBetPress(item.id)}
            />
          );
        }}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: constantColors.background }]}>
      {/* Fixed header section */}
      <View style={[styles.fixedHeaderContainer, { backgroundColor: constantColors.background }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('performance') || 'Performance'}</Text>
        </View> 
        
        <View style={styles.mainTabsContainer}>
          <MainTabButton title={t('myBets') || 'My Bets'} active={activeView === 'myBets'} onPress={() => setActiveView('myBets')} />
          <MainTabButton title={t('statistics') || 'Statistics'} active={activeView === 'statistics'} onPress={() => setActiveView('statistics')} />
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView 
        style={styles.scrollableContent}
        showsVerticalScrollIndicator={false}
      >
        {activeView === 'myBets' ? renderMyBetsView() : renderStatisticsView()}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helpers
function formatDate(dateStr?: string) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeaderContainer: {
    backgroundColor: constantColors.background,
    paddingTop: 20,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    // Usa colors.text del theme; si no está disponible, reemplaza con un valor fijo
    color: constantColors.text,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  mainTabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    padding: 4,
  },
  mainTabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  mainTabButtonText: {
    fontWeight: '600',
  },
  statisticsContainer: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCardLarge: {
    width: '31%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartContainer: {
    height: 140,
    position: 'relative',
  },
  gridLines: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  gridLine: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    position: 'absolute',
  },
  lineContainer: {
    height: '100%',
    width: '100%',
    position: 'absolute',
  },
  lineSegment: {
    position: 'absolute',
  },
  dataPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    transform: [{ translateX: -4 }, { translateY: 4 }],
  },
  chartMonths: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  monthLabel: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  recentBetCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recentBetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recentBetDate: {
    fontSize: 14,
  },
  statusPill: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultType: {
    fontSize: 12,
  },
  betDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  betDetailItem: {
    marginRight: 16,
  },
  betDetailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  betDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  profitText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  // Estilos para la vista de Mis Apuestas
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  smallStatCard: {
    width: '32%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  smallStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  smallStatLabel: {
    fontSize: 12,
  },
  winRateCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  winRateLabel: {
    fontSize: 14,
  },
  winRateValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 60,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterButtonText: {
    fontWeight: '600',
  },
  betsList: {
    padding: 16,
    paddingTop: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 12,
  },
  trophyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(221, 255, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  scrollableContent: {
    flex: 1,
  },
});
