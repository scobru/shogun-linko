document.addEventListener("DOMContentLoaded", () => {
  const shogun = window.SHOGUN_CORE({
    gunOptions: {
      peers: [
        "https://peer.wallie.io/gun",
        "https://v5g5jseqhgkp43lppgregcfbvi.srv.us/gun",
        "https://relay.shogun-eco.xyz/gun",
      ],
      localStorage: true,
      multicast: false,
      radisk: true,
      wire: true,
      rtc: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun.cloudflare.com:3478" },
          { urls: "stun:stun.services.mozilla.com" },
        ],
        dataChannel: { ordered: false, maxRetransmits: 2 },
        sdp: {
          mandatory: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false,
          },
        },
        max: 55, // Max concurrent WebRTC connections
        room: "linkthree-webring", // Shared room for WebRTC discovery
      },
    },
  });

  const gun = shogun.db;

  const editorView = document.getElementById("editor-view");
  const rendererView = document.getElementById("renderer-view");
  const componentsContainer = document.getElementById(
    "components-container"
  );
  let componentIdCounter = 0;
  let currentUser = null;
  let currentPageId = null;
  let allPages = []; // Lista di tutte le pagine create
  let currentPageIndex = -1; // Indice della pagina corrente nella lista

  // --- FUNZIONI DI UTILITY ---

  // Funzione per caricare tutte le pagine dal database usando Shogun Core
  const loadAllPages = () => {
    // Reset the array first
    allPages = [];

    try {
      // Use Shogun Core's database access
      const pagesNode = shogun.db.get("pages");
      pagesNode.map().once((pageData, pageId) => {
        console.log("Loading page:", pageId, pageData);
        // Controlla che i dati della pagina siano validi e non null/vuoti
        if (
          pageData &&
          pageData !== null &&
          typeof pageData === "object" &&
          pageData.title &&
          pageId &&
          Object.keys(pageData).length > 0
        ) {
          allPages.push({
            id: pageId,
            title: pageData.title,
            author: pageData.author,
            createdAt: pageData.createdAt,
            updatedAt: pageData.updatedAt,
          });
          console.log("Added page to array:", pageId);
        }
      });

      // Use a timeout to ensure all pages are loaded before sorting
      setTimeout(() => {
        // Ordina le pagine per data di creazione
        allPages.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        console.log("Final loaded pages:", allPages);
      }, 1000);
    } catch (error) {
      console.error("Error loading pages:", error);
    }
  };

  // Funzione per trovare l'indice della pagina corrente
  const findCurrentPageIndex = (pageId) => {
    return allPages.findIndex((page) => page.id === pageId);
  };

  // Funzione per aggiornare i pulsanti di navigazione
  const updateNavigationButtons = (pageId) => {
    currentPageIndex = findCurrentPageIndex(pageId);
    const prevBtn = document.getElementById("prev-page-btn");
    const nextBtn = document.getElementById("next-page-btn");
    const pageCounter = document.getElementById("page-counter");
    const currentPageNumber = document.getElementById(
      "current-page-number"
    );
    const totalPages = document.getElementById("total-pages");

    if (currentPageIndex === -1) {
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      pageCounter.classList.add("hidden");
      return;
    }

    prevBtn.disabled = currentPageIndex === 0;
    nextBtn.disabled = currentPageIndex === allPages.length - 1;

    // Mostra il contatore delle pagine
    if (allPages.length > 1) {
      pageCounter.classList.remove("hidden");
      currentPageNumber.textContent = currentPageIndex + 1;
      totalPages.textContent = allPages.length;
    } else {
      pageCounter.classList.add("hidden");
    }
  };

  // Funzione per navigare alla pagina precedente
  const navigateToPreviousPage = () => {
    if (currentPageIndex > 0) {
      const prevPage = allPages[currentPageIndex - 1];
      window.location.href = `${window.location.origin}${window.location.pathname}?page=${prevPage.id}`;
    }
  };

  // Funzione per navigare alla pagina successiva
  const navigateToNextPage = () => {
    if (currentPageIndex < allPages.length - 1) {
      const nextPage = allPages[currentPageIndex + 1];
      window.location.href = `${window.location.origin}${window.location.pathname}?page=${nextPage.id}`;
    }
  };

  // Funzione per navigare a una pagina random
  const navigateToRandomPage = () => {
    if (allPages.length === 0) return;

    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * allPages.length);
    } while (randomIndex === currentPageIndex && allPages.length > 1);

    const randomPage = allPages[randomIndex];
    window.location.href = `${window.location.origin}${window.location.pathname}?page=${randomPage.id}`;
  };

  // Funzione per aggiungere un nuovo sito al webring (disabilitata)
  const addSiteToWebring = (pageId, pageTitle) => {
    console.log("Webring functionality disabled:", pageId, pageTitle);
  };

  const createComponentHTML = (type, id, componentId = null) => {
    // Gestione speciale per il componente spazio
    if (type === "spacer") {
      const wrapper = document.createElement("div");
      wrapper.className = "spacer-component";
      wrapper.dataset.id = id;
      wrapper.dataset.type = type;
      wrapper.dataset.componentId = componentId || "";
      wrapper.draggable = true;

      // Aggiungi controlli per lo spazio
      const controls = document.createElement("div");
      controls.className = "component-controls";
      controls.innerHTML = `
        <button class="component-control-btn move-up-btn" title="Sposta su">
          <i class="fas fa-chevron-up"></i>
        </button>
        <button class="component-control-btn move-down-btn" title="Sposta giÃ¹">
          <i class="fas fa-chevron-down"></i>
        </button>
        <button class="component-control-btn remove-component" title="Rimuovi spazio">
          <i class="fas fa-times"></i>
        </button>
      `;
      wrapper.appendChild(controls);

      return wrapper;
    }

    // Gestione speciale per il componente codice
    if (type === "code") {
      const wrapper = document.createElement("div");
      wrapper.className =
        "component-wrapper relative p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200";
      wrapper.dataset.id = id;
      wrapper.dataset.type = type;
      wrapper.dataset.componentId = componentId || "";
      wrapper.draggable = true;

      // Aggiungi controlli
      const controls = document.createElement("div");
      controls.className = "component-controls";
      controls.innerHTML = `
        <button class="component-control-btn move-up-btn" title="Sposta su">
          <i class="fas fa-chevron-up"></i>
        </button>
        <button class="component-control-btn move-down-btn" title="Sposta giÃ¹">
          <i class="fas fa-chevron-down"></i>
        </button>
        <button class="component-control-btn remove-component" title="Rimuovi">
          <i class="fas fa-times"></i>
        </button>
      `;
      wrapper.appendChild(controls);

      // Aggiungi contenuto del componente codice
      const content = document.createElement("div");
      content.innerHTML = `
        <h3 class="text-lg font-semibold mb-3 flex items-center">
          <i class="fas fa-code mr-2 text-blue-600"></i>Componente Codice
        </h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Template</label>
          <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" data-type="template">
            <option value="">Scegli un template...</option>
            <option value="myspace">MySpace Style Profile</option>
            <option value="geocities">GeoCities Blink Tag</option>
            <option value="marquee">Marquee Scrolling Text</option>
            <option value="guestbook">Guestbook Anni '90</option>
            <option value="hitcounter">Hit Counter</option>
            <option value="underconstruction">Under Construction</option>
            <option value="rainbow">Rainbow Text</option>
            <option value="matrix">Matrix Rain</option>
            <option value="custom">Codice Personalizzato</option>
          </select>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">HTML</label>
          <textarea 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" 
            rows="4" 
            placeholder="Inserisci il tuo HTML qui..."
            data-type="html"
          ></textarea>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">CSS</label>
          <textarea 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" 
            rows="4" 
            placeholder="Inserisci il tuo CSS qui..."
            data-type="css"
          ></textarea>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">JavaScript</label>
          <textarea 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" 
            rows="4" 
            placeholder="Inserisci il tuo JavaScript qui..."
            data-type="js"
          ></textarea>
        </div>

        <div class="bg-gray-50 p-3 rounded-lg">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Anteprima:</h4>
          <div class="border border-gray-200 rounded p-3 bg-white min-h-[100px]" data-type="preview">
            <p class="text-gray-500 text-sm">L'anteprima apparirÃ  qui...</p>
          </div>
        </div>
      `;
      wrapper.appendChild(content);

      return wrapper;
    }

    const wrapper = document.createElement("div");
    wrapper.className =
      "component-wrapper relative p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200";
    wrapper.dataset.id = id;
    wrapper.dataset.type = type;
    wrapper.dataset.componentId = componentId || ""; // ID del componente in GunDB
    wrapper.draggable = true; // Abilita drag & drop

    let componentContentHTML = "";
    if (type === "h1") {
      componentContentHTML = `
        <div class="flex items-center gap-2 mb-2">
          <label class="text-xs text-gray-500">Allineamento:</label>
          <select data-type="alignment" class="text-xs border border-gray-200 rounded px-2 py-1">
            <option value="left">Sinistra</option>
            <option value="center" selected>Centro</option>
            <option value="right">Destra</option>
            <option value="justify">Giustificato</option>
          </select>
        </div>
        <div contenteditable="true" placeholder="Scrivi il tuo titolo qui..." data-type="content" class="text-2xl font-semibold text-gray-800 focus:outline-none w-full text-center"></div>
      `;
    } else if (type === "p") {
      componentContentHTML = `
        <div class="flex items-center gap-2 mb-2">
          <label class="text-xs text-gray-500">Allineamento:</label>
          <select data-type="alignment" class="text-xs border border-gray-200 rounded px-2 py-1">
            <option value="left">Sinistra</option>
            <option value="center">Centro</option>
            <option value="right">Destra</option>
            <option value="justify" selected>Giustificato</option>
          </select>
        </div>
        <div contenteditable="true" placeholder="Scrivi il tuo testo qui..." data-type="content" class="text-base text-gray-600 focus:outline-none w-full text-justify"></div>
      `;
    } else if (type === "img") {
      componentContentHTML = `<input type="text" placeholder="Incolla l'URL dell'immagine..." data-type="src" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">`;
    } else if (type === "avatar") {
      const avatarId = `avatar-${id}`;
      const avatarInputId = `avatar-input-${id}`;
      componentContentHTML = `
        <div class="flex flex-col items-center gap-4 text-center">
          <div class="relative">
            <img
              src=""
              alt="Avatar"
              id="${avatarId}"
              class="w-24 h-24 rounded-full border-2 border-gray-300 object-cover cursor-pointer hover:border-gray-400 transition"
              data-type="avatar"
            />
            <input
              type="file"
              accept="image/*"
              id="${avatarInputId}"
              class="hidden"
              data-type="avatar-input"
            />
            <div class="absolute bottom-0 right-0 bg-gray-600 rounded-full p-1.5 cursor-pointer hover:bg-gray-700 transition shadow-md">
              <i class="fas fa-camera text-white text-xs"></i>
            </div>
          </div>
          <div class="flex-1 w-full">
            <div contenteditable="true" placeholder="Il tuo nome" data-type="name" class="text-xl font-semibold text-gray-800 focus:outline-none w-full mb-1 text-center"></div>
            <div contenteditable="true" placeholder="Breve descrizione" data-type="description" class="text-sm text-gray-500 focus:outline-none w-full text-center"></div>
          </div>
        </div>
      `;
    } else if (type === "link") {
      componentContentHTML = `
        <div class="space-y-2">
          <input type="text" placeholder="Titolo del link" data-type="title" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
          <input type="url" placeholder="https://esempio.com" data-type="url" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
          <div class="flex items-center gap-2">
            <label class="text-xs text-gray-500">Icona:</label>
            <select data-type="icon" class="text-xs border border-gray-200 rounded px-2 py-1">
              <option value="">Nessuna</option>
              <option value="fas fa-globe">Globo</option>
              <option value="fab fa-instagram">Instagram</option>
              <option value="fab fa-linkedin">LinkedIn</option>
              <option value="fab fa-youtube">YouTube</option>
              <option value="fab fa-twitter">Twitter</option>
              <option value="fab fa-github">GitHub</option>
              <option value="fas fa-music">Musica</option>
              <option value="fas fa-envelope">Email</option>
            </select>
          </div>
        </div>
      `;
    }

    // Controlli per il riordinamento
    const controlsHTML = `
      <div class="component-controls">
        <button class="component-control-btn move-up-btn" title="Sposta su">
          <i class="fas fa-chevron-up"></i>
        </button>
        <button class="component-control-btn move-down-btn" title="Sposta giÃ¹">
          <i class="fas fa-chevron-down"></i>
        </button>
        <button class="component-control-btn remove-component" title="Rimuovi">
                  <i class="fas fa-times"></i>
              </button>
      </div>
    `;

    wrapper.innerHTML = `
              ${componentContentHTML}
              ${controlsHTML}
          `;
    
    // Aggiungi event listener per l'allineamento
    if (type === "h1" || type === "p") {
      const alignmentSelect = wrapper.querySelector(
        '[data-type="alignment"]'
      );
      const contentDiv = wrapper.querySelector('[data-type="content"]');
      
      if (alignmentSelect && contentDiv) {
        alignmentSelect.addEventListener("change", () => {
          const alignment = alignmentSelect.value;
          // Rimuovi tutte le classi di allineamento esistenti
          contentDiv.classList.remove(
            "text-left",
            "text-center",
            "text-right",
            "text-justify"
          );
          // Aggiungi la nuova classe di allineamento
          contentDiv.classList.add(`text-${alignment}`);
        });
      }
    }
    
    return wrapper;
  };

  // --- SISTEMA DI AUTENTICAZIONE ---
  const showAuthModal = () => {
    const authModal = document.getElementById("auth-modal");
    const authModalContent =
      document.getElementById("auth-modal-content");
    document.getElementById("auth-feedback").textContent = "";
    authModal.classList.remove("hidden");
    setTimeout(() => {
      authModalContent.classList.remove("scale-95", "opacity-0");
    }, 10);
  };

  const hideAuthModal = () => {
    const authModal = document.getElementById("auth-modal");
    const authModalContent =
      document.getElementById("auth-modal-content");
    authModalContent.classList.add("scale-95", "opacity-0");
    setTimeout(() => authModal.classList.add("hidden"), 200);
  };

  const updateUserUI = async (user) => {
    currentUser = user;
    console.log("Updating UI for user:", user);
    if (user && user.sea && user.sea.pub) {
      // Salva la pub in localStorage per persistenza tra tab
      localStorage.setItem("currentUserPub", user.pub || user.sea.pub);
      localStorage.setItem("currentUserAlias", user.alias || "");
      
      document.getElementById("user-info").classList.remove("hidden");
      document.getElementById("login-prompt").classList.add("hidden");
      const displayName =
        user.alias || user.sea.pub.substring(0, 8) + "...";
      document.getElementById(
        "current-user"
      ).textContent = `Ciao, ${displayName}!`;

      document
        .getElementById("renderer-user-info")
        .classList.remove("hidden");
      document.getElementById(
        "renderer-current-user"
      ).textContent = `Ciao, ${displayName}!`;

      // Carica l'avatar se esiste usando Shogun Core
      try {
        await shogun.db.user.get("avatar").once(async (avatarData) => {
          const initials = user.alias
            ? user.alias.substring(0, 2).toUpperCase()
            : "U";
          const defaultAvatar = `data:image/svg+xml,${encodeURIComponent(`
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="#4F46E5"/>
              <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">${initials}</text>
            </svg>
          `)}`;
          
          if (avatarData && avatarData !== null) {
            document.getElementById("user-avatar").src = avatarData;
          } else {
            document.getElementById("user-avatar").src = defaultAvatar;
          }
        });
      } catch (error) {
        console.error("Error loading avatar:", error);
        const initials = user.alias
          ? user.alias.substring(0, 2).toUpperCase()
          : "U";
        const defaultAvatar = `data:image/svg+xml,${encodeURIComponent(`
          <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="#4F46E5"/>
            <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">${initials}</text>
          </svg>
        `)}`;
        document.getElementById("user-avatar").src = defaultAvatar;
      }
    } else {
      // Rimuovi le informazioni dall'localStorage quando non c'Ã¨ utente
      localStorage.removeItem("currentUserPub");
      localStorage.removeItem("currentUserAlias");
      
      document.getElementById("user-info").classList.add("hidden");
      document.getElementById("login-prompt").classList.remove("hidden");
      document
        .getElementById("renderer-user-info")
        .classList.add("hidden");
    }
  };

  const checkAuthentication = (callback) => {
    try {
      if (!shogun.isLoggedIn()) {
        showAuthModal();
        return false;
      }
      if (callback) callback();
      return true;
    } catch (error) {
      console.error("Error checking authentication:", error);
      showAuthModal();
      return false;
    }
  };

  const login = async (username, password) => {
    try {
      console.log("Attempting login with Shogun Core...");
      const result = await shogun.login(username, password);
      console.log("Login result:", result);

      if (result.success) {
        console.log("Login successful:", result.username);
        updateUserUI({
          sea: result.sea,
          alias: result.username,
          pub: result.userPub,
        });
        hideAuthModal();
        return true;
      } else {
        console.error("Login failed:", result.error);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (username, password) => {
    try {
      console.log("Attempting registration with Shogun Core...");
      const result = await shogun.signUp(username, password);
      console.log("Registration result:", result);

      if (result.success) {
        console.log("Registration successful:", result.username);
        updateUserUI({
          sea: result.sea,
          alias: result.username,
          pub: result.userPub,
        });
        hideAuthModal();
        return true;
      } else {
        console.error("Registration failed:", result.error);
        return false;
      }
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = () => {
    try {
      shogun.logout();
      updateUserUI(null);
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
      // Force UI update even if logout fails
      updateUserUI(null);
    }
  };

  // --- LOGICA EDITOR ---
  const addComponent = (type) => {
    const id = componentIdCounter++;
    const componentEl = createComponentHTML(type, id);
    componentsContainer.appendChild(componentEl);

    // Inizializza gli event listeners per gli avatar se necessario
    if (type === "avatar") {
      const avatarId = `avatar-${id}`;
      const avatarInputId = `avatar-input-${id}`;
      handleAvatarUpload(avatarInputId, avatarId);
    }

    // Inizializza gli event listeners per il componente codice
    if (type === "code") {
      const templateSelect = componentEl.querySelector('[data-type="template"]');
      const htmlTextarea = componentEl.querySelector('[data-type="html"]');
      const cssTextarea = componentEl.querySelector('[data-type="css"]');
      const jsTextarea = componentEl.querySelector('[data-type="js"]');

      // Event listener per il template
      templateSelect.addEventListener('change', (e) => {
        if (e.target.value) {
          applyCodeTemplate(componentEl, e.target.value);
        }
      });

      // Event listeners per aggiornare l'anteprima
      [htmlTextarea, cssTextarea, jsTextarea].forEach(textarea => {
        if (textarea) {
          textarea.addEventListener('input', () => {
            updateCodePreview(componentEl);
          });
        }
      });

      // Aggiorna l'anteprima iniziale
      setTimeout(() => updateCodePreview(componentEl), 100);
    }
  };

  document
    .getElementById("add-h1")
    .addEventListener("click", () => addComponent("h1"));
  document
    .getElementById("add-p")
    .addEventListener("click", () => addComponent("p"));
  document
    .getElementById("add-img")
    .addEventListener("click", () => addComponent("img"));
  document
    .getElementById("add-avatar")
    .addEventListener("click", () => addComponent("avatar"));
  document
    .getElementById("add-link")
    .addEventListener("click", () => addComponent("link"));
  document
    .getElementById("add-spacer")
    .addEventListener("click", () => addComponent("spacer"));
  document
    .getElementById("add-code")
    .addEventListener("click", () => addComponent("code"));

  // Template predefiniti per il componente codice - Stile Anni '90
  const codeTemplates = {
    myspace: {
      html: `<div class="myspace-profile">
  <div class="profile-header">
    <h1 class="profile-name">MySpace Profile</h1>
    <div class="mood">Current Mood: <span id="mood">ðŸ˜Ž</span></div>
  </div>
  <div class="profile-content">
    <div class="about-me">
<h2>About Me:</h2>
<p>Hi! I'm a cool person from the internet! ðŸŽµ</p>
<p>I love music, friends, and having fun!</p>
    </div>
    <div class="friends">
<h3>My Friends:</h3>
<div class="friend-list">
  <span class="friend">Tom</span>
  <span class="friend">Sarah</span>
  <span class="friend">Mike</span>
  <span class="friend">+ 127 more</span>
</div>
    </div>
  </div>
</div>`,
      css: `.myspace-profile {
  background: linear-gradient(45deg, #ff00ff, #00ffff, #ffff00);
  background-size: 400% 400%;
  animation: gradientShift 3s ease infinite;
  padding: 20px;
  border: 5px solid #000;
  font-family: 'Comic Sans MS', cursive;
  color: #fff;
  text-shadow: 2px 2px 0px #000;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.profile-header {
  text-align: center;
  margin-bottom: 20px;
}

.profile-name {
  font-size: 2.5em;
  margin: 0;
  text-decoration: underline;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.mood {
  font-size: 1.2em;
  margin-top: 10px;
}

.profile-content {
  background: rgba(0,0,0,0.3);
  padding: 15px;
  border: 2px solid #fff;
}

.about-me h2, .friends h3 {
  color: #ffff00;
  text-decoration: underline;
}

.friend-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.friend {
  background: #ff00ff;
  color: #fff;
  padding: 5px 10px;
  border: 2px solid #000;
  border-radius: 15px;
  font-weight: bold;
}`,
      js: `const moods = ['ðŸ˜Ž', 'ðŸ˜Š', 'ðŸŽµ', 'ðŸ’–', 'ðŸŒŸ', 'ðŸŽ‰', 'ðŸ”¥', 'ðŸ’¯'];
let currentMoodIndex = 0;

function changeMood() {
  currentMoodIndex = (currentMoodIndex + 1) % moods.length;
  document.getElementById('mood').textContent = moods[currentMoodIndex];
}

// Cambia mood ogni 3 secondi
setInterval(changeMood, 3000);

// Cambia mood al click
document.getElementById('mood').addEventListener('click', changeMood);`
    },
    geocities: {
      html: `<div class="geocities-page">
  <h1 class="blink">WELCOME TO MY HOMEPAGE!</h1>
  <div class="visitor-counter">
    <p>You are visitor number: <span id="counter">0000001</span></p>
  </div>
  <div class="content">
    <p class="blink">This page is under construction!</p>
    <p>Please come back soon for updates!</p>
    <div class="spinning-star">â­</div>
  </div>
  <div class="links">
    <a href="#" class="link">My Favorite Links</a>
    <a href="#" class="link">Guestbook</a>
    <a href="#" class="link">Email Me</a>
  </div>
</div>`,
      css: `.geocities-page {
  background: #000080;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  padding: 20px;
  border: 3px solid #00ff00;
  text-align: center;
}

.blink {
  animation: blink 1s infinite;
  color: #ffff00;
  font-weight: bold;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.visitor-counter {
  background: #000;
  border: 2px solid #00ff00;
  padding: 10px;
  margin: 20px 0;
  font-family: 'Courier New', monospace;
}

#counter {
  color: #ff0000;
  font-weight: bold;
  font-size: 1.5em;
}

.spinning-star {
  font-size: 3em;
  animation: spin 2s linear infinite;
  margin: 20px 0;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.links {
  margin-top: 30px;
}

.link {
  color: #00ffff;
  text-decoration: underline;
  margin: 0 10px;
  font-weight: bold;
}

.link:hover {
  color: #ffff00;
  text-decoration: none;
}`,
      js: `let visitorCount = 1;

function updateCounter() {
  const counter = document.getElementById('counter');
  counter.textContent = visitorCount.toString().padStart(7, '0');
  visitorCount++;
}

// Aggiorna il contatore ogni 2 secondi
setInterval(updateCounter, 2000);`
    },
    marquee: {
      html: `<div class="marquee-container">
  <marquee behavior="scroll" direction="left" scrollamount="10">
    <span class="marquee-text">ðŸŒŸ WELCOME TO MY AWESOME WEBSITE! ðŸŒŸ</span>
  </marquee>
  <marquee behavior="scroll" direction="right" scrollamount="8">
    <span class="marquee-text">ðŸŽµ BEST SITE EVER! ðŸŽµ</span>
  </marquee>
  <div class="content">
    <h1>My Cool Page</h1>
    <p>This is the most amazing website you've ever seen!</p>
    <marquee behavior="alternate" direction="up" height="100">
<div class="vertical-text">SCROLLING TEXT IS SO COOL!</div>
    </marquee>
  </div>
</div>`,
      css: `.marquee-container {
  background: linear-gradient(45deg, #ff00ff, #00ffff);
  padding: 20px;
  font-family: 'Arial', sans-serif;
  color: #fff;
  text-shadow: 2px 2px 0px #000;
}

.marquee-text {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0 20px;
}

.content {
  background: rgba(0,0,0,0.5);
  padding: 20px;
  margin: 20px 0;
  border: 3px solid #fff;
}

.content h1 {
  color: #ffff00;
  text-align: center;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.vertical-text {
  font-size: 1.2em;
  font-weight: bold;
  color: #00ff00;
  text-align: center;
  padding: 20px;
}`,
      js: `// Aggiungi piÃ¹ testo al marquee
function addMoreText() {
  const marquees = document.querySelectorAll('marquee');
  marquees.forEach(marquee => {
    const text = marquee.querySelector('.marquee-text');
    if (text) {
text.textContent += ' ðŸŽ‰ AWESOME! ðŸŽ‰';
    }
  });
}

// Aggiungi testo ogni 5 secondi
setInterval(addMoreText, 5000);`
    },
    guestbook: {
      html: `<div class="guestbook">
  <h1 class="title">GUESTBOOK</h1>
  <div class="entries">
    <div class="entry">
<strong>Tom:</strong> <span class="date">12/25/1999</span><br>
Cool site! Keep up the good work! ðŸ˜Ž
    </div>
    <div class="entry">
<strong>Sarah:</strong> <span class="date">12/24/1999</span><br>
Merry Christmas! Your page rocks! ðŸŽ„
    </div>
    <div class="entry">
<strong>Mike:</strong> <span class="date">12/23/1999</span><br>
Awesome graphics! How did you do that? ðŸ¤¯
    </div>
  </div>
  <div class="sign-form">
    <h3>Sign My Guestbook!</h3>
    <input type="text" id="name" placeholder="Your Name" class="input">
    <br><br>
    <textarea id="message" placeholder="Your Message" class="textarea"></textarea>
    <br><br>
    <button id="sign-btn" class="sign-btn">Sign Guestbook</button>
  </div>
</div>`,
      css: `.guestbook {
  background: #000080;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  padding: 20px;
  border: 3px solid #00ff00;
}

.title {
  text-align: center;
  color: #ffff00;
  font-size: 2em;
  animation: blink 1s infinite;
  text-decoration: underline;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.entries {
  background: #000;
  border: 2px solid #00ff00;
  padding: 15px;
  margin: 20px 0;
}

.entry {
  border-bottom: 1px solid #00ff00;
  padding: 10px 0;
  margin-bottom: 10px;
}

.date {
  color: #00ffff;
  font-size: 0.9em;
}

.sign-form {
  background: #000;
  border: 2px solid #00ff00;
  padding: 15px;
  margin-top: 20px;
}

.sign-form h3 {
  color: #ffff00;
  text-align: center;
}

.input, .textarea {
  background: #000;
  color: #00ff00;
  border: 2px solid #00ff00;
  padding: 5px;
  font-family: 'Courier New', monospace;
  width: 100%;
}

.sign-btn {
  background: #ff0000;
  color: #fff;
  border: 2px solid #fff;
  padding: 10px 20px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  cursor: pointer;
}

.sign-btn:hover {
  background: #ffff00;
  color: #000;
}`,
      js: `document.getElementById('sign-btn').addEventListener('click', function() {
  const name = document.getElementById('name').value;
  const message = document.getElementById('message').value;
  
  if (name && message) {
    const entries = document.querySelector('.entries');
    const newEntry = document.createElement('div');
    newEntry.className = 'entry';
    
    const today = new Date();
    const dateStr = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
    
    newEntry.innerHTML = '<strong>' + name + ':</strong> <span class="date">' + dateStr + '</span><br>' + message;
    
    entries.insertBefore(newEntry, entries.firstChild);
    
    // Pulisci i campi
    document.getElementById('name').value = '';
    document.getElementById('message').value = '';
    
    // Effetto blink per il nuovo entry
    newEntry.style.animation = 'blink 0.5s 3';
  }
});`
    },
    hitcounter: {
      html: `<div class="hitcounter">
  <div class="counter-display">
    <div class="digits">
<span class="digit">0</span>
<span class="digit">0</span>
<span class="digit">0</span>
<span class="digit">0</span>
<span class="digit">0</span>
<span class="digit">0</span>
<span class="digit">1</span>
    </div>
  </div>
  <div class="counter-label">HITS</div>
  <div class="spinning-gear">âš™ï¸</div>
</div>`,
      css: `.hitcounter {
  background: linear-gradient(45deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff);
  background-size: 400% 400%;
  animation: rainbow 2s ease infinite;
  padding: 20px;
  text-align: center;
  border: 5px solid #000;
  font-family: 'Arial', sans-serif;
}

@keyframes rainbow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.counter-display {
  background: #000;
  border: 3px solid #fff;
  padding: 10px;
  margin: 10px 0;
  display: inline-block;
}

.digits {
  display: flex;
  gap: 2px;
}

.digit {
  background: #000;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 2em;
  font-weight: bold;
  padding: 5px 10px;
  border: 1px solid #00ff00;
  min-width: 30px;
  text-align: center;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.counter-label {
  color: #fff;
  font-size: 1.5em;
  font-weight: bold;
  text-shadow: 2px 2px 0px #000;
  margin: 10px 0;
}

.spinning-gear {
  font-size: 2em;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`,
      js: `let hitCount = 1;

function updateHitCounter() {
  const digits = document.querySelectorAll('.digit');
  const countStr = hitCount.toString().padStart(7, '0');
  
  for (let i = 0; i < digits.length; i++) {
    digits[i].textContent = countStr[i];
  }
  
  hitCount++;
  
  // Effetto speciale ogni 100 hit
  if (hitCount % 100 === 0) {
    document.querySelector('.hitcounter').style.animation = 'rainbow 0.5s ease 5';
  }
}

// Aggiorna ogni 2 secondi
setInterval(updateHitCounter, 2000);`
    },
    underconstruction: {
      html: `<div class="construction">
  <div class="construction-sign">
    <h1>ðŸš§ UNDER CONSTRUCTION ðŸš§</h1>
    <div class="worker">ðŸ‘·â€â™‚ï¸</div>
    <p>This page is currently being built!</p>
    <p>Please check back soon!</p>
    <div class="progress-bar">
<div class="progress" id="progress"></div>
    </div>
    <p>Progress: <span id="percentage">0%</span></p>
  </div>
  <div class="tools">
    ðŸ”¨ âš’ï¸ ðŸ› ï¸ ðŸ”§ âš™ï¸
  </div>
</div>`,
      css: `.construction {
  background: #ffa500;
  color: #000;
  font-family: 'Arial', sans-serif;
  padding: 30px;
  text-align: center;
  border: 5px solid #000;
  position: relative;
}

.construction-sign {
  background: #ffff00;
  border: 3px solid #000;
  padding: 20px;
  margin: 20px 0;
}

.construction-sign h1 {
  font-size: 2em;
  margin: 0 0 20px 0;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.worker {
  font-size: 3em;
  animation: bounce 1s infinite;
  margin: 20px 0;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.progress-bar {
  background: #000;
  height: 30px;
  border: 2px solid #000;
  margin: 20px 0;
  position: relative;
}

.progress {
  background: #00ff00;
  height: 100%;
  width: 0%;
  transition: width 0.5s ease;
}

.tools {
  font-size: 2em;
  animation: spin 3s linear infinite;
  margin-top: 20px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`,
      js: `let progress = 0;

function updateProgress() {
  progress += Math.random() * 10;
  if (progress > 100) progress = 100;
  
  document.getElementById('progress').style.width = progress + '%';
  document.getElementById('percentage').textContent = Math.round(progress) + '%';
  
  if (progress >= 100) {
    document.querySelector('.construction-sign h1').textContent = 'ðŸŽ‰ CONSTRUCTION COMPLETE! ðŸŽ‰';
    document.querySelector('.worker').textContent = 'ðŸŽŠ';
  }
}

// Aggiorna il progresso ogni secondo
setInterval(updateProgress, 1000);`
    },
    rainbow: {
      html: `<div class="rainbow-container">
  <h1 class="rainbow-text">RAINBOW TEXT IS AWESOME!</h1>
  <p class="rainbow-text">This is so cool and colorful!</p>
  <div class="rainbow-box">
    <p>Look at all these colors!</p>
  </div>
  <div class="sparkles">âœ¨ â­ âœ¨ â­ âœ¨ â­ âœ¨</div>
</div>`,
      css: `.rainbow-container {
  background: #000;
  color: #fff;
  font-family: 'Arial', sans-serif;
  padding: 30px;
  text-align: center;
  border: 5px solid #fff;
}

.rainbow-text {
  font-size: 2em;
  font-weight: bold;
  background: linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: rainbow 2s ease infinite;
  text-shadow: 2px 2px 0px #000;
}

@keyframes rainbow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.rainbow-box {
  background: linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080);
  background-size: 400% 400%;
  animation: rainbow 2s ease infinite;
  padding: 20px;
  margin: 20px 0;
  border: 3px solid #fff;
  color: #000;
  font-weight: bold;
}

.sparkles {
  font-size: 2em;
  animation: sparkle 1s ease infinite;
  margin-top: 20px;
}

@keyframes sparkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}`,
      js: `// Aggiungi piÃ¹ sparkles
function addSparkles() {
  const sparkles = document.querySelector('.sparkles');
  sparkles.textContent += ' âœ¨';
  
  // Limita il numero di sparkles
  if (sparkles.textContent.length > 50) {
    sparkles.textContent = 'âœ¨ â­ âœ¨ â­ âœ¨ â­ âœ¨';
  }
}

// Aggiungi sparkles ogni 3 secondi
setInterval(addSparkles, 3000);`
    },
    matrix: {
      html: `<div class="matrix-container">
  <canvas id="matrix-canvas"></canvas>
  <div class="matrix-text">
    <h1>WELCOME TO THE MATRIX</h1>
    <p>You are the chosen one!</p>
  </div>
</div>`,
      css: `.matrix-container {
  background: #000;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  padding: 20px;
  position: relative;
  border: 2px solid #00ff00;
  overflow: hidden;
}

#matrix-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.matrix-text {
  position: relative;
  z-index: 2;
  text-align: center;
  background: rgba(0,0,0,0.8);
  padding: 20px;
  border: 1px solid #00ff00;
}

.matrix-text h1 {
  font-size: 2em;
  animation: blink 1s infinite;
  text-shadow: 0 0 10px #00ff00;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.matrix-text p {
  font-size: 1.2em;
  margin-top: 20px;
}`,
      js: `const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';
const charArray = chars.split('');

const fontSize = 14;
const columns = canvas.width / fontSize;

const drops = [];
for (let i = 0; i < columns; i++) {
  drops[i] = 1;
}

function drawMatrix() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#00ff00';
  ctx.font = fontSize + 'px monospace';
  
  for (let i = 0; i < drops.length; i++) {
    const text = charArray[Math.floor(Math.random() * charArray.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
drops[i] = 0;
    }
    drops[i]++;
  }
}

setInterval(drawMatrix, 50);`
    }
  };

  // Funzione per aggiornare l'anteprima del codice
  function updateCodePreview(componentEl) {
    const htmlTextarea = componentEl.querySelector('[data-type="html"]');
    const cssTextarea = componentEl.querySelector('[data-type="css"]');
    const jsTextarea = componentEl.querySelector('[data-type="js"]');
    const previewEl = componentEl.querySelector('[data-type="preview"]');
    
    if (!htmlTextarea || !previewEl) return;
    
    const html = htmlTextarea.value;
    const css = cssTextarea ? cssTextarea.value : '';
    let js = jsTextarea ? jsTextarea.value : '';

    // Escapa i backtick nel JavaScript per evitare problemi con i template literals nell'iframe
    js = js.replace(/`/g, '\\`');
    
    // Crea un iframe per l'anteprima sicura
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '200px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    
    // Aspetta che l'iframe sia caricato prima di accedere al documento
    iframe.onload = function() {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (!iframeDoc) {
          console.error('Cannot access iframe document');
          return;
        }
        
        iframeDoc.open();
        
        // Usa document.write per il contenuto base
        iframeDoc.write('<!DOCTYPE html>');
        iframeDoc.write('<html>');
        iframeDoc.write('<head>');
        iframeDoc.write('<style>');
        iframeDoc.write('body { margin: 0; padding: 15px; font-family: "Inter", sans-serif; }');
        iframeDoc.write(css);
        iframeDoc.write('</style>');
        iframeDoc.write('</head>');
        iframeDoc.write('<body>');
        iframeDoc.write(html);
        iframeDoc.write('</body>');
        iframeDoc.write('</html>');
        iframeDoc.close();
        
        // Aggiungi script in modo sicuro usando createElement
        if (js && js.trim()) {
          const script = iframeDoc.createElement('script');
          script.textContent = `try { ${js} } catch(e) { console.error("JS Error:", e); }`;
          iframeDoc.body.appendChild(script);
        }
      } catch (error) {
        console.error('Error setting up iframe content:', error);
      }
    };
    
    // Imposta src vuoto per triggerare onload
    iframe.src = 'about:blank';
    
    previewEl.innerHTML = '';
    previewEl.appendChild(iframe);
  }

  // Funzione per applicare template
  function applyCodeTemplate(componentEl, templateName) {
    const template = codeTemplates[templateName];
    if (!template) return;
    
    const htmlTextarea = componentEl.querySelector('[data-type="html"]');
    const cssTextarea = componentEl.querySelector('[data-type="css"]');
    const jsTextarea = componentEl.querySelector('[data-type="js"]');
    
    if (htmlTextarea) htmlTextarea.value = template.html;
    if (cssTextarea) cssTextarea.value = template.css;
    if (jsTextarea) jsTextarea.value = template.js;
    
    // Aggiorna l'anteprima
    setTimeout(() => updateCodePreview(componentEl), 100);
  }

  // Traccia i componenti rimossi
  let removedComponents = new Set();

  // --- FUNZIONI PER RIORDINAMENTO COMPONENTI ---
  const moveComponentUp = (element) => {
    const prevElement = element.previousElementSibling;
    if (prevElement) {
      element.parentNode.insertBefore(element, prevElement);
      console.log("Component moved up");
    }
  };

  const moveComponentDown = (element) => {
    const nextElement = element.nextElementSibling;
    if (nextElement) {
      element.parentNode.insertBefore(nextElement, element);
      console.log("Component moved down");
    }
  };

  // --- DRAG & DROP FUNCTIONS ---
  let draggedElement = null;

  const handleDragStart = (e) => {
    draggedElement = e.target;
    e.target.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove("dragging");
    draggedElement = null;

    // Rimuovi tutti gli indicatori di drop
    document.querySelectorAll(".drop-indicator").forEach((indicator) => {
      indicator.classList.remove("active");
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const afterElement = getDragAfterElement(
      componentsContainer,
      e.clientY
    );
    const dropIndicator = document.querySelector(".drop-indicator");

    if (afterElement == null) {
      componentsContainer.appendChild(dropIndicator);
    } else {
      componentsContainer.insertBefore(dropIndicator, afterElement);
    }

    dropIndicator.classList.add("active");
  };

  const handleDragLeave = (e) => {
    if (!componentsContainer.contains(e.relatedTarget)) {
      const dropIndicator = document.querySelector(".drop-indicator");
      if (dropIndicator) {
        dropIndicator.classList.remove("active");
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const dropIndicator = document.querySelector(".drop-indicator");
    if (dropIndicator && draggedElement) {
      if (dropIndicator.nextSibling) {
        componentsContainer.insertBefore(
          draggedElement,
          dropIndicator.nextSibling
        );
      } else {
        componentsContainer.appendChild(draggedElement);
      }
    }

    if (dropIndicator) {
      dropIndicator.classList.remove("active");
    }
  };

  const getDragAfterElement = (container, y) => {
    const draggableElements = [
      ...container.querySelectorAll(
        ".component-wrapper:not(.dragging), .spacer-component:not(.dragging)"
      ),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  };

  // --- EVENT LISTENERS PER COMPONENTI ---
  componentsContainer.addEventListener("click", (e) => {
    // Gestione rimozione componenti
    if (e.target.closest(".remove-component")) {
      const wrapper = e.target.closest(
        ".component-wrapper, .spacer-component"
      );
      const componentId = wrapper.dataset.componentId;
      const componentType = wrapper.dataset.type;

      console.log("Removing component:", {
        componentId,
        componentType,
        currentPageId,
        hasComponentId: !!componentId,
      });

      // Se il componente ha un ID GunDB, segnalo come rimosso
      if (componentId && currentPageId) {
        removedComponents.add(componentId);
        console.log("Component marked for removal:", componentId);
        console.log(
          "Total components marked for removal:",
          removedComponents.size
        );
      } else {
        console.log(
          "Component removed from UI only (no componentId or currentPageId)"
        );
      }

      // Rimuovi dall'HTML con animazione
      wrapper.style.opacity = "0";
      wrapper.style.transform = "scale(0.9)";
      setTimeout(() => {
        wrapper.remove();
        console.log("Component removed from DOM");
      }, 200);
    }

    // Gestione movimento componenti
    if (e.target.closest(".move-up-btn")) {
      const wrapper = e.target.closest(
        ".component-wrapper, .spacer-component"
      );
      moveComponentUp(wrapper);
    }

    if (e.target.closest(".move-down-btn")) {
      const wrapper = e.target.closest(
        ".component-wrapper, .spacer-component"
      );
      moveComponentDown(wrapper);
    }
  });

  // --- DRAG & DROP EVENT LISTENERS ---
  componentsContainer.addEventListener("dragstart", handleDragStart);
  componentsContainer.addEventListener("dragend", handleDragEnd);
  componentsContainer.addEventListener("dragover", handleDragOver);
  componentsContainer.addEventListener("dragleave", handleDragLeave);
  componentsContainer.addEventListener("drop", handleDrop);

  // Crea l'indicatore di drop
  const dropIndicator = document.createElement("div");
  dropIndicator.className = "drop-indicator";
  componentsContainer.appendChild(dropIndicator);

  document
    .getElementById("save-page")
    .addEventListener("click", async () => {
      if (!checkAuthentication()) return;

      const title = document.getElementById("page-title").value.trim();
      if (!title) {
        alert("Per favore, inserisci un titolo per la pagina.");
        return;
      }

      // Get current user from Shogun Core
      const currentUser = shogun.getCurrentUser();
      if (!currentUser) {
        alert("Errore: utente non autenticato.");
        return;
      }

      // Mostra feedback di salvataggio
      const saveBtn = document.getElementById("save-page");
      const originalText = saveBtn.innerHTML;
      saveBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin mr-2"></i>Salvataggio...';
      saveBtn.disabled = true;

      const components = [];
      document
        .querySelectorAll(".component-wrapper, .spacer-component")
        .forEach((wrapper, index) => {
          const type = wrapper.dataset.type;
          let componentId = wrapper.dataset.componentId;

          // Se il componente non ha un ID, creane uno nuovo
          if (!componentId) {
            componentId =
              "comp_" +
              Math.random().toString(36).substring(2, 15) +
              Math.random().toString(36).substring(2, 15);
            wrapper.dataset.componentId = componentId;
          }

          const componentData = {
            type,
            id: componentId,
            order: index, // Aggiungi l'ordine basato sulla posizione nell'HTML
          };

          if (type === "h1" || type === "p") {
            componentData.content = wrapper.querySelector(
              '[data-type="content"]'
            ).innerHTML;
            componentData.alignment = wrapper.querySelector(
              '[data-type="alignment"]'
            ).value;
          } else if (type === "img") {
            componentData.src =
              wrapper.querySelector('[data-type="src"]').value;
          } else if (type === "avatar") {
            const nameEl = wrapper.querySelector('[data-type="name"]');
            const descEl = wrapper.querySelector(
              '[data-type="description"]'
            );
            const avatarEl = wrapper.querySelector(
              '[data-type="avatar"]'
            );

            componentData.name = nameEl ? nameEl.innerHTML : "";
            componentData.description = descEl ? descEl.innerHTML : "";
            componentData.avatar = avatarEl ? avatarEl.src : "";
          } else if (type === "link") {
            const titleEl = wrapper.querySelector('[data-type="title"]');
            const urlEl = wrapper.querySelector('[data-type="url"]');
            const iconEl = wrapper.querySelector('[data-type="icon"]');

            componentData.title = titleEl ? titleEl.value : "";
            componentData.url = urlEl ? urlEl.value : "";
            componentData.icon = iconEl ? iconEl.value : "";
          } else if (type === "spacer") {
            // Il componente spazio non ha dati aggiuntivi
            componentData.height = "16px"; // Altezza predefinita dello spazio
          } else if (type === "code") {
            const templateEl = wrapper.querySelector('[data-type="template"]');
            const htmlEl = wrapper.querySelector('[data-type="html"]');
            const cssEl = wrapper.querySelector('[data-type="css"]');
            const jsEl = wrapper.querySelector('[data-type="js"]');
            
            componentData.template = templateEl ? templateEl.value : "";
            componentData.html = htmlEl ? htmlEl.value : "";
            componentData.css = cssEl ? cssEl.value : "";
            componentData.js = jsEl ? jsEl.value : "";
          }
          components.push({ componentData, componentId });
        });

      // Creazione di un ID unico per la pagina
      const pageId =
        currentPageId ||
        "page_" +
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

      try {
        // Use Shogun Core's database access
        const pageNode = shogun.db.get("pages").get(pageId);

        // Salvataggio dati in GunDB con autenticazione
        const pageData = {
          title,
          author: currentUser.pub, // Salva la chiave pubblica dell'autore
          updatedAt: Date.now(),
        };

        // Aggiungi createdAt solo se Ã¨ una nuova pagina
        if (!currentPageId) {
          pageData.createdAt = Date.now();
        }

        console.log("Saving page:", pageId, pageData);
        pageNode.put(pageData, (ack) => {
          if (ack && ack.err) {
            console.error("Error saving page:", ack.err);
          } else {
            console.log("Page saved successfully");

            // Aggiungi la pagina al webring se Ã¨ una nuova pagina
            if (!currentPageId) {
              addSiteToWebring(pageId, title);
              // Aggiorna la lista locale delle pagine
              allPages.unshift({
                id: pageId,
                title: title,
                author: currentUser.pub,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });
            }
          }
        });

        // Prima rimuovi i componenti cancellati
        console.log(
          "Components to remove from database:",
          removedComponents.size,
          Array.from(removedComponents)
        );
        removedComponents.forEach((componentId) => {
          console.log("Marking component as deleted:", componentId);
          
          // Marca il componente come cancellato invece di usare null
          const deletedData = { deleted: true, deletedAt: Date.now() };
          
          // Aggiorna il componente nel database principale
          shogun.db.get(componentId).put(deletedData, (ack) => {
            if (ack && ack.err) {
              console.error(
                "Error marking component as deleted:",
                componentId,
                ack.err
              );
            } else {
              console.log("Component marked as deleted:", componentId);
            }
          });
          
          // Aggiorna anche il riferimento nella pagina
          pageNode
            .get("components")
            .get(componentId)
            .put(deletedData, (ack) => {
            if (ack && ack.err) {
                console.error(
                  "Error updating page component reference:",
                  componentId,
                  ack.err
                );
            }
          });
        });

        // Poi salva i componenti attivi
        console.log("Components to save:", components.length);
        console.log(
          "Removed components check:",
          Array.from(removedComponents)
        );

        components.forEach(({ componentData, componentId }, index) => {
          if (!removedComponents.has(componentId)) {
            console.log(
              "Saving component:",
              componentId,
              componentData.type,
              "order:",
              componentData.order
            );
            // Salva il componente nel database principale
            const componentNode = shogun.db.get(componentId);
            componentNode.put(componentData, (ack) => {
              if (ack && ack.err) {
                console.error(
                  "Error saving component:",
                  componentId,
                  ack.err
                );
              } else {
                console.log(
                  "Component saved successfully:",
                  componentId,
                  "order:",
                  componentData.order
                );
              }
            });
            // Crea un riferimento nel nodo components della pagina
            pageNode
              .get("components")
              .get(componentId)
              .put(componentData);
          } else {
            console.log("Skipping removed component:", componentId);
          }
        });
      } catch (error) {
        console.error("Error saving page:", error);
      }

      // Reset dei componenti rimossi
      console.log(
        "Clearing removed components set. Previous size:",
        removedComponents.size
      );
      removedComponents.clear();
      console.log(
        "Removed components cleared. New size:",
        removedComponents.size
      );

      currentPageId = pageId;

      // Aspetta un attimo per la sincronizzazione GunDB
      setTimeout(() => {
        // Ripristina il bottone
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        showModal(pageId);
      }, 500);
    });

  // --- LOGICA MODALE ---
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modal-content");

  const showModal = (pageId) => {
    const link = `${window.location.origin}${window.location.pathname}?page=${pageId}`;
    document.getElementById("share-link").value = link;
    document.getElementById("copy-feedback").textContent = "";
    modal.classList.remove("hidden");
    setTimeout(() => {
      modalContent.classList.remove("scale-95", "opacity-0");
    }, 10);
  };

  document.getElementById("close-modal").addEventListener("click", () => {
    modalContent.classList.add("scale-95", "opacity-0");
    setTimeout(() => modal.classList.add("hidden"), 200);
  });

  document.getElementById("copy-link").addEventListener("click", () => {
    const linkInput = document.getElementById("share-link");
    linkInput.select();
    document.execCommand("copy");
    const feedback = document.getElementById("copy-feedback");
    feedback.textContent = "Link copiato!";
    setTimeout(() => (feedback.textContent = ""), 2000);
  });

  // --- FUNZIONE PER RENDERE I LINK CLICCABILI ---
  const makeLinksClickable = (element) => {
    // Regex per trovare URL (http/https/ftp)
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;
    
    // Cerca tutti i nodi di testo nell'elemento
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }
    
    textNodes.forEach((textNode) => {
      const text = textNode.textContent;
      if (urlRegex.test(text)) {
        const parent = textNode.parentNode;
        const newHTML = text.replace(
          urlRegex,
          '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600 underline transition-colors">$1</a>'
        );
        
        if (newHTML !== text) {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = newHTML;
          
          // Sostituisci il nodo di testo con i nuovi nodi
          while (tempDiv.firstChild) {
            parent.insertBefore(tempDiv.firstChild, textNode);
          }
          parent.removeChild(textNode);
        }
      }
    });
  };

  // --- LOGICA RENDERER ---
  const renderPage = (pageId) => {
    editorView.classList.add("hidden");
    rendererView.classList.remove("hidden");

    // Show footer navigator
    const footerNavigator = document.getElementById(
      "page-navigator-footer"
    );
    if (footerNavigator) {
      footerNavigator.classList.remove("hidden");
      document.body.classList.add("footer-visible");
    }

    currentPageId = pageId;

    const renderedContent = document.getElementById("rendered-content");
    const renderedTitle = document.getElementById("rendered-title");
    renderedContent.innerHTML =
      '<p class="text-gray-500">Caricamento contenuto...</p>';

    // Carica tutte le pagine e aggiorna i pulsanti di navigazione
    loadAllPages();
    setTimeout(() => {
      updateNavigationButtons(pageId);
    }, 2000); // Aspetta che le pagine siano caricate

    const componentsData = [];

    try {
      const pageNode = shogun.db.get("pages").get(pageId);

      // Usa .once() per caricare il titolo una sola volta
      pageNode.get("title").once((title, key) => {
        if (title && title !== null) {
          renderedTitle.textContent = title;
          renderedTitle.classList.remove("hidden");
          document.title = title;
        } else {
          // Aspetta un secondo tentativo dopo un breve delay
          setTimeout(() => {
            pageNode.get("title").once((retryTitle) => {
              if (retryTitle && retryTitle !== null) {
                renderedTitle.textContent = retryTitle;
                renderedTitle.classList.remove("hidden");
                document.title = retryTitle;
              } else {
                renderedTitle.textContent = "Pagina non trovata";
                renderedTitle.classList.remove("hidden");
                renderedContent.innerHTML = `<p class="text-red-500 text-center">Impossibile trovare i dati per questa pagina. L'ID potrebbe essere errato o i dati non sono ancora stati sincronizzati.</p>`;
              }
            });
          }, 1000);
        }
      });

      // Controllo permessi per la modifica
      pageNode.get("author").once((author) => {
        console.log("Page author:", author);
        
        // Recupera la pub da localStorage se currentUser non Ã¨ impostato
        if (!currentUser) {
          const savedPub = localStorage.getItem("currentUserPub");
          const savedAlias = localStorage.getItem("currentUserAlias");
          if (savedPub) {
            currentUser = {
              sea: { pub: savedPub },
              alias: savedAlias || savedPub.substring(0, 8) + "...",
              pub: savedPub,
            };
          }
        }
        
        console.log("Current user pub:", currentUser?.pub);
        console.log("Current user:", currentUser);

        const canEdit = currentUser && currentUser.pub === author;
        console.log("Can edit:", canEdit);

        const editButton = document.getElementById("edit-page-btn");
        const deleteButton = document.getElementById("delete-page-btn");
        const rendererUserInfo =
          document.getElementById("renderer-user-info");

        if (canEdit) {
          rendererUserInfo.classList.remove("hidden");
          editButton.style.display = "inline-block";
          deleteButton.style.display = "inline-block";
          console.log("Edit and delete buttons should be visible");
        } else {
          rendererUserInfo.classList.add("hidden");
          editButton.style.display = "none";
          deleteButton.style.display = "none";
          console.log("Edit and delete buttons hidden - user cannot edit");
        }
      });

      // Carica i componenti
      pageNode
        .get("components")
        .map()
        .once((data, id) => {
          console.log("Raw component data for render:", {
            id,
            data,
            isNull: data === null,
          });
          
          // Controlla se il componente Ã¨ stato cancellato o Ã¨ valido
          // Salta i componenti con deleted: true
          if (
            data &&
            data !== null &&
            typeof data === "object" &&
            data.type &&
            Object.keys(data).length > 0 &&
            !data.deleted
          ) {
            componentsData.push(data);
            console.log("Added component for render:", data.type, data);
          } else {
            console.log("Skipping component for render:", {
              id,
              reason: !data
                ? "null data"
                : data.deleted
                ? "deleted"
                : !data.type
                ? "no type"
                : "invalid data",
            });
          }
        });
    } catch (error) {
      console.error("Error loading page:", error);
    }

    // GunDB Ã¨ asincrono. Aspettiamo un po' che i dati arrivino prima di renderizzare.
    // In una app reale, si userebbe un approccio piÃ¹ robusto (es. contatori o promesse).
    setTimeout(() => {
      renderedContent.innerHTML = "";
      if (componentsData.length > 0) {
        // Ordina i componenti in base al campo 'order'
        componentsData.sort((a, b) => (a.order || 0) - (b.order || 0));

        componentsData.forEach((comp) => {
          let el;
          if (comp.type === "h1") {
            el = document.createElement("h1");
            const alignment = comp.alignment || "center";
            el.className = `profile-name text-${alignment}`;
            el.innerHTML = comp.content;
            // Make links clickable in h1 content
            makeLinksClickable(el);
          } else if (comp.type === "p") {
            el = document.createElement("p");
            const alignment = comp.alignment || "center";
            el.className = `profile-description text-${alignment}`;
            el.innerHTML = comp.content;
            // Make links clickable in p content
            makeLinksClickable(el);
          } else if (comp.type === "img") {
            el = document.createElement("img");
            el.src = comp.src;
            el.className =
              "max-w-full h-auto rounded-xl shadow-sm mx-auto";
            el.onerror = () => {
              el.alt = "Immagine non trovata";
              el.classList.add(
                "p-4",
                "border",
                "border-gray-200",
                "rounded-xl"
              );
            };
          } else if (comp.type === "avatar") {
            // Crea un contenitore per l'avatar centrato in stile Linktree
            el = document.createElement("div");
            el.className = "profile-section";

            // Avatar image
            const avatarImg = document.createElement("img");
            avatarImg.src = comp.avatar || "";
            avatarImg.alt = "Avatar";
            avatarImg.className = "profile-avatar";

            // Nome
            const nameEl = document.createElement("div");
            nameEl.className = "profile-name";
            nameEl.innerHTML = comp.name || "Il tuo nome";
            // Make links clickable in name
            makeLinksClickable(nameEl);

            // Descrizione
            const descEl = document.createElement("div");
            descEl.className = "profile-description";
            descEl.innerHTML = comp.description || "Breve descrizione";
            // Make links clickable in description
            makeLinksClickable(descEl);

            el.appendChild(avatarImg);
            el.appendChild(nameEl);
            el.appendChild(descEl);
          } else if (comp.type === "link") {
            // Crea un pulsante link in stile Linktree
            el = document.createElement("a");
            el.href = comp.url || "#";
            el.target = "_blank";
            el.rel = "noopener noreferrer";
            el.className = "link-button";

            const linkContent = document.createElement("div");
            linkContent.className =
              "flex items-center justify-between w-full";

            const linkText = document.createElement("span");
            linkText.textContent = comp.title || "Link";
            linkText.className = "font-medium";

            const linkIcon = document.createElement("i");
            if (comp.icon) {
              linkIcon.className = comp.icon;
            } else {
              linkIcon.className = "fas fa-external-link-alt";
            }

            linkContent.appendChild(linkText);
            linkContent.appendChild(linkIcon);
            el.appendChild(linkContent);
          } else if (comp.type === "spacer") {
            // Crea un elemento spazio
            el = document.createElement("div");
            el.className = "spacer-component";
            el.style.height = comp.height || "16px";
          } else if (comp.type === "code") {
            // Crea un container per il codice
            el = document.createElement("div");
            el.className = "code-component";
            
            // Escapa i backtick nel JavaScript per evitare problemi con i template literals nell'iframe
            let componentJs = comp.js ? comp.js.replace(/`/g, '\\`') : '';

            // Crea un iframe per eseguire il codice in modo sicuro
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '300px';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '12px';
            iframe.style.margin = '10px 0';
            
            // Aspetta che l'iframe sia caricato prima di accedere al documento
            iframe.onload = function() {
              try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (!iframeDoc) {
                  console.error('Cannot access iframe document');
                  return;
                }
                
                iframeDoc.open();
                
                // Usa document.write per il contenuto base
                iframeDoc.write('<!DOCTYPE html>');
                iframeDoc.write('<html>');
                iframeDoc.write('<head>');
                iframeDoc.write('<style>');
                iframeDoc.write('body { margin: 0; padding: 20px; font-family: "Inter", sans-serif; background: transparent; }');
                iframeDoc.write(comp.css || '');
                iframeDoc.write('</style>');
                iframeDoc.write('</head>');
                iframeDoc.write('<body>');
                iframeDoc.write(comp.html || '');
                iframeDoc.write('</body>');
                iframeDoc.write('</html>');
                iframeDoc.close();
                
                // Aggiungi script in modo sicuro usando createElement
                if (componentJs && componentJs.trim()) {
                  const script = iframeDoc.createElement('script');
                  script.textContent = `try { ${componentJs} } catch(e) { console.error("JS Error:", e); }`;
                  iframeDoc.body.appendChild(script);
                }
              } catch (error) {
                console.error('Error setting up iframe content:', error);
              }
            };
            
            // Imposta src vuoto per triggerare onload
            iframe.src = 'about:blank';
            
            el.appendChild(iframe);
          }
          if (el) renderedContent.appendChild(el);
        });
      } else if (
        renderedTitle &&
        renderedTitle.textContent !== "Pagina non trovata"
      ) {
        renderedContent.innerHTML =
          '<p class="text-gray-500">Questa pagina non ha ancora nessun contenuto.</p>';
      }
    }, 1500); // Attesa di 1.5s per la sincronizzazione dei dati
  };

  // --- EVENT LISTENERS PER AUTENTICAZIONE ---
  document
    .getElementById("login-btn-header")
    .addEventListener("click", showAuthModal);
  document.getElementById("logout-btn").addEventListener("click", logout);
  document
    .getElementById("edit-page-btn")
    .addEventListener("click", () => {
      if (currentPageId) {
        // Torna alla modalitÃ  editor per modificare la pagina
        rendererView.classList.add("hidden");
        editorView.classList.remove("hidden");

        // Hide footer navigator
        const footerNavigator = document.getElementById(
          "page-navigator-footer"
        );
        if (footerNavigator) {
          footerNavigator.classList.add("hidden");
          document.body.classList.remove("footer-visible");
        }

        // Carica i dati della pagina nell'editor
        loadPageForEdit(currentPageId);
      }
    });

  // Event listeners per la navigazione tra pagine
  document
    .getElementById("prev-page-btn")
    .addEventListener("click", navigateToPreviousPage);

  document
    .getElementById("next-page-btn")
    .addEventListener("click", navigateToNextPage);

  document
    .getElementById("random-page-btn")
    .addEventListener("click", navigateToRandomPage);

  // Event listener per il pulsante elimina pagina
  document
    .getElementById("delete-page-btn")
    .addEventListener("click", showDeleteConfirmation);

  document
    .getElementById("cancel-delete-btn")
    .addEventListener("click", hideDeleteConfirmation);

  document
    .getElementById("confirm-delete-btn")
    .addEventListener("click", confirmDeletePage);

  // Gestione avatar
  const handleAvatarUpload = (inputId, imgId) => {
    const input = document.getElementById(inputId);
    const img = document.getElementById(imgId);

    // Controlla se gli elementi esistono prima di aggiungere event listeners
    if (!input || !img) {
      console.warn(
        `Avatar elements not found: inputId=${inputId}, imgId=${imgId}`
      );
      return;
    }

    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
          // Salva l'avatar nell'utente usando Shogun Core
          if (currentUser && currentUser.pub) {
            try {
              shogun.db.user.get("avatar").put(e.target.result);
            } catch (error) {
              console.error("Error saving avatar:", error);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Click sull'immagine per aprire il file picker
    img.addEventListener("click", () => {
      input.click();
    });

    // Click sull'icona fotocamera (se esiste) per aprire il file picker
    const cameraIcon = img.parentElement.querySelector(".fa-camera");
    if (cameraIcon) {
      cameraIcon.parentElement.addEventListener("click", (e) => {
        e.stopPropagation();
        input.click();
      });
    }
  };

  // Inizializza gli avatar
  handleAvatarUpload("avatar-input", "user-avatar");

  // Webring functionality disabled
  console.log("Webring functionality disabled due to missing files");

  // Event listeners per il modale di autenticazione
  document
    .getElementById("login-btn")
    .addEventListener("click", async () => {
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;

      if (!username || !password) {
        document.getElementById("auth-feedback").textContent =
          "Inserisci username e password";
        return;
      }

      const success = await login(username, password);
      if (!success) {
        document.getElementById("auth-feedback").textContent =
          "Credenziali non valide";
      }
    });

  document
    .getElementById("register-btn")
    .addEventListener("click", async () => {
      const username = document
        .getElementById("reg-username")
        .value.trim();
      const password = document.getElementById("reg-password").value;

      if (!username || !password) {
        document.getElementById("auth-feedback").textContent =
          "Inserisci username e password";
        return;
      }

      const success = await register(username, password);
      if (!success) {
        document.getElementById("auth-feedback").textContent =
          "Errore durante la registrazione";
      }
    });

  document
    .getElementById("show-register")
    .addEventListener("click", () => {
      document.getElementById("login-form").classList.add("hidden");
      document.getElementById("register-form").classList.remove("hidden");
    });

  document.getElementById("show-login").addEventListener("click", () => {
    document.getElementById("register-form").classList.add("hidden");
    document.getElementById("login-form").classList.remove("hidden");
  });

  document
    .getElementById("close-auth-modal")
    .addEventListener("click", hideAuthModal);

  // --- FUNZIONE PER CARICARE PAGINA NELL'EDITOR ---
  const loadPageForEdit = (pageId) => {
    // Reset dei componenti rimossi quando carichi una nuova pagina
    removedComponents.clear();

    // Pulisci il container e il titolo
    componentsContainer.innerHTML = "";
    document.getElementById("page-title").value = "";
    componentIdCounter = 0;

    // Carica i componenti esistenti
    const loadedComponents = new Set();
    const componentsToLoad = [];

    try {
      const pageNode = shogun.db.get("pages").get(pageId);

      // Carica il titolo usando .once()
      pageNode.get("title").once((title, key) => {
        if (title && title !== null) {
          document.getElementById("page-title").value = title;
        } else {
          // Aspetta un secondo tentativo dopo un breve delay
          setTimeout(() => {
            pageNode.get("title").once((retryTitle) => {
              if (retryTitle && retryTitle !== null) {
                document.getElementById("page-title").value = retryTitle;
              } else {
                console.warn("Unable to load page title");
              }
            });
          }, 1000);
        }
      });

      pageNode
        .get("components")
        .map()
        .once((data, id) => {
          console.log("Raw component data from DB:", {
            id,
            data,
            isNull: data === null,
          });
          
          // GunDB puÃ² restituire null, undefined, o un oggetto vuoto per componenti rimossi
          // Salta anche i componenti con deleted: true
          if (
            data &&
            data !== null &&
            typeof data === "object" &&
            data.type &&
            Object.keys(data).length > 0 &&
            !data.deleted &&
            !loadedComponents.has(id)
          ) {
            loadedComponents.add(id);
            componentsToLoad.push(data);
            console.log("Loading component for edit:", data.type, data);
          } else {
            console.log("Skipping component:", {
              id,
              reason: !data
                ? "null data"
                : data.deleted
                ? "deleted"
                : !data.type
                ? "no type"
                : "already loaded",
            });
          }
        });
    } catch (error) {
      console.error("Error loading page for edit:", error);
    }

    // Aspetta che i componenti siano caricati, poi ordinali e renderizzali
    setTimeout(() => {
      console.log(
        "Components to load for edit:",
        componentsToLoad.length,
        componentsToLoad
      );

      // Ordina i componenti in base al campo 'order'
      componentsToLoad.sort((a, b) => (a.order || 0) - (b.order || 0));

      componentsToLoad.forEach((data) => {
        const componentEl = createComponentHTML(
          data.type,
          componentIdCounter++,
          data.id
        );

        if (data.type === "h1" || data.type === "p") {
          const contentEl = componentEl.querySelector(
            '[data-type="content"]'
          );
          const alignmentEl = componentEl.querySelector(
            '[data-type="alignment"]'
          );
          contentEl.innerHTML = data.content;
          
          // Imposta l'allineamento se salvato
          if (data.alignment && alignmentEl) {
            alignmentEl.value = data.alignment;
            // Rimuovi tutte le classi di allineamento esistenti
            contentEl.classList.remove(
              "text-left",
              "text-center",
              "text-right",
              "text-justify"
            );
            // Aggiungi la classe di allineamento corretta
            contentEl.classList.add(`text-${data.alignment}`);
          }
        } else if (data.type === "img") {
          const srcEl = componentEl.querySelector('[data-type="src"]');
          srcEl.value = data.src;
        } else if (data.type === "avatar") {
          // Carica i dati dell'avatar se esistono (PRIMA di aggiungere al DOM)
          if (data.name) {
            const nameEl =
              componentEl.querySelector('[data-type="name"]');
            nameEl.innerHTML = data.name;
          }
          if (data.description) {
            const descEl = componentEl.querySelector(
              '[data-type="description"]'
            );
            descEl.innerHTML = data.description;
          }
          if (data.avatar) {
            const imgEl = componentEl.querySelector(
              '[data-type="avatar"]'
            );
            imgEl.src = data.avatar;
          }
        } else if (data.type === "link") {
          const titleEl = componentEl.querySelector(
            '[data-type="title"]'
          );
          const urlEl = componentEl.querySelector('[data-type="url"]');
          const iconEl = componentEl.querySelector('[data-type="icon"]');

          if (titleEl && data.title) {
            titleEl.value = data.title;
          }
          if (urlEl && data.url) {
            urlEl.value = data.url;
          }
          if (iconEl && data.icon) {
            iconEl.value = data.icon;
          }
        } else if (data.type === "spacer") {
          // Il componente spazio non ha dati aggiuntivi da caricare
          if (data.height) {
            componentEl.style.height = data.height;
          }
        } else if (data.type === "code") {
          const templateEl = componentEl.querySelector('[data-type="template"]');
          const htmlEl = componentEl.querySelector('[data-type="html"]');
          const cssEl = componentEl.querySelector('[data-type="css"]');
          const jsEl = componentEl.querySelector('[data-type="js"]');
          
          if (templateEl && data.template) {
            templateEl.value = data.template;
          }
          if (htmlEl && data.html) {
            htmlEl.value = data.html;
          }
          if (cssEl && data.css) {
            cssEl.value = data.css;
          }
          if (jsEl && data.js) {
            jsEl.value = data.js;
          }
          
          // Aggiorna l'anteprima
          setTimeout(() => updateCodePreview(componentEl), 100);
        }

        componentsContainer.appendChild(componentEl);

        // Inizializza gli event listeners per l'avatar DOPO averlo aggiunto al DOM
        if (data.type === "avatar") {
          const avatarId = `avatar-${componentIdCounter - 1}`;
          const avatarInputId = `avatar-input-${componentIdCounter - 1}`;
          handleAvatarUpload(avatarInputId, avatarId);
        }

        // Inizializza gli event listeners per il componente codice
        if (data.type === "code") {
          const templateSelect = componentEl.querySelector('[data-type="template"]');
          const htmlTextarea = componentEl.querySelector('[data-type="html"]');
          const cssTextarea = componentEl.querySelector('[data-type="css"]');
          const jsTextarea = componentEl.querySelector('[data-type="js"]');

          // Event listener per il template
          if (templateSelect) {
            templateSelect.addEventListener('change', (e) => {
              if (e.target.value) {
                applyCodeTemplate(componentEl, e.target.value);
              }
            });
          }

          // Event listeners per aggiornare l'anteprima
          [htmlTextarea, cssTextarea, jsTextarea].forEach(textarea => {
            if (textarea) {
              textarea.addEventListener('input', () => {
                updateCodePreview(componentEl);
              });
            }
          });
        }
      });
    }, 1000);
  };

  console.log(gun);

  // --- INIZIALIZZAZIONE AUTENTICAZIONE ---
  // Controlla se l'utente Ã¨ giÃ  autenticato usando Shogun Core
  const checkExistingSession = () => {
    try {
      // Prima controlla localStorage per la pub salvata
      const savedPub = localStorage.getItem("currentUserPub");
      const savedAlias = localStorage.getItem("currentUserAlias");
      
      if (savedPub) {
        console.log("Found saved user pub in localStorage:", savedPub);
        // Imposta currentUser dalle informazioni salvate
        currentUser = {
          sea: { pub: savedPub },
          alias: savedAlias || savedPub.substring(0, 8) + "...",
          pub: savedPub,
        };
        updateUserUI(currentUser);
      } else if (shogun.isLoggedIn()) {
        console.log("User is already logged in via Shogun Core");
        // Get current user info from Shogun Core
        const user = shogun.getCurrentUser();
        if (user) {
          updateUserUI({
            sea: { pub: user.pub },
            alias: user.username,
            pub: user.pub,
          });
        }
      } else {
        console.log("No existing session found");
      }
    } catch (error) {
      console.error("Error checking session:", error);
      // Fallback: prova a recuperare da localStorage anche in caso di errore
      const savedPub = localStorage.getItem("currentUserPub");
      const savedAlias = localStorage.getItem("currentUserAlias");
      if (savedPub) {
        currentUser = {
          sea: { pub: savedPub },
          alias: savedAlias || savedPub.substring(0, 8) + "...",
          pub: savedPub,
        };
        updateUserUI(currentUser);
      }
    }
  };

  // Check session immediately to ensure it's available for page rendering
  checkExistingSession();

  // --- ROUTING INIZIALE ---
  const urlParams = new URLSearchParams(window.location.search);
  const pageId = urlParams.get("page");

  if (pageId) {
    // Aspetta un po' per assicurarsi che l'autenticazione sia caricata
    setTimeout(() => {
      console.log("Rendering page with user:", currentUser);
      renderPage(pageId);
    }, 500);
  } else {
    // Solo se non c'Ã¨ una pagina specifica da visualizzare
    // Non mostrare il modal di autenticazione all'avvio, solo aggiungi componenti di esempio
    try {
      if (!shogun.isLoggedIn()) {
        // Se non autenticato, mostra comunque l'editor con componenti di esempio
        addComponent("h1");
        addComponent("p");
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      // Mostra comunque i componenti di esempio in caso di errore
      addComponent("h1");
      addComponent("p");
    }
  }

  // === DARK/LIGHT MODE TOGGLE ===

  // Theme management
  function initializeTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Update toggle button
    const themeIcon = document.getElementById("theme-icon");
    const themeText = document.getElementById("theme-text");

    if (theme === "dark") {
      themeIcon.className = "fas fa-sun";
      themeText.textContent = "Light";
    } else {
      themeIcon.className = "fas fa-moon";
      themeText.textContent = "Dark";
    }
  }

  function toggleTheme() {
    const currentTheme =
      document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  }

  // Funzioni per l'eliminazione della pagina
  function showDeleteConfirmation() {
    if (!currentPageId) {
      alert("Nessuna pagina da eliminare.");
      return;
    }

    const modal = document.getElementById("confirm-delete-modal");
    const modalContent = document.getElementById("confirm-delete-modal-content");
    
    modal.classList.remove("hidden");
    setTimeout(() => {
      modalContent.classList.remove("scale-95", "opacity-0");
      modalContent.classList.add("scale-100", "opacity-100");
    }, 10);
  }

  function hideDeleteConfirmation() {
    const modal = document.getElementById("confirm-delete-modal");
    const modalContent = document.getElementById("confirm-delete-modal-content");
    
    modalContent.classList.add("scale-95", "opacity-0");
    setTimeout(() => modal.classList.add("hidden"), 200);
  }

  async function confirmDeletePage() {
    if (!currentPageId) {
      alert("Nessuna pagina da eliminare.");
      return;
    }

    try {
      // Mostra indicatore di caricamento
      const deleteBtn = document.getElementById("confirm-delete-btn");
      const originalText = deleteBtn.innerHTML;
      deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Eliminazione...';
      deleteBtn.disabled = true;

      // Elimina la pagina da GunDB
      await shogun.db.get("pages").get(currentPageId).put(null);
      
      // Elimina anche dall'elenco delle pagine dell'utente
      const user = shogun.getCurrentUser();
      if (user && user.pub) {
        await shogun.db.user.get("pages").get(currentPageId).put(null);
      }

      // Nascondi il modal
      hideDeleteConfirmation();

      // Mostra messaggio di successo
      alert("Pagina eliminata con successo!");

      // Reindirizza alla home page
      window.location.href = "/";

    } catch (error) {
      console.error("Errore durante l'eliminazione della pagina:", error);
      alert("Errore durante l'eliminazione della pagina. Riprova.");
      
      // Ripristina il pulsante
      const deleteBtn = document.getElementById("confirm-delete-btn");
      deleteBtn.innerHTML = originalText;
      deleteBtn.disabled = false;
    }
  }

  // Initialize theme toggle
  initializeTheme();

  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }
});
