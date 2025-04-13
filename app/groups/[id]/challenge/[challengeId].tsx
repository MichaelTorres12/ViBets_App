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
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/store/auth-context';
import { useChallengesStore } from '@/store/challenges-store';
import { useGroupsStore } from '@/store/groups-store';
import { useTheme } from '@/components/ThemeContext';
import { useLanguage } from '@/components/LanguageContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '@/services/supabaseClient';
import { Card } from '@/components/Card';
import { 
  Plus, 
  XCircle, 
  Send, 
  Calendar, 
  Users, 
  Trophy, 
  Clock, 
  Image as ImageIcon,
  FileText,
  Check,
  ThumbsUp
} from 'lucide-react-native';

type TabType = 'submissions' | 'participants';

export default function ChallengeDetailScreen() {
  // Extraemos challengeId y groupId de la URL
  const { challengeId, id: groupId } = useLocalSearchParams<{ challengeId: string; id: string }>();
  const { user } = useAuth();
  const {
    challenges,
    fetchGroupChallenges,
    participateInChallenge,
    submitJustification,
    voteJustification,
  } = useChallengesStore();
  const { getGroupById, getGroupMember } = useGroupsStore();
  const { colors, theme } = useTheme();
  const { t } = useLanguage();
  const isLight = theme === 'light';

  // Estados para justificaciones
  const [justificationContent, setJustificationContent] = useState('');
  const [justificationType, setJustificationType] = useState<'text' | 'image'>('text');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  // Estado para tabs (submissions vs participants)
  const [activeTab, setActiveTab] = useState<TabType>('submissions');

  useEffect(() => {
    if (groupId) {
      fetchGroupChallenges(groupId);
    }
  }, [groupId, fetchGroupChallenges]);

  // Buscamos el challenge y grupo
  const challenge = challenges.find((ch: any) => ch.id === challengeId);
  const group = getGroupById(groupId as string);

  // Helper: obtener username a partir del userId (usando datos del grupo)
  const getUsernameById = (userId: string): string => {
    if (!group) return 'Unknown';
    const member = getGroupMember(group.id, userId);
    return member?.username || 'Unknown';
  };

  if (!challenge) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>{t('loadingChallenge') || 'Loading challenge...'}</Text>
      </View>
    );
  }

  const isChallengeOpen = challenge.status === 'open';
  const userAlreadyParticipates = challenge.participants?.some((p: any) => p.user_id === user?.id);
  const userAlreadySubmitted = challenge.justifications?.some((j: any) => j.user_id === user?.id);

  // Formatear fechas
  function formatDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  }
  
  const createdDate = formatDate(challenge.created_at);
  const endDate = formatDate(challenge.end_date);
  const participantsCount = challenge.participants?.length || 0;
  // Calculamos el total de votos necesarios:
  const totalNeeded = Math.floor(participantsCount / 2) + 1;
  const totalPrize = challenge.totalPrize || challenge.initial_prize || 0;
  const creatorName = getUsernameById(challenge.created_by);

  // Función para subir imagen al bucket
  const uploadImage = async (uri: string, userId: string): Promise<string> => {
    try {
      const base64File = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const arrayBuffer = decode(base64File);
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const mimeType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
      const { data, error } = await supabase.storage
        .from('challenge-images')
        .upload(fileName, arrayBuffer, { contentType: mimeType, upsert: false });
      if (error) throw error;
      const { data: urlData, error: urlError } = supabase.storage
        .from('challenge-images')
        .getPublicUrl(fileName);
      if (urlError) throw urlError;
      if (!urlData?.publicUrl) throw new Error('Error obtaining public URL');
      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw err;
    }
  };

  // Función para enviar la justificación
  const handleSubmitJustification = async () => {
    if (!userAlreadyParticipates) {
      Alert.alert(t('notParticipating') || 'Not participating', 
                  t('onlyParticipantsCanSubmit') || 'Only participants can submit a proof.');
      return;
    }
    
    if (userAlreadySubmitted) {
      Alert.alert(t('alreadySubmitted') || 'Already submitted', 
                  t('onlyOneSubmissionAllowed') || 'You have already submitted a proof for this challenge.');
      return;
    }
    
    if (justificationType === 'text' && !justificationContent.trim()) {
      Alert.alert(t('emptyContent') || 'Empty content', 
                  t('pleaseEnterProof') || 'Please enter some text as proof.');
      return;
    }
    
    let contentToSubmit = justificationContent.trim();
    if (justificationType === 'image' && localImageUri) {
      try {
        contentToSubmit = await uploadImage(localImageUri, user.id);
      } catch (error) {
        Alert.alert(t('error') || 'Error', t('failedUploadImage') || 'Failed to upload image.');
        return;
      }
    }
    try {
      const { data, error } = await supabase
        .from('challenge_justifications')
        .insert({
          challenge_id: challenge.id,
          user_id: user.id,
          type: justificationType,
          content: contentToSubmit,
        });
      if (error) throw error;
      Alert.alert(t('success') || 'Success', t('proofSubmitted') || 'Proof submitted successfully.');
      setJustificationContent('');
      setLocalImageUri(null);
      fetchGroupChallenges(groupId as string);
    } catch (error) {
      console.error('Error submitting justification:', error);
      Alert.alert(t('error') || 'Error', t('couldNotSubmitProof') || 'Could not submit your proof.');
    }
  };

  // Función para votar en una justificación
  const handleVote = async (justifId: string, approved: boolean) => {
    try {
      const { data, error } = await supabase
        .from('challenge_votes')
        .insert({
          justification_id: justifId,
          user_id: user.id,
          approved,
        });
      if (error) throw error;
      Alert.alert(t('thankYou') || 'Thank you', t('voteRecorded') || 'Your vote has been recorded.');
      fetchGroupChallenges(groupId as string);
    } catch (error) {
      console.error('Error voting on justification:', error);
      Alert.alert(t('error') || 'Error', t('couldNotRecordVote') || 'Could not record your vote.');
    }
  };

  // Función para seleccionar imagen de la galería
  const handleAttachImage = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert(t('permissionsRequired') || 'Permissions required', 
                   t('galleryPermission') || 'Permission to access gallery is needed.');
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
      if (pickerResult.cancelled) return;
      const uri = pickerResult.uri || (pickerResult.assets && pickerResult.assets[0].uri);
      if (!uri) throw new Error('No image selected');
      setLocalImageUri(uri);
      setJustificationType('image');
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('error') || 'Error', t('failedPickImage') || 'Failed to pick image.');
    }
  };

  // Renderizar las justificaciones (submissions)
  const renderSubmissions = () => {
    const justifications = challenge.justifications || [];
    if (justifications.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <FileText size={48} color={colors.textSecondary} style={{ marginBottom: 12 }} />
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
            {t('noSubmissions') || 'No submissions yet.'}
          </Text>
        </View>
      );
    }
    return justifications.map((justif: any) => {
      const isAuthor = justif.user_id === user.id;
      const username = getUsernameById(justif.user_id);
      const createdAtStr = formatDate(justif.created_at);
      const votesCount = justif.votes ? justif.votes.filter((v: any) => v.approved).length : 0;
      const threshold = Math.floor(participantsCount / 2) + 1;
      const isApproved = votesCount >= threshold;
      const alreadyVoted = justif.votes ? justif.votes.some((v: any) => v.user_id === user.id) : false;

      return (
        <Card
          key={justif.id}
          style={[styles.submissionCard, { 
            borderLeftWidth: 4,
            borderLeftColor: isApproved ? colors.success : alreadyVoted ? colors.primary : colors.border
          }]}
          variant="elevated"
        >
          <View style={styles.submissionHeader}>
            <View style={styles.submissionUserContainer}>
              <View style={[styles.submissionAvatar, { backgroundColor: isLight ? `${colors.primary}20` : colors.cardLight }]}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>{getInitials(username)}</Text>
              </View>
              <View>
                <Text style={[styles.submissionUser, { color: colors.text }]}>{username}</Text>
                <Text style={[styles.submissionDate, { color: colors.textSecondary }]}>{createdAtStr}</Text>
              </View>
            </View>
            {isApproved && (
              <View style={[styles.approvedBadge, { backgroundColor: `${colors.success}20` }]}>
                <Check size={12} color={colors.success} />
                <Text style={[styles.approvedText, { color: colors.success }]}>
                  {t('approved') || 'Approved'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={{ marginVertical: 12 }}>
            {justif.type === 'text' ? (
              <Text style={[styles.submissionText, { color: colors.text }]}>{justif.content}</Text>
            ) : (
              <Image
                source={{ uri: justif.content }}
                style={{ width: '100%', height: 200, borderRadius: 8 }}
                resizeMode="cover"
              />
            )}
          </View>
          
          <View style={styles.submissionFooter}>
            <View style={[styles.voteIndicator, { 
              backgroundColor: isLight ? `${colors.primary}10` : colors.cardLight 
            }]}>
              <ThumbsUp size={14} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.primary, fontWeight: '500' }}>
                {votesCount}/{threshold}
              </Text>
            </View>
            
            {!isAuthor && isChallengeOpen && !alreadyVoted && (
              <TouchableOpacity
                style={[styles.voteButton, { backgroundColor: colors.primary }]}
                onPress={() => handleVote(justif.id, true)}
              >
                <ThumbsUp size={16} color="#000" style={{ marginRight: 6 }} />
                <Text style={{ fontWeight: '600', color: '#000' }}>
                  {t('vote') || 'Vote'}
                </Text>
              </TouchableOpacity>
            )}
            
            {alreadyVoted && (
              <Text style={[styles.votedText, { color: colors.primary }]}>
                {t('youVoted') || 'You voted'}
              </Text>
            )}
          </View>
        </Card>
      );
    });
  };

  // Renderizar la lista de participantes
  const renderParticipants = () => {
    const participants = challenge.participants || [];
    if (participants.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Users size={48} color={colors.textSecondary} style={{ marginBottom: 12 }} />
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
            {t('noParticipants') || 'No participants yet.'}
          </Text>
        </View>
      );
    }
    return (
      <View style={{ gap: 8 }}>
        {participants.map((p: any) => {
          const username = p.profile?.username || 'Unknown';
          const initials = getInitials(username);
          return (
            <Card key={p.id} style={styles.participantCard} variant={isLight ? "elevated" : "default"}>
              <View style={styles.participantRow}>
                <View style={[styles.participantAvatar, { backgroundColor: isLight ? `${colors.primary}20` : colors.cardLight }]}>
                  <Text style={{ color: colors.primary, fontWeight: '600' }}>{initials}</Text>
                </View>
                <Text style={[styles.participantName, { color: colors.text }]}>{username}</Text>
              </View>
            </Card>
          );
        })}
      </View>
    );
  };

  // Helper para obtener iniciales
  function getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length === 1 ? parts[0].charAt(0).toUpperCase() : (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }

  // Función para participar en el challenge
  const handleParticipate = async () => {
    try {
      await participateInChallenge(challengeId as string, 75, user.id);
      Alert.alert(t('joined') || 'Joined!', t('successJoinChallenge') || 'You have successfully joined the challenge.');
      fetchGroupChallenges(groupId as string);
    } catch (error) {
      console.error('Error joining challenge:', error);
      Alert.alert(t('error') || 'Error', t('errorJoiningChallenge') || 'There was an error joining the challenge.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 100 }}>
        <Stack.Screen 
          options={{ 
            title: challenge.title || 'Challenge Detail',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }} 
        />

        {/* Challenge Card */}
        <Card style={styles.challengeCard} variant={isLight ? "elevated" : "default"}>
          <View style={styles.challengeHeader}>
            <Text style={[styles.creatorText, { color: colors.textSecondary }]}>
              {t('createdBy') || 'Created by'} <Text style={{ fontWeight: '600', color: colors.primary }}>{creatorName}</Text>
            </Text>
            <View style={[styles.statusBadge, { 
              backgroundColor: isChallengeOpen ? `${colors.success}20` : `${colors.textSecondary}20`,
            }]}>
              <Text style={{ 
                color: isChallengeOpen ? colors.success : colors.textSecondary,
                fontWeight: '600',
                fontSize: 12,
              }}>
                {isChallengeOpen ? t('open') || 'OPEN' : t('closed') || 'CLOSED'}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.challengeTitle, { color: colors.text }]}>{challenge.title}</Text>
          <Text style={[styles.challengeDescription, { color: colors.textSecondary }]}>{challenge.description}</Text>

          <View style={styles.infoRowsContainer}>
            {/* Fila 1: Participantes - Premio */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <View style={[styles.infoIconContainer, { backgroundColor: `${colors.primary}20` }]}>
                  <Users size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    {t('participants') || 'Participants'}
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {challenge.participants?.length || 0}
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <View style={[styles.infoIconContainer, { backgroundColor: `${colors.primary}20` }]}>
                  <Trophy size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    {t('prize') || 'Prize'}
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {totalPrize} {t('coins') || 'coins'}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Fila 2: Creado el - Termina el */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <View style={[styles.infoIconContainer, { backgroundColor: `${colors.primary}20` }]}>
                  <Calendar size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    {t('created') || 'Created'}
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {createdDate}
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <View style={[styles.infoIconContainer, { backgroundColor: `${colors.primary}20` }]}>
                  <Clock size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    {t('ends') || 'Ends'}
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {endDate}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {!userAlreadyParticipates && isChallengeOpen && (
            <TouchableOpacity
              style={[styles.joinButton, { backgroundColor: colors.primary }]}
              onPress={handleParticipate}
              activeOpacity={0.8}
            >
              <Text style={styles.joinButtonText}>
                {t('joinChallenge') || 'Join Challenge'}
              </Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Submission Form: Se muestra solo si el usuario ya participa y el challenge está abierto */}
        {userAlreadyParticipates && isChallengeOpen && (
          <Card style={styles.submissionForm} variant={isLight ? "elevated" : "default"}>
            {userAlreadySubmitted ? (
              <View style={styles.alreadySubmittedAlert}>
                <View style={[styles.alertIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                  <Check size={16} color={colors.primary} />
                </View>
                <Text style={[styles.alertText, { color: colors.text }]}>
                  {t('youAlreadySubmitted') || 'You have already submitted your proof'}
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.formTitle, { color: colors.text }]}>
                  {t('submitProof') || 'Submit your proof'}
                </Text>
                
                <View style={styles.typeRow}>
                  <TouchableOpacity
                    style={[styles.typeButton, { 
                      backgroundColor: justificationType === 'text' ? colors.primary : 'transparent',
                      borderColor: colors.primary,
                    }]}
                    onPress={() => setJustificationType('text')}
                  >
                    <FileText size={16} color={justificationType === 'text' ? '#000' : colors.primary} />
                    <Text style={{ 
                      color: justificationType === 'text' ? '#000' : colors.primary,
                      marginLeft: 6,
                      fontWeight: '500'
                    }}>
                      {t('text') || 'Text'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.typeButton, { 
                      backgroundColor: justificationType === 'image' ? colors.primary : 'transparent',
                      borderColor: colors.primary,
                    }]}
                    onPress={() => setJustificationType('image')}
                  >
                    <ImageIcon size={16} color={justificationType === 'image' ? '#000' : colors.primary} />
                    <Text style={{ 
                      color: justificationType === 'image' ? '#000' : colors.primary,
                      marginLeft: 6,
                      fontWeight: '500'
                    }}>
                      {t('image') || 'Image'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {justificationType === 'image' && (
                  <TouchableOpacity 
                    style={[styles.attachButton, { 
                      backgroundColor: isLight ? `${colors.primary}10` : colors.cardLight,
                    }]} 
                    onPress={handleAttachImage}
                  >
                    <Plus size={16} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={{ color: colors.primary, fontWeight: '500' }}>
                      {t('attachImage') || 'Attach Image'}
                    </Text>
                  </TouchableOpacity>
                )}

                <View style={styles.textAreaContainer}>
                  <TextInput
                    style={[styles.textArea, { 
                      color: colors.text, 
                      borderColor: colors.border,
                      backgroundColor: isLight ? colors.card : colors.cardLight,
                    }]}
                    placeholder={
                      justificationType === 'text'
                        ? t('describeProof') || 'Describe your proof...'
                        : t('imagePlaceholder') || 'Add a description for your image (optional)'
                    }
                    placeholderTextColor={colors.textTertiary}
                    value={justificationContent}
                    onChangeText={setJustificationContent}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {/* Previsualización de imagen si se seleccionó */}
                {localImageUri && (
                  <View style={styles.previewContainer}>
                    <View style={[styles.previewImageWrapper, { borderColor: colors.border }]}>
                      <Image source={{ uri: localImageUri }} style={styles.previewImage} resizeMode="cover" />
                      <TouchableOpacity 
                        style={[styles.removeImageButton, { backgroundColor: `${colors.error}20` }]} 
                        onPress={() => setLocalImageUri(null)}
                      >
                        <XCircle size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]} 
                  onPress={handleSubmitJustification}
                  activeOpacity={0.8}
                >
                  <Send size={16} color="#000" style={{ marginRight: 8 }} />
                  <Text style={{ fontWeight: '600', color: '#000' }}>
                    {t('submit') || 'Submit Proof'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Card>
        )}

        {/* Tabs para cambiar entre Submissions y Participants */}
        <View style={[styles.tabRow, { borderColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'submissions' && [styles.activeTabButton, { borderColor: colors.primary }]]} 
            onPress={() => setActiveTab('submissions')}
          >
            <FileText size={18} color={activeTab === 'submissions' ? colors.primary : colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[
              styles.tabButtonText, 
              { color: activeTab === 'submissions' ? colors.primary : colors.textSecondary }
            ]}>
              {t('submissions') || 'Submissions'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'participants' && [styles.activeTabButton, { borderColor: colors.primary }]]} 
            onPress={() => setActiveTab('participants')}
          >
            <Users size={18} color={activeTab === 'participants' ? colors.primary : colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[
              styles.tabButtonText, 
              { color: activeTab === 'participants' ? colors.primary : colors.textSecondary }
            ]}>
              {t('participants') || 'Participants'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ padding: 16 }}>
          {activeTab === 'submissions' ? renderSubmissions() : renderParticipants()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  challengeCard: { 
    padding: 20, 
    margin: 16, 
    borderRadius: 16,
    marginTop: 8,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  creatorText: { 
    fontSize: 14, 
  },
  challengeTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 10,
    lineHeight: 28,
  },
  challengeDescription: { 
    fontSize: 15, 
    marginBottom: 8,
    lineHeight: 22,
  },
  infoRowsContainer: {
    marginVertical: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  joinButton: { 
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonText: { 
    fontSize: 16,
    fontWeight: '600', 
    color: '#000'
  },
  submissionForm: { 
    marginHorizontal: 16, 
    marginBottom: 20, 
    padding: 20, 
    borderRadius: 16,
  },
  formTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 16 
  },
  typeRow: { 
    flexDirection: 'row', 
    marginBottom: 16, 
    gap: 12 
  },
  typeButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8, 
    borderWidth: 1,
    paddingHorizontal: 14, 
    paddingVertical: 8,
    flex: 1,
    justifyContent: 'center',
  },
  textAreaContainer: { 
    marginBottom: 16 
  },
  textArea: { 
    borderWidth: 1, 
    borderRadius: 12, 
    padding: 12, 
    minHeight: 100, 
    textAlignVertical: 'top',
    fontSize: 15,
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submissionCard: { 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 16,
  },
  submissionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  submissionUserContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  submissionAvatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20,
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12,
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approvedText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  submissionUser: { 
    fontSize: 15, 
    fontWeight: '600',
    marginBottom: 2,
  },
  submissionDate: { 
    fontSize: 12,
  },
  submissionText: { 
    fontSize: 15,
    lineHeight: 22,
  },
  submissionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  voteIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  votedText: {
    fontSize: 14,
    fontWeight: '500',
  },
  participantCard: { 
    padding: 12, 
    borderRadius: 12,
  },
  participantRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  participantAvatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20,
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12,
  },
  participantName: { 
    fontSize: 16,
    fontWeight: '500',
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  emptyStateContainer: { 
    padding: 32,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  previewContainer: { 
    alignItems: 'center', 
    marginVertical: 16,
  },
  previewImageWrapper: { 
    position: 'relative', 
    width: 250, 
    height: 250, 
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: { 
    width: '100%', 
    height: '100%',
  },
  removeImageButton: { 
    position: 'absolute', 
    top: 8, 
    right: 8, 
    padding: 8,
    borderRadius: 20,
  },
  tabRow: { 
    flexDirection: 'row', 
    marginHorizontal: 16, 
    borderBottomWidth: 1, 
    marginBottom: 16,
  },
  tabButton: { 
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTabButton: { 
    borderBottomWidth: 2,
  },
  tabButtonText: { 
    fontSize: 15, 
    fontWeight: '600',
  },
  alreadySubmittedAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  alertIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

// En lugar de la función duplicada que había antes, exportamos funciones más flexibles
export const helpers = {
  getChallengesStore: () => require('@/store/challenges-store').useChallengesStore,
};
