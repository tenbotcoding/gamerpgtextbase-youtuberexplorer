// Game Logic for Hotel Grand Bali Terbengkalai

// Game State
const gameState = {
    isPlaying: false,
    currentScene: "start",
    playerName: "Luna",
    playerBackstory: "investigator",
    startingItem: "camera",
    health: 100,
    stress: 0,
    inventory: [],
    questLog: [],
    completedQuests: new Set(),
    currentQuest: null,
    playthroughTime: 0,
    hintsUsed: 0
};

// DOM Elements
const storyText = document.getElementById('story-text');
const choicesArea = document.getElementById('choices-area');
const inventoryList = document.getElementById('inventory-list');
const questLog = document.getElementById('quest-log');
const currentQuestEl = document.getElementById('current-quest');
const startBtn = document.getElementById('start-btn');
const customizeStartBtn = document.getElementById('customize-start-btn');
const customizationScreen = document.getElementById('customization-screen');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const resetBtn = document.getElementById('reset-btn');
const soundToggleBtn = document.getElementById('sound-toggle');
const ambientSound = document.getElementById('ambient-sound');
const healthFill = document.getElementById('health-fill');
const stressFill = document.getElementById('stress-fill');
const playerNameEl = document.getElementById('player-name-display');

// Sound State
let isSoundOn = true;

// Load Quests from quests.txt
let allQuests = [];

// Initialize Game
async function init() {
    // Load quests
    await loadQuests();
    
    // Check saved game
    if (localStorage.getItem('hotelRPGSave')) {
        loadGame();
    }
    
    // Hide customization screen by default
    customizationScreen.style.display = 'none';
    
    // Event Listeners
    startBtn.addEventListener('click', showCustomizationScreen);
    customizeStartBtn.addEventListener('click', startCustomizedGame);
    saveBtn.addEventListener('click', saveGame);
    loadBtn.addEventListener('click', loadGame);
    resetBtn.addEventListener('click', resetGame);
    soundToggleBtn.addEventListener('click', toggleSound);
    
    // Start ambient sound
    ambientSound.volume = 0.3;
    ambientSound.play().catch(err => console.log('Autoplay blocked:', err));
    
    updateUI();
}

// Show Character Customization Screen
function showCustomizationScreen() {
    customizationScreen.style.display = 'block';
    startBtn.style.display = 'none';
}

// Start Game with Customization
function startCustomizedGame() {
    gameState.playerName = document.getElementById('player-name').value || "Luna";
    gameState.playerBackstory = document.getElementById('player-backstory').value;
    gameState.startingItem = document.getElementById('starting-item').value;
    
    // Add starting item
    switch(gameState.startingItem) {
        case "camera":
            gameState.inventory.push("Kamera Video");
            break;
        case "flashlight":
            gameState.inventory.push("Sentuhan Besar");
            break;
        case "notebook":
            gameState.inventory.push("Buku Catatan");
            break;
    }
    
    customizationScreen.style.display = 'none';
    startGame();
}

// Load Quests from File
async function loadQuests() {
    try {
        const response = await fetch('./quests.txt');
        const text = await response.text();
        allQuests = text.split('\n').filter(q => q.trim() !== '');
    } catch (error) {
        console.error('Gagal memuat quest: ", error);
        allQuests = ["Quest: Gagal memuat library quest"];
    }
}

// Start Game
function startGame() {
    gameState.isPlaying = true;
    gameState.currentScene = "lobby";
    gameState.health = 100;
    gameState.stress = 0;
    gameState.questLog = [];
    gameState.completedQuests = new Set();
    
    // Dapatkan quest acak pertama
    pickRandomQuest();
    
    updateStory(`Selamat datang, ${gameState.playerName}! Kamu berdiri di depan pintu Hotel Grand Bali Terbengkalai. Udara lembab dan berbau apek memenuhi hidungmu. Pintu hotel bergoyang sedikit angin malam. Apa yang akan kamu lakukan?`);
    updateChoices([
        { text: "Masuk ke hotel dan membuka pintu", action: () => enterHotel() },
        { text: "Telepon tim kamu untuk meminta bantuan", action: () => callTeam() },
        { text: "Periksa tas kamu untuk melihat barang bawaan", action: () => checkInventory() },
        { text: "Gunakan buku catatan untuk mencari petunjuk", action: () => useHintItem() }
    ]);
    
    updateStats();
}

// Pick Random Quest
function pickRandomQuest() {
    if (allQuests.length === 0) return;
    const randomQuest = allQuests[Math.floor(Math.random() * allQuests.length)];
    gameState.currentQuest = randomQuest;
    gameState.questLog.push(randomQuest);
    updateUI();
}

// Update Story Text
function updateStory(text) {
    storyText.innerHTML = text;
}

// Update Choice Buttons
function updateChoices(choices) {
    choicesArea.innerHTML = '';
    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;
        btn.addEventListener('click', () => {
            choice.action();
        });
        choicesArea.appendChild(btn);
    });
}

