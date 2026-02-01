/*******************************
 * API — запросы к серверу
 *******************************/

// Получить список изображений
async function fetchImages(page, perPage) {
    const res = await fetch(`/api/images?page=${page}&per_page=${perPage}`);
    return res.json();
}

// Удалить изображение на сервере
async function deleteImageOnServer(deleteUrl) {
    const res = await fetch(deleteUrl, { method: 'DELETE' });
    return res.ok;
}

// Отправка файла на сервер
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    return { response, result };
}
