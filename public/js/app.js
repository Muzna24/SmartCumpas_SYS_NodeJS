const API = '/api';
let currentUser = null; // { role: 'student'|'admin', studentId, name } or { role: 'admin', username }

// ---------- Theme toggle ----------
document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
});

// ---------- Login ----------
async function attemptLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const statusEl = document.getElementById('login-status');

    if (!username || !password) {
        statusEl.innerHTML = '<span class="error-text">Enter username and password.</span>';
        return;
    }

    const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (res.ok) {
        statusEl.innerHTML = '';
        await checkLoginStatus();
    } else {
        statusEl.innerHTML = `<span class="error-text">${data.error}</span>`;
    }
}

document.getElementById('login-btn').addEventListener('click', attemptLogin);

document.getElementById('login-username').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attemptLogin();
});

document.getElementById('login-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attemptLogin();
});

// ---------- User menu dropdown ----------
document.getElementById('user-menu-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = document.getElementById('user-menu-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? '' : 'none';
});

document.addEventListener('click', () => {
    document.getElementById('user-menu-dropdown').style.display = 'none';
});

document.getElementById('user-menu-profile').addEventListener('click', () => {
    document.getElementById('user-menu-dropdown').style.display = 'none';
    if (currentUser.role === 'student') {
        document.querySelectorAll('.tab-btn[data-tab]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.querySelector('.tab-btn[data-tab="profile"]').classList.add('active');
        document.getElementById('profile').classList.add('active');
        loadProfile();
    }
});

// ---------- Logout ----------
document.getElementById('user-menu-logout').addEventListener('click', async () => {
    document.getElementById('user-menu-dropdown').style.display = 'none';
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    currentUser = null;
    showLoginScreen();
});

// ---------- Check login status on page load ----------
async function checkLoginStatus() {
    const res = await fetch(`${API}/auth/me`, { credentials: 'include' });
    if (res.ok) {
        currentUser = await res.json();
        showApp();
    } else {
        currentUser = null;
        showLoginScreen();
    }
}

function showLoginScreen() {
    document.getElementById('login-screen').style.display = '';
    document.getElementById('app-shell').style.display = 'none';
}

function showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-shell').style.display = '';

    const adminTabBtn = document.getElementById('admin-tab-btn');
    const registerTabBtn = document.getElementById('register-tab-btn');
    const profileTabBtn = document.getElementById('profile-tab-btn');
    const loggedInAsEl = document.getElementById('logged-in-as');

    if (currentUser.role === 'admin') {
        document.body.classList.add('is-admin');
        adminTabBtn.style.display = '';
        registerTabBtn.style.display = '';
        profileTabBtn.style.display = 'none';
        document.getElementById('user-menu-profile').style.display = 'none';
        loggedInAsEl.textContent = `Admin`;
        document.getElementById('home-heading').textContent = 'Dashboard';
        document.getElementById('home-tab-label').textContent = 'Home';
        document.getElementById('my-bookings-heading').textContent = 'Student Bookings';
        document.getElementById('add-facility-form').style.display = '';
        document.getElementById('mybookings-controls').style.display = '';

        // Admin lands on Home
        document.querySelectorAll('.tab-btn[data-tab]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('home-tab-btn').classList.add('active');
        document.getElementById('home').classList.add('active');
        loadDashboard();
        loadMyBookings();
    } else {
        document.body.classList.remove('is-admin');
        adminTabBtn.style.display = 'none';
        registerTabBtn.style.display = 'none';
        profileTabBtn.style.display = '';
        document.getElementById('user-menu-profile').style.display = '';
        loggedInAsEl.textContent = `${currentUser.name} (Student ID: ${currentUser.studentId})`;
        document.getElementById('home-tab-label').textContent = 'My Bookings';
        document.getElementById('home-heading').textContent = `Welcome back, ${currentUser.name.split(' ')[0]}`;
        document.getElementById('my-bookings-heading').textContent = 'My Bookings';
        document.getElementById('add-facility-form').style.display = 'none';
        document.getElementById('mybookings-controls').style.display = 'none';

        // Students land on Book a Facility instead of Home
        document.querySelectorAll('.tab-btn[data-tab]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.querySelector('.tab-btn[data-tab="browse"]').classList.add('active');
        document.getElementById('browse').classList.add('active');
        loadFacilities();
    }
}


// ---------- Forgot Password ----------
document.getElementById('forgot-password-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('forgot-password-screen').style.display = '';
});

document.getElementById('back-to-login-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('forgot-password-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = '';
});

