(() => {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-nav]');

    if (menuButton && nav) {
        menuButton.addEventListener('click', () => {
            nav.classList.toggle('is-open');
        });
    }

    const sliders = document.querySelectorAll('[data-hero-slider]');

    sliders.forEach((slider) => {
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        let current = 0;
        let timer = null;

        const showSlide = (index) => {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        const start = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => showSlide(current + 1), 5200);
        };

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                const index = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(index);
                start();
            });
        });

        showSlide(0);
        start();
    });

    const params = new URLSearchParams(window.location.search);
    const urlQuery = params.get('q') || '';
    const filterInputs = Array.from(document.querySelectorAll('[data-filter-input]'));
    const grids = Array.from(document.querySelectorAll('[data-filter-grid]'));
    const emptyMessages = Array.from(document.querySelectorAll('[data-filter-empty]'));

    const applyFilter = (value) => {
        const keyword = String(value || '').trim().toLowerCase();
        let totalVisible = 0;

        grids.forEach((grid) => {
            const cards = Array.from(grid.querySelectorAll('.movie-card'));
            cards.forEach((card) => {
                const text = (card.getAttribute('data-search') || '').toLowerCase();
                const visible = !keyword || text.includes(keyword);
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    totalVisible += 1;
                }
            });
        });

        emptyMessages.forEach((message) => {
            message.classList.toggle('is-visible', grids.length > 0 && totalVisible === 0);
        });
    };

    if (filterInputs.length) {
        filterInputs.forEach((input) => {
            if (urlQuery && !input.value) {
                input.value = urlQuery;
            }
            input.addEventListener('input', () => applyFilter(input.value));
        });

        applyFilter(urlQuery || filterInputs[0].value);
    }

    document.querySelectorAll('[data-quick-filter]').forEach((button) => {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-quick-filter') || '';
            filterInputs.forEach((input) => {
                input.value = value;
            });
            applyFilter(value);
        });
    });

    document.querySelectorAll('[data-clear-filter]').forEach((button) => {
        button.addEventListener('click', () => {
            filterInputs.forEach((input) => {
                input.value = '';
            });
            applyFilter('');
        });
    });
})();
