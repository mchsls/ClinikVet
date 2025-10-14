// Инициализация карты
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Координаты клиники в Липецке
    const clinicLocation = [52.60882, 39.59922];
    
    try {
        const map = L.map('map').setView(clinicLocation, 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        L.marker(clinicLocation)
            .addTo(map)
            .bindPopup(`
                <div style="text-align: center;">
                    <h3 style="margin: 0 0 10px 0; color: #4CAF50;">ВетКлиника "Друг"</h3>
                    <p style="margin: 0;">г. Липецк, ул. Фрунзе 91А</p>
                    <p style="margin: 5px 0 0 0;"><strong>+7 (4742) 123-456</strong></p>
                </div>
            `)
            .openPopup();
            
        console.log('Карта успешно инициализирована');
    } catch (error) {
        console.error('Ошибка при инициализации карты:', error);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initMap();
});