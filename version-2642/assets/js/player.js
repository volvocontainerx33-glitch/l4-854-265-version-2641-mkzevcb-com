var StaticPlayer = (function () {
  function loadScript(src, done) {
    if (window.Hls) {
      done();
      return;
    }
    var existing = document.querySelector("script[data-hls-loader]");
    if (existing) {
      existing.addEventListener("load", done, { once: true });
      return;
    }
    var script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.setAttribute("data-hls-loader", "true");
    script.addEventListener("load", done, { once: true });
    document.head.appendChild(script);
  }

  function attach(video, src, start) {
    if (video.__staticPlayerReady) {
      if (start) {
        play(video);
      }
      return;
    }
    video.__staticPlayerReady = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      if (start) {
        play(video);
      }
      return;
    }
    loadScript("https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js", function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        video.__hls = hls;
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (start) {
            play(video);
          }
        });
        return;
      }
      video.src = src;
      if (start) {
        play(video);
      }
    });
  }

  function play(video) {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function init(src) {
    var frame = document.querySelector(".player-frame");
    var video = document.querySelector(".player-frame video");
    var button = document.querySelector(".player-start");
    if (!frame || !video || !button || !src) {
      return;
    }
    function start() {
      button.classList.add("is-hidden");
      attach(video, src, true);
    }
    button.addEventListener("click", start);
    frame.addEventListener("click", function (event) {
      if (event.target === frame) {
        start();
      }
    });
    video.addEventListener("click", function () {
      attach(video, src, false);
      if (video.paused) {
        play(video);
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
  }

  return {
    init: init
  };
})();
