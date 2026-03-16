document.addEventListener('DOMContentLoaded', () => {

    const monolith = document.getElementById('main-monolith');
    const faces = document.querySelectorAll('.face[data-face]');
    const hudLeft = document.getElementById('hudLeft');
    const hudRight = document.getElementById('hudRight');
    const projectModal = document.getElementById('projectModal');

    const MONO_HALF = 400; // was 260

    // --- PROJECT DATA (fill in URLs and screenshots later) ---
    const projectData = {
        'dictee-geante': {
            title: 'La Dictée Géante',
            tags: 'UI/UX Design · Intégration Responsive · Méthode Agile · Git',
            desc: 'Conception et développement du site vitrine pour le jeu de société "La Dictée Géante" (Figma, HTML/CSS/JS). Création de la plateforme événementielle "La Dictée des Voisins" (Inscriptions, Dashboard admin).',
            url: 'https://github.com/Flaimeur/MONSIEURDICTEE',
            liveUrls: [
                { label: 'Site Vitrine', url: 'https://monsieur-dictee.vercel.app' },
                { label: 'Dictée des Voisins', url: 'https://dictee-voisins.vercel.app' }
            ],
            downloadUrls: [
                { label: 'Rapport de stage', url: 'rapport de stage dictée géante.pdf' }
            ],
            screenshots: [
                'assets/screenshots/monsieur_dictee_1.png',
                'assets/screenshots/monsieur_dictee_2.png',
                'assets/screenshots/dictee_voisins_1.png',
                'assets/screenshots/dictee_voisins_2.png'
            ]
        },
        'hopital-pompidou': {
            title: 'Hôpital E. Georges-Pompidou (AP-HP)',
            tags: 'Python (Flask/FastAPI) · Vue 3 · MongoDB · JWT · RGPD',
            desc: 'Stage autour du chatbot médical "Georges" pour l\'HEGP. Développement d\'une architecture Flask + FastAPI, frontend Vue 3, base MongoDB. Sécurisation par JWT et CORS. Interface web responsive et déploiement Nginx (RGPD).',
            url: 'https://github.com/horizonmoine/georges-medical-chatbot',
            liveUrls: [
                { label: 'Tester Georges (Mock)', url: 'https://georges-mock.vercel.app' }
            ],
            downloadUrls: [
                { label: 'Rapport de stage', url: 'Rapport de stage APHP.pdf' }
            ],
            screenshots: [
                'assets/screenshots/georges_chatbot_1.png'
            ]
        },
        'jeu-tir': {
            title: 'Jeu de Tir Interactif',
            tags: 'HTML5 · CSS3 · JavaScript',
            desc: 'Jeu de tir interactif avec canon mobile, système de vent dynamique (rose des vents), scoring par zone et gestion de login. Déplacement latéral du canon et calcul de trajectoire des projectiles.',
            url: 'https://github.com/horizonmoine/jeu-tir',
            liveUrls: [
                { label: 'Jouer en ligne', url: 'projects/jeu-tir/index.html' }
            ],
            screenshots: [
                'assets/screenshots/jeu_tir_1.png'
            ]
        },
        'pharmasi': {
            title: 'PharmaSI',
            tags: 'C# · .NET · MySQL · WinForms',
            desc: 'Application Windows de gestion de rapports de visite pour laboratoires pharmaceutiques. Gestion sécurisée des données (Hashage, prévention des Injections SQL) et système d\'accès par rôles (Visiteur, Délégué, Responsable).',
            url: 'https://github.com/horizonmoine/sprint3',
            downloadUrls: [
                { label: 'Manuel Utilisateur', url: 'Manuel Utilisateur - Application PharmaSI v6.pdf' }
            ],
            screenshots: [
                'assets/screenshots/pharmasi_1.png',
                'assets/screenshots/pharmasi_2.png',
                'assets/screenshots/pharmasi_3.png',
                'assets/screenshots/pharmasi_4.png'
            ]
        },
        'supermarche': {
            title: 'Gestion Supermarché',
            tags: 'PHP · MySQL · HTML/CSS',
            desc: 'Application web de gestion d\'un supermarché avec authentification, gestion de panier, génération de factures et panneau d\'administration complet. Architecture MVC simplifiée avec PDO.',
            url: 'https://github.com/Flaimeur/Supermarche',
            downloadUrls: [
                { label: 'Documentation technique', url: 'documentation-supermarcher.pdf' }
            ],
            screenshots: [
                'assets/screenshots/supermarche_dashboard.png',
                'assets/screenshots/supermarche_login.png',
                'assets/screenshots/supermarche_produits.png',
                'assets/screenshots/supermarche_facture.png'
            ]
        },
        'bballcoach-ai': {
            title: 'BballCoach AI',
            tags: 'Next.js · TypeScript · Supabase · IA',
            desc: 'Application web de coaching basketball assistée par IA. Tracking 3D en temps réel, analyse biomécanique vidéo, comparaison avec joueurs pro, et exercices personnalisés.',
            url: 'https://github.com/horizonmoine/bballcoach-ai-v2-dev',
            liveUrls: [
                { label: 'Tester l\'appli', url: 'https://bballcoach-ai-v2.vercel.app' }
            ],
            screenshots: [
                'assets/screenshots/basket_ai_1.png',
                'assets/screenshots/basket_ai_2.png'
            ]
        }
    };

    // --- ENTRANCE ANIMATION ---
    // Fade out the veil instead of animating opacity on the 3D wrapper
    // (opacity < 1 on preserve-3d flattens perspective in browsers)
    const veil = document.getElementById('intro-veil');
    if (veil) {
        setTimeout(() => veil.classList.add('fade'), 100);
        veil.addEventListener('transitionend', () => veil.remove());
    }

    gsap.set('.instructions', { opacity: 0, y: -10 });
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
        const PARTICLE_COUNT = 150; // Densify the background

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                size: Math.random() * 2 + 0.5,
                baseOpacity: Math.random() * 0.4 + 0.1,
                isGold: Math.random() > 0.82,
                phase: Math.random() * Math.PI * 2
            });
        }

        function renderParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const parallaxX = (mouseX - canvas.width / 2) * 0.015;
            const parallaxY = (mouseY - canvas.height / 2) * 0.015;
            const time = Date.now() * 0.001;

            // Compute positions
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < -20) p.x = canvas.width + 20;
                if (p.x > canvas.width + 20) p.x = -20;
                if (p.y < -20) p.y = canvas.height + 20;
                if (p.y > canvas.height + 20) p.y = -20;

                p.drawX = p.x + parallaxX * (p.size * 2);
                p.drawY = p.y + parallaxY * (p.size * 2);
            });

            // Draw constellation lines
            ctx.lineWidth = 0.6;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].drawX - particles[j].drawX;
                    const dy = particles[i].drawY - particles[j].drawY;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < 15000) {
                        const alpha = (1 - distSq / 15000) * 0.15;
                        ctx.beginPath();
                        if (particles[i].isGold || particles[j].isGold) {
                            ctx.strokeStyle = `rgba(223, 160, 76, ${alpha})`;
                        } else {
                            ctx.strokeStyle = `rgba(200, 190, 220, ${alpha})`;
                        }
                        ctx.moveTo(particles[i].drawX, particles[i].drawY);
                        ctx.lineTo(particles[j].drawX, particles[j].drawY);
                        ctx.stroke();
                    }
                }
            }

            // Draw particles
            particles.forEach(p => {
                const pulse = Math.sin(time + p.phase) * 0.2;
                const opacity = Math.max(0.05, p.baseOpacity + pulse);

                if (p.isGold) {
                    ctx.beginPath();
                    ctx.arc(p.drawX, p.drawY, p.size * 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(223, 160, 76, ${opacity * 0.2})`;
                    ctx.fill();
                }

                ctx.beginPath();
                ctx.arc(p.drawX, p.drawY, p.size, 0, Math.PI * 2);

                if (p.isGold) {
                    ctx.fillStyle = `rgba(223, 160, 76, ${opacity})`;
                } else {
                    ctx.fillStyle = `rgba(200, 190, 220, ${opacity * 0.7})`;
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

    let rotation = { x: 0, y: 0 };
    let targetRotation = { x: 0, y: 0 };

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
            targetRotation.y += 90;
            targetRotation.x = 0;
            updateActiveFace(targetRotation.y);
        }
        if (e.key === 'ArrowRight') {
            targetRotation.y -= 90;
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

    updateActiveFace(0);

    // --- PROJECT MODAL ---
    function openProjectModal(projectId) {
        const data = projectData[projectId];
        if (!data) return;

        document.getElementById('modalTitle').textContent = data.title;
        document.getElementById('modalDesc').textContent = data.desc;
        document.getElementById('modalTags').innerHTML = `<span class="m-tag">${data.tags}</span>`;

        const modalLink = document.getElementById('modalLink');
        modalLink.innerHTML = `<i class="uil uil-github"></i> Code source`;
        modalLink.href = data.url;
        if (data.url === '#') {
            modalLink.style.display = 'none';
        } else {
            modalLink.style.display = 'inline-flex';
        }

        // Handle live links
        const linksContainer = document.getElementById('modalLinksContainer');
        if (linksContainer) {
            linksContainer.innerHTML = '';
            if (data.liveUrls && data.liveUrls.length > 0) {
                data.liveUrls.forEach(l => {
                    const a = document.createElement('a');
                    a.href = l.url;
                    a.target = '_blank';
                    a.className = 'btn-showcase btn-go btn-go-lg';
                    a.style.marginLeft = '10px';
                    a.innerHTML = `<i class="uil uil-external-link-alt"></i> ${l.label}`;
                    linksContainer.appendChild(a);
                });
            }
            if (data.downloadUrls && data.downloadUrls.length > 0) {
                data.downloadUrls.forEach(l => {
                    const a = document.createElement('a');
                    a.href = l.url;
                    a.target = '_blank';
                    a.className = 'btn-showcase btn-go btn-go-lg';
                    a.style.marginLeft = '10px';
                    a.innerHTML = `<i class="uil uil-file-download-alt"></i> ${l.label}`;
                    linksContainer.appendChild(a);
                });
            }
            linksContainer.appendChild(modalLink);
        }

        const gallery = projectModal.querySelector('.modal-gallery');
        if (data.screenshots && data.screenshots.length > 0) {
            gallery.innerHTML = data.screenshots.map(src =>
                `<img class="gallery-img" src="${src}" alt="${data.title}" style="max-height:90%; border-radius:8px; cursor:zoom-in; object-fit:contain; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">`
            ).join('');

            const images = gallery.querySelectorAll('.gallery-img');
            images.forEach(img => {
                img.addEventListener('click', (e) => {
                    const lightbox = document.getElementById('lightboxModal');
                    const lightboxImg = document.getElementById('lightboxImg');
                    if (lightbox && lightboxImg) {
                        lightboxImg.src = e.target.src;
                        lightbox.classList.add('open');
                    }
                });
            });
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
