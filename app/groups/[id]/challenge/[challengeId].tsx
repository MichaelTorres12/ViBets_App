// app/groups/[id]/challenge/[challengeId].tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/store/auth-context';
import { useChallengesStore } from '@/store/challenges-store';
import { useGroupsStore } from '@/store/groups-store'; // Importamos
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';

type TabType = 'submissions' | 'participants';

export default function ChallengeDetailScreen() {
  const { challengeId, id: groupId } = useLocalSearchParams<{ challengeId: string; id: string }>();
  const { user } = useAuth();
  const {
    challenges,
    fetchGroupChallenges,
    participateInChallenge,
    submitJustification,
    voteJustification,
  } = useChallengesStore();
  const { getGroupById, getGroupMember } = useGroupsStore(); // <-- Para obtener username

  const { colors } = useTheme();
  const { t } = useLanguage();

  // Para la justificación
  const [justificationContent, setJustificationContent] = useState('');
  const [justificationType, setJustificationType] = useState<'text' | 'image' >('text');

  // Para tabs (submissions vs participants)
  const [activeTab, setActiveTab] = useState<TabType>('submissions');

  // Cargar challenges al montar
  useEffect(() => {
    if (groupId) {
      fetchGroupChallenges(groupId);
    }
  }, [groupId]);

  // Encontrar el challenge en el store
  const challenge = challenges.find((ch) => ch.id === challengeId);

  // Encontrar el grupo para poder mapear userId -> username
  const group = getGroupById(groupId as string);

  // Función real para obtener username a partir de userId
  function getUsernameById(userId: string) {
    if (!group) return 'Unknown';
    const member = getGroupMember(group.id, userId);
    return member?.username || 'Unknown';
  }

  if (!challenge) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading challenge...</Text>
      </View>
    );
  }

  // Estado del challenge
  const isChallengeOpen = challenge.status === 'open';
  const userAlreadyParticipates = challenge.participants?.some((p) => p.user_id === user?.id);


  // Fechas
  const createdDate = formatDate(challenge.created_at);
  const endDate = formatDate(challenge.end_date);
  const participantsCount = challenge.participants?.length || 0;
  const totalPrize = challenge.totalPrize || challenge.initial_prize || 0;

  // Nombre del creador (obtenido con group data)
  const creatorName = getUsernameById(challenge.created_by);

  // Manejar participar
  const handleParticipate = async () => {
    if (!isChallengeOpen) {
      Alert.alert('Challenge Closed', 'This challenge is not open to participate.');
      return;
    }
    if (userAlreadyParticipates) {
      Alert.alert('Already Participating', 'You are already participating in this challenge.');
      return;
    }
    try {
      // Llamamos pasando user.id
      await participateInChallenge(challengeId as string, 75, user.id);
      Alert.alert('Joined!', 'You have successfully joined the challenge.');
      fetchGroupChallenges(groupId as string);
    } catch (error) {
      console.error('Error joining challenge:', error);
      Alert.alert('Error', 'There was an error joining the challenge.');
    }
  };  

  // Manejar envío de justificación
  const handleSubmitJustification = async () => {
    if (!userAlreadyParticipates) {
      Alert.alert('Not participating', 'Only participants can submit a justification.');
      return;
    }
    if (!justificationContent.trim()) {
      Alert.alert('Empty content', 'Please enter some content first.');
      return;
    }
    await submitJustification(challengeId as string, justificationType, justificationContent);
    setJustificationContent('');
  };

  // Manejar voto
  const handleVote = async (justifId: string, approved: boolean) => {
    await voteJustification(justifId, approved);
    fetchGroupChallenges(groupId as string);
  };

  // Renderizar justificaciones
  const renderSubmissions = () => {
    const justifications = challenge.justifications || [];
    if (justifications.length === 0) {
      return (
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
          {t('noSubmissions') || 'No submissions yet.'}
        </Text>
      );
    }

    return justifications.map((justif) => {
      const isAuthor = justif.userId === user?.id;
      const username = getUsernameById(justif.userId);
      const createdAtStr = formatDate(justif.created_at);

      // (Opcional) Lógica de votos
      const votesCount = 3; // Ejemplo
      const totalNeeded = 5; // Ejemplo
      const isApproved = false; // Ejemplo

      return (
        <View key={justif.id} style={[styles.submissionCard, { backgroundColor: colors.card }]}>
          <View style={styles.submissionHeader}>
            <Text style={[styles.submissionUser, { color: colors.text }]}>
              {username}
            </Text>
            <Text style={[styles.submissionDate, { color: colors.textSecondary }]}>
              {createdAtStr}
            </Text>
          </View>
          <Text style={[styles.submissionText, { color: colors.text }]}>
            {justif.type === 'text' ? justif.content : ''}
          </Text>
          {justif.type === 'image' && (
            <Image
              source={{ uri: justif.content }}
              style={{ width: '100%', height: 200, marginTop: 8, borderRadius: 8 }}
              resizeMode="cover"
            />
          )}
          <Text style={[styles.votesText, { color: colors.textSecondary }]}>
            {t('votes') || 'Votes'}: {votesCount}/{totalNeeded}
          </Text>
          {isApproved ? (
            <Text style={[styles.approvedText, { color: '#4CAF50' }]}>
              {t('approved') || 'Approved'}
            </Text>
          ) : !isAuthor && isChallengeOpen ? (
            <TouchableOpacity
              style={[styles.voteButton, { backgroundColor: colors.primary }]}
              onPress={() => handleVote(justif.id, true)}
            >
              <Text style={{ fontWeight: '600', color: '#000' }}>
                {t('voteOnThisSubmission') || 'Vote on this submission'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    });
  };

  const renderParticipants = () => {
    const participants = challenge.participants || [];
    if (participants.length === 0) {
      return (
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
          {t('noParticipants') || 'No participants yet.'}
        </Text>
      );
    }
  
    return (
      <View>
        {participants.map((p) => {
          // Usamos la propiedad "profile" que viene del JOIN a profiles
          const username = p.profile?.username || 'Unknown';
          const initials = getInitials(username);
  
          return (
            <View key={p.id} style={styles.participantRow}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <Text style={[styles.participantName, { color: colors.text }]}>
                {username}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };
  
  
  // Helper para obtener iniciales (p.ej. "Jamie" -> "J", "Taylor Swift" -> "TS")
  function getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      // Un solo nombre, tomamos la primera letra
      return parts[0].charAt(0).toUpperCase();
    }
    // Tomamos la primera letra de los dos primeros 'words'
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: challenge.title || 'Challenge Detail' }} />

      <View style={[styles.challengeCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.creatorText, { color: colors.textSecondary }]}>
          {t('createdBy') || 'Created by'} {creatorName}
        </Text>
        <Text style={[styles.challengeTitle, { color: colors.text }]}>
          {challenge.title}
        </Text>
        <Text style={[styles.challengeDescription, { color: colors.textSecondary }]}>
          {challenge.description}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statsItem}>
            <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
              {t('created') || 'Created:'}
            </Text>
            <Text style={[styles.statsValue, { color: colors.text }]}>
              {createdDate}
            </Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
              {t('participants') || 'Participants:'}
            </Text>
            <Text style={[styles.statsValue, { color: colors.text }]}>
              {participantsCount}
            </Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
              {t('ends') || 'Ends:'}
            </Text>
            <Text style={[styles.statsValue, { color: colors.text }]}>
              {endDate}
            </Text>
          </View>
        </View>

        {!userAlreadyParticipates && isChallengeOpen && (
          <TouchableOpacity
            style={[styles.joinButton, { backgroundColor: colors.primary }]}
            onPress={handleParticipate}
          >
            <Text style={styles.joinButtonText}>
              {t('joinChallenge') || 'Join Challenge'} ({totalPrize} {t('coins') || 'coins'})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {userAlreadyParticipates && isChallengeOpen && (
        <View style={[styles.submissionForm, { backgroundColor: colors.card }]}>
          <Text style={[styles.formTitle, { color: colors.text }]}>
            {t('submitProof') || 'Submissions'}
          </Text>
          <View style={styles.typeRow}>
            {(['text', 'image', ] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  justificationType === type && { backgroundColor: colors.primary },
                ]}
                onPress={() => setJustificationType(type)}
              >
                <Text style={{ color: '#000' }}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.textAreaContainer}>
            <TextInput
              style={[
                styles.textArea,
                { color: colors.text, borderColor: colors.border },
              ]}
              placeholder={
                justificationType === 'text'
                  ? 'Describe your achievement...'
                  : 'Upload image'
              }
              placeholderTextColor={colors.textTertiary}
              value={justificationContent}
              onChangeText={setJustificationContent}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleSubmitJustification}
          >
            <Text style={{ fontWeight: '600', color: '#000' }}>
              {t('submit') || 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'submissions' && styles.activeTabButton]}
          onPress={() => setActiveTab('submissions')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'submissions' && { color: colors.primary },
            ]}
          >
            {t('submissions') || 'Submissions'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'participants' && styles.activeTabButton]}
          onPress={() => setActiveTab('participants')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'participants' && { color: colors.primary },
            ]}
          >
            {t('participants') || 'Participants'}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'submissions' ? (
        <View style={{ padding: 12 }}>{renderSubmissions()}</View>
      ) : (
        <View style={{ padding: 12 }}>{renderParticipants()}</View>
      )}
    </ScrollView>
  );
}

// Helpers
function formatDate(dateStr?: string) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  challengeCard: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  creatorText: {
    fontSize: 12,
    marginBottom: 4,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  challengeDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsItem: {
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 12,
  },
  statsValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  joinButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    fontWeight: '600',
    color: '#000',
  },
  submissionForm: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  typeButton: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFD60A',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textAreaContainer: {
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderBottomWidth: 1,
    marginBottom: 8,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFD60A',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
  },
  submissionCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  submissionUser: {
    fontSize: 14,
    fontWeight: '600',
  },
  submissionDate: {
    fontSize: 12,
  },
  submissionText: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 6,
  }, 
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3A3A3A', // o el color que prefieras
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  participantName: {
    fontSize: 16,
  },
  votesText: {
    fontSize: 12,
    marginTop: 6,
  },
  approvedText: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
  },
  voteButton: {
    marginTop: 8,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  participantItem: {
    padding: 12,
    backgroundColor: '#2c2c2c',
    borderRadius: 6,
    marginBottom: 8,
  },
});
