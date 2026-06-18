(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-site-nav]');
  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;
    var show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    var run = function () {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    };
    hero.querySelectorAll('[data-hero-next]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.clearInterval(timer);
        show(current + 1);
        run();
      });
    });
    hero.querySelectorAll('[data-hero-prev]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.clearInterval(timer);
        show(current - 1);
        run();
      });
    });
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(index);
        run();
      });
    });
    show(0);
    run();
  }

  document.querySelectorAll('.filter-panel').forEach(function (panel) {
    var grid = document.getElementById(panel.getAttribute('data-grid') || 'movie-grid');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var searchInput = panel.querySelector('[data-search-input]');
    var categorySelect = panel.querySelector('[data-filter-select="category"]');
    var yearSelect = panel.querySelector('[data-filter-select="year"]');
    var empty = panel.querySelector('.empty-state');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && searchInput) {
      searchInput.value = q;
    }
    var apply = function () {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var category = categorySelect ? categorySelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = [card.getAttribute('data-title'), card.getAttribute('data-tags'), card.getAttribute('data-region')].join(' ').toLowerCase();
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okCategory = !category || card.getAttribute('data-category') === category;
        var okYear = !year || card.getAttribute('data-year') === year;
        var ok = okKeyword && okCategory && okYear;
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    };
    [searchInput, categorySelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  });
})();

function initMoviePlayer(options) {
  var video = document.getElementById(options.videoId || 'movie-video');
  var cover = document.getElementById(options.coverId || 'player-cover');
  var button = document.getElementById(options.buttonId || 'play-trigger');
  var stream = options.stream;
  var hlsInstance = null;
  if (!video || !stream) {
    return;
  }
  var start = function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
    video.controls = true;
    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.play().catch(function () {});
      }
      return;
    }
    if (!video.getAttribute('src')) {
      video.setAttribute('src', stream);
    }
    video.play().catch(function () {});
  };
  if (button) {
    button.addEventListener('click', start);
  }
  if (cover) {
    cover.addEventListener('click', start);
  }
  video.addEventListener('click', function () {
    if (!video.currentSrc) {
      start();
    }
  });
}
