//components/group/GroupLeaderboard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Medal, Clock, Crown } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Group } from '@/types';

interface GroupLeaderboardProps {
  group: Group;
}

// Estructura para el usuario en el leaderboard
interface LeaderboardUser {
  id: string;
  username: string;
  coins: number;
  rank: number;
  avatar?: string;
}

export function GroupLeaderboard({ group }: GroupLeaderboardProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [period, setPeriod] = useState<'month' | 'allTime'>('month');
  const [daysToMonthEnd, setDaysToMonthEnd] = useState<number>(0);
  const [daysToYearEnd, setDaysToYearEnd] = useState<number>(0);

  // Calcular los días restantes hasta el fin de mes y año
  useEffect(() => {
    const calculateDaysRemaining = () => {
      const today = new Date();
      
      // Para el último día del mes actual
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const monthDiffTime = lastDayOfMonth.getTime() - today.getTime();
      const monthDiffDays = Math.ceil(monthDiffTime / (1000 * 60 * 60 * 24));
      setDaysToMonthEnd(monthDiffDays);
      
      // Para el último día del año actual
      const lastDayOfYear = new Date(today.getFullYear(), 11, 31);
      const yearDiffTime = lastDayOfYear.getTime() - today.getTime();
      const yearDiffDays = Math.ceil(yearDiffTime / (1000 * 60 * 60 * 24));
      setDaysToYearEnd(yearDiffDays);
    };

    calculateDaysRemaining();
    
    // Actualizar cada día
    const dayInterval = setInterval(calculateDaysRemaining, 86400000);
    
    return () => clearInterval(dayInterval);
  }, []);

  // Ordenamos los miembros por cantidad de monedas para el leaderboard
  const leaderboardData: LeaderboardUser[] = group.members
    .map((member, index) => ({
      id: member.userId,
      username: member.username || `User ${member.userId.substring(0, 4)}`,
      coins: member.groupCoins,
      rank: index + 1,
      avatar: undefined
    }))
    .sort((a, b) => b.coins - a.coins)
    .map((user, index) => ({ ...user, rank: index + 1 }));

  // Componente para los primeros 3 puestos (podio)
  const renderPodium = () => {
    const top3 = leaderboardData.slice(0, 3);
    // Si no hay suficientes usuarios, llenamos con posiciones vacías
    while (top3.length < 3) {
      top3.push({ id: `empty-${top3.length}`, username: '', coins: 0, rank: top3.length + 1 });
    }

    // Ordenamos para que el 1er lugar esté en el medio, 2do a la izquierda y 3ro a la derecha
    const [second, first, third] = [top3[1], top3[0], top3[2]];

    const podiumColors = {
      first: '#FFDD65', // Gold/Yellow
      second: '#A8E0FF', // Light Blue
      third: '#FFE5CC', // Light Orange/Peach
    };

    return (
      <View style={styles.podiumContainer}>
        {/* Segundo Lugar */}
        <View style={styles.podiumPosition}>
          <View style={[styles.podiumBlock, { height: 175, backgroundColor: podiumColors.second }]}>
            <Text style={styles.rankNumber}>2</Text>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                {second.username ? (
                  second.avatar ? (
                    <Image source={{ uri: second.avatar }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {second.username.charAt(0).toUpperCase()}
                    </Text>
                  )
                ) : (
                  <Text style={styles.avatarText}>?</Text>
                )}
              </View>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {second.username || '-'}
            </Text>
            <Text style={styles.podiumCoins}>
              {second.coins}
            </Text>
          </View>
        </View>

        {/* Primer Lugar */}
        <View style={styles.podiumPosition}>
          <View style={[styles.podiumBlock, { height: 200, backgroundColor: podiumColors.first }]}>
            <Text style={styles.rankNumber}>1</Text>
            <View style={styles.avatarContainer}>
              <View style={styles.crownContainer}>
                <Crown size={35} color="#000" style={styles.crownIcon} />
              </View>
              <View style={styles.avatar}>
                {first.username ? (
                  first.avatar ? (
                    <Image source={{ uri: first.avatar }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {first.username.charAt(0).toUpperCase()}
                    </Text>
                  )
                ) : (
                  <Text style={styles.avatarText}>?</Text>
                )}
              </View>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {first.username || '-'}
            </Text>
            <Text style={styles.podiumCoins}>
              {first.coins}
            </Text>
          </View>
        </View>

        {/* Tercer Lugar */}
        <View style={styles.podiumPosition}>
          <View style={[styles.podiumBlock, { height: 150, backgroundColor: podiumColors.third }]}>
            <Text style={styles.rankNumber}>3</Text>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                {third.username ? (
                  third.avatar ? (
                    <Image source={{ uri: third.avatar }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {third.username.charAt(0).toUpperCase()}
                    </Text>
                  )
                ) : (
                  <Text style={styles.avatarText}>?</Text>
                )}
              </View>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {third.username || '-'}
            </Text>
            <Text style={styles.podiumCoins}>
              {third.coins}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderUserRank = ({ item, index }: { item: LeaderboardUser; index: number }) => {
    // No mostrar en la lista a los primeros 3, ya que están en el podio
    if (index < 3) return null;

    return (
      <Card style={styles.rankCard}>
        <View style={styles.rankNumberContainer}>
          <Text style={[styles.listRankNumber, { color: colors.text }]}>
            {item.rank}
          </Text>
          {item.rank <= 3 && (
            <View style={[styles.medalIcon, { 
              backgroundColor: item.rank === 1 
                ? '#FFD700' 
                : item.rank === 2 
                ? '#C0C0C0' 
                : '#CD7F32' 
            }]}>
              <Medal size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
        
        <View style={styles.userInfo}>
          <View style={[styles.smallAvatar, { backgroundColor: colors.background }]}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.smallAvatarText, { color: colors.text }]}>
                {item.username.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={[styles.username, { color: colors.text }]}>
            {item.username}
          </Text>
        </View>
        
        <Text style={[styles.coins, { color: colors.primary }]}>
          {item.coins}
        </Text>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('leaderboard') || 'Leaderboard'}
        </Text>
        <View style={styles.timeLeftContainer}>
          <Clock size={16} color={colors.primary} />
          <Text style={[styles.timeLeftText, { color: colors.primary }]}>
            {period === 'month' ? daysToMonthEnd : daysToYearEnd} {t('daysToGo') || 'days to go'}
          </Text>
        </View>
      </View>

      {/* Periodo del leaderboard */}
      <View style={styles.periodContainer}>
        <Pressable 
          style={[
            styles.periodButton, 
            period === 'month' && { backgroundColor: colors.primaryLight }
          ]}
          onPress={() => setPeriod('month')}
        >
          <Text style={[
            styles.periodText, 
            { color: period === 'month' ? colors.textInverted : colors.textSecondary }
          ]}>
            {t('thisMonth') || 'This Month'}
          </Text>
        </Pressable>
        <Pressable 
          style={[
            styles.periodButton, 
            period === 'allTime' && { backgroundColor: colors.primaryLight }
          ]}
          onPress={() => setPeriod('allTime')}
        >
          <Text style={[
            styles.periodText, 
            { color: period === 'allTime' ? colors.textInverted : colors.textSecondary }
          ]}>
            {t('allTime') || 'All Time'}
          </Text>
        </Pressable>
      </View>

      {/* Podio con los 3 primeros */}
      {renderPodium()}

      {/* Lista del resto de usuarios */}
      <FlatList
        data={leaderboardData}
        renderItem={renderUserRank}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.rankingsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 16,
    marginTop: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  timeLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeLeftText: {
    fontSize: 14,
    fontWeight: '500',
  },
  periodContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  periodText: {
    fontWeight: '500',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    marginBottom: 0,
  },
  podiumPosition: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  podiumBlock: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    opacity: 0.7,
  },
  avatarContainer: {
    marginVertical: 8,
  },
  crownContainer: {
    position: 'absolute',
    top: -20,
    zIndex: 10,
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownIcon: {
    shadowColor: '#e0f542',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#555',
  },
  podiumName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#000',
    opacity: 0.8,
    width: '100%',
  },
  podiumCoins: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    opacity: 0.7,
  },
  rankingsList: {
    padding: 10,
    gap: 8,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  rankNumberContainer: {
    width: 30,
    alignItems: 'center',
    position: 'relative',
  },
  listRankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  medalIcon: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 8,
  },
  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
  },
  coins: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 