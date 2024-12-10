document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('imageInput');
    const originalImage = document.getElementById('originalImage');
    const resultImage = document.getElementById('resultImage');
    const enlargeBtn = document.getElementById('enlargeBtn');
    const scaleSelect = document.getElementById('scale');
    const loading = document.getElementById('loading');
    const originalInfo = document.getElementById('originalInfo');
    const resultInfo = document.getElementById('resultInfo');
    const originalContainer = originalImage.parentElement;
    const downloadBtn = document.getElementById('downloadBtn');

    // 更新图片信息的函数
    function updateImageInfo(image, infoElement, fileSize = null) {
        if (image.src) {
            const width = image.naturalWidth;
            const height = image.naturalHeight;
            const sizeText = fileSize ? `文件大小: ${(fileSize / 1024).toFixed(2)} KB` : '';
            infoElement.innerHTML = `
                <p>尺寸: ${width} x ${height} px</p>
                ${sizeText ? `<p>${sizeText}</p>` : ''}
            `;
        } else {
            infoElement.innerHTML = `
                <p>尺寸: -- x -- px</p>
                <p>文件大小: -- KB</p>
            `;
        }
    }

    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                originalImage.src = e.target.result;
                resultImage.src = '';
                resultImage.parentElement.classList.remove('has-image');
                
                // 图片加载完成后更新信息
                originalImage.onload = function() {
                    originalContainer.classList.add('has-image');
                    updateImageInfo(originalImage, originalInfo, file.size);
                    updateImageInfo(resultImage, resultInfo);
                }
            }
            reader.readAsDataURL(file);
        }
    });

    enlargeBtn.addEventListener('click', async function() {
        if (!originalImage.src) {
            alert('请先选择图片！');
            return;
        }

        loading.style.display = 'block';
        enlargeBtn.disabled = true;
        enlargeBtn.textContent = '处理中...';

        try {
            const scale = parseInt(scaleSelect.value);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = originalImage.naturalWidth * scale;
            canvas.height = originalImage.naturalHeight * scale;
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            ctx.drawImage(originalImage, 
                0, 0, originalImage.naturalWidth, originalImage.naturalHeight,
                0, 0, canvas.width, canvas.height
            );
            
            resultImage.src = canvas.toDataURL('image/jpeg', 1.0);
            
            // 放大后图片加载完成时更新信息
            resultImage.onload = function() {
                resultImage.parentElement.classList.add('has-image');
                const enlargedSize = canvas.toDataURL('image/jpeg', 1.0).length * 0.75;
                updateImageInfo(resultImage, resultInfo, enlargedSize);
            }
        } catch (error) {
            console.error('放大失败:', error);
            alert('图片放大失败，请稍后重试');
        } finally {
            loading.style.display = 'none';
            enlargeBtn.disabled = false;
            enlargeBtn.textContent = '开始放大';
        }
    });

    // 添加下载按钮点击事件
    downloadBtn.addEventListener('click', function() {
        if (resultImage.src && resultImage.src !== '') {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = resultImage.naturalWidth;
                canvas.height = resultImage.naturalHeight;
                ctx.drawImage(resultImage, 0, 0);
                
                canvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = 'enlarged-image.jpg';
                    link.href = url;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 'image/jpeg', 1.0);
            } catch (error) {
                console.error('下载失败:', error);
                alert('图片下载失败，请重试');
            }
        } else {
            alert('请先放大图片');
        }
    });

    // 添加拖拽上传功能
    const uploadArea = originalContainer;
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#2196F3';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#e0e0e0';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#e0e0e0';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            imageInput.files = e.dataTransfer.files;
            const event = new Event('change');
            imageInput.dispatchEvent(event);
        }
    });
});
