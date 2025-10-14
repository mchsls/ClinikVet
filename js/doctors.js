// Doctors data and management
class DoctorsData {
    constructor() {
        console.log('🩺 Initializing DoctorsData...');
        this.doctors = this.getDefaultDoctorsData();
        this.initializeDoctors();
    }

    getDefaultDoctorsData() {
        return [
            {
                id: 'doc_1',
                name: 'Иванова Анна Сергеевна',
                specialization: 'Хирург, терапевт',
                experience: 12,
                education: 'Московская государственная академия ветеринарной медицины',
                bio: 'Специализируется на сложных хирургических операциях и лечении внутренних болезней. Прошла стажировку в ведущих ветеринарных клиниках Европы. Более 12 лет успешной практики.',
                skills: ['Хирургия', 'Терапия', 'Эндоскопия', 'УЗИ-диагностика', 'Онкология'],
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
                bio: 'Эксперт в области ветеринарной стоматологии. Проводит сложные стоматологические операции и протезирование. Автор научных работ по стоматологии мелких животных.',
                skills: ['Стоматология', 'Хирургия', 'Ортодонтия', 'Чистка зубов', 'Имплантация'],
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
                bio: 'Специалист по кожным заболеваниям и аллергическим реакциям у животных. Разрабатывает индивидуальные схемы лечения. Постоянный участник международных конференций по дерматологии.',
                skills: ['Дерматология', 'Аллергология', 'Лабораторная диагностика', 'Микроскопия', 'Иммунология'],
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
                bio: 'Ведущий специалист по кардиологии и ультразвуковой диагностике. Имеет публикации в международных научных журналах. Специализируется на диагностике и лечении сердечных заболеваний у животных.',
                skills: ['Кардиология', 'УЗИ-диагностика', 'Эхокардиография', 'Функциональная диагностика', 'ЭКГ'],
                photo: 'Северус.webp',
                phone: '+7 (4742) 123-004',
                email: 'kozlov@vetclinic.ru',
                schedule: 'Вт-Чт-Сб: 9:00-18:00',
                status: 'active'
            },
            {
                id: 'doc_5',
                name: 'Орлов Максим Викторович',
                specialization: 'Невролог, реабилитолог',
                experience: 9,
                education: 'Московская государственная академия ветеринарной медицины и биотехнологии',
                bio: 'Специалист по неврологическим заболеваниям у животных. Проводит диагностику и лечение эпилепсии, нарушений координации, парезов и параличей. Разрабатывает индивидуальные программы реабилитации после неврологических травм и операций.',
                skills: ['Неврология', 'Реабилитация', 'Физиотерапия', 'ЭЭГ', 'Мануальная терапия', 'Иглорефлексотерапия'],
                photo: 'Орлов.jpg',
                phone: '+7 (4742) 123-005',
                email: 'orlov@vetclinic.ru',
                schedule: 'Пн-Вт-Чт-Пт: 10:00-19:00',
                status: 'active'
            },
            {
                id: 'doc_6',
                name: 'Волков Сергей Александрович',
                specialization: 'Офтальмолог, микрохирург',
                experience: 11,
                education: 'Санкт-Петербургская государственная академия ветеринарной медицины',
                bio: 'Эксперт в области ветеринарной офтальмологии. Проводит сложные микрохирургические операции на глазах: катаракта, глаукома, травмы роговицы. Владеет современными методами диагностики заболеваний глаз у животных.',
                skills: ['Офтальмология', 'Микрохирургия', 'Катаракта', 'Глаукома', 'Диагностика зрения', 'Лазерная терапия'],
                photo: 'волков.jpg',
                phone: '+7 (4742) 123-006',
                email: 'volkov@vetclinic.ru',
                schedule: 'Вт-Ср-Пт-Сб: 9:00-18:00',
                status: 'active'
            }
        ];
    }

    initializeDoctors() {
        console.log('🩺 Displaying doctors...');
        this.displayDoctors();
        this.setupDoctorEventListeners();
    }

