// Game Logic for Hotel Grand Bali Terbengkalai

// Game State
const gameState = {
    isPlaying: false,
    currentScene: "start",
    playerName: "Luna",
    health: 100,
    stress: 0,
    lightLevel: 100,
    inventory: [],
    questLog: [],
    completedQuests: new Set(),
    currentQuest: null,
    playthroughTime: 0,
    hintsUsed: 0,
    craftingRecipes: {
        "Sentuhan Besar + Baterai": "Sentuhan Besar Aktif",
        "Kamera + Baterai": "Kamera Rekaman",
        "Obeng + Paku": "Alat Buka Kunci"
    }
};

// DOM Elements
const storyText = document.getElementById('story-text');
const choicesArea = document.getElementById('choices-area');
const inventoryList = document.getElementById('inventory-list');
const questLog = document.getElementById('quest-log');
const currentQuestEl = document.getElementById('current-quest');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const resetBtn = document.getElementById('reset-btn');
const healthFill = document.getElementById('health-fill');
const stressFill = document.getElementById('stress-fill');
const lightFill = document.getElementById('light-fill');

// Load Quests from quests.txt
let allQuests = [];

// Initialize Game
async function init() {
    // Load quests
    await loadQuests();
    
    // Set default inventory items
    gameState.inventory.push("Kamera Video");
    gameState.inventory.push("Buku Catatan");
    gameState.inventory.push("Kunci Kamar 302");
    gameState.inventory.push("Obeng");
    
    // Check saved game
    if (localStorage.getItem('hotelRPGSave')) {
        loadGame();
    } else {
        startGame();
    }
    
    // Event Listeners
    saveBtn.addEventListener('click', saveGame);
    loadBtn.addEventListener('click', loadGame);
    resetBtn.addEventListener('click', resetGame);
    
    updateUI();
}

// Show Character Customization Screen

// Start Game with Customization