async function attemptResetPassword() {
    const studentId = document.getElementById('reset-studentId').value;
    const newPassword = document.getElementById('reset-newPassword').value;
    const statusEl = document.getElementById('reset-status');

    if (!studentId || !newPassword) {
        statusEl.innerHTML = '<span class="error-text">Enter your Student ID and a new password.</span>';
        return;
    }

    const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, newPassword })
    });
    const data = await res.json();

    if (res.ok) {
        statusEl.innerHTML = '';
        showToast(data.message);
        document.getElementById('reset-studentId').value = '';
        document.getElementById('reset-newPassword').value = '';
    } else {
        statusEl.innerHTML = `<span class="error-text">${data.error}</span>`;
    }
}

document.getElementById('reset-password-btn').addEventListener('click', attemptResetPassword);

document.getElementById('reset-studentId').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attemptResetPassword();
});

document.getElementById('reset-newPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attemptResetPassword();
});

// ---------- Toast popup ----------
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'uv-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('uv-toast--show'));

    setTimeout(() => {
        toast.classList.remove('uv-toast--show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ---------- Dashboard ----------
async function loadDashboard() {
    let cards = [];

    if (currentUser.role === 'admin') {
        const facRes = await fetch(`${API}/facilities`, { credentials: 'include' });
        const facilities = await facRes.json();
        const activeCount = facilities.filter(f => f.Status === 'Active').length;

        const bookRes = await fetch(`${API}/admin/all-bookings`, { credentials: 'include' });
        const bookings = await bookRes.json();

        const busyRes = await fetch(`${API}/admin/busy-report`, { credentials: 'include' });
        const busy = await busyRes.json();
        const busyCount = busy.filter(f => f.Status === 'Busy').length;

        cards.push({ icon: '▤', value: facilities.length, label: 'Total Facilities' });
        cards.push({ icon: '✓', value: activeCount, label: 'Active Facilities' });
        cards.push({ icon: '▦', value: bookings.length, label: 'Total Bookings' });
        cards.push({ icon: '⚑', value: busyCount, label: 'Busy Facilities' });
    } else {
        const myRes = await fetch(`${API}/bookings/student/${currentUser.studentId}`, { credentials: 'include' });
        const myBookings = await myRes.json();

        // Find next upcoming booking
        const now = new Date();
        const upcoming = myBookings
            .map(b => {
                const [hours, minutes] = b.StartTime.split(':').map(Number);
                const dt = new Date(b.BookingDate);
                dt.setHours(hours, minutes, 0, 0);
                return { ...b, dateTime: dt };
            })
            .filter(b => b.dateTime > now)
            .sort((a, b) => a.dateTime - b.dateTime);

        const nextBooking = upcoming.length > 0
            ? `${upcoming[0].FacilityName} — ${upcoming[0].dateTime.toLocaleDateString()} ${upcoming[0].StartTime}`
            : 'None scheduled';

        // Find most booked facility
        const counts = {};
        myBookings.forEach(b => {
            counts[b.FacilityName] = (counts[b.FacilityName] || 0) + 1;
        });
        let mostBooked = '—';
        let maxCount = 0;
        Object.entries(counts).forEach(([name, count]) => {
            if (count > maxCount) { maxCount = count; mostBooked = `${name} (${count}x)`; }
        });

        cards.push({ icon: '⏱', value: nextBooking, label: 'Next Booking', isText: true });
        cards.push({ icon: '★', value: mostBooked, label: 'Most Booked Facility', isText: true });
        cards.push({ icon: '▦', value: myBookings.length, label: 'My Bookings' });
    }

    const grid = document.getElementById('stat-grid');
    grid.innerHTML = cards.map(c => `
        <div class="stat-card">
            <div class="stat-card__icon">${c.icon}</div>
            <div class="stat-card__value ${c.isText ? 'stat-card__value--text' : ''}">${c.value}</div>
            <div class="stat-card__label">${c.label}</div>
        </div>
    `).join('');
}

// ---------- Tab switching ----------
document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn[data-tab]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');

        if (btn.dataset.tab === 'home') { loadDashboard(); loadMyBookings(); }
        if (btn.dataset.tab === 'browse') loadFacilities();
        if (btn.dataset.tab === 'admin') loadBusyReport();
        if (btn.dataset.tab === 'register-student') loadStudentsTable();
        if (btn.dataset.tab === 'profile') loadProfile();
    });
});

