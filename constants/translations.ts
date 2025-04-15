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
  | 'thankYou'
  
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
  | 'yourOpenBetsActive'

  // Groups
  | 'groups'
  | 'enterGroupName'
  | 'groupDescriptionPlaceholder'
  | 'howToGetInviteCode'
  | 'inviteCodeInstructions'
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

// ------
  | 'myBets'
  | 'statistics'
  | 'performance'
  | 'totalBets'
  | 'totalWins'
  | 'totalLosses'
  | 'totalProfit'
  | 'totalROI'
  | 'recentBets'
  | 'all'
  | 'won'
  | 'lost'
  | 'active'
  | 'winRate'
  | 'totalProfit'
  | 'noBetsFound'
  | 'noBetsDescription'
  | 'searchBets'
  | 'noYourOpenBets'
  | 'winningOption'
  | 'errorSettingWinningOption'
  | 'setWinningOption'
  | 'selectWinningOptionDescription'
  | 'confirmWinningOption'
  | 'setAsWinner'
  | 'asWinner'
  | 'confirmWinningOption'
  | 'confirmWinningOptionMessage'
  | 'winningOptionSet'

  // Parlays
  | 'parlays'
  | 'newParlay'
  | 'noParlays'
  | 'createFirstParlayMessage'
  | 'createParlay'
  | 'selectBets'
  | 'selectBetsDescription'
  | 'parlayCreated'
  | 'parlayCreatedSuccess'
  | 'parlayCreatedError'
  | 'parlayCreatedErrorDescription'


