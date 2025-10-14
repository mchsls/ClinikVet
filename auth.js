// Authentication system
class AuthSystem {
    constructor() {
        console.log('🔐 Initializing AuthSystem...');
        this.currentUser = null;
        this.isLoggedIn = false;
        this.initializeAuth();
    }

    initializeAuth() {
        this.checkExistingAuth();
        this.setupEventListeners();
        this.updateAuthUI();
    }

    setupEventListeners() {
        // Auth modal
        const authBtn = document.getElementById('authBtn');
        if (authBtn) {
            authBtn.addEventListener('click', () => this.openAuthModal());
        }

        // Close buttons
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });

        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchAuthTab(e.target));
        });

        // Forms
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Close modal on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    }

    openAuthModal() {
        if (this.isLoggedIn) {
            this.logout();
        } else {
            const authModal = document.getElementById('authModal');
            if (authModal) {
                authModal.style.display = 'flex';
            }
        }
    }

    closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }

    switchAuthTab(clickedTab) {
        const tabs = document.querySelectorAll('.auth-tab');
        const forms = document.querySelectorAll('.auth-form');
        
        tabs.forEach(tab => tab.classList.remove('active'));
        forms.forEach(form => form.classList.remove('active'));
        
        clickedTab.classList.add('active');
        const targetForm = document.getElementById(clickedTab.dataset.tab);
        if (targetForm) {
            targetForm.classList.add('active');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        console.log('🔐 Login attempt:', { email, password });

        // Demo credentials for admin
        if (email === 'admin' && password === '111111') {
            console.log('✅ Admin login successful');
            this.login({
                name: 'Администратор',
                email: 'admin@vetclinic.ru',
                phone: '+7 (4742) 000-000',
                role: 'admin'
            });
            return;
        }

        // Demo credentials for doctors
        const doctorCredentials = {
            'vrach1': { id: 'doc_1', name: 'Иванова Анна Сергеевна' },
            'vrach2': { id: 'doc_2', name: 'Петров Дмитрий Владимирович' },
            'vrach3': { id: 'doc_3', name: 'Сидорова Елена Михайловна' },
            'vrach4': { id: 'doc_4', name: 'Козлов Алексей Николаевич' },
            'vrach5': { id: 'doc_5', name: 'Орлов Максим Викторович' },
            'vrach6': { id: 'doc_6', name: 'Волков Сергей Александрович' }
        };

        if (doctorCredentials[email] && password === '111111') {
            console.log('✅ Doctor login successful');
            const doctorInfo = doctorCredentials[email];
            
            // Get doctor details
            let doctorDetails = {};
            if (window.doctorsData) {
                const doctor = window.doctorsData.getDoctorById(doctorInfo.id);
                if (doctor) {
                    doctorDetails = {
                        phone: doctor.phone,
                        specialization: doctor.specialization
                    };
                }
            }
            
            this.login({
                name: doctorInfo.name,
                email: email + '@vetclinic.ru',
                phone: doctorDetails.phone || '+7 (4742) 000-000',
                role: 'doctor',
                doctorId: doctorInfo.id,
                specialization: doctorDetails.specialization || 'Врач'
            });
            return;
        }

        // Regular user login
        const users = JSON.parse(localStorage.getItem('vetUsers')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            console.log('✅ User login successful');
            this.login(user);
        } else {
            console.log('❌ Login failed');
            this.showNotification('Неверный логин или пароль', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        console.log('📝 Starting registration process...');
        
        const formData = {
            name: document.getElementById('registerName').value.trim(),
            email: document.getElementById('registerEmail').value.trim().toLowerCase(),
            password: document.getElementById('registerPassword').value,
            phone: document.getElementById('registerPhone').value.trim(),
            role: 'user'
        };

        console.log('📝 Registration data:', formData);

        // Validate registration data
        if (!this.validateRegistration(formData)) {
            return;
        }

        // Save user to localStorage
        const users = JSON.parse(localStorage.getItem('vetUsers')) || [];
        
        // Check if user already exists
        if (users.find(u => u.email === formData.email)) {
            this.showNotification('Пользователь с таким email уже существует', 'error');
            return;
        }

        users.push(formData);
        localStorage.setItem('vetUsers', JSON.stringify(users));
        
        console.log('✅ User registered successfully:', formData);
        this.showNotification('Регистрация прошла успешно!', 'success');
        this.login(formData);
    }

    validateRegistration(formData) {
        const errors = [];
        
        if (!formData.name || formData.name.length < 2) {
            errors.push('ФИО должно содержать минимум 2 символа');
        }
        
        if (!formData.email || !this.isValidEmail(formData.email)) {
            errors.push('Введите корректный email адрес');
        }
        
        if (!formData.password || formData.password.length < 6) {
            errors.push('Пароль должен содержать минимум 6 символов');
        }
        
        if (!formData.phone || formData.phone.length < 5) {
            errors.push('Введите корректный номер телефона');
        }
        
        if (errors.length > 0) {
            this.showNotification(errors.join(', '), 'error');
            return false;
        }
        
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    login(user) {
        this.currentUser = user;
        this.isLoggedIn = true;
        localStorage.setItem('vetCurrentUser', JSON.stringify(user));
        
        this.closeModal(document.getElementById('authModal'));
        this.updateAuthUI();
        this.showNotification(`Добро пожаловать, ${user.name}!`, 'success');

        // Update panels based on role
        setTimeout(() => {
            if (user.role === 'admin' && window.adminSystem) {
                window.adminSystem.showAdminPanel();
            } else if (user.role === 'doctor' && window.doctorSystem) {
                window.doctorSystem.showDoctorPanel();
            }
        }, 100);
    }

    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        localStorage.removeItem('vetCurrentUser');
        
        this.updateAuthUI();
        this.showNotification('Вы вышли из системы', 'info');

        // Hide all panels
        if (window.adminSystem) window.adminSystem.hideAdminPanel();
        if (window.doctorSystem) window.doctorSystem.hideDoctorPanel();
    }

    checkExistingAuth() {
        const savedUser = localStorage.getItem('vetCurrentUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.isLoggedIn = true;
                console.log('🔐 Found existing user:', this.currentUser);
                this.updateAuthUI();
            } catch (error) {
                console.error('Error parsing saved user:', error);
                localStorage.removeItem('vetCurrentUser');
            }
        }
    }

    updateAuthUI() {
        const authBtn = document.getElementById('authBtn');
        if (!authBtn) return;

        if (this.isLoggedIn) {
            authBtn.innerHTML = `
                <i class="fas fa-user-circle"></i>
                <span>${this.currentUser.name}</span>
            `;
            
            // Create doctor link if user is doctor
            if (this.currentUser.role === 'doctor') {
                this.createDoctorLink();
            }
            
        } else {
            authBtn.innerHTML = `
                <i class="fas fa-user"></i>
                <span>Войти</span>
            `;
            
            // Hide doctor link
            this.hideDoctorLink();
        }
    }
    // В метод updateAuthUI класса AuthSystem добавим:
updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    if (!authBtn) return;

    if (this.isLoggedIn) {
        authBtn.innerHTML = `
            <i class="fas fa-user-circle"></i>
            <span>${this.currentUser.name}</span>
        `;
        
        // Create user profile link for all logged in users
        this.createUserProfileLink();
        
        // Create doctor link if user is doctor
        if (this.currentUser.role === 'doctor') {
            this.createDoctorLink();
        }
        
    } else {
        authBtn.innerHTML = `
            <i class="fas fa-user"></i>
            <span>Войти</span>
        `;
        
        // Hide profile and doctor links
        this.hideUserProfileLink();
        this.hideDoctorLink();
    }
}

// Добавим методы для работы с ссылкой на личный кабинет
createUserProfileLink() {
    let profileLink = document.querySelector('.profile-link');
    if (!profileLink) {
        profileLink = document.createElement('a');
        profileLink.href = '#';
        profileLink.className = 'nav-link profile-link';
        profileLink.innerHTML = '<i class="fas fa-user"></i> Мой кабинет';
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.userProfile.showUserProfile();
        });
        
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.appendChild(profileLink);
        }
    }
    profileLink.style.display = 'block';
}

