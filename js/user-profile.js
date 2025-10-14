// User profile functionality
class UserProfile {
    constructor() {
        this.initializeUserProfile();
    }

    initializeUserProfile() {
        this.setupUserProfileLink();
    }

    setupUserProfileLink() {
        // This will be called when user logs in
    }

    showUserProfile() {
        if (!window.authSystem || !window.authSystem.isLoggedIn) {
            window.authSystem.showNotification('Пожалуйста, войдите в систему', 'warning');
            return;
        }

        const currentUser = window.authSystem.currentUser;
        this.createUserProfileModal(currentUser);
    }

    createUserProfileModal(user) {
        // Remove existing modal if any
        const existingModal = document.getElementById('userProfileModal');
        if (existingModal) {
            existingModal.remove();
        }

        const userAppointments = window.appointmentsSystem?.getAppointmentsByUser(user.email) || [];
        const medicalHistory = this.getMedicalHistoryByUser(user.email);

        const modalHTML = `
            <div id="userProfileModal" class="modal">
                <div class="modal-content user-profile-modal">
                    <button class="close">&times;</button>
                    <h2>Личный кабинет</h2>
                    
                    <div class="user-info-section">
                        <h3>Мои данные</h3>
                        <div class="user-details">
                            <div class="detail">
                                <strong>ФИО:</strong> ${user.name}
                            </div>
                            <div class="detail">
                                <strong>Email:</strong> ${user.email}
                            </div>
                            <div class="detail">
                                <strong>Телефон:</strong> ${user.phone}
                            </div>
                        </div>
                    </div>

                    <div class="appointments-section">
                        <h3>Мои записи на прием</h3>
                        <div class="appointments-tabs">
                            <button class="appointment-tab active" data-tab="upcoming">Предстоящие</button>
                            <button class="appointment-tab" data-tab="completed">Завершенные</button>
                            <button class="appointment-tab" data-tab="all">Все записи</button>
                        </div>
                        
                        <div class="appointments-content">
                            <div id="upcomingAppointments" class="appointment-list active">
                                ${this.renderAppointmentsList(userAppointments.filter(apt => 
                                    apt.status === 'pending' || apt.status === 'confirmed'
                                ))}
                            </div>
                            <div id="completedAppointments" class="appointment-list">
                                ${this.renderAppointmentsList(userAppointments.filter(apt => 
                                    apt.status === 'completed'
                                ))}
                            </div>
                            <div id="allAppointments" class="appointment-list">
                                ${this.renderAppointmentsList(userAppointments)}
                            </div>
                        </div>
                    </div>

                    ${medicalHistory.length > 0 ? `
                    <div class="medical-history-section">
                        <h3>История болезней питомцев</h3>
                        <div class="medical-history-list">
                            ${this.renderMedicalHistory(medicalHistory)}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = document.getElementById('userProfileModal');
        modal.style.display = 'flex';

        this.setupUserProfileModalEvents();
    }

