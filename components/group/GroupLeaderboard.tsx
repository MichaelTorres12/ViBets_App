import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import { Medal } from 'lucide-react-native';
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

  // Ordenamos los miembros por cantidad de monedas para el leaderboard
  const leaderboardData: LeaderboardUser[] = group.members
    .map((member, index) => ({
      id: member.userId,
      username: member.username || `User ${member.userId.substring(0, 4)}`,
      coins: member.groupCoins,
      rank: index + 1,
      avatar: undefined // Podrías agregar avatares si tienes esta información
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

    return (
      <View style={styles.podiumContainer}>
        {/* Segundo Lugar */}
        <View style={styles.podiumPosition}>
          <View style={[styles.avatar, { backgroundColor: colors.card }]}>
            {second.username ? (
              second.avatar ? (
                <Image source={{ uri: second.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarText, { color: colors.text }]}>
                  {second.username.charAt(0).toUpperCase()}
                </Text>
              )
            ) : (
              <Text style={[styles.avatarText, { color: colors.text }]}>?</Text>
            )}
            <View style={[styles.medalBadge, { backgroundColor: '#C0C0C0' }]}>
              <Text style={styles.medalText}>2</Text>
            </View>
          </View>
          {second.username && (
            <>
              <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>
                {second.username}
              </Text>
              <Text style={[styles.podiumCoins, { color: colors.textSecondary }]}>
                {second.coins}
              </Text>
            </>
          )}
          <View style={[styles.podiumBar, { 
            backgroundColor: colors.card, 
            height: 60,
          }]} />
        </View>

        {/* Primer Lugar */}
        <View style={styles.podiumPosition}>
          <View style={[styles.avatar, { backgroundColor: colors.card }]}>
            {first.username ? (
              first.avatar ? (
                <Image source={{ uri: first.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarText, { color: colors.text }]}>
                  {first.username.charAt(0).toUpperCase()}
                </Text>
              )
            ) : (
              <Text style={[styles.avatarText, { color: colors.text }]}>?</Text>
            )}
            <View style={[styles.medalBadge, { backgroundColor: '#FFD700' }]}>
              <Text style={styles.medalText}>1</Text>
            </View>
          </View>
          {first.username && (
            <>
              <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>
                {first.username}
              </Text>
              <Text style={[styles.podiumCoins, { color: colors.textSecondary }]}>
                {first.coins}
              </Text>
            </>
          )}
          <View style={[styles.podiumBar, { 
            backgroundColor: colors.card, 
            height: 80
          }]} />
        </View>

        {/* Tercer Lugar */}
        <View style={styles.podiumPosition}>
          <View style={[styles.avatar, { backgroundColor: colors.card }]}>
            {third.username ? (
              third.avatar ? (
                <Image source={{ uri: third.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarText, { color: colors.text }]}>
                  {third.username.charAt(0).toUpperCase()}
                </Text>
              )
            ) : (
              <Text style={[styles.avatarText, { color: colors.text }]}>?</Text>
            )}
            <View style={[styles.medalBadge, { backgroundColor: '#CD7F32' }]}>
              <Text style={styles.medalText}>3</Text>
            </View>
          </View>
          {third.username && (
            <>
              <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>
                {third.username}
              </Text>
              <Text style={[styles.podiumCoins, { color: colors.textSecondary }]}>
                {third.coins}
              </Text>
            </>
          )}
          <View style={[styles.podiumBar, { 
            backgroundColor: colors.card, 
            height: 40
          }]} />
        </View>
      </View>
    );
  };

  const renderUserRank = ({ item, index }: { item: LeaderboardUser; index: number }) => {
    // No mostrar en la lista a los primeros 3, ya que están en el podio
    if (index < 3) return null;

    return (
      <Card style={styles.rankCard}>
        <Text style={[styles.rankNumber, { color: colors.text }]}>
          {item.rank}
        </Text>
        
        <View style={styles.userInfo}>
          <View style={[styles.smallAvatar, { backgroundColor: colors.card }]}>
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
    <View style={styles.container}>
      {/* Periodo del leaderboard */}
      <View style={styles.periodContainer}>
        <View style={styles.periodToggle}>
          <Text 
            style={[
              styles.periodText, 
              { color: period === 'month' ? colors.primary : colors.textSecondary },
              period === 'month' && styles.activePeriod
            ]}
            onPress={() => setPeriod('month')}
          >
            {t('thisMonth') || 'This Month'}
          </Text>
          <Text 
            style={[
              styles.periodText, 
              { color: period === 'allTime' ? colors.primary : colors.textSecondary },
              period === 'allTime' && styles.activePeriod
            ]}
            onPress={() => setPeriod('allTime')}
          >
            {t('allTime') || 'All Time'}
          </Text>
        </View>
      </View>

      {/* Título con icono */}
      <View style={styles.titleContainer}>
        <Medal size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>
          {t('leaderboard') || 'Leaderboard'}
        </Text>
      </View>

      {/* Podio con los 3 primeros */}
      {renderPodium()}

      {/* Lista del resto de usuarios */}
      <Text style={[styles.rankingsTitle, { color: colors.text }]}>
        {t('rankings') || 'Rankings'}
      </Text>

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
    padding: 16,
  },
  periodContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  periodToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
  },
  periodText: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontWeight: '600',
  },
  activePeriod: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 24,
    height: 150,
  },
  podiumPosition: {
    alignItems: 'center',
    width: '30%',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  medalBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  podiumName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  podiumCoins: {
    fontSize: 12,
    marginBottom: 8,
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  rankingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  rankingsList: {
    gap: 8,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  rankNumber: {
    width: 32,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
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