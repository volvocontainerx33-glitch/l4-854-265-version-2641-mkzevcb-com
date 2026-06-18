(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === heroIndex);
    });
  }

  function startHero() {
    if (slides.length <= 1) {
      return;
    }

    heroTimer = setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var target = Number(dot.getAttribute('data-hero-dot')) || 0;
      showHero(target);
      if (heroTimer) {
        clearInterval(heroTimer);
      }
      startHero();
    });
  });

  showHero(0);
  startHero();

  var filterInput = document.querySelector('[data-card-search]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyResult = document.querySelector('[data-empty-result]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyUrlSearch() {
    if (!filterInput) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q) {
      filterInput.value = q;
    }
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = normalize(filterInput ? filterInput.value : '');
    var selectedYear = yearFilter ? yearFilter.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var year = card.getAttribute('data-year') || '';
      var matchedText = !query || haystack.indexOf(query) !== -1;
      var matchedYear = !selectedYear || selectedYear === year;
      var shouldShow = matchedText && matchedYear;

      card.hidden = !shouldShow;

      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyResult) {
      emptyResult.hidden = visible !== 0;
    }
  }

  applyUrlSearch();

  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilters);
  }

  applyFilters();
})();

function initPlayer(videoSource) {
  var video = document.querySelector('[data-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  var loading = document.querySelector('[data-player-loading]');
  var message = document.querySelector('[data-player-message]');
  var hlsInstance = null;
  var ready = false;

  if (!video || !videoSource) {
    return;
  }

  function setLoading(active) {
    if (loading) {
      loading.hidden = !active;
    }
  }

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
      message.hidden = !text;
    }
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function prepareVideo() {
    if (ready) {
      return;
    }

    ready = true;
    setLoading(true);
    setMessage('');

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hlsInstance.loadSource(videoSource);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setLoading(false);
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setLoading(false);
          setMessage('视频加载失败，请稍后重试');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSource;
      video.addEventListener('loadedmetadata', function () {
        setLoading(false);
      }, { once: true });
      video.addEventListener('error', function () {
        setLoading(false);
        setMessage('视频加载失败，请稍后重试');
      }, { once: true });
    } else {
      setLoading(false);
      setMessage('您的浏览器暂不支持视频播放');
    }
  }

  function startPlayback() {
    prepareVideo();
    hideOverlay();

    var playRequest = video.play();

    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {
        setLoading(false);
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  video.addEventListener('playing', function () {
    setLoading(false);
    hideOverlay();
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
