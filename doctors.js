// Doctors data and management
class DoctorsData {
    constructor() {
        this.doctors = [
            {
                id: 'doc_1',
                name: 'Иванова Анна Сергеевна',
                specialization: 'Хирург, терапевт',
                experience: 12,
                education: 'Московская государственная академия ветеринарной медицины',
                bio: 'Специализируется на сложных хирургических операциях и лечении внутренних болезней. Прошла стажировку в ведущих ветеринарных клиниках Европы.',
                skills: ['Хирургия', 'Терапия', 'Эндоскопия', 'УЗИ-диагностика'],
                photo: 'Иванова.webp',
                phone: '+7 (4742) 123-001',
                email: 'ivanova@vetclinic.ru',
                schedule: 'Пн-Пт: 9:00-18:00',
                status: 'active'
            },
            {
                id: 'doc_2',
                name: 'Петров Дмитрий Владимирович',
                specialization: 'Стоматолог, хирург',
                experience: 8,
                education: 'Санкт-Петербургская государственная академия ветеринарной медицины',
                bio: 'Эксперт в области ветеринарной стоматологии. Проводит сложные стоматологические операции и протезирование.',
                skills: ['Стоматология', 'Хирургия', 'Ортодонтия', 'Чистка зубов'],
                photo: 'Петров.webp',
                phone: '+7 (4742) 123-002',
                email: 'petrov@vetclinic.ru',
                schedule: 'Вт-Сб: 10:00-19:00',
                status: 'active'
            },
            {
                id: 'doc_3',
                name: 'Сидорова Елена Михайловна',
                specialization: 'Дерматолог, аллерголог',
                experience: 10,
                education: 'Казанская государственная академия ветеринарной медицины',
                bio: 'Специалист по кожным заболеваниям и аллергическим реакциям у животных. Разрабатывает индивидуальные схемы лечения.',
                skills: ['Дерматология', 'Аллергология', 'Лабораторная диагностика', 'Микроскопия'],
                photo: 'Грейнджер.webp',
                phone: '+7 (4742) 123-003',
                email: 'sidorova@vetclinic.ru',
                schedule: 'Пн-Ср-Пт: 8:00-17:00',
                status: 'active'
            },
            {
                id: 'doc_4',
                name: 'Козлов Алексей Николаевич',
                specialization: 'Кардиолог, УЗИ-специалист',
                experience: 15,
                education: 'Новосибирский государственный аграрный университет',
                bio: 'Ведущий специалист по кардиологии и ультразвуковой диагностике. Имеет публикации в международных научных журналах.',
                skills: ['Кардиология', 'УЗИ-диагностика', 'Эхокардиография', 'Функциональная диагностика'],
                photo: 'Северус.webp',
                phone: '+7 (4742) 123-004',
                email: 'kozlov@vetclinic.ru',
                schedule: 'Вт-Чт-Сб: 9:00-18:00',
                status: 'active'
            }
        ];
        
        this.initializeDoctors();
    }

    initializeDoctors() {
        this.displayDoctors();
        this.setupDoctorModal();
    }

    displayDoctors() {
        const grid = document.querySelector('.doctors-grid');
        if (!grid) return;

        grid.innerHTML = this.doctors.map(doctor => `
            <div class="doctor-card animate-scale" data-id="${doctor.id}">
                <div class="doctor-photo">
                    <img src="${doctor.photo}" alt="${doctor.name}" 
                         onerror="this.src='https://via.placeholder.com/300x300/4f46e5/ffffff?text=Врач'">
                    <div class="doctor-status ${doctor.status}"></div>
                </div>
                <div class="doctor-info">
                    <h3>${doctor.name}</h3>
                    <p class="doctor-specialization">${doctor.specialization}</p>
                    <p class="doctor-experience">Опыт работы: ${doctor.experience} лет</p>
                    <div class="doctor-skills">
                        ${doctor.skills.slice(0, 3).map(skill => 
                            `<span class="skill-tag">${skill}</span>`
                        ).join('')}
                    </div>
                    <button class="btn btn-outline btn-sm view-doctor-btn" data-id="${doctor.id}">
                        <i class="fas fa-eye"></i>
                        Подробнее
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners to view buttons
        document.querySelectorAll('.view-doctor-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showDoctorDetails(btn.dataset.id);
            });
        });

        // Add event listeners to doctor cards
        document.querySelectorAll('.doctor-card').forEach(card => {
            card.addEventListener('click', () => {
                this.showDoctorDetails(card.dataset.id);
            });
        });
    }

    setupDoctorModal() {
        // Modal close functionality is handled in main app
    }

    showDoctorDetails(doctorId) {
        const doctor = this.getDoctorById(doctorId);
        if (!doctor) return;

        const modal = document.getElementById('doctorModal');
        const content = document.getElementById('doctorDetails');

        content.innerHTML = `
            <div class="doctor-detail-header">
                <div class="doctor-detail-photo">
                    <img src="${doctor.photo}" alt="${doctor.name}"
                         onerror="this.src='https://via.placeholder.com/400x400/4f46e5/ffffff?text=Врач'">
                </div>
                <div class="doctor-detail-info">
                    <h2>${doctor.name}</h2>
                    <p class="specialization">${doctor.specialization}</p>
                    <div class="doctor-stats">
                        <div class="stat">
                            <i class="fas fa-briefcase"></i>
                            <span>${doctor.experience} лет опыта</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-phone"></i>
                            <span>${doctor.phone}</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-envelope"></i>
                            <span>${doctor.email}</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-clock"></i>
                            <span>${doctor.schedule}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="doctor-detail-content">
                <div class="detail-section">
                    <h3>Образование и квалификация</h3>
                    <p>${doctor.education}</p>
                </div>
                
                <div class="detail-section">
                    <h3>О специалисте</h3>
                    <p>${doctor.bio}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Навыки и специализации</h3>
                    <div class="skills-grid">
                        ${doctor.skills.map(skill => 
                            `<span class="skill-tag large">${skill}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
            
            <div class="doctor-detail-actions">
                <button class="btn btn-primary" onclick="window.appointmentsSystem.openAppointmentModal(); window.appointmentsSystem.loadDoctorsToSelect(); document.getElementById('appointmentDoctor').value='${doctor.id}'; document.getElementById('doctorModal').style.display='none';">
                    <i class="fas fa-calendar-check"></i>
                    Записаться к врачу
                </button>
            </div>
        `;

        modal.style.display = 'flex';
    }

    getDoctors() {
        return this.doctors;
    }

    getDoctorById(id) {
        return this.doctors.find(doctor => doctor.id === id);
    }

    getActiveDoctors() {
        return this.doctors.filter(doctor => doctor.status === 'active');
    }

    addDoctor(doctorData) {
        const newDoctor = {
            id: 'doc_' + (this.doctors.length + 1),
            ...doctorData,
            status: 'active'
        };
        this.doctors.push(newDoctor);
        this.displayDoctors();
        return newDoctor;
    }

    updateDoctor(id, updatedData) {
        const index = this.doctors.findIndex(doctor => doctor.id === id);
        if (index !== -1) {
            this.doctors[index] = { ...this.doctors[index], ...updatedData };
            this.displayDoctors();
            return this.doctors[index];
        }
        return null;
    }
}