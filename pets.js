// pets.js
class PetsSystem {
    constructor() {
        this.pets = JSON.parse(localStorage.getItem('userPets')) || [];
        this.initializePetsSystem();
    }

    initializePetsSystem() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Event listeners will be added when user profile is shown
    }

    // Добавим методы в класс UserProfile для работы с питомцами
    addPetCardsToUserProfile() {
        const userProfileModal = document.getElementById('userProfileModal');
        if (!userProfileModal) return;

        // Добавляем раздел с питомцами после раздела "Мои данные"
        const userInfoSection = userProfileModal.querySelector('.user-info-section');
        if (userInfoSection && !userProfileModal.querySelector('.pets-section')) {
            const petsSectionHTML = `
                <div class="pets-section">
                    <div class="section-header-inner">
                        <h3><i class="fas fa-paw"></i> Мои питомцы</h3>
                        <button class="btn btn-primary btn-sm" id="addPetBtn">
                            <i class="fas fa-plus"></i> Добавить питомца
                        </button>
                    </div>
                    <div class="pets-grid" id="petsGrid">
                        ${this.renderPetsGrid()}
                    </div>
                </div>
            `;
            
            userInfoSection.insertAdjacentHTML('afterend', petsSectionHTML);
            
            // Добавляем обработчики событий
            document.getElementById('addPetBtn')?.addEventListener('click', () => {
                this.showAddPetModal();
            });
            
            this.setupPetsGridEvents();
        }
    }

    renderPetsGrid() {
        const currentUser = window.authSystem?.currentUser;
        if (!currentUser) return '';

        const userPets = this.getPetsByUser(currentUser.email);
        
        if (userPets.length === 0) {
            return `
                <div class="no-pets">
                    <i class="fas fa-paw"></i>
                    <p>У вас пока нет добавленных питомцев</p>
                    <p class="hint">Добавьте питомца для быстрой записи на прием</p>
                </div>
            `;
        }

        return userPets.map(pet => `
            <div class="pet-card" data-pet-id="${pet.id}">
                <div class="pet-card-header">
                    <h4>${pet.name}</h4>
                    <div class="pet-actions">
                        <button class="btn-icon edit-pet-btn" data-pet-id="${pet.id}" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-pet-btn" data-pet-id="${pet.id}" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="pet-info">
                    <div class="pet-detail">
                        <span class="label">Вид:</span>
                        <span class="value">${this.getPetTypeName(pet.type)}</span>
                    </div>
                    <div class="pet-detail">
                        <span class="label">Порода:</span>
                        <span class="value">${pet.breed || 'Не указана'}</span>
                    </div>
                    <div class="pet-detail">
                        <span class="label">Возраст:</span>
                        <span class="value">${pet.age || 'Не указан'}</span>
                    </div>
                    <div class="pet-detail">
                        <span class="label">Вес:</span>
                        <span class="value">${pet.weight ? pet.weight + ' кг' : 'Не указан'}</span>
                    </div>
                </div>
                ${pet.medicalNotes ? `
                    <div class="pet-medical-notes">
                        <strong>Мед. заметки:</strong> ${pet.medicalNotes}
                    </div>
                ` : ''}
                <button class="btn btn-outline btn-sm use-pet-btn" data-pet-id="${pet.id}">
                    <i class="fas fa-calendar-check"></i> Записать на прием
                </button>
            </div>
        `).join('');
    }

    setupPetsGridEvents() {
        const petsGrid = document.getElementById('petsGrid');
        if (!petsGrid) return;

        // Обработчики для кнопок действий
        petsGrid.addEventListener('click', (e) => {
            const petId = e.target.closest('[data-pet-id]')?.dataset.petId;
            if (!petId) return;

            if (e.target.closest('.edit-pet-btn')) {
                this.showEditPetModal(petId);
            } else if (e.target.closest('.delete-pet-btn')) {
                this.deletePet(petId);
            } else if (e.target.closest('.use-pet-btn')) {
                this.usePetForAppointment(petId);
            }
        });
    }

    showAddPetModal() {
        this.showPetModal();
    }

    showEditPetModal(petId) {
        const pet = this.getPetById(petId);
        if (!pet) return;

        this.showPetModal(pet);
    }

    showPetModal(pet = null) {
        const isEdit = !!pet;
        
        const modalHTML = `
            <div id="petModal" class="modal">
                <div class="modal-content pet-modal">
                    <button class="close">&times;</button>
                    <h2>${isEdit ? 'Редактирование' : 'Добавление'} питомца</h2>
                    
                    <form id="petForm">
                        <input type="hidden" id="petId" value="${pet?.id || ''}">
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="petName">Кличка *</label>
                                <input type="text" id="petName" value="${pet?.name || ''}" required>
                            </div>
                            <div class="form-group">
                         
                                <select id="petType" required>
                                    <option value="">Выберите вид</option>
                                    <option value="cat" ${pet?.type === 'cat' ? 'selected' : ''}>Кот/Кошка</option>
                                    <option value="dog" ${pet?.type === 'dog' ? 'selected' : ''}>Собака</option>
                                    <option value="bird" ${pet?.type === 'bird' ? 'selected' : ''}>Птица</option>
                                    <option value="rodent" ${pet?.type === 'rodent' ? 'selected' : ''}>Грызун</option>
                                    <option value="reptile" ${pet?.type === 'reptile' ? 'selected' : ''}>Рептилия</option>
                                    <option value="other" ${pet?.type === 'other' ? 'selected' : ''}>Другое</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                            
                                <input type="text" id="petBreed" value="${pet?.breed || ''}" placeholder="Например: Сиамская, Овчарка">
                            </div>
                            <div class="form-group">
                            
                                <input type="text" id="petAge" value="${pet?.age || ''}" placeholder="Например: 2 года, 5 месяцев">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                              
                                <input type="number" id="petWeight" value="${pet?.weight || ''}" step="0.1" min="0" placeholder="0.0">
                            </div>
                            <div class="form-group">
                            
                                <select id="petGender">
                                    <option value="">Не указан</option>
                                    <option value="male" ${pet?.gender === 'male' ? 'selected' : ''}>Мужской</option>
                                    <option value="female" ${pet?.gender === 'female' ? 'selected' : ''}>Женский</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                        
                            <input type="text" id="petColor" value="${pet?.color || ''}" placeholder="Например: рыжий, черно-белый">
                        </div>
                        
                        <div class="form-group">
                        
                            <input type="date" id="petBirthDate" value="${pet?.birthDate || ''}">
                        </div>
                        
                        <div class="form-group">
                     
                            <textarea id="petMedicalNotes" rows="3" placeholder="Хронические заболевания, аллергии, особенности здоровья...">${pet?.medicalNotes || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                  
                            <textarea id="petVaccinations" rows="2" placeholder="Даты и виды вакцин...">${pet?.vaccinations || ''}</textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i>
                                ${isEdit ? 'Сохранить изменения' : 'Добавить питомца'}
                            </button>
                            <button type="button" class="btn btn-outline" id="cancelPetBtn">
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Удаляем существующий модал
        const existingModal = document.getElementById('petModal');
        if (existingModal) existingModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = document.getElementById('petModal');
        modal.style.display = 'flex';

        this.setupPetModalEvents();
    }

    setupPetModalEvents() {
        const modal = document.getElementById('petModal');
        const form = document.getElementById('petForm');
        const cancelBtn = document.getElementById('cancelPetBtn');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePet();
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

    savePet() {
        const form = document.getElementById('petForm');
        const petId = document.getElementById('petId').value;
        const isEdit = !!petId;

        const petData = {
            id: petId || 'pet_' + Date.now(),
            name: document.getElementById('petName').value.trim(),
            type: document.getElementById('petType').value,
            breed: document.getElementById('petBreed').value.trim(),
            age: document.getElementById('petAge').value.trim(),
            weight: document.getElementById('petWeight').value ? parseFloat(document.getElementById('petWeight').value) : null,
            gender: document.getElementById('petGender').value,
            color: document.getElementById('petColor').value.trim(),
            birthDate: document.getElementById('petBirthDate').value,
            medicalNotes: document.getElementById('petMedicalNotes').value.trim(),
            vaccinations: document.getElementById('petVaccinations').value.trim(),
            owner: window.authSystem.currentUser.email,
            createdAt: isEdit ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Валидация
        if (!this.validatePetData(petData)) {
            return;
        }

        if (isEdit) {
            this.updatePet(petId, petData);
        } else {
            this.addPet(petData);
        }

        // Обновляем сетку питомцев
        this.updatePetsGrid();
    }

    validatePetData(petData) {
        if (!petData.name) {
            window.authSystem.showNotification('Введите кличку питомца', 'error');
            return false;
        }
        
        if (!petData.type) {
            window.authSystem.showNotification('Выберите вид животного', 'error');
            return false;
        }
        
        return true;
    }

    addPet(petData) {
        this.pets.push(petData);
        this.savePetsToStorage();
        window.authSystem.showNotification('Питомец успешно добавлен', 'success');
    }

    updatePet(petId, updatedData) {
        const index = this.pets.findIndex(pet => pet.id === petId);
        if (index !== -1) {
            this.pets[index] = { ...this.pets[index], ...updatedData };
            this.savePetsToStorage();
            window.authSystem.showNotification('Данные питомца обновлены', 'success');
        }
    }

    deletePet(petId) {
        if (!confirm('Вы уверены, что хотите удалить этого питомца?')) return;

        this.pets = this.pets.filter(pet => pet.id !== petId);
        this.savePetsToStorage();
        this.updatePetsGrid();
        window.authSystem.showNotification('Питомец удален', 'success');
    }

    usePetForAppointment(petId) {
        const pet = this.getPetById(petId);
        if (!pet) return;

        // Закрываем модальное окно профиля
        const userProfileModal = document.getElementById('userProfileModal');
        if (userProfileModal) {
            userProfileModal.style.display = 'none';
        }

        // Открываем модальное окно записи и заполняем данные
        if (window.appointmentsSystem) {
            window.appointmentsSystem.openAppointmentModal();
            
            setTimeout(() => {
                const petNameInput = document.getElementById('appointmentPetName');
                const petTypeSelect = document.getElementById('appointmentPetType');
                const notesTextarea = document.getElementById('appointmentNotes');

                if (petNameInput) petNameInput.value = pet.name;
                if (petTypeSelect) petTypeSelect.value = pet.type;
                
                // Добавляем медицинские заметки в примечания
                if (notesTextarea && pet.medicalNotes) {
                    notesTextarea.value = `Медицинские заметки: ${pet.medicalNotes}`;
                }
            }, 100);
        }
    }

    getPetById(petId) {
        return this.pets.find(pet => pet.id === petId);
    }

    getPetsByUser(userEmail) {
        return this.pets.filter(pet => pet.owner === userEmail)
                       .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    savePetsToStorage() {
        localStorage.setItem('userPets', JSON.stringify(this.pets));
    }

    updatePetsGrid() {
        const petsGrid = document.getElementById('petsGrid');
        if (petsGrid) {
            petsGrid.innerHTML = this.renderPetsGrid();
            this.setupPetsGridEvents();
        }
    }

    getPetTypeName(petType) {
        const types = {
            cat: 'Кот/Кошка',
            dog: 'Собака',
            bird: 'Птица',
            rodent: 'Грызун',
            reptile: 'Рептилия',
            other: 'Другое'
        };
        return types[petType] || petType;
    }
}

// Инициализация системы питомцев
window.petsSystem = new PetsSystem();

// Расширяем класс UserProfile для интеграции с питомцами
const originalShowUserProfile = window.userProfile.showUserProfile;
window.userProfile.showUserProfile = function() {
    originalShowUserProfile.call(this);
    
    // Добавляем карточки питомцев после отображения профиля
    setTimeout(() => {
        window.petsSystem.addPetCardsToUserProfile();
    }, 100);
};