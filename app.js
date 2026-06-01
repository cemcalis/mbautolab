/**
 * ============================================================================
 * MBAUTOLAB - Akıllı Oto Servis Takip Sistemi
 * Core Application Script
 * ============================================================================
 */

// Global Application State
const STATE = {
    vehicles: [],
    currentUser: null, // "Fatih" or "Mustafa"
    currentView: "sec-customer-search",
    activeVehiclePlaka: null,
    tempUploadedPhotos: [], // Base64 compressed images for new service record
    qrScannerInstance: null
};

// Default PIN for Master panel login
const MASTER_PIN = "1234";

// ============================================================================
// DYNAMIC BLUEPRINT/CAD PHOTO GENERATOR FOR MOCK DATA
// ============================================================================
/**
 * Draws a high-tech blueprint (CAD style) of a mechanical part on a canvas
 * and returns it as a compressed Base64 JPEG. Used for beautiful offline mock images.
 */
function generateMockPartImage(partName) {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");

    // 1. Background Grid Vibe (Dark high-tech slate gradient)
    const grad = ctx.createLinearGradient(0, 0, 400, 300);
    grad.addColorStop(0, "#0f172a");
    grad.addColorStop(1, "#1e293b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 300);

    // Draw grid lines
    ctx.strokeStyle = "rgba(0, 162, 232, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x < 400; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 300);
        ctx.stroke();
    }
    for (let y = 0; y < 300; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(400, y);
        ctx.stroke();
    }

    // 2. Outer blueprint frame and markings
    ctx.strokeStyle = "rgba(0, 162, 232, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 10, 380, 280);

    // Crosshairs
    ctx.strokeStyle = "rgba(229, 27, 36, 0.25)";
    ctx.beginPath();
    ctx.moveTo(200, 15); ctx.lineTo(200, 285);
    ctx.moveTo(15, 150); ctx.lineTo(385, 150);
    ctx.stroke();

    // 3. Draw stylized mechanical part based on name
    ctx.strokeStyle = "#00a2e8";
    ctx.fillStyle = "rgba(0, 162, 232, 0.15)";
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(0, 162, 232, 0.5)";

    const lowerPart = partName.toLowerCase();
    
    if (lowerPart.includes("balata") || lowerPart.includes("fren") || lowerPart.includes("disk")) {
        // Draw a brake disc assembly
        ctx.beginPath();
        ctx.arc(200, 150, 65, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();

        // Inner circle
        ctx.beginPath();
        ctx.arc(200, 150, 25, 0, Math.PI * 2);
        ctx.stroke();

        // Brake caliper highlight (Red accent)
        ctx.shadowColor = "rgba(229, 27, 36, 0.5)";
        ctx.strokeStyle = "#e51b24";
        ctx.fillStyle = "rgba(229, 27, 36, 0.2)";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(200, 150, 70, Math.PI * 1.5, Math.PI * 1.9);
        ctx.stroke();
        ctx.fill();

        // Mechanical dimension lines
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(135, 150); ctx.lineTo(120, 150);
        ctx.moveTo(265, 150); ctx.lineTo(280, 150);
        ctx.moveTo(125, 130); ctx.lineTo(125, 170);
        ctx.moveTo(275, 130); ctx.lineTo(275, 170);
        ctx.stroke();
        
    } else if (lowerPart.includes("yağ") || lowerPart.includes("filtre")) {
        // Draw a cylinder oil filter cartridge
        ctx.beginPath();
        ctx.roundRect(140, 70, 120, 140, 10);
        ctx.stroke();
        ctx.fill();

        // Thread top ridge
        ctx.beginPath();
        ctx.rect(170, 50, 60, 20);
        ctx.stroke();

        // Ribs
        ctx.lineWidth = 1.5;
        for (let y = 90; y <= 190; y += 20) {
            ctx.beginPath();
            ctx.moveTo(145, y);
            ctx.lineTo(255, y);
            ctx.stroke();
        }

        // Oil Drop (Red accent)
        ctx.shadowColor = "rgba(229, 27, 36, 0.5)";
        ctx.strokeStyle = "#e51b24";
        ctx.fillStyle = "rgba(229, 27, 36, 0.35)";
        ctx.beginPath();
        ctx.moveTo(200, 125);
        ctx.bezierCurveTo(185, 145, 185, 160, 200, 160);
        ctx.bezierCurveTo(215, 160, 215, 145, 200, 125);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

    } else if (lowerPart.includes("triger") || lowerPart.includes("kayış") || lowerPart.includes("pompa")) {
        // Draw two gears and a timing belt wrapped around them
        ctx.beginPath();
        ctx.arc(150, 150, 35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();

        ctx.beginPath();
        ctx.arc(260, 130, 25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();

        // Outer Belt
        ctx.strokeStyle = "#e51b24";
        ctx.shadowColor = "rgba(229, 27, 36, 0.5)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(150, 112);
        ctx.lineTo(260, 102);
        ctx.arc(260, 130, 28, Math.PI * 1.5, Math.PI * 0.5);
        ctx.lineTo(150, 188);
        ctx.arc(150, 150, 38, Math.PI * 0.5, Math.PI * 1.5);
        ctx.stroke();
    } else {
        // Generic high-tech piston/engine wireframe diagram
        ctx.beginPath();
        ctx.moveTo(150, 80);
        ctx.lineTo(250, 80);
        ctx.lineTo(250, 150);
        ctx.lineTo(220, 220);
        ctx.lineTo(180, 220);
        ctx.lineTo(150, 150);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.beginPath();
        ctx.arc(200, 220, 15, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 4. Blueprint Technical Labels & Brand stamps
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.font = "bold 9px 'Space Grotesk', sans-serif";
    ctx.fillText("CAD MODEL: " + partName.toUpperCase(), 20, 25);
    ctx.fillText("MBAUTOLAB APPROVED COMPONENT", 20, 280);

    ctx.fillStyle = "rgba(0, 162, 232, 0.6)";
    ctx.font = "9px 'Outfit', sans-serif";
    ctx.fillText("SCALE: 1:1.25", 310, 25);
    ctx.fillText("UNIT: MM", 310, 37);

    // M-Stripe Stamp in corner
    ctx.fillStyle = "#00a2e8"; ctx.fillRect(345, 270, 10, 12);
    ctx.fillStyle = "#003a94"; ctx.fillRect(357, 270, 10, 12);
    ctx.fillStyle = "#e51b24"; ctx.fillRect(369, 270, 10, 12);

    return canvas.toDataURL("image/jpeg", 0.8);
}

// ============================================================================
// INITIAL MOCK DATA SEEDING
// ============================================================================
const DEFAULT_VEHICLES = [
    {
        id: "34MBA99",
        plate: "34 MBA 99",
        brand: "BMW M5 Sedan (F90)",
        owner: "Cem Yılmaz",
        phone: "0532 555 3499",
        status: "teslim",
        lastUpdated: "31.05.2026 11:30",
        records: [
            {
                date: "31.05.2026 11:30",
                km: 120540,
                desc: "120.000 KM periyodik bakımı yapıldı. Liqui Moly 5W-30 motor yağı, yağ filtresi, hava filtresi ve polen filtresi yenilendi. Yağ sızıntıları kontrol edildi.",
                parts: ["Motor Yağı", "Yağ Filtresi", "Hava Filtresi", "Polen Filtresi"],
                master: "Fatih",
                photos: [generateMockPartImage("Yağ Filtresi"), generateMockPartImage("Hava Filtresi")]
            },
            {
                date: "15.02.2026 15:45",
                km: 114200,
                desc: "Ön ve arka fren balataları Brembo marka balatalar ile komple değiştirildi. Fren disklerinin torna işlemi gerçekleştirildi, fren hidroliği (Dot 4) tamamen yenilendi.",
                parts: ["Ön Fren Balataları", "Arka Fren Balataları", "Fren Hidroliği"],
                master: "Fatih",
                photos: [generateMockPartImage("Brembo Fren Balatası")]
            }
        ]
    },
    {
        id: "34AUT45",
        plate: "34 AUT 45",
        brand: "Audi A6 Avant 2.0 TDI",
        owner: "Mustafa Koç",
        phone: "0542 444 4545",
        status: "hazir",
        lastUpdated: "30.05.2026 16:20",
        records: [
            {
                date: "30.05.2026 16:20",
                km: 94800,
                desc: "Şanzıman yağı (DSG) ve şanzıman filtresi orijinal set ile değiştirildi. Bilgisayarlı arıza teşhisi (Odis) yapıldı, tüm adaptasyonlar tamamlandı ve hata kodları silindi. Yol testi yapıldı.",
                parts: ["Şanzıman Yağı", "Şanzıman Filtresi"],
                master: "Mustafa",
                photos: [generateMockPartImage("Şanzıman Yağı Filtresi")]
            },
            {
                date: "20.10.2025 10:00",
                km: 80100,
                desc: "Ağır bakım kapsamında triger kayış seti (Gates) ve devirdaim su pompası değiştirildi. Organik kırmızı antifriz yenilendi.",
                parts: ["Triger Kayışı Seti", "Devirdaim Pompası", "Kırmızı Antifriz"],
                master: "Mustafa",
                photos: [generateMockPartImage("Triger Seti"), generateMockPartImage("Devirdaim Pompası")]
            }
        ]
    },
    {
        id: "06LAB10",
        plate: "06 LAB 10",
        brand: "Mercedes-Benz C200d W205",
        owner: "Ahmet Hakan",
        phone: "0505 111 1010",
        status: "bakimda",
        lastUpdated: "31.05.2026 09:15",
        records: [
            {
                date: "31.05.2026 09:15",
                km: 165000,
                desc: "Araçta tekleme ve çekiş kaybı şikayeti vardı. Yapılan incelemelerde turbo intercooler hortumunda yırtık tespit edildi, yenisi sipariş edildi. Ayrıca enjektörlerin pulları sökülüp temizlendi.",
                parts: ["Turbo Hortumu", "Enjektör Pulları"],
                master: "Fatih",
                photos: [generateMockPartImage("Turbo Intercooler Hortumu")]
            }
        ]
    }
];

// ============================================================================
// LOCAL STORAGE DATABASE LAYER
// ============================================================================
function loadDatabase() {
    const data = localStorage.getItem("mbautolab_db");
    if (data) {
        try {
            STATE.vehicles = JSON.parse(data);
        } catch (e) {
            console.error("Database parse error, reloading default seeds.", e);
            STATE.vehicles = [...DEFAULT_VEHICLES];
            saveDatabase();
        }
    } else {
        // First-time startup initialization
        STATE.vehicles = [...DEFAULT_VEHICLES];
        saveDatabase();
    }
}

function saveDatabase() {
    localStorage.setItem("mbautolab_db", JSON.stringify(STATE.vehicles));
}

// ============================================================================
// SINGLE PAGE APPLICATION (SPA) ROUTER
// ============================================================================
function navigateTo(sectionId) {
    // Hide all active sections
    document.querySelectorAll(".app-section").forEach(sec => {
        sec.classList.remove("active");
    });
    
    // Stop QR Scanner if running and we leave the scanning view / trigger sections
    if (sectionId !== "qr-scanner-active" && STATE.qrScannerInstance) {
        stopQRScanner();
    }

    // Toggle active section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add("active");
        STATE.currentView = sectionId;
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Sync Master Panel specific view elements if navigated
    if (sectionId === "sec-master-panel") {
        renderMasterPanel();
    }
}

/**
 * Smart URL Parameter Router
 * Checks if the URL has ?plaka=... and routes accordingly.
 * If a master is logged in, QR scan immediately prompts the "Update Service Record" modal!
 */
function handleUrlRouting() {
    const params = new URLSearchParams(window.location.search);
    const plakaParam = params.get("plaka") || params.get("p");
    
    if (plakaParam) {
        const cleanPlaka = formatPlate(plakaParam);
        const vehicle = findVehicleByPlate(cleanPlaka);
        
        if (vehicle) {
            // Clean up the URL so back actions behave correctly, keeping param inside session
            window.history.replaceState({}, document.title, window.location.pathname);
            
            if (STATE.currentUser) {
                // Usta is logged in: direct to master panel and trigger update modal
                navigateTo("sec-master-panel");
                openUpdateModal(vehicle.id);
            } else {
                // Customer scanning: show detailed vehicle history
                showVehicleDetails(vehicle);
            }
        } else {
            alert(`Plaka Bulunamadı: ${cleanPlaka}. Lütfen usta panelinden kayıt oluşturulduğundan emin olun.`);
        }
    }
}

// ============================================================================
// CUSTOMER SIDE LOGIC (PLATE SEARCH & VIEWS)
// ============================================================================
function findVehicleByPlate(plate) {
    const cleanInput = formatPlate(plate).replace(/\s+/g, "");
    return STATE.vehicles.find(v => v.plate.replace(/\s+/g, "") === cleanInput || v.id === cleanInput);
}

function formatPlate(val) {
    if (!val) return "";
    return val.toString().toUpperCase().trim().replace(/[^A-Z0-9\s]/g, "");
}

function executePlateSearch() {
    const inputField = document.getElementById("input-search-plate");
    const rawVal = inputField.value;
    if (!rawVal) {
        alert("Lütfen geçerli bir araç plakası girin!");
        return;
    }

    const vehicle = findVehicleByPlate(rawVal);
    if (vehicle) {
        showVehicleDetails(vehicle);
    } else {
        alert(`Kayıtlı Plaka Bulunamadı: "${formatPlate(rawVal)}"\nMBAUTOLAB'da kayıtlı değil veya hatalı plaka girdiniz. Lütfen ustalarımızla iletişime geçin.`);
    }
}

function showVehicleDetails(vehicle) {
    STATE.activeVehiclePlaka = vehicle.plate;
    
    // Set UI Header Info
    document.getElementById("detail-plate-badge").textContent = vehicle.plate;
    document.getElementById("detail-brand-model").textContent = vehicle.brand;
    document.getElementById("detail-owner").textContent = vehicle.owner;
    document.getElementById("detail-owner-phone").textContent = maskPhoneNumber(vehicle.phone);
    document.getElementById("detail-last-updated").textContent = vehicle.lastUpdated || "Yeni Kayıt";

    // Set Status Badge classes
    const badge = document.getElementById("detail-status-badge");
    badge.textContent = getStatusText(vehicle.status);
    badge.className = `vehicle-status-badge badge-${vehicle.status}`;

    // Update Step Tracker Progress dots
    updateProgressSteps(vehicle.status);

    // Build timeline lists dynamically
    renderTimeline(vehicle.records);

    // Dynamic QR code generation for vehicle details page
    generateVehicleQR(vehicle);

    // View Switching
    navigateTo("sec-customer-detail");
}

function maskPhoneNumber(phone) {
    if (!phone) return "***";
    const cleaned = phone.replace(/\s+/g, "");
    if (cleaned.length < 7) return cleaned;
    // Show first 4 characters and last 2
    return cleaned.slice(0, 4) + " *** ** " + cleaned.slice(-2);
}

function getStatusText(status) {
    const statusMap = {
        "sirada": "Sırada / Beklemede",
        "bakimda": "Bakımda / İşlem Yapılıyor",
        "test": "Test Sürüşünde",
        "hazir": "Teslim Edilmeye Hazır",
        "teslim": "Müşteriye Teslim Edildi"
    };
    return statusMap[status] || "Aktif";
}

function updateProgressSteps(status) {
    const steps = ["sirada", "bakimda", "test", "hazir", "teslim"];
    const activeIndex = steps.indexOf(status);

    document.querySelectorAll(".progress-steps .step").forEach((stepEl, index) => {
        const stepName = stepEl.getAttribute("data-step");
        
        stepEl.classList.remove("active", "completed");
        
        if (index === activeIndex) {
            stepEl.classList.add("active");
        } else if (index < activeIndex) {
            stepEl.classList.add("completed");
        }
    });
}

function renderTimeline(records) {
    const listContainer = document.getElementById("timeline-list");
    listContainer.innerHTML = "";

    if (!records || records.length === 0) {
        listContainer.innerHTML = `<div class="card text-center text-muted">Henüz servis geçmişi bulunmamaktadır.</div>`;
        return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "timeline-list";

    records.forEach(rec => {
        const item = document.createElement("div");
        item.className = "timeline-item";

        // Dot
        const dot = document.createElement("div");
        dot.className = "timeline-dot";
        item.appendChild(dot);

        // Core timeline card
        const card = document.createElement("div");
        card.className = "timeline-card";

        // Header info
        const header = document.createElement("div");
        header.className = "timeline-header";
        
        const dateBlock = document.createElement("div");
        dateBlock.className = "timeline-date-km";
        dateBlock.innerHTML = `
            <span class="timeline-date">${rec.date}</span>
            <span class="timeline-km"><i class="fa-solid fa-gauge-high"></i> ${rec.km.toLocaleString("tr-TR")} KM</span>
        `;
        header.appendChild(dateBlock);

        const masterBadge = document.createElement("div");
        masterBadge.className = "timeline-master-badge";
        masterBadge.innerHTML = `<i class="fa-solid fa-user-nut"></i> ${rec.master} Usta`;
        header.appendChild(masterBadge);
        
        card.appendChild(header);

        // Description text
        const desc = document.createElement("p");
        desc.className = "timeline-desc";
        desc.textContent = rec.desc;
        card.appendChild(desc);

        // Replaced Parts badges
        if (rec.parts && rec.parts.length > 0 && rec.parts[0] !== "") {
            const partsBlock = document.createElement("div");
            partsBlock.className = "timeline-parts";
            partsBlock.innerHTML = `<span class="parts-label">Değişen Parçalar:</span>`;
            
            const tags = document.createElement("div");
            tags.className = "parts-tags";
            rec.parts.forEach(p => {
                const tag = document.createElement("span");
                tag.className = "part-tag";
                tag.textContent = p.trim();
                tags.appendChild(tag);
            });
            partsBlock.appendChild(tags);
            card.appendChild(partsBlock);
        }

        // Photo Gallery
        if (rec.photos && rec.photos.length > 0) {
            const galleryBlock = document.createElement("div");
            galleryBlock.className = "timeline-gallery";
            
            const grid = document.createElement("div");
            grid.className = "gallery-grid";
            
            rec.photos.forEach(imgData => {
                const gridItem = document.createElement("div");
                gridItem.className = "gallery-item";
                gridItem.innerHTML = `<img src="${imgData}" alt="Parça Görseli">`;
                
                // Clicking triggers full screen overlay viewing
                gridItem.addEventListener("click", () => {
                    openPhotoViewerModal(imgData, rec.date);
                });
                
                grid.appendChild(gridItem);
            });
            
            galleryBlock.appendChild(grid);
            card.appendChild(galleryBlock);
        }

        item.appendChild(card);
        wrapper.appendChild(item);
    });

    listContainer.appendChild(wrapper);
}

// Fullscreen photo zoom preview overlay
function openPhotoViewerModal(imgSrc, titleText) {
    const viewer = document.createElement("div");
    viewer.className = "modal-overlay active";
    viewer.style.zIndex = 2000;
    viewer.style.cursor = "zoom-out";
    
    viewer.innerHTML = `
        <div style="max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px;">
            <img src="${imgSrc}" style="max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: 8px; border: 2.5px solid rgba(255,255,255,0.25); box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
            <div style="color: #ffffff; font-family: 'Space Grotesk', sans-serif; font-size: 1rem; font-weight: bold; background: rgba(0,0,0,0.6); padding: 8px 16px; border-radius: 20px;">
                ${titleText} Tarihli Parça Görseli (MBAUTOLAB)
            </div>
        </div>
    `;
    
    viewer.addEventListener("click", () => {
        viewer.remove();
    });
    
    document.body.appendChild(viewer);
}

// Generate printable/downloadable QR Cards
function generateVehicleQR(vehicle) {
    // Determine the absolute landing URL link:
    // e.g. https://domain.com/index.html?plaka=34MBA99
    // Local fallback: window.location.origin + window.location.pathname + "?plaka=" + vehicle.id
    const landingUrl = window.location.origin + window.location.pathname + "?plaka=" + vehicle.id;
    
    // 1. Generate QR Code on Main Detail Page Canvas
    const canvas = document.getElementById("detail-qr-canvas");
    new QRious({
        element: canvas,
        value: landingUrl,
        size: 280,
        background: '#ffffff',
        foreground: '#111827',
        level: 'H'
    });

    // 2. Generate QR Code on Hidden Printable Ticket Canvas
    const printCanvas = document.getElementById("print-qr-canvas");
    new QRious({
        element: printCanvas,
        value: landingUrl,
        size: 320,
        background: '#ffffff',
        foreground: '#000000',
        level: 'H'
    });

    // Sync plaka text onto print card
    document.getElementById("print-plate-badge").textContent = vehicle.plate;
}

// ============================================================================
// USTA (MASTER) AUTH PANEL
// ============================================================================
function handleMasterLogin(e) {
    e.preventDefault();
    const selectMaster = document.getElementById("select-auth-master").value;
    const pin = document.getElementById("input-auth-pin").value;
    const errorBanner = document.getElementById("auth-error-msg");

    if (pin === MASTER_PIN) {
        errorBanner.classList.add("hidden");
        STATE.currentUser = selectMaster;
        
        // Save session in sessionStorage so refreshing doesn't log them out immediately
        sessionStorage.setItem("mbautolab_master", selectMaster);

        // Update UI styling for login button
        const loginBtn = document.getElementById("nav-master-btn");
        loginBtn.innerHTML = `<i class="fa-solid fa-user-lock"></i> <span class="btn-text">${selectMaster} Usta</span>`;
        loginBtn.className = "btn btn-accent btn-icon-only";

        document.getElementById("input-auth-pin").value = "";
        navigateTo("sec-master-panel");
    } else {
        errorBanner.classList.remove("hidden");
        document.getElementById("input-auth-pin").value = "";
        document.getElementById("input-auth-pin").focus();
    }
}

function handleMasterLogout() {
    STATE.currentUser = null;
    sessionStorage.removeItem("mbautolab_master");

    const loginBtn = document.getElementById("nav-master-btn");
    loginBtn.innerHTML = `<i class="fa-solid fa-user-gear"></i> <span class="btn-text">Usta Paneli</span>`;
    loginBtn.className = "btn btn-secondary btn-icon-only";

    navigateTo("sec-customer-search");
}

// ============================================================================
// MASTER WORKSPACE & VEHICLE MANAGEMENT
// ============================================================================
function renderMasterPanel() {
    // 1. Update Title header banner
    document.getElementById("master-panel-title").textContent = `Hoş Geldiniz, ${STATE.currentUser} Usta`;

    // 2. Count active vehicles currently in shop (all statuses except 'teslim')
    const activeCount = STATE.vehicles.filter(v => v.status !== "teslim").length;
    document.getElementById("count-active-cars").textContent = activeCount;

    // 3. Render Vehicle Lists with Search filters
    const searchVal = document.getElementById("input-master-search").value.toLowerCase();
    const listGrid = document.getElementById("master-vehicles-list");
    listGrid.innerHTML = "";

    const filtered = STATE.vehicles.filter(v => {
        return v.plate.toLowerCase().includes(searchVal) ||
               v.brand.toLowerCase().includes(searchVal) ||
               v.owner.toLowerCase().includes(searchVal);
    });

    if (filtered.length === 0) {
        listGrid.innerHTML = `<div class="card text-center text-muted" style="grid-column: 1 / -1;">Filtreye uygun araç kaydı bulunamadı.</div>`;
        return;
    }

    filtered.forEach(v => {
        const vCard = document.createElement("div");
        vCard.className = "card vehicle-card-master";

        // M-Stripe indicators styling dynamically
        vCard.innerHTML = `
            <div class="vm-header">
                <span class="license-plate-badge">${v.plate}</span>
                <span class="vehicle-status-badge badge-${v.status}">${getStatusText(v.status)}</span>
            </div>
            
            <div class="vm-details">
                <div class="vm-detail-row"><span>Marka / Model:</span> <strong>${v.brand}</strong></div>
                <div class="vm-detail-row"><span>Müşteri:</span> <strong>${v.owner}</strong></div>
                <div class="vm-detail-row"><span>Son Tarih:</span> <strong>${v.lastUpdated || "Yeni Kayıt"}</strong></div>
            </div>

            <div class="vm-actions">
                <button class="btn btn-secondary btn-sm btn-update-vehicle" data-id="${v.id}">
                    <i class="fa-solid fa-wrench"></i> Servis Ekle
                </button>
                <button class="btn btn-primary btn-sm btn-view-vehicle" data-id="${v.id}">
                    <i class="fa-solid fa-eye"></i> Müşteriye Göster / QR
                </button>
            </div>
        `;

        listGrid.appendChild(vCard);
    });

    // Wire up events inside lists
    listGrid.querySelectorAll(".btn-update-vehicle").forEach(btn => {
        btn.addEventListener("click", () => {
            openUpdateModal(btn.getAttribute("data-id"));
        });
    });
    listGrid.querySelectorAll(".btn-view-vehicle").forEach(btn => {
        btn.addEventListener("click", () => {
            const v = STATE.vehicles.find(x => x.id === btn.getAttribute("data-id"));
            if (v) showVehicleDetails(v);
        });
    });
}

function handleCreateVehicle(e) {
    e.preventDefault();

    const plateVal = formatPlate(document.getElementById("create-plate").value);
    const cleanId = plateVal.replace(/\s+/g, "");

    // Verify duplication
    if (STATE.vehicles.some(v => v.id === cleanId)) {
        alert("Bu plakalı araç zaten sistemde kayıtlı! Hızlıca servis geçmişi eklemek için listeden güncelleyin.");
        return;
    }

    const brand = document.getElementById("create-brand").value;
    const owner = document.getElementById("create-owner").value;
    const phone = document.getElementById("create-phone").value;
    const status = document.getElementById("create-status").value;
    const initialNotes = document.getElementById("create-notes").value || "İlk kayıt oluşturuldu.";

    const nowStr = getFormattedDate();

    // Create new structured vehicle model
    const newVehicle = {
        id: cleanId,
        plate: plateVal,
        brand: brand,
        owner: owner,
        phone: phone,
        status: status,
        lastUpdated: nowStr,
        records: [
            {
                date: nowStr,
                km: 0,
                desc: initialNotes,
                parts: [],
                master: STATE.currentUser || "Fatih",
                photos: []
            }
        ]
    };

    STATE.vehicles.unshift(newVehicle); // Insert at beginning of list
    saveDatabase();

    alert(`Araç (${plateVal}) başarıyla kaydedildi! Dinamik QR kod oluşturuldu.`);

    // Reset forms and navigate to vehicles list
    document.getElementById("form-create-vehicle").reset();
    
    // Switch Active Tabs inside master portal back to Vehicles List tab
    const listTabBtn = document.querySelector('.tab-btn[data-target="tab-vehicles-list"]');
    if (listTabBtn) listTabBtn.click();
    
    renderMasterPanel();
}

// Helper to construct current localized date & clock representation
function getFormattedDate() {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

// ============================================================================
// SERVICE RECORD UPDATE & PHOTO HANDLING
// ============================================================================
function openUpdateModal(vehicleId) {
    const vehicle = STATE.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    // Reset temporary states
    STATE.tempUploadedPhotos = [];

    // Map properties to form elements
    document.getElementById("update-vehicle-id").value = vehicle.id;
    document.getElementById("update-vehicle-summary").textContent = `${vehicle.plate} - ${vehicle.brand}`;
    document.getElementById("update-status").value = vehicle.status;
    
    // Fetch last mileage to preset
    const lastRecord = vehicle.records[0];
    document.getElementById("update-km").value = lastRecord ? lastRecord.km : "";
    document.getElementById("update-desc").value = "";
    document.getElementById("update-parts").value = "";

    // Clear and preset photo uploads view container
    resetPhotoUploadPreview();

    // Show modal
    document.getElementById("modal-service-update").classList.add("active");
}

function closeUpdateModal() {
    document.getElementById("modal-service-update").classList.remove("active");
    STATE.tempUploadedPhotos = [];
}

function resetPhotoUploadPreview() {
    const grid = document.getElementById("update-photo-preview-grid");
    // Remove all previous thumbnails keeping only the file input label btn
    const uploadLabel = document.getElementById("btn-trigger-file-input");
    grid.innerHTML = "";
    grid.appendChild(uploadLabel);
}

/**
 * Mobile-optimizing client-side photo processing pipeline
 * Compresses incoming camera snaps down to ~15KB JPEG.
 */
function handlePhotoSelection(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const grid = document.getElementById("update-photo-preview-grid");

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(evt) {
            const img = new Image();
            img.onload = function() {
                // Downscale photo sizes: standard ratio 4:3 fit, max dimensions 400x300
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                const maxDim = 400;

                if (width > height) {
                    if (width > maxDim) {
                        height = Math.round(height * (maxDim / width));
                        width = maxDim;
                    }
                } else {
                    if (height > maxDim) {
                        width = Math.round(width * (maxDim / height));
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                // Export as compressed Base64 JPEG (Quality level 0.65 yields extremely compact size!)
                const compressedBase64 = canvas.toDataURL("image/jpeg", 0.65);
                STATE.tempUploadedPhotos.push(compressedBase64);

                // Add Thumbnail image node to master UI preview grid
                const thumb = document.createElement("div");
                thumb.className = "preview-thumb";
                thumb.innerHTML = `
                    <img src="${compressedBase64}" alt="Önizleme">
                    <button type="button" class="btn-remove-preview">&times;</button>
                `;

                // Wire up removal click event
                thumb.querySelector(".btn-remove-preview").addEventListener("click", () => {
                    const idx = STATE.tempUploadedPhotos.indexOf(compressedBase64);
                    if (idx > -1) STATE.tempUploadedPhotos.splice(idx, 1);
                    thumb.remove();
                });

                grid.insertBefore(thumb, document.getElementById("btn-trigger-file-input"));
            };
            img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Reset input value to allow selecting same file twice if needed
    e.target.value = "";
}

function handleServiceUpdateSubmit(e) {
    e.preventDefault();

    const vehicleId = document.getElementById("update-vehicle-id").value;
    const vehicle = STATE.vehicles.find(v => v.id === vehicleId);
    
    if (!vehicle) {
        alert("Araç verisi bulunamadı!");
        return;
    }

    const status = document.getElementById("update-status").value;
    const km = parseInt(document.getElementById("update-km").value) || 0;
    const desc = document.getElementById("update-desc").value;
    
    // Parse comma-separated parts
    const partsRaw = document.getElementById("update-parts").value;
    const parts = partsRaw ? partsRaw.split(",").map(p => p.trim()).filter(p => p !== "") : [];

    const nowStr = getFormattedDate();

    // Verify kilometer hasn't dropped backwards
    const lastRecord = vehicle.records[0];
    if (lastRecord && km < lastRecord.km) {
        if (!confirm(`Girilen kilometre (${km} KM) önceki kayıttan (${lastRecord.km} KM) düşüktür. Devam etmek istiyor musunuz?`)) {
            return;
        }
    }

    // Build the new service update record node
    const newRecord = {
        date: nowStr,
        km: km,
        desc: desc,
        parts: parts,
        master: STATE.currentUser || "Fatih",
        photos: [...STATE.tempUploadedPhotos]
    };

    // Update parent vehicle
    vehicle.status = status;
    vehicle.lastUpdated = nowStr;
    vehicle.records.unshift(newRecord); // Insert at beginning of timeline

    saveDatabase();
    closeUpdateModal();
    renderMasterPanel();
    
    alert(`${vehicle.plate} plakalı aracın servis bilgisi güncellendi!`);
}

// ============================================================================
// CAMERA QR SCANNER INTEGRATION (HTML5-QRCode)
// ============================================================================
function openQRScanner(isUstaScanner = false) {
    const feedback = document.getElementById("qr-scanner-feedback");
    feedback.textContent = "Kamera erişim izinleri isteniyor...";
    
    // Show scanner overlay modal
    document.getElementById("modal-qr-scanner").classList.add("active");

    // Initialize HTML5 QR Reader instance
    // Use the viewport div ID: qr-camera-reader
    STATE.qrScannerInstance = new Html5Qrcode("qr-camera-reader");

    const config = {
        fps: 10,
        qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
        },
        aspectRatio: 1.0
    };

    // Camera startup logic
    STATE.qrScannerInstance.start(
        { facingMode: "environment" }, // Prefer back camera on mobile
        config,
        (decodedText) => {
            // SUCCESS SCAN CALLBACK!
            feedback.textContent = "QR Kod Okundu!";
            stopQRScanner();
            processDecodedQR(decodedText, isUstaScanner);
        },
        (errorMessage) => {
            // Ignore noise scan errors, just logging occasionally
            feedback.textContent = "QR aranıyor... Lütfen kamerayı sabit tutun.";
        }
    ).catch(err => {
        console.error("Camera startup fail.", err);
        feedback.textContent = "Kamera başlatılamadı! Lütfen izin verdiğinizden emin olun.";
    });
}

function stopQRScanner() {
    if (STATE.qrScannerInstance) {
        STATE.qrScannerInstance.stop().then(() => {
            STATE.qrScannerInstance = null;
            document.getElementById("modal-qr-scanner").classList.remove("active");
        }).catch(err => {
            console.error("Stop scanner error", err);
            STATE.qrScannerInstance = null;
            document.getElementById("modal-qr-scanner").classList.remove("active");
        });
    } else {
        document.getElementById("modal-qr-scanner").classList.remove("active");
    }
}

/**
 * Parses scanned QR text, identifies target plate numbers,
 * and navigates dynamically based on active user role.
 */
function processDecodedQR(decodedText, isUstaScanner) {
    // Decoded text can be a URL like: https://hostname/index.html?plaka=34MBA99
    // or just a raw plate number. Let's write a robust extraction regex!
    let targetPlate = decodedText.trim();
    
    try {
        const urlObj = new URL(decodedText);
        const params = new URLSearchParams(urlObj.search);
        targetPlate = params.get("plaka") || params.get("p") || decodedText;
    } catch (e) {
        // Not a URL, proceed as raw string
    }

    const cleanPlate = formatPlate(targetPlate);
    const vehicle = findVehicleByPlate(cleanPlate);

    if (vehicle) {
        // Decide navigation pathway:
        if (isUstaScanner || STATE.currentUser) {
            // Master Scanning: auto login verification -> open update record card!
            if (!STATE.currentUser) {
                // If not authenticated, force them to select user
                alert("QR Başarıyla okundu. İşleme devam etmek için lütfen Usta şifrenizi girerek giriş yapın.");
                navigateTo("sec-master-auth");
            } else {
                // Already authenticated: trigger update modal instantly
                navigateTo("sec-master-panel");
                openUpdateModal(vehicle.id);
            }
        } else {
            // Customer Scanning: direct timeline display
            showVehicleDetails(vehicle);
        }
    } else {
        alert(`QR Kod Başarıyla Okundu!\nİçerik: "${decodedText}"\nFakat bu plakaya (${cleanPlate}) ait bir araç kaydı MBAUTOLAB veri tabanında bulunamadı!`);
    }
}

// ============================================================================
// EVENT LISTENERS & SETUP
// ============================================================================
function setupEventListeners() {
    
    // 1. Navigation Actions
    document.getElementById("btn-go-home").addEventListener("click", () => {
        navigateTo("sec-customer-search");
    });
    
    document.getElementById("nav-master-btn").addEventListener("click", () => {
        if (STATE.currentUser) {
            navigateTo("sec-master-panel");
        } else {
            navigateTo("sec-master-auth");
        }
    });

    document.getElementById("btn-auth-back").addEventListener("click", () => {
        navigateTo("sec-customer-search");
    });

    document.getElementById("btn-detail-back").addEventListener("click", () => {
        navigateTo("sec-customer-search");
    });

    // 2. Search & Customer Interactions
    document.getElementById("btn-search-plate").addEventListener("click", executePlateSearch);
    
    document.getElementById("input-search-plate").addEventListener("keypress", (e) => {
        if (e.key === "Enter") executePlateSearch();
    });

    // Quick tag clicks on search
    document.querySelectorAll(".tag-link").forEach(tag => {
        tag.addEventListener("click", () => {
            const v = findVehicleByPlate(tag.textContent);
            if (v) showVehicleDetails(v);
        });
    });

    // Integrated QR scanner portals
    document.getElementById("btn-open-scanner").addEventListener("click", () => {
        openQRScanner(false); // Customer scan mode
    });
    
    document.getElementById("btn-master-scanner").addEventListener("click", () => {
        openQRScanner(true); // Master scan mode
    });

    document.getElementById("btn-close-scanner").addEventListener("click", stopQRScanner);
    document.getElementById("btn-stop-scanner").addEventListener("click", stopQRScanner);

    // 3. Print QR Card Trigger
    document.getElementById("btn-print-qr").addEventListener("click", () => {
        window.print();
    });

    // Download QR Code image trigger
    document.getElementById("btn-download-qr").addEventListener("click", () => {
        const canvas = document.getElementById("detail-qr-canvas");
        const link = document.createElement("a");
        link.download = `MBAUTOLAB_QR_${STATE.activeVehiclePlaka.replace(/\s+/g, "_")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    });

    // 4. Master Auth Actions
    document.getElementById("form-master-login").addEventListener("submit", handleMasterLogin);
    document.getElementById("btn-master-logout").addEventListener("click", handleMasterLogout);

    // 5. Master Tab Switching
    document.querySelectorAll(".tabs-header .tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active tabs
            document.querySelectorAll(".tabs-header .tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tabs-content .tab-pane").forEach(p => p.classList.remove("active"));

            // Set new active tab
            btn.classList.add("active");
            const targetId = btn.getAttribute("data-target");
            document.getElementById(targetId).classList.add("active");

            // Stop scanner if leaving scanning/active area if relevant
            renderMasterPanel();
        });
    });

    // 6. Master Add Vehicle & Updates
    document.getElementById("form-create-vehicle").addEventListener("submit", handleCreateVehicle);
    document.getElementById("form-service-update").addEventListener("submit", handleServiceUpdateSubmit);

    // Modal closures
    document.getElementById("btn-close-modal-update").addEventListener("click", closeUpdateModal);
    document.getElementById("btn-cancel-modal-update").addEventListener("click", closeUpdateModal);

    // Photo additions trigger click
    document.getElementById("btn-trigger-file-input").addEventListener("click", () => {
        document.getElementById("input-update-photos").click();
    });
    
    document.getElementById("input-update-photos").addEventListener("change", handlePhotoSelection);

    // Master list search filtering live typing
    document.getElementById("input-master-search").addEventListener("input", renderMasterPanel);

    // 7. Light/Dark Theme Switcher
    const themeBtn = document.getElementById("theme-toggle");
    themeBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const nextTheme = currentTheme === "light" ? "dark" : "light";
        
        document.documentElement.setAttribute("data-theme", nextTheme);
        localStorage.setItem("mbautolab_theme", nextTheme);
    });
}

// Apply pre-selected theme configuration
function applySavedTheme() {
    const savedTheme = localStorage.getItem("mbautolab_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
}

// Restore Master session if already authorized inside current browser window
function restoreMasterSession() {
    const savedMaster = sessionStorage.getItem("mbautolab_master");
    if (savedMaster) {
        STATE.currentUser = savedMaster;
        
        const loginBtn = document.getElementById("nav-master-btn");
        loginBtn.innerHTML = `<i class="fa-solid fa-user-lock"></i> <span class="btn-text">${savedMaster} Usta</span>`;
        loginBtn.className = "btn btn-accent btn-icon-only";
    }
}

// ============================================================================
// SYSTEM INITIALIZATION
// ============================================================================
window.addEventListener("DOMContentLoaded", () => {
    // 1. Restore visual themes and sessions
    applySavedTheme();
    restoreMasterSession();

    // 2. Load LocalStorage Database mock data seeds
    loadDatabase();

    // 3. Register browser UI interactivity click and input observers
    setupEventListeners();

    // 4. Run Smart Parameter URL Router (handles QR redirections)
    handleUrlRouting();
});
