// Admin panel functionality
class AdminSystem {
    constructor() {
        this.initialized = false;
        this.searchTimeout = null;
        this.servicesSearchTimeout = null;
        this.initializeAdminSystem();
    }

    initializeAdminSystem() {
        if (this.initialized) return;
        
        console.log('Initializing Admin System...');
        
        this.setupEventListeners();
        this.initialized = true;
        
        // Check if admin is already logged in
        const savedUser = localStorage.getItem('vetCurrentUser');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                if (user.role === 'admin') {
                    console.log('Admin user found on init');
                    setTimeout(() => {
                        this.showAdminPanel();
                    }, 100);
                }
            } catch (error) {
                console.error('Error parsing user:', error);
            }
        }
    }
// Добавьте этот метод в класс AdminSystem
renderServicesList() {
    const servicesList = document.getElementById('servicesList');
    if (!servicesList) return;

    const services = this.getServices();
    
    servicesList.innerHTML = services.map(service => `
        <div class="service-item" data-service-id="${service.id}">
            <div class="service-item-header">
                <div class="service-icon-small">
                    <i class="${service.icon || 'fas fa-stethoscope'}"></i>
                </div>
                <div class="service-info">
                    <h4 class="service-name">${service.name}</h4>
                    <p class="service-description">${service.description || ''}</p>
                    <div class="service-meta">
                        <span class="service-price">${service.price} ₽</span>
                        <span class="service-duration">${service.duration} мин</span>
                        <span class="service-id">ID: ${service.id}</span>
                    </div>
                </div>
                <div class="service-status ${service.status}">
                    ${service.status === 'active' ? 'Активна' : 'Неактивна'}
                </div>
            </div>
            <div class="service-item-actions">
                <button class="btn btn-outline btn-sm edit-service" data-service-id="${service.id}">
                    <i class="fas fa-edit"></i> Редактировать
                </button>
                ${service.status === 'active' ? 
                    `<button class="btn btn-outline btn-sm deactivate-service" data-service-id="${service.id}">
                        <i class="fas fa-pause"></i> Деактивировать
                    </button>` :
                    `<button class="btn btn-outline btn-sm activate-service" data-service-id="${service.id}">
                        <i class="fas fa-play"></i> Активировать
                    </button>`
                }
                <button class="btn btn-danger btn-sm delete-service" data-service-id="${service.id}">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        </div>
    `).join('');

    this.setupServiceActions();
}
    setupEventListeners() {
        // Report generation
        const generateReportBtn = document.getElementById('generateReportBtn');
        const refreshStatsBtn = document.getElementById('refreshStatsBtn');
        const printReportBtn = document.getElementById('printReportBtn');
        const exportReportBtn = document.getElementById('exportReportBtn');

        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generateReport());
        }
        if (refreshStatsBtn) {
            refreshStatsBtn.addEventListener('click', () => this.updateStats());
        }
        if (printReportBtn) {
            printReportBtn.addEventListener('click', () => this.printReport());
        }
        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', () => this.exportReport());
        }

        console.log('Admin event listeners setup complete');
    }

    showAdminPanel() {
        console.log('Showing admin panel...');
        
        const panel = document.getElementById('adminPanel');
        const adminLink = document.querySelector('.admin-link');
        
        if (panel) {
            panel.style.display = 'block';
            console.log('Admin panel displayed');
            
            // Load appointments management
            this.loadAppointmentsManagement();
            
            // Initialize search filters and services management
            setTimeout(() => {
                this.setupSearchFilters();
                this.applySearchFilters();
                this.setupServicesManagement();
            }, 100);
        } else {
            console.error('Admin panel element not found!');
        }
        
        if (adminLink) {
            adminLink.style.display = 'block';
            console.log('Admin link displayed');
        }
        
        this.updateStats();
        this.loadRecentReports();
        
        // Scroll to admin panel
        setTimeout(() => {
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }

    hideAdminPanel() {
        console.log('Hiding admin panel...');
        
        const panel = document.getElementById('adminPanel');
        const adminLink = document.querySelector('.admin-link');
        
        if (panel) {
            panel.style.display = 'none';
        }
        
        if (adminLink) {
            adminLink.style.display = 'none';
        }
    }

    loadAppointmentsManagement() {
        const adminPanel = document.getElementById('adminPanel');
        if (!adminPanel) return;

        // Check if appointments management already exists
        if (adminPanel.querySelector('.appointments-management')) return;

        const appointmentsManagementHTML = `
            <div class="appointments-management">
                <h3>Управление записями на прием</h3>
                <div class="appointments-filters">
                    <select id="appointmentFilter" class="filter-select">
                        <option value="all">Все записи</option>
                        <option value="pending">Ожидающие</option>
                        <option value="confirmed">Подтвержденные</option>
                        <option value="completed">Завершенные</option>
                        <option value="cancelled">Отмененные</option>
                    </select>
                    <button class="btn btn-outline btn-sm" id="refreshAppointmentsBtn">
                        <i class="fas fa-sync-alt"></i> Обновить
                    </button>
                </div>
                <div class="appointments-list" id="adminAppointmentsList">
                    <!-- Appointments will be loaded here -->
                </div>
            </div>
        `;

        // Insert after reports section
        const reportsSection = adminPanel.querySelector('.reports-section');
        if (reportsSection) {
            reportsSection.insertAdjacentHTML('beforebegin', appointmentsManagementHTML);
        } else {
            adminPanel.insertAdjacentHTML('beforeend', appointmentsManagementHTML);
        }

        // Add event listeners for new elements
        document.getElementById('appointmentFilter')?.addEventListener('change', () => this.loadAppointmentsList());
        document.getElementById('refreshAppointmentsBtn')?.addEventListener('click', () => this.loadAppointmentsList());

        // Load initial appointments list
        this.loadAppointmentsList();
    }

    // Search and Filters functionality
    setupSearchFilters() {
        const searchPatient = document.getElementById('searchPatient');
        const filterService = document.getElementById('filterService');
        const filterDateFrom = document.getElementById('filterDateFrom');
        const filterDateTo = document.getElementById('filterDateTo');
        const filterStatus = document.getElementById('filterStatus');
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');
        const resetFiltersBtn = document.getElementById('resetFiltersBtn');
        const exportResultsBtn = document.getElementById('exportResultsBtn');

        // Apply filters
        applyFiltersBtn?.addEventListener('click', () => {
            this.applySearchFilters();
        });

        // Reset filters
        resetFiltersBtn?.addEventListener('click', () => {
            this.resetSearchFilters();
        });

        // Export results
        exportResultsBtn?.addEventListener('click', () => {
            this.exportSearchResults();
        });

        // Real-time search on patient name input
        searchPatient?.addEventListener('input', (e) => {
            if (e.target.value.length >= 2 || e.target.value.length === 0) {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.applySearchFilters();
                }, 300);
            }
        });

        // Apply filters on other filter changes
        [filterService, filterDateFrom, filterDateTo, filterStatus].forEach(filter => {
            filter?.addEventListener('change', () => {
                this.applySearchFilters();
            });
        });

        console.log('Search filters initialized');
    }

    applySearchFilters() {
        const searchTerm = document.getElementById('searchPatient')?.value.toLowerCase() || '';
        const serviceFilter = document.getElementById('filterService')?.value || 'all';
        const dateFrom = document.getElementById('filterDateFrom')?.value || '';
        const dateTo = document.getElementById('filterDateTo')?.value || '';
        const statusFilter = document.getElementById('filterStatus')?.value || 'all';

        const allAppointments = window.appointmentsSystem?.getAppointments() || [];
        
        // Apply filters
        let filteredAppointments = allAppointments.filter(appointment => {
            // Search by patient name
            if (searchTerm && !appointment.petName.toLowerCase().includes(searchTerm)) {
                return false;
            }
            
            // Filter by service
            if (serviceFilter !== 'all' && appointment.service !== serviceFilter) {
                return false;
            }
            
            // Filter by status
            if (statusFilter !== 'all' && appointment.status !== statusFilter) {
                return false;
            }
            
            // Filter by date range
            if (dateFrom && appointment.date < dateFrom) {
                return false;
            }
            
            if (dateTo && appointment.date > dateTo) {
                return false;
            }
            
            return true;
        });

        // Update results count
        this.updateSearchResultsInfo(filteredAppointments);
        
        // Update appointments list
        this.renderFilteredAppointments(filteredAppointments, searchTerm);
    }

    renderFilteredAppointments(appointments, searchTerm = '') {
        const appointmentsList = document.getElementById('adminAppointmentsList');
        if (!appointmentsList) return;

        if (appointments.length === 0) {
            appointmentsList.innerHTML = '<p class="no-appointments">Записей по заданным критериям не найдено</p>';
            return;
        }

        // Sort by date (newest first)
        appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        appointmentsList.innerHTML = appointments.map(appointment => {
            const doctor = window.doctorsData?.getDoctorById(appointment.doctorId);
            const doctorName = doctor ? doctor.name : 'Неизвестный врач';
            const servicePrice = this.getServicePrice(appointment.service);
            const statusBadge = this.getStatusBadge(appointment.status);
            const canComplete = appointment.status === 'confirmed' || appointment.status === 'pending';
            const canDelete = appointment.status !== 'completed' && appointment.status !== 'cancelled';

            // Highlight search term in patient name
            let highlightedPetName = appointment.petName;
            if (searchTerm) {
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                highlightedPetName = appointment.petName.replace(regex, '<span class="highlight-patient">$1</span>');
            }

            return `
                <div class="appointment-item" data-id="${appointment.id}">
                    <div class="appointment-header">
                        <div class="appointment-info">
                            <h4>${highlightedPetName} (${this.getPetTypeName(appointment.petType)})</h4>
                            <span class="appointment-date">${this.formatDateTime(appointment.date, appointment.time)}</span>
                        </div>
                        <div class="appointment-actions">
                            ${canComplete ? `
                                <button class="btn btn-success btn-sm complete-appointment-btn" data-id="${appointment.id}">
                                    <i class="fas fa-check"></i> Завершить
                                </button>
                            ` : ''}
                            ${canDelete ? `
                                <button class="btn btn-danger btn-sm delete-appointment-btn" data-id="${appointment.id}">
                                    <i class="fas fa-trash"></i> Удалить
                                </button>
                            ` : ''}
                            ${statusBadge}
                        </div>
                    </div>
                    <div class="appointment-details">
                        <div class="detail">
                            <strong>Врач:</strong> ${doctorName}
                        </div>
                        <div class="detail">
                            <strong>Услуга:</strong> ${this.getServiceName(appointment.service)}
                        </div>
                        <div class="detail">
                            <strong>Стоимость:</strong> ${servicePrice.toLocaleString()} ₽
                        </div>
                        ${appointment.notes ? `
                            <div class="detail">
                                <strong>Примечания:</strong> ${appointment.notes}
                            </div>
                        ` : ''}
                        <div class="detail">
                            <strong>Клиент:</strong> ${appointment.userId} (${appointment.userPhone || 'телефон не указан'})
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners to action buttons
        this.attachAppointmentActions();
    }

    updateSearchResultsInfo(appointments) {
        const resultsCount = document.getElementById('resultsCount');
        const confirmedCount = document.getElementById('confirmedCount');
        const completedCount = document.getElementById('completedCount');
        const pendingCount = document.getElementById('pendingCount');

        if (resultsCount) resultsCount.textContent = appointments.length;
        
        const confirmed = appointments.filter(apt => apt.status === 'confirmed').length;
        const completed = appointments.filter(apt => apt.status === 'completed').length;
        const pending = appointments.filter(apt => apt.status === 'pending').length;
        
        if (confirmedCount) confirmedCount.textContent = confirmed;
        if (completedCount) completedCount.textContent = completed;
        if (pendingCount) pendingCount.textContent = pending;
    }

    resetSearchFilters() {
        document.getElementById('searchPatient').value = '';
        document.getElementById('filterService').value = 'all';
        document.getElementById('filterDateFrom').value = '';
        document.getElementById('filterDateTo').value = '';
        document.getElementById('filterStatus').value = 'all';
        
        this.applySearchFilters();
    }

    exportSearchResults() {
        const searchTerm = document.getElementById('searchPatient')?.value || '';
        const serviceFilter = document.getElementById('filterService')?.value || 'all';
        const dateFrom = document.getElementById('filterDateFrom')?.value || '';
        const dateTo = document.getElementById('filterDateTo')?.value || '';
        const statusFilter = document.getElementById('filterStatus')?.value || 'all';

        const allAppointments = window.appointmentsSystem?.getAppointments() || [];
        const filteredAppointments = allAppointments.filter(appointment => {
            if (searchTerm && !appointment.petName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            if (serviceFilter !== 'all' && appointment.service !== serviceFilter) return false;
            if (statusFilter !== 'all' && appointment.status !== statusFilter) return false;
            if (dateFrom && appointment.date < dateFrom) return false;
            if (dateTo && appointment.date > dateTo) return false;
            return true;
        });

        // Create CSV content
        let csvContent = "Кличка,Вид,Услуга,Врач,Дата,Время,Статус,Стоимость,Клиент,Телефон,Примечания\n";
        
        filteredAppointments.forEach(appointment => {
            const doctor = window.doctorsData?.getDoctorById(appointment.doctorId);
            const doctorName = doctor ? doctor.name : 'Неизвестный врач';
            const servicePrice = this.getServicePrice(appointment.service);
            
            const row = [
                `"${appointment.petName}"`,
                `"${this.getPetTypeName(appointment.petType)}"`,
                `"${this.getServiceName(appointment.service)}"`,
                `"${doctorName}"`,
                `"${this.formatDate(appointment.date)}"`,
                `"${appointment.time}"`,
                `"${this.getStatusText(appointment.status)}"`,
                `"${servicePrice} ₽"`,
                `"${appointment.userId}"`,
                `"${appointment.userPhone || ''}"`,
                `"${appointment.notes || ''}"`
            ].join(',');
            
            csvContent += row + '\n';
        });

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const filename = `appointments_export_${new Date().toISOString().split('T')[0]}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification(`Экспортировано ${filteredAppointments.length} записей в CSV`, 'success');
    }

    // Services Management Methods
    setupServicesManagement() {
        const addServiceBtn = document.getElementById('addServiceBtn');
        const searchServices = document.getElementById('searchServices');

        addServiceBtn?.addEventListener('click', () => {
            this.showServiceModal();
        });

        // Real-time search for services
        searchServices?.addEventListener('input', (e) => {
            clearTimeout(this.servicesSearchTimeout);
            this.servicesSearchTimeout = setTimeout(() => {
                this.filterServices(e.target.value);
            }, 300);
        });

        // Load initial services
        this.loadServicesList();
        console.log('Services management initialized');
    }

    loadServicesList() {
        const services = this.getServices();
        this.renderServicesList(services);
        this.updateServicesStats(services);
    }

    getServices() {
        return JSON.parse(localStorage.getItem('vetServices')) || this.getDefaultServices();
    }

    getDefaultServices() {
        return [
            {
                id: 'consultation',
                name: 'Консультация',
                description: 'Первичный осмотр и консультация специалиста',
                price: 800,
                duration: 30,
                category: 'basic',
                icon: 'stethoscope',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 'vaccination',
                name: 'Вакцинация',
                description: 'Профилактическая вакцинация от инфекционных заболеваний',
                price: 1200,
                duration: 20,
                category: 'prevention',
                icon: 'syringe',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 'surgery',
                name: 'Хирургия',
                description: 'Плановые и экстренные хирургические операции',
                price: 4500,
                duration: 120,
                category: 'surgery',
                icon: 'heart',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 'dentistry',
                name: 'Стоматология',
                description: 'Профессиональная чистка зубов и лечение стоматологических заболеваний',
                price: 1500,
                duration: 45,
                category: 'dental',
                icon: 'tooth',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 'diagnostics',
                name: 'Диагностика',
                description: 'Комплексное обследование с использованием современного оборудования',
                price: 2000,
                duration: 60,
                category: 'diagnostics',
                icon: 'heartbeat',
                status: 'active',
                createdAt: new Date().toISOString()
            }
        ];
    }

    renderServicesList(services) {
        const servicesList = document.getElementById('servicesList');
        if (!servicesList) return;

        if (services.length === 0) {
            servicesList.innerHTML = `
                <div class="no-services">
                    <i class="fas fa-stethoscope"></i>
                    <p>Услуги не найдены</p>
                    <p class="hint">Добавьте первую услугу для вашей клиники</p>
                </div>
            `;
            return;
        }

        servicesList.innerHTML = services.map(service => `
            <div class="service-item ${service.status === 'inactive' ? 'inactive' : ''}" data-service-id="${service.id}">
                <div class="service-main-info">
                    <div class="service-header">
                        <div class="service-icon">
                            <i class="fas fa-${service.icon}"></i>
                        </div>
                        <div class="service-title">
                            <h4>${service.name}</h4>
                            <p class="service-price">${service.price.toLocaleString()} ₽</p>
                        </div>
                    </div>
                    <p class="service-description">${service.description}</p>
                    <div class="service-details">
                        <div class="service-detail">
                            <span class="label">Длительность</span>
                            <span class="value">${service.duration} мин</span>
                        </div>
                        <div class="service-detail">
                            <span class="label">Категория</span>
                            <span class="value">${this.getCategoryName(service.category)}</span>
                        </div>
                        <div class="service-detail">
                            <span class="label">ID услуги</span>
                            <span class="value">${service.id}</span>
                        </div>
                    </div>
                </div>
                <div class="service-actions">
                    <span class="service-status ${service.status === 'active' ? 'status-active' : 'status-inactive'}">
                        <i class="fas fa-${service.status === 'active' ? 'check-circle' : 'pause-circle'}"></i>
                        ${service.status === 'active' ? 'Активна' : 'Неактивна'}
                    </span>
                    <button class="btn btn-outline btn-sm edit-service-btn" data-service-id="${service.id}">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <button class="btn btn-${service.status === 'active' ? 'warning' : 'success'} btn-sm toggle-service-btn" data-service-id="${service.id}">
                        <i class="fas fa-${service.status === 'active' ? 'pause' : 'play'}"></i>
                        ${service.status === 'active' ? 'Деактивировать' : 'Активировать'}
                    </button>
                    <button class="btn btn-danger btn-sm delete-service-btn" data-service-id="${service.id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
        `).join('');

        // Attach event listeners
        this.attachServiceEvents();
    }

    attachServiceEvents() {
        // Edit service buttons
        document.querySelectorAll('.edit-service-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const serviceId = e.target.closest('[data-service-id]').dataset.serviceId;
                this.showServiceModal(serviceId);
            });
        });

        // Toggle service status buttons
        document.querySelectorAll('.toggle-service-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const serviceId = e.target.closest('[data-service-id]').dataset.serviceId;
                this.toggleServiceStatus(serviceId);
            });
        });

        // Delete service buttons
        document.querySelectorAll('.delete-service-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const serviceId = e.target.closest('[data-service-id]').dataset.serviceId;
                this.deleteService(serviceId);
            });
        });
    }

    filterServices(searchTerm) {
        const services = this.getServices();
        const filteredServices = services.filter(service => 
            service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderServicesList(filteredServices);
    }

    updateServicesStats(services) {
        const totalServices = document.getElementById('totalServicesCount');
        const activeServices = document.getElementById('activeServicesCount');

        if (totalServices) totalServices.textContent = services.length;
        if (activeServices) {
            const activeCount = services.filter(s => s.status === 'active').length;
            activeServices.textContent = activeCount;
        }
    }

    getCategoryName(category) {
        const categories = {
            basic: 'Основная',
            prevention: 'Профилактика',
            surgery: 'Хирургия',
            dental: 'Стоматология',
            diagnostics: 'Диагностика',
            emergency: 'Экстренная',
            other: 'Другое'
        };
        return categories[category] || category;
    }

    showServiceModal(serviceId = null) {
        const isEdit = !!serviceId;
        const service = isEdit ? this.getServiceById(serviceId) : null;

        const modalHTML = `
            <div id="serviceModal" class="modal">
                <div class="modal-content service-modal">
                    <button class="close">&times;</button>
                    <h2>${isEdit ? 'Редактирование услуги' : 'Добавление услуги'}</h2>
                    
                    <form id="serviceForm">
                        <input type="hidden" id="serviceId" value="${service?.id || ''}">
                        
                        <div class="service-icon-preview">
                            <div class="service-icon-large">
                                <i id="serviceIconPreview" class="fas fa-${service?.icon || 'stethoscope'}"></i>
                            </div>
                            <p>Выберите иконку для услуги</p>
                        </div>
                        
                        <div class="icon-selector" id="iconSelector">
                            ${this.getIconOptions(service?.icon)}
                        </div>
                        
                        <div class="service-form-grid">
                            <div class="form-group">
                                <label for="serviceName">Название услуги *</label>
                                <input type="text" id="serviceName" value="${service?.name || ''}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="serviceIdField">ID услуги *</label>
                                <input type="text" id="serviceIdField" value="${service?.id || ''}" ${isEdit ? 'readonly' : ''} required>
                            </div>
                            
                            <div class="form-group">
                                <label for="serviceDescription">Описание услуги *</label>
                                <textarea id="serviceDescription" rows="3" required>${service?.description || ''}</textarea>
                            </div>
                            
                            <div class="service-form-row">
                                <div class="form-group">
                                    <label for="servicePrice">Стоимость (₽) *</label>
                                    <input type="number" id="servicePrice" value="${service?.price || ''}" min="0" step="50" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="serviceDuration">Длительность (мин) *</label>
                                    <input type="number" id="serviceDuration" value="${service?.duration || ''}" min="5" step="5" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Категория услуги</label>
                                <div class="service-categories" id="serviceCategories">
                                    ${this.getCategoryOptions(service?.category)}
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="serviceStatus">Статус услуги</label>
                                <select id="serviceStatus">
                                    <option value="active" ${service?.status !== 'inactive' ? 'selected' : ''}>Активна</option>
                                    <option value="inactive" ${service?.status === 'inactive' ? 'selected' : ''}>Неактивна</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i>
                                ${isEdit ? 'Сохранить изменения' : 'Добавить услугу'}
                            </button>
                            <button type="button" class="btn btn-outline" id="cancelServiceBtn">
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('serviceModal');
        if (existingModal) existingModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = document.getElementById('serviceModal');
        modal.style.display = 'flex';

        this.setupServiceModalEvents(serviceId);
    }

    getIconOptions(selectedIcon = 'stethoscope') {
        const icons = ['stethoscope', 'syringe', 'heart', 'tooth', 'heartbeat', 'user-md', 'ambulance', 'paw', 'eye', 'ear'];
        return icons.map(icon => `
            <div class="icon-option ${icon === selectedIcon ? 'selected' : ''}" data-icon="${icon}">
                <i class="fas fa-${icon}"></i>
            </div>
        `).join('');
    }

    getCategoryOptions(selectedCategory = 'basic') {
        const categories = [
            { value: 'basic', label: 'Основная' },
            { value: 'prevention', label: 'Профилактика' },
            { value: 'surgery', label: 'Хирургия' },
            { value: 'dental', label: 'Стоматология' },
            { value: 'diagnostics', label: 'Диагностика' },
            { value: 'emergency', label: 'Экстренная' },
            { value: 'other', label: 'Другое' }
        ];
        
        return categories.map(cat => `
            <div class="category-tag ${cat.value === selectedCategory ? 'selected' : ''}" data-category="${cat.value}">
                ${cat.label}
            </div>
        `).join('');
    }

    setupServiceModalEvents(serviceId) {
        const modal = document.getElementById('serviceModal');
        const form = document.getElementById('serviceForm');
        const cancelBtn = document.getElementById('cancelServiceBtn');
        const iconOptions = modal.querySelectorAll('.icon-option');
        const categoryOptions = modal.querySelectorAll('.category-tag');

        // Icon selection
        iconOptions.forEach(option => {
            option.addEventListener('click', () => {
                iconOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                const icon = option.dataset.icon;
                document.getElementById('serviceIconPreview').className = `fas fa-${icon}`;
            });
        });

        // Category selection
        categoryOptions.forEach(option => {
            option.addEventListener('click', () => {
                categoryOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveService(serviceId);
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

    saveService(serviceId) {
        const form = document.getElementById('serviceForm');
        const isEdit = !!serviceId;

        const selectedIcon = document.querySelector('.icon-option.selected')?.dataset.icon || 'stethoscope';
        const selectedCategory = document.querySelector('.category-tag.selected')?.dataset.category || 'basic';

        const serviceData = {
            id: document.getElementById('serviceIdField').value.trim(),
            name: document.getElementById('serviceName').value.trim(),
            description: document.getElementById('serviceDescription').value.trim(),
            price: parseInt(document.getElementById('servicePrice').value),
            duration: parseInt(document.getElementById('serviceDuration').value),
            category: selectedCategory,
            icon: selectedIcon,
            status: document.getElementById('serviceStatus').value,
            updatedAt: new Date().toISOString()
        };

        if (!isEdit) {
            serviceData.createdAt = new Date().toISOString();
        }

        // Validation
        if (!this.validateServiceData(serviceData, isEdit)) {
            return;
        }

        if (isEdit) {
            this.updateService(serviceId, serviceData);
        } else {
            this.addService(serviceData);
        }

        // Reload services list
        this.loadServicesList();
    }

    validateServiceData(serviceData, isEdit) {
        const errors = [];

        if (!serviceData.id) {
            errors.push('ID услуги обязателен');
        }

        if (!serviceData.name) {
            errors.push('Название услуги обязательно');
        }

        if (!serviceData.description) {
            errors.push('Описание услуги обязательно');
        }

        if (!serviceData.price || serviceData.price < 0) {
            errors.push('Стоимость должна быть положительным числом');
        }

        if (!serviceData.duration || serviceData.duration < 5) {
            errors.push('Длительность должна быть не менее 5 минут');
        }

        // Check for duplicate ID when adding new service
        if (!isEdit && this.getServiceById(serviceData.id)) {
            errors.push('Услуга с таким ID уже существует');
        }

        if (errors.length > 0) {
            this.showNotification(errors.join(', '), 'error');
            return false;
        }

        return true;
    }

    getServiceById(serviceId) {
        const services = this.getServices();
        return services.find(service => service.id === serviceId);
    }

    addService(serviceData) {
        const services = this.getServices();
        
        // Check if service with this ID already exists
        if (services.find(s => s.id === serviceData.id)) {
            this.showNotification('Услуга с таким ID уже существует', 'error');
            return;
        }

        services.push(serviceData);
        this.saveServices(services);
        this.showNotification('Услуга успешно добавлена', 'success');
    }

    updateService(serviceId, updatedData) {
        const services = this.getServices();
        const index = services.findIndex(service => service.id === serviceId);
        
        if (index !== -1) {
            services[index] = { ...services[index], ...updatedData };
            this.saveServices(services);
            this.showNotification('Услуга успешно обновлена', 'success');
        }
    }

    toggleServiceStatus(serviceId) {
        const services = this.getServices();
        const service = services.find(s => s.id === serviceId);
        
        if (service) {
            service.status = service.status === 'active' ? 'inactive' : 'active';
            service.updatedAt = new Date().toISOString();
            this.saveServices(services);
            
            const action = service.status === 'active' ? 'активирована' : 'деактивирована';
            this.showNotification(`Услуга "${service.name}" ${action}`, 'success');
            this.loadServicesList();
        }
    }

    deleteService(serviceId) {
        const service = this.getServiceById(serviceId);
        if (!service) return;

        if (!confirm(`Вы уверены, что хотите удалить услугу "${service.name}"?`)) {
            return;
        }

        const services = this.getServices();
        const filteredServices = services.filter(s => s.id !== serviceId);
        this.saveServices(filteredServices);
        
        this.showNotification(`Услуга "${service.name}" удалена`, 'success');
        this.loadServicesList();
    }

    saveServices(services) {
        localStorage.setItem('vetServices', JSON.stringify(services));
    }

    // Original Admin System methods continue...
    loadAppointmentsList() {
        const appointmentsList = document.getElementById('adminAppointmentsList');
        if (!appointmentsList) return;

        const filter = document.getElementById('appointmentFilter')?.value || 'all';
        const allAppointments = window.appointmentsSystem?.getAppointments() || [];
        
        let filteredAppointments = allAppointments;
        if (filter !== 'all') {
            filteredAppointments = allAppointments.filter(apt => apt.status === filter);
        }

        // Sort by date (newest first)
        filteredAppointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (filteredAppointments.length === 0) {
            appointmentsList.innerHTML = '<p class="no-appointments">Записей не найдено</p>';
            return;
        }

        appointmentsList.innerHTML = filteredAppointments.map(appointment => {
            const doctor = window.doctorsData?.getDoctorById(appointment.doctorId);
            const doctorName = doctor ? doctor.name : 'Неизвестный врач';
            const servicePrice = this.getServicePrice(appointment.service);
            const statusBadge = this.getStatusBadge(appointment.status);
            const canComplete = appointment.status === 'confirmed' || appointment.status === 'pending';
            const canDelete = appointment.status !== 'completed' && appointment.status !== 'cancelled';

            return `
                <div class="appointment-item" data-id="${appointment.id}">
                    <div class="appointment-header">
                        <div class="appointment-info">
                            <h4>${appointment.petName} (${this.getPetTypeName(appointment.petType)})</h4>
                            <span class="appointment-date">${this.formatDateTime(appointment.date, appointment.time)}</span>
                        </div>
                        <div class="appointment-actions">
                            ${canComplete ? `
                                <button class="btn btn-success btn-sm complete-appointment-btn" data-id="${appointment.id}">
                                    <i class="fas fa-check"></i> Завершить
                                </button>
                            ` : ''}
                            ${canDelete ? `
                                <button class="btn btn-danger btn-sm delete-appointment-btn" data-id="${appointment.id}">
                                    <i class="fas fa-trash"></i> Удалить
                                </button>
                            ` : ''}
                            ${statusBadge}
                        </div>
                    </div>
                    <div class="appointment-details">
                        <div class="detail">
                            <strong>Врач:</strong> ${doctorName}
                        </div>
                        <div class="detail">
                            <strong>Услуга:</strong> ${this.getServiceName(appointment.service)}
                        </div>
                        <div class="detail">
                            <strong>Стоимость:</strong> ${servicePrice.toLocaleString()} ₽
                        </div>
                        ${appointment.notes ? `
                            <div class="detail">
                                <strong>Примечания:</strong> ${appointment.notes}
                            </div>
                        ` : ''}
                        <div class="detail">
                            <strong>Клиент:</strong> ${appointment.userId} (${appointment.userPhone || 'телефон не указан'})
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners to action buttons
        this.attachAppointmentActions();
    }

    attachAppointmentActions() {
        const appointmentsList = document.getElementById('adminAppointmentsList');
        if (!appointmentsList) return;

        // Add event listeners to action buttons
        appointmentsList.querySelectorAll('.complete-appointment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.completeAppointment(btn.dataset.id);
            });
        });

        appointmentsList.querySelectorAll('.delete-appointment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteAppointment(btn.dataset.id);
            });
        });
    }

    completeAppointment(appointmentId) {
        if (!confirm('Вы уверены, что хотите завершить этот прием?')) return;

        const appointments = window.appointmentsSystem?.getAppointments() || [];
        const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
        
        if (appointmentIndex !== -1) {
            appointments[appointmentIndex].status = 'completed';
            localStorage.setItem('vetAppointments', JSON.stringify(appointments));
            
            this.showNotification('Прием успешно завершен', 'success');
            this.applySearchFilters(); // Refresh the filtered list
            this.updateStats();
        }
    }

    deleteAppointment(appointmentId) {
        if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;

        const appointments = window.appointmentsSystem?.getAppointments() || [];
        const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
        
        if (appointmentIndex !== -1) {
            appointments[appointmentIndex].status = 'cancelled';
            localStorage.setItem('vetAppointments', JSON.stringify(appointments));
            
            this.showNotification('Запись успешно отменена', 'success');
            this.applySearchFilters(); // Refresh the filtered list
            this.updateStats();
        }
    }

    getStatusBadge(status) {
        const statusConfig = {
            pending: { class: 'status-pending', text: 'Ожидание' },
            confirmed: { class: 'status-confirmed', text: 'Подтвержден' },
            completed: { class: 'status-completed', text: 'Завершен' },
            cancelled: { class: 'status-cancelled', text: 'Отменен' }
        };
        
        const config = statusConfig[status] || statusConfig.pending;
        return `<span class="status-badge ${config.class}">${config.text}</span>`;
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

    getStatusText(status) {
        const statuses = {
            pending: 'Ожидание',
            confirmed: 'Подтвержден',
            completed: 'Завершен',
            cancelled: 'Отменен'
        };
        return statuses[status] || status;
    }

    formatDateTime(date, time) {
        const dateObj = new Date(date);
        return `${dateObj.toLocaleDateString('ru-RU')} в ${time}`;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('ru-RU');
    }

    updateStats() {
        console.log('Updating admin stats...');
        
        if (!window.authSystem || !window.authSystem.currentUser || window.authSystem.currentUser.role !== 'admin') {
            console.log('Cannot update stats: user not admin');
            return;
        }

        const appointments = window.appointmentsSystem?.getAppointments() || [];
        const doctors = window.doctorsData?.getActiveDoctors() || [];
        const stats = window.appointmentsSystem?.getAppointmentsStats() || { revenue: 0 };

        console.log('Stats calculated:', { 
            patients: this.getUniquePatientsCount(),
            appointments: appointments.length,
            revenue: stats.revenue,
            doctors: doctors.length
        });

        const totalPatientsEl = document.getElementById('adminTotalPatients');
        const totalAppointmentsEl = document.getElementById('adminTotalAppointments');
        const totalRevenueEl = document.getElementById('adminTotalRevenue');
        const totalDoctorsEl = document.getElementById('adminTotalDoctors');

        if (totalPatientsEl) totalPatientsEl.textContent = this.getUniquePatientsCount();
        if (totalAppointmentsEl) totalAppointmentsEl.textContent = appointments.length;
        if (totalRevenueEl) totalRevenueEl.textContent = stats.revenue.toLocaleString() + ' ₽';
        if (totalDoctorsEl) totalDoctorsEl.textContent = doctors.length;
    }

    getUniquePatientsCount() {
        const appointments = window.appointmentsSystem?.getAppointments() || [];
        const uniquePets = new Set();
        
        appointments.forEach(apt => {
            uniquePets.add(apt.petName + apt.userId);
        });
        
        return uniquePets.size;
    }

    generateReport() {
        console.log('Generating report...');
        
        const startDate = document.getElementById('reportDateFrom')?.value;
        const endDate = document.getElementById('reportDateTo')?.value;
        
        const stats = window.appointmentsSystem?.getAppointmentsStats(startDate, endDate) || {
            total: 0,
            byStatus: { pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
            byService: {},
            byDoctor: {},
            revenue: 0
        };
        
        const doctors = window.doctorsData?.getDoctors() || [];
        
        this.displayReport(stats, doctors, startDate, endDate);
        
        const reportModal = document.getElementById('reportModal');
        if (reportModal) {
            reportModal.style.display = 'flex';
            console.log('Report modal displayed');
        }
    }

    displayReport(stats, doctors, startDate, endDate) {
        const content = document.getElementById('reportContent');
        if (!content) {
            console.error('Report content element not found!');
            return;
        }
        
        const periodText = startDate && endDate ? 
            `за период с ${this.formatDate(startDate)} по ${this.formatDate(endDate)}` : 
            'за все время';
        
        content.innerHTML = `
            <div class="report-header">
                <h3>Отчет по работе клиники</h3>
                <p>${periodText}</p>
                <div class="report-summary">
                    <div class="summary-item">
                        <span class="label">Всего приемов:</span>
                        <span class="value">${stats.total}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Общий доход:</span>
                        <span class="value">${stats.revenue.toLocaleString()} ₽</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Уникальных пациентов:</span>
                        <span class="value">${this.getUniquePatientsCount()}</span>
                    </div>
                </div>
            </div>
            
            <div class="report-section">
                <h4>Статистика по статусам приемов</h4>
                <div class="status-stats">
                    <div class="status-item confirmed">
                        <span class="status-label">Подтвержденные</span>
                        <span class="status-count">${stats.byStatus.confirmed}</span>
                    </div>
                    <div class="status-item pending">
                        <span class="status-label">Ожидающие</span>
                        <span class="status-count">${stats.byStatus.pending}</span>
                    </div>
                    <div class="status-item completed">
                        <span class="status-label">Завершенные</span>
                        <span class="status-count">${stats.byStatus.completed}</span>
                    </div>
                    <div class="status-item cancelled">
                        <span class="status-label">Отмененные</span>
                        <span class="status-count">${stats.byStatus.cancelled}</span>
                    </div>
                </div>
            </div>
            
            <div class="report-section">
                <h4>Распределение по услугам</h4>
                <div class="service-stats">
                    ${Object.entries(stats.byService).length > 0 ? 
                        Object.entries(stats.byService).map(([service, count]) => `
                            <div class="service-item">
                                <span class="service-name">${this.getServiceName(service)}</span>
                                <span class="service-count">${count}</span>
                            </div>
                        `).join('') : 
                        '<p>Нет данных о услугах</p>'
                    }
                </div>
            </div>
            
            <div class="report-section">
                <h4>Загрузка врачей</h4>
                <div class="doctors-stats">
                    ${Object.entries(stats.byDoctor).length > 0 ? 
                        Object.entries(stats.byDoctor).map(([doctor, count]) => `
                            <div class="doctor-item">
                                <span class="doctor-name">${doctor}</span>
                                <span class="doctor-count">${count} приемов</span>
                            </div>
                        `).join('') : 
                        '<p>Нет данных о врачах</p>'
                    }
                </div>
            </div>
            
            <div class="report-footer">
                <p>Отчет сгенерирован: ${new Date().toLocaleDateString('ru-RU')}</p>
                <p>Пользователь: ${window.authSystem.currentUser.name}</p>
            </div>
        `;
        
        // Save report to history
        this.saveReportToHistory(stats, startDate, endDate);
    }

    saveReportToHistory(stats, startDate, endDate) {
        const reports = JSON.parse(localStorage.getItem('vetReports')) || [];
        const report = {
            id: 'REP_' + Date.now(),
            generatedAt: new Date().toISOString(),
            period: { startDate, endDate },
            stats: stats,
            generatedBy: window.authSystem.currentUser.name
        };
        
        reports.unshift(report);
        localStorage.setItem('vetReports', JSON.stringify(reports.slice(0, 10)));
        
        this.loadRecentReports();
    }

    loadRecentReports() {
        const reports = JSON.parse(localStorage.getItem('vetReports')) || [];
        const grid = document.getElementById('reportsGrid');
        
        if (!grid) return;
        
        grid.innerHTML = reports.slice(0, 3).map(report => `
            <div class="report-card">
                <div class="report-card-header">
                    <h4>Отчет от ${this.formatDate(report.generatedAt)}</h4>
                    <span class="report-period">
                        ${report.period.startDate ? this.formatDate(report.period.startDate) + ' - ' + this.formatDate(report.period.endDate) : 'Все время'}
                    </span>
                </div>
                <div class="report-card-stats">
                    <div class="stat">
                        <span class="number">${report.stats.total}</span>
                        <span class="label">Приемов</span>
                    </div>
                    <div class="stat">
                        <span class="number">${report.stats.revenue.toLocaleString()} ₽</span>
                        <span class="label">Доход</span>
                    </div>
                </div>
                <button class="btn btn-outline btn-sm" onclick="window.adminSystem.viewReport('${report.id}')">
                    Просмотреть
                </button>
            </div>
        `).join('') || '<p>Нет сгенерированных отчетов</p>';
    }

    viewReport(reportId) {
        const reports = JSON.parse(localStorage.getItem('vetReports')) || [];
        const report = reports.find(r => r.id === reportId);
        
        if (report) {
            this.displayReport(report.stats, window.doctorsData.getDoctors(), report.period.startDate, report.period.endDate);
            document.getElementById('reportModal').style.display = 'flex';
        }
    }

    printReport() {
        window.print();
    }

    exportReport() {
        this.showNotification('Функция экспорта в PDF будет доступна в ближайшее время', 'info');
    }

    showNotification(message, type) {
        if (window.authSystem) {
            window.authSystem.showNotification(message, type);
        }
    }
}

// Initialize admin system
window.adminSystem = new AdminSystem();