// Bets Statistics
  | 'winRate'
  | 'totalProfit'
  | 'roi'
  | 'winRateTrend'
  | 'profitLoss'

  

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
  | 'viewChallenge'
  | 'daysLeft'
  | 'createFirstChallenge'
  | 'challengeClosed'
  | 'challengeClosedMessage'
  | 'noSubmissions'
  | 'submissions'
  | 'joinChallenge'
  | 'submitProof'
  | 'submit'
  | 'voteOnThisSubmission'
  | 'describeProof'
  | 'attachImage'
  | 'imagePlaceholder'
  | 'text'
  | 'image'
  | 'youVoted'
  | 'youSubmitted'
  | 'proofSubmitted'
  | 'youAlreadySubmitted'
  | 'voteRecorded'

  // Chat
  | 'typeAMessage'
  | 'today'
  | 'yesterday'
  | 'headerMessage'
  
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
  | 'daysToGo'
  
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
  | 'changeLanguage'

  // Onboarding
  | 'onboardingTitle1'
  | 'onboardingSubtitle1'
  | 'onboardingTitle2'
  | 'onboardingSubtitle2'
  | 'onboardingTitle3'
  | 'onboardingSubtitle3'
  | 'onboardingNext'
  | 'onboardingStart'
  | 'viewTutorial'

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
    thankYou: 'Thank you!',
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
    createGroup: 'Create',
    joinGroup: 'Join',
    viewMoreGroups: 'View more groups',
    open: 'Open',
    closed: 'Closed',
    settled: 'Settled',
    unknown: 'Unknown',
    yourCoins: 'Coins',
    yourOpenBets: 'Your Bets',
    yourOpenBetsActive: 'Open',
    
    // Groups
    groups: 'Groups',
    enterGroupName: 'Enter Group Name',
    groupDescriptionPlaceholder: 'What\'s this group about?',
    howToGetInviteCode: 'How to get an invite code?',
    inviteCodeInstructions: 'Ask your friend to share their group\'s invite code with you. They can find it in the group details screen.',
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
    noYourOpenBets: 'No open bets',

    // Parlays
    parlays: 'Parlays',
    newParlay: 'New Parlay',
    noParlays: 'No parlays found',
    createFirstParlayMessage: 'Create the first parlay and invite your friends to participate!',
    createParlay: 'Create Parlay',
    selectBets: 'Select Bets',
    selectBetsDescription: 'Select the bets you want to include in your parlay',
    parlayCreated: 'Parlay Created',
    parlayCreatedSuccess: 'Your parlay has been created successfully. Share it with your friends to start playing!',
    parlayCreatedError: 'Error creating parlay',
    parlayCreatedErrorDescription: 'Please try again',

  // -----
  myBets: 'My Bets',
  statistics: 'Statistics',
  performance: 'Performance',
  totalBets: 'Total Bets',
  totalWins: 'Total Wins',
  totalLosses: 'Total Losses',
  totalProfit: 'Total Profit',
  totalROI: 'Total ROI',
  won: 'Won',
  lost: 'Lost',
  active: 'Active',
  winRate: 'Win Rate',
  roi: 'ROI',
  winRateTrend: 'Win Rate Trend',
  profitLoss: 'Profit/Loss',
  all: 'All',
  noBetsFound: 'No bets found',
  noBetsDescription: 'No bets done yet',
  searchBets: 'Search Bets',
  winningOption: 'Winning Option',
  errorSettingWinningOption: 'Error setting winning option',
  setWinningOption: 'Set Winning Option',
  selectWinningOptionDescription: 'Select the winning option for this bet',
  confirmWinningOption: 'Confirm Winning Option',
  setAsWinner: 'Set as Winner',
  asWinner: 'As Winner',
  confirmWinningOptionMessage: 'Are you sure you want to set this option as the winning option?',
  winningOptionSet: 'Winning option set',


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
    viewChallenge: 'View Challenge',
    daysLeft: 'Days Left',
    createFirstChallenge: 'Create your first challenge!',
    challengeClosed: 'Challenge Closed',
    challengeClosedMessage: 'This challenge is no longer open for participation',
    submissions: 'Submissions',
    noSubmissions: 'No submissions',
    joinChallenge: 'Join Challenge',
    submitProof: 'Submit Proof',
    submit: 'Submit',
    voteOnThisSubmission: 'Vote on this Submission',
    describeProof: 'Describe your proof',
    attachImage: 'Attach Image',
    imagePlaceholder: 'Image',
    text: 'Text',
    image: 'Image',
    youVoted: 'You voted on this submission',
    youSubmitted: 'You submitted a proof',
    proofSubmitted: 'Proof submitted',
    youAlreadySubmitted: 'You have already submitted your proof',
    voteRecorded: 'Vote recorded',

    // Chat
    typeAMessage: 'Type a message...',
    today: 'Today',
    yesterday: 'Yesterday',
    headerMessage: '(We Just save last 50 messages)',

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
    daysToGo: 'days to reset',
    
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
    changeLanguage: 'Change Language',

    // Onboarding
    onboardingTitle1: 'Friendly Betting',
    onboardingSubtitle1: 'ViBets allows you to create and participate in friendly bets of any kind. From sporting events to personal predictions, everything is recorded without using real money (for now 😉)',
    onboardingTitle2: 'Create Groups and Compete',
    onboardingSubtitle2: 'Form groups with your friends, family or colleagues. Create custom bets and launch fun challenges on any event. From sports matches to personal predictions, everything goes in the competition to be the best!',
    onboardingTitle3: 'Track Your Stats',
    onboardingSubtitle3: 'Keep track of your wins, losses and successful predictions. Communicate with your group through the integrated chat to discuss results, show off your victories and share fun moments. Become the GOAT of GOATs among your friends!',
    onboardingNext: 'Next',
    onboardingStart: 'Get Started!',
    viewTutorial: 'View Tutorial'
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
    thankYou: '¡Gracias!',
    
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
    createGroup: 'Crear',
    joinGroup: 'Unirme',
    viewMoreGroups: 'Ver más grupos',
    open: 'Abierta',
    closed: 'Cerrada',
    settled: 'Resuelta',
    unknown: 'Desconocida',
    yourCoins: 'Monedas',
    yourOpenBets: 'Tus Apuestas',
    yourOpenBetsActive: 'Abiertas',

    // Groups
    groups: 'Grupos',
    enterGroupName: 'Ingresa el Nombre del Grupo',
    groupDescriptionPlaceholder: '¿Qué es este grupo?',
    howToGetInviteCode: '¿Cómo obtener un código de invitación?',
    inviteCodeInstructions: 'Pide a tu amigo que comparta su código de invitación con tu grupo. Puedes encontrarlo en la pantalla de detalles del grupo.',
    myGroups: 'Mis Grupos',
    joinedGroups: 'Grupos Unidos',
    createNewGroup: 'Crear Nuevo Grupo',
    joinExistingGroup: 'Unirse a Grupo Existente',
    groupName: 'Nombre del Grupo',
    groupDescription: 'Descripción del Grupo',
    inviteCode: 'Código de Invitación',
    enterInviteCode: 'Ingresa el Código de Invitación',
    members: 'Miembros',
    challenges: 'Retos',
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
    winningOption: 'Opción Ganadora',
    errorSettingWinningOption: 'Error al establecer la opción ganadora',
    setWinningOption: 'Establecer Opción Ganadora',
    selectWinningOptionDescription: 'Selecciona la opción ganadora para esta apuesta',
    confirmWinningOption: 'Confirmar Opción Ganadora',
    setAsWinner: 'Establecer como Ganadora',
    asWinner: 'Como Ganadora',
    confirmWinningOptionMessage: '¿Estás seguro de que quieres establecer esta opción como ganadora?',

    // -----
    myBets: 'Mis Apuestas',
    statistics: 'Estadísticas',
    performance: 'Rendimiento',
    totalBets: 'Total de Apuestas',
    totalWins: 'Total de Victorias',
    totalLosses: 'Total de Derrotas',
    won: 'Ganadas',
    lost: 'Perdidas',
    active: 'Activas',
    winRate: 'Tasa de Victoria',
    totalProfit: 'Ganancia Total',
    roi: 'ROI',
    winRateTrend: 'Tendencia de Victoria',
    all: 'Todas',
    profitLoss: 'Ganancia/Pérdida',
    noBetsFound: 'No se encontraron apuestas',
    noBetsDescription: 'Aún no has realizado ninguna apuesta',
    searchBets: 'Buscar Apuestas',
    noYourOpenBets: 'No tienes apuestas abiertas',
    winningOption: 'Opción Ganadora',
    errorSettingWinningOption: 'Error al establecer la opción ganadora',
    winningOptionSet: 'Opción ganadora establecida',

    // Parlays
    parlays: 'Combinadas',
    newParlay: 'Nueva Combinada',
    noParlays: 'No se encontraron combinadas',
    createFirstParlayMessage: 'Crea la primera combinada y convida a tus amigos a participar!',
    createParlay: 'Crear Combinada',
    selectBets: 'Seleccionar Apuestas',
    selectBetsDescription: 'Selecciona las apuestas que quieres incluir en tu combinada',
    parlayCreated: 'Combinada Creada',
    parlayCreatedSuccess: 'Tu combinada ha sido creada con éxito. Comparte con tus amigos para que igual armen las de ellos!',
    parlayCreatedError: 'Error creando combinada',
    parlayCreatedErrorDescription: 'Por favor, inténtelo de nuevo',



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
    viewChallenge: 'Ver Reto',
    daysLeft: 'Días Restantes',
    createFirstChallenge: 'Crea tu primer reto!',
    challengeClosed: 'Reto Cerrado',
    challengeClosedMessage: 'Este reto ya no está abierto para participar',
    noSubmissions: 'No hay envíos',
    submissions: 'Completados',
    joinChallenge: 'Unirse al Reto',  
    submitProof: 'Enviar Prueba',
    submit: 'Enviar',
    voteOnThisSubmission: 'Votar en esta Prueba',
    describeProof: 'Describe tu prueba',  
    attachImage: 'Añadir Imagen',
    imagePlaceholder: 'Imagen',
    text: 'Texto',
    image: 'Imagen',
    youVoted: 'Has votado en esta prueba',
    youSubmitted: 'Has enviado una prueba',
    proofSubmitted: 'Prueba enviada',
    youAlreadySubmitted: 'Ya has enviado una prueba',
    voteRecorded: 'Voto registrado',

    // Chat
    typeAMessage: 'Escribe un mensaje...',  
    today: 'Hoy',
    yesterday: 'Ayer',
    headerMessage: '(Solo guardamos los últimos 50 mensajes)',

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
    daysToGo: 'días para reiniciar',
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
    changeLanguage: 'Cambiar Idioma',

    // Onboarding
    onboardingTitle1: 'Apuestas Entre Amigos',
    onboardingSubtitle1: 'ViBets te permite crear y participar en apuestas amistosas de cualquier tipo. Desde eventos deportivos hasta predicciones personales, todo queda registrado sin usar dinero real (Por el momento 😉)',
    onboardingTitle2: 'Crea Grupos y Compite',
    onboardingSubtitle2: 'Forma grupos con tus amigos, familiares o colegas. Crea apuestas personalizadas y lanza retos divertidos sobre cualquier evento. Desde partidos deportivos hasta predicciones personales, ¡todo vale en la competencia por ser el mejor!',
    onboardingTitle3: 'Sigue tus Estadísticas',
    onboardingSubtitle3: 'Lleva un registro de tus victorias, derrotas y predicciones acertadas. Comunícate con tu grupo a través del chat integrado para comentar resultados, presumir tus victorias y compartir momentos divertidos. ¡Conviértete en el GOAT de GOATs entre tus amigos!',
    onboardingNext: 'Siguiente',
    onboardingStart: '¡Comenzar!',
    viewTutorial: 'Ver Tutorial'
  }
};

export const useTranslation = (language: Language) => {
  return (key: TranslationKey): string => {
    return translations[language][key] || key;
  };
};