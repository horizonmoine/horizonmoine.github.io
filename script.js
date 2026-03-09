document.addEventListener('DOMContentLoaded', () => {

    const monolith = document.getElementById('main-monolith');
    const faces = document.querySelectorAll('.face[data-face]');

    // --- 3D ROTATION LOGIC (DRAG & INERTIA) ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let dragVelocity = 0; // Track velocity to increase glow
    let dragTotal = 0;

    let rotation = { x: 0, y: -20 };
    // Target rotation (for smooth interpolation/easing)
    let targetRotation = { x: 0, y: -20 };

    // Fallback logic for links in 3D that might lose hit-testing
    function getActiveLinkAtPoint(x, y) {
        const activeFace = document.querySelector('.face.active');
        if (!activeFace) return null;
        const links = activeFace.querySelectorAll('a');
        for (let link of links) {
            const rect = link.getBoundingClientRect();
            // 15px padding for easier clicking/tapping
            if (x >= rect.left - 15 && x <= rect.right + 15 &&
                y >= rect.top - 15 && y <= rect.bottom + 15) {
                return link;
            }
        }
        return null;
    }

    document.addEventListener('mousedown', (e) => {
        dragTotal = 0;
        if (getActiveLinkAtPoint(e.clientX, e.clientY)) {
            // we clicked a link, don't initiate drag!
            return;
        }
        if (e.target.closest('.face.active')) return; // Isolate active face for interaction only
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
        gsap.killTweensOf(targetRotation); // Stop auto-aligning if user grabs
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };

        dragVelocity = Math.abs(deltaMove.x) + Math.abs(deltaMove.y);
        dragTotal += dragVelocity;

        // Update target rotation based on drag distance
        targetRotation.y += deltaMove.x * 0.5;
        // Restrict X rotation (pitch) so we don't flip the pillar completely upside down
        targetRotation.x -= deltaMove.y * 0.5;
        targetRotation.x = Math.max(-20, Math.min(20, targetRotation.x));

        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    document.addEventListener('mouseup', (e) => {
        isDragging = false;
        snapToClosestFace();

        // Manual click handling to bypass 3D hit test bugs
        if (dragTotal < 10) {
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
        dragTotal = 0;
        if (e.touches && e.touches.length > 0) {
            if (getActiveLinkAtPoint(e.touches[0].clientX, e.touches[0].clientY)) return;
        }
        if (e.target.closest('.face.active')) return; // Isolate active face for scroll only
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        gsap.killTweensOf(targetRotation);
    });
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;

        // Don't rotate if target is scrollable content
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
    }, { passive: false }); // passive false normally needed to stop scroll if we were intercepting it
    document.addEventListener('touchend', (e) => {
        isDragging = false;
        snapToClosestFace();

        if (dragTotal < 10 && e.changedTouches && e.changedTouches.length > 0) {
            const link = getActiveLinkAtPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            if (link) {
                if (link.target === '_blank') {
                    window.open(link.href, '_blank');
                } else if (link.href) {
                    window.location.href = link.href;
                }
            }
        }
    });

    // Render Loop for buttery smooth movement
    function render() {
        // LERP (Linear Interpolation) for smoothness
        rotation.x += (targetRotation.x - rotation.x) * 0.1;
        rotation.y += (targetRotation.y - rotation.y) * 0.1;

        // Calculate raw speed difference to determine blur/glow intensity
        const speedX = Math.abs(targetRotation.x - rotation.x);
        const speedY = Math.abs(targetRotation.y - rotation.y);
        const totalSpeed = speedX + speedY;

        // Apply rotation
        monolith.style.transform = `translateZ(-200px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;

        // 1. DYNAMIC GLASS REFLECTION (Environment mapping illusion)
        // We move the pseudo-element's background position based on rotation
        const bgPosX = (rotation.y * 2) % 200; // Move gradient
        faces.forEach(face => {
            // GSAP can't easily animate pseudo elements directly every frame without CSS vars
            // We use standard CSS variable injection to handle the before/after
            face.style.setProperty('--reflect-pos', `${bgPosX}%`);
            // We will do a quick CSS override for this variable
        });

        // 2. CORE GLOW INTENSITY
        // As it spins faster, the bottom core glow burns brighter
        const bottomFace = document.querySelector('.f-bottom');
        if (bottomFace) {
            let glowLevel = Math.min(totalSpeed * 5, 200); // Max 200 alpha

            // Resting state implies low glow
            if (!isDragging && totalSpeed < 0.5) glowLevel = 0;
            // Dragging guarantees a base glow
            if (isDragging) glowLevel = Math.max(glowLevel, 50 + dragVelocity * 2);

            bottomFace.style.boxShadow = `0 0 ${glowLevel + 50}px rgba(223, 160, 76, ${glowLevel / 200})`;
        }

        // Decay drag velocity
        dragVelocity *= 0.9;

        requestAnimationFrame(render);
    }
    render();

    // --- SNAP TO FACE LOGIC ---
    function snapToClosestFace() {
        // Find nearest 90-degree multiple directly
        targetRotation.y = Math.round(targetRotation.y / 90) * 90;

        // Reset X to slight tilt for dramatic effect
        targetRotation.x = 0;

        // Activate face
        updateActiveFace(targetRotation.y);
    }

    function updateActiveFace(angle) {
        faces.forEach(f => f.classList.remove('active'));
        let faceName = "";

        // Normalize angle to find which face is facing forward
        let normalized = angle % 360;
        if (normalized < 0) normalized += 360; // Ensure positive modulo

        // Match angle to face (accounting for monolith construction)
        // 0:Front, 90:Left, 180:Back, 270:Right
        if (normalized === 0) faceName = 'front';
        if (normalized === 90) faceName = 'left';
        if (normalized === 180) faceName = 'back';
        if (normalized === 270) faceName = 'right';

        const activeFace = document.querySelector(`.face[data-face="${faceName}"]`);
        if (activeFace) activeFace.classList.add('active');
    }

    // Set initial active face
    setTimeout(() => { updateActiveFace(0); }, 500);


    // --- VEILLE RSS FETCH ---
    async function fetchVeille() {
        const rssContainer = document.getElementById('monolith-rss');
        const CACHE_KEY = 'veille_rss_cache';
        const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in ms

        // Optimized: 3 highly targeted queries
        const queries = [
            'DLSS OR FSR OR XeSS upscaling technology',
            '"Ray Tracing" OR "Path Tracing" GPU performance',
            'NVIDIA RTX AMD Radeon benchmark 2026'
        ];

        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                const { data, timestamp } = JSON.parse(cached);
                const age = Date.now() - timestamp;

                if (age < CACHE_DURATION) {
                    console.log(`✓ Loading from cache (${Math.round(age / 1000)}s old)`);
                    displayArticles(data, rssContainer);
                    return; // Use cache, skip fetch
                } else {
                    console.log('Cache expired, fetching fresh data...');
                }
            } catch (e) {
                console.warn('Cache parse error:', e);
            }
        }

        console.log("Fetching RSS feeds in parallel...");
        rssContainer.innerHTML = '<div class="m-loading">SEEKING SIGNAL...</div>';

        try {
            // Parallel fetch for speed
            const fetchPromises = queries.map(async (searchQuery) => {
                try {
                    const rssFeedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=fr&gl=FR&ceid=FR:fr`;
                    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssFeedUrl)}`;

                    console.log(`⚡ Fetching: ${searchQuery}`);
                    const response = await fetch(proxyUrl);

                    if (!response.ok) {
                        console.warn(`Failed: ${searchQuery} (${response.status})`);
                        return [];
                    }

                    const data = await response.json();

                    if (data.contents) {
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(data.contents, "text/xml");
                        const items = xmlDoc.querySelectorAll("item");
                        const parsedItems = Array.from(items).map(item => ({
                            title: item.querySelector("title")?.textContent || "No Title",
                            link: item.querySelector("link")?.textContent || "#",
                            pubDate: item.querySelector("pubDate")?.textContent || ""
                        }));
                        console.log(`✓ Got ${parsedItems.length} items from: ${searchQuery}`);
                        return parsedItems;
                    }
                    return [];
                } catch (err) {
                    console.error(`Error on ${searchQuery}:`, err);
                    return [];
                }
            });

            const results = await Promise.all(fetchPromises);
            const allItems = results.flat();
            console.log(`✓ Total fetched: ${allItems.length} articles`);

            // Process and cache
            const processedData = processArticles(allItems);

            // Save to cache
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: processedData,
                    timestamp: Date.now()
                }));
                console.log('✓ Cached for future visits');
            } catch (e) {
                console.warn('Failed to cache:', e);
            }

            displayArticles(processedData, rssContainer);
        } catch (e) {
            console.error('RSS Fetch critical error:', e);
            rssContainer.innerHTML = `
                <div class="m-loading">SIGNAL INTERRUPTED_</div>
                <div style="color: #888; font-size: 0.75rem; margin-top: 10px;">
                    Erreur de connexion. Vérifiez la console (F12) pour plus de détails.
                </div>
            `;
        }
    }

    // Process articles: deduplicate and sort
    function processArticles(items) {
        const seenTitles = new Set();
        return items
            .map(item => {
                const cleanTitle = item.title.replace(/ - [^-]+$/, '').trim();
                return { ...item, cleanTitle };
            })
            .filter(item => {
                if (seenTitles.has(item.cleanTitle)) return false;
                seenTitles.add(item.cleanTitle);
                return true;
            })
            .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    }

    // Display articles with animation
    function displayArticles(uniqueItems, container) {
        if (uniqueItems.length > 0) {
            container.innerHTML = '';
            const limit = Math.min(uniqueItems.length, 12);

            console.log(`📰 Displaying ${limit} articles`);

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
            console.log('✓ RSS feed loaded successfully');
        } else {
            console.warn('No items found');
            container.innerHTML = '<div class="m-loading">SIGNAL EMPTY_ RECONFIGURING...</div>';
        }
    }

    fetchVeille();

});
