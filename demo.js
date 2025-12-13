/**
 * demo.js
 * Pełna logika symulacji systemu SmartPark Demo.
 * Dane przechowywane są w localStorage, symulując małą bazę danych.
 * * * =========================================================================
 * STRUKTURA PRZYKŁADOWYCH DANYCH W localStorage I ICH WPŁYW NA STATYSTYKI:
 * =========================================================================
 * * DANE BAZOWE (w LocalStorage): Tablica 100 obiektów, np.:
 * * [
 * // Przykład Miejsce Zajęte
 * {
 * "id": 1, 
 * "isOccupied": true, 
 * "vehiclePlate": "KR 54321", 
 * "entryTime": 1734000000000 
 * },
 * // Przykład Miejsce Wolne
 * {
 * "id": 2, 
 * "isOccupied": false, 
 * "vehiclePlate": null, 
 * "entryTime": null
 * },
 * // ... 98 pozostałych miejsc
 * ]
 * * * -------------------------------------------------------------------------
 * * DANE WYNIKOWE (Wyświetlane w sekcji KPI):
 * * 1. Całkowita Pojemność: Stała wartość (100)
 * 2. Zajęte Miejsca: Liczba obiektów z "isOccupied": true (np. 35)
 * 3. Wolne Miejsca: Liczba obiektów z "isOccupied": false (np. 65)
 * * * -------------------------------------------------------------------------
 */

const STORAGE_KEY = 'smartParkDemoData';
const INITIAL_PARKING_CAPACITY = 100;
let parkingData = []; 
let intervalId = null; 

// --- Funkcje Pomocnicze i Narzędziowe ---

function generateRandomPlate() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let plate = '';
    
    // Format: WW 12345
    for (let i = 0; i < 2; i++) {
        plate += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    plate += ' ';
    for (let i = 0; i < 5; i++) {
        plate += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return plate;
}

function timeSince(timestamp) {
    if (!timestamp) return 'N/A';
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);

    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

// --- Funkcje Zarządzania Danymi w LocalStorage ---

function loadDemoData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        parkingData = JSON.parse(data);
    } else {
        initializeDemoData();
    }
}

function initializeDemoData(reset = false) {
    if (reset) {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Resetowanie danych demo SmartPark...');
    } else {
        console.log('Inicjowanie/ładowanie danych demo SmartPark...');
    }
    
    const spots = [];
    for (let i = 1; i <= INITIAL_PARKING_CAPACITY; i++) {
        const isOccupied = reset ? false : (Math.random() > 0.7);
        spots.push({
            id: i,
            isOccupied: isOccupied,
            vehiclePlate: isOccupied ? generateRandomPlate() : null,
            entryTime: isOccupied ? Date.now() - (Math.random() * 3600000) : null, 
        });
    }
    parkingData = spots;
    saveDemoData(parkingData);
}

function saveDemoData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// --- Funkcje Logiki Parkingowej ---

function getAvailableSpotsCount() {
    return parkingData.filter(spot => !spot.isOccupied).length;
}

function getOccupiedSpotsCount() {
    return parkingData.filter(spot => spot.isOccupied).length;
}

function occupyRandomSpot() {
    const availableSpots = parkingData.filter(spot => !spot.isOccupied);

    if (availableSpots.length === 0) {
        return { success: false, message: "Brak wolnych miejsc! Parking pełny." };
    }

    const spotToOccupy = availableSpots[Math.floor(Math.random() * availableSpots.length)];
    const index = parkingData.findIndex(spot => spot.id === spotToOccupy.id);
    
    parkingData[index].isOccupied = true;
    parkingData[index].vehiclePlate = generateRandomPlate();
    parkingData[index].entryTime = Date.now(); 

    saveDemoData(parkingData);
    return { success: true, message: `Samochód wjechał na miejsce #${parkingData[index].id} (${parkingData[index].vehiclePlate}).` };
}

function releaseRandomSpot() {
    const occupiedSpots = parkingData.filter(spot => spot.isOccupied);

    if (occupiedSpots.length === 0) {
        return { success: false, message: "Brak zajętych miejsc do zwolnienia." };
    }

    const spotToRelease = occupiedSpots[Math.floor(Math.random() * occupiedSpots.length)];
    const index = parkingData.findIndex(spot => spot.id === spotToRelease.id);

    parkingData[index].isOccupied = false;
    parkingData[index].vehiclePlate = null;
    parkingData[index].entryTime = null;

    saveDemoData(parkingData);
    return { success: true, message: `Samochód wyjechał z miejsca #${spotToRelease.id}.` };
}


// --- Funkcje UI i Wizualizacji ---

function renderParkingMap() {
    const mapElement = document.getElementById('parking-map');
    if (!mapElement) return;

    mapElement.innerHTML = ''; 

    parkingData.forEach(spot => {
        const spotDiv = document.createElement('div');
        spotDiv.className = 'parking-spot';
        spotDiv.textContent = spot.id;
        
        if (spot.isOccupied) {
            spotDiv.classList.add('spot-occupied');
            
            // Tworzenie Tooltipu z danymi
            const tooltip = document.createElement('div');
            tooltip.className = 'spot-tooltip';
            tooltip.innerHTML = `
                <strong>Miejsce: P${spot.id}</strong><br>
                Nr Rej: ${spot.vehiclePlate}<br>
                Parkuje od: ${timeSince(spot.entryTime)}
            `;
            spotDiv.appendChild(tooltip);

        } else {
            spotDiv.classList.add('spot-free');
        }

        mapElement.appendChild(spotDiv);
    });
}

function updateUI(message = '') {
    const available = getAvailableSpotsCount();
    const occupied = getOccupiedSpotsCount();
    const occupancyRate = ((occupied / INITIAL_PARKING_CAPACITY) * 100).toFixed(1);

    // Aktualizacja KPI
    if (document.getElementById('total-capacity')) {
        document.getElementById('total-capacity').textContent = INITIAL_PARKING_CAPACITY;
    }
    if (document.getElementById('available-spots')) {
        document.getElementById('available-spots').textContent = available;
    }
    if (document.getElementById('occupied-spots')) {
        document.getElementById('occupied-spots').textContent = occupied;
    }
    if (document.getElementById('occupancy-rate')) {
        document.getElementById('occupancy-rate').textContent = `${occupancyRate}%`;
    }
    
    // Aktualizacja wiadomości statusowej
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.color = message.includes('Brak') ? '#dc3545' : '#1C2B3A';
    }

    // RENDEROWANIE MAPY
    renderParkingMap();
}

function setupEventListeners() {
    if (document.getElementById('occupy-btn')) {
        document.getElementById('occupy-btn').addEventListener('click', () => {
            const result = occupyRandomSpot();
            updateUI(result.message);
        });
    }

    if (document.getElementById('release-btn')) {
        document.getElementById('release-btn').addEventListener('click', () => {
            const result = releaseRandomSpot();
            updateUI(result.message);
        });
    }

    if (document.getElementById('reset-btn')) {
        document.getElementById('reset-btn').addEventListener('click', () => {
            initializeDemoData(true); 
            updateUI("Dane demo zostały zresetowane. Parking jest teraz pusty.");
        });
    }
}

function initializeDemo() {
    loadDemoData();
    setupEventListeners();
    updateUI("Pomyślnie załadowano dane demo z LocalStorage.");
    
    if (intervalId) {
        clearInterval(intervalId);
    }
    
    intervalId = setInterval(() => {
        updateUI(); 
    }, 10000); 
}

window.SmartParkDemo = {
    initializeDemo: initializeDemo,
};