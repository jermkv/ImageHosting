/*******************************
 * Глобальное состояние изображений
 *******************************/

let allImages = [];
let currentPage = 1;
let ITEMS_PER_PAGE = 5;

function getImages() {
    return allImages;
}

function setImages(list) {
    allImages = list;
}

function addImageToStart(image) {
    allImages.unshift(image);
}

function addImagesToEnd(list) {
    allImages.push(...list);
}

function removeImageById(id) {
    allImages = allImages.filter(img => img.id !== id);
}

function resetImages() {
    allImages = [];
    currentPage = 1;
}

function getPage() {
    return currentPage;
}

function nextPage() {
    currentPage += 1;
    return currentPage;
}
