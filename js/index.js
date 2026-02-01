/*******************************
 * Слайдшоу изображений
 *******************************/

const imageEl = document.getElementById('image');
let slideIndex = 0;
let slideTimer = null;

/**
 * Плавно переключает изображение
 */
function changeImage() {
    const images = getImages().map(img => img.url);

    if (images.length === 0) {
        console.warn("No images found for slideshow");
        return;
    }

    // Плавное исчезновение
    imageEl.style.opacity = 0;

    setTimeout(() => {
        imageEl.src = images[slideIndex];
        imageEl.style.opacity = 1;

        slideIndex = (slideIndex + 1) % images.length;
    }, 800);
}

/**
 * Запускает слайдшоу (если есть изображения)
 */
function startSlideShow() {
    const images = getImages();

    if (images.length === 0) {
        console.warn("Slideshow not started — no images");
        return;
    }

    // Первый кадр
    changeImage();

    // Интервал переключения
    slideTimer = setInterval(changeImage, 5000);
}

/**
 * Загружает изображения с сервера и запускает слайдшоу
 */
function loadImages() {
    fetchImages(1, 20)
        .then(data => {
            // сохраняем в глобальный store
            setImages(data.images || []);

            // запускаем слайдшоу
            startSlideShow();
        })
        .catch(err => {
            console.error("Failed to load images:", err);

            // даже если сервер упал — запускаем пустое слайдшоу
            startSlideShow();
        });
}

// Старт
loadImages();