    renderAppointmentsList(appointments) {
        if (appointments.length === 0) {
            return '<div class="no-appointments"><p>Записей не найдено</p></div>';
        }

        return appointments.map(appointment => {
            const doctor = window.doctorsData?.getDoctorById(appointment.doctorId);
            const doctorName = doctor ? doctor.name : 'Неизвестный врач';
            const serviceName = this.getServiceName(appointment.service);
            const statusText = this.getStatusText(appointment.status);
            const statusClass = this.getStatusClass(appointment.status);
            
            // Check if there's medical history for this appointment
            const medicalRecord = this.getMedicalRecordByAppointment(appointment.id);
            
            return `
                <div class="user-appointment-item ${appointment.status}" data-id="${appointment.id}">
                    <div class="appointment-main-info">
                        <h4>${appointment.petName} (${this.getPetTypeName(appointment.petType)})</h4>
                        <div class="appointment-meta">
                            <div>
                                <i class="fas fa-user-md"></i>
                                <span>${doctorName}</span>
                            </div>
                            <div>
                                <i class="fas fa-calendar"></i>
                                <span>${this.formatDateTime(appointment.date, appointment.time)}</span>
                            </div>
                            <div>
                                <i class="fas fa-stethoscope"></i>
                                <span>${serviceName}</span>
                            </div>
                        </div>
                        ${appointment.notes ? `
                            <div class="appointment-notes">
                                <strong>Мои жалобы:</strong> ${appointment.notes}
                            </div>
                        ` : ''}
                    </div>
                    <div class="appointment-side-info">
                        <div class="status-badge ${statusClass}">
                            <i class="fas ${this.getStatusIcon(appointment.status)}"></i>
                            ${statusText}
                        </div>
                        ${medicalRecord ? `
                            <div class="medical-info">
                                <h5>Заключение врача:</h5>
                                <div class="doctor-diagnosis">
                                    <strong>Диагноз:</strong> ${medicalRecord.diagnosis}
                                </div>
                                <div class="doctor-comment">
                                    <strong>Рекомендации:</strong> ${medicalRecord.doctorComment}
                                </div>
                                ${medicalRecord.medications ? `
                                    <div class="doctor-medications">
                                        <strong>Назначения:</strong> ${medicalRecord.medications}
                                    </div>
                                ` : ''}
                                ${medicalRecord.nextAppointment ? `
                                    <div class="next-appointment">
                                        <strong>Следующий прием:</strong> ${this.formatDate(medicalRecord.nextAppointment)}
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderMedicalHistory(medicalHistory) {
        return medicalHistory.map(record => {
            return `
                <div class="medical-record-item">
                    <div class="record-header">
                        <h4>${record.petName} (${this.getPetTypeName(record.petType)})</h4>
                        <span class="record-date">${this.formatDate(record.completionDate)}</span>
                    </div>
                    <div class="record-content">
                        <div class="record-details">
                            <div class="detail">
                                <strong>Врач:</strong> ${record.doctorName}
                            </div>
                            <div class="detail">
                                <strong>Диагноз:</strong> ${record.diagnosis}
                            </div>
                            <div class="detail">
                                <strong>Состояние:</strong> 
                                <span class="status-badge ${this.getHealthStatusClass(record.healthStatus)}">
                                    ${this.getHealthStatusText(record.healthStatus)}
                                </span>
                            </div>
                            ${record.medications ? `
                                <div class="detail">
                                    <strong>Лекарства:</strong> ${record.medications}
                                </div>
                            ` : ''}
                            ${record.nextAppointment ? `
                                <div class="detail">
                                    <strong>Следующий прием:</strong> ${this.formatDate(record.nextAppointment)}
                                </div>
                            ` : ''}
                        </div>
                        <div class="doctor-comment">
                            <strong>Комментарий врача:</strong>
                            <p>${record.doctorComment}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getMedicalHistoryByUser(userEmail) {
        const medicalHistory = JSON.parse(localStorage.getItem('vetMedicalHistory')) || [];
        const userAppointments = window.appointmentsSystem?.getAppointmentsByUser(userEmail) || [];
        const userAppointmentIds = userAppointments.map(apt => apt.id);
        
        return medicalHistory.filter(record => 
            userAppointmentIds.includes(record.appointmentId)
        ).sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate));
    }

    getMedicalRecordByAppointment(appointmentId) {
        const medicalHistory = JSON.parse(localStorage.getItem('vetMedicalHistory')) || [];
        return medicalHistory.find(record => record.appointmentId === appointmentId);
    }

    setupUserProfileModalEvents() {
        const modal = document.getElementById('userProfileModal');
        const closeBtn = modal.querySelector('.close');
        const tabs = modal.querySelectorAll('.appointment-tab');
        const lists = modal.querySelectorAll('.appointment-list');

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Tab switching
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                tabs.forEach(t => t.classList.remove('active'));
                lists.forEach(list => list.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(targetTab + 'Appointments').classList.add('active');
            });
        });
    }

    // Helper methods
    getServiceName(serviceKey) {
        const services = {
            consultation: 'Консультация',
            vaccination: 'Вакцинация',
            surgery: 'Хирургия',
            dentistry: 'Стоматология',
            diagnostics: 'Диагностика'
        };
        return services[serviceKey] || serviceKey;
    }

    getPetTypeName(petType) {
        const types = {
            cat: 'Кот/Кошка',
            dog: 'Собака',
            bird: 'Птица',
            rodent: 'Грызун',
            other: 'Другое'
        };
        return types[petType] || petType;
    }

    getStatusText(status) {
        const statuses = {
            pending: 'Ожидание',
            confirmed: 'Подтвержден',
            completed: 'Завершен',
            cancelled: 'Отменен'
        };
        return statuses[status] || status;
    }

    getStatusClass(status) {
        const classes = {
            pending: 'status-pending',
            confirmed: 'status-confirmed',
            completed: 'status-completed',
            cancelled: 'status-cancelled'
        };
        return classes[status] || 'status-pending';
    }

    getStatusIcon(status) {
        const icons = {
            pending: 'fa-clock',
            confirmed: 'fa-check-circle',
            completed: 'fa-calendar-check',
            cancelled: 'fa-times-circle'
        };
        return icons[status] || 'fa-clock';
    }

    getHealthStatusText(status) {
        const statuses = {
            healthy: 'Здоров',
            sick: 'Требуется лечение',
            observation: 'Под наблюдением'
        };
        return statuses[status] || status;
    }

    getHealthStatusClass(status) {
        const classes = {
            healthy: 'status-healthy',
            sick: 'status-sick',
            observation: 'status-observation'
        };
        return classes[status] || 'status-observation';
    }

    formatDateTime(date, time) {
        const dateObj = new Date(date);
        return `${dateObj.toLocaleDateString('ru-RU')} в ${time}`;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('ru-RU');
    }
}

// Initialize user profile system
window.userProfile = new UserProfile();
// Интеграция с системой питомцев
const originalCreateUserProfileModal = window.userProfile.createUserProfileModal;
window.userProfile.createUserProfileModal = function(user) {
    originalCreateUserProfileModal.call(this, user);
    
    // Добавляем раздел с питомцами после загрузки профиля
    setTimeout(() => {
        if (window.petsSystem) {
            window.petsSystem.addPetCardsToUserProfile();
        }
    }, 100);
};