// ---------- Register Student ----------
document.getElementById('register-student-btn').addEventListener('click', async () => {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const statusEl = document.getElementById('register-status');

    if (!name || !email || !password) {
        statusEl.innerHTML = '<span class="error-text">Fill in all fields.</span>';
        return;
    }

    const res = await fetch(`${API}/students/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (res.ok) {
        statusEl.innerHTML = `<span class="success-text">${data.message} Student ID: <strong>${data.studentId}</strong> — give this to the student to log in.</span>`;
        document.getElementById('reg-name').value = '';
        document.getElementById('reg-email').value = '';
        document.getElementById('reg-password').value = '';
        loadStudentsTable();
    } else {
        statusEl.innerHTML = `<span class="error-text">${data.error}</span>`;
    }
});

// ---------- Students Information ----------
async function loadStudentsTable() {
    const res = await fetch(`${API}/students/all`, { credentials: 'include' });
    const data = await res.json();
    const tbody = document.querySelector('#students-table tbody');
    tbody.innerHTML = '';

    data.forEach(s => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${s.StudentID}</td>
            <td>${s.Name}</td>
            <td>${s.Email}</td>
            <td><button class="delete-student-btn" data-id="${s.StudentID}" title="Delete student">🗑️</button></td>`;
        tbody.appendChild(row);
    });

    document.querySelectorAll('.delete-student-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Delete this student? This cannot be undone.')) return;

            const res = await fetch(`${API}/students/${btn.dataset.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await res.json();

            if (res.ok) {
                loadStudentsTable();
            } else {
                alert(data.error);
            }
        });
    });
}

// ---------- Profile ----------
async function loadProfile() {
    const res = await fetch(`${API}/students/me`, { credentials: 'include' });
    const data = await res.json();
    document.getElementById('profile-name').value = data.Name;
    document.getElementById('profile-email').value = data.Email;

    document.getElementById('profile-header-name').textContent = data.Name;
    document.getElementById('profile-header-id').textContent = `Student ID: ${currentUser.studentId}`;

    const initials = data.Name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    document.getElementById('profile-avatar').textContent = initials;
}

document.getElementById('save-profile-btn').addEventListener('click', async () => {
    const name = document.getElementById('profile-name').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    const statusEl = document.getElementById('profile-status');

    if (!name || !email) {
        statusEl.innerHTML = '<span class="error-text">Fill in both fields.</span>';
        return;
    }

    const res = await fetch(`${API}/students/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email })
    });
    const data = await res.json();

    if (res.ok) {
        statusEl.innerHTML = '';
        showToast(data.message);
        currentUser.name = name;
        document.getElementById('logged-in-as').textContent = `${name} (${currentUser.studentId})`;
        document.getElementById('profile-header-name').textContent = name;
        const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        document.getElementById('profile-avatar').textContent = initials;
    } else {
        statusEl.innerHTML = `<span class="error-text">${data.error}</span>`;
    }
});

