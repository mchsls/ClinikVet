// Appointments management system
class AppointmentsSystem {
    constructor() {
        this.appointments = JSON.parse(localStorage.getItem('vetAppointments')) || [];
        this.initializeAppointments();
    }

    initializeAppointments() {
        this.setupEventListeners();
        this.setupAppointmentModal();
    }

    getAppointmentsByUser(userEmail) {
        return this.appointments.filter(apt => apt.userId === userEmail);
    }

    setupEventListeners() {
        // Hero appointment button
        document.getElementById('heroAppointmentBtn')?.addEventListener('click', () => {
            this.openAppointmentModal();
        });

        // Service cards appointment buttons
        document.querySelectorAll('.service-appointment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.openAppointmentModal();
            });
        });

        // Sidebar appointment button
        document.querySelector('.appointment-sidebar-btn')?.addEventListener('click', () => {
            this.openAppointmentModal();
        });

        // Appointment form submission
        document.getElementById('appointmentForm')?.addEventListener('submit', (e) => this.handleAppointmentSubmit(e));
    }

    setupAppointmentModal() {
        // Close modal buttons
        document.querySelectorAll('.modal .close').forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });

        // Close modal on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    openAppointmentModal() {
        if (!window.authSystem || !window.authSystem.isLoggedIn) {
            window.authSystem.showNotification('Пожалуйста, войдите в систему для записи на прием', 'warning');
            window.authSystem.openAuthModal();
            return;
        }

        const modal = document.getElementById('appointmentModal');
        if (modal) {
            modal.style.display = 'flex';
            this.loadDoctorsToSelect();
            this.loadServicesToSelect(); // ← ДОБАВЛЕНО: загружаем услуги
            
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('appointmentDate');
            if (dateInput) {
                dateInput.min = today;
                if (!dateInput.value) {
                    dateInput.value = today;
                }
            }

            // Set default time to next available slot
            const timeInput = document.getElementById('appointmentTime');
            if (timeInput && !timeInput.value) {
                const now = new Date();
                const nextHour = now.getHours() + 1;
                timeInput.value = `${nextHour.toString().padStart(2, '0')}:00`;
            }
        }
    }

    loadDoctorsToSelect() {
        const select = document.getElementById('appointmentDoctor');
        if (!select) return;

        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        const doctors = window.doctorsData?.getDoctors() || [];
        doctors.forEach(doctor => {
            if (doctor.status === 'active') {
                const option = document.createElement('option');
                option.value = doctor.id;
                option.textContent = `${doctor.name} - ${doctor.specialization}`;
                select.appendChild(option);
            }
        });
    }

    // ДОБАВЛЕНО: Метод для загрузки услуг в выпадающий список
    loadServicesToSelect() {
        const select = document.getElementById('appointmentService');
        if (!select) return;

        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Добавляем доступные услуги
        const services = [
            { id: 'consultation', name: 'Консультация' },
            { id: 'vaccination', name: 'Вакцинация' },
            { id: 'surgery', name: 'Хирургия' },
            { id: 'dentistry', name: 'Стоматология' },
            { id: 'diagnostics', name: 'Диагностика' }
        ];
        
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            select.appendChild(option);
        });
    }

    handleAppointmentSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const appointmentData = {
            id: 'APP_' + Date.now(),
            petName: document.getElementById('appointmentPetName').value,
            petType: document.getElementById('appointmentPetType').value,
            doctorId: document.getElementById('appointmentDoctor').value,
            service: document.getElementById('appointmentService').value,
            date: document.getElementById('appointmentDate').value,
            time: document.getElementById('appointmentTime').value,
            notes: document.getElementById('appointmentNotes').value,
            status: 'pending',
            createdAt: new Date().toISOString(),
            userId: window.authSystem.currentUser.email,
            userPhone: window.authSystem.currentUser.phone
        };

        // Validation
        if (!this.validateAppointment(appointmentData)) {
            return;
        }

        this.saveAppointment(appointmentData);
        this.closeAppointmentModal();
        this.showSuccessMessage(appointmentData);
    }

    validateAppointment(data) {
        const errors = [];
        
        if (!data.petName) errors.push('Укажите кличку питомца');
        if (!data.petType) errors.push('Выберите вид животного');
        if (!data.doctorId) errors.push('Выберите врача');
        if (!data.service) errors.push('Выберите услугу');
        if (!data.date) errors.push('Укажите дату приема');
        if (!data.time) errors.push('Укажите время приема');

        if (errors.length > 0) {
            window.authSystem.showNotification(errors.join(', '), 'error');
            return false;
        }

        // Check if the selected time is available
        const isAvailable = this.checkTimeAvailability(data.doctorId, data.date, data.time);
        if (!isAvailable) {
            window.authSystem.showNotification('Выбранное время занято. Пожалуйста, выберите другое время.', 'warning');
            return false;
        }

        return true;
    }

    checkTimeAvailability(doctorId, date, time) {
        const existingAppointments = this.appointments.filter(apt => 
            apt.doctorId === doctorId && 
            apt.date === date && 
            apt.time === time &&
            apt.status !== 'cancelled'
        );

        return existingAppointments.length === 0;
    }

    saveAppointment(appointment) {
        this.appointments.push(appointment);
        localStorage.setItem('vetAppointments', JSON.stringify(this.appointments));
        
        // Update admin stats if admin is logged in
        if (window.authSystem.currentUser.role === 'admin') {
            window.adminSystem?.updateStats();
        }
    }

    closeAppointmentModal() {
        const modal = document.getElementById('appointmentModal');
        if (modal) {
            modal.style.display = 'none';
        }
        document.getElementById('appointmentForm')?.reset();
    }

    showSuccessMessage(appointment) {
        const doctor = window.doctorsData?.getDoctorById(appointment.doctorId);
        const doctorName = doctor ? doctor.name : 'врачу';
        const serviceNames = {
            consultation: 'консультацию',
            vaccination: 'вакцинацию',
            surgery: 'хирургическую операцию',
            dentistry: 'стоматологическую помощь',
            diagnostics: 'диагностику'
        };
        
        const serviceName = serviceNames[appointment.service] || appointment.service;
        
        window.authSystem.showNotification(
            `✅ Успешно записаны на ${serviceName} к ${doctorName} на ${this.formatDate(appointment.date)} в ${appointment.time}`,
            'success'
        );
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    getAppointments() {
        return this.appointments;
    }

    getAppointmentsByDoctor(doctorId) {
        return this.appointments.filter(apt => apt.doctorId === doctorId);
    }

    // Get appointments statistics for reports
    getAppointmentsStats(startDate, endDate) {
        const filteredAppointments = this.appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date();
            return aptDate >= start && aptDate <= end;
        });

        const stats = {
            total: filteredAppointments.length,
            byStatus: {
                pending: filteredAppointments.filter(apt => apt.status === 'pending').length,
                confirmed: filteredAppointments.filter(apt => apt.status === 'confirmed').length,
                completed: filteredAppointments.filter(apt => apt.status === 'completed').length,
                cancelled: filteredAppointments.filter(apt => apt.status === 'cancelled').length
            },
            byService: {},
            byDoctor: {},
            revenue: 0
        };

        // Calculate service statistics
        filteredAppointments.forEach(apt => {
            stats.byService[apt.service] = (stats.byService[apt.service] || 0) + 1;
            
            const doctor = window.doctorsData?.getDoctorById(apt.doctorId);
            if (doctor) {
                stats.byDoctor[doctor.name] = (stats.byDoctor[doctor.name] || 0) + 1;
            }

            // Simple revenue calculation based on service type
            const servicePrices = {
                consultation: 800,
                vaccination: 1200,
                surgery: 4500,
                dentistry: 1500,
                diagnostics: 2000
            };
            
            stats.revenue += servicePrices[apt.service] || 0;
        });

        return stats;
    }

    // ДОБАВЛЕНО: Метод для обновления статуса записи
    updateAppointmentStatus(appointmentId, newStatus) {
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (appointment) {
            appointment.status = newStatus;
            localStorage.setItem('vetAppointments', JSON.stringify(this.appointments));
            return true;
        }
        return false;
    }

    // ДОБАВЛЕНО: Метод для отмены записи
    cancelAppointment(appointmentId) {
        return this.updateAppointmentStatus(appointmentId, 'cancelled');
    }

    // ДОБАВЛЕНО: Метод для подтверждения записи
    confirmAppointment(appointmentId) {
        return this.updateAppointmentStatus(appointmentId, 'confirmed');
    }

    // ДОБАВЛЕНО: Метод для завершения записи
    completeAppointment(appointmentId) {
        return this.updateAppointmentStatus(appointmentId, 'completed');
    }
}