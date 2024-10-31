function playMedia(type) {
    const player = document.getElementById(type === 'audio' ? 'audioPlayer' : 'videoPlayer');
    player.play();
}

function pauseMedia(type) {
    const player = document.getElementById(type === 'audio' ? 'audioPlayer' : 'videoPlayer');
    player.pause();
}

function volumeUp(type) {
    const player = document.getElementById(type === 'audio' ? 'audioPlayer' : 'videoPlayer');
    player.volume = Math.min(player.volume + 0.1, 1);
}

function volumeDown(type) {
    const player = document.getElementById(type === 'audio' ? 'audioPlayer' : 'videoPlayer');
    player.volume = Math.max(player.volume - 0.1, 0);
}

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let x = 0;
let y = 0;
let speed = 2;
let requestId;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2, true);
    ctx.fillStyle = '#441144';
    ctx.fill();
    x += speed;
    y += speed;

    if (x > canvas.width || y > canvas.height) {
        x = 0;
        y = 0;
    }

    requestId = requestAnimationFrame(draw);
}

document.getElementById('startAnimation').addEventListener('click', () => {
    if (!requestId) {
        draw();
    }
});

document.getElementById('stopAnimation').addEventListener('click', () => {
    if (requestId) {
        cancelAnimationFrame(requestId);
        requestId = null;
    }
});

document.getElementById('speed').addEventListener('input', (e) => {
    speed = parseInt(e.target.value);
});


document.getElementById('imageLoader').addEventListener('change', function() {
    const img = document.getElementById('img');
    img.src = URL.createObjectURL(this.files[0]);
    img.onload = () => updateImage();
});
  
function getImageData(el) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const img = document.getElementById(el);
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);
    return context.getImageData(0, 0, img.width, img.height);
}

function processCanvas(canvasId, width, height, func) {
    const canvas = document.getElementById(canvasId);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const outImg = ctx.createImageData(width, height);
    const dst = new Uint32Array(outImg.data.buffer);
    func(dst);
    ctx.putImageData(outImg, 0, 0);
}

function adjustContrast(inImg, delta) {
    const width = inImg.width;
    const height = inImg.height;
    const src = new Uint32Array(inImg.data.buffer);
    const outImg = new ImageData(width, height);
    const dst = new Uint32Array(outImg.data.buffer);
    
    let avgGray = 0;
    for (let i = 0; i < src.length; i++) {
        let r = src[i] & 0xFF;
        let g = (src[i] >> 8) & 0xFF;
        let b = (src[i] >> 16) & 0xFF;
        avgGray += r * 0.2126 + g * 0.7152 + b * 0.0722;
    }
    avgGray /= src.length;

    for (let i = 0; i < src.length; i++) {
        let r = src[i] & 0xFF;
        let g = (src[i] >> 8) & 0xFF;
        let b = (src[i] >> 16) & 0xFF;
        let gray = avgGray;

        r += (r - gray) * delta;
        g += (g - gray) * delta;
        b += (b - gray) * delta;

        dst[i] = (src[i] & 0xFF000000) | (Math.min(255, Math.max(0, b)) << 16) | (Math.min(255, Math.max(0, g)) << 8) | Math.min(255, Math.max(0, r));
    }
    return outImg;
}

function adjustBrightness(inImg, delta) {
    const width = inImg.width;
    const height = inImg.height;
    const src = new Uint32Array(inImg.data.buffer);
    const outImg = new ImageData(width, height);
    const dst = new Uint32Array(outImg.data.buffer);

    for (let i = 0; i < src.length; i++) {
        let r = src[i] & 0xFF;
        let g = (src[i] >> 8) & 0xFF;
        let b = (src[i] >> 16) & 0xFF;

        r = Math.min(255, Math.max(0, r + delta));
        g = Math.min(255, Math.max(0, g + delta));
        b = Math.min(255, Math.max(0, b + delta));

        dst[i] = (src[i] & 0xFF000000) | (b << 16) | (g << 8) | r;
    }
    return outImg;
}

function updateImage() {
    const imgElement = document.getElementById('img');
    const inImg = getImageData('img');
    const canvas = document.getElementById('imageCanvas');
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    const brightness = parseInt(document.getElementById('brightness').value, 10) - 100;
    const contrast = parseInt(document.getElementById('contrast').value, 10) / 100;
    const contrastedImg = adjustContrast(inImg, contrast);
    const brightenedImg = adjustBrightness(contrastedImg, brightness);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(brightenedImg, 0, 0);
}



function saveImage() {
    const canvas = document.getElementById("imageCanvas");
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "new-image.png";
    link.click();
}

document.getElementById('contrast').addEventListener('input', updateImage);
document.getElementById('brightness').addEventListener('input', updateImage);
document.getElementById("saveImage").addEventListener("click", saveImage);
  
  


