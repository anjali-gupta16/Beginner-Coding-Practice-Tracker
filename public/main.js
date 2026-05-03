/* ========================================
   CodePulse  App Logic
   ======================================== */

(function () {
    'use strict';

    //  Auth & API 
    const API_URL = '/api';
    let currentUser = null;
    let syncTimeout = null;

    async function syncToAPI() {
        if (!currentUser) return;
        clearTimeout(syncTimeout);
        syncTimeout = setTimeout(async () => {
            const payload = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('codepulse_') && key !== 'codepulse_user') {
                    payload[key] = localStorage.getItem(key);
                }
            }
            try {
                await fetch(`${API_URL}/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUser.id, payload })
                });
            } catch (err) { console.error('Sync error:', err); }
        }, 1000);
    }

    const originalSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function(key, value) {
        originalSetItem(key, value);
        if (key.startsWith('codepulse_') && currentUser) {
            syncToAPI();
        }
    };

    async function loadUserData() {
        try {
            const res = await fetch(`${API_URL}/load/${currentUser.id}`);
            if (!res.ok) throw new Error();
            const json = await res.json();
            if (json.data && Object.keys(json.data).length > 0) {
                for (const [key, value] of Object.entries(json.data)) {
                    originalSetItem(key, value);
                }
            } else {
                syncToAPI();
            }
        } catch (e) { console.error('Error loading API data', e); }
    }

    function showAuth() {
        document.querySelector('#auth-overlay')?.classList.add('active');
    }

    function hideAuth() {
        document.querySelector('#auth-overlay')?.classList.remove('active');
        initApp();
    }

    //  Constants 
    const STORAGE_KEY = 'codepulse_sessions';
    const THEME_KEY = 'codepulse_theme';
    const USER_KEY = 'codepulse_user';
    const XP_KEY = 'codepulse_xp';
    const STREAK_FREEZE_KEY = 'codepulse_freeze';
    const WEEKLY_GOAL_KEY = 'codepulse_goal';
    const FIRST_LOGIN_KEY = 'codepulse_first_login';
    const LP_DONE_KEY = 'codepulse_lp_done';
    const MISS_ME_KEY = 'codepulse_missme';

    const QUOTES = [
        { text: "The only way to learn a new programming language is by writing programs in it.", author: "Dennis Ritchie" },
        { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
        { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
        { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
        { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
        { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
        { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
        { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
        { text: "It's not a bug; it's an undocumented feature.", author: "Anonymous" },
        { text: "The most damaging phrase in the language is 'We've always done it this way.'", author: "Grace Hopper" },
        { text: "In order to be irreplaceable, one must always be different.", author: "Coco Chanel" },
        { text: "Java is to JavaScript what car is to carpet.", author: "Chris Heilmann" },
        { text: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupry" },
        { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
        { text: "The function of good software is to make the complex appear to be simple.", author: "Grady Booch" },
    ];

    const TIPS = [
        "Regular practice of recursion strengthens algorithmic intuition. Try solving one new problem each day!",
        "When stuck on a problem, try breaking it down into smaller sub-problems first.",
        "Reading other people's code is one of the best ways to learn new patterns and techniques.",
        "Don't just solve problems - understand the time and space complexity of your solutions.",
        "Take breaks! The Pomodoro Technique (25 min focus + 5 min break) works great for coding.",
        "Explain your solution out loud. Teaching is the best way to solidify understanding.",
        "Start with brute force, then optimize. A working solution is better than no solution.",
        "Keep a problem journal. Writing down your approach helps with retention.",
    ];

    const MOTIVATION_MESSAGES = [
        { min: 0, max: 0, emoji: '', text: 'Start your coding journey today!', sub: 'Consistency is the key to mastery.' },
        { min: 1, max: 2, emoji: '', text: 'Great start! Keep building momentum!', sub: 'Every expert was once a beginner.' },
        { min: 3, max: 6, emoji: '', text: 'You\'re on fire!', sub: 'Your dedication is paying off.' },
        { min: 7, max: 13, emoji: '', text: 'Incredible consistency!', sub: 'You\'re in the top tier of dedicated learners.' },
        { min: 14, max: 29, emoji: '', text: 'Diamond-level dedication!', sub: 'Two weeks strong - you\'re unstoppable!' },
        { min: 30, max: Infinity, emoji: '', text: 'You\'re a legend!', sub: 'A month+ streak. True mastery in the making.' },
    ];

    const BADGES = [
        { id: 'first_login', name: 'First Login ', emoji: '', type: 'first_login', threshold: 1 },
        { id: 'streak_3', name: '3-Day Streak ', emoji: '', type: 'streak', threshold: 3 },
        { id: 'streak_7', name: '7-Day Streak ', emoji: '', type: 'streak', threshold: 7 },
        { id: 'streak_14', name: '14-Day Streak ', emoji: '', type: 'streak', threshold: 14 },
        { id: 'streak_30', name: '30-Day Streak ', emoji: '', type: 'streak', threshold: 30 },
        { id: 'solved_10', name: '10 Problems Solved', emoji: '', type: 'solved', threshold: 10 },
        { id: 'solved_50', name: '50 Problems Solved', emoji: '', type: 'solved', threshold: 50 },
        { id: 'solved_100', name: '100 Solved ', emoji: '', type: 'solved', threshold: 100 },
        { id: 'solved_250', name: '250 Problems! ', emoji: '', type: 'solved', threshold: 250 },
        { id: 'hours_10', name: '10 Hours Logged ', emoji: '', type: 'hours', threshold: 10 },
        { id: 'hours_50', name: '50 Hours Logged ', emoji: '', type: 'hours', threshold: 50 },
        { id: 'topic_master', name: 'Topic Explorer ', emoji: '', type: 'topics', threshold: 5 },
        { id: 'hard_solver', name: 'Hard Mode Hero ', emoji: '', type: 'hard', threshold: 10 },
        { id: 'speed_demon', name: 'Speed Demon ', emoji: '', type: 'speed', threshold: 1 },
        { id: 'night_owl', name: 'Night Owl ', emoji: '', type: 'night_owl', threshold: 3 },
        { id: 'early_bird', name: 'Early Bird ', emoji: '', type: 'early_bird', threshold: 3 },
        { id: 'consistent_coder', name: 'Consistent Coder ', emoji: '', type: 'consistent', threshold: 1 },
    ];

    const LEADERBOARD_DATA = [
        { name: 'Sophia Kolarov', initials: 'SK', streak: 42, solved: 2890, color: '#6a1b9a' },
        { name: 'Jake Miller', initials: 'JM', streak: 28, solved: 2150, color: '#1565c0' },
        { name: 'Lina Tanaka', initials: 'LT', streak: 22, solved: 1980, color: '#00838f' },
        { name: 'Marcus Webb', initials: 'MW', streak: 18, solved: 1650, color: '#2e7d32' },
        { name: 'Priya Sharma', initials: 'PS', streak: 15, solved: 1420, color: '#e65100' },
        { name: 'David Park', initials: 'DP', streak: 11, solved: 1200, color: '#c62828' },
        { name: 'Emma Stone', initials: 'ES', streak: 9, solved: 980, color: '#37474f' },
    ];

    const TOPIC_COLORS = {
        'Arrays': '#006494',
        'Loops': '#7c5800',
        'Functions': '#006d43',
        'OOP': '#8e24aa',
        'Strings': '#00838f',
        'Recursion': '#c62828',
        'Sorting': '#e65100',
        'Linked Lists': '#2e7d32',
        'Trees': '#37474f',
        'Graphs': '#1565c0',
        'Dynamic Programming': '#6a1b9a',
        'Other': '#707880',
    };

    const DAILY_CHALLENGES = [
        { text: 'Solve 2 easy Array problems today', topic: 'Arrays', difficulty: 'Easy', count: 2 },
        { text: 'Practice Loops for 30+ minutes', topic: 'Loops', minTime: 30 },
        { text: 'Solve 1 Hard problem in any topic', difficulty: 'Hard', count: 1 },
        { text: 'Complete 3 problems in Strings', topic: 'Strings', count: 3 },
        { text: 'Practice Functions - solve 2 problems', topic: 'Functions', count: 2 },
        { text: 'Tackle a Recursion problem today', topic: 'Recursion', count: 1 },
        { text: 'Solve 2 Medium difficulty problems', difficulty: 'Medium', count: 2 },
        { text: 'Log 45+ minutes of practice today', minTime: 45 },
        { text: 'Solve 3 problems in any topic', count: 3 },
        { text: 'Try an OOP problem today', topic: 'OOP', count: 1 },
        { text: 'Practice Sorting - solve 2 problems', topic: 'Sorting', count: 2 },
        { text: 'Solve 1 Linked Lists problem', topic: 'Linked Lists', count: 1 },
        { text: 'Practice for 60+ minutes today', minTime: 60 },
        { text: 'Solve 4 easy problems in any topic', difficulty: 'Easy', count: 4 },
    ];

    const LEARNING_PATH_ORDER = [
        { topic: 'Arrays', desc: 'Master indexed collections and operations', icon: '' },
        { topic: 'Loops', desc: 'Iterate through data efficiently', icon: '' },
        { topic: 'Functions', desc: 'Build reusable code blocks', icon: '' },
        { topic: 'Strings', desc: 'Manipulate text data', icon: '' },
        { topic: 'OOP', desc: 'Object-oriented design patterns', icon: '' },
        { topic: 'Recursion', desc: 'Solve problems by breaking them down', icon: '' },
        { topic: 'Sorting', desc: 'Organize data with algorithms', icon: '' },
        { topic: 'Linked Lists', desc: 'Dynamic linear data structures', icon: '' },
        { topic: 'Trees', desc: 'Hierarchical data structures', icon: '' },
        { topic: 'Graphs', desc: 'Network and relationship modeling', icon: '' },
        { topic: 'Dynamic Programming', desc: 'Optimize with memoization', icon: '' },
    ];

    const BUDDY_POOL = [
        { name: 'Aarav Patel', initials: 'AP', color: '#6a1b9a', topics: ['Arrays','Loops'] },
        { name: 'Mia Chen', initials: 'MC', color: '#1565c0', topics: ['Functions','Strings'] },
        { name: 'Carlos Rivera', initials: 'CR', color: '#00838f', topics: ['OOP','Recursion'] },
        { name: 'Yuki Tanaka', initials: 'YT', color: '#2e7d32', topics: ['Sorting','Trees'] },
        { name: 'Zara Khan', initials: 'ZK', color: '#e65100', topics: ['Arrays','Functions'] },
        { name: 'Leon Brooks', initials: 'LB', color: '#c62828', topics: ['Loops','Graphs'] },
        { name: 'Nina Kowalski', initials: 'NK', color: '#37474f', topics: ['Strings','DP'] },
        { name: 'Raj Gupta', initials: 'RG', color: '#004b71', topics: ['Recursion','Trees'] },
    ];

    //  State 
    let sessions = [];
    let chartInstances = {};

    //  DOM Refs 
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    //  Init 
    function init() {
        bindAuth();
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
            try {
                currentUser = JSON.parse(storedUser);
                loadUserData().then(() => {
                    hideAuth();
                });
            } catch (e) { showAuth(); }
        } else {
            showAuth();
        }
    }

    function initApp() {
        // Update user display names
        const firstName = currentUser ? currentUser.name.split(' ')[0] : 'Alex';
        const nameDisplay = currentUser ? currentUser.name : 'Alex Chen';
        const initials = firstName.substring(0, 2).toUpperCase();
        
        if (document.querySelector('#welcome-name')) document.querySelector('#welcome-name').textContent = firstName;
        document.querySelectorAll('.user-name').forEach(n => n.textContent = nameDisplay);
        document.querySelectorAll('.avatar span, .mobile-avatar span').forEach(a => a.textContent = initials);

        markFirstLogin();
        loadSessions();
        loadTheme();
        setDefaultDate();
        bindEvents();
        renderAll();
        checkReminder();
        checkMissMe();
        checkWeeklyLetter();
    }

    //  Data Management 
    function loadSessions() {
        try {
            sessions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch { sessions = []; }
    }

    function saveSessions() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }

    function addSession(session) {
        const now = new Date();
        const entry = { ...session, id: Date.now().toString(), timestamp: now.toISOString(), hour: now.getHours() };
        sessions.push(entry);
        saveSessions();
        const xpGained = calculateXPForSession(entry);
        addXP(xpGained);
        renderAll();
        checkReminder();
        checkDailyChallengeCompletion();
        checkNewBadges();
    }

    //  Theme 
    function loadTheme() {
        const theme = localStorage.getItem(THEME_KEY) || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(THEME_KEY, next);
        updateThemeIcon(next);
        // Re-render charts with new theme
        setTimeout(() => {
            renderWeeklyChart();
            renderProgressWeeklyChart();
            renderTopicChart();
        }, 100);
    }

    function updateThemeIcon(theme) {
        const btn = $('#theme-toggle .material-icons-outlined');
        if (btn) btn.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    }

    //  Navigation 
    function navigateTo(page) {
        $$('.page').forEach(p => p.classList.remove('active'));
        $$('.nav-item').forEach(n => n.classList.remove('active'));

        const targetPage = $(`#page-${page}`);
        const targetNav = $(`[data-page="${page}"]`);

        if (targetPage) {
            targetPage.classList.add('active');
            targetPage.style.animation = 'none';
            targetPage.offsetHeight; // trigger reflow
            targetPage.style.animation = '';
        }
        if (targetNav) targetNav.classList.add('active');

        const titles = {
            'dashboard': 'Dashboard',
            'log-practice': 'Log Practice',
            'progress': 'Progress Tracker',
            'learning-path': 'Learning Path',
            'leaderboard': 'Leaderboard',
            'analytics': 'Deep Analytics',
        };
        $('#page-title').textContent = titles[page] || 'Dashboard';

        // Close mobile sidebar
        $('#sidebar').classList.remove('open');
        $('#sidebar-overlay').classList.remove('active');

        if (page === 'progress') {
            setTimeout(() => { renderProgressWeeklyChart(); renderTopicChart(); renderHeatmap(); }, 50);
        }
        if (page === 'dashboard') {
            setTimeout(() => renderWeeklyChart(), 50);
        }
        if (page === 'analytics') {
            setTimeout(() => { renderMoodChart(); renderDifficultyTrendChart(); renderBestDayChart(); renderTimeHeatmap(); renderMoodSummary(); }, 50);
        }
        if (page === 'learning-path') {
            setTimeout(() => renderLearningPath(), 50);
        }
    }

    //  Event Binding 
    function bindAuth() {
        $$('.auth-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.auth-tab-btn').forEach(b => b.classList.remove('active'));
                $$('.auth-tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                $(`#${btn.dataset.tab}`).classList.add('active');
            });
        });

        $('#register-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const err = $('#register-error-msg');
            err.textContent = '';
            btn.disabled = true;
            try {
                const res = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: $('#register-name').value.trim(),
                        email: $('#register-email').value.trim(),
                        password: $('#register-password').value
                    })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Registration failed');
                currentUser = data.user;
                originalSetItem(USER_KEY, JSON.stringify(currentUser));
                hideAuth();
            } catch (error) {
                err.textContent = error.message;
            } finally { btn.disabled = false; }
        });

        $('#login-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const err = $('#login-error-msg');
            err.textContent = '';
            btn.disabled = true;
            try {
                const res = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: $('#login-email').value.trim(),
                        password: $('#login-password').value
                    })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Login failed');
                currentUser = data.user;
                originalSetItem('codepulse_user', JSON.stringify(currentUser));
                await loadUserData();
                hideAuth();
            } catch (error) {
                err.textContent = error.message;
            } finally { btn.disabled = false; }
        });

        $('#logout-btn')?.addEventListener('click', () => {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                if (localStorage.key(i).startsWith('codepulse_')) {
                    keysToRemove.push(localStorage.key(i));
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
            currentUser = null;
            location.reload();
        });
    }

    function bindEvents() {
        // Navigation
        $$('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(item.dataset.page);
            });
        });

        // Theme toggle
        $('#theme-toggle')?.addEventListener('click', toggleTheme);

        // Mobile menu
        $('#menu-toggle')?.addEventListener('click', () => {
            $('#sidebar').classList.toggle('open');
            $('#sidebar-overlay').classList.toggle('active');
        });

        $('#sidebar-overlay')?.addEventListener('click', () => {
            $('#sidebar').classList.remove('open');
            $('#sidebar-overlay').classList.remove('active');
        });

        // Practice form
        $('#practice-form')?.addEventListener('submit', handleFormSubmit);

        // Difficulty selector
        $$('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                $('#practice-difficulty').value = btn.dataset.difficulty;
            });
        });

        // Quick action buttons
        $('#quick-log-btn')?.addEventListener('click', () => navigateTo('log-practice'));
        $('#quick-progress-btn')?.addEventListener('click', () => navigateTo('progress'));
        $('#quick-leaderboard-btn')?.addEventListener('click', () => navigateTo('leaderboard'));
        $('#start-practicing-btn')?.addEventListener('click', () => navigateTo('log-practice'));
        $('#reminder-action-btn')?.addEventListener('click', () => navigateTo('log-practice'));
        $('#view-all-sessions-btn')?.addEventListener('click', () => navigateTo('progress'));

        // Leaderboard tabs
        $$('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.tab-btn').forEach(b => b.classList.remove('active'));
                $$('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                $(`#${btn.dataset.tab}`)?.classList.add('active');
            });
        });
        // Mood selector
        $$('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.mood-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                $('#practice-mood').value = btn.dataset.mood;
            });
        });

        // Weekly goal
        $('#set-goal-btn')?.addEventListener('click', () => {
            const setter = $('#goal-setter');
            setter.style.display = setter.style.display === 'none' ? 'block' : 'none';
        });
        $('#save-goal-btn')?.addEventListener('click', () => {
            const val = parseInt($('#goal-input').value, 10) || 5;
            localStorage.setItem(WEEKLY_GOAL_KEY, val);
            $('#goal-setter').style.display = 'none';
            renderWeeklyGoal();
        });

        // Streak freeze
        $('#streak-freeze-btn')?.addEventListener('click', useStreakFreeze);

        // Miss me popup
        $('#miss-me-log-btn')?.addEventListener('click', () => { $('#miss-me-overlay').classList.remove('active'); navigateTo('log-practice'); });
        $('#miss-me-dismiss-btn')?.addEventListener('click', () => { $('#miss-me-overlay').classList.remove('active'); localStorage.setItem(MISS_ME_KEY, getToday()); });

        // Progress letter
        $('#weekly-letter-btn')?.addEventListener('click', showProgressLetter);
        $('#progress-letter-close')?.addEventListener('click', () => $('#progress-letter-overlay').classList.remove('active'));
        $('#progress-letter-ok')?.addEventListener('click', () => $('#progress-letter-overlay').classList.remove('active'));

        // Learning path practice btn
        $('#lp-practice-btn')?.addEventListener('click', () => navigateTo('log-practice'));

        // Study buddy
        $('#find-buddy-btn')?.addEventListener('click', renderStudyBuddy);
    }

    //  Form Handling 
    function setDefaultDate() {
        const dateInput = $('#practice-date');
        if (dateInput) {
            dateInput.value = getToday();
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        const date = $('#practice-date').value;
        const topic = $('#practice-topic').value;
        const difficulty = $('#practice-difficulty').value;
        const problems = parseInt($('#practice-problems').value, 10);
        const time = parseInt($('#practice-time').value, 10);
        const notes = $('#practice-notes').value.trim();
        const mood = $('#practice-mood').value || 'good';

        if (!date || !topic || !problems || !time) return;

        addSession({ date, topic, difficulty, problems, time, notes, mood });

        // Reset form
        $('#practice-form').reset();
        setDefaultDate();
        $$('.diff-btn').forEach(b => b.classList.remove('active'));
        $$('.diff-btn')[1].classList.add('active'); // default to Medium
        $('#practice-difficulty').value = 'Medium';

        showToast('Session saved successfully! ');

        // Update tip
        $('#practice-tip').textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
    }

    //  Render All 
    function renderAll() {
        renderDashboard();
        renderWeeklyChart();
        renderRecentSessions();
        renderMotivation();
        renderLogSidebar();
        renderProgressPage();
        renderLeaderboard();
        renderBadges();
        renderHeatmap();
        renderAchievementsList();
        renderChallengeProgress();
        renderXP();
        renderDailyChallenge();
        renderHabitGrid();
        renderWeeklyGoal();
        renderConsistencyScore();
        renderLearningPath();
        renderShoutoutWall();
        renderStudyBuddy();
        renderStreakFreeze();
    }

    //  Dashboard 
    function renderDashboard() {
        const streak = calculateStreak();
        const longestStreak = calculateLongestStreak();
        const totalProblems = sessions.reduce((s, e) => s + e.problems, 0);
        const totalMinutes = sessions.reduce((s, e) => s + e.time, 0);
        const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
        const consistency = calculateConsistency();

        const weekSessions = getThisWeekSessions();
        const weekProblems = weekSessions.reduce((s, e) => s + e.problems, 0);
        const weekHours = Math.round(weekSessions.reduce((s, e) => s + e.time, 0) / 60 * 10) / 10;

        animateCounter('stat-streak', streak);
        animateCounter('stat-problems', totalProblems);
        $('#stat-hours').innerHTML = `${totalHours}<small>hrs</small>`;
        $('#stat-consistency').innerHTML = `${consistency}<small>%</small>`;
        if ($('#longest-streak')) $('#longest-streak').textContent = longestStreak;

        $('#streak-trend').textContent = streak > 0 ? `${streak} day${streak > 1 ? 's' : ''} strong!` : 'Start today!';
        $('#problems-trend').textContent = `+${weekProblems} this week`;
        $('#hours-trend').textContent = `+${weekHours}h this week`;

        const quoteIndex = getDayOfYear() % QUOTES.length;
        const quote = QUOTES[quoteIndex];
        const quoteEl = $('#daily-quote');
        if (quoteEl) {
            quoteEl.querySelector('p').textContent = `"${quote.text}"`;
            quoteEl.querySelector('.quote-author').textContent = `- ${quote.author}`;
        }
    }

    function animateCounter(id, target) {
        const el = $(`#${id}`);
        if (!el) return;
        const current = parseInt(el.textContent, 10) || 0;
        if (current === target) { el.textContent = target; return; }

        const duration = 600;
        const start = performance.now();

        function step(timestamp) {
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            el.textContent = Math.round(current + (target - current) * eased);
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    //  Weekly Chart (Dashboard) 
    function renderWeeklyChart() {
        const ctx = document.getElementById('weekly-chart');
        if (!ctx) return;

        if (chartInstances.weekly) chartInstances.weekly.destroy();

        const days = getLast7Days();
        const data = days.map(d => {
            return sessions.filter(s => s.date === d.date).reduce((sum, s) => sum + s.problems, 0);
        });

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
        const textColor = isDark ? '#c0c7d0' : '#40484f';

        chartInstances.weekly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days.map(d => d.label),
                datasets: [{
                    label: 'Problems Solved',
                    data: data,
                    backgroundColor: data.map(v => v > 0
                        ? (isDark ? 'rgba(142, 205, 255, 0.6)' : 'rgba(0, 100, 148, 0.65)')
                        : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')
                    ),
                    borderRadius: 8,
                    borderSkipped: false,
                    maxBarThickness: 40,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? '#323538' : '#191c1f',
                        titleFont: { family: 'Manrope', weight: '700' },
                        bodyFont: { family: 'Lexend' },
                        cornerRadius: 8,
                        padding: 12,
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor, font: { family: 'Lexend', size: 12 } },
                        border: { display: false },
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: {
                            color: textColor,
                            font: { family: 'Lexend', size: 11 },
                            stepSize: 1,
                        },
                        border: { display: false },
                        beginAtZero: true,
                    }
                }
            }
        });
    }

    //  Recent Sessions 
    function renderRecentSessions() {
        const list = $('#recent-sessions-list');
        if (!list) return;

        const recent = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        if (recent.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons-outlined">event_note</span>
                    <p>No sessions yet. Start practicing!</p>
                    <button class="btn btn-primary btn-sm" onclick="document.querySelector('[data-page=\\'log-practice\\']').click()">Log Your First Session</button>
                </div>`;
            return;
        }

        list.innerHTML = recent.map(s => {
            const topicClass = 'topic-' + s.topic.replace(/\s+/g, '');
            const initials = s.topic.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
            return `
                <div class="session-item">
                    <div class="session-topic-badge ${topicClass}">${initials}</div>
                    <div class="session-details">
                        <span class="session-topic-name">${s.topic}</span>
                        <span class="session-meta">
                            <span>${formatDate(s.date)}</span>
                            <span></span>
                            <span>${s.difficulty}</span>
                            <span></span>
                            <span>${s.time} min</span>
                        </span>
                    </div>
                    <span class="session-problems">${s.problems}</span>
                </div>`;
        }).join('');
    }

    //  Motivation 
    function renderMotivation() {
        const streak = calculateStreak();
        const msg = MOTIVATION_MESSAGES.find(m => streak >= m.min && streak <= m.max) || MOTIVATION_MESSAGES[0];
        const content = $('#motivation-content');
        if (content) {
            content.innerHTML = `
                <div class="motivation-emoji">${msg.emoji}</div>
                <p class="motivation-text">${msg.text}</p>
                <p class="motivation-sub">${msg.sub}</p>`;
        }
    }

    //  Log Sidebar 
    function renderLogSidebar() {
        // Today's summary
        const todaySessions = sessions.filter(s => s.date === getToday());
        const todayProblems = todaySessions.reduce((s, e) => s + e.problems, 0);
        const todayMinutes = todaySessions.reduce((s, e) => s + e.time, 0);

        $('#today-problems').textContent = todayProblems;
        $('#today-minutes').textContent = todayMinutes;

        // History
        const historyList = $('#session-history-list');
        if (!historyList) return;

        const recent = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        if (recent.length === 0) {
            historyList.innerHTML = '<div class="empty-state small"><p>No sessions logged yet.</p></div>';
            return;
        }

        historyList.innerHTML = recent.map(s => `
            <div class="history-item">
                <div>
                    <span class="history-item-topic">${s.topic}</span>
                    <span class="history-item-date">${formatDate(s.date)}</span>
                </div>
                <span class="history-item-count">${s.problems} solved</span>
            </div>`).join('');
    }

    //  Progress Page 
    function renderProgressPage() {
        // Monthly stats
        const now = new Date();
        const monthSessions = sessions.filter(s => {
            const d = new Date(s.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const monthProblems = monthSessions.reduce((s, e) => s + e.problems, 0);
        const monthTime = monthSessions.reduce((s, e) => s + e.time, 0);
        const avgTime = monthSessions.length > 0 ? Math.round(monthTime / monthSessions.reduce((s, e) => s + e.problems, 0) * 10) / 10 : 0;

        $('#month-problems').textContent = monthProblems;
        $('#avg-solve-time').innerHTML = `${isNaN(avgTime) || !isFinite(avgTime) ? 0 : avgTime}<small>min</small>`;

        // Top topic
        const topicCounts = {};
        sessions.forEach(s => { topicCounts[s.topic] = (topicCounts[s.topic] || 0) + s.problems; });
        const topTopic = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0];
        $('#top-topic').textContent = topTopic ? topTopic[0] : '-';

        renderProgressWeeklyChart();
        renderTopicChart();
    }

    //  Progress Weekly Chart 
    function renderProgressWeeklyChart() {
        const ctx = document.getElementById('progress-weekly-chart');
        if (!ctx) return;

        if (chartInstances.progressWeekly) chartInstances.progressWeekly.destroy();

        const days = getLast7Days();
        const data = days.map(d => sessions.filter(s => s.date === d.date).reduce((sum, s) => sum + s.problems, 0));

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 280);
        if (isDark) {
            gradient.addColorStop(0, 'rgba(142, 205, 255, 0.25)');
            gradient.addColorStop(1, 'rgba(142, 205, 255, 0)');
        } else {
            gradient.addColorStop(0, 'rgba(0, 100, 148, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 100, 148, 0)');
        }

        const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
        const textColor = isDark ? '#c0c7d0' : '#40484f';

        chartInstances.progressWeekly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days.map(d => d.label),
                datasets: [{
                    label: 'Problems Solved',
                    data: data,
                    borderColor: isDark ? '#8ecdff' : '#006494',
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: isDark ? '#8ecdff' : '#006494',
                    pointBorderColor: isDark ? '#1d2023' : '#ffffff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? '#323538' : '#191c1f',
                        titleFont: { family: 'Manrope', weight: '700' },
                        bodyFont: { family: 'Lexend' },
                        cornerRadius: 8,
                        padding: 12,
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor, font: { family: 'Lexend', size: 12 } },
                        border: { display: false },
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { family: 'Lexend', size: 11 }, stepSize: 1 },
                        border: { display: false },
                        beginAtZero: true,
                    }
                }
            }
        });
    }

    //  Topic Chart 
    function renderTopicChart() {
        const ctx = document.getElementById('topic-chart');
        if (!ctx) return;

        if (chartInstances.topic) chartInstances.topic.destroy();

        const topicCounts = {};
        sessions.forEach(s => { topicCounts[s.topic] = (topicCounts[s.topic] || 0) + s.problems; });

        const topics = Object.keys(topicCounts);
        const values = Object.values(topicCounts);

        if (topics.length === 0) {
            topics.push('No Data');
            values.push(1);
        }

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const colors = topics.map(t => TOPIC_COLORS[t] || '#707880');

        chartInstances.topic = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: topics,
                datasets: [{
                    data: values,
                    backgroundColor: colors.map(c => {
                        if (isDark) return c + 'cc';
                        return c + 'dd';
                    }),
                    borderColor: isDark ? '#1d2023' : '#ffffff',
                    borderWidth: 3,
                    hoverBorderWidth: 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: isDark ? '#c0c7d0' : '#40484f',
                            font: { family: 'Lexend', size: 11 },
                            padding: 16,
                            usePointStyle: true,
                            pointStyleWidth: 10,
                        }
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#323538' : '#191c1f',
                        titleFont: { family: 'Manrope', weight: '700' },
                        bodyFont: { family: 'Lexend' },
                        cornerRadius: 8,
                        padding: 12,
                    }
                }
            }
        });
    }

    //  Heatmap 
    function renderHeatmap() {
        const container = $('#heatmap-container');
        if (!container) return;

        container.innerHTML = '';

        const today = new Date();
        const dayOfWeek = today.getDay();

        // Build 12 weeks of data
        for (let week = 11; week >= 0; week--) {
            const weekDiv = document.createElement('div');
            weekDiv.className = 'heatmap-week';

            for (let day = 0; day < 7; day++) {
                const daysAgo = week * 7 + (6 - day) + (6 - dayOfWeek);
                const date = new Date(today);
                date.setDate(date.getDate() - daysAgo);
                const dateStr = formatDateISO(date);

                const count = sessions.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.problems, 0);
                let level = 0;
                if (count >= 8) level = 4;
                else if (count >= 5) level = 3;
                else if (count >= 2) level = 2;
                else if (count >= 1) level = 1;

                const cell = document.createElement('div');
                cell.className = 'heatmap-cell';
                cell.setAttribute('data-level', level);
                cell.title = `${dateStr}: ${count} problem${count !== 1 ? 's' : ''}`;
                weekDiv.appendChild(cell);
            }

            container.appendChild(weekDiv);
        }
    }

    //  Achievements List (Progress page) 
    function renderAchievementsList() {
        const list = $('#achievements-list');
        if (!list) return;

        const earned = getEarnedBadges();
        const displayBadges = earned.slice(0, 4);

        if (displayBadges.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons-outlined">emoji_events</span>
                    <p>Start practicing to earn achievements!</p>
                </div>`;
            return;
        }

        list.innerHTML = displayBadges.map(b => `
            <div class="achievement-item achievement-completed">
                <div class="achievement-icon">${b.emoji}</div>
                <div class="achievement-info">
                    <h5>${b.name}</h5>
                    <p>Completed</p>
                </div>
            </div>`).join('');
    }

    //  Leaderboard 
    function renderLeaderboard() {
        const container = $('#leaderboard-rows');
        if (!container) return;

        const totalSolved = sessions.reduce((s, e) => s + e.problems, 0);
        const streak = calculateStreak();

        const allEntries = [
            { name: 'Alex Chen', initials: 'AC', streak, solved: totalSolved, color: '#006494', isUser: true },
            ...LEADERBOARD_DATA,
        ];

        allEntries.sort((a, b) => b.solved - a.solved);

        // Find user rank
        const userIndex = allEntries.findIndex(e => e.isUser);
        $('#user-rank').textContent = `#${userIndex + 1}`;

        container.innerHTML = allEntries.map((entry, idx) => {
            let rankDisplay = idx + 1;
            let medalClass = '';
            if (idx === 0) rankDisplay = '';
            else if (idx === 1) rankDisplay = '';
            else if (idx === 2) rankDisplay = '';

            return `
                <div class="leaderboard-row ${entry.isUser ? 'current-user' : ''}">
                    <span class="lb-rank ${idx < 3 ? 'rank-medal' : ''}">${rankDisplay}</span>
                    <span class="lb-name">
                        <span class="lb-avatar" style="background: ${entry.color}">${entry.initials}</span>
                        <span class="lb-student-name">${entry.name}${entry.isUser ? ' (You)' : ''}</span>
                    </span>
                    <span class="lb-streak">
                        <span class="material-icons-outlined">local_fire_department</span>
                        ${entry.streak}-day streak
                    </span>
                    <span class="lb-solved">${entry.solved.toLocaleString()}</span>
                </div>`;
        }).join('');
    }

    //  Badges 
    function renderBadges() {
        const grid = $('#badges-grid');
        if (!grid) return;

        const totalSolved = sessions.reduce((s, e) => s + e.problems, 0);
        const totalHours = sessions.reduce((s, e) => s + e.time, 0) / 60;
        const streak = calculateStreak();
        const uniqueTopics = new Set(sessions.map(s => s.topic)).size;
        const hardSolved = sessions.filter(s => s.difficulty === 'Hard').reduce((s, e) => s + e.problems, 0);

        grid.innerHTML = BADGES.map(badge => {
            let progress = 0;
            let current = 0;

            switch (badge.type) {
                case 'streak': current = streak; break;
                case 'solved': current = totalSolved; break;
                case 'hours': current = totalHours; break;
                case 'topics': current = uniqueTopics; break;
                case 'hard': current = hardSolved; break;
                case 'speed': current = sessions.filter(s => s.problems > 0 && s.time / s.problems < 5).length; break;
            }

            progress = Math.min((current / badge.threshold) * 100, 100);
            const completed = progress >= 100;

            return `
                <div class="badge-card ${completed ? 'completed' : 'in-progress'}">
                    <span class="badge-emoji">${badge.emoji}</span>
                    <span class="badge-name">${badge.name}</span>
                    ${completed
                    ? '<span class="badge-status done"> Completed</span>'
                    : `<div class="badge-progress-wrap">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <span class="badge-progress-text">${Math.round(current)} / ${badge.threshold}</span>
                        </div>`
                }
                </div>`;
        }).join('');
    }

    function getEarnedBadges() {
        const totalSolved = sessions.reduce((s, e) => s + e.problems, 0);
        const totalHours = sessions.reduce((s, e) => s + e.time, 0) / 60;
        const streak = calculateStreak();
        const uniqueTopics = new Set(sessions.map(s => s.topic)).size;
        const hardSolved = sessions.filter(s => s.difficulty === 'Hard').reduce((s, e) => s + e.problems, 0);
        const nightSessions = sessions.filter(s => (s.hour >= 22 || s.hour < 5)).length;
        const earlySessions = sessions.filter(s => s.hour >= 5 && s.hour < 7).length;
        const weekDates = new Set(getThisWeekSessions().map(s => s.date)).size;
        const hasLoggedIn = !!localStorage.getItem(FIRST_LOGIN_KEY);

        return BADGES.filter(badge => {
            switch (badge.type) {
                case 'first_login': return hasLoggedIn;
                case 'streak': return streak >= badge.threshold;
                case 'solved': return totalSolved >= badge.threshold;
                case 'hours': return totalHours >= badge.threshold;
                case 'topics': return uniqueTopics >= badge.threshold;
                case 'hard': return hardSolved >= badge.threshold;
                case 'speed': return sessions.filter(s => s.problems > 0 && s.time / s.problems < 5).length >= badge.threshold;
                case 'night_owl': return nightSessions >= badge.threshold;
                case 'early_bird': return earlySessions >= badge.threshold;
                case 'consistent': return weekDates >= 5;
                default: return false;
            }
        });
    }

    //  Challenge Progress 
    function renderChallengeProgress() {
        const weekSessions = getThisWeekSessions();
        const weekProblems = weekSessions.reduce((s, e) => s + e.problems, 0);
        const target = 5;
        const progress = Math.min(weekProblems, target);

        $('#challenge-progress-fill').style.width = `${(progress / target) * 100}%`;
        $('#challenge-count').textContent = `${progress} / ${target}`;
    }

    //  Reminder 
    function checkReminder() {
        const todaySessions = sessions.filter(s => s.date === getToday());
        const banner = $('#reminder-banner');
        const badge = $('#notification-badge');

        if (todaySessions.length === 0 && sessions.length > 0) {
            banner.style.display = 'flex';
            badge.classList.add('active');
        } else {
            banner.style.display = 'none';
            badge.classList.remove('active');
        }
    }

    //  Toast 
    function showToast(message) {
        const toast = $('#toast');
        const toastMsg = $('#toast-message');
        toastMsg.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    //  Utility Functions 
    function getToday() {
        return formatDateISO(new Date());
    }

    function formatDateISO(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Yesterday';
        if (diff < 7) return `${diff} days ago`;

        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function getDayOfYear() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    function getLast7Days() {
        const days = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push({
                date: formatDateISO(d),
                label: dayNames[d.getDay()],
            });
        }
        return days;
    }

    function getThisWeekSessions() {
        const today = new Date();
        const day = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - day);
        startOfWeek.setHours(0, 0, 0, 0);

        return sessions.filter(s => {
            const d = new Date(s.date + 'T00:00:00');
            return d >= startOfWeek;
        });
    }

    function calculateStreak() {
        if (sessions.length === 0) return 0;

        const dates = [...new Set(sessions.map(s => s.date))].sort().reverse();
        const today = getToday();
        const yesterday = formatDateISO(new Date(Date.now() - 86400000));

        // Streak must start from today or yesterday
        if (dates[0] !== today && dates[0] !== yesterday) return 0;

        let streak = 1;
        let currentDate = new Date(dates[0] + 'T00:00:00');

        for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(currentDate);
            prevDate.setDate(prevDate.getDate() - 1);
            const prevStr = formatDateISO(prevDate);

            if (dates[i] === prevStr) {
                streak++;
                currentDate = prevDate;
            } else {
                break;
            }
        }

        return streak;
    }

    //  XP System 
    function getXP() { return parseInt(localStorage.getItem(XP_KEY)) || 0; }
    function addXP(amount) {
        const prev = getXP();
        const newXP = prev + amount;
        localStorage.setItem(XP_KEY, newXP);
        showXPToast(amount);
        renderXP();
    }
    function calculateXPForSession(s) {
        let xp = 10; // base
        xp += (s.problems || 0) * 5;
        if (s.difficulty === 'Hard') xp += (s.problems || 0) * 3;
        if (s.hour >= 22 || s.hour < 5) xp += 10; // night owl bonus
        return xp;
    }
    function getLevel(xp) {
        let level = 1; let remaining = xp;
        while (remaining >= level * 100) { remaining -= level * 100; level++; }
        return { level, xpInLevel: remaining, xpForNext: level * 100 };
    }
    function getLevelInfo(level) {
        if (level <= 3) return { name: 'Beginner', icon: '' };
        if (level <= 6) return { name: 'Intermediate', icon: '' };
        if (level <= 9) return { name: 'Advanced', icon: '' };
        return { name: 'Master', icon: '' };
    }
    function renderXP() {
        const xp = getXP();
        const { level, xpInLevel, xpForNext } = getLevel(xp);
        const info = getLevelInfo(level);
        const pct = Math.min((xpInLevel / xpForNext) * 100, 100);
        // Sidebar
        if ($('#xp-level-name')) $('#xp-level-name').textContent = info.name;
        if ($('.xp-level-icon')) $('.xp-level-icon').textContent = info.icon;
        if ($('#xp-bar-fill')) $('#xp-bar-fill').style.width = pct + '%';
        if ($('#xp-bar-text')) $('#xp-bar-text').textContent = `${xpInLevel} / ${xpForNext} XP`;
        // Banner
        if ($('#xp-banner-level')) $('#xp-banner-level').textContent = `Level ${level} - ${info.name}`;
        if ($('#xp-banner-icon')) $('#xp-banner-icon').textContent = info.icon;
        if ($('#xp-banner-bar-fill')) $('#xp-banner-bar-fill').style.width = pct + '%';
        if ($('#xp-banner-xp')) $('#xp-banner-xp').textContent = `${xpInLevel} / ${xpForNext} XP to next level`;
        if ($('#xp-total-value')) $('#xp-total-value').textContent = xp;
    }
    function showXPToast(amount) {
        const t = $('#xp-toast');
        const txt = $('#xp-toast-text');
        if (!t || !txt) return;
        txt.textContent = `+${amount} XP`;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2500);
    }

    //  Daily Challenge 
    function getTodayChallenge() {
        const idx = getDayOfYear() % DAILY_CHALLENGES.length;
        return DAILY_CHALLENGES[idx];
    }
    function renderDailyChallenge() {
        const c = getTodayChallenge();
        if ($('#daily-challenge-text')) $('#daily-challenge-text').textContent = c.text;
        const todayS = sessions.filter(s => s.date === getToday());
        const done = isChallengeComplete(c, todayS);
        if ($('#daily-challenge-status')) {
            $('#daily-challenge-status').textContent = done ? 'Completed ' : 'Pending';
            $('#daily-challenge-status').className = 'daily-challenge-status' + (done ? ' done' : '');
        }
    }
    function isChallengeComplete(c, todayS) {
        let matching = todayS;
        if (c.topic) matching = matching.filter(s => s.topic === c.topic);
        if (c.difficulty) matching = matching.filter(s => s.difficulty === c.difficulty);
        if (c.count) { const tot = matching.reduce((a, s) => a + s.problems, 0); if (tot < c.count) return false; }
        if (c.minTime) { const tot = matching.reduce((a, s) => a + s.time, 0); if (tot < c.minTime) return false; }
        if (!c.count && !c.minTime) return matching.length > 0;
        return true;
    }
    function checkDailyChallengeCompletion() {
        const c = getTodayChallenge();
        const todayS = sessions.filter(s => s.date === getToday());
        if (isChallengeComplete(c, todayS)) {
            const key = 'codepulse_challenge_' + getToday();
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, '1');
                addXP(25);
                showToast('Daily Challenge completed! +25 XP ');
            }
        }
        renderDailyChallenge();
    }

    //  Habit Grid 
    function renderHabitGrid() {
        const grid = $('#habit-grid');
        if (!grid) return;
        const now = new Date();
        const year = now.getFullYear(), month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = now.getDate();
        const freezeLog = JSON.parse(localStorage.getItem(STREAK_FREEZE_KEY + '_log') || '[]');
        let html = '';
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const practiced = sessions.some(s => s.date === dateStr);
            const frozen = freezeLog.includes(dateStr);
            let cls = 'habit-cell';
            if (d > today) cls += ' future';
            else if (practiced) cls += ' done';
            else if (frozen) cls += ' frozen';
            else cls += ' missed';
            html += `<div class="${cls}" title="${dateStr}"><span>${d}</span></div>`;
        }
        grid.innerHTML = html;
    }

    //  Weekly Goal 
    function renderWeeklyGoal() {
        const goal = parseInt(localStorage.getItem(WEEKLY_GOAL_KEY)) || 5;
        const weekDates = new Set(getThisWeekSessions().map(s => s.date));
        const done = weekDates.size;
        const pct = Math.min((done / goal) * 100, 100);
        if ($('#goal-ring-value')) $('#goal-ring-value').textContent = done;
        if ($('#goal-target-display')) $('#goal-target-display').textContent = goal;
        if ($('#goal-input')) $('#goal-input').value = goal;
        const ring = $('#goal-ring-fill');
        if (ring) {
            const circumference = 2 * Math.PI * 52;
            ring.style.strokeDasharray = circumference;
            ring.style.strokeDashoffset = circumference - (pct / 100) * circumference;
        }
    }

    //  Consistency Score 
    function calculateConsistency() {
        const today = new Date();
        let practiced = 0;
        for (let i = 0; i < 30; i++) {
            const d = new Date(today); d.setDate(d.getDate() - i);
            const ds = formatDateISO(d);
            if (sessions.some(s => s.date === ds)) practiced++;
        }
        return Math.round((practiced / 30) * 100);
    }
    function renderConsistencyScore() {
        const c = calculateConsistency();
        if ($('#stat-consistency')) $('#stat-consistency').innerHTML = `${c}<small>%</small>`;
    }

    //  Longest Streak 
    function calculateLongestStreak() {
        if (sessions.length === 0) return 0;
        const dates = [...new Set(sessions.map(s => s.date))].sort();
        let longest = 1, current = 1;
        for (let i = 1; i < dates.length; i++) {
            const prev = new Date(dates[i - 1] + 'T00:00:00');
            const curr = new Date(dates[i] + 'T00:00:00');
            const diff = (curr - prev) / (1000 * 60 * 60 * 24);
            if (diff === 1) { current++; longest = Math.max(longest, current); }
            else { current = 1; }
        }
        return longest;
    }

    //  Streak Freeze 
    function getWeekId() {
        const d = new Date(); const start = new Date(d.getFullYear(), 0, 1);
        return d.getFullYear() + '-W' + Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
    }
    function hasStreakFreeze() {
        const data = JSON.parse(localStorage.getItem(STREAK_FREEZE_KEY) || '{}');
        return data.week !== getWeekId(); // not used this week
    }
    function useStreakFreeze() {
        if (!hasStreakFreeze()) { showToast('Streak freeze already used this week!'); return; }
        const today = getToday();
        localStorage.setItem(STREAK_FREEZE_KEY, JSON.stringify({ week: getWeekId(), date: today }));
        const log = JSON.parse(localStorage.getItem(STREAK_FREEZE_KEY + '_log') || '[]');
        log.push(today);
        localStorage.setItem(STREAK_FREEZE_KEY + '_log', JSON.stringify(log));
        showToast('Streak freeze activated! ');
        renderAll();
    }
    function renderStreakFreeze() {
        const btn = $('#streak-freeze-btn');
        if (!btn) return;
        const todayS = sessions.filter(s => s.date === getToday());
        if (todayS.length === 0 && sessions.length > 0 && hasStreakFreeze()) {
            btn.style.display = 'inline-flex';
        } else { btn.style.display = 'none'; }
    }

    //  Miss Me Popup 
    function checkMissMe() {
        if (sessions.length === 0) return;
        const dismissed = localStorage.getItem(MISS_ME_KEY);
        if (dismissed === getToday()) return;
        const dates = [...new Set(sessions.map(s => s.date))].sort().reverse();
        const lastDate = new Date(dates[0] + 'T00:00:00');
        const daysSince = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
        if (daysSince >= 2) {
            if ($('#miss-me-days')) $('#miss-me-days').textContent = daysSince;
            $('#miss-me-overlay')?.classList.add('active');
        }
    }

    //  Weekly Progress Letter 
    function checkWeeklyLetter() {
        const now = new Date();
        if (now.getDay() === 1) { // Monday
            const key = 'codepulse_letter_' + getWeekId();
            if (!localStorage.getItem(key) && sessions.length > 0) {
                localStorage.setItem(key, '1');
                setTimeout(() => showProgressLetter(), 1500);
            }
        }
    }
    function showProgressLetter() {
        const body = $('#progress-letter-body');
        if (!body) return;
        const last7 = [];
        for (let i = 1; i <= 7; i++) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const ds = formatDateISO(d);
            last7.push(...sessions.filter(s => s.date === ds));
        }
        const problems = last7.reduce((a, s) => a + s.problems, 0);
        const minutes = last7.reduce((a, s) => a + s.time, 0);
        const hours = Math.round(minutes / 60 * 10) / 10;
        const days = new Set(last7.map(s => s.date)).size;
        const topics = [...new Set(last7.map(s => s.topic))];
        const streak = calculateStreak();
        body.innerHTML = `
            <div class="letter-greeting">Hey there! </div>
            <p>Here's your weekly coding progress summary:</p>
            <div class="letter-stats">
                <div class="letter-stat"><span class="letter-stat-val">${problems}</span><span>Problems Solved</span></div>
                <div class="letter-stat"><span class="letter-stat-val">${hours}h</span><span>Practice Time</span></div>
                <div class="letter-stat"><span class="letter-stat-val">${days}</span><span>Active Days</span></div>
                <div class="letter-stat"><span class="letter-stat-val">${streak}</span><span>Current Streak</span></div>
            </div>
            ${topics.length > 0 ? `<p>Topics covered: <strong>${topics.join(', ')}</strong></p>` : ''}
            <p class="letter-cta">${problems > 10 ? 'Amazing week! Keep pushing forward! ' : problems > 0 ? 'Good progress! Try to increase your daily practice. ' : 'Let\'s get back on track this week! '}</p>`;
        $('#progress-letter-overlay')?.classList.add('active');
    }

    //  First Login 
    function markFirstLogin() {
        if (!localStorage.getItem(FIRST_LOGIN_KEY)) {
            localStorage.setItem(FIRST_LOGIN_KEY, new Date().toISOString());
        }
    }

    //  Badge Checking 
    function checkNewBadges() {
        const earned = getEarnedBadges();
        const prev = JSON.parse(localStorage.getItem('codepulse_earned_badges') || '[]');
        const newBadges = earned.filter(b => !prev.includes(b.id));
        if (newBadges.length > 0) {
            localStorage.setItem('codepulse_earned_badges', JSON.stringify(earned.map(b => b.id)));
            newBadges.forEach(b => { setTimeout(() => showToast(`Badge earned: ${b.name}!`), 500); });
        }
    }

    //  Learning Path 
    function renderLearningPath() {
        const roadmap = $('#lp-roadmap');
        if (!roadmap) return;
        const done = JSON.parse(localStorage.getItem(LP_DONE_KEY) || '[]');
        const topicSessions = {};
        sessions.forEach(s => { topicSessions[s.topic] = (topicSessions[s.topic] || 0) + 1; });
        let completedCount = 0;
        let recommended = null;
        let html = '';
        LEARNING_PATH_ORDER.forEach((item, idx) => {
            const count = topicSessions[item.topic] || 0;
            const isDone = done.includes(item.topic) || count >= 3;
            if (isDone) completedCount++;
            const isNext = !isDone && !recommended;
            if (isNext) recommended = item;
            const status = isDone ? 'done' : isNext ? 'current' : 'locked';
            html += `<div class="lp-node ${status}">
                <div class="lp-node-connector">${idx < LEARNING_PATH_ORDER.length - 1 ? '<div class="lp-line"></div>' : ''}</div>
                <div class="lp-node-circle">${isDone ? '' : item.icon}</div>
                <div class="lp-node-info">
                    <span class="lp-node-title">${item.topic}</span>
                    <span class="lp-node-desc">${item.desc}</span>
                    <span class="lp-node-sessions">${count} session${count !== 1 ? 's' : ''} logged</span>
                </div>
                ${isDone ? '<span class="lp-node-badge">Complete</span>' : isNext ? '<span class="lp-node-badge current">Up Next</span>' : ''}
                ${!isDone && count >= 3 ? `<button class="btn btn-sm btn-primary lp-mark-btn" data-topic="${item.topic}">Mark Done</button>` : ''}
            </div>`;
        });
        roadmap.innerHTML = html;
        if ($('#lp-completed-count')) $('#lp-completed-count').textContent = completedCount;
        if ($('#lp-total-count')) $('#lp-total-count').textContent = LEARNING_PATH_ORDER.length;
        if (recommended) {
            if ($('#lp-recommended-topic')) $('#lp-recommended-topic').textContent = recommended.topic;
            const reason = (topicSessions[recommended.topic] || 0) === 0 ? "- You haven't practiced this yet" : `- Only ${topicSessions[recommended.topic]} session(s) so far`;
            if ($('#lp-rec-reason')) $('#lp-rec-reason').textContent = reason;
        }
        $$('.lp-mark-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const d = JSON.parse(localStorage.getItem(LP_DONE_KEY) || '[]');
                d.push(btn.dataset.topic);
                localStorage.setItem(LP_DONE_KEY, JSON.stringify(d));
                renderLearningPath();
                showToast(`${btn.dataset.topic} marked as complete! `);
            });
        });
    }

    //  Shoutout Wall 
    function renderShoutoutWall() {
        const grid = $('#shoutout-grid');
        if (!grid) return;
        const shoutouts = [];
        const total = sessions.reduce((a, s) => a + s.problems, 0);
        const streak = calculateStreak();
        if (sessions.length > 0) shoutouts.push({ emoji: '', title: 'First Session!', text: 'Started the coding journey!' });
        if (streak >= 3) shoutouts.push({ emoji: '', title: '3-Day Streak!', text: 'Consistency is building!' });
        if (streak >= 7) shoutouts.push({ emoji: '', title: '7-Day Streak!', text: 'A whole week of practice!' });
        if (streak >= 14) shoutouts.push({ emoji: '', title: '2-Week Streak!', text: 'Unstoppable momentum!' });
        if (streak >= 30) shoutouts.push({ emoji: '', title: 'Month-long Streak!', text: 'True dedication!' });
        if (total >= 50) shoutouts.push({ emoji: '', title: '50 Problems!', text: 'Half century of solutions!' });
        if (total >= 100) shoutouts.push({ emoji: '', title: '100 Problems!', text: 'Triple digits achieved!' });
        const xp = getXP();
        const { level } = getLevel(xp);
        if (level >= 4) shoutouts.push({ emoji: '', title: 'Intermediate!', text: 'Leveled up past beginner!' });
        if (level >= 7) shoutouts.push({ emoji: '', title: 'Advanced!', text: 'High-level coder!' });
        if (shoutouts.length === 0) {
            grid.innerHTML = '<div class="empty-state"><span class="material-icons-outlined">campaign</span><p>Complete milestones to see shoutouts here!</p></div>';
            return;
        }
        grid.innerHTML = shoutouts.map(s => `<div class="shoutout-card"><span class="shoutout-emoji">${s.emoji}</span><strong>${s.title}</strong><p>${s.text}</p></div>`).join('');
    }

    //  Study Buddy 
    function renderStudyBuddy() {
        const match = $('#buddy-match');
        if (!match) return;
        const buddy = BUDDY_POOL[Math.floor(Math.random() * BUDDY_POOL.length)];
        const streak = Math.floor(Math.random() * 15) + 1;
        match.innerHTML = `<div class="buddy-profile">
            <div class="buddy-avatar" style="background:${buddy.color}">${buddy.initials}</div>
            <div class="buddy-info"><strong>${buddy.name}</strong><span>Practicing: ${buddy.topics.join(', ')}</span><span> ${streak}-day streak</span></div>
        </div>
        <p class="buddy-msg">Team up and hold each other accountable! Practice together daily.</p>`;
    }

    //  Analytics: Mood Chart 
    function renderMoodChart() {
        const ctx = document.getElementById('mood-chart');
        if (!ctx) return;
        if (chartInstances.mood) chartInstances.mood.destroy();
        const moodMap = { frustrated: 1, neutral: 2, good: 3, great: 4, amazing: 5 };
        const recent = [...sessions].filter(s => s.mood).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-14);
        if (recent.length === 0) return;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#c0c7d0' : '#40484f';
        chartInstances.mood = new Chart(ctx, {
            type: 'line', data: {
                labels: recent.map(s => formatDate(s.date)),
                datasets: [{ label: 'Mood', data: recent.map(s => moodMap[s.mood] || 3),
                    borderColor: isDark ? '#ffba20' : '#e65100', backgroundColor: 'transparent',
                    tension: 0.4, pointRadius: 6, pointBackgroundColor: isDark ? '#ffba20' : '#e65100',
                    pointBorderColor: isDark ? '#1d2023' : '#fff', pointBorderWidth: 2 }]
            }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false },
                tooltip: { callbacks: { label: (c) => ['', 'Frustrated ', 'Neutral ', 'Good ', 'Great ', 'Amazing '][c.raw] || '' } } },
                scales: { x: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Lexend', size: 11 } }, border: { display: false } },
                    y: { min: 0, max: 5, ticks: { color: textColor, font: { family: 'Lexend', size: 11 }, stepSize: 1,
                        callback: v => ['', '', '', '', '', ''][v] || '' }, grid: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }, border: { display: false } } } }
        });
    }

    //  Analytics: Difficulty Trend 
    function renderDifficultyTrendChart() {
        const ctx = document.getElementById('difficulty-trend-chart');
        if (!ctx) return;
        if (chartInstances.diffTrend) chartInstances.diffTrend.destroy();
        const counts = { Easy: 0, Medium: 0, Hard: 0 };
        sessions.forEach(s => { if (counts[s.difficulty] !== undefined) counts[s.difficulty] += s.problems; });
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        chartInstances.diffTrend = new Chart(ctx, {
            type: 'doughnut', data: {
                labels: ['Easy', 'Medium', 'Hard'],
                datasets: [{ data: [counts.Easy, counts.Medium, counts.Hard],
                    backgroundColor: [isDark ? 'rgba(89,222,155,0.7)' : 'rgba(0,109,67,0.7)', isDark ? 'rgba(142,205,255,0.7)' : 'rgba(0,100,148,0.7)', isDark ? 'rgba(255,180,171,0.7)' : 'rgba(186,26,26,0.7)'],
                    borderColor: isDark ? '#1d2023' : '#fff', borderWidth: 3 }]
            }, options: { responsive: true, maintainAspectRatio: false, cutout: '60%',
                plugins: { legend: { position: 'bottom', labels: { color: isDark ? '#c0c7d0' : '#40484f', font: { family: 'Lexend', size: 11 }, padding: 16, usePointStyle: true } } } }
        });
    }

    //  Analytics: Best Day 
    function renderBestDayChart() {
        const ctx = document.getElementById('best-day-chart');
        if (!ctx) return;
        if (chartInstances.bestDay) chartInstances.bestDay.destroy();
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayCounts = [0, 0, 0, 0, 0, 0, 0];
        sessions.forEach(s => { const d = new Date(s.date + 'T00:00:00'); dayCounts[d.getDay()] += s.problems; });
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const maxVal = Math.max(...dayCounts);
        chartInstances.bestDay = new Chart(ctx, {
            type: 'bar', data: { labels: dayNames, datasets: [{ label: 'Problems', data: dayCounts,
                backgroundColor: dayCounts.map(v => v === maxVal && v > 0 ? (isDark ? '#8ecdff' : '#006494') : (isDark ? 'rgba(142,205,255,0.25)' : 'rgba(0,100,148,0.2)')),
                borderRadius: 8, maxBarThickness: 40 }] },
            options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: { x: { grid: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }, ticks: { color: isDark ? '#c0c7d0' : '#40484f', font: { family: 'Lexend' } }, border: { display: false }, beginAtZero: true },
                    y: { grid: { display: false }, ticks: { color: isDark ? '#c0c7d0' : '#40484f', font: { family: 'Lexend', size: 12, weight: '600' } }, border: { display: false } } } }
        });
    }

    //  Analytics: Time Heatmap 
    function renderTimeHeatmap() {
        const container = $('#time-heatmap');
        if (!container) return;
        const slots = ['Morning (6-12)', 'Afternoon (12-17)', 'Evening (17-22)', 'Night (22-6)'];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const grid = Array.from({ length: 7 }, () => [0, 0, 0, 0]);
        sessions.forEach(s => {
            const d = new Date(s.date + 'T00:00:00').getDay();
            const h = s.hour !== undefined ? s.hour : 12;
            let slot = 0;
            if (h >= 6 && h < 12) slot = 0;
            else if (h >= 12 && h < 17) slot = 1;
            else if (h >= 17 && h < 22) slot = 2;
            else slot = 3;
            grid[d][slot] += s.problems || 1;
        });
        const maxVal = Math.max(1, ...grid.flat());
        let html = '<div class="time-heatmap-grid"><div class="th-corner"></div>';
        slots.forEach(s => { html += `<div class="th-header">${s}</div>`; });
        dayNames.forEach((day, di) => {
            html += `<div class="th-day">${day}</div>`;
            grid[di].forEach(val => {
                const intensity = Math.min(Math.round((val / maxVal) * 4), 4);
                html += `<div class="th-cell" data-level="${intensity}" title="${day} ${slots[grid[di].indexOf(val)]}: ${val} problems"></div>`;
            });
        });
        html += '</div>';
        container.innerHTML = html;
    }

    //  Analytics: Mood Summary 
    function renderMoodSummary() {
        const grid = $('#mood-summary-grid');
        if (!grid) return;
        const moods = [
            { key: 'frustrated', emoji: '', label: 'Frustrated' },
            { key: 'neutral', emoji: '', label: 'Neutral' },
            { key: 'good', emoji: '', label: 'Good' },
            { key: 'great', emoji: '', label: 'Great' },
            { key: 'amazing', emoji: '', label: 'Amazing' },
        ];
        const counts = {};
        moods.forEach(m => { counts[m.key] = 0; });
        sessions.forEach(s => { if (s.mood && counts[s.mood] !== undefined) counts[s.mood]++; });
        const total = Math.max(1, sessions.filter(s => s.mood).length);
        grid.innerHTML = moods.map(m => {
            const pct = Math.round((counts[m.key] / total) * 100);
            return `<div class="mood-bar-item">
                <span class="mood-bar-emoji">${m.emoji}</span>
                <div class="mood-bar-track"><div class="mood-bar-fill" style="width:${pct}%"></div></div>
                <span class="mood-bar-pct">${pct}%</span>
            </div>`;
        }).join('');
    }

    //  Boot 
    document.addEventListener('DOMContentLoaded', init);
})();
