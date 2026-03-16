document.addEventListener("DOMContentLoaded", () => {
    
    // UI Elements
    const uiScore = document.getElementById("score");
    const uiTirs = document.getElementById("tirs");
    const rings = document.querySelectorAll('.ring');
    
    // Game Elements
    const cannon = document.getElementById("cannon");
    const boulet = document.getElementById("boulet");
    const fleche = document.getElementById("fleche");
    
    // Controls
    const btnLeft = document.getElementById("Bouton_deplacement_gauche");
    const btnRight = document.getElementById("Bouton_deplacement_droite");
    const btnFire = document.getElementById("Bouton_fire");
    const btnWindControl = document.getElementById("btn-wind-control");
    
    // Game variables
    let score = 0;
    let nbTirs = 0;
    let cannonPos = window.innerWidth / 2;
    let isShooting = false;
    let windForce = 0; // Negative = left, Positive = right
    let isWindSpinning = true;
    let animationStartTime = performance.now();
    let currentRotation = 0;
    let spinAnimationId;
    
    // Initialize cannon position
    cannon.style.left = cannonPos + "px";
    boulet.style.left = cannonPos + "px";

    function calculateWindForce(rotationDegrees) {
        let normalized = rotationDegrees % 360;
        if (normalized < 0) normalized += 360;
        
        if (normalized >= 0 && normalized < 90) return Math.floor(normalized / 4.5);
        if (normalized >= 90 && normalized < 180) return Math.floor((180 - normalized) / 4.5);
        if (normalized >= 180 && normalized < 270) return -Math.floor((normalized - 180) / 4.5);
        if (normalized >= 270 && normalized <= 360) return -Math.floor((360 - normalized) / 4.5);
        return 0;
    }

    // Manual JS animation for the arrow so we can stop it exactly where it is visually
    // and easily resume it.
    fleche.style.animation = "none";
    function animateWind(time) {
        if (!isWindSpinning) return;
        
        // 2000ms per full rotation
        let elapsed = time - animationStartTime;
        currentRotation = (elapsed / 2000) * 360;
        
        fleche.style.transform = `rotate(${currentRotation}deg)`;
        
        // Update wind value continuously while spinning, just visually
        document.getElementById("wind").innerText = "???";
        
        spinAnimationId = requestAnimationFrame(animateWind);
    }
    
    // Start initial spin
    spinAnimationId = requestAnimationFrame(animateWind);

    btnWindControl.addEventListener("click", () => {
        if (isShooting) return; // Cannot toggle wind while a bullet is mid-air
        
        if (isWindSpinning) {
            // Stop the wind
            isWindSpinning = false;
            cancelAnimationFrame(spinAnimationId);
            btnWindControl.innerText = "RELANCER VENT";
            
            // Calculate final wind
            windForce = calculateWindForce(currentRotation);
            document.getElementById("wind").innerText = windForce;
        } else {
            // Relancer
            isWindSpinning = true;
            btnWindControl.innerText = "STOP VENT";
            document.getElementById("wind").innerText = "???";
            windForce = 0;
            
            // Reset start time based on current rotation to avoid jumping
            animationStartTime = performance.now() - ((currentRotation / 360) * 2000);
            spinAnimationId = requestAnimationFrame(animateWind);
        }
    });

    // Movement controls
    btnLeft.addEventListener("click", () => {
        if (!isShooting) {
            cannonPos -= 20;
            updateCannonPosition();
        }
    });

    btnRight.addEventListener("click", () => {
        if (!isShooting) {
            cannonPos += 20;
            updateCannonPosition();
        }
    });

    function updateCannonPosition() {
        cannon.style.left = cannonPos + "px";
        boulet.style.left = cannonPos + "px";
    }

    // Shooting logic
    btnFire.addEventListener("click", () => {
        if (isShooting) return;
        if (isWindSpinning) {
            alert("Arrêtez la rose des vents (STOP VENT) pour verrouiller le vent avant de tirer !");
            return;
        }
        
        isShooting = true;
        nbTirs++;
        uiTirs.innerText = nbTirs;
        
        // Initial setup for the shot
        let currentY = 120; // Bottom offset
        let currentX = cannonPos;
        let windDrift = windForce * 0.5; // Wind effect per frame
        
        boulet.style.height = "20px"; // Make it visible
        
        const shootInterval = setInterval(() => {
            currentY += 15; // Move up
            currentX += windDrift; // Drift sideways
            
            boulet.style.bottom = currentY + "px";
            boulet.style.left = currentX + "px";
            
            if (currentY > window.innerHeight) {
                clearInterval(shootInterval);
                finishShot(currentX, window.innerHeight - currentY);
            }
            
            const bouletRect = boulet.getBoundingClientRect();
            const bouletCenterX = bouletRect.left + (bouletRect.width / 2);
            const bouletCenterY = bouletRect.top + (bouletRect.height / 2);
            
            if (bouletCenterY < window.innerHeight / 2.5) {
                clearInterval(shootInterval);
                finishShot(bouletCenterX, bouletCenterY);
            }
            
        }, 30);
    });

    function finishShot(finalX, finalY) {
        boulet.style.display = "none";
        
        const landingElement = document.elementFromPoint(finalX, finalY);
        
        if (landingElement && landingElement.classList.contains('ring')) {
            const points = parseInt(landingElement.getAttribute('data-points'), 10);
            score += points;
            uiScore.innerText = score;

            const hole = document.createElement('div');
            hole.classList.add('bullet-hole');
            hole.style.left = finalX + "px";
            hole.style.top = finalY + "px";
            document.body.appendChild(hole);
        } else {
            const miss = document.createElement('div');
            miss.classList.add('miss-hole');
            miss.style.left = finalX + "px";
            miss.style.top = finalY + "px";
            document.body.appendChild(miss);
        }
        
        boulet.style.display = "block";
        
        setTimeout(() => {
            isShooting = false;
            boulet.style.height = "0px";
            boulet.style.bottom = "120px";
            updateCannonPosition();
            
            // On ne relance pas le vent automatiquement. 
            // L'utilisateur doit cliquer "RELANCER VENT" s'il le souhaite.
        }, 1000);
    }
});