document.getElementById('change-password-btn').addEventListener('click', async () => {
    const currentPassword = document.getElementById('profile-currentPassword').value;
    const newPassword = document.getElementById('profile-newPassword').value;
    const statusEl = document.getElementById('password-status');

    if (!currentPassword || !newPassword) {
        statusEl.innerHTML = '<span class="error-text">Fill in both password fields.</span>';
        return;
    }

    const res = await fetch(`${API}/students/me/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();

    if (res.ok) {
        statusEl.innerHTML = '';
        showToast(data.message);
        document.getElementById('profile-currentPassword').value = '';
        document.getElementById('profile-newPassword').value = '';
    } else {
        statusEl.innerHTML = `<span class="error-text">${data.error}</span>`;
    }
});

// ---------- Browse Facilities ----------
async function loadFacilities() {
    const res = await fetch(`${API}/facilities`, { credentials: 'include' });
    facilitiesCache = await res.json();
    renderCategorizedFacilities();
}

document.getElementById('add-facility-btn').addEventListener('click', async () => {
    const facilityName = document.getElementById('new-facility-name').value;
    const buildingName = document.getElementById('new-facility-building').value;
    const floor = document.getElementById('new-facility-floor').value;
    const capacity = document.getElementById('new-facility-capacity').value;
    const status = document.getElementById('new-facility-status').value;
    const photoInput = document.getElementById('new-facility-photo');
    const statusEl = document.getElementById('add-facility-status');

    if (!facilityName || !buildingName || floor === '' || !capacity || !photoInput.files[0]) {
        statusEl.innerHTML = '<span class="error-text">Fill in all fields and choose a photo.</span>';
        return;
    }

    const formData = new FormData();
    formData.append('facilityName', facilityName);
    formData.append('buildingName', buildingName);
    formData.append('floor', floor);
    formData.append('capacity', capacity);
    formData.append('status', status);
    formData.append('photo', photoInput.files[0]);

    const res = await fetch(`${API}/facilities`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    });
    const data = await res.json();

    if (res.ok) {
        statusEl.innerHTML = `<span class="success-text">${data.message}</span>`;
        document.getElementById('new-facility-name').value = '';
        document.getElementById('new-facility-building').value = '';
        document.getElementById('new-facility-floor').value = '';
        document.getElementById('new-facility-capacity').value = '';
        photoInput.value = '';
        loadFacilities();
    } else {
        statusEl.innerHTML = `<span class="error-text">${data.error}</span>`;
    }
});

// ---------- Facility Categories ----------
const FACILITY_CATEGORIES = {
    'Computer Labs': { icon: '💻', color: '#5B8DEF', names: ['Computer Lab A', 'Computer Lab B'] },
    'Libraries': { icon: '📚', color: '#8E6FE8', names: ['Library Main', 'Library Quiet'] },
    'Sports & Fitness': { icon: '🏀', color: '#E2A33D', names: ['Basketball Court 1', 'Basketball Court 2', 'Swimming Pool', 'Gym A', 'Gym B', 'Outdoor Field'] },
    'Lecture Halls': { icon: '🎓', color: '#4CB88A', names: ['Lecture Hall 1', 'Lecture Hall 2', 'Auditorium'] },
    'Study & Meeting Rooms': { icon: '📖', color: '#5DAAB9', names: ['Study Room A', 'Study Room B', 'Conference Room'] },
    'Labs': { icon: '🔬', color: '#E2637D', names: ['Science Lab', 'Engineering Lab'] },
    'Arts': { icon: '🎨', color: '#D97BC4', names: ['Music Room', 'Art Studio'] }
};

const FACILITY_PHOTOS = {
    'Computer Lab A': 'images/computer-lab.jpg',
    'Computer Lab B': 'images/computer-lab.jpg',
    'Library Main': 'images/library.jpg',
    'Library Quiet': 'images/study-room.jpg',
    'Basketball Court 1': 'images/basketball-court.jpg',
    'Basketball Court 2': 'images/basketball-court.jpg',
    'Swimming Pool': 'images/swimming-pool.jpg',
    'Gym A': 'images/gym.jpg',
    'Gym B': 'images/gym.jpg',
    'Study Room A': 'images/study-room.jpg',
    'Study Room B': 'images/study-room.jpg',
    'Music Room': 'images/music-room.jpg',
    'Art Studio': 'images/art-studio.jpg',
    'Lecture Hall 1': 'images/Lecture-Hall.jpg',
    'Lecture Hall 2': 'images/Lecture-Hall.jpg',
    'Auditorium': 'images/Auditorium.jpg',
    'Conference Room': 'images/Conference-Room.jpg',
    'Science Lab': 'images/Science-Lab.jpg',
    'Engineering Lab': 'images/Engineering-Lab.jpg',
    'Outdoor Field': 'images/outdoor-field.jpg'
};
let facilitiesCache = [];
let currentDetailFacility = null;

function renderCategorizedFacilities() {
    const container = document.getElementById('facility-categories');
    container.innerHTML = '';

    Object.entries(FACILITY_CATEGORIES).forEach(([categoryName, config]) => {
        const facilitiesInCategory = facilitiesCache.filter(f => config.names.includes(f.FacilityName));
        if (facilitiesInCategory.length === 0) return;

        const block = document.createElement('div');
        block.className = 'category-block';

        const title = document.createElement('div');
        title.className = 'category-block__title';
        title.textContent = categoryName;
        block.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'facility-grid';

        facilitiesInCategory.forEach(f => {
            const isInactive = f.Status !== 'Active';
            const card = document.createElement('div');
            card.className = 'facility-card' + (isInactive ? ' is-inactive' : '');
            const photoUrl = f.PhotoPath || FACILITY_PHOTOS[f.FacilityName];
            const photoHtml = photoUrl
                ? `<div class="facility-card__photo" style="background-image:url('${photoUrl}');"></div>`
                : `<div class="facility-card__photo" style="background: linear-gradient(135deg, ${config.color}33, ${config.color}0D);"><span style="color:${config.color}">${config.icon}</span></div>`;

            const deleteHtml = currentUser.role === 'admin'
                ? `<button class="delete-facility-btn" data-id="${f.FacilityID}" title="Delete facility">🗑️</button>`
                : '';

            const statusButtonsHtml = currentUser.role === 'admin'
                ? `<div class="status-toggle">
                       <button class="status-btn status-btn--active ${!isInactive ? 'is-current' : ''}" data-id="${f.FacilityID}" data-status="Active">Active</button>
                       <button class="status-btn status-btn--inactive ${isInactive ? 'is-current' : ''}" data-id="${f.FacilityID}" data-status="Inactive">Inactive</button>
                   </div>`
                : '';

            card.innerHTML = `
                ${photoHtml}
                ${deleteHtml}
                <div class="facility-card__body">
                    <div class="facility-card__name">${f.FacilityName}</div>
                    <div class="facility-card__status ${isInactive ? 'status-inactive' : 'status-active'}">${f.Status}</div>
                    ${statusButtonsHtml}
                </div>`;

            if (!isInactive) {
                card.querySelector('.facility-card__photo').addEventListener('click', () => openFacilityDetail(f));
                card.querySelector('.facility-card__name').addEventListener('click', () => openFacilityDetail(f));
                card.style.cursor = 'pointer';
            }

            const deleteBtn = card.querySelector('.delete-facility-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (!confirm('Delete this facility? This cannot be undone.')) return;

                    const res = await fetch(`${API}/facilities/${f.FacilityID}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    const data = await res.json();

                    if (res.ok) {
                        loadFacilities();
                    } else {
                        alert(data.error);
                    }
                });
            }

            card.querySelectorAll('.status-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const res = await fetch(`${API}/facilities/${btn.dataset.id}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ status: btn.dataset.status })
                    });
                    const data = await res.json();

                    if (res.ok) {
                        loadFacilities();
                    } else {
                        alert(data.error);
                    }
                });
            });

            grid.appendChild(card);
        });

        block.appendChild(grid);
        container.appendChild(block);
    });
}

