(function ($) {
  "use strict";

  /*
  |==============================================
  | Template Name: Velisse
  | Author: peterdraw
  | Version: 1.0.0
  |==============================================
  |==============================================
  | TABLE OF CONTENTS:
  |==============================================
  |
  | 01. Preloader
  | 02. Mobile Menu
  | 03. Sticky Header
  | 04. Slick Slider
  | 05. Accordian
  | 06. Light Gallery
  | 07. Isotop
  | 08. Counter Animation
  | 09. Custom Mouse Pointer
  | 10. Tabs
  | 11. Parallux Image 
  | 12. Smooth Page Scroll
  | 13. Invert Text
  | 14. Dynamic contact form
  | 15. Scroll Up
  |
  */

  /*==============================================
    Scripts initialization
  ===============================================*/
  $.exists = function (selector) {
    return $(selector).length > 0;
  };

  $(window).on("load", function () {
    preloader();
    isotopInit();
    smoothScroll();
    paralluxInit();
  });

  $(function () {
    mainNav();
    stickyHeader();
    slickInit();
    accordian();
    lightGallery();
    counterInit();
    customMousePointer();
    tabs();
    shadowTextInit();
    dynamicFormSubmission();
    scrollUp();
    if ($.exists(".wow")) {
      new WOW().init();
    }
    $(".cs_award").hover(function () {
      $(this).addClass("active");
      $(this).siblings(".cs_award").removeClass("active");
    });
  });

  $(window).on("scroll", function () {
    stickyHeader();
    showScrollUp();
  });

  /*==============================================
    01. Preloader
  ===============================================*/
  function preloader() {
    $(".cs_preloader").fadeOut();
    $(".cs_preloader_in").delay(150).fadeOut("slow");
    if (typeof gsap === "undefined") return;

    const textEl = document.querySelector(".cs_loading_text");
    if (!textEl) return;

    if (textEl.classList.contains("is-animated")) return;
    textEl.classList.add("is-animated");

    // Split text
    const text = textEl.textContent.trim();
    textEl.textContent = "";

    text.split("").forEach((char) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char;
      span.style.display = "inline-block";
      textEl.appendChild(span);
    });

    const letters = textEl.querySelectorAll("span");

    // Timeline (infinite)
    const tl = gsap.timeline({ repeat: -1 });

    // 🔹 IN: from RIGHT (first → last)
    tl.fromTo(
      letters,
      {
        x: 40,
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        stagger: 0.1, // first letter enters first
        ease: "power3.out",
        duration: 0.5,
        delay: 0.5,
      }
    )

      // 🔹 OUT: to RIGHT
      .to(
        letters,
        {
          x: 40,
          opacity: 0,
          stagger: {
            each: 0.1,
            from: "end", // first letter exits first
          },
          ease: "power2.in",
          duration: 0.5,
        },
        "+=0.4"
      );
  }
  /*==============================================
    02. Mobile Menu
  ===============================================*/
  function mainNav() {
    $(".cs_nav").append('<span class="cs_menu_toggle"><span></span></span>');
    $(".menu-item-has-children").append(
      '<span class="cs_munu_dropdown_toggle"><span></span></span>'
    );
    $(".cs_menu_toggle").on("click", function () {
      $(this)
        .toggleClass("cs_toggle_active")
        .siblings(".cs_nav_list_wrap")
        .toggleClass("cs_active");
    });
    $(".cs_munu_dropdown_toggle").on("click", function () {
      $(this).toggleClass("active").siblings("ul").slideToggle();
      $(this).parent().toggleClass("active");
    });
    // Search Toggle
    $(".cs_search_tobble_btn").on("click", function () {
      $(".cs_header_form_wrap").toggleClass("active");
    });
    $(".cs_header_form_overlay").on("click", function () {
      $(".cs_header_form_wrap").removeClass("active");
    });
  }
  /*==============================================
    03. Sticky Header
  ===============================================*/
  function stickyHeader() {
    var scroll = $(window).scrollTop();
    if (scroll >= 10) {
      $(".cs_sticky_header").addClass("cs_sticky_active");
    } else {
      $(".cs_sticky_header").removeClass("cs_sticky_active");
    }
  }
  /*==============================================
    04. Slick Slider
  ===============================================*/
  function slickInit() {
    if ($.exists(".cs_slider")) {
      $(".cs_slider").each(function () {
        // Slick Variable
        var $ts = $(this).find(".cs_slider_container");
        var $slickActive = $(this).find(".cs_slider_wrapper");
        var $status = $(this).find(".cs_slider_number");
        // Auto Play
        var autoPlayVar = parseInt($ts.attr("data-autoplay"), 10);
        // Auto Play Time Out
        var autoplaySpdVar = 3000;
        if (autoPlayVar > 1) {
          autoplaySpdVar = autoPlayVar;
          autoPlayVar = 1;
        }
        // Slide Change Speed
        var speedVar = parseInt($ts.attr("data-speed"), 10) || 600;
        // Slider Loop
        var loopVar = Boolean(parseInt($ts.attr("data-loop"), 10));
        // Slider Center
        var centerVar = Boolean(parseInt($ts.attr("data-center"), 10));
        // Variable Width
        var variableWidthVar = Boolean(
          parseInt($ts.attr("data-variable-width"), 10)
        );
        // Pagination
        var paginaiton = $(this)
          .find(".cs_pagination")
          .hasClass("cs_pagination");
        // Slide Per View
        var slidesPerView = $ts.attr("data-slides-per-view");
        if (slidesPerView == 1) {
          slidesPerView = 1;
        }
        if (slidesPerView == "responsive") {
          var slidesPerView = parseInt($ts.attr("data-add-slides"), 10);
          var lgPoint = parseInt($ts.attr("data-lg-slides"), 10);
          var mdPoint = parseInt($ts.attr("data-md-slides"), 10);
          var smPoint = parseInt($ts.attr("data-sm-slides"), 10);
          var xsPoing = parseInt($ts.attr("data-xs-slides"), 10);
        }
        // Fade Slider
        var fadeVar = parseInt($($ts).attr("data-fade-slide"));
        fadeVar === 1 ? (fadeVar = true) : (fadeVar = false);
        /* Start Count Slide Number */
        $slickActive.on(
          "init reInit afterChange",
          function (event, slick, currentSlide, nextSlide) {
            var i = (currentSlide ? currentSlide : 0) + 1;
            $status.html(
              `<span class="cs_current_number" data-number="${i}"><span>${i}</span></span> <span class="cs_slider_number_seperator">/</span> <span class="cs_total_numbers"  data-number="${slick.slideCount}"><span>${slick.slideCount}</span></span>`
            );
          }
        );
        /* End Count Slide Number */
        // Slick Active Code
        $slickActive.slick({
          autoplay: autoPlayVar,
          dots: paginaiton,
          centerPadding: "28%",
          speed: speedVar,
          infinite: loopVar,
          autoplaySpeed: autoplaySpdVar,
          centerMode: centerVar,
          fade: fadeVar,
          prevArrow: $(this).find(".cs_left_arrow"),
          nextArrow: $(this).find(".cs_right_arrow"),
          appendDots: $(this).find(".cs_pagination"),
          slidesToShow: slidesPerView,
          variableWidth: variableWidthVar,
          swipeToSlide: true,
          responsive: [
            {
              breakpoint: 1600,
              settings: {
                slidesToShow: lgPoint,
              },
            },
            {
              breakpoint: 1200,
              settings: {
                slidesToShow: mdPoint,
              },
            },
            {
              breakpoint: 992,
              settings: {
                slidesToShow: smPoint,
              },
            },
            {
              breakpoint: 768,
              settings: {
                slidesToShow: xsPoing,
              },
            },
          ],
        });
      });
    }
  }
  /*==============================================
    05. Accordian
  ================================================*/
  function accordian() {
    $(".cs_accordian").children(".cs_accordian_body").hide();
    $(".cs_accordian.active").children(".cs_accordian_body").show();
    $(".cs_accordian_head").on("click", function () {
      const parent = $(this).closest(".cs_accordian");

      parent
        .addClass("active")
        .siblings(".cs_accordian")
        .removeClass("active")
        .find(".cs_accordian_body")
        .slideUp(250);

      parent.find(".cs_accordian_body").slideDown(250);
    });
  }
  /*==============================================
    06. Light Gallery
  ===============================================*/
  function lightGallery() {
    $(".cs_lightgallery").each(function () {
      $(this).lightGallery({
        selector: ".cs_gallery_item",
        subHtmlSelectorRelative: false,
        thumbnail: false,
        mousewheel: true,
      });
    });
  }
  /*==============================================
    07. Isotop
  ===============================================*/
  function isotopInit() {
    if ($.exists(".cs_isotop")) {
      $(".cs_isotop").isotope({
        itemSelector: ".cs_isotop_item",
        transitionDuration: "0.60s",
        percentPosition: true,
        masonry: {
          columnWidth: ".cs_grid_sizer",
        },
      });
      /* Active Class of Portfolio*/
      $(".cs_isotop_filter ul li").on("click", function (event) {
        $(this).siblings(".active").removeClass("active");
        $(this).addClass("active");
        event.preventDefault();
      });
      /*=== Portfolio filtering ===*/
      $(".cs_isotop_filter ul").on("click", "a", function () {
        var filterElement = $(this).attr("data-filter");
        $(".cs_isotop").isotope({
          filter: filterElement,
        });
      });
    }
  }
  /*==============================================
    08. Counter Animation
  ==================================================*/
  function counterInit() {
    const items = $(".odometer");
    if (!items.length) return;

    let firedItems = new Set();

    $(window).on("scroll", function () {
      items.each(function () {
        if (firedItems.has(this)) return;

        if (
          $(this).offset().top <
          $(window).scrollTop() + $(window).height() / 1.2
        ) {
          $(this).html($(this).data("count-to"));
          firedItems.add(this);
        }
      });
    });
  }
  /*==============================================
    09. Custom Mouse Pointer
  ================================================*/
  function customMousePointer() {
    $(".cs_custom_pointer_wrap").each(function () {
      $(this).on("mousemove", function (e) {
        let mouseX = e.pageX - $(this).offset().left;
        let mouseY = e.pageY - $(this).offset().top;

        $(this)
          .find(".cs_mouse_point")
          .css({
            top: mouseY + "px",
            left: mouseX + "px",
          });
      });
    });
  }
  /*==============================================
    10. Tabs
  ================================================*/
  function tabs() {
    $(".cs_tabs .cs_tab_links a").on("click", function (e) {
      e.preventDefault();
      var currentAttrValue = $(this).attr("href");
      $(".cs_tabs " + currentAttrValue)
        .fadeIn(400)
        .siblings()
        .hide();
      $(this).parents("li").addClass("active").siblings().removeClass("active");
    });
  }
  /*==============================================
		11. Parallux Image 
	===============================================*/
  function paralluxInit() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      return;
    }

    const items = document.querySelectorAll("[data-parallax]");
    if (!items.length) return;

    items.forEach((el) => {
      const speed = parseFloat(el.dataset.speed) || 0.6;

      gsap.to(el, {
        yPercent: speed * 100 * -0.6,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    });
  }
  /*===============================================
    12. Smooth Page Scroll
  =================================================*/
  function smoothScroll() {
    if (typeof Lenis === "undefined") return;

    // Reduced motion respect
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Prevent multiple init
    if (window.lenisInstance) return;

    const lenis = new Lenis({
      duration: 1.2,
      smooth: true,
      smoothTouch: false,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });

    window.lenisInstance = lenis;

    // GSAP + ScrollTrigger integration

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }
  /*=============================================
	  13. Invert Text      
 =============================================*/
  function shadowTextInit() {
    // GSAP + plugins check
    if (
      typeof gsap === "undefined" ||
      typeof ScrollTrigger === "undefined" ||
      typeof SplitText === "undefined"
    ) {
      return;
    }

    const elements = document.querySelectorAll(".cs_invert_text");
    if (!elements.length) return;

    elements.forEach((el) => {
      // Avoid duplicate init
      if (el.classList.contains("is-splitted")) return;
      el.classList.add("is-splitted");

      // Split text once
      const split = new SplitText(el, {
        type: "lines",
        linesClass: "cs_split_line",
      });

      // Use GSAP context for auto cleanup
      gsap.context(() => {
        split.lines.forEach((line) => {
          gsap.to(line, {
            backgroundPositionX: "0%",
            ease: "none",
            scrollTrigger: {
              trigger: line,
              start: "top 85%",
              end: "bottom 60%",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });
        });
      }, el);
    });

    // Refresh once after all splits
    ScrollTrigger.refresh();
  }
  /*==============================================
    14. Dynamic contact form
  ===============================================*/
  function dynamicFormSubmission() {
    if ($.exists("#cs_form")) {
      const form = document.getElementById("cs_form");
      const result = document.getElementById("cs_result");

      form.addEventListener("submit", function (e) {
        const formData = new FormData(form);
        e.preventDefault();
        var object = {};
        formData.forEach((value, key) => {
          object[key] = value;
        });
        var json = JSON.stringify(object);
        result.innerHTML = "Please wait...";

        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: json,
        })
          .then(async (response) => {
            let json = await response.json();
            if (response.status == 200) {
              result.innerHTML = json.message;
            } else {
              console.log(response);
              result.innerHTML = json.message;
            }
          })
          .catch((error) => {
            console.log(error);
            result.innerHTML = "Something went wrong!";
          })
          .then(function () {
            form.reset();
            setTimeout(() => {
              result.style.display = "none";
            }, 5000);
          });
      });
    }
  }
  /*=============================================
   15. Scroll Up
  ===============================================*/
  function scrollUp() {
    $(".cs_scrollup").on("click", function (e) {
      e.preventDefault();
      $("html,body").animate(
        {
          scrollTop: 0,
        },
        0
      );
    });
  }

  /* For Scroll Up */
  function showScrollUp() {
    let scroll = $(window).scrollTop();
    if (scroll >= 350) {
      $(".cs_scrollup").addClass("active");
    } else {
      $(".cs_scrollup").removeClass("active");
    }
  }
})(jQuery); // End of use strict
