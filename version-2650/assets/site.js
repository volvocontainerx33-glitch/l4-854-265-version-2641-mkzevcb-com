(function () {
  var toggle = document.querySelector(".nav-toggle");
  var panel = document.querySelector(".mobile-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "☰";
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide")) || 0);
        startTimer();
      });
    });

    var prev = hero.querySelector(".hero-arrow.prev");
    var next = hero.querySelector(".hero-arrow.next");
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }
    startTimer();
  }

  function applyFilters(root) {
    var input = root.querySelector(".filter-input");
    var select = root.querySelector(".filter-select");
    var cards = Array.prototype.slice.call(root.querySelectorAll(".filter-grid .movie-card"));
    if (!cards.length) {
      return;
    }

    function update() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var year = select ? select.value : "";
      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !year || cardYear === year;
        card.style.display = matchKeyword && matchYear ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", update);
    }
    if (select) {
      select.addEventListener("change", update);
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll(".content-section"), applyFilters);

  var results = document.getElementById("search-results");
  if (results && window.siteSearchItems) {
    var state = document.getElementById("search-state");
    var input = document.getElementById("search-page-input");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (input) {
      input.value = q;
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>\"]/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;"
        }[char];
      });
    }

    function render(items) {
      results.innerHTML = items.map(function (item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
          return '<span class="tag">' + escapeHtml(tag) + '</span>';
        }).join("");
        return '<article class="movie-card">' +
          '<a class="poster-link" href="' + escapeHtml(item.link) + '">' +
          '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="poster-shade"></span><span class="play-pill">▶</span>' +
          '<span class="year-badge">' + escapeHtml(item.year) + '</span></a>' +
          '<div class="card-body"><h3><a href="' + escapeHtml(item.link) + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<p>' + escapeHtml(item.oneLine) + '</p>' +
          '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
          '<div class="tag-row">' + tags + '</div></div></article>';
      }).join("");
    }

    function search(query) {
      var keyword = query.trim().toLowerCase();
      if (!keyword) {
        state.textContent = "请输入关键词开始搜索。";
        results.innerHTML = "";
        return;
      }
      var matched = window.siteSearchItems.filter(function (item) {
        var text = [item.title, item.year, item.region, item.type, item.genre, item.category, item.oneLine, (item.tags || []).join(" ")].join(" ").toLowerCase();
        return text.indexOf(keyword) !== -1;
      });
      state.textContent = matched.length ? "已找到相关影片，可点击进入详情。" : "没有找到匹配影片，换个关键词试试。";
      render(matched.slice(0, 120));
    }

    search(q);
  }
}());
