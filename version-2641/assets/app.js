(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');

    if (navToggle && nav) {
        navToggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    document.querySelectorAll('img').forEach(function (img) {
        img.addEventListener('error', function () {
            img.classList.add('image-empty');
        }, { once: true });
    });

    var hero = document.getElementById('heroCarousel');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var active = 0;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === active);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === active);
            });
        };

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
            });
        });

        window.setInterval(function () {
            showSlide(active + 1);
        }, 5600);
    }

    var updateGrid = function (scope) {
        var input = scope.querySelector('.movie-search');
        var chips = Array.prototype.slice.call(scope.querySelectorAll('.filter-chip'));
        var grid = scope.nextElementSibling && scope.nextElementSibling.querySelector('.searchable-grid')
            ? scope.nextElementSibling.querySelector('.searchable-grid')
            : document.querySelector('.searchable-grid');

        if (!input || !grid) {
            return;
        }

        var items = Array.prototype.slice.call(grid.querySelectorAll('.movie-card, .rank-page-item'));
        var chosen = 'all';

        var filter = function () {
            var q = input.value.trim().toLowerCase();

            items.forEach(function (item) {
                var haystack = [
                    item.getAttribute('data-title') || '',
                    item.getAttribute('data-tags') || '',
                    item.getAttribute('data-region') || '',
                    item.getAttribute('data-year') || '',
                    item.getAttribute('data-genre') || '',
                    item.textContent || ''
                ].join(' ').toLowerCase();

                var matchText = !q || haystack.indexOf(q) !== -1;
                var matchChip = chosen === 'all' || haystack.indexOf(chosen.toLowerCase()) !== -1;
                item.classList.toggle('is-hidden', !(matchText && matchChip));
            });
        };

        input.addEventListener('input', filter);

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
                chosen = chip.getAttribute('data-filter') || 'all';
                filter();
            });
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            input.value = query;
            filter();
        }
    };

    document.querySelectorAll('.filter-panel').forEach(updateGrid);

    var startPlayer = function (shell) {
        var video = shell.querySelector('video');
        if (!video) {
            return;
        }

        var source = shell.getAttribute('data-stream');
        var sourceTag = video.querySelector('source');
        var url = source || (sourceTag ? sourceTag.getAttribute('src') : '');

        if (url && window.Hls && window.Hls.isSupported() && !video.dataset.ready) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            video.dataset.ready = '1';
        }

        if (url && !window.Hls && video.canPlayType('application/vnd.apple.mpegurl') && !video.getAttribute('src')) {
            video.setAttribute('src', url);
        }

        shell.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    };

    document.querySelectorAll('.video-shell').forEach(function (shell) {
        var cover = shell.querySelector('.video-cover');
        var video = shell.querySelector('video');

        if (cover) {
            cover.addEventListener('click', function () {
                startPlayer(shell);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                startPlayer(shell);
            }, { once: true });

            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
        }
    });
})();