// Update UI
function updateUI() {
    // Update Current Quest
    currentQuestEl.textContent = `Quest: ${gameState.currentQuest || "Belum ada quest"`;
    
    // Update Inventory List
    inventoryList.innerHTML = '';
    gameState.inventory.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        inventoryList.appendChild(li);
    });
    
    // Update Quest Log
    questLog.innerHTML = '';
    gameState.questLog.forEach(quest => {
        const li = document.createElement('li');
        li.textContent = quest;
        questLog.appendChild(li);
    });
}

// Game Scenes
function enterHotel() {
    gameState.stress = Math.min(100, gameState.stress + 10);
    updateStats();
    updateStory("Kamu mendorong pintu hotel, dan pintu itu terbuka dengan suara creaking yang keras. Di dalam, lampu gantung berdebu bergoyang di aula utama. Udara lembab dan penuh dengan suara bisikan lemah. Kamu melihat meja resepsionis yang tertutup debu, dan buku catatan di atasnya.");
    updateChoices([
        { text: "Periksa meja resepsionis", action: () => checkReceptionDesk() },
        { text: "Periksa kamera lama di dinding", action: () => checkOldCamera() },
        { text: "Naik tangga ke lantai atas", action: () => goUpStairs() }
    ]);
}

function callTeam() {
    gameState.stress = Math.min(100, gameState.stress + 20);
    updateStats();
    updateStory("Kamu mengambil hp kamu, tapi sinyal tidak ada. Semua perangkat di area hotel ini tidak bekerja. Hantu resepsionis muncul di belakang meja resepsionis, matanya berwarna merah terang.");
    updateChoices([
        { text: "Tanya hantu resepsionis", action: () => talkToGhost() },
        { text: "Lanjutkan ke dalam hotel", action: () => enterHotel() }
    ]);
}

function checkInventory() {
    updateStory("Kamu membuka tas kamu: kamu membawa kamera kamu, buku catatan, dan kunci kamar 302, dan sentuhan kecil, dan sebuah obeng kecil.");
    updateChoices([
        { text: "Ambil kamera", action: () => addItem("Kamera") },
        { text: "Ambil buku catatan", action: () => addItem("Buku Catatan Resepsionis") },
        { text: "Ambil kunci kamar 302", action: () => addItem("Kunci Kamar 302") }
    ]);
}

function addItem(item) {
    if (!gameState.inventory.includes(item)) {
        gameState.inventory.push(item);
    }
    updateUI();
}

// Update Health & Stress Stats
function updateStats() {
    healthFill.style.width = `${gameState.health}%`;
    stressFill.style.width = `${gameState.stress}%`;
    
    // Change stress fill color based on level
    if (gameState.stress > 70) {
        stressFill.style.background = 'linear-gradient(90deg, #e94560 0%, #ff9800 100%)';
    } else if (gameState.stress > 40) {
        stressFill.style.background = 'linear-gradient(90deg, #ff9800 0%, #ffeb3b 100%)';
    } else {
        stressFill.style.background = 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)';
    }
}

