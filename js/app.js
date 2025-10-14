// Main application logic
class VetClinicApp {
    constructor() {
        console.log('🚀 Starting VetClinicApp...');
        this.initializeApp();
    }

    initializeApp() {
        try {
            // Initialize systems in correct order
            this.initializeSystems();
            
            // Setup UI
            this.setupNavigation();
            this.setupSmoothScroll();
            this.setupMobileMenu();
            
            console.log('✅ VetClinicApp initialized successfully');
        } catch (error) {
            console.error('❌ App initialization failed:', error);
        }
    }

// В класс VetClinicApp в метод initializeSystems добавь:
initializeSystems() {
    console.log('🔄 Initializing systems...');
    
    // Initialize systems
    window.authSystem = new AuthSystem();
    console.log('✅ AuthSystem initialized');
    
    window.doctorsData = new DoctorsData();
    console.log('✅ DoctorsData initialized');
    
    window.appointmentsSystem = new AppointmentsSystem();
    window.adminSystem = new AdminSystem(); // ← ДОБАВЬ ЭТУ СТРОЧКУ
    window.doctorSystem = new DoctorSystem();
    
    console.log('✅ All systems initialized');
}
    setupNavigation() {
        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    setupSmoothScroll() {
        // Additional smooth scroll setup if needed
    }

    setupMobileMenu() {
        const toggle = document.querySelector('.nav-toggle');
        const menu = document.querySelector('.nav-menu');
        
        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                menu.classList.toggle('active');
                toggle.classList.toggle('active');
            });
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM loaded, starting app...');
        window.vetClinicApp = new VetClinicApp();
    });
} else {
    console.log('📄 DOM already loaded, starting app...');
    window.vetClinicApp = new VetClinicApp();
}
