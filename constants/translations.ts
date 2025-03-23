//constants/translation.ts
import { Language } from '@/store/language-store';

type TranslationKey = 
  // Common
  | 'back'
  | 'save'
  | 'cancel'
  | 'delete'
  | 'edit'
  | 'loading'
  | 'error'
  | 'success'
  | 'confirm'
  | 'yes'
  | 'no'
  | 'search'
  | 'notifications'
  | 'settings'
  | 'logout'
  | 'logoutConfirmation'
  | 'logoutConfirmationMessage'
  | 'fillAllFields'
  | 'loginFailed'
  | 'registrationFailed'
  | 'ok'
  
  // Auth
  | 'login'
  | 'register'
  | 'email'
  | 'password'
  | 'username'
  | 'forgotPassword'
  | 'dontHaveAccount'
  | 'alreadyHaveAccount'
  | 'signUp'
  | 'signIn'
  | 'welcome'
  | 'createAccount'
  
  // Home
  | 'home'
  | 'trending'
  | 'yourBets'
  | 'yourGroups'
  | 'viewAll'
  | 'betNow'
  | 'pot'
  | 'noTrendingBets'
  | 'noActiveBets'
  | 'exploreBets'
  | 'notInGroups'
  | 'createGroup'
  | 'joinGroup'
  | 'viewMoreGroups'
  | 'open'
  | 'closed'
  | 'settled'
  | 'unknown'
  | 'yourCoins'
  | 'yourOpenBets'
  
  // Groups
  | 'groups'
  | 'myGroups'
  | 'joinedGroups'
  | 'createNewGroup'
  | 'joinExistingGroup'
  | 'groupName'
  | 'groupDescription'
  | 'inviteCode'
  | 'enterInviteCode'
  | 'members'
  | 'challenges'
  | 'chat'
  | 'createChallenge'
  | 'createBet'
  | 'createFirstBetMessage'
  | 'createFirstChallengeMessage'
  | 'newBet'
  | 'groupNotFound'
  | 'leaveGroup'
  | 'leaveGroupConfirmation'
  | 'failedToLeaveGroup'
  | 'permissionNeeded'
  | 'pleaseGrantPhotoPermission'
  | 'failedToPickImage'
  | 'typeMessage'
  | 'noBetsYet'
  | 'noChallengesYet'
  | 'admin'
  | 'inviteFriends'
  | 'leave'
  | 'joinMyBettingGroup'
  | 'onFriendsBet'
  | 'useInviteCode'
  | 'noGroups'
  | 'noGroupsJoined'
  | 'groupCoins'
  | 'yourGroupCoins'
  | 'recentBets'
  | 'seeAll'
  | 'allBets'
  | 'ended'
  | 'left'
  | 'noEndDate'   
  
  // Bets
  | 'bets'
  | 'activeBets'
  | 'completedBets'
  | 'betTitle'
  | 'betDescription'
  | 'betOptions'
  | 'betAmount'
  | 'placeBet'
  | 'expiresAt'
  | 'createdBy'
  | 'noBets'
  | 'noBetsCreated'
  | 'selectOption'
  | 'enterAmount'
  | 'confirmBet'
  | 'totalPot'
  | 'yourBet'
  | 'odds'
  | 'potentialWinnings'
  | 'betsWon'
  | 'betsLost'
  | 'recentFirst'
  | 'oldFirst'
  | 'placeYourBet'
  | 'available'
  | 'coins'
  | 'noParticipants'  
  | 'betStatistics'
  | 'optionsDistribution'
  | 'averageBet'
  | 'highestBet'
  | 'ends'
  | 'betPlacedSuccess'
  | 'betPlaceError'
  | 'alreadyVoted'
  | 'option'

  // Challenges
  | 'challengeTitle'
  | 'challengeDescription'
  | 'challengeReward'
  | 'challengeTasks'
  | 'addTask'
  | 'taskDescription'
  | 'taskReward'
  | 'progress'
  | 'leaderboard'
  | 'participants'
  | 'completedBy'
  | 'noChallenges'
  | 'noChallengesCreated'
  | 'challengeCompleted'
  | 'challengeCompletedMessage'
  | 'reward'
  | 'tasks'
  | 'completed'
  | 'completeTask'
  | 'viewTasks'
  | 'viewDetails'
  | 'currentParticipants'
  | 'current'
  | 'best'
  | 'viewActiveBets'
  | 'allChallenges'
  | 'myChallenges'
  | 'newChallenge'

  // Chat
  | 'typeAMessage'
  
  // History
  | 'history'
  | 'betHistory'
  | 'backToHistory'
  | 'matchStatistics'
  | 'betsPlaced'
  | 'final'
  | 'user'
  | 'prediction'
  | 'result'
  | 'winner'
  | 'totalAmount'
  | 'viewDetailsHistory'
  | 'backToChallenges'
  | 'wins'
  
  // Leaderboard
  | 'leaderboard'
  | 'groupLeaderboard'
  | 'rankings'
  | 'coins'
  | 'noMoreMembers'
  | 'topEarner'
  | 'totalCoins'
  | 'thisMonth'
  | 'allTime'
  
  // Profile
  | 'profile'
  | 'yourBalance'
  | 'addFunds'
  | 'account'
  | 'friends'
  | 'achievements'
  | 'paymentMethods'
  | 'support'
  | 'helpFaq'
  | 'privacyPolicy'
  | 'inviteFriends'
  
  // Settings
  | 'appSettings'
  | 'language'
  | 'english'
  | 'spanish'
  | 'theme'
  | 'darkTheme'
  | 'lightTheme'
  | 'notificationSettings'
  | 'soundEffects'
  | 'vibration'
  | 'about'
  | 'version'
  | 'termsOfService'
  | 'contactUs'
  | 'changeLanguage';

