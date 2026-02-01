/*******************************
 * Константы и состояние
 *******************************/

// Максимальный размер файла (5 Mb)
const MAX_SIZE = 5 * 1024 * 1024;
// Разрешённые MIME-типы
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Текущий URL загруженного изображения (для копирования)
let currentUrl = '';


/*******************************
 * UI — статус и уведомления
 *******************************/

// Показать статус загрузки/ошибки
function showStatus(message, type) {
    const status = document.getElementById('upload-status');
    if (!status) return; // если блока нет — тихо выходим

    status.textContent = message;
    status.className = `upload-status ${type}`;
    status.style.display = 'block';

    // Авто-скрытие для успешных сообщений
    if (type === 'success') {
        setTimeout(() => { status.style.display = 'none'; }, 5000);
    }
}


/*******************************
 * Валидация файла
 *******************************/

// Проверка типа и размера файла
function validateFile(file) {
    if (!ALLOWED_TYPES.includes(file.type)) {
        showStatus('Only .jpg, .png and .gif', 'error');
        return false;
    }
    if (file.size > MAX_SIZE) {
        showStatus('File too large! Maximum file size is 5 Mb.', 'error');
        return false;
    }
    return true;
}


/*******************************
 * Логика обработки файла
 *******************************/

// Основной обработчик файла (drag&drop / input)
async function handleFile(file) {
    if (!file || !validateFile(file)) return;

    showStatus('Uploading...', 'info');

    try {
        const { response, result } = await uploadFile(file);

        if (response.ok) {
            showStatus('Upload successful!', 'success');

            // обновляем глобальное состояние (images-state.js)
            addImageToStart(result.image);

            // обновляем UI списка, если он подключен
            if (typeof addNewImage === 'function') {
                addNewImage(result.image);
            }

            // Обновляем поле с текущим URL
            const input = document.getElementById('current-upload-input');
            if (input) {
                const imageUrl = result.image.url;
                input.value = imageUrl.length > 50
                    ? imageUrl.substring(0, 50) + "..."
                    : imageUrl;
                currentUrl = imageUrl;
            }

            // Сброс input файла
            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
                fileInput.value = '';
            }
        } else {
            showStatus('Upload failed: ' + (result?.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        showStatus('Upload failed: ' + error.message, 'error');
    }
}


/*******************************
 * Копирование URL
 *******************************/

// Копировать URL последнего загруженного изображения
async function copyUrl() {
    if (!currentUrl) return;

    try {
        const host = window.location.origin;
        await navigator.clipboard.writeText(host + currentUrl);
        showStatus('URL copied', 'success');

        const btn = document.getElementById('copy-button');
        if (!btn) return;

        const oldText = btn.textContent;
        btn.textContent = 'Copied';
        setTimeout(() => btn.textContent = oldText, 2000);
    } catch {
        showStatus('Failed to copy URL', 'error');
    }
}


/*******************************
 * Инициализация обработчиков
 *******************************/

document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.querySelector('.send_file button');
    const copyBtn = document.getElementById('copy-button');

    // Если каких-то элементов нет на странице — просто выходим
    if (!dropArea || !fileInput || !browseBtn) {
        return;
    }

    // Drag & drop — наведение
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('dragover');
    });

    // Drag & drop — уход курсора
    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('dragover');
    });

    // Drop файла
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.add('dragover');
        if (e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Выбор файла через input
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    });

    // Клик по кнопке "Выбрать файл"
    browseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('dragover');
        fileInput.click();
    });

    // Кнопка "Copy URL" — если есть
    if (copyBtn) {
        copyBtn.addEventListener('click', copyUrl);
    }
});
