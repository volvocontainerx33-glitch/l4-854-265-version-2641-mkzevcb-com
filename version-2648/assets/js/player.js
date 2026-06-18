(() => {
    const boxes = document.querySelectorAll('.player-box');

    boxes.forEach((box) => {
        const video = box.querySelector('video[data-m3u8]');
        const button = box.querySelector('[data-player-button]');
        const message = box.querySelector('.player-message');
        let loaded = false;
        let hls = null;

        if (!video || !button) {
            return;
        }

        const setMessage = (text) => {
            if (message) {
                message.textContent = text;
            }
        };

        const loadVideo = () => new Promise((resolve, reject) => {
            if (loaded) {
                resolve();
                return;
            }

            const src = video.getAttribute('data-m3u8');
            if (!src) {
                reject(new Error('empty'));
                return;
            }

            const done = () => {
                loaded = true;
                resolve();
            };

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, done);
                hls.on(window.Hls.Events.ERROR, (_event, data) => {
                    if (data && data.fatal) {
                        reject(new Error('fatal'));
                    }
                });
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                video.addEventListener('loadedmetadata', done, { once: true });
                video.addEventListener('error', () => reject(new Error('native')), { once: true });
                return;
            }

            reject(new Error('unsupported'));
        });

        const play = async () => {
            try {
                setMessage('');
                await loadVideo();
                await video.play();
                box.classList.add('is-playing');
            } catch (_error) {
                setMessage('视频暂时无法播放，请稍后再试');
            }
        };

        button.addEventListener('click', play);
        video.addEventListener('click', () => {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', () => box.classList.add('is-playing'));
        video.addEventListener('pause', () => {
            if (!video.ended) {
                box.classList.remove('is-playing');
            }
        });

        window.addEventListener('beforeunload', () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
