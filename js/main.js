document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const menuBtn = document.querySelector('[data-menu-btn]');
    const menu = document.querySelector('[data-menu]');
    
    if (menuBtn && menu) {
        menuBtn.addEventListener('click', () => {
            const expanded = menuBtn.getAttribute('aria-expanded') === 'true' || false;
            menuBtn.setAttribute('aria-expanded', !expanded);
            menu.classList.toggle('hidden');
            menu.classList.toggle('flex');
        });
    }

    // 2. Portfolio Filtering
    const filterBtns = document.querySelectorAll('[data-filter]');
    const projectCards = document.querySelectorAll('[data-card]');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active classes
                filterBtns.forEach(b => b.classList.remove('bg-neutral-900', 'text-white'));
                filterBtns.forEach(b => b.classList.add('bg-white', 'text-neutral-900'));
                
                // Add active class
                btn.classList.remove('bg-white', 'text-neutral-900');
                btn.classList.add('bg-neutral-900', 'text-white');

                const filter = btn.getAttribute('data-filter');
                
                projectCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // 3. Lightbox Logic
    const lightbox = document.querySelector('[data-lightbox]');
    const lightboxImg = document.querySelector('[data-lightbox-img]');
    const openBtns = document.querySelectorAll('[data-lightbox-open]');
    const closeBtn = document.querySelector('[data-lightbox-close]');

    if (lightbox) {
        openBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const imgSrc = btn.querySelector('img').src;
                lightboxImg.src = imgSrc;
                lightbox.classList.remove('hidden');
                lightbox.classList.add('flex');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeLightbox = () => {
            lightbox.classList.add('hidden');
            lightbox.classList.remove('flex');
            document.body.style.overflow = 'auto';
        };

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    // 4. FAQ Accordion
    const accButtons = document.querySelectorAll('[data-acc-btn]');
    accButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const panel = btn.nextElementSibling;
            const icon = btn.querySelector('span:last-child');
            const isOpen = panel.style.maxHeight;

            // Close all other panels
            accButtons.forEach(otherBtn => {
                const otherPanel = otherBtn.nextElementSibling;
                otherPanel.style.maxHeight = null;
                otherBtn.querySelector('span:last-child').style.transform = 'rotate(0deg)';
            });

            if (!isOpen) {
                panel.style.maxHeight = panel.scrollHeight + "px";
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // 5. Contact Form & Email Copy
    const copyBtn = document.querySelector('[data-copy-email]');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const email = "setvik776@gmail.com";
            navigator.clipboard.writeText(email).then(() => {
                const originalText = copyBtn.innerText;
                copyBtn.innerText = "Email Copied!";
                setTimeout(() => copyBtn.innerText = originalText, 2000);
            }).catch(() => {
                window.location.href = `mailto:${email}`;
            });
        });
    }

    const contactForm = document.querySelector('[data-contact-form]');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const type = formData.get('type');
            const message = formData.get('message');
            
            const subject = encodeURIComponent(`Inquiry for ${type} Session - ${name}`);
            const body = encodeURIComponent(message);
            
            window.location.href = `mailto:setvik776@gmail.com?subject=${subject}&body=${body}`;
        });
    }
});
