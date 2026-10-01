// ############## MENU ##############
document.querySelector('.burger__menu').addEventListener('click', function() {  
  this.classList.toggle('burger__menu_active');
  document.querySelector('.nav').classList.toggle('open');
  document.querySelector('.block__body').classList.toggle('collapsed');
});
// close if click
document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', function() {
    document.querySelector('.burger__menu').classList.remove('burger__menu_active');
    document.querySelector('.nav').classList.remove('open');
    document.querySelector('.block__body').classList.remove('collapsed');
  });
});


// ############## DARK THEME ##############
const themeItems = document.querySelectorAll('.theme-selector__item');
function setTheme(theme) {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    themeItems.forEach(item => {
        item.classList.toggle(
            'theme-selector__item--active',
            item.dataset.theme === theme
        );
    });
    localStorage.setItem('theme', theme);
}
themeItems.forEach(item => {
    item.addEventListener('click', (event) => {
        event.preventDefault();
        setTheme(item.dataset.theme);
    });
});
// Restore theme
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);


// ############## PRODUCT CATALOG ##############

document.addEventListener("DOMContentLoaded", function () {

    const catalog = document.querySelector(".block__catalog");
    const reloadButton = document.querySelector(".button__reload");
    const categoryLinks = document.querySelectorAll(".catalog__menu a[id]");

    if (!catalog || !categoryLinks.length) {
        return;
    }

    let products = [];
    let pictures = [];

    let activeCategory = document.querySelector(".catalog__menu a.now");

    if (!activeCategory) {
        activeCategory = categoryLinks[0];
        activeCategory.classList.add("now");
    }

    const MOBILE_LIMIT = 4;

    //  UPLOAD JSON

    async function loadProducts() {
        try {
            const [productsResponse, picturesResponse] = await Promise.all([
                fetch("products.json"),
                fetch("products-pictures.json")
            ]);

            products = await productsResponse.json();
            pictures = await picturesResponse.json();

            renderProducts();

        } catch (error) {
            console.error("Ошибка загрузки каталога:", error);

            catalog.innerHTML = `
                <div class="catalog__error">
                    Error.
                </div>
            `;
        }
    }

    //  UPLOAD IMAGE

    function getProductPicture(product) {

        const picture = pictures.find(function (item) {
            return (
                item.name === product.name &&
                item.category === product.category
            );
        });

        if (picture) {
            return picture.picture;
        }

        return "";
    }

    //  INSERT HTML

    function createProductCard(product) {

        const picture = getProductPicture(product);

        const item = document.createElement("div");
        item.className = "catalog__item";
        item.dataset.category = product.category;

        item.innerHTML = `
            <a href="#" class="open-modal-link red">
                <div class="catalog__picture">
                    <div class="picture-item" style="background-image: url(upload/${picture})"></div>
                </div>

                <div class="catalog__description">
                    <div class="header-3 item-title">
                        ${escapeHTML(product.name)}
                    </div>

                    <p class="tile-description">
                        ${escapeHTML(product.description)}
                    </p>

                    <div class="header-3">
                       $${escapeHTML(product.price)}
                    </div>
                </div>
            </a>
        `;

    // OPEN MODAL

        const link = item.querySelector(".open-modal-link");

        link.addEventListener("click", function (event) {
            event.preventDefault();

            openProductModal(product);
        });

        return item;
    }

    // CREATE LIST OF PRODUCTS ON PAGE

    function renderProducts() {

        if (!activeCategory) {
            return;
        }

        const categoryId = activeCategory.id;

        const categoryProducts = products.filter(function (product) {
            return product.category === categoryId;
        });

        catalog.innerHTML = "";

        if (categoryProducts.length === 0) {
            catalog.innerHTML = `
                <div class="catalog__empty">
                    Empty
                </div>
            `;

            reloadButton.style.display = "none";
            return;
        }

    // RESIZE WINDOW

        const isMobile = window.innerWidth <= 768;

        let visibleProducts;

        if (isMobile) {
            visibleProducts = categoryProducts.slice(0, MOBILE_LIMIT);
        } else {
            visibleProducts = categoryProducts;
        }

        visibleProducts.forEach(function (product) {
            catalog.appendChild(createProductCard(product));
        });

        if (isMobile && categoryProducts.length > MOBILE_LIMIT) {
            reloadButton.style.display = "";
        } else {
            reloadButton.style.display = "none";
        }
    }


    // PRODUCT CATEGORY

    function showAllProducts() {

        if (!activeCategory) {
            return;
        }

        const categoryId = activeCategory.id;

        const categoryProducts = products.filter(function (product) {
            return product.category === categoryId;
        });

        catalog.innerHTML = "";

        categoryProducts.forEach(function (product) {
            catalog.appendChild(createProductCard(product));
        });

        reloadButton.style.display = "none";
    }

    categoryLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            event.preventDefault();

            categoryLinks.forEach(function (item) {
                item.classList.remove("now");
            });

            this.classList.add("now");

            activeCategory = this;

            renderProducts();
        });
    });


    // RELOAD

    if (reloadButton) {

        reloadButton.addEventListener("click", function (event) {

            event.preventDefault();

            showAllProducts();
        });
    }

    let resizeTimer;

    window.addEventListener("resize", function () {

        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(function () {
            renderProducts();
        }, 150);
    });


    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }



    function openProductModal(product) {

        openModal("modal");

    }

    loadProducts();

});



































