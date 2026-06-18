(function () {
  'use strict';

  var currentScript = document.currentScript;
  var hlsVendorUrl = currentScript && currentScript.src
    ? new URL('hls-vendor-dru42stk.js', currentScript.src).href
    : 'assets/hls-vendor-dru42stk.js';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initGlobalSearch() {
    var boxes = document.querySelectorAll('[data-search-box]');
    var index = window.MOVIE_SEARCH_INDEX || [];

    boxes.forEach(function (box) {
      var input = box.querySelector('[data-global-search]');
      var panel = box.querySelector('[data-search-results]');

      if (!input || !panel) {
        return;
      }

      function closePanel() {
        panel.classList.remove('is-open');
        panel.innerHTML = '';
      }

      function renderResults() {
        var query = normalize(input.value);

        if (!query) {
          closePanel();
          return;
        }

        var results = index.filter(function (item) {
          var haystack = normalize([
            item.title,
            item.region,
            item.type,
            item.year,
            item.genre,
            item.category,
            item.oneLine,
            (item.tags || []).join(' ')
          ].join(' '));
          return haystack.indexOf(query) !== -1;
        }).slice(0, 12);

        panel.classList.add('is-open');

        if (!results.length) {
          panel.innerHTML = '<div class="search-result"><span></span><span><strong>未找到匹配影片</strong><span>请换一个片名、地区或类型试试。</span></span></div>';
          return;
        }

        panel.innerHTML = results.map(function (item) {
          return [
            '<a class="search-result" href="' + item.url + '">',
            '  <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '  <span>',
            '    <strong>' + escapeHtml(item.title) + '</strong>',
            '    <span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.category) + '</span>',
            '    <span>' + escapeHtml(item.oneLine || '') + '</span>',
            '  </span>',
            '</a>'
          ].join('');
        }).join('');
      }

      input.addEventListener('input', renderResults);
      input.addEventListener('focus', renderResults);

      document.addEventListener('click', function (event) {
        if (!box.contains(event.target)) {
          closePanel();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initHeroCarousel() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    if (slides.length <= 1) {
      return;
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initLocalFilters() {
    var scopes = document.querySelectorAll('[data-filter-scope]');

    scopes.forEach(function (scope) {
      var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
      var search = scope.querySelector('[data-filter-search]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.filter-card'));
      var emptyState = scope.querySelector('[data-empty-state]');
      var active = 'all';

      function applyFilter() {
        var query = normalize(search ? search.value : '');
        var visibleCount = 0;

        cards.forEach(function (card) {
          var matchType = active === 'all' || normalize(card.dataset.type) === normalize(active);
          var haystack = normalize([
            card.dataset.title,
            card.dataset.type,
            card.dataset.category,
            card.dataset.region,
            card.dataset.year,
            card.textContent
          ].join(' '));
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var visible = matchType && matchQuery;

          card.style.display = visible ? '' : 'none';

          if (visible) {
            visibleCount += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle('is-visible', visibleCount === 0);
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          active = button.dataset.filterValue || 'all';
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          applyFilter();
        });
      });

      if (search) {
        search.addEventListener('input', applyFilter);
      }
    });
  }

  function initMoviePlayers() {
    var players = document.querySelectorAll('[data-player]');

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-player-start]');
      var overlay = player.querySelector('[data-player-overlay]');
      var message = player.querySelector('[data-player-message]');
      var started = false;

      if (!video || !button) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function playVideo() {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
          });
        }
      }

      function attachNative(src) {
        video.src = src;
        video.setAttribute('controls', 'controls');
        video.load();
        playVideo();
      }

      function attachHls(src) {
        setMessage('正在加载播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          attachNative(src);
          setMessage('');
          return;
        }

        import(hlsVendorUrl).then(function (module) {
          var Hls = module.H;

          if (Hls && Hls.isSupported()) {
            var hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });

            player._hlsInstance = hls;
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              setMessage('');
              video.setAttribute('controls', 'controls');
              playVideo();
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
              if (!data || !data.fatal) {
                return;
              }

              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                setMessage('网络加载异常，正在重试...');
                hls.startLoad();
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                setMessage('媒体解码异常，正在恢复...');
                hls.recoverMediaError();
              } else {
                setMessage('播放源暂时无法加载。');
                hls.destroy();
              }
            });
          } else {
            attachNative(src);
            setMessage('');
          }
        }).catch(function () {
          attachNative(src);
          setMessage('');
        });
      }

      function startPlayer() {
        if (started) {
          playVideo();
          return;
        }

        started = true;

        if (overlay) {
          overlay.classList.add('is-hidden');
        }

        var src = video.dataset.src || '';

        if (!src) {
          setMessage('播放源为空。');
          return;
        }

        if (/\.m3u8(\?|$)/i.test(src)) {
          attachHls(src);
        } else {
          attachNative(src);
        }
      }

      button.addEventListener('click', startPlayer);
      video.addEventListener('click', function () {
        if (!started) {
          startPlayer();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initGlobalSearch();
    initHeroCarousel();
    initLocalFilters();
    initMoviePlayers();
  });
})();