let selectedDetailDate = null;
let calViewMonth = null; // {year, month} being displayed

function openFacilityDetail(facility) {
    currentDetailFacility = facility;
    document.getElementById('facility-detail-name').textContent = facility.FacilityName;
    document.getElementById('facility-detail-meta').textContent =
        `${facility.BuildingName}, Floor ${facility.Floor} · Capacity ${facility.Capacity}`;
    document.getElementById('detail-best-window').textContent = '';
    document.getElementById('detail-booking-status').innerHTML = '';

    const today = new Date();
    selectedDetailDate = toLocalDateString(today);
    calViewMonth = { year: today.getFullYear(), month: today.getMonth() };
    renderMiniCalendar();
    checkDetailAvailability(true);

    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('facility-detail').classList.add('active');
}

function toLocalDateString(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function renderMiniCalendar() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 14);

    const { year, month } = calViewMonth;
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startWeekday = firstDay.getDay();

    document.getElementById('cal-month-label').textContent =
        firstDay.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const grid = document.getElementById('mini-cal-grid');
    grid.innerHTML = '';

    for (let i = 0; i < startWeekday; i++) {
        const empty = document.createElement('div');
        empty.className = 'mini-cal__day is-empty';
        grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const cellDate = new Date(year, month, d);
        cellDate.setHours(0, 0, 0, 0);
        const dateStr = toLocalDateString(cellDate);

        const btn = document.createElement('button');
        btn.className = 'mini-cal__day';
        btn.textContent = d;

        const outOfRange = cellDate < today || cellDate > maxDate;
        btn.disabled = outOfRange;

        if (dateStr === selectedDetailDate) {
            btn.classList.add('is-selected');
        }

        if (!outOfRange) {
            btn.addEventListener('click', () => {
                selectedDetailDate = dateStr;
                renderMiniCalendar();
                checkDetailAvailability(true);
            });
        }

        grid.appendChild(btn);
    }

    const prevMonthEnd = new Date(year, month, 0);
    document.getElementById('cal-prev-btn').disabled = prevMonthEnd < today;

    const nextMonthStart = new Date(year, month + 1, 1);
    document.getElementById('cal-next-btn').disabled = nextMonthStart > maxDate;
}

