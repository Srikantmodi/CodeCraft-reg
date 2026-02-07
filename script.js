console.log("Script loaded! v=21");
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM ready");
    if (typeof gsap === 'undefined') {
        console.error("GSAP not loaded!");
        alert("System Error: Animation libraries failed to load.");
        return;
    }

    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwMOmP6Pk425Ufzzp1EqkjYdiPodxzK4_jpWwe929mKd8YtUKDPu-cnXsop1AUobH6Q/exec';

    const modal = document.getElementById('modalScrollArea');
    const openBtn = document.getElementById('openBtn');
    const closeBtn = document.getElementById('closeBtn');
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMsg = document.getElementById('successMsg');
    const formStatus = document.getElementById('form-status');

    gsap.from("#hero", {
        opacity: 0,
        y: 20,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.2
    });

    window.openRegistrationModal = function () {
        console.log("openRegistrationModal() triggered");
        const modal = document.getElementById('modalScrollArea');
        const modalInfo = document.getElementById('modalInfo');
        const form = document.getElementById('registrationForm');
        const successMsg = document.getElementById('successMsg');

        if (modalInfo) modalInfo.style.display = 'flex';
        if (form) {
            form.classList.remove('hidden');
            form.style.display = 'block';
        }
        if (successMsg) {
            successMsg.classList.add('hidden');
            successMsg.style.display = 'none';
        }

        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        modal.style.zIndex = '99999';
        modal.classList.remove('pointer-events-none', 'opacity-0');
        modal.style.pointerEvents = 'auto';
        modal.style.opacity = '1';

        gsap.set(modal, { autoAlpha: 1 });
        gsap.fromTo("#modalContent",
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
        );
    };

    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.openRegistrationModal();
        });
    }

    closeBtn.addEventListener('click', () => {
        gsap.to("#modalContent", {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                const modal = document.getElementById('modalScrollArea');
                gsap.set(modal, { autoAlpha: 0 });
                modal.classList.add('pointer-events-none', 'opacity-0');
                modal.classList.add('hidden');
                modal.style.pointerEvents = 'none';
                modal.style.display = 'none';
            }
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Form submitted");

        const mobileInput = form.mobile.value.trim();
        const emailInput = form.email.value.trim();
        const mobileRegex = /^\d{10}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        formStatus.textContent = '';

        if (!mobileRegex.test(mobileInput)) {
            formStatus.textContent = "ERROR: Mobile number must be exactly 10 digits.";
            gsap.fromTo(form.mobile, { x: -5 }, { x: 5, duration: 0.1, repeat: 3, yoyo: true });
            return;
        }

        if (!emailRegex.test(emailInput)) {
            formStatus.textContent = "ERROR: Please enter a valid email address.";
            gsap.fromTo(form.email, { x: -5 }, { x: 5, duration: 0.1, repeat: 3, yoyo: true });
            return;
        }

        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader" class="animate-spin w-5 h-5 inline mr-2"></i> COMPILING...';

        if (typeof lucide !== 'undefined') {
            try { lucide.createIcons(); } catch (e) { }
        }

        try {
            const formData = new FormData(form);
            formData.append("Timestamp", new Date().toISOString());

            const sanitize = (str) => {
                if (typeof str !== 'string') return str;
                if (/^[=+\-@]/.test(str)) return "'" + str;
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
                if (key === 'expectations') formData.append("Expectations", value);
            }

            console.log("SENDING DATA...");

            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            });

            handleSuccess();

        } catch (error) {
            console.error(error);
            if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
                handleSuccess();
                return;
            }
            formStatus.textContent = "Error: " + error.message;
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });

    function handleSuccess() {
        console.log("Success triggered");

        const modalInfo = document.getElementById('modalInfo');
        if (modalInfo) modalInfo.style.display = 'none';

        const form = document.getElementById('registrationForm');
        const successMsg = document.getElementById('successMsg');
        if (form) form.classList.add('hidden');
        if (successMsg) {
            successMsg.classList.remove('hidden');
            successMsg.style.display = 'flex';
        }

        const scrollArea = document.getElementById('modalScrollArea');
        if (scrollArea && successMsg) {
            // Scroll to the success message
            scrollArea.scrollTo({
                top: successMsg.offsetTop - 40,
                behavior: 'smooth'
            });
        }

        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'REGISTER NOW';

        triggerMatrixEffect("SUCCESSFUL!");
    }

    // --- Matrix Text Animation Logic (USER PROVIDED) ---
    function triggerMatrixEffect(targetText) {
        console.log("MATRIX EFFECT TRIGGERED:", targetText);
        const container = document.getElementById('matrix-success');
        const subtext = document.getElementById('success-subtext');

        if (!container) return;
        container.innerHTML = '';

        const chars = targetText.split('');
        const letterAnimationDuration = 500; // ms
        const letterInterval = 100; // ms gap between starting each letter

        // Create the span elements
        const spans = chars.map((char, i) => {
            const span = document.createElement('span');
            span.style.display = 'inline-block';
            span.style.width = '1ch';
            span.style.textAlign = 'center';
            span.className = 'font-press-start text-codepink'; // Use theme font and color
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
                    item.el.style.color = "#00ff00";
                    item.el.style.textShadow = "0 0 8px rgba(0, 255, 0, 0.8)";
                }, 50);

                // Step 2: Settle on Final Character
                setTimeout(() => {
                    clearInterval(glitchInterval);
                    item.el.innerText = item.finalChar;
                    item.el.className = 'font-press-start text-codepink'; // Theme font and color
                    item.el.style.color = '';
                    item.el.style.textShadow = 'none';

                    // If it's the last letter, fade in the subtext
                    if (index === spans.length - 1) {
                        gsap.to(subtext, { opacity: 1, y: -10, duration: 1 });
                    }
                }, letterAnimationDuration);

            }, index * letterInterval);
        });
    }

    const initParticles = () => {
        const canvas = document.getElementById('bgCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];

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
                this.color = 'rgba(217, 70, 239, 0.6)';
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
                if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticleArray() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];
            for (let i = 0; i < 80; i++) particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animate);
        }

        initParticleArray();
        animate();
    };

    setTimeout(initParticles, 100);
});
