console.log("Script loaded!");
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM ready");
    // Ensure GSAP is verified
    if (typeof gsap === 'undefined') {
        console.error("GSAP not loaded!");
        alert("System Error: Animation libraries failed to load.");
        return;
    }

    // --- Configuration ---
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwMOmP6Pk425Ufzzp1EqkjYdiPodxzK4_jpWwe929mKd8YtUKDPu-cnXsop1AUobH6Q/exec';

    // --- Elements ---
    console.log("Elements loading...");
    const modal = document.getElementById('modal');
    if (!modal) console.error("CRITICAL: Modal element not found!");

    const openBtn = document.getElementById('openBtn');
    if (!openBtn) console.error("CRITICAL: Open Button not found!");

    const closeBtn = document.getElementById('closeBtn');
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMsg = document.getElementById('successMsg');
    const formStatus = document.getElementById('form-status');

    // --- Animations (Nexus Theme) ---

    // Initial Hero Entrance
    gsap.from("#hero", {
        opacity: 0,
        y: 20,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.2
    });

    // --- Global Click Debugger ---
    document.addEventListener('click', (e) => {
        console.log("Global Click detected on:", e.target);
        console.log("Target ID:", e.target.id);
        console.log("Target Classes:", e.target.className);
    });

    // --- Exposed Function for Inline HTML Call ---
    window.openRegistrationModal = function () {
        console.log("openRegistrationModal() triggered via Inline/Global call");

        const modal = document.getElementById('modal');

        // FORCE VISIBILITY
        modal.classList.remove('hidden'); // REMOVE display: none
        modal.style.display = 'flex';
        modal.style.zIndex = '99999'; // Super high z-index
        modal.classList.remove('pointer-events-none', 'opacity-0');
        modal.style.pointerEvents = 'auto';
        modal.style.opacity = '1';

        // GSAP Animation
        gsap.set(modal, { autoAlpha: 1 });
        gsap.fromTo("#modalContent",
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
        );

        gsap.fromTo("#modalContent > div",
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, delay: 0.2 }
        );

        console.log("Modal opened successfully");
    };

    // Expand Modal (Event Listener Fallback)
    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            console.log("EventListener caught click");
            e.preventDefault(); // Stop any default behavior
            window.openRegistrationModal();
        });
    } else {
        console.error("Open Button (Init_Sequence) not found inside DOMContentLoaded!");
    }

    // Close Modal
    closeBtn.addEventListener('click', () => {
        gsap.to("#modalContent", {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                gsap.set(modal, { autoAlpha: 0 });
                modal.classList.add('pointer-events-none', 'opacity-0');
                modal.classList.add('hidden'); // Add display: none back
                modal.style.pointerEvents = 'none';
                modal.style.display = 'none'; // Clean up
            }
        });
    });

    // --- Form Submission Logic ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Form submitted");

        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader" class="animate-spin w-5 h-5 inline mr-2"></i> COMPILING...';

        // Success Transition
        form.classList.add('hidden');
        successMsg.classList.remove('hidden');
        triggerMatrixEffect("SUCCESSFUL!");

        if (typeof lucide !== 'undefined') {
            try { lucide.createIcons(); } catch (e) { console.warn("Lucide icons failed to load"); }
        }
        formStatus.textContent = '';

        try {
            // SHOTGUN STRATEGY: Use standard FormData which sends as multipart/form-data
            // This populates 'e.parameter' in Google Apps Script reliably.
            const formData = new FormData(form);

            // 1. Add Timestamp manually
            formData.append("Timestamp", new Date().toISOString());

            // 2. Append Capitalized Keys with SANITIZATION
            // Security: Prevent Spreadsheet Formula Injection (CSV Injection)
            // Prepend a single quote if the input starts with =, +, -, or @
            const sanitize = (str) => {
                if (typeof str !== 'string') return str;
                // Regex for dangerous starting characters
                if (/^[=+\-@]/.test(str)) {
                    return "'" + str;
                }
                return str;
            };

            const rawData = Object.fromEntries(formData);
            for (const [key, rawValue] of Object.entries(rawData)) {
                const value = sanitize(rawValue);

                if (key === 'name') formData.append("Name", value);
                if (key === 'roll_number') formData.append("RollNumber", value);
                if (key === 'year') formData.append("Year", value);
                if (key === 'branch') formData.append("Branch", value);
                if (key === 'section') formData.append("Section", value);
                if (key === 'email') formData.append("Email", value);
                if (key === 'mobile') formData.append("Mobile", value);
                if (key === 'transaction_id') formData.append("TransactionID", value);
                if (key === 'expectations') formData.append("Expectations", value);
            }

            console.log("SENDING FORMDATA (Standard Form Submission)...");

            // Log what we are sending for debugging
            for (var pair of formData.entries()) {
                console.log(pair[0] + ', ' + pair[1]);
            }

            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                // NO HEADERS! Browser sets Content-Type: multipart/form-data automatically 
                body: formData
            });

            console.log("Data sent successfully to Sheet");

            // Mock Delay (Optional, you can keep or remove)
            await new Promise(r => setTimeout(r, 1500));

        } catch (error) {
            console.error(error);
            formStatus.textContent = "Error: " + error.message;
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            if (typeof lucide !== 'undefined') {
                try { lucide.createIcons(); } catch (e) { }
            }
        }
    });

    // --- Matrix Text Animation Logic ---
    function triggerMatrixEffect(targetText) {
        const container = document.getElementById('matrix-success');
        const subtext = document.getElementById('success-subtext');
        container.innerHTML = ''; // Clear existing

        const chars = targetText.split('');
        const letterAnimationDuration = 500; // ms
        const letterInterval = 100; // ms gap between starting each letter

        // Create the span elements
        const spans = chars.map((char, i) => {
            const span = document.createElement('span');
            span.style.display = 'inline-block';
            span.style.width = '1ch';
            span.style.textAlign = 'center';
            span.innerText = char === ' ' ? '\u00A0' : char;
            container.appendChild(span);
            return { el: span, finalChar: char, isSpace: char === ' ' };
        });

        // Animate each letter
        spans.forEach((item, index) => {
            if (item.isSpace) return;

            setTimeout(() => {
                // Step 1: Start Matrix Glitch
                const glitchInterval = setInterval(() => {
                    item.el.innerText = Math.random() > 0.5 ? "1" : "0";
                    item.el.style.color = "#4ade80"; // Tailwind green-400
                    item.el.style.textShadow = "0 0 8px rgba(74, 222, 128, 0.8)";
                }, 50);

                // Step 2: Settle on Final Character
                setTimeout(() => {
                    clearInterval(glitchInterval);
                    item.el.innerText = item.finalChar;
                    item.el.style.color = "white";
                    item.el.style.textShadow = "none";

                    // If it's the last letter, fade in the subtext
                    if (index === spans.length - 1) {
                        gsap.to(subtext, { opacity: 1, y: -10, duration: 1 });
                    }
                }, letterAnimationDuration);

            }, index * letterInterval);
        });
    }

    // --- Particle Network Animation ---
    const initParticles = () => {
        const canvas = document.getElementById('bgCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particles = [];
        const particleCount = window.innerWidth < 768 ? 40 : 80;
        const connectionDistance = 150;
        const mouseDistance = 150;

        let mouse = { x: null, y: null };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticleArray();
        });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() * 1 - 0.5) * 0.5;
                this.speedY = (Math.random() * 1 - 0.5) * 0.5;
                this.color = 'rgba(0, 255, 65, 0.6)';
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
                if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;

                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouseDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouseDistance - distance) / mouseDistance;
                    const directionX = forceDirectionX * force * 3;
                    const directionY = forceDirectionY * force * 3;
                    this.x -= directionX;
                    this.y -= directionY;
                }
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticleArray() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function connect() {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        let opacity = 1 - (distance / connectionDistance);
                        ctx.strokeStyle = 'rgba(0, 255, 65,' + (opacity * 0.2) + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            connect();
            requestAnimationFrame(animate);
        }

        initParticleArray();
        animate();
    };

    // Delay slightly to ensure canvas is ready
    setTimeout(initParticles, 100);

});