document.getElementById('cal-prev-btn').addEventListener('click', () => {
    calViewMonth.month--;
    if (calViewMonth.month < 0) { calViewMonth.month = 11; calViewMonth.year--; }
    renderMiniCalendar();
});

document.getElementById('cal-next-btn').addEventListener('click', () => {
    calViewMonth.month++;
    if (calViewMonth.month > 11) { calViewMonth.month = 0; calViewMonth.year++; }
    renderMiniCalendar();
});

document.getElementById('back-to-browse-btn').addEventListener('click', () => {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('browse').classList.add('active');
    document.querySelectorAll('.tab-btn[data-tab]').forEach(b => b.classList.remove('active'));
    document.querySelector('.tab-btn[data-tab="browse"]').classList.add('active');
});

async function checkDetailAvailability(clearStatus) {
    const facilityId = currentDetailFacility.FacilityID;
    const date = selectedDetailDate;
    const slotsContainer = document.getElementById('detail-slots-container');
    const bestWindowEl = document.getElementById('detail-best-window');

    if (clearStatus) {
        document.getElementById('detail-booking-status').textContent = '';
    }

    if (!date) {
        slotsContainer.innerHTML = '<p class="error-text">Please choose a date.</p>';
        return;
    }

    const [allSlotsRes, bestRes] = await Promise.all([
        fetch(`${API}/facilities/${facilityId}/all-slots?date=${date}`, { credentials: 'include' }),
        fetch(`${API}/facilities/${facilityId}/best-window?date=${date}`, { credentials: 'include' })
    ]);
    const allSlots = await allSlotsRes.json();
    const best = await bestRes.json();

    bestWindowEl.textContent = `Longest free block: ${best.BestWindow}`;

    if (allSlots.length === 0) {
        slotsContainer.innerHTML = '<p>No time slots configured.</p>';
        return;
    }

    slotsContainer.innerHTML = '<p>Click a green slot to book:</p><div class="slot-grid"></div>';
    const grid = slotsContainer.querySelector('.slot-grid');

    allSlots.forEach(s => {
        const isAvailable = s.Status === 'Available';
        const btn = document.createElement('button');
        btn.className = 'slot-btn ' + (isAvailable ? 'slot-btn--available' : 'slot-btn--booked');
        btn.textContent = `${s.StartTime} - ${s.EndTime}`;
        btn.disabled = !isAvailable;
        if (isAvailable) {
            btn.addEventListener('click', () => bookDetailSlot(facilityId, date, s.TimeSlotID, btn));
        }
        grid.appendChild(btn);
    });
}

