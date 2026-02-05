// ==================== GLOBAL VARIABLES ====================
let selectedScale = 4;
let originalImageFile = null;
let upscaledImageUrl = null;

// ==================== SELECT SCALE ====================
function selectScale(scale) {
    selectedScale = scale;
    document.querySelectorAll('.scale-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.scale) === scale);
    });
    showToast(`Skala ${scale}X dipilih!`, 'fa-check-circle', '#5eead4');
}

// ==================== HANDLE IMAGE UPLOAD ====================
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('File harus berupa gambar!', 'fa-exclamation-circle', '#ef4444');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showToast('Ukuran file maksimal 10MB!', 'fa-exclamation-circle', '#ef4444');
        return;
    }

    originalImageFile = file;

    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById('originalImage').src = e.target.result;
        document.getElementById('previewSection').classList.remove('hidden');
        document.getElementById('processBtn').classList.remove('hidden');
        document.getElementById('upscaledImage').classList.add('hidden');
        document.getElementById('actionButtons').classList.add('hidden');
    };
    reader.readAsDataURL(file);

    showToast('Gambar berhasil diupload!', 'fa-check-circle', '#5eead4');
}

// ==================== PROCESS IMAGE ====================
async function processImage() {
    if (!originalImageFile) {
        showToast('Upload gambar terlebih dahulu!', 'fa-exclamation-circle', '#fbbf24');
        return;
    }

    const processBtn = document.getElementById('processBtn');
    const spinner = document.getElementById('loadingSpinner');
    const upscaledImg = document.getElementById('upscaledImage');

    processBtn.disabled = true;
    processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    spinner.style.display = 'flex';
    upscaledImg.classList.add('hidden');

    try {
        const formData = new FormData();
        formData.append('image', originalImageFile);
        formData.append('scale', selectedScale);

        const response = await fetch('/api/upscale', {
            method: 'POST',
            body: formData
        });

        // 🔥 FIX PALING PENTING ADA DI SINI
        if (!response.ok) {
            const text = await response.text(); // ❗ JANGAN json()
            throw new Error(text || 'Gagal memproses gambar');
        }

        const blob = await response.blob();
        upscaledImageUrl = URL.createObjectURL(blob);

        upscaledImg.src = upscaledImageUrl;
        upscaledImg.onload = () => {
            spinner.style.display = 'none';
            upscaledImg.classList.remove('hidden');
            document.getElementById('actionButtons').classList.remove('hidden');
            processBtn.classList.add('hidden');
        };

        showToast('Upscale berhasil! ✨', 'fa-check-circle', '#10b981');

    } catch (err) {
        console.error(err);
        spinner.style.display = 'none';
        showToast(err.message || 'Gagal memproses gambar!', 'fa-exclamation-circle', '#ef4444');
    } finally {
        processBtn.disabled = false;
        processBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Upscale Sekarang!';
    }
}

// ==================== DOWNLOAD IMAGE ====================
async function downloadImage() {
    if (!upscaledImageUrl) {
        showToast('Belum ada gambar!', 'fa-exclamation-circle', '#fbbf24');
        return;
    }

    const res = await fetch(upscaledImageUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `upscaled_${selectedScale}x.png`;
    a.click();

    URL.revokeObjectURL(url);
}

// ==================== RESET ====================
function resetUpscaler() {
    originalImageFile = null;
    if (upscaledImageUrl) URL.revokeObjectURL(upscaledImageUrl);
    upscaledImageUrl = null;
    selectedScale = 4;

    document.getElementById('imageInput').value = '';
    document.getElementById('previewSection').classList.add('hidden');
    document.getElementById('processBtn').classList.add('hidden');
    document.getElementById('actionButtons').classList.add('hidden');

    selectScale(4);
    showToast('Reset berhasil!', 'fa-rotate-right', '#5eead4');
}

// ==================== TOAST ====================
function showToast(msg, icon, color) {
    const toast = document.getElementById('toast');
    document.getElementById('toastIcon').className = `fas ${icon}`;
    document.getElementById('toastIcon').style.color = color;
    document.getElementById('toastMessage').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}