    displayDoctors() {
        const grid = document.querySelector('.doctors-grid');
        if (!grid) {
            console.error('❌ Doctors grid not found');
            return;
        }

        console.log(`🩺 Rendering ${this.doctors.length} doctors`);

        grid.innerHTML = this.doctors.map(doctor => `
            <div class="doctor-card animate-scale" data-id="${doctor.id}">
                <div class="doctor-photo">
                    <img src="${doctor.photo}" alt="${doctor.name}" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EwYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Qp9C10YDQvdC+0YHRjDwvdGV4dD48L3N2Zz4='; this.alt='Фото врача'">
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
                    <div class="doctor-actions">
                        <button class="btn btn-outline btn-sm view-doctor-btn" data-id="${doctor.id}">
                            <i class="fas fa-eye"></i>
                            Подробнее
                        </button>
                        <button class="btn btn-primary btn-sm appointment-doctor-btn" data-id="${doctor.id}">
                            <i class="fas fa-calendar-check"></i>
                            Записаться
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        console.log('✅ Doctors displayed successfully');
    }

    setupDoctorEventListeners() {
        // Use event delegation for dynamic content
        document.addEventListener('click', (e) => {
            // View doctor details
            if (e.target.closest('.view-doctor-btn')) {
                const btn = e.target.closest('.view-doctor-btn');
                this.showDoctorDetails(btn.dataset.id);
            }
            
            // Book appointment
            if (e.target.closest('.appointment-doctor-btn')) {
                const btn = e.target.closest('.appointment-doctor-btn');
                this.handleDoctorAppointment(btn.dataset.id);
            }
            
            // Click on card
            if (e.target.closest('.doctor-card') && !e.target.closest('button')) {
                const card = e.target.closest('.doctor-card');
                this.showDoctorDetails(card.dataset.id);
            }
        });
    }

    handleDoctorAppointment(doctorId) {
        if (window.appointmentsSystem) {
            window.appointmentsSystem.openAppointmentModal();
            setTimeout(() => {
                const doctorSelect = document.getElementById('appointmentDoctor');
                if (doctorSelect) {
                    doctorSelect.value = doctorId;
                }
            }, 100);
        } else {
            alert('Система записи недоступна. Пожалуйста, обновите страницу.');
        }
    }

    showDoctorDetails(doctorId) {
        const doctor = this.getDoctorById(doctorId);
        if (!doctor) return;

        const modal = document.getElementById('doctorModal');
        const content = document.getElementById('doctorDetails');

        if (!modal || !content) {
            console.error('Doctor modal elements not found');
            return;
        }

        content.innerHTML = `
            <div class="doctor-detail-header">
                <div class="doctor-detail-photo">
                    <img src="${doctor.photo}" alt="${doctor.name}"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EwYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Qp9C10YDQvdC+0YHRjDwvdGV4dD48L3N2Zz4='; this.alt='Фото врача'">
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
                <button class="btn btn-primary" id="detailAppointmentBtn" data-id="${doctor.id}">
                    <i class="fas fa-calendar-check"></i>
                    Записаться к врачу
                </button>
            </div>
        `;

        // Add event listener to the appointment button in details
        const appointmentBtn = content.querySelector('#detailAppointmentBtn');
        if (appointmentBtn) {
            appointmentBtn.addEventListener('click', () => {
                this.handleDoctorAppointment(doctor.id);
                modal.style.display = 'none';
            });
        }

        modal.style.display = 'flex';
        
        // Close modal handlers
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = () => modal.style.display = 'none';
        }
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    getDoctorById(id) {
        return this.doctors.find(doctor => doctor.id === id);
    }

    getDoctors() {
        return this.doctors;
    }

    getActiveDoctors() {
        return this.doctors.filter(doctor => doctor.status === 'active');
    }
}

// Initialize doctors immediately when script loads
console.log('👨‍⚕️ Loading doctors system...');