async function bookDetailSlot(facilityId, date, timeSlotId, btnEl) {
    const studentId = currentUser.role === 'admin' ? prompt('Enter Student ID to book for:') : currentUser.studentId;
    if (!studentId) return;
    const statusEl = document.getElementById('detail-booking-status');

    const res = await fetch(`${API}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bookingDate: date, facilityId, studentId, timeSlotId })
    });
    const data = await res.json();

    if (res.ok) {
        await checkDetailAvailability(false);
        statusEl.innerHTML = `<span class="success-text">${data.message}</span>`;
    } else {
        statusEl.innerHTML = `<span class="error-text">${data.error}</span>`;
        if (btnEl) btnEl.classList.add('slot-btn-error');
    }
}

// ---------- My Bookings ----------
let allBookingsCache = [];

function isStartingSoon(bookingDate, startTime) {
    const now = new Date();
    const [hours, minutes] = startTime.split(':').map(Number);
    const bookingDateTime = new Date(bookingDate);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const diffMs = bookingDateTime - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours > 0 && diffHours <= 3; // within the next 3 hours
}

function renderBookings(list) {
    const tbody = document.querySelector('#bookings-table tbody');
    tbody.innerHTML = '';

    list.forEach(b => {
        const soonBadge = isStartingSoon(b.BookingDate, b.StartTime)
            ? '<span class="soon-badge">Starting soon</span>'
            : '';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${b.BookingID}</td>
            <td>${b.StudentID}</td>
            <td>${b.StudentName}</td>
            <td>${new Date(b.BookingDate).toLocaleDateString()}</td>
            <td>${b.FacilityName}</td>
            <td>${b.StartTime} - ${b.EndTime} ${soonBadge}</td>
            <td><button class="cancel-btn" data-id="${b.BookingID}">Cancel</button></td>`;
        tbody.appendChild(row);
    });

    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            await fetch(`${API}/bookings/${btn.dataset.id}`, { method: 'DELETE', credentials: 'include' });
            loadMyBookings(); // refresh
        });
    });
}

async function loadMyBookings() {
    if (currentUser.role === 'admin') {
        const res = await fetch(`${API}/admin/all-bookings`, { credentials: 'include' });
        allBookingsCache = await res.json();
        renderBookings(allBookingsCache);
    } else {
        const res = await fetch(`${API}/bookings/student/${currentUser.studentId}`, { credentials: 'include' });
        const data = await res.json();
        renderBookings(data);
    }
}

document.getElementById('bookings-search-studentId').addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (!query) {
        renderBookings(allBookingsCache);
    } else {
        renderBookings(allBookingsCache.filter(b => String(b.StudentID) === query));
    }
});
document.getElementById('refresh-bookings-btn').addEventListener('click', () => {
    loadMyBookings();
});

// ---------- Admin: Busy Report ----------
async function loadBusyReport() {
    const res = await fetch(`${API}/admin/busy-report`, { credentials: 'include' });
    const data = await res.json();

    // Bar chart
    const maxCount = Math.max(...data.map(f => f.BookingCount), 1);
    const chartEl = document.getElementById('busy-chart');
    chartEl.innerHTML = data.map(f => {
        const pct = (f.BookingCount / maxCount) * 100;
        const fillClass = f.Status === 'Busy' ? 'is-busy' : f.Status === 'Unused' ? 'is-unused' : '';
        return `
            <div class="bar-row">
                <div class="bar-row__label">${f.FacilityName}</div>
                <div class="bar-row__track"><div class="bar-row__fill ${fillClass}" style="width:${pct}%"></div></div>
                <div class="bar-row__count">${f.BookingCount}</div>
            </div>`;
    }).join('');

    // Table
    const tbody = document.querySelector('#busy-table tbody');
    tbody.innerHTML = '';
    data.forEach(f => {
        let cls = 'status-active';
        if (f.Status === 'Busy') cls = 'status-inactive';
        if (f.Status === 'Unused') cls = 'status-unused';

        tbody.innerHTML += `
            <tr>
                <td>${f.FacilityName}</td>
                <td>${f.BookingCount}</td>
                <td>${f.UtilizationPct !== null ? f.UtilizationPct + '%' : '—'}</td>
                <td>${f.PeakHour || '—'}</td>
                <td class="${cls}">${f.Status}</td>
            </tr>`;
    });
}

// ---------- Initial load ----------
checkLoginStatus();