// main.js - Handles Database (localStorage), Authentication, and Theme

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. INITIALIZE DATABASE ---
    const getDB = (key) => JSON.parse(localStorage.getItem(key)) ||[];
    const setDB = (key, data) => localStorage.setItem(key, JSON.stringify(data));

    if (!localStorage.getItem('users')) {
        // Seed default users for your instructor to test
        setDB('users',[
            { id: 1, fullname: 'Prateek', email: '24bai70097@cuchd.in', password: '123', secret: 'punto' }
        ]);
        setDB('activities', []);
        setDB('vitals',[]);
    }

    // --- 2. ROUTING & AUTHENTICATION ---
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentPath = window.location.pathname;

    const protectedRoutes =['dashboard.html', 'activity.html', 'vitals.html', 'alerts.html', 'feedback.html', 'settings.html'];
    const publicRoutes = ['index.html', 'signup.html', 'forgot_password.html'];

    // Protect private routes
    if (protectedRoutes.some(route => currentPath.includes(route)) && !currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Protect public routes (if logged in, don't show login page)
    if ((currentPath.endsWith('/') || publicRoutes.some(route => currentPath.includes(route))) && currentUser) {
        if (!currentPath.includes('logout')) {
            window.location.href = 'dashboard.html';
            return;
        }
    }

    // Populate Dynamic User Names
    document.querySelectorAll('.user-name-display').forEach(el => {
        if (currentUser) el.textContent = currentUser.fullname;
    });

    // Handle Logout
    document.querySelectorAll('.logout-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    });

    // --- 3. THEME MANAGEMENT ---
    const toggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const toast = document.getElementById('theme-toast');
    const html = document.documentElement;

    function updateIcon(theme) {
        if (themeIcon) themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }

    const currentTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', currentTheme);
    updateIcon(currentTheme);

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            let theme = html.getAttribute('data-theme');
            let newTheme = theme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateIcon(newTheme);
            showToast(newTheme === 'dark' ? "Dark Mode Enabled 🌙" : "Light Mode Enabled ☀️");
        });
    }

    // --- 4. FORM HANDLERS ---

    // 4a. Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const identifier = document.getElementById('username').value.trim().toLowerCase();
            const password = document.getElementById('password').value;
            
            const users = getDB('users');
            const user = users.find(u => 
                (u.email.toLowerCase() === identifier || u.fullname.toLowerCase() === identifier) && 
                u.password === password
            );

            if (user) {
                localStorage.setItem('currentUser', JSON.stringify({ id: user.id, fullname: user.fullname, email: user.email }));
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid username/email or password.');
            }
        });
    }

    // 4b. Signup
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullname = document.getElementById('fullname').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const secret = document.getElementById('secret_answer').value.trim();
            
            const users = getDB('users');
            if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
                alert('Email is already registered.');
                return;
            }

            users.push({ id: Date.now(), fullname, email, password, secret });
            setDB('users', users);
            alert('Account created successfully! Please log in.');
            window.location.href = 'index.html';
        });
    }

    // 4c. Add Activity
    const activityForm = document.getElementById('activity-form');
    if (activityForm) {
        activityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const date = document.getElementById('date').value;
            const steps = document.getElementById('steps').value;
            
            const acts = getDB('activities');
            acts.push({ id: Date.now(), user_id: currentUser.id, date, steps });
            setDB('activities', acts);
            
            alert('Activity logged successfully!');
            window.location.reload();
        });
    }

    // 4d. Render Activity History
    const activityList = document.getElementById('activity-list');
    if (activityList && currentUser) {
        const acts = getDB('activities').filter(a => a.user_id === currentUser.id).reverse();
        activityList.innerHTML = acts.length === 0 
            ? '<li style="padding: 0.5rem 0;">No activity logged yet.</li>' 
            : acts.map(a => `<li style="border-bottom: 1px solid var(--border-color); padding: 0.75rem 0.25rem; font-size: 1.1rem; color: var(--text-color);"><strong>${a.date}</strong>: ${a.steps} steps</li>`).join('');
    }
});