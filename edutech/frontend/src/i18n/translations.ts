/**
 * Multi-language translations for EduAI
 * Supports: Hindi, English, Hinglish
 */

export type Language = 'hindi' | 'english' | 'hinglish';

type TranslationKeys = {
  // Navbar
  nav_home: string;
  nav_courses: string;
  nav_leaderboard: string;
  nav_dashboard: string;
  nav_profile: string;
  nav_login: string;
  nav_signup: string;
  nav_logout: string;

  // Landing Page
  hero_badge: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_subtitle: string;
  hero_cta: string;
  hero_demo: string;
  features_badge: string;
  features_title: string;
  features_subtitle: string;
  how_it_works: string;
  how_step1_title: string;
  how_step1_desc: string;
  how_step2_title: string;
  how_step2_desc: string;
  how_step3_title: string;
  how_step3_desc: string;
  pricing_title: string;
  pricing_subtitle: string;
  cta_title: string;
  cta_subtitle: string;
  cta_button: string;

  // Dashboard
  dashboard_title: string;
  dashboard_welcome: string;
  continue_learning: string;
  weekly_progress: string;
  no_courses: string;

  // Courses
  courses_title: string;
  courses_subtitle: string;
  all_subjects: string;
  no_courses_found: string;
  chapters: string;

  // Profile
  profile_title: string;
  edit_profile: string;
  save_changes: string;
  saving: string;
  full_name: string;
  email: string;
  phone: string;
  settings: string;
  dark_mode: string;
  language: string;
  notifications: string;
  badges: string;
  personal_info: string;

  // Quiz
  quiz_title: string;
  start_quiz: string;
  submit_quiz: string;
  score: string;
  correct: string;

  // Leaderboard
  leaderboard_title: string;
  leaderboard_subtitle: string;
  rank: string;
  level: string;

  // Common
  loading: string;
  error: string;
  no_data: string;
  search: string;
  cancel: string;
  delete: string;
  confirm: string;
  total_xp: string;
  streak: string;

  // Footer
  footer_desc: string;
  footer_platform: string;
  footer_support: string;
  footer_resources: string;
  footer_copyright: string;
  footer_made_in: string;

  // Auth
  login_title: string;
  login_subtitle: string;
  signup_title: string;
  signup_subtitle: string;
  password: string;
  login_button: string;
  signup_button: string;
  no_account: string;
  have_account: string;

  // Features (landing)
  feat_ai_tutor: string;
  feat_ai_tutor_desc: string;
  feat_voice: string;
  feat_voice_desc: string;
  feat_gamified: string;
  feat_gamified_desc: string;
  feat_analytics: string;
  feat_analytics_desc: string;
  feat_parent: string;
  feat_parent_desc: string;
  feat_syllabus: string;
  feat_syllabus_desc: string;
};

