/**
 * API Service Layer - Frontend ko Backend se connect karta hai
 * ============================================================
 * Saare backend API calls yahan se hote hain.
 * JWT token management, error handling, aur request interceptors included.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://app-iiglqgra.fly.dev';

// ============================
// Token Management
// ============================

export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('auth_token');
}

// ============================
// Base Request Helper
// ============================

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, params } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let url = `${API_BASE_URL}${endpoint}`;

  // Add query params
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) {
      url += `?${qs}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorDetail = 'Something went wrong';
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorData.message || errorDetail;
    } catch {
      // ignore JSON parse errors
    }

    if (response.status === 401) {
      removeToken();
    }

    throw new ApiError(errorDetail, response.status);
  }

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ============================
// Auth API
// ============================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'parent';
  phone?: string;
  grade?: string;
  board?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'parent' | 'admin';
    avatar: string;
    xp: number;
    level: number;
    streak: number;
    subscription: string;
    phone?: string;
    grade?: string;
    board?: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'parent' | 'admin';
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  subscription: string;
  phone?: string;
  grade?: string;
  board?: string;
  created_at?: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: data, auth: false }),

  register: (data: RegisterRequest) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: data, auth: false }),

  getMe: async () => {
    const res = await request<{ user: UserProfile }>('/auth/me');
    return res.user;
  },

  updateProfile: (data: { name?: string; phone?: string; avatar?: string; grade?: string; board?: string }) =>
    request<{ message: string }>('/auth/me', { method: 'PUT', body: data }),

  changePassword: (data: { current_password: string; new_password: string }) =>
    request<{ message: string }>('/auth/password', { method: 'PUT', body: data }),
};

// ============================
// Courses API
// ============================

export interface Course {
  id: string;
  title: string;
  subject: string;
  grade: number;
  board: string;
  icon: string;
  color: string;
  description: string;
  created_at?: string;
}

export interface Chapter {
  id: string;
  course_id: string;
  title: string;
  content: string;
  video_url: string;
  order: number;
}

export interface CourseProgress {
  course_id: string;
  chapter_id: string;
  completed: boolean;
  completed_at?: string;
}

export const coursesApi = {
  getAll: (params?: { subject?: string; grade?: number; board?: string }) =>
    request<{ courses: Course[]; total: number }>('/courses/', { params }),

  getById: async (id: string) => {
    const res = await request<{ course: Course }>(`/courses/${id}`);
    return res.course;
  },

  getChapters: (courseId: string) =>
    request<{ chapters: Chapter[]; total: number }>(`/courses/${courseId}/chapters`),

  markChapterComplete: (data: { course_id: string; chapter_id: string }) =>
    request<{ message: string; xp_earned: number; total_xp?: number; level?: number }>('/courses/progress', { method: 'POST', body: data }),

  getMyProgress: () =>
    request<{ progress: CourseProgress[] }>('/courses/progress/me'),
};

// ============================
// Quiz API
// ============================

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  difficulty: string;
  subject: string;
}

export interface QuizStart {
  quiz_id: string;
  questions: QuizQuestion[];
  total_questions: number;
  time_per_question: number;
}

export interface QuizSubmitRequest {
  quiz_id: string;
  answers: { question_id: string; selected_option: number }[];
}

export interface QuizResult {
  message: string;
  score: number;
  correct_count: number;
  total_questions: number;
  xp_earned: number;
  results: {
    question_id: string;
    correct: boolean;
    correct_option: number;
    selected_option: number;
    explanation: string;
  }[];
}

export interface QuizHistory {
  id: string;
  subject: string;
  score: number;
  correct_count: number;
  total_questions: number;
  xp_earned: number;
  status: string;
  completed_at: string;
}

export const quizApi = {
  start: (params?: { subject?: string; difficulty?: string; count?: number }) =>
    request<QuizStart>('/quiz/start', { params }),

  submit: (data: QuizSubmitRequest) =>
    request<QuizResult>('/quiz/submit', { method: 'POST', body: data }),

  getHistory: (params?: { limit?: number }) =>
    request<{ history: QuizHistory[]; total: number }>('/quiz/history', { params }),

  getHistoryById: (id: string) =>
    request<QuizHistory>(`/quiz/history/${id}`),
};

// ============================
// Gamification API
// ============================

export interface GamificationStats {
  xp: number;
  level: number;
  streak: number;
  xp_for_next_level: number;
  total_quizzes: number;
  total_chapters: number;
  badges_earned: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  condition_type: string;
  condition_value: number;
  unlocked?: boolean;
}

export interface DailyGoal {
  id: string;
  label: string;
  current: number;
  target: number;
  color: string;
}

export const gamificationApi = {
  getStats: () =>
    request<GamificationStats>('/gamification/stats'),

  getLeaderboard: (params?: { period?: string; limit?: number }) =>
    request<{ leaderboard: LeaderboardEntry[]; total: number }>('/gamification/leaderboard', { params }),

  getBadges: () =>
    request<{ badges: Badge[] }>('/gamification/badges'),

  getMyBadges: () =>
    request<{ badges: Badge[] }>('/gamification/my-badges'),

  checkBadges: () =>
    request<{ new_badges: Badge[] }>('/gamification/check-badges', { method: 'POST' }),

  getDailyGoals: () =>
    request<{ goals: DailyGoal[] }>('/gamification/daily-goals'),
};

// ============================
// Store API (Avatars)
// ============================

export interface Avatar {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: string;
  price: number;
  owned?: boolean;
  equipped?: boolean;
  can_afford?: boolean;
}

export interface InventoryItem {
  avatar_id: string;
  purchased_at: string;
}

export const storeApi = {
  getAvatars: () =>
    request<{ avatars: Avatar[]; user_xp: number }>('/store/avatars'),

  getInventory: () =>
    request<{ inventory: InventoryItem[] }>('/store/inventory'),

  buy: (avatarId: string) =>
    request<{ message: string }>('/store/buy', { method: 'POST', body: { avatar_id: avatarId } }),

  equip: (avatarId: string) =>
    request<{ message: string }>('/store/equip', { method: 'POST', body: { avatar_id: avatarId } }),
};

// ============================
// AI Tutor API
// ============================

export interface AiChatRequest {
  message: string;
  subject?: string;
  chapter?: string;
  context?: string;
}

export interface AiChatResponse {
  response: string;
  subject: string;
  xp_spent?: number;
  remaining_xp?: number;
}

export interface LessonSlide {
  slide: number;
  title: string;
  text: string;
  emoji: string;
}

export interface GenerateLessonRequest {
  topic: string;
  subject?: string;
  grade?: number;
  language?: string;
  character_name?: string;
}

export interface GenerateLessonResponse {
  topic: string;
  subject: string;
  grade: number;
  character: string;
  language: string;
  slides: LessonSlide[];
  xp_spent?: number;
  remaining_xp?: number;
}

export const aiApi = {
  chat: (data: AiChatRequest) =>
    request<AiChatResponse>('/ai/chat', { method: 'POST', body: data }),

  explain: (data: { topic: string; level?: string }) =>
    request<{ explanation: string }>('/ai/explain', { method: 'POST', body: data }),

  doubt: (data: { question: string; subject?: string }) =>
    request<{ answer: string }>('/ai/doubt', { method: 'POST', body: data }),

  generateNotes: (data: { topic: string; subject?: string }) =>
    request<{ notes: string }>('/ai/notes', { method: 'POST', body: data }),

  generateLesson: (data: GenerateLessonRequest) =>
    request<GenerateLessonResponse>('/ai/generate-lesson', { method: 'POST', body: data }),

  tts: (data: { text: string; language?: string }) =>
    request<{ audio_url: string }>('/ai/tts', { method: 'POST', body: data }),

  getHistory: () =>
    request<{ history: { id: string; message: string; reply: string; timestamp: string }[] }>('/ai/history'),
};

// ============================
// Parent Dashboard API
// ============================

export interface ChildInfo {
  id: string;
  name: string;
  email: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  daily_limit_minutes: number;
  linked_at: string;
}

export interface ChildProgress {
  child: {
    name: string;
    avatar?: string;
    xp: number;
    level: number;
    streak: number;
  };
  course_progress: {
    course_name: string;
    subject: string;
    completed_chapters: number;
    total_chapters: number;
    percentage: number;
  }[];
  quiz_stats: {
    total_quizzes: number;
    average_score: number;
  };
}

export interface ChildActivity {
  id: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export const parentApi = {
  linkChild: (childEmail: string) =>
    request<{ message: string; child: { id: string; name: string; email: string; xp: number; level: number } }>(
      '/parent/link-child', { method: 'POST', body: { child_email: childEmail } }
    ),

  getChildren: () =>
    request<{ children: ChildInfo[]; total: number }>('/parent/children'),

  getChildProgress: (childId: string) =>
    request<ChildProgress>(`/parent/child/${childId}/progress`),

  getChildActivity: (childId: string, limit?: number) =>
    request<{ activities: ChildActivity[]; total: number }>(
      `/parent/child/${childId}/activity`, { params: { limit } }
    ),

  setStudyLimits: (childId: string, data: { daily_limit_minutes?: number; quiz_limit_per_day?: number; break_reminder_minutes?: number }) =>
    request<{ message: string; limits: Record<string, number> }>(
      `/parent/child/${childId}/limits`, { method: 'PUT', body: data }
    ),
};

// ============================
// Admin Dashboard API
// ============================

export interface PlatformStats {
  stats: {
    users: { total: number; students: number; parents: number; admins: number };
    content: { total_courses: number; total_quizzes_taken: number; chapters_completed: number };
    revenue: { free_users: number; pro_users: number; premium_users: number; estimated_monthly_revenue: number };
    activity: { last_24h_activities: number };
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  xp: number;
  level: number;
  subscription: string;
  created_at: string;
}

export const adminApi = {
  getStats: () =>
    request<PlatformStats>('/admin/stats'),

  getUsers: (params?: { role?: string; search?: string; limit?: number; skip?: number }) =>
    request<{ users: AdminUser[]; total: number; skip: number; limit: number }>('/admin/users', { params }),

  changeUserRole: (userId: string, role: string) =>
    request<{ message: string }>(`/admin/users/${userId}/role`, { method: 'PUT', body: { role } }),

  deleteUser: (userId: string) =>
    request<{ message: string }>(`/admin/users/${userId}`, { method: 'DELETE' }),

  createCourse: (data: { title: string; subject: string; grade: number; board?: string; icon?: string; color?: string; description?: string }) =>
    request<{ message: string; course_id: string }>('/admin/courses', { method: 'POST', body: data }),

  updateCourse: (courseId: string, data: Record<string, unknown>) =>
    request<{ message: string }>(`/admin/courses/${courseId}`, { method: 'PUT', body: data }),

  deleteCourse: (courseId: string) =>
    request<{ message: string }>(`/admin/courses/${courseId}`, { method: 'DELETE' }),

  createChapter: (data: { course_id: string; title: string; content?: string; video_url?: string; order?: number }) =>
    request<{ message: string; chapter_id: string }>('/admin/chapters', { method: 'POST', body: data }),

  createBadge: (data: { name: string; description?: string; icon?: string; rarity?: string; condition_type: string; condition_value: number }) =>
    request<{ message: string; badge_id: string }>('/admin/badges', { method: 'POST', body: data }),

  createAvatar: (data: { name: string; emoji?: string; description?: string; rarity?: string; price?: number }) =>
    request<{ message: string; avatar_id: string }>('/admin/avatars', { method: 'POST', body: data }),

  addQuizQuestions: (questions: { question: string; options: string[]; correct_option: number; subject: string; grade?: number; difficulty?: string; explanation?: string }[]) =>
    request<{ message: string; count: number }>('/admin/quiz-questions', { method: 'POST', body: questions }),
};

// ============================
// Analytics API
// ============================

export interface StudyTimeData {
  study_time: {
    total_minutes: number;
    total_hours: number;
    average_daily_minutes: number;
    active_days: number;
    total_days: number;
  };
  daily_breakdown: {
    date: string;
    estimated_minutes: number;
    chapters_completed: number;
    quizzes_taken: number;
    total_activities: number;
  }[];
}

export interface PerformanceData {
  overall: {
    total_quizzes: number;
    average_score: number;
    total_xp_earned: number;
  };
  subject_performance: {
    subject: string;
    total_quizzes: number;
    average_score: number;
    accuracy: number;
    total_xp_earned: number;
    trend: string;
    best_score: number;
    worst_score: number;
  }[];
  period_days: number;
}

export interface WeeklyReport {
  weekly_report: {
    period: string;
    quizzes_taken: number;
    average_quiz_score: number;
    best_quiz_score: number;
    chapters_completed: number;
    total_activities: number;
    xp_earned_this_week: number;
    estimated_study_hours: number;
    current_streak: number;
    current_level: number;
    total_xp: number;
  };
}

export const analyticsApi = {
  getStudyTime: (days?: number) =>
    request<StudyTimeData>('/analytics/study-time', { params: { days } }),

  getPerformance: (days?: number) =>
    request<PerformanceData>('/analytics/performance', { params: { days } }),

  getWeakAreas: () =>
    request<{
      weak_areas: { subject: string; average_score: number; quizzes_taken: number; needs_improvement: boolean; suggestion?: string }[];
      strong_areas: { subject: string; average_score: number; quizzes_taken: number; needs_improvement: boolean }[];
      not_started_courses: { course: string; subject: string; grade: number }[];
      summary: { total_subjects_attempted: number; weak_count: number; strong_count: number };
    }>('/analytics/weak-areas'),

  getRecommendations: () =>
    request<{
      recommendations: { type: string; priority: string; message: string; action: string }[];
      current_stats: { xp: number; level: number; streak: number; total_quizzes: number; total_chapters: number; recent_average: number };
    }>('/analytics/recommendations'),

  getWeeklyReport: () =>
    request<WeeklyReport>('/analytics/weekly-report'),

  logStudyTime: (data: { minutes: number; course_id?: string; chapter_id?: string; activity_type?: string }) =>
    request<{ message: string; minutes: number }>('/analytics/study-time', { method: 'POST', body: data }),
};

// ============================
// Notifications API
// ============================

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const notificationsApi = {
  getAll: (params?: { unread_only?: boolean; limit?: number }) =>
    request<{ notifications: Notification[]; total: number }>('/notifications/', { params }),

  getUnreadCount: () =>
    request<{ unread_count: number }>('/notifications/unread-count'),

  markAsRead: (notificationId: string) =>
    request<{ message: string }>(`/notifications/${notificationId}/read`, { method: 'PUT' }),

  markAllAsRead: () =>
    request<{ message: string; updated_count: number }>('/notifications/read-all', { method: 'PUT' }),
};


// ============================
// Payment & Membership API
// ============================

export interface MembershipPlan {
  id: string;
  name: string;
  amount: number;
  amount_display: string;
  currency: string;
  duration_days: number;
  features: string[];
  description: string;
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  name: string;
  description: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
}

export interface MembershipStatus {
  subscription: string;
  membership: {
    plan_id: string;
    status: string;
    started_at: string;
    expires_at: string;
  };
  is_premium: boolean;
  features: string[];
  xp: number;
}

export interface PaymentHistoryItem {
  id: string;
  plan: string;
  plan_name: string;
  amount: number;
  amount_display: string;
  status: string;
  created_at: string;
  paid_at: string;
}

export const paymentApi = {
  getPlans: () =>
    request<{ plans: MembershipPlan[] }>('/payment/plans', { auth: false }),

  createOrder: (plan_id: string = 'pro') =>
    request<CreateOrderResponse>('/payment/create-order', {
      method: 'POST',
      body: { plan_id },
    }),

  verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    request<{ message: string; membership: { plan: string; status: string; started_at: string; expires_at: string; features: string[] } }>(
      '/payment/verify',
      { method: 'POST', body: data }
    ),

  getStatus: () =>
    request<MembershipStatus>('/payment/status'),

  getHistory: () =>
    request<{ payments: PaymentHistoryItem[]; total: number }>('/payment/history'),
};
