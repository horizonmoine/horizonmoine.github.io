// ============================================================
// Georges — Assistant IA HEGP  |  main.js
// ============================================================

// DOM refs
const loginScreen  = document.getElementById('login-screen');
const chatScreen   = document.getElementById('chat-screen');
const loginBtn     = document.getElementById('login-btn');
const logoutBtn    = document.getElementById('logout-btn');
const chatForm     = document.getElementById('chat-form');
const userInput    = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const welcomeScreen = document.getElementById('welcome-screen');
const welcomeName  = document.getElementById('welcome-name');
const sessionTimer = document.getElementById('session-timer');
const newChatBtn   = document.getElementById('new-chat-btn');
const summaryToggle = document.getElementById('summary-toggle');
const summaryClose  = document.getElementById('summary-close');
const summaryPanel  = document.getElementById('patient-summary');

// Summary elements
const pName     = document.getElementById('p-name');
const pSymptoms = document.getElementById('p-symptoms');
const pRec      = document.getElementById('p-rec');
const urgencyFill = document.getElementById('urgency-fill');
const urgencyText = document.getElementById('urgency-text');
const urgencyLevel = document.getElementById('urgency-level');
const actionsLog   = document.getElementById('actions-log');

// API Key — ideally this should go through the serverless /api/chat but
// for demo purposes the direct key is kept as fallback
const GEMINI_API_KEY = "AIzaSyCzgEGWTJiRWuB7853nAv9HlD7256L41TI";

// System Prompt (more realistic hospital context)
const SYSTEM_PROMPT = `Tu es "Georges", l'assistant IA d'accueil des urgences de l'Hôpital Européen Georges-Pompidou (HEGP, AP-HP, Paris).

CONTEXTE :
- Tu t'adresses directement aux PATIENTS qui arrivent aux urgences ou qui se renseignent en ligne avant de venir.
- Ton but est de collecter leurs symptômes, antécédents, et motifs de venue afin de générer un résumé/constat structuré pour le médecin régulateur.
- Tu rassures le patient, tu poses des questions courtes et ciblées sur sa douleur (localisation, intensité, durée).

RÈGLES ABSOLUES :
1. Tu ne poses pas de diagnostic médical définitif.
2. Si les symptômes suggèrent une urgence vitale absolue (douleur thoracique intense, perte de connaissance, paralysie soudaine), dis-leur de contacter le 15 immédiatement s'ils ne sont pas sur place, ou d'alerter un soignant à l'accueil.
3. Sois empathique, très clair, rassurant et professionnel.
4. Tu réponds TOUJOURS en français.
5. Limite-toi à 2 ou 3 questions maximum par message pour ne pas fatiguer le patient.`;

// Conversation memory (sent to the API for context)
let conversationHistory = [];
let sessionSeconds = 0;
let sessionInterval = null;

// ============================================================
// 1. AUTH FLOW
// ============================================================
loginBtn.addEventListener('click', () => {
    loginScreen.classList.remove('active');
    chatScreen.classList.add('active');
    
    // Set welcome name from username
    const username = document.getElementById('username').value;
    const firstName = username.split('.')[0];
    welcomeName.textContent = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : 'Utilisateur';
    
    startSessionTimer();
});

// Also allow Enter key on password field
document.getElementById('password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        loginBtn.click();
    }
});

logoutBtn.addEventListener('click', () => {
    chatScreen.classList.remove('active');
    loginScreen.classList.add('active');
    stopSessionTimer();
});

// ============================================================
// 2. SESSION TIMER
// ============================================================
function startSessionTimer() {
    sessionSeconds = 0;
    sessionInterval = setInterval(() => {
        sessionSeconds++;
        const m = Math.floor(sessionSeconds / 60);
        const s = String(sessionSeconds % 60).padStart(2, '0');
        sessionTimer.textContent = `${m}:${s}`;
    }, 1000);
}

function stopSessionTimer() {
    if (sessionInterval) clearInterval(sessionInterval);
}

// ============================================================
// 3. QUICK ACTIONS (welcome screen buttons)
// ============================================================
document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const prompt = btn.dataset.prompt;
        if (prompt) {
            userInput.value = prompt;
            handleSend();
        }
    });
});

// ============================================================
// 4. NEW CHAT
// ============================================================
newChatBtn.addEventListener('click', () => {
    conversationHistory = [];
    chatMessages.innerHTML = '';
    chatMessages.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    resetSummary();
    logAction('Nouvelle conversation démarrée');
});

// ============================================================
// 5. SUMMARY PANEL TOGGLE
// ============================================================
summaryToggle?.addEventListener('click', () => {
    summaryPanel.classList.toggle('hidden');
});

summaryClose?.addEventListener('click', () => {
    summaryPanel.classList.add('hidden');
});

// ============================================================
// 6. CHAT LOGIC
// ============================================================
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSend();
});

userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
});

// Ctrl+Enter to send
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    // Hide welcome, show messages
    if (!welcomeScreen.classList.contains('hidden')) {
        welcomeScreen.classList.add('hidden');
        chatMessages.classList.remove('hidden');
    }

    addMessage(text, 'user');
    userInput.value = '';
    userInput.style.height = 'auto';

    // Add to conversation history
    conversationHistory.push({ role: 'user', parts: [{ text }] });

    await getAIResponse(text);
}

function addMessage(content, role, useMarkdown = false) {
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    
    const icon = role === 'bot' ? 'uil-robot' : 'uil-user';
    
    let renderedContent = content;
    if (useMarkdown && typeof marked !== 'undefined') {
        try {
            renderedContent = marked.parse(content);
        } catch(e) {
            renderedContent = content;
        }
    }
    
    msgDiv.innerHTML = `
        <div class="avatar"><i class="uil ${icon}"></i></div>
        <div class="bubble">
            ${renderedContent}
            <div class="time">${time}</div>
        </div>
    `;
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="avatar"><i class="uil uil-robot"></i></div>
        <div class="bubble">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
}

async function getAIResponse(userText) {
    showTypingIndicator();

    // Simulate network delay for realism (1.5s to 3s)
    const delay = Math.floor(Math.random() * 1500) + 1500;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    let aiText = "";
    const lowerText = userText.toLowerCase();
    
    // Simple state machine for mock conversation
    if (conversationHistory.length <= 1) {
        // First reply
        if (lowerText.includes('douleur') && lowerText.includes('poitrine')) {
            aiText = "**J'ai bien noté votre douleur à la poitrine.** \n\nC'est une information importante. Pourriez-vous m'en dire plus : \n- Depuis combien de temps avez-vous cette douleur ? \n- S'étend-elle vers le bras ou la mâchoire ?";
        } else if (lowerText.includes('fièvre') || lowerText.includes('enfant')) {
            aiText = "**Je note la fièvre de votre enfant.** \n\n- Quelle est sa température exacte ?\n- A-t-il d'autres plaintes comme des maux de ventre ou des difficultés à respirer ?";
        } else if (lowerText.includes('coup') || lowerText.includes('sang') || lowerText.includes('saign')) {
            aiText = "⚠️ **Si le saignement est abondant, alertez immédiatement l'infirmier(e) d'accueil (IOA).**\n\nSinon, pourriez-vous préciser avec quoi vous vous êtes blessé et si la plaie a été nettoyée ?";
        } else if (lowerText.includes('vertige') || lowerText.includes('faible') || lowerText.includes('malaise')) {
            aiText = "**Je comprends, asseyez-vous ou allongez-vous si possible.** \n\n- Avez-vous perdu connaissance, même brièvement ?\n- Prenez-vous actuellement un traitement médical ?";
        } else {
            aiText = "Je comprends. Pour aider le médecin à vous prendre en charge rapidement : \n- Depuis quand ces symptômes ont-ils commencé ? \n- Avez-vous des antécédents médicaux particuliers ?";
        }
    } else if (conversationHistory.length <= 3) {
        // Second reply
        aiText = "Merci pour ces précisions. L'équipe médicale va bientôt vous examiner.\n\n- Prenez-vous des médicaments actuellement ?\n- Avez-vous des allergies connues ?";
    } else {
        // Final replies
        aiText = "C'est noté. J'ai transmis l'ensemble de ces informations au médecin régulateur. Votre dossier de pré-admission est prêt.\n\nMerci de patienter dans la salle d'attente. Un soignant va vous appeler par votre nom sous peu.";
    }

    removeTypingIndicator();

    // Add AI response to conversation history
    conversationHistory.push({ role: 'model', parts: [{ text: aiText }] });

    // Render with markdown
    addMessage(aiText, 'bot', true);
    
    // Update summary panel
    updateSummary(userText, aiText);
    logAction(`Données recueillies pour pré-admission`);
}

// ============================================================
// 7. SMART SUMMARY EXTRACTION
// ============================================================
function updateSummary(userText, aiText) {
    const combined = (userText + ' ' + aiText).toLowerCase();

    // --- Patient Name Detection ---
    const namePatterns = [
        /(?:patient|m\.|mme\.?|monsieur|madame)\s+([A-ZÀ-Ü][a-zà-ü]+(?:\s+[A-ZÀ-Ü][a-zà-ü]+)?)/i,
        /(?:jean|marie|pierre|paul|marc|anne|claire|sophie|jacques|louis)[\s]+[a-zà-ü]+/i
    ];
    
    for (const pat of namePatterns) {
        const match = (userText + ' ' + aiText).match(pat);
        if (match) {
            pName.textContent = match[0].trim();
            break;
        }
    }

    // --- Age detection ---
    const ageMatch = combined.match(/(\d{1,3})\s*ans/);
    if (ageMatch && pName.textContent !== 'En attente d\'informations...') {
        if (!pName.textContent.includes('ans')) {
            pName.textContent += ` (${ageMatch[1]} ans)`;
        }
    }

    // --- Symptom Detection (expanded list) ---
    const symptomList = [
        'douleur', 'douleurs', 'toux', 'fièvre', 'fatigue', 'essoufflement',
        'nausée', 'nausées', 'vomissement', 'vertige', 'vertiges',
        'céphalée', 'céphalées', 'maux de tête', 'palpitations',
        'dyspnée', 'œdème', 'oedème', 'hémorragie', 'saignement',
        'douleur thoracique', 'douleur abdominale', 'hypertension',
        'hypotension', 'tachycardie', 'bradycardie', 'confusion',
        'perte de connaissance', 'syncope', 'frissons', 'sueurs'
    ];

    const detectedSymptoms = symptomList.filter(s => combined.includes(s));
    
    if (detectedSymptoms.length > 0) {
        // Remove "empty" placeholder if present
        const emptyEl = pSymptoms.querySelector('.empty');
        if (emptyEl) pSymptoms.innerHTML = '';

        const existing = Array.from(pSymptoms.querySelectorAll('li')).map(li => li.textContent.toLowerCase());
        
        detectedSymptoms.forEach(s => {
            const normalized = s.charAt(0).toUpperCase() + s.slice(1);
            if (!existing.includes(s) && !existing.includes(normalized.toLowerCase())) {
                const li = document.createElement('li');
                li.textContent = normalized;
                pSymptoms.appendChild(li);
                existing.push(s);
            }
        });

        // Update urgency based on symptom count & severity
        updateUrgency(detectedSymptoms);
    }

    // --- Recommendation update ---
    if (aiText.length > 80) {
        // Extract first meaningful sentence from AI response
        const sentences = aiText.split(/(?<=[.!?])\s+/);
        const meaningful = sentences.find(s => s.length > 30) || sentences[0];
        pRec.textContent = meaningful.length > 150 ? meaningful.substring(0, 150) + '...' : meaningful;
    }
}

function updateUrgency(symptoms) {
    const criticalSymptoms = ['douleur thoracique', 'hémorragie', 'perte de connaissance', 'syncope', 'dyspnée'];
    const highSymptoms = ['essoufflement', 'palpitations', 'tachycardie', 'confusion', 'hypertension'];

    const hasCritical = symptoms.some(s => criticalSymptoms.includes(s));
    const hasHigh = symptoms.some(s => highSymptoms.includes(s));

    urgencyLevel.className = 'urgency-indicator';

    if (hasCritical) {
        urgencyLevel.classList.add('urgency-critical');
        urgencyFill.style.width = '95%';
        urgencyFill.style.background = '#ef4444';
        urgencyText.textContent = '🔴 CRITIQUE — Intervention immédiate';
        urgencyText.style.color = '#ef4444';
    } else if (hasHigh) {
        urgencyLevel.classList.add('urgency-high');
        urgencyFill.style.width = '70%';
        urgencyFill.style.background = '#f97316';
        urgencyText.textContent = '🟠 Élevé — Surveillance rapprochée';
        urgencyText.style.color = '#f97316';
    } else if (symptoms.length >= 3) {
        urgencyLevel.classList.add('urgency-medium');
        urgencyFill.style.width = '50%';
        urgencyFill.style.background = '#f59e0b';
        urgencyText.textContent = '🟡 Modéré — Évaluation recommandée';
        urgencyText.style.color = '#f59e0b';
    } else if (symptoms.length >= 1) {
        urgencyLevel.classList.add('urgency-low');
        urgencyFill.style.width = '25%';
        urgencyFill.style.background = '#10b981';
        urgencyText.textContent = '🟢 Faible — Suivi standard';
        urgencyText.style.color = '#10b981';
    }
}

function logAction(text) {
    const emptyEl = actionsLog.querySelector('.empty');
    if (emptyEl) actionsLog.innerHTML = '';

    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const li = document.createElement('li');
    li.innerHTML = `<i class="uil uil-check-circle"></i> <span>${time}</span> — ${text}`;
    actionsLog.prepend(li);

    // Keep max 8 entries
    while (actionsLog.children.length > 8) {
        actionsLog.removeChild(actionsLog.lastChild);
    }
}

function resetSummary() {
    pName.textContent = 'En attente d\'informations...';
    pSymptoms.innerHTML = '<li class="empty">Aucun symptôme détecté</li>';
    pRec.textContent = 'Les recommandations de Georges apparaîtront ici au fur et à mesure de la conversation.';
    urgencyFill.style.width = '0%';
    urgencyText.textContent = 'Non évalué';
    urgencyText.style.color = '';
    urgencyLevel.className = 'urgency-indicator';
    actionsLog.innerHTML = '<li class="empty">Aucune action pour le moment</li>';
}