// Random Jumpscare Event
function randomJumpscare() {
    if (gameState.stress > 90 && Math.random() > 0.7) {
        updateStory("💥 SUARA TERBERGAK! Sebuah bayangan muncul di depan kamu, kamu terkejut dan kehilangan 15 HP!");
        gameState.health = Math.max(0, gameState.health - 15);
        updateStats();
        updateChoices([
            { text: "Berlari ke luar hotel", action: () => runAway() },
            { text: 
    const hintItems = ["Buku Catatan", "Buku Catatan Resepsionis"];
    const hasHintItem = hintItems.some(item => gameState.inventory.includes(item));
    
    if (hasHintItem) {
        const hints = [
            "Coba periksa meja resepsionis untuk petunjuk kunci",
            "Kode brankas resepsionis biasanya ada di buku catatan",
            "Lantai 3 adalah area paling aktif dengan aktivitas paranormal",
            "Kamu bisa menggunakan obeng untuk membuka panel listrik",
            "Hantu resepsionis akan membantu jika kamu memberinya bunga"
        ];
        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        updateStory(`💡 Petunjuk: ${randomHint}`);
        gameState.hintsUsed++;
        // Remove hint item after 3 uses
        if (gameState.hintsUsed >= 3) {
            hintItems.forEach(item => {
                const index = gameState.inventory.indexOf(item);
                if (index > -1) {
                    gameState.inventory.splice(index, 1);
                }
            });
            updateStory("📝 Buku catatan kamu sudah habis kertas!");
        }
    } else {
        updateStory("Kamu tidak punya buku catatan untuk mencari petunjuk!");
    }
    updateChoices([
        { text: "Masuk ke hotel dan membuka pintu", action: () => enterHotel() },
        { text: "Telepon tim kamu untuk meminta bantuan", action: () => callTeam() },
        { text: "Periksa tas kamu untuk melihat barang bawaan", action: () => checkInventory() },
        { text: "Gunakan buku catatan untuk mencari petunjuk", action: () => useHintItem() }
    ]);
}

// Save/Load Game
function saveGame() {
    const saveData = {
        ...gameState,
        completedQuests: Array.from(gameState.completedQuests)
    };
    localStorage.setItem('hotelRPGSave', JSON.stringify(saveData));
    alert('Permainan disimpan! ✅');
}

function loadGame() {
    const saveData = localStorage.getItem('hotelRPGSave');
    if (saveData) {
        const parsedData = JSON.parse(saveData);
        gameState.isPlaying = parsedData.isPlaying;
        gameState.currentScene = parsedData.currentScene;
        gameState.playerName = parsedData.playerName || "Luna";
        gameState.playerBackstory = parsedData.playerBackstory || "investigator";
        gameState.startingItem = parsedData.startingItem || "camera";
        gameState.health = parsedData.health || 100;
        gameState.stress = parsedData.stress || 0;
        gameState.inventory = parsedData.inventory || [];
        gameState.questLog = parsedData.questLog || [];
        gameState.completedQuests = new Set(parsedData.completedQuests || []);
        gameState.hintsUsed = parsedData.hintsUsed || 0;
        updateUI();
        updateStats();
        updateStory("Permainan dimuat ulang!");
    }
}

function resetGame() {
    if (confirm('Apakah kamu yakin ingin mereset permainan? Semua progres akan hilang!')) {
        localStorage.removeItem('hotelRPGSave');
        location.reload();
    }
}

// Toggle Sound
function toggleSound() {
    if (isSoundOn) {
        ambientSound.pause();
        soundToggleBtn.textContent = '🔇 Suara Mati';
    } else {
        ambientSound.play();
        soundToggleBtn.textContent = '🔊 Suara Nyala';
    }
    isSoundOn = !isSoundOn;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);// Random Jumpscare Event
function randomJumpscare() {
    if (gameState.stress > 90 && Math.random() > 0.7) {
        updateStory("💥 SUARA TERBERGAK! Sebuah bayangan muncul di depan kamu, kamu terkejut dan kehilangan 15 HP!");
        gameState.health = Math.max(0, gameState.health - 15);
        updateStats();
    }
}
// Run Away from Hotel
function runAway() {
    updateStory("Kamu berlari secepatnya keluar dari hotel dan kembali ke mobil tim kamu. Kamu selamat dari misteri hotel ini, tapi video investigasimu tidak pernah selesai.");
    updateChoices([
        { text: "Mulai Permainan Baru", action: () => location.reload() }
    ]);
}
