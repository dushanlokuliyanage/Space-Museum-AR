

AFRAME.registerComponent('ball-colour-change', {
    init() {
        const colours = ['#2D9CDB', '#EB5757', '#27AE60', '#F2C94C', '#9B51E0'];
        let colourIndex = 0;

        this.el.addEventListener('click', () => {
            colourIndex = (colourIndex + 1) % colours.length;
            this.el.setAttribute('color', colours[colourIndex]);
        });
    }
});

AFRAME.registerComponent('grow-on-click', {
    init() {
        this.growth = 1;
        this.el.addEventListener('click', () => {
            this.growth += 0.2;
            if (this.growth > 2) this.growth = 1;

            const size = 0.28 * this.growth;
            this.el.setAttribute('scale', `${size} ${size} ${size}`);
        });
    }
});

AFRAME.registerComponent('model-status', {
    init() {
        this.usingLocalFallback = false;
        this.el.addEventListener('model-loaded', () => {
            console.info('Astronaut model loaded.');
        });

        this.el.addEventListener('model-error', (event) => {
            console.error('Astronaut model failed to load.', event.detail);
            if (!this.usingLocalFallback) {
                this.usingLocalFallback = true;
                console.warn('Trying the bundled astronaut model as a fallback.');
                this.el.setAttribute('gltf-model', 'models/astronaut.glb');
                return;
            }
            setStatus('The astronaut model could not load. Check models/astronaut.glb.', 'error');
        });
    }
});

function setStatus(message, state = 'searching') {
    const banner = document.querySelector('#status-banner');
    if (!banner) return;

    banner.textContent = message;
    banner.classList.remove('searching', 'found', 'error');
    banner.classList.add(state);
}

document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    const marker = document.querySelector('#hiro-marker');
    let markerDetected = false;

    marker?.addEventListener('markerFound', () => {
        markerDetected = true;
        setStatus('Hiro marker found - Space Museum is active!', 'found');
    });

    marker?.addEventListener('markerLost', () => {
        markerDetected = false;
        setStatus('Marker lost - point your camera at the Hiro marker.', 'searching');
    });

    scene?.addEventListener('loaded', () => {
        setStatus('Starting camera…', 'searching');
    });

   
    const onVideoReady = () => {
        if (!markerDetected) {
            setStatus('Camera ready - point it at the Hiro marker.', 'searching');
        }
    };
    scene?.addEventListener('arjs-video-loaded', onVideoReady);
    document.addEventListener('arjs-video-loaded', onVideoReady);

    scene?.addEventListener('camera-error', (event) => {
        console.error('AR camera failed to start.', event.detail);
        setStatus('Camera unavailable. Allow camera access and use localhost or HTTPS.', 'error');
    });

   
    window.setTimeout(onVideoReady, 5000);

    window.addEventListener('error', (event) => {
        if (event.target instanceof HTMLScriptElement) {
            setStatus('A required AR library failed to load. Check your internet connection.', 'error');
        }
    }, true);
});
