/*******************************
 * UI — рендеринг элементов
 *******************************/

// Иконка по расширению файла
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = { jpg: '📷', png: '📷', jpeg: '📷', gif: '🎥' };
    return icons[ext] || '🗂️';
}

// Создание DOM‑элемента изображения
function createImageItem(image) {
    const item = document.createElement('div');
    item.className = 'image-item';
    item.dataset.id = image.id;

    const shortUrl = image.url.substring(0, 50) + '...';
    const icon = getFileIcon(image.original_name);
    const date = new Date(image.upload_time).toLocaleDateString();

    item.innerHTML = `
        <div class="image-name">
            <div class="image-icon">${icon}</div>
            <span title="${image.original_name}">${image.original_name}</span>
            <div class="image-meta">
                <span class="image-size">${image.size}</span>
                <span class="image-date">${date}</span>
            </div>
        </div>

        <div class="image-url-wrapper">
            <a class="image-url" href="${image.url}" target="_blank" title="${image.url}">
                ${shortUrl}
            </a>
        </div>

        <div class="image-delete">
            <button class="delete-btn" onclick="handleDelete(${image.id}, '${image.delete_url}')">🗑️</button>
        </div>
    `;

    return item;
}


/*******************************
 * Логика приложения
 *******************************/

// Первичная загрузка изображений
async function syncImagesFromServer() {
    resetImages(); // сбрасываем состояние

    const data = await fetchImages(1, ITEMS_PER_PAGE);
    setImages(data.images || []);

    const list = document.getElementById('images-list');
    list.innerHTML = '';

    const images = getImages();

    // Показать пустой экран, если нет данных
    if (images.length === 0) {
        document.getElementById('empty-state').style.display = 'block';
        return;
    }

    document.getElementById('empty-state').style.display = 'none';

    // Отрисовать список
    images.forEach(img => list.appendChild(createImageItem(img)));

    toggleLoadMore(images.length === ITEMS_PER_PAGE);
}

// Догрузка следующей страницы
async function loadMoreImages() {
    const btn = document.getElementById('load-more-btn');
    btn.disabled = true;
    btn.textContent = 'Загрузка...';

    const page = nextPage();
    const data = await fetchImages(page, ITEMS_PER_PAGE);

    // Если больше нет изображений
    if (!data.images || data.images.length === 0) {
        toggleLoadMore(false);
        return;
    }

    // Добавить в память и DOM
    addImagesToEnd(data.images);

    const list = document.getElementById('images-list');
    data.images.forEach(img => list.appendChild(createImageItem(img)));

    toggleLoadMore(data.images.length === ITEMS_PER_PAGE);
}

// Удаление изображения
async function handleDelete(id, deleteUrl) {
    if (!confirm('Delete this image?')) return;

    const ok = await deleteImageOnServer(deleteUrl);
    if (!ok) {
        alert('Failed to delete');
        return;
    }

    // Удалить из памяти
    removeImageById(id);

    // Удалить из DOM
    const item = document.querySelector(`[data-id="${id}"]`);
    if (item) item.remove();

    // Показать пустой экран, если список пуст
    if (getImages().length === 0) {
        document.getElementById('empty-state').style.display = 'block';
    }
}

// Добавление нового изображения в начало списка
function addNewImage(image) {
    addImageToStart(image);

    const list = document.getElementById('images-list');
    const empty = document.getElementById('empty-state');

    empty.style.display = 'none';
    list.insertBefore(createImageItem(image), list.firstChild);
}

// Управление кнопкой "Загрузить ещё"
function toggleLoadMore(show) {
    const btn = document.getElementById('load-more-btn');
    if (!btn) return;

    btn.style.display = show ? 'block' : 'none';
    btn.disabled = false;
    btn.textContent = 'Загрузить еще';
}


/*******************************
 * Инициализация
 *******************************/

document.addEventListener('DOMContentLoaded', () => {
    syncImagesFromServer();
});
