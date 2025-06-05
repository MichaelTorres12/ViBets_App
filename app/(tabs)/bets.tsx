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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { useBetsStore } from '@/store/bets-store';
import { useAuth } from '@/store/auth-context';
import { useGroupsStore } from '@/store/groups-store';
import { BetCard } from '@/components/BetCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, TrendingUp, Award, Ban, Search, DollarSign, Percent, Trophy, LineChart, ArrowUpRight } from 'lucide-react-native';

// Componente para gráfico lineal simple (mock)
const LineChartMock = ({ color, data = [62, 58, 80, 82, 55, 70] }) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.chartContainer}>
      <View style={styles.gridLines}>
        {[0, 1, 2, 3].map((_, i) => (
          <View key={i} style={[styles.gridLine, { backgroundColor: `${colors.text}15` }]} />
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
};

// Componente mejorado para gráfico de barras
const BarChartMock = ({ wins, losses, winColor = '#4CAF50', lossColor = '#F44336' }) => {
  const maxValue = Math.max(wins, losses, 1); // Evitar división por cero
  const winBarHeight = (wins / maxValue) * 100;
  const lossBarHeight = (losses / maxValue) * 100;
  const { t } = useLanguage();
  const { colors } = useTheme();

  return (
    <View style={{ 
      flexDirection: 'row', 
      height: 140, // Altura reducida para evitar sobreposición
      alignItems: 'flex-end', 
      justifyContent: 'space-around',
      marginTop: 16, // Margen superior para separar del título
      maxHeight: 120, // Limitar altura máxima
      paddingBottom: 24, // Espacio para las etiquetas
      position: 'relative'
    }}>
      <View style={{ alignItems: 'center' }}>
        <View 
          style={{ 
            height: `${winBarHeight}%`, 
            width: 80, 
            backgroundColor: winColor, 
            borderRadius: 4,
            maxHeight: 120 // Limitar altura máxima
          }} 
        />
        <Text style={{ 
          marginTop: 8, 
          color: winColor, 
          fontWeight: 'bold', 
          position: 'absolute', 
          bottom: -24,
          fontSize: 12 
        }}>
          {t('wins') || 'Wins'} ({wins})
        </Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <View 
          style={{ 
            height: `${lossBarHeight}%`, 
            width: 80, 
            backgroundColor: lossColor, 
            borderRadius: 4,
            maxHeight: 120 // Limitar altura máxima
          }} 
        />
        <Text style={{ 
          marginTop: 8, 
          color: lossColor, 
          fontWeight: 'bold', 
          position: 'absolute', 
          bottom: -24,
          fontSize: 12 
        }}>
          {t('lost') || 'Lost'} ({losses})
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
      fetchUserBets(user.id);
    }
  }, [user, fetchUserBets]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (!bets || !user) return { 
      total: 0, 
      won: 0, 
      lost: 0, 
      active: 0,
      winRate: 0,
      totalProfit: 0,
      roi: 0,
      winRateByMonth: [62, 58, 80, 82, 55, 70],
      profitByMonth: [100, 200, -50, 300, 150, 250],
    };
    
    // Filtrar predicciones en las que el usuario participó
    const userBets = bets.filter(bet => 
      bet.participations?.some(p => (p.userId === user.id || p.user_id === user.id))
    );
    
    // Predicciones activas en las que el usuario participó
    const active = userBets.filter(bet => bet.status === 'open').length;
    
    // Predicciones que ganó el usuario (donde su opción coincide con la opción ganadora)
    const won = userBets.filter(bet => {
      if (bet.status !== 'settled' || !bet.settled_option) return false;
      
      // Encuentra la participación del usuario
      const userPart = bet.participations?.find(p => 
        p.userId === user.id || p.user_id === user.id
      );
      
      // Si la opción elegida por el usuario es la opción ganadora
      return userPart && (userPart.optionId === bet.settled_option || userPart.option_id === bet.settled_option);
    }).length;
    
    // Predicciones perdidas por el usuario
    const lost = userBets.filter(bet => {
      if (bet.status !== 'settled' || !bet.settled_option) return false;
      
      // Encuentra la participación del usuario
      const userPart = bet.participations?.find(p => 
        p.userId === user.id || p.user_id === user.id
      );
      
      // Si la opción elegida por el usuario NO es la opción ganadora
      return userPart && (userPart.optionId !== bet.settled_option && userPart.option_id !== bet.settled_option);
    }).length;
    
    // Calcular estadísticas
    const total = userBets.length;
    const settled = won + lost; // Total de apuestas con resultado
    
    // (Ganadas / Total de finalizadas) * 100
    const winRate = settled > 0 ? (won / settled * 100) : 0;
    
    // Calcular ganancia total aproximada
    let totalProfit = 0;
    let totalInvested = 0;
    let totalReturned = 0;
    
    userBets.forEach(bet => {
      const userPart = bet.participations?.find(p => 
        p.userId === user.id || p.user_id === user.id
      );
      
      if (!userPart) return;
      
      // Aseguramos que amount sea un número válido
      const amount = typeof userPart.amount === 'number' ? userPart.amount : 
                    (parseInt(userPart.amount) || 0);
      
      if (amount <= 0) return; // Skip if invalid amount
      
      totalInvested += amount;
      
      // Si la apuesta está resuelta y el usuario ganó
      if (bet.status === 'settled' && bet.settled_option && 
          (userPart.optionId === bet.settled_option || userPart.option_id === bet.settled_option)) {
        // Encontrar el odds de la opción ganada
        const winningOption = bet.options?.find(opt => opt.id === bet.settled_option);
        
        if (winningOption && typeof winningOption.odd === 'number' && winningOption.odd > 0) {
          totalReturned += amount * winningOption.odd;
        } else {
          // Si no podemos encontrar odds, al menos devolvemos la apuesta (1:1)
          totalReturned += amount;
        }
      }
    });
    
    console.log(`ROI calculation: Invested ${totalInvested}, Returned ${totalReturned}`);
    
    // Calcular ROI con prevención de NaN
    let roi = 0;
    if (totalInvested > 0) {
      roi = ((totalReturned - totalInvested) / totalInvested) * 100;
    }
    
    // Verificar validez del ROI
    if (isNaN(roi) || !isFinite(roi)) {
      roi = 0;
    }
    
    return { 
      total, 
      won, 
      lost, 
      active, 
      winRate,
      totalProfit: Math.round(totalProfit),
      roi: Math.round(roi * 10) / 10, // ROI redondeado a 1 decimal
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
        // Predicciones donde el usuario es explícitamente el ganador
        filtered = filtered.filter(bet => {
          if (bet.status !== 'settled' || !bet.settled_option) return false;
          
          // Encuentra la participación del usuario
          const userPart = bet.participations?.find(p => 
            p.userId === user.id || p.user_id === user.id
          );
          
          // Si la opción elegida por el usuario es la opción ganadora
          return userPart && (userPart.optionId === bet.settled_option || userPart.option_id === bet.settled_option);
        });
        break;
      case 'lost':
        // Predicciones donde el usuario participó pero no ganó
        filtered = filtered.filter(bet => {
          if (bet.status !== 'settled' || !bet.settled_option) return false;
          
          // Encuentra la participación del usuario
          const userPart = bet.participations?.find(p => 
            p.userId === user.id || p.user_id === user.id
          );
          
          // Si la opción elegida por el usuario NO es la opción ganadora
          return userPart && (userPart.optionId !== bet.settled_option && userPart.option_id !== bet.settled_option);
        });
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
        { 
          backgroundColor: active ? colors.primary : 'transparent',
          borderColor: active ? colors.primary : colors.border
        }
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterButtonText,
        { color: active ? colors.textInverted : colors.text }
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
        { backgroundColor: active ? colors.primary : 'transparent' }
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
        <View style={[styles.statCardLarge, { 
          backgroundColor: colors.card,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }]}>
          <View style={[styles.statIconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <TrendingUp size={20} color={colors.primary} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.winRate.toFixed(1)}%</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('winRate') || 'Win Rate'}</Text>
        </View>
        
        <View style={[styles.statCardLarge, { 
          backgroundColor: colors.card,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }]}>
          <View style={[styles.statIconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <Trophy size={20} color={colors.primary} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.won}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('won') || 'Wins'}</Text>
        </View>
        
        <View style={[styles.statCardLarge, { 
          backgroundColor: colors.card,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }]}>
          <View style={[styles.statIconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <Percent size={20} color={colors.primary} />
          </View>
          <Text style={[styles.statValue, { 
            color: stats.roi >= 0 ? colors.success : colors.error 
          }]}>
            {isNaN(stats.roi) ? '0.0' : 
             stats.roi > 0 ? `+${stats.roi}` : `${stats.roi}`}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t('roi') || 'ROI'}
          </Text>
        </View>
      </View>
      
      <View style={[styles.chartCard, { 
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }]}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>{t('profitLoss') || 'Profit/Loss'}</Text>
          <ArrowUpRight size={18} color={colors.primary} />
        </View>
        <BarChartMock wins={stats.won} losses={stats.lost} />
      </View>
    </ScrollView>
  );

  // Vista de My Bets
  const renderMyBetsView = () => (
    <View>
      <View style={styles.statsRow}>
        <View style={[styles.smallStatCard, { 
          backgroundColor: colors.card,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }]}>
          <Text style={[styles.smallStatValue, { color: colors.text }]}>{stats.total}</Text>
          <Text style={[styles.smallStatLabel, { color: colors.textSecondary }]}>{t('totalBets') || 'Total Bets'}</Text>
        </View>
        
        <View style={[styles.smallStatCard, { 
          backgroundColor: colors.card,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }]}>
          <Text style={[styles.smallStatValue, { color: colors.success }]}>{stats.won}</Text>
          <Text style={[styles.smallStatLabel, { color: colors.textSecondary }]}>{t('won') || 'Won'}</Text>
        </View>
        
        <View style={[styles.smallStatCard, { 
          backgroundColor: colors.card,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }]}>
          <Text style={[styles.smallStatValue, { color: colors.error }]}>{stats.lost}</Text>
          <Text style={[styles.smallStatLabel, { color: colors.textSecondary }]}>{t('lost') || 'Lost'}</Text>
        </View>
      </View>
      
      <View style={[styles.winRateCard, { 
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }]}>
        <Text style={[styles.winRateLabel, { color: colors.textSecondary }]}>{t('winRate') || 'Win Rate'}</Text>
        <Text style={[styles.winRateValue, { color: colors.text }]}>{stats.winRate.toFixed(1)}%</Text>
      </View>
      
      <View style={[styles.searchContainer, { 
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
      }]}>
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
          <View style={[styles.emptyContainer, { 
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }]}>
            <View style={[styles.trophyIconContainer, { backgroundColor: `${colors.primary}15` }]}>
              <Trophy size={32} color={colors.primary} />
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Fixed header section */}
      <View style={[styles.fixedHeaderContainer, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('performance') || 'Performance'}</Text>
        </View> 
        
        <View style={[styles.mainTabsContainer, { backgroundColor: colors.cardLight }]}>
          <MainTabButton title={t('myBets') || 'My Bets'} active={activeView === 'myBets'} onPress={() => setActiveView('myBets')} />
          <MainTabButton title={t('statistics') || 'Statistics'} active={activeView === 'statistics'} onPress={() => setActiveView('statistics')} />
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView 
        style={styles.scrollableContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {activeView === 'myBets' ? renderMyBetsView() : renderStatisticsView()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeaderContainer: {
    paddingTop: 8,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  mainTabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
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
    marginTop: 8,
  },
  statCardLarge: {
    width: '31%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  // Estilos para la vista de Mis Predicciones
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  smallStatCard: {
    width: '31%',
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
    padding: 16,
    marginBottom: 16,
  },
  winRateLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  winRateValue: {
    fontSize: 22,
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
    height: 50,
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
  },
  filterButtonText: {
    fontWeight: '600',
    fontSize: 13,
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
    marginVertical: 8,
  },
  trophyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    maxWidth: '80%',
    lineHeight: 20,
  },
  scrollableContent: {
    flex: 1,
  },
});
