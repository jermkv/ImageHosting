const MAX_SIZE = 5 * 1024 * 1024 //5Mb
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif']

let currentUrl = '';

function showStatus(message, type){
    const status = document.getElementById('upload-status')
    if(!status) return;

    status.textContent = message
    status.className = `upload-status ${type}`
    status.style.display = 'block'

    if(type === 'success'){
        setTimeout(()=>{status.style.display = 'none'}, 5000)
    }
}


function validateFile(file){
    if(!ALLOWED_TYPES.includes(file.type)){
        showStatus('Only .jpg, .png and .gif', 'error')
        return false;
    }
     if(file.size > MAX_SIZE){
        showStatus('File too large! Maximum file size is 5 Mb.', 'error')
        return false;
     }

     return true;
}


async function handleFile(file){
    if(!file || !validateFile(file)) return;

    showStatus('Uploading...', 'info')

    try{
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData

        })
        const result = await response.json()

        if (response.ok){
            showStatus('Upload successful!', 'success')

            const input = document.getElementById('current-upload-input')
            if(input){
                imageUrl = result.image.url
                input.value = imageUrl.length > 50 ? imageUrl.substring(0, 50) + "...": imageUrl;
                currentUrl = imageUrl
            }
            document.getElementById('fileInput').value = ''
        }
    }
    catch(error){
        showStatus('Upload failed' + error.message, 'error')
        
    }
}

async function copyUrl(){
    if(!currentUrl) return;

    try{
        const host = window.location.origin
        await navigator.clipboard.writeText(host+currentUrl)
        showStatus('URL copied', 'success')

        const btn = document.getElementById('copy-button')
        const oldText = btn.textContent
        btn.textContent = 'Copied' 
        setTimeout(()=> btn.textContent = oldText, 2000)
    } catch{ 
        showStatus('Failed to copy URL', 'error')
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area')
    const fileInput = document.getElementById('fileInput')
    const browseBtn = document.querySelector('.send_file button')
    const copyBtn = document.getElementById('copy-button')

    dropArea.addEventListener('dragover', (e)=>{
        e.preventDefault();
        dropArea.classList.add('dragover')
    })

    dropArea.addEventListener('dragleave', (e)=>{
        dropArea.classList.remove('dragover')
    })

    dropArea.addEventListener('drop', (e)=>{
        e.preventDefault()
        dropArea.classList.add('dragover')
        if (e.dataTransfer.files[0]){
            handleFile(e.dataTransfer.files[0])
        }
    })


    fileInput.addEventListener('change', (e) => {
        if(e.target.files[0]){
            handleFile(e.target.files[0])

        }
    })

    browseBtn.addEventListener('click', (e) =>{
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('dragover')
        fileInput.click()
    } )

    if (copyBtn) {
        copyBtn.addEventListener('click', copyUrl)
    }

})