hideUserProfileLink() {
    const profileLink = document.querySelector('.profile-link');
    if (profileLink) {
        profileLink.style.display = 'none';
    }
}

    createDoctorLink() {
        let doctorLink = document.querySelector('.doctor-link');
        if (!doctorLink) {
            doctorLink = document.createElement('a');
            doctorLink.href = '#doctorPanel';
            doctorLink.className = 'nav-link doctor-link';
            doctorLink.innerHTML = '<i class="fas fa-user-md"></i> Панель врача';
            
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                navMenu.appendChild(doctorLink);
            }
        }
        doctorLink.style.display = 'block';
    }

    hideDoctorLink() {
        const doctorLink = document.querySelector('.doctor-link');
        if (doctorLink) {
            doctorLink.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles for notifications
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    min-width: 300px;
                    max-width: 500px;
                    animation: slideInRight 0.3s ease;
                }
                .notification-content {
                    background: white;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-left: 4px solid;
                }
                .notification-info .notification-content {
                    border-left-color: #3498db;
                }
                .notification-success .notification-content {
                    border-left-color: #27ae60;
                }
                .notification-warning .notification-content {
                    border-left-color: #f39c12;
                }
                .notification-error .notification-content {
                    border-left-color: #e74c3c;
                }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    margin-left: 1rem;
                    color: #7f8c8d;
                }
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
}