type Translations = {
  [key in Language]: {
    [key in TranslationKey]: string;
  };
};

export const translations: Translations = {
  en: {
    // Common
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    search: 'Search',
    notifications: 'Notifications',
    settings: 'Settings',
    logout: 'Logout',
    logoutConfirmation: 'Logout',
    logoutConfirmationMessage: 'Are you sure you want to logout?',
    fillAllFields: 'Please fill in all fields',
    loginFailed: 'Login failed. Please try again.',
    registrationFailed: 'Registration failed. Please try again.',
    ok: 'OK',
    
    // Auth
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    username: 'Username',
    forgotPassword: 'Forgot Password?',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    signUp: 'Sign Up',
    signIn: 'Sign In',
    welcome: 'Welcome Back',
    createAccount: 'Create Account',
    
    // Home
    home: 'Home',
    trending: 'Trending',
    yourBets: 'Your Bets',
    yourGroups: 'Your Groups',
    viewAll: 'View all',
    betNow: 'Bet Now',
    pot: 'Pot',
    noTrendingBets: 'No trending bets available',
    noActiveBets: "You haven't placed any bets yet",
    exploreBets: 'Explore Bets',
    notInGroups: "You're not in any groups yet",
    createGroup: 'Create Group',
    joinGroup: 'Join Group',
    viewMoreGroups: 'View more groups',
    open: 'Open',
    closed: 'Closed',
    settled: 'Settled',
    unknown: 'Unknown',
    yourCoins: 'Coins',
    yourOpenBets: 'Your Bets',
    
    // Groups
    groups: 'Groups',
    myGroups: 'My Groups',
    joinedGroups: 'Joined Groups',
    createNewGroup: 'Create New Group',
    joinExistingGroup: 'Join Existing Group',
    groupName: 'Group Name',
    groupDescription: 'Group Description',
    inviteCode: 'Invite Code',
    enterInviteCode: 'Enter Invite Code',
    members: 'Members',
    challenges: 'Challenges',
    chat: 'Chat',
    createChallenge: 'Create Challenge',
    createBet: 'Create Bet',
    createFirstBetMessage: 'Create the first bet in this group and invite your friends to participate!',
    createFirstChallengeMessage: 'Create the first challenge for your group members to complete and earn rewards!',
    newBet: 'New Bet',
    groupNotFound: 'Group not found',
    leaveGroup: 'Leave Group',
    leaveGroupConfirmation: 'Are you sure you want to leave this group? You will lose access to all bets and history.',
    failedToLeaveGroup: 'Failed to leave group',
    permissionNeeded: 'Permission needed',
    pleaseGrantPhotoPermission: 'Please grant permission to access your photos',
    failedToPickImage: 'Failed to pick image',
    typeMessage: 'Type a message...',
    noBetsYet: 'No bets yet',
    noChallengesYet: 'No challenges yet',
    admin: 'Admin',
    inviteFriends: 'Invite Friends',
    leave: 'Leave',
    joinMyBettingGroup: 'Join my betting group',
    onFriendsBet: 'on FriendsBet',
    useInviteCode: 'Use invite code',
    noGroups: 'No groups found',
    noGroupsJoined: "You haven't joined any groups yet",
    groupCoins: 'Group Coins',
    yourGroupCoins: 'Your Group Coins',
    recentBets: 'Recent Bets',
    seeAll: 'See All',
    allBets: 'All Bets',
    ended: 'Ended',
    left: 'Left',
    noEndDate: 'No end date',


    // Bets
    bets: 'Bets',
    activeBets: 'Active Bets',
    completedBets: 'Completed Bets',
    betTitle: 'Bet Title',
    betDescription: 'Bet Description',
    betOptions: 'Bet Options',
    betAmount: 'Bet Amount',
    placeBet: 'Place Bet',
    expiresAt: 'Expires at',
    createdBy: 'Created by',
    noBets: 'No bets found',
    noBetsCreated: "You haven't created any bets yet",
    selectOption: 'Select Option',
    enterAmount: 'Enter Amount',
    confirmBet: 'Confirm Bet',
    totalPot: 'Total Pot',
    yourBet: 'Your Bet',
    odds: 'Odds',
    potentialWinnings: 'Potential Winnings',
    betsWon: 'Bets Won',
    betsLost: 'Bets Lost',
    recentFirst: 'Recent First',
    oldFirst: 'Old First',
    placeYourBet: 'Place Your Bet',
    available: 'Available',
    coins: 'coins',
    noParticipants: 'No participants',
    betStatistics: 'Bet Statistics',
    optionsDistribution: 'Options Distribution',
    averageBet: 'Average Bet',
    highestBet: 'Highest Bet',
    ends: 'Ends at',
    betPlacedSuccess: 'Bet placed successfully',
    betPlaceError: 'Bet placement failed',
    alreadyVoted: 'You have already voted',
    option: 'Option',
    
    // Challenges
    challengeTitle: 'Challenge Title',
    challengeDescription: 'Challenge Description',
    challengeReward: 'Challenge Reward',
    challengeTasks: 'Challenge Tasks',
    addTask: 'Add Task',
    taskDescription: 'Task Description',
    taskReward: 'Task Reward',
    progress: 'Progress',
    leaderboard: 'GOATs',
    participants: 'Participants',
    completedBy: 'Completed By',
    noChallenges: 'No challenges found',
    noChallengesCreated: "You haven't created any challenges yet",
    challengeCompleted: 'Challenge Completed!',
    challengeCompletedMessage: 'Congratulations! You have completed all tasks and earned the reward.',
    reward: 'Reward',
    tasks: 'Tasks',
    completed: 'Completed',
    completeTask: 'Complete Task',
    viewTasks: 'View Tasks',
    viewDetails: 'View Details',
    currentParticipants: 'Current Participants',
    current: 'Current',
    best: 'Best',
    viewActiveBets: 'View Active Bets',
    allChallenges: 'All Challenges',
    myChallenges: 'My Challenges',
    newChallenge: 'New Challenge',


    // Chat
    typeAMessage: 'Type a message...',

    // History
    history: 'History',
    betHistory: 'Bet History',
    backToHistory: 'Back to History',
    matchStatistics: 'Match Statistics',
    betsPlaced: 'Bets Placed',
    final: 'Final',
    user: 'User',
    prediction: 'Prediction',
    result: 'Result',
    winner: 'Winner',
    totalAmount: 'Total Amount',
    viewDetailsHistory: 'View Details',
    backToChallenges: 'Back to Challenges',
    wins: 'wins',
    
    // Leaderboard
    groupLeaderboard: 'Group Leaderboard',
    rankings: 'Rankings',
    coins: 'coins',
    noMoreMembers: 'No more members',
    topEarner: 'Top Earner',
    totalCoins: 'Total Coins',
    thisMonth: 'This Month',
    allTime: 'All Time',
    
    // Profile
    profile: 'Profile',
    yourBalance: 'Your Balance',
    addFunds: 'Add Funds',
    account: 'Account',
    friends: 'Friends',
    achievements: 'Achievements',
    paymentMethods: 'Payment Methods',
    support: 'Support',
    helpFaq: 'Help & FAQ',
    privacyPolicy: 'Privacy Policy',
    inviteFriends: 'Invite Friends',
    
    // Settings
    appSettings: 'App Settings',
    language: 'Language',
    english: 'English',
    spanish: 'Spanish',
    theme: 'Theme',
    darkTheme: 'Dark Theme',
    lightTheme: 'Light Theme',
    notificationSettings: 'Notification Settings',
    soundEffects: 'Sound Effects',
    vibration: 'Vibration',
    about: 'About',
    version: 'Version',
    termsOfService: 'Terms of Service',
    contactUs: 'Contact Us',
    changeLanguage: 'Change Language'
  },
  es: {
    // Common
    back: 'Atrás',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    confirm: 'Confirmar',
    yes: 'Sí',
    no: 'No',
    search: 'Buscar',
    notifications: 'Notificaciones',
    settings: 'Configuración',
    logout: 'Cerrar Sesión',
    logoutConfirmation: 'Cerrar Sesión',
    logoutConfirmationMessage: '¿Estás seguro de que quieres cerrar sesión?',
    fillAllFields: 'Por favor complete todos los campos',
    loginFailed: 'Error al iniciar sesión. Por favor, inténtelo de nuevo.',
    registrationFailed: 'Error al registrarse. Por favor, inténtelo de nuevo.',
    ok: 'OK',
    
    // Auth
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    username: 'Nombre de Usuario',
    forgotPassword: '¿Olvidaste tu contraseña?',
    dontHaveAccount: '¿No tienes una cuenta?',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    signUp: 'Registrarse',
    signIn: 'Iniciar Sesión',
    welcome: 'Bienvenido de Nuevo',
    createAccount: 'Crear Cuenta',
    
    // Home
    home: 'Inicio',
    trending: 'Tendencias',
    yourBets: 'Tus Apuestas',
    yourGroups: 'Tus Grupos',
    viewAll: 'Ver todo',
    betNow: 'Apostar Ahora',
    pot: 'Bote',
    noTrendingBets: 'No hay apuestas en tendencia disponibles',
    noActiveBets: 'Aún no has realizado ninguna apuesta',
    exploreBets: 'Explorar Apuestas',
    notInGroups: 'Aún no estás en ningún grupo',
    createGroup: 'Crear Grupo',
    joinGroup: 'Unirse a Grupo',
    viewMoreGroups: 'Ver más grupos',
    open: 'Abierta',
    closed: 'Cerrada',
    settled: 'Resuelta',
    unknown: 'Desconocida',
    yourCoins: 'Monedas',
    yourOpenBets: 'Tus Apuestas',
    // Groups
    groups: 'Grupos',
    myGroups: 'Mis Grupos',
    joinedGroups: 'Grupos Unidos',
    createNewGroup: 'Crear Nuevo Grupo',
    joinExistingGroup: 'Unirse a Grupo Existente',
    groupName: 'Nombre del Grupo',
    groupDescription: 'Descripción del Grupo',
    inviteCode: 'Código de Invitación',
    enterInviteCode: 'Ingresa el Código de Invitación',
    members: 'Miembros',
    challenges: 'Desafíos',
    chat: 'Chat',
    createChallenge: 'Crear Desafío',
    createBet: 'Crear Apuesta',
    createFirstBetMessage: '¡Crea la primera apuesta en este grupo e invita a tus amigos a participar!',
    createFirstChallengeMessage: '¡Crea el primer desafío para que los miembros de tu grupo lo completen y ganen recompensas!',
    newBet: 'Nueva Apuesta',
    groupNotFound: 'Grupo no encontrado',
    leaveGroup: 'Abandonar Grupo',
    leaveGroupConfirmation: '¿Estás seguro de que quieres abandonar este grupo? Perderás acceso a todas las apuestas e historial.',
    failedToLeaveGroup: 'Error al abandonar el grupo',
    permissionNeeded: 'Permiso necesario',
    pleaseGrantPhotoPermission: 'Por favor, concede permiso para acceder a tus fotos',
    failedToPickImage: 'Error al seleccionar imagen',
    typeMessage: 'Escribe un mensaje...',
    noBetsYet: 'Aún no hay apuestas',
    noChallengesYet: 'Aún no hay desafíos',
    admin: 'Admin',
    inviteFriends: 'Invitar Amigos',
    leave: 'Salir',
    joinMyBettingGroup: 'Únete a mi grupo de apuestas',
    onFriendsBet: 'en FriendsBet',
    useInviteCode: 'Usa el código de invitación',
    noGroups: 'No se encontraron grupos',
    noGroupsJoined: 'Aún no te has unido a ningún grupo',
    groupCoins: 'Monedas del Grupo',
    yourGroupCoins: 'Tus Monedas del Grupo',
    recentBets: 'Apuestas Recientes',
    allBets: 'Todas las Apuestas',
    ended: 'Terminado',
    left: 'Faltan',
    noEndDate: 'No hay fecha de fin',
    
    // Bets
    bets: 'Apuestas',
    activeBets: 'Apuestas Activas',
    completedBets: 'Apuestas Completadas',
    betTitle: 'Título de la Apuesta',
    betDescription: 'Descripción de la Apuesta',
    betOptions: 'Opciones de Apuesta',
    betAmount: 'Cantidad de Apuesta',
    placeBet: 'Realizar Apuesta',
    expiresAt: 'Expira el',
    createdBy: 'Creado por',
    noBets: 'No se encontraron apuestas',
    noBetsCreated: 'Aún no has creado ninguna apuesta',
    selectOption: 'Seleccionar Opción',
    enterAmount: 'Ingresar Cantidad',
    confirmBet: 'Confirmar Apuesta',
    totalPot: 'Bote Total',
    yourBet: 'Tu Apuesta',
    odds: 'Probabilidades',
    potentialWinnings: 'Ganancias Potenciales',
    betsWon: 'Apuestas Ganadas',
    betsLost: 'Apuestas Perdidas',
    recentFirst: 'Más recientes',
    oldFirst: 'Más antiguas',
    placeYourBet: 'Realiza tu Apuesta',
    available: 'Disponible',
    coins: 'monedas',
    noParticipants: 'No hay participantes',
    betStatistics: 'Estadísticas de la Apuesta',
    optionsDistribution: 'Distribución de Opciones',
    averageBet: 'Apuesta Promedio',
    highestBet: 'Apuesta Más Alta',
    ends: 'Termina el',
    betPlacedSuccess: 'Apuesta realizada correctamente',
    betPlaceError: 'Error al realizar la apuesta',
    alreadyVoted: 'Ya has votado en esta apuesta',
    option: 'Opción',
    
    // Challenges
    challengeTitle: 'Título del Desafío',
    challengeDescription: 'Descripción del Desafío',
    challengeReward: 'Recompensa del Desafío',
    challengeTasks: 'Tareas del Desafío',
    addTask: 'Añadir Tarea',
    taskDescription: 'Descripción de la Tarea',
    taskReward: 'Recompensa de la Tarea',
    progress: 'Progreso',
    leaderboard: 'GOATs',
    participants: 'Participantes',
    completedBy: 'Completado Por',
    noChallenges: 'No se encontraron desafíos',
    noChallengesCreated: 'Aún no has creado ningún desafío',
    challengeCompleted: '¡Desafío Completado!',
    challengeCompletedMessage: '¡Felicidades! Has completado todas las tareas y ganado la recompensa.',
    reward: 'Recompensa',
    tasks: 'Tareas',
    completed: 'Completado',
    completeTask: 'Completar Tarea',
    viewTasks: 'Ver Tareas',
    viewDetails: 'Ver Detalles',
    currentParticipants: 'Participantes Actuales',
    current: 'Actual',
    best: 'Mejor',
    viewActiveBets: 'Ver Apuestas Activas',
    allChallenges: 'Todos los retos',
    myChallenges: 'Mis Retos',
    newChallenge: 'Nuevo Reto',

    // Chat
    typeAMessage: 'Escribe un mensaje...',

    // History
    history: 'Historial',
    betHistory: 'Historial de Apuestas',
    backToHistory: 'Volver al Historial',
    matchStatistics: 'Estadísticas del Partido',
    betsPlaced: 'Apuestas Realizadas',
    final: 'Final',
    user: 'Usuario',
    prediction: 'Predicción',
    result: 'Resultado',
    winner: 'Ganador',
    totalAmount: 'Cantidad Total',
    viewDetailsHistory: 'Ver Detalles',
    backToChallenges: 'Volver a Desafíos',
    wins: 'victorias',
    
    // Leaderboard
    groupLeaderboard: 'Clasificación del Grupo',
    rankings: 'Clasificaciones',
    coins: 'monedas',
    noMoreMembers: 'No hay más miembros',
    topEarner: 'Mayor Ganador',
    totalCoins: 'Total de Monedas',
    thisMonth: 'Este Mes',
    allTime: 'Desde siempre',
    
    // Profile
    profile: 'Perfil',
    yourBalance: 'Tu Saldo',
    addFunds: 'Añadir Fondos',
    account: 'Cuenta',
    friends: 'Amigos',
    achievements: 'Logros',
    paymentMethods: 'Métodos de Pago',
    support: 'Soporte',
    helpFaq: 'Ayuda y Preguntas Frecuentes',
    privacyPolicy: 'Política de Privacidad',
    inviteFriends: 'Invitar Amigos',
    seeAll: 'Ver Todo',
    
    // Settings
    appSettings: 'Configuración de la Aplicación',
    language: 'Idioma',
    english: 'Inglés',
    spanish: 'Español',
    theme: 'Tema',
    darkTheme: 'Tema Oscuro',
    lightTheme: 'Tema Claro',
    notificationSettings: 'Configuración de Notificaciones',
    soundEffects: 'Efectos de Sonido',
    vibration: 'Vibración',
    about: 'Acerca de',
    version: 'Versión',
    termsOfService: 'Términos de Servicio',
    contactUs: 'Contáctanos',
    changeLanguage: 'Cambiar Idioma'
  }
};

export const useTranslation = (language: Language) => {
  return (key: TranslationKey): string => {
    return translations[language][key] || key;
  };
};