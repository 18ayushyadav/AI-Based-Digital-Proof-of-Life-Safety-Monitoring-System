// ==================== DOM ELEMENTS ====================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const themeToggle = document.getElementById('themeToggle');
const backToTop = document.getElementById('backToTop');
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const particles = document.getElementById('particles');

// ==================== DARK MODE ====================
function initTheme() {
    const saved = localStorage.getItem('theme');
    const theme = saved || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
});

initTheme();

// ==================== NAVBAR ====================
// Scroll effect
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    backToTop.classList.toggle('visible', window.scrollY > 400);
});

// Active link highlight
const sections = document.querySelectorAll('section[id]');
function highlightNav() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
        const top = section.offsetTop - 100;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (link) {
            link.classList.toggle('active', scrollY >= top && scrollY < top + height);
        }
    });
}
window.addEventListener('scroll', highlightNav);

// Mobile menu
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// ==================== BACK TO TOP ====================
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ==================== SCROLL ANIMATIONS ====================
const animateElements = document.querySelectorAll('.animate');

const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

animateElements.forEach(el => observer.observe(el));

// ==================== COUNTER ANIMATION ====================
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const update = () => {
            current += step;
            if (current >= target) {
                counter.textContent = target;
                return;
            }
            counter.textContent = Math.floor(current);
            requestAnimationFrame(update);
        };
        update();
    });
}

// Trigger counter when hero is visible
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            heroObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

const heroSection = document.getElementById('home');
if (heroSection) heroObserver.observe(heroSection);

// ==================== PARTICLES ====================
function createParticles() {
    if (!particles) return;
    const count = window.innerWidth < 768 ? 8 : 15;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 12 + 4;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.animationDuration = (Math.random() * 6 + 5) + 's';
        particles.appendChild(particle);
    }
}
createParticles();

// ==================== CONTACT FORM ====================
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const submitBtn = document.getElementById('submitBtn');

    if (!name || !email || !message) {
        formStatus.className = 'form-status error';
        formStatus.textContent = 'Please fill in all required fields.';
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        formStatus.className = 'form-status error';
        formStatus.textContent = 'Please enter a valid email address.';
        return;
    }

    // Simulate submission
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    setTimeout(() => {
        formStatus.className = 'form-status success';
        formStatus.textContent = '✓ Message sent successfully! We\'ll get back to you soon.';
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';

        setTimeout(() => {
            formStatus.style.display = 'none';
            formStatus.className = 'form-status';
        }, 5000);
    }, 1500);
});

// ==================== SMOOTH SCROLL FOR ALL ANCHOR LINKS ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
            const offset = 80;
            const pos = targetEl.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: pos, behavior: 'smooth' });
        }
    });
});

// ==================== AUTH MODAL ====================
const API_BASE = '/api';
const authModal = document.getElementById('authModal');
const navLoginBtn = document.getElementById('navLoginBtn');
const closeAuthModal = document.getElementById('closeAuthModal');
const navAuthContainer = document.getElementById('navAuthContainer');
const navUserContainer = document.getElementById('navUserContainer');
const navUserName = document.getElementById('navUserName');
const navLogoutBtn = document.getElementById('navLogoutBtn');

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const otpForm = document.getElementById('otpForm');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');

const loginStatus = document.getElementById('loginStatus');
const signupStatus = document.getElementById('signupStatus');
const otpStatus = document.getElementById('otpStatus');

const authDashPanel = document.getElementById('authDashboardPanel');
const mockDashPanel = document.getElementById('mockDashboardPanel');
const btnSimulate = document.getElementById('btnSimulateVerify');
const verifyResult = document.getElementById('verifyResult');

let pendingEmail = '';  // holds email between login → OTP step

// --- Helper: API call ---
async function apiCall(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('safeguard_token');
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${endpoint}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Request failed');
    return data;
}

// --- Helper: Show status message ---
function showStatus(el, type, msg) {
    el.className = `form-status ${type}`;
    el.textContent = msg;
}

// --- Helper: Switch active auth form ---
function switchForm(target) {
    [loginForm, signupForm, otpForm].forEach(f => f.classList.remove('active'));
    target.classList.add('active');
}

// --- Open / Close modal ---
function openModal() { authModal.classList.add('active'); switchForm(loginForm); }
function closeModal() { authModal.classList.remove('active'); }

navLoginBtn.addEventListener('click', openModal);
closeAuthModal.addEventListener('click', closeModal);
authModal.addEventListener('click', e => { if (e.target === authModal) closeModal(); });

// --- Toggle between login / signup ---
showSignup.addEventListener('click', e => { e.preventDefault(); switchForm(signupForm); });
showLogin.addEventListener('click', e => { e.preventDefault(); switchForm(loginForm); });

// --- Update UI after login / logout ---
function setLoggedIn(user) {
    navAuthContainer.style.display = 'none';
    navUserContainer.style.display = 'flex';
    navUserName.textContent = `👤 ${user.name}`;
    authDashPanel.style.display = 'block';
    mockDashPanel.style.display = 'none';
    closeModal();
}

function setLoggedOut() {
    localStorage.removeItem('safeguard_token');
    localStorage.removeItem('safeguard_user');
    navAuthContainer.style.display = 'block';
    navUserContainer.style.display = 'none';
    authDashPanel.style.display = 'none';
    mockDashPanel.style.display = 'block';
}

navLogoutBtn.addEventListener('click', setLoggedOut);

// --- Restore session on page load ---
(function restoreSession() {
    const token = localStorage.getItem('safeguard_token');
    const user = localStorage.getItem('safeguard_user');
    if (token && user) {
        setLoggedIn(JSON.parse(user));
    }
})();

// ==================== SIGNUP ====================
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSignup');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    showStatus(signupStatus, 'info', 'Creating your account...');
    try {
        const data = await apiCall('/auth/signup', 'POST', {
            name: document.getElementById('signupName').value.trim(),
            email: document.getElementById('signupEmail').value.trim(),
            password: document.getElementById('signupPassword').value
        });
        showStatus(signupStatus, 'success', '✓ ' + data.msg + ' — You can now log in.');
        signupForm.reset();
        setTimeout(() => switchForm(loginForm), 1800);
    } catch (err) {
        showStatus(signupStatus, 'error', '✗ ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Create Account <i class="fas fa-plus"></i>';
    }
});

// ==================== LOGIN ====================
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnLogin');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    showStatus(loginStatus, 'info', 'Verifying credentials...');
    try {
        pendingEmail = document.getElementById('loginEmail').value.trim();
        const data = await apiCall('/auth/login', 'POST', {
            email: pendingEmail,
            password: document.getElementById('loginPassword').value
        });
        // In simulation mode, the OTP is returned in the response for easy testing
        if (data.otp) {
            document.getElementById('otpCode').value = data.otp;
            showStatus(loginStatus, 'success', `✓ OTP for testing: ${data.otp}`);
        } else {
            showStatus(loginStatus, 'success', '✓ OTP sent! Check your email.');
        }
        setTimeout(() => switchForm(otpForm), 1200);
    } catch (err) {
        showStatus(loginStatus, 'error', '✗ ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Login <i class="fas fa-arrow-right"></i>';
    }
});

// ==================== VERIFY OTP ====================
otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnVerifyOtp');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    showStatus(otpStatus, 'info', 'Checking your code...');
    try {
        const data = await apiCall('/auth/verify-otp', 'POST', {
            email: pendingEmail,
            otp: document.getElementById('otpCode').value.trim()
        });
        localStorage.setItem('safeguard_token', data.token);
        localStorage.setItem('safeguard_user', JSON.stringify(data.user));
        showStatus(otpStatus, 'success', '✓ Authenticated! Welcome back.');
        setTimeout(() => setLoggedIn(data.user), 900);
    } catch (err) {
        showStatus(otpStatus, 'error', '✗ ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = "Verify Let's Go <i class='fas fa-check'></i>";
    }
});

// ==================== SIMULATE AI VERIFY ====================
btnSimulate.addEventListener('click', async () => {
    const method = document.getElementById('verifyMethod').value;
    btnSimulate.disabled = true;
    btnSimulate.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
    verifyResult.style.display = 'none';
    verifyResult.className = 'form-status';
    try {
        const data = await apiCall('/verify', 'POST', {
            method,
            payload: 'simulated-media-data'
        });
        verifyResult.style.display = 'block';
        verifyResult.className = 'form-status success';
        verifyResult.innerHTML = `✅ <strong>${data.result.toUpperCase()}</strong> — Method: ${method} &nbsp;|&nbsp; Record ID: ${data.recordId}`;
    } catch (err) {
        verifyResult.style.display = 'block';
        verifyResult.className = 'form-status error';
        verifyResult.textContent = '⚠️ ' + err.message;
    } finally {
        btnSimulate.disabled = false;
        btnSimulate.innerHTML = '<i class="fas fa-camera"></i> Run Scan';
    }
});

