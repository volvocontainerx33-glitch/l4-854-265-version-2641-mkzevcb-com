(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupPlayer(shell) {
    var video = shell.querySelector("video");
    var playButton = shell.querySelector("[data-play]");
    var stream = shell.getAttribute("data-stream");
    var hls = null;
    var attached = false;

    if (!video || !stream) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        attached = true;
        return;
      }
      video.src = stream;
      attached = true;
    }

    function play(event) {
      if (event) {
        event.preventDefault();
      }
      attachStream();
      shell.classList.add("is-ready");
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    if (playButton) {
      playButton.addEventListener("click", play);
    }

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
      shell.classList.add("is-ready");
    });

    video.addEventListener("pause", function () {
      shell.classList.remove("is-playing");
    });

    video.addEventListener("ended", function () {
      shell.classList.remove("is-playing");
    });

    shell.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        play(event);
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".js-player")).forEach(setupPlayer);
  });
})();
