// Doctor panel functionality
class DoctorSystem {
    constructor() {
        console.log('👨‍⚕️ Initializing DoctorSystem...');
        this.initialized = false;
        this.initializeDoctorSystem();
    }

    initializeDoctorSystem() {
        if (this.initialized) return;
        
        this.setupEventListeners();
        this.initialized = true;
        
        // Check if doctor is already logged in
        const savedUser = localStorage.getItem('vetCurrentUser');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                if (user.role === 'doctor') {
                    console.log('👨‍⚕️ Doctor user found on init');
                    setTimeout(() => {
                        this.showDoctorPanel();
                    }, 100);
                }
            } catch (error) {
                console.error('Error parsing user:', error);
            }
        }
    }

    setupEventListeners() {
        // Event listeners will be setup when panel is shown
    }

    showDoctorPanel() {
        console.log('👨‍⚕️ Showing doctor panel...');
        
        const panel = document.getElementById('doctorPanel');
        const doctorLink = document.querySelector('.doctor-link');
        
        if (panel) {
            panel.style.display = 'block';
            console.log('✅ Doctor panel displayed');
            
            // Load doctor's appointments and medical history
            this.loadDoctorContent();
        } else {
            console.error('❌ Doctor panel element not found!');
        }
        
        if (doctorLink) {
            doctorLink.style.display = 'block';
        }
        
        // Scroll to doctor panel
        setTimeout(() => {
            if (panel) {
                panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
    }

    hideDoctorPanel() {
        console.log('👨‍⚕️ Hiding doctor panel...');
        
        const panel = document.getElementById('doctorPanel');
        const doctorLink = document.querySelector('.doctor-link');
        
        if (panel) {
            panel.style.display = 'none';
        }
        
        if (doctorLink) {
            doctorLink.style.display = 'none';
        }
    }

    loadDoctorContent() {
        const currentUser = window.authSystem?.currentUser;
        if (!currentUser || currentUser.role !== 'doctor') return;

        const doctorContent = document.getElementById('doctorContent');
        if (!doctorContent) return;

        // Update doctor info
        this.updateDoctorInfo();

        // Load appointments and medical history
        this.loadDoctorAppointments();
        this.loadMedicalHistory();
    }

    updateDoctorInfo() {
        const doctorName = document.getElementById('doctorName');
        const doctorSpecialization = document.getElementById('doctorSpecialization');
        
        if (doctorName) {
            doctorName.textContent = window.authSystem.currentUser.name;
        }
        if (doctorSpecialization) {
            doctorSpecialization.textContent = window.authSystem.currentUser.specialization;
        }
    }

    loadDoctorAppointments() {
        const currentUser = window.authSystem?.currentUser;
        if (!currentUser || currentUser.role !== 'doctor') return;

        const appointmentsList = document.getElementById('doctorAppointmentsList');
        if (!appointmentsList) return;

        const doctorId = currentUser.doctorId;
        const allAppointments = window.appointmentsSystem?.getAppointments() || [];
        
        // Filter appointments for this doctor with status 'confirmed' or 'pending'
        const doctorAppointments = allAppointments.filter(apt => 
            apt.doctorId === doctorId && (apt.status === 'confirmed' || apt.status === 'pending')
        ).sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

        if (doctorAppointments.length === 0) {
            appointmentsList.innerHTML = '<div class="no-appointments"><p>Нет активных приемов</p></div>';
            return;
        }

        appointmentsList.innerHTML = `
            <div class="appointments-current">
                ${doctorAppointments.map(appointment => this.renderAppointmentCard(appointment)).join('')}
            </div>
        `;

        // Add event listeners to complete buttons
        appointmentsList.querySelectorAll('.complete-appointment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openCompletionModal(btn.dataset.id);
            });
        });
    }

    loadMedicalHistory() {
        const currentUser = window.authSystem?.currentUser;
        if (!currentUser || currentUser.role !== 'doctor') return;

        const medicalHistoryList = document.getElementById('medicalHistoryList');
        if (!medicalHistoryList) return;

        const doctorId = currentUser.doctorId;
        const medicalHistory = this.getMedicalHistory(doctorId);

        if (medicalHistory.length === 0) {
            medicalHistoryList.innerHTML = '<div class="no-history"><p>История болезней пуста</p></div>';
            return;
        }

        medicalHistoryList.innerHTML = `
            <div class="medical-history-grid">
                ${medicalHistory.map(record => this.renderMedicalRecord(record)).join('')}
            </div>
        `;
    }

    renderAppointmentCard(appointment) {
        const servicePrice = this.getServicePrice(appointment.service);
        const petTypeName = this.getPetTypeName(appointment.petType);

        return `
            <div class="doctor-appointment-item" data-id="${appointment.id}">
                <div class="appointment-main-info">
                    <div class="pet-info">
                        <h4>${appointment.petName}</h4>
                        <span class="pet-type">${petTypeName}</span>
                        <span class="appointment-date">${this.formatDateTime(appointment.date, appointment.time)}</span>
                    </div>
                    <div class="appointment-details">
                        <div class="detail">
                            <strong>Услуга:</strong> ${this.getServiceName(appointment.service)}
                        </div>
                        <div class="detail">
                            <strong>Владелец:</strong> ${appointment.userId}
                        </div>
                        <div class="detail">
                            <strong>Телефон:</strong> ${appointment.userPhone || 'не указан'}
                        </div>
                        ${appointment.notes ? `
                            <div class="detail">
                                <strong>Жалобы:</strong> ${appointment.notes}
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="appointment-actions">
                    <div class="price">${servicePrice.toLocaleString()} ₽</div>
                    <button class="btn btn-success complete-appointment-btn" data-id="${appointment.id}">
                        <i class="fas fa-check"></i> Завершить прием
                    </button>
                </div>
            </div>
        `;
    }

    renderMedicalRecord(record) {
        const healthStatusText = {
            'healthy': 'Здоров',
            'sick': 'Требуется лечение', 
            'observation': 'Под наблюдением'
        }[record.healthStatus] || record.healthStatus;

        const healthStatusClass = {
            'healthy': 'status-healthy',
            'sick': 'status-sick',
            'observation': 'status-observation'
        }[record.healthStatus] || 'status-observation';

        return `
            <div class="medical-record-item">
                <div class="record-header">
                    <h4>${record.petName} (${this.getPetTypeName(record.petType)})</h4>
                    <span class="record-date">${this.formatDate(record.completionDate)}</span>
                </div>
                <div class="record-content">
                    <div class="record-details">
                        <div class="detail">
                            <strong>Диагноз:</strong> ${record.diagnosis}
                        </div>
                        <div class="detail">
                            <strong>Состояние:</strong> 
                            <span class="status-badge ${healthStatusClass}">${healthStatusText}</span>
                        </div>
                        <div class="detail">
                            <strong>Лекарства:</strong> ${record.medications || 'Не назначены'}
                        </div>
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
    }

    openCompletionModal(appointmentId) {
        const appointment = window.appointmentsSystem?.getAppointments()?.find(apt => apt.id === appointmentId);
        if (!appointment) return;

        const modalHTML = `
            <div id="completionModal" class="modal">
                <div class="modal-content completion-modal">
                    <button class="close">&times;</button>
                    <h2>Завершение приема</h2>
                    
                    <div class="patient-info">
                        <h3>${appointment.petName} (${this.getPetTypeName(appointment.petType)})</h3>
                        <p><strong>Владелец:</strong> ${appointment.userId}</p>
                        <p><strong>Дата приема:</strong> ${this.formatDateTime(appointment.date, appointment.time)}</p>
                        ${appointment.notes ? `<p><strong>Жалобы:</strong> ${appointment.notes}</p>` : ''}
                    </div>
                    
                    <form id="completionForm">
                        <div class="form-group">
                            <label for="healthStatus">Состояние пациента *</label>
                            <select id="healthStatus" required>
                                <option value="">Выберите состояние</option>
                                <option value="healthy">Здоров</option>
                                <option value="sick">Требуется лечение</option>
                                <option value="observation">Под наблюдением</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="diagnosis">Диагноз *</label>
                            <textarea id="diagnosis" required placeholder="Опишите диагноз пациента..." rows="3"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="medications">Назначенные лекарства и рекомендации</label>
                            <textarea id="medications" placeholder="Укажите назначенные лекарства, дозировку и рекомендации..." rows="3"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="nextAppointment">Дата следующего приема</label>
                            <input type="date" id="nextAppointment" min="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="form-group">
                            <label for="doctorComment">Комментарий врача *</label>
                            <textarea id="doctorComment" required placeholder="Дополнительные рекомендации, наблюдения и комментарии..." rows="4"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Сохранить и завершить прием
                            </button>
                            <button type="button" class="btn btn-outline" id="cancelCompletionBtn">
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('completionModal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = document.getElementById('completionModal');
        modal.style.display = 'flex';

        this.setupCompletionModalEvents(appointmentId);
    }

    setupCompletionModalEvents(appointmentId) {
        const modal = document.getElementById('completionModal');
        const form = document.getElementById('completionForm');
        const cancelBtn = document.getElementById('cancelCompletionBtn');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.completeAppointment(appointmentId);
            modal.style.display = 'none';
        });

        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.querySelector('.close').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    completeAppointment(appointmentId) {
        const form = document.getElementById('completionForm');
        const formData = {
            healthStatus: document.getElementById('healthStatus').value,
            diagnosis: document.getElementById('diagnosis').value,
            medications: document.getElementById('medications').value,
            nextAppointment: document.getElementById('nextAppointment').value,
            doctorComment: document.getElementById('doctorComment').value,
            completionDate: new Date().toISOString(),
            doctorId: window.authSystem.currentUser.doctorId,
            doctorName: window.authSystem.currentUser.name
        };

        // Validate required fields
        if (!formData.healthStatus || !formData.diagnosis || !formData.doctorComment) {
            alert('Пожалуйста, заполните все обязательные поля (отмечены *)');
            return;
        }

        // Update appointment status
        const appointments = window.appointmentsSystem?.getAppointments() || [];
        const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
        
        if (appointmentIndex !== -1) {
            appointments[appointmentIndex].status = 'completed';
            localStorage.setItem('vetAppointments', JSON.stringify(appointments));
        }

        // Save medical record
        this.saveMedicalRecord(appointmentId, formData);

        this.showNotification('Прием успешно завершен! Запись добавлена в историю болезней.', 'success');
        
        // Reload doctor content
        setTimeout(() => {
            this.loadDoctorContent();
        }, 500);
    }

    saveMedicalRecord(appointmentId, recordData) {
        const appointment = window.appointmentsSystem?.getAppointments()?.find(apt => apt.id === appointmentId);
        if (!appointment) return;

        const medicalRecord = {
            id: 'med_' + Date.now(),
            appointmentId: appointmentId,
            petName: appointment.petName,
            petType: appointment.petType,
            owner: appointment.userId,
            service: appointment.service,
            completionDate: recordData.completionDate,
            healthStatus: recordData.healthStatus,
            diagnosis: recordData.diagnosis,
            medications: recordData.medications,
            nextAppointment: recordData.nextAppointment,
            doctorComment: recordData.doctorComment,
            doctorId: recordData.doctorId,
            doctorName: recordData.doctorName
        };

        const medicalHistory = JSON.parse(localStorage.getItem('vetMedicalHistory')) || [];
        medicalHistory.unshift(medicalRecord); // Add to beginning
        localStorage.setItem('vetMedicalHistory', JSON.stringify(medicalHistory));
    }

    getMedicalHistory(doctorId) {
        const medicalHistory = JSON.parse(localStorage.getItem('vetMedicalHistory')) || [];
        return medicalHistory.filter(record => record.doctorId === doctorId)
                           .sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate));
    }

    getServicePrice(service) {
        const prices = {
            consultation: 800,
            vaccination: 1200,
            surgery: 4500,
            dentistry: 1500,
            diagnostics: 2000
        };
        return prices[service] || 0;
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

    formatDateTime(date, time) {
        const dateObj = new Date(date);
        return `${dateObj.toLocaleDateString('ru-RU')} в ${time}`;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('ru-RU');
    }

    showNotification(message, type) {
        if (window.authSystem) {
            window.authSystem.showNotification(message, type);
        }
    }
}