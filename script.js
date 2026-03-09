document.addEventListener('DOMContentLoaded', () => {

    const monolith = document.getElementById('main-monolith');
    const faces = document.querySelectorAll('.face[data-face]');
    const hudLeft = document.getElementById('hudLeft');
    const hudRight = document.getElementById('hudRight');
    const projectModal = document.getElementById('projectModal');

    const MONO_HALF = 260;

    // --- PROJECT DATA (fill in URLs and screenshots later) ---
    const projectData = {
        'dictee-geante': {
            title: 'La Dictée Géante',
            tags: 'UI/UX Design · Intégration Responsive · Méthode Agile · Git',
            desc: 'Conception et développement du site vitrine pour le jeu de société "La Dictée Géante" (Figma, HTML/CSS/JS). Création de la plateforme événementielle "La Dictée des Voisins" (Inscriptions, Dashboard admin).',
            url: '#',
            screenshots: []
        },
        'hopital-pompidou': {
            title: 'Hôpital E. Georges-Pompidou (AP-HP)',
            tags: 'Python (Flask) · API REST · JWT · RGPD',
            desc: 'Stage autour d\'un chatbot médical interne. Cadrage fonctionnel avec les équipes de soins. Conception d\'une architecture Flask/API REST. Sécurisation par JWT et CORS. Déploiement Nginx (RGPD).',
            url: '#',
            screenshots: []
        },
        'rc-group': {
            title: 'RC-Group · Service Informatique',
            tags: 'Support IT · Maintenance · Dépannage · Configuration',
            desc: 'Installation et configuration d\'équipements informatiques. Support technique et résolution d\'incidents logiciels et matériels. Maintenance préventive et optimisation du parc informatique.',
            url: '#',
            screenshots: []
        },
        'jeu-tir': {
            title: 'Jeu de Tir Interactif',
            tags: 'HTML5 · CSS3 · JavaScript',
            desc: 'Développement d\'un jeu de tir interactif en HTML, CSS et JavaScript. Déplacement d\'une arme, tir sur cible fixe, gestion visuelle des projectiles.',
            url: '#',
            screenshots: []
        },
        'pharmasi': {
            title: 'PharmaSI',
            tags: 'C# · .NET · MySQL · WinForms',
            desc: 'Application Windows de gestion de rapports de visite pour laboratoires pharmaceutiques. Gestion sécurisée des données et système d\'accès par rôles.',
            url: '#',
            screenshots: []
        },
        'supermarche': {
            title: 'Gestion Supermarché',
            tags: 'PHP · SQL · HTML/CSS',
            desc: 'Application web pour la gestion de stocks et de produits. Opérations CRUD complètes, authentification et base de données relationnelle.',
            url: '#',
            screenshots: []
        }
    };

    // --- ENTRANCE ANIMATION ---
    gsap.set('.monolith-wrapper', { opacity: 0 });
    gsap.set('.instructions', { opacity: 0, y: -10 });

    gsap.to('.monolith-wrapper', {
        opacity: 1,
        duration: 2.5,
        delay: 0.3,
        ease: 'power2.out'
    });
    gsap.to('.instructions', {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 1.8,
        ease: 'power2.out'
    });

    // --- PARTICLE BACKGROUND ---
    function initParticles() {
        const canvas = document.getElementById('particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const particles = [];
        const PARTICLE_COUNT = 55;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                size: Math.random() * 1.5 + 0.5,
                baseOpacity: Math.random() * 0.35 + 0.08,
                isGold: Math.random() > 0.75,
                phase: Math.random() * Math.PI * 2
            });
        }

        function renderParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const parallaxX = (mouseX - canvas.width / 2) * 0.015;
            const parallaxY = (mouseY - canvas.height / 2) * 0.015;
            const time = Date.now() * 0.001;

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;
                if (p.y < -10) p.y = canvas.height + 10;
                if (p.y > canvas.height + 10) p.y = -10;

                const drawX = p.x + parallaxX * (p.size * 2);
                const drawY = p.y + parallaxY * (p.size * 2);

                const pulse = Math.sin(time + p.phase) * 0.15;
                const opacity = Math.max(0.03, p.baseOpacity + pulse);

                ctx.beginPath();
                ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);

                if (p.isGold) {
                    ctx.fillStyle = `rgba(223, 160, 76, ${opacity})`;
                } else {
                    ctx.fillStyle = `rgba(200, 190, 220, ${opacity * 0.5})`;
                }
                ctx.fill();
            });

            requestAnimationFrame(renderParticles);
        }
        renderParticles();
    }
    initParticles();

    // --- 3D ROTATION LOGIC ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let dragVelocity = 0;
    let dragTotal = 0;

    let rotation = { x: 0, y: -20 };
    let targetRotation = { x: 0, y: -20 };

    function getActiveLinkAtPoint(x, y) {
        const activeFace = document.querySelector('.face.active');
        if (!activeFace) return null;
        const links = activeFace.querySelectorAll('a');
        for (let link of links) {
            const rect = link.getBoundingClientRect();
            if (x >= rect.left - 15 && x <= rect.right + 15 &&
                y >= rect.top - 15 && y <= rect.bottom + 15) {
                return link;
            }
        }
        return null;
    }

    function getShowcaseButtonAtPoint(x, y) {
        const activeFace = document.querySelector('.face.active');
        if (!activeFace) return null;
        const buttons = activeFace.querySelectorAll('.btn-screens');
        for (let btn of buttons) {
            const rect = btn.getBoundingClientRect();
            if (x >= rect.left - 10 && x <= rect.right + 10 &&
                y >= rect.top - 10 && y <= rect.bottom + 10) {
                return btn;
            }
        }
        return null;
    }

    document.addEventListener('mousedown', (e) => {
        if (projectModal.classList.contains('open')) return;
        dragTotal = 0;
        if (getActiveLinkAtPoint(e.clientX, e.clientY)) return;
        if (getShowcaseButtonAtPoint(e.clientX, e.clientY)) return;
        if (e.target.closest('.face.active')) return;
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
        gsap.killTweensOf(targetRotation);
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };
        dragVelocity = Math.abs(deltaMove.x) + Math.abs(deltaMove.y);
        dragTotal += dragVelocity;
        targetRotation.y += deltaMove.x * 0.5;
        targetRotation.x -= deltaMove.y * 0.5;
        targetRotation.x = Math.max(-20, Math.min(20, targetRotation.x));
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    document.addEventListener('mouseup', (e) => {
        if (projectModal.classList.contains('open')) return;
        isDragging = false;
        snapToClosestFace();
        if (dragTotal < 10) {
            const btn = getShowcaseButtonAtPoint(e.clientX, e.clientY);
            if (btn) {
                const projectId = btn.dataset.project;
                if (projectId) openProjectModal(projectId);
                return;
            }
            const link = getActiveLinkAtPoint(e.clientX, e.clientY);
            if (link) {
                if (link.target === '_blank') {
                    window.open(link.href, '_blank');
                } else if (link.href) {
                    window.location.href = link.href;
                }
            }
        }
    });

    // Touch support
    document.addEventListener('touchstart', (e) => {
        if (projectModal.classList.contains('open')) return;
        dragTotal = 0;
        if (e.touches && e.touches.length > 0) {
            if (getActiveLinkAtPoint(e.touches[0].clientX, e.touches[0].clientY)) return;
            if (getShowcaseButtonAtPoint(e.touches[0].clientX, e.touches[0].clientY)) return;
        }
        if (e.target.closest('.face.active')) return;
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        gsap.killTweensOf(targetRotation);
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        if (e.target.closest('.scrollable-content')) return;
        const deltaMove = {
            x: e.touches[0].clientX - previousMousePosition.x,
            y: e.touches[0].clientY - previousMousePosition.y
        };
        const vel = Math.abs(deltaMove.x) + Math.abs(deltaMove.y);
        dragTotal += vel;
        targetRotation.y += deltaMove.x * 0.4;
        targetRotation.x -= deltaMove.y * 0.4;
        targetRotation.x = Math.max(-20, Math.min(20, targetRotation.x));
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        if (projectModal.classList.contains('open')) return;
        isDragging = false;
        snapToClosestFace();
        if (dragTotal < 10 && e.changedTouches && e.changedTouches.length > 0) {
            const tx = e.changedTouches[0].clientX;
            const ty = e.changedTouches[0].clientY;
            const btn = getShowcaseButtonAtPoint(tx, ty);
            if (btn) {
                const projectId = btn.dataset.project;
                if (projectId) openProjectModal(projectId);
                return;
            }
            const link = getActiveLinkAtPoint(tx, ty);
            if (link) {
                if (link.target === '_blank') {
                    window.open(link.href, '_blank');
                } else if (link.href) {
                    window.location.href = link.href;
                }
            }
        }
    });

    // --- FIX SCROLL IN 3D CONTEXT ---
    // Wheel events can miss .scrollable-content in a CSS 3D scene,
    // so we manually route them to the active face's scrollable area.
    document.addEventListener('wheel', (e) => {
        const activeFace = document.querySelector('.face.active');
        if (!activeFace) return;
        const scrollable = activeFace.querySelector('.scrollable-content');
        if (!scrollable) return;

        const rect = activeFace.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
            scrollable.scrollTop += e.deltaY;
            e.preventDefault();
        }
    }, { passive: false });

    // --- KEYBOARD NAVIGATION ---
    document.addEventListener('keydown', (e) => {
        if (projectModal.classList.contains('open')) {
            if (e.key === 'Escape') closeProjectModal();
            return;
        }
        if (e.key === 'ArrowLeft') {
            targetRotation.y -= 90;
            targetRotation.x = 0;
            updateActiveFace(targetRotation.y);
        }
        if (e.key === 'ArrowRight') {
            targetRotation.y += 90;
            targetRotation.x = 0;
            updateActiveFace(targetRotation.y);
        }
    });

    // --- RENDER LOOP ---
    function render() {
        rotation.x += (targetRotation.x - rotation.x) * 0.1;
        rotation.y += (targetRotation.y - rotation.y) * 0.1;

        const speedX = Math.abs(targetRotation.x - rotation.x);
        const speedY = Math.abs(targetRotation.y - rotation.y);
        const totalSpeed = speedX + speedY;

        monolith.style.transform = `translateZ(-${MONO_HALF}px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;

        const bgPosX = (rotation.y * 2) % 200;
        faces.forEach(face => {
            face.style.setProperty('--reflect-pos', `${bgPosX}%`);
        });

        const bottomFace = document.querySelector('.f-bottom');
        if (bottomFace) {
            let glowLevel = Math.min(totalSpeed * 5, 200);
            if (!isDragging && totalSpeed < 0.5) glowLevel = 0;
            if (isDragging) glowLevel = Math.max(glowLevel, 50 + dragVelocity * 2);
            bottomFace.style.boxShadow = `0 0 ${glowLevel + 50}px rgba(223, 160, 76, ${glowLevel / 200})`;
        }

        dragVelocity *= 0.9;
        requestAnimationFrame(render);
    }
    render();

    // --- SNAP TO FACE ---
    function snapToClosestFace() {
        targetRotation.y = Math.round(targetRotation.y / 90) * 90;
        targetRotation.x = 0;
        updateActiveFace(targetRotation.y);
    }

    function updateActiveFace(angle) {
        faces.forEach(f => f.classList.remove('active'));
        let faceName = "";

        let normalized = angle % 360;
        if (normalized < 0) normalized += 360;

        if (normalized === 0) faceName = 'front';
        if (normalized === 90) faceName = 'left';
        if (normalized === 180) faceName = 'back';
        if (normalized === 270) faceName = 'right';

        const activeFace = document.querySelector(`.face[data-face="${faceName}"]`);
        if (activeFace) activeFace.classList.add('active');

        updateHudPanels(faceName);
    }

    // --- HUD SIDE PANELS ---
    function updateHudPanels(faceName) {
        if (!faceName) {
            hudLeft.classList.remove('visible');
            hudRight.classList.remove('visible');
            return;
        }

        hudLeft.classList.add('visible');
        hudRight.classList.add('visible');

        hudLeft.querySelectorAll('.hud-section').forEach(s => {
            s.classList.toggle('active', s.dataset.for === faceName);
        });
        hudRight.querySelectorAll('.hud-section').forEach(s => {
            s.classList.toggle('active', s.dataset.for === faceName);
        });
    }

    setTimeout(() => { updateActiveFace(0); }, 800);

    // --- PROJECT MODAL ---
    function openProjectModal(projectId) {
        const data = projectData[projectId];
        if (!data) return;

        document.getElementById('modalTitle').textContent = data.title;
        document.getElementById('modalDesc').textContent = data.desc;
        document.getElementById('modalTags').innerHTML = `<span class="m-tag">${data.tags}</span>`;

        const modalLink = document.getElementById('modalLink');
        modalLink.href = data.url;
        if (data.url === '#') {
            modalLink.style.opacity = '0.4';
            modalLink.style.pointerEvents = 'none';
        } else {
            modalLink.style.opacity = '1';
            modalLink.style.pointerEvents = 'auto';
        }

        const gallery = projectModal.querySelector('.modal-gallery');
        if (data.screenshots && data.screenshots.length > 0) {
            gallery.innerHTML = data.screenshots.map(src =>
                `<img src="${src}" alt="${data.title}" style="max-width:100%; max-height:100%; object-fit:contain;">`
            ).join('');
        } else {
            gallery.innerHTML = `
                <div class="gallery-empty">
                    <i class="uil uil-images"></i>
                    <p>Screenshots à venir</p>
                    <span>Les captures d'écran seront ajoutées prochainement</span>
                </div>
            `;
        }

        projectModal.classList.add('open');
    }

    function closeProjectModal() {
        projectModal.classList.remove('open');
    }

    projectModal.querySelector('.modal-close').addEventListener('click', closeProjectModal);
    projectModal.querySelector('.modal-backdrop').addEventListener('click', closeProjectModal);

    document.querySelectorAll('.btn-screens').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const projectId = btn.dataset.project;
            if (projectId) openProjectModal(projectId);
        });
    });

    // --- VEILLE RSS FETCH ---
    async function fetchVeille() {
        const rssContainer = document.getElementById('monolith-rss');
        const CACHE_KEY = 'veille_rss_cache';
        const CACHE_DURATION = 60 * 60 * 1000;

        const queries = [
            'DLSS OR FSR OR XeSS upscaling technology',
            '"Ray Tracing" OR "Path Tracing" GPU performance',
            'NVIDIA RTX AMD Radeon benchmark 2026'
        ];

        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    displayArticles(data, rssContainer);
                    return;
                }
            } catch (e) { /* cache miss */ }
        }

        rssContainer.innerHTML = '<div class="m-loading">SEEKING SIGNAL...</div>';

        try {
            const fetchPromises = queries.map(async (searchQuery) => {
                try {
                    const rssFeedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=fr&gl=FR&ceid=FR:fr`;
                    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssFeedUrl)}`;
                    const response = await fetch(proxyUrl);
                    if (!response.ok) return [];
                    const data = await response.json();
                    if (data.contents) {
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(data.contents, "text/xml");
                        return Array.from(xmlDoc.querySelectorAll("item")).map(item => ({
                            title: item.querySelector("title")?.textContent || "No Title",
                            link: item.querySelector("link")?.textContent || "#",
                            pubDate: item.querySelector("pubDate")?.textContent || ""
                        }));
                    }
                    return [];
                } catch (err) { return []; }
            });

            const results = await Promise.all(fetchPromises);
            const processedData = processArticles(results.flat());

            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: processedData,
                    timestamp: Date.now()
                }));
            } catch (e) { /* cache write failed */ }

            displayArticles(processedData, rssContainer);
        } catch (e) {
            rssContainer.innerHTML = `
                <div class="m-loading">SIGNAL INTERRUPTED_</div>
                <div style="color: var(--t-mid); font-size: 0.75rem; margin-top: 10px;">Erreur de connexion.</div>
            `;
        }
    }

    function processArticles(items) {
        const seenTitles = new Set();
        return items
            .map(item => ({ ...item, cleanTitle: item.title.replace(/ - [^-]+$/, '').trim() }))
            .filter(item => {
                if (seenTitles.has(item.cleanTitle)) return false;
                seenTitles.add(item.cleanTitle);
                return true;
            })
            .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    }

    function displayArticles(uniqueItems, container) {
        if (uniqueItems.length > 0) {
            container.innerHTML = '';
            const limit = Math.min(uniqueItems.length, 12);
            for (let i = 0; i < limit; i++) {
                const item = uniqueItems[i];
                const date = item.pubDate ? new Date(item.pubDate).toLocaleDateString('fr-FR') : "N/A";
                const div = document.createElement('div');
                div.className = 'm-rss-item';
                div.innerHTML = `
                    <span class="m-rss-date">${date} // TECH_SIG</span>
                    <a href="${item.link}" target="_blank" class="m-rss-title">${item.cleanTitle}</a>
                `;
                container.appendChild(div);
                gsap.fromTo(div,
                    { opacity: 0, x: -20 },
                    { opacity: 1, x: 0, duration: 0.8, delay: i * 0.1, ease: "power2.out" }
                );
            }
        } else {
            container.innerHTML = '<div class="m-loading">SIGNAL EMPTY_ RECONFIGURING...</div>';
        }
    }

    fetchVeille();

});