// Load Quests from File
async function loadQuests() {
    try {
        const response = await fetch('./quests.txt');
        const text = await response.text();
        allQuests = text.split('\n').filter(q => q.trim() !== '');
    } catch (error) {
        console.error('Gagal memuat quest: ', error);
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
    const inventoryItems = gameState.inventory.join(", ") || "kosong";
    updateStory(`Kamu membuka tas kamu: ${inventoryItems}.`);
    updateChoices([
        { text: "Gunakan Item", action: () => useSelectedItem() },
        { text: "Crafting Item", action: () => craftItem() },
        { text: "Kunjungi Lounge Hotel", action: () => goToLounge() },
        { text: "Kembali", action: () => enterHotel() }
    ]);
}

// Use Selected Item
function useSelectedItem() {
    if (gameState.inventory.length === 0) {
        updateStory("Tas kamu kosong!");
        updateChoices([{ text: "Kembali", action: () => checkInventory() }]);
        return;
    }
    
    updateStory("Pilih item yang ingin digunakan:");
    const choices = gameState.inventory.map(item => ({
        text: item,
        action: () => useSpecificItem(item)
    }));
    choices.push({ text: "Kembali", action: () => checkInventory() });
    updateChoices(choices);
}

// Use Specific Item
function useSpecificItem(item) {
    if (item === "Sentuhan Besar" && gameState.inventory.includes("Baterai") && !gameState.inventory.includes("Sentuhan Besar Aktif")) {
        updateStory("Kamu menyalakan sentuhan besar dengan baterai! Sekarang kamu bisa melihat di tempat gelap.");
        gameState.inventory.splice(gameState.inventory.indexOf("Sentuhan Besar"), 1);
        addItem("Sentuhan Besar Aktif");
        gameState.lightLevel = Math.min(100, gameState.lightLevel + 50);
    } else if (item === "Kamera" && gameState.inventory.includes("Baterai") && !gameState.inventory.includes("Kamera Rekaman")) {
        updateStory("Kamu menyalakan kamera dengan baterai! Sekarang kamu bisa merekam aktivitas paranormal.");
        gameState.inventory.splice(gameState.inventory.indexOf("Kamera"), 1);
        addItem("Kamera Rekaman");
    } else {
        updateStory(`Kamu menggunakan ${item}, tidak ada efek khusus.`);
    }
    updateUI();
    checkInventory();
}

function addItem(item) {
    if (!gameState.inventory.includes(item)) {
        gameState.inventory.push(item);
    }
    updateUI();
}

// Update Health & Stress & Light Stats
function updateStats() {
    healthFill.style.width = `${gameState.health}%`;
    stressFill.style.width = `${gameState.stress}%`;
    lightFill.style.width = `${gameState.lightLevel}%`;
    
    // Change stress fill color based on level
    if (gameState.stress > 70) {
        stressFill.style.background = 'linear-gradient(90deg, #e94560 0%, #ff9800 100%)';
    } else if (gameState.stress > 40) {
        stressFill.style.background = 'linear-gradient(90deg, #ff9800 0%, #ffeb3b 100%)';
    } else {
        stressFill.style.background = 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)';
    }
    
    // Change light fill color based on level
    if (gameState.lightLevel < 30) {
        lightFill.style.background = 'linear-gradient(90deg, #e94560 0%, #ff9800 100%)';
    } else {
        lightFill.style.background = 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)';
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

// Craft Item System
function craftItem() {
    const availableCrafts = [];
    
    // Check available crafting recipes
    if (gameState.inventory.includes("Sentuhan Besar") && gameState.inventory.includes("Baterai")) {
        availableCrafts.push("Sentuhan Besar + Baterai → Sentuhan Besar Aktif");
    }
    if (gameState.inventory.includes("Kamera") && gameState.inventory.includes("Baterai")) {
        availableCrafts.push("Kamera + Baterai → Kamera Rekaman");
    }
    if (gameState.inventory.includes("Obeng") && gameState.inventory.includes("Paku")) {
        availableCrafts.push("Obeng + Paku → Alat Buka Kunci");
    }
    
    if (availableCrafts.length === 0) {
        updateStory("Kamu tidak memiliki cukup item untuk membuat alat apapun!");
    } else {
        updateStory("📋 Resep Crafting yang Tersedia:");
        availableCrafts.forEach(recipe => {
            updateStory(`- ${recipe}`);
        });
        updateStory("Tulis nama resep yang ingin kamu buat:");
    }
    
    updateChoices([
        { text: "Kembali ke Menu Utama", action: () => enterHotel() }
    ]);
}

// Hotel Lounge Location
function goToLounge() {
    gameState.lightLevel = Math.max(0, gameState.lightLevel - 20);
    updateStats();
    updateStory("Kamu masuk ke lounge hotel yang sudah terbengkalai. Sofa-sofa tua tertutup debu, dan ada meja kopi yang patah di tengah ruangan. Di sudut ruangan, kamu melihat sebuah kotak kayu tertutup rapat.");
    updateChoices([
        { text: "Periksa kotak kayu", action: () => checkLoungeBox() },
        { text: "Cari di sofa untuk menemukan barang", action: () => searchLoungeSofa() },
        { text: "Kembali ke Aula Utama", action: () => enterHotel() }
    ]);
}

// Check Lounge Box
function checkLoungeBox() {
    updateStory("Kamu membuka kotak kayu, di dalamnya ada Baterai dan Paku!");
    addItem("Baterai");
    addItem("Paku");
    updateChoices([
        { text: "Kembali ke Lounge", action: () => goToLounge() }
    ]);
}

// Search Lounge Sofa
function searchLoungeSofa() {
    if (Math.random() > 0.5) {
        updateStory("Kamu mencari di sofa dan menemukan beberapa uang logam dan sebuah buku saku!");
        addItem("Uang Logam");
        addItem("Buku Saku");
    } else {
        updateStory("Kamu mencari di sofa tapi tidak menemukan apa-apa selain debu.");
    }
    updateChoices([
        { text: "Kembali ke Lounge", action: () => goToLounge() }
    ]);
}

// Update Light Level Over Time

// Start light update loop when game starts