// ############## SLIDER ##############

document.addEventListener("DOMContentLoaded", function () {
    const banners = document.querySelectorAll(".slider__banner");
    const prevBtn = document.querySelector(".slider__prev a");
    const nextBtn = document.querySelector(".slider__next a");
    const controls = document.querySelectorAll(".slider__bottom-control a");
    let currentIndex = 0;
    let autoSlideInterval;

    const sliderBanners = document.querySelector(".slider__banners");
    sliderBanners.style.position = "relative";

    banners.forEach((banner, i) => {
        banner.style.position = "absolute";
        banner.style.top = "0";
        banner.style.left = "0";
        banner.style.width = "100%";
        banner.style.height = "100%";
        banner.style.transition = "opacity 0.8s ease-in-out";
        banner.style.opacity = i === currentIndex ? "1" : "0";
        banner.style.pointerEvents = i === currentIndex ? "auto" : "none";
    });

    // current slide show
    function showSlide(index) {
        banners.forEach((banner, i) => {
            banner.style.opacity = i === index ? "1" : "0";
            banner.style.pointerEvents = i === index ? "auto" : "none";
        });

        // reload slide
        controls.forEach((control, i) => {
            if (i === index) {
                control.classList.add("active");
            } else {
                control.classList.remove("active");
            }
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % banners.length;
        showSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + banners.length) % banners.length;
        showSlide(currentIndex);
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 4000);
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    nextBtn.addEventListener("click", function (e) {
        e.preventDefault();
        stopAutoSlide();
        nextSlide();
        startAutoSlide();
    });

    prevBtn.addEventListener("click", function (e) {
        e.preventDefault();
        stopAutoSlide();
        prevSlide();
        startAutoSlide();
    });

    // bottom SLIDER navigation
    controls.forEach((control, i) => {
        control.addEventListener("click", function (e) {
            e.preventDefault();
            stopAutoSlide();
            currentIndex = i;
            showSlide(currentIndex);
            startAutoSlide();
        });
    });

    showSlide(currentIndex); // inicialization
    startAutoSlide();
});


// ############## MODAL WINDOW ##############
    // Открытие указанного модального окна
                function openModal(modalId) {
                    document.getElementById(modalId).style.display = 'block';
                }
    
            // Закрытие указанного модального окна
               function closeModal(modalId) {
                    document.getElementById(modalId).style.display = 'none';
}