const translations: Record<Language, TranslationKeys> = {
  hindi: {
    // Navbar
    nav_home: 'होम',
    nav_courses: 'कोर्सेज़',
    nav_leaderboard: 'लीडरबोर्ड',
    nav_dashboard: 'डैशबोर्ड',
    nav_profile: 'प्रोफ़ाइल',
    nav_login: 'लॉगिन',
    nav_signup: 'साइन अप',
    nav_logout: 'लॉगआउट',

    // Landing Page
    hero_badge: 'भारत का #1 AI शिक्षा प्लेटफॉर्म',
    hero_title_1: 'पढ़ाई को',
    hero_title_2: 'बनाओ स्मार्ट',
    hero_subtitle: 'AI टीचर जो तुम्हारी भाषा में समझाए, क्विज़ से टेस्ट करे, और गेम्स जैसा फन लर्निंग अनुभव दे। कक्षा 6-12 CBSE सिलेबस रेडी!',
    hero_cta: 'फ्री पढ़ाई शुरू करो',
    hero_demo: 'डेमो देखो',
    features_badge: 'फीचर्स',
    features_title: 'क्या मिलेगा तुम्हें?',
    features_subtitle: 'हर वो फीचर जो तुम्हारी पढ़ाई को नेक्स्ट लेवल पे ले जाए',
    how_it_works: 'कैसे काम करता है',
    how_step1_title: 'साइन अप करो',
    how_step1_desc: 'फ्री अकाउंट बनाओ और अपनी क्लास/बोर्ड सेलेक्ट करो',
    how_step2_title: 'कोर्स सेलेक्ट करो',
    how_step2_desc: 'अपना सब्जेक्ट चूज़ करो और चैप्टर्स एक्सप्लोर करो',
    how_step3_title: 'पढ़ना शुरू!',
    how_step3_desc: 'AI टीचर से सीखो, क्विज़ दो, XP कमाओ!',
    pricing_title: 'अपना प्लान चूज़ करो',
    pricing_subtitle: 'फ्री से शुरू करो, जब मन करे अपग्रेड करो',
    cta_title: 'आज ही शुरू करो अपनी स्मार्ट पढ़ाई!',
    cta_subtitle: '50,000+ स्टूडेंट्स पहले से जुड़ चुके हैं। अब तुम्हारी बारी!',
    cta_button: 'EduAI फ्री जॉइन करो',

    // Dashboard
    dashboard_title: 'डैशबोर्ड',
    dashboard_welcome: 'वापस स्वागत है',
    continue_learning: 'पढ़ाई जारी रखो',
    weekly_progress: 'साप्ताहिक प्रगति',
    no_courses: 'कोई कोर्स नहीं मिला',

    // Courses
    courses_title: 'कोर्सेज़ एक्सप्लोर करो',
    courses_subtitle: 'अपनी पसंद का सब्जेक्ट चूज़ करो और सीखना शुरू करो',
    all_subjects: 'सभी सब्जेक्ट',
    no_courses_found: 'कोई कोर्स नहीं मिला',
    chapters: 'चैप्टर्स',

    // Profile
    profile_title: 'प्रोफ़ाइल',
    edit_profile: 'प्रोफ़ाइल एडिट करो',
    save_changes: 'बदलाव सेव करो',
    saving: 'सेव हो रहा है...',
    full_name: 'पूरा नाम',
    email: 'ईमेल',
    phone: 'फ़ोन',
    settings: 'सेटिंग्स',
    dark_mode: 'डार्क मोड',
    language: 'भाषा',
    notifications: 'नोटिफिकेशन',
    badges: 'बैजेस',
    personal_info: 'व्यक्तिगत जानकारी',

    // Quiz
    quiz_title: 'क्विज़ टाइम',
    start_quiz: 'क्विज़ शुरू करो',
    submit_quiz: 'क्विज़ सबमिट करो',
    score: 'स्कोर',
    correct: 'सही',

    // Leaderboard
    leaderboard_title: 'लीडरबोर्ड',
    leaderboard_subtitle: 'टॉप स्टूडेंट्स',
    rank: 'रैंक',
    level: 'लेवल',

    // Common
    loading: 'लोड हो रहा है...',
    error: 'कुछ गलत हो गया',
    no_data: 'कोई डेटा नहीं',
    search: 'खोजें...',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    confirm: 'पुष्टि करें',
    total_xp: 'कुल XP',
    streak: 'स्ट्रीक',

    // Footer
    footer_desc: 'AI-संचालित शिक्षा प्लेटफॉर्म जो हर स्टूडेंट को स्मार्ट, फन और इंटरैक्टिव तरीके से पढ़ाता है।',
    footer_platform: 'प्लेटफॉर्म',
    footer_support: 'सपोर्ट',
    footer_resources: 'रिसोर्सेज़',
    footer_copyright: '© 2026 EduAI. सर्वाधिकार सुरक्षित।',
    footer_made_in: 'भारत में बना',

    // Auth
    login_title: 'वापस स्वागत है!',
    login_subtitle: 'अपनी पढ़ाई जारी रखने के लिए लॉगिन करो',
    signup_title: 'स्मार्ट पढ़ाई शुरू करो',
    signup_subtitle: 'फ्री अकाउंट बनाओ और AI-पावर्ड लर्निंग शुरू करो',
    password: 'पासवर्ड',
    login_button: 'लॉगिन करो',
    signup_button: 'अकाउंट बनाओ',
    no_account: 'अकाउंट नहीं है?',
    have_account: 'पहले से अकाउंट है?',

    // Features
    feat_ai_tutor: 'AI-पावर्ड ट्यूटर',
    feat_ai_tutor_desc: 'Gemini AI से स्मार्ट जवाब, Socratic मेथड से समझाए',
    feat_voice: 'AI वॉइस टीचर',
    feat_voice_desc: 'एनिमेटेड कैरेक्टर जो हिंदी/इंग्लिश में बात करे',
    feat_gamified: 'गेमिफाइड लर्निंग',
    feat_gamified_desc: 'XP पॉइंट्स, स्ट्रीक्स, बैजेस, लीडरबोर्ड - Duolingo स्टाइल!',
    feat_analytics: 'स्मार्ट एनालिटिक्स',
    feat_analytics_desc: 'कमज़ोर टॉपिक्स पहचानो और adaptive difficulty से सुधार करो',
    feat_parent: 'पैरेंट डैशबोर्ड',
    feat_parent_desc: 'बच्चे की प्रगति ट्रैक करो, स्टडी टाइम कंट्रोल करो',
    feat_syllabus: 'CBSE सिलेबस बेस्ड',
    feat_syllabus_desc: 'कक्षा 6-12 का कम्प्लीट सिलेबस, चैप्टर-वाइज़ कवरेज',
  },

  english: {
    // Navbar
    nav_home: 'Home',
    nav_courses: 'Courses',
    nav_leaderboard: 'Leaderboard',
    nav_dashboard: 'Dashboard',
    nav_profile: 'Profile',
    nav_login: 'Login',
    nav_signup: 'Sign Up',
    nav_logout: 'Logout',

    // Landing Page
    hero_badge: "India's #1 AI Education Platform",
    hero_title_1: 'Make Learning',
    hero_title_2: 'Super Smart',
    hero_subtitle: 'AI teacher that explains in your language, tests with quizzes, and makes learning fun like a game. Class 6-12 CBSE syllabus ready!',
    hero_cta: 'Start Free Learning',
    hero_demo: 'Watch Demo',
    features_badge: 'Features',
    features_title: 'What Do You Get?',
    features_subtitle: 'Every feature to take your learning to the next level',
    how_it_works: 'How It Works',
    how_step1_title: 'Sign Up',
    how_step1_desc: 'Create a free account and select your class/board',
    how_step2_title: 'Select Course',
    how_step2_desc: 'Choose your subject and explore chapters',
    how_step3_title: 'Start Learning!',
    how_step3_desc: 'Learn from AI teacher, take quizzes, earn XP!',
    pricing_title: 'Choose Your Plan',
    pricing_subtitle: 'Start free, upgrade when you want',
    cta_title: 'Start Your Smart Learning Today!',
    cta_subtitle: '50,000+ students have already joined. Now it\'s your turn!',
    cta_button: 'Join EduAI Free',

    // Dashboard
    dashboard_title: 'Dashboard',
    dashboard_welcome: 'Welcome Back',
    continue_learning: 'Continue Learning',
    weekly_progress: 'Weekly Progress',
    no_courses: 'No courses found',

    // Courses
    courses_title: 'Explore Courses',
    courses_subtitle: 'Choose your favorite subject and start learning',
    all_subjects: 'All Subjects',
    no_courses_found: 'No courses found',
    chapters: 'Chapters',

    // Profile
    profile_title: 'Profile',
    edit_profile: 'Edit Profile',
    save_changes: 'Save Changes',
    saving: 'Saving...',
    full_name: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    settings: 'Settings',
    dark_mode: 'Dark Mode',
    language: 'Language',
    notifications: 'Notifications',
    badges: 'Badges',
    personal_info: 'Personal Information',

    // Quiz
    quiz_title: 'Quiz Time',
    start_quiz: 'Start Quiz',
    submit_quiz: 'Submit Quiz',
    score: 'Score',
    correct: 'Correct',

    // Leaderboard
    leaderboard_title: 'Leaderboard',
    leaderboard_subtitle: 'Top Students',
    rank: 'Rank',
    level: 'Level',

    // Common
    loading: 'Loading...',
    error: 'Something went wrong',
    no_data: 'No data available',
    search: 'Search...',
    cancel: 'Cancel',
    delete: 'Delete',
    confirm: 'Confirm',
    total_xp: 'Total XP',
    streak: 'Streak',

    // Footer
    footer_desc: 'AI-powered education platform that teaches every student in a smart, fun and interactive way.',
    footer_platform: 'Platform',
    footer_support: 'Support',
    footer_resources: 'Resources',
    footer_copyright: '© 2026 EduAI. All rights reserved.',
    footer_made_in: 'Made in India',

    // Auth
    login_title: 'Welcome Back!',
    login_subtitle: 'Login to continue your learning journey',
    signup_title: 'Start Smart Learning',
    signup_subtitle: 'Create a free account and start AI-powered learning',
    password: 'Password',
    login_button: 'Login',
    signup_button: 'Create Account',
    no_account: "Don't have an account?",
    have_account: 'Already have an account?',

    // Features
    feat_ai_tutor: 'AI-Powered Tutor',
    feat_ai_tutor_desc: 'Smart answers from Gemini AI, explained with Socratic method',
    feat_voice: 'AI Voice Teacher',
    feat_voice_desc: 'Animated character that talks in Hindi/English',
    feat_gamified: 'Gamified Learning',
    feat_gamified_desc: 'XP points, streaks, badges, leaderboard - Duolingo style!',
    feat_analytics: 'Smart Analytics',
    feat_analytics_desc: 'Identify weak topics and improve with adaptive difficulty',
    feat_parent: 'Parent Dashboard',
    feat_parent_desc: 'Track your child\'s progress, control study time',
    feat_syllabus: 'CBSE Syllabus Based',
    feat_syllabus_desc: 'Complete syllabus for Class 6-12, chapter-wise coverage',
  },

  hinglish: {
    // Navbar
    nav_home: 'Home',
    nav_courses: 'Courses',
    nav_leaderboard: 'Leaderboard',
    nav_dashboard: 'Dashboard',
    nav_profile: 'Profile',
    nav_login: 'Login',
    nav_signup: 'Sign Up Free',
    nav_logout: 'Logout',

    // Landing Page
    hero_badge: "India's #1 AI Education Platform",
    hero_title_1: 'Padhai Ko',
    hero_title_2: 'Banao Smart',
    hero_subtitle: 'AI teacher jo tumhari language mein samjhaye, quizzes se test kare, aur games jaisa fun learning experience de. Class 6-12 CBSE syllabus ready!',
    hero_cta: 'Start Free Padhai',
    hero_demo: 'Watch Demo',
    features_badge: 'Features',
    features_title: 'Kya Milega Tumhe?',
    features_subtitle: 'Har wo feature jo tumhari padhai ko next level pe le jaaye',
    how_it_works: 'How It Works',
    how_step1_title: 'Sign Up Karo',
    how_step1_desc: 'Free account banao aur apna class/board select karo',
    how_step2_title: 'Course Select Karo',
    how_step2_desc: 'Apna subject choose karo aur chapters explore karo',
    how_step3_title: 'Padhna Shuru!',
    how_step3_desc: 'AI teacher se seekho, quiz do, XP kamao!',
    pricing_title: 'Apna Plan Choose Karo',
    pricing_subtitle: 'Free se start karo, jab mann kare upgrade karo',
    cta_title: 'Aaj Hi Shuru Karo Apni Smart Padhai!',
    cta_subtitle: '50,000+ students already join kar chuke hai. Ab tumhari baari!',
    cta_button: 'Join EduAI Free',

    // Dashboard
    dashboard_title: 'Dashboard',
    dashboard_welcome: 'Welcome Back',
    continue_learning: 'Padhai Continue Karo',
    weekly_progress: 'Weekly Progress',
    no_courses: 'Koi course nahi mila',

    // Courses
    courses_title: 'Courses Explore Karo',
    courses_subtitle: 'Apni pasand ka subject choose karo aur seekhna shuru karo',
    all_subjects: 'All Subjects',
    no_courses_found: 'Koi course nahi mila',
    chapters: 'Chapters',

    // Profile
    profile_title: 'Profile',
    edit_profile: 'Edit Profile',
    save_changes: 'Save Changes',
    saving: 'Saving...',
    full_name: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    settings: 'Settings',
    dark_mode: 'Dark Mode',
    language: 'Language',
    notifications: 'Notifications',
    badges: 'Badges',
    personal_info: 'Personal Information',

    // Quiz
    quiz_title: 'Quiz Time',
    start_quiz: 'Quiz Shuru Karo',
    submit_quiz: 'Quiz Submit Karo',
    score: 'Score',
    correct: 'Correct',

    // Leaderboard
    leaderboard_title: 'Leaderboard',
    leaderboard_subtitle: 'Top Students',
    rank: 'Rank',
    level: 'Level',

    // Common
    loading: 'Loading...',
    error: 'Kuch galat ho gaya',
    no_data: 'Koi data nahi hai',
    search: 'Search karo...',
    cancel: 'Cancel',
    delete: 'Delete',
    confirm: 'Confirm',
    total_xp: 'Total XP',
    streak: 'Streak',

    // Footer
    footer_desc: 'AI-powered education platform jo har student ko smart, fun aur interactive tarike se padhata hai.',
    footer_platform: 'Platform',
    footer_support: 'Support',
    footer_resources: 'Resources',
    footer_copyright: '© 2026 EduAI. All rights reserved.',
    footer_made_in: 'Made with love in India',

    // Auth
    login_title: 'Welcome Back!',
    login_subtitle: 'Apni padhai continue karne ke liye login karo',
    signup_title: 'Smart Padhai Shuru Karo',
    signup_subtitle: 'Free account banao aur AI-powered learning shuru karo',
    password: 'Password',
    login_button: 'Login Karo',
    signup_button: 'Account Banao',
    no_account: 'Account nahi hai?',
    have_account: 'Pehle se account hai?',

    // Features
    feat_ai_tutor: 'AI-Powered Tutor',
    feat_ai_tutor_desc: 'Gemini AI se smart answers, Socratic method se samjhaye',
    feat_voice: 'AI Voice Teacher',
    feat_voice_desc: 'Animated character jo Hindi/English mein baat kare',
    feat_gamified: 'Gamified Learning',
    feat_gamified_desc: 'XP points, streaks, badges, leaderboard - Duolingo style!',
    feat_analytics: 'Smart Analytics',
    feat_analytics_desc: 'Weak topics identify karo aur adaptive difficulty se improve karo',
    feat_parent: 'Parent Dashboard',
    feat_parent_desc: 'Bachche ki progress track karo, study time control karo',
    feat_syllabus: 'CBSE Syllabus Based',
    feat_syllabus_desc: 'Class 6-12 ka complete syllabus, chapter-wise coverage',
  },
};

export default translations;
