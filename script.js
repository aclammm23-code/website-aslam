document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    document.querySelectorAll('[data-year]').forEach((el) => {
        el.textContent = new Date().getFullYear();
    });

    const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach((link) => {
        const href = (link.getAttribute('href') || '').split('/').pop().toLowerCase();
        if (href === currentPage) {
            link.classList.add('is-active');
            link.setAttribute('aria-current', 'page');
        }
    });

    const header = document.querySelector('.site-header');
    const onScroll = () => {
        if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const toggle = document.querySelector('.nav-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const setMenu = (open) => {
        body.classList.toggle('nav-open', open);
        if (toggle) {
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
        }
        if (mobileNav) mobileNav.setAttribute('aria-hidden', String(!open));
    };

    if (toggle) {
        toggle.addEventListener('click', () => setMenu(!body.classList.contains('nav-open')));
    }

    if (mobileNav) {
        mobileNav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setMenu(false));
        });
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) setMenu(false);
    });

    document.querySelectorAll('.work-grid, .gallery-grid, .stats, .rows, .timeline').forEach((group) => {
        [...group.children]
            .filter((item) => item.hasAttribute('data-reveal'))
            .forEach((item, index) => {
                if (!item.style.getPropertyValue('--d')) {
                    item.style.setProperty('--d', `${Math.min(index * 0.06, 0.4)}s`);
                }
            });
    });

    const revealItems = [...document.querySelectorAll('[data-reveal]')];
    const reveal = (items) => items.forEach((item) => item.classList.add('is-visible'));
    const inViewport = (el) => {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight * 0.96 && rect.bottom > 0;
    };

    if ('IntersectionObserver' in window && window.innerHeight > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

        const initiallyVisible = revealItems.filter(inViewport);
        revealItems
            .filter((item) => !initiallyVisible.includes(item))
            .forEach((item) => observer.observe(item));
        reveal(initiallyVisible);
    } else {
        reveal(revealItems);
    }

    const badgeScene = document.querySelector('.badge-scene');
    const badgeCard = document.querySelector('.badge-card');
    if (badgeScene && badgeCard && !reduceMotion.matches && window.matchMedia('(hover: hover)').matches) {
        let targetRotate = 0;
        let targetX = 0;
        let targetY = 0;
        let rotate = 0;
        let offsetX = 0;
        let offsetY = 0;
        let frame = null;

        const render = () => {
            rotate += (targetRotate - rotate) * 0.08;
            offsetX += (targetX - offsetX) * 0.08;
            offsetY += (targetY - offsetY) * 0.08;
            badgeCard.style.setProperty('--badge-rotate', `${rotate.toFixed(2)}deg`);
            badgeCard.style.setProperty('--badge-x', `${offsetX.toFixed(2)}px`);
            badgeCard.style.setProperty('--badge-y', `${offsetY.toFixed(2)}px`);

            const settled = Math.abs(targetRotate - rotate) < 0.02
                && Math.abs(targetX - offsetX) < 0.05
                && Math.abs(targetY - offsetY) < 0.05;
            frame = settled ? null : requestAnimationFrame(render);
        };

        const start = () => {
            if (!frame) frame = requestAnimationFrame(render);
        };

        const track = (event) => {
            const rect = badgeScene.getBoundingClientRect();
            const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width || 1);
            const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height || 1);
            targetRotate = Math.max(-9, Math.min(9, dx * 13));
            targetX = Math.max(-12, Math.min(12, dx * 10));
            targetY = Math.max(-8, Math.min(8, dy * 7));
            start();
        };

        const reset = () => {
            targetRotate = 0;
            targetX = 0;
            targetY = 0;
            start();
        };

        window.addEventListener('pointermove', track, { passive: true });
        document.addEventListener('pointerleave', reset);
        window.addEventListener('blur', reset);
    }

    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const closeButton = lightbox.querySelector('.lightbox-close');
        let lastTrigger = null;

        const openLightbox = (trigger) => {
            const caption = trigger.getAttribute('data-caption') || '';
            const source = trigger.querySelector('img');
            lastTrigger = trigger;
            lightboxImg.src = trigger.getAttribute('data-lightbox');
            lightboxImg.alt = source ? source.alt : caption;
            lightboxCaption.textContent = caption;
            lightbox.classList.add('is-open');
            lightbox.setAttribute('aria-hidden', 'false');
            body.classList.add('no-scroll');
            if (closeButton) closeButton.focus();
        };

        const closeLightbox = () => {
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
            body.classList.remove('no-scroll');
            lightboxImg.src = '';
            if (lastTrigger) lastTrigger.focus();
        };

        document.querySelectorAll('[data-lightbox]').forEach((trigger) => {
            trigger.addEventListener('click', () => openLightbox(trigger));
        });

        lightbox.addEventListener('click', (event) => {
            if (event.target === lightbox || event.target.classList.contains('lightbox-stage')) {
                closeLightbox();
            }
        });

        if (closeButton) closeButton.addEventListener('click', closeLightbox);

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                if (lightbox.classList.contains('is-open')) closeLightbox();
                setMenu(false);
            }
        });
    } else {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') setMenu(false);
        });
    }
});
