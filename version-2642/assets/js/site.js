(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMobileMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    slider.addEventListener("mouseenter", function () {
      clearInterval(timer);
    });
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute("data-title"),
      card.getAttribute("data-year"),
      card.getAttribute("data-region"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags")
    ].join(" "));
  }

  function initFilters() {
    var scope = document.querySelector("[data-filter-scope]");
    if (!scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-tag]"));
    var sort = document.querySelector(".sort-select");
    var empty = document.querySelector(".empty-state");
    var activeTag = "";

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = !activeTag || cardText(card).indexOf(activeTag) !== -1;
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var tag = normalize(button.getAttribute("data-filter-tag"));
        activeTag = activeTag === tag ? "" : tag;
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", normalize(item.getAttribute("data-filter-tag")) === activeTag);
        });
        apply();
      });
    });

    if (sort) {
      sort.addEventListener("change", function () {
        var value = sort.value;
        var sorted = cards.slice().sort(function (a, b) {
          if (value === "title") {
            return normalize(a.getAttribute("data-title")).localeCompare(normalize(b.getAttribute("data-title")), "zh-Hans-CN");
          }
          if (value === "year") {
            return normalize(b.getAttribute("data-year")).localeCompare(normalize(a.getAttribute("data-year")));
          }
          return 0;
        });
        sorted.forEach(function (card) {
          scope.appendChild(card);
        });
      });
    }

    apply();
  }

  function initSearchPage() {
    var input = document.querySelector("[data-search-input]");
    var scope = document.querySelector("[data-search-results]");
    if (!input || !scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var empty = document.querySelector(".empty-state");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || input.value || "";
    input.value = query;

    function apply() {
      var value = normalize(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var ok = !value || cardText(card).indexOf(value) !== -1;
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    input.addEventListener("input", apply);
    apply();
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
