document.addEventListener('DOMContentLoaded', () => {

    /*=====================================================
      PRELOADER
    =====================================================*/
    const preloader = document.getElementById('preloader');
    const progressBar = document.querySelector('.progress-bar');

    // Simulate loading progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 10;
        if (progress > 100) progress = 100;

        progressBar.style.width = `${progress}%`;

        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                preloader.classList.add('fade-out');
                // Optional: remove from DOM after fade
                setTimeout(() => preloader.style.display = 'none', 800);
            }, 500); // short delay at 100%
        }
    }, 200);


    /*=====================================================
      CUSTOM CURSOR
    =====================================================*/
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    let outlineX = 0, outlineY = 0;
    let dotX = 0, dotY = 0;

    // Only activate cursor logic on non-touch devices
    if (window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // Dot follows instantly
            dotX = posX;
            dotY = posY;
            cursorDot.style.left = `${dotX}px`;
            cursorDot.style.top = `${dotY}px`;

            // For the outline trailing effect, we use requestAnimationFrame in an loop below
            outlineX = posX;
            outlineY = posY;
        });

        // Add hover effect to links and buttons
        const interactables = document.querySelectorAll('a, button, .hover-tilt, .menu-toggle');

        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });

        // Smooth trailing animation for outline
        let tX = 0, tY = 0;
        function animateCursorOutline() {
            // Easing function
            tX += (outlineX - tX) * 0.15;
            tY += (outlineY - tY) * 0.15;

            cursorOutline.style.left = `${tX}px`;
            cursorOutline.style.top = `${tY}px`;

            requestAnimationFrame(animateCursorOutline);
        }
        animateCursorOutline();
    }


    /*=====================================================
      STICKY NAVBAR
    =====================================================*/
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > window.innerHeight - 80) { // Subtract approximate navbar height
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });


    /*=====================================================
      MOBILE MENU TOGGLE
    =====================================================*/
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('open');
            mobileMenu.classList.toggle('open');
            // Prevent body scroll when menu is open
            document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
        });

        // Close menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('open');
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }


    /*=====================================================
      PARALLAX BACKGROUND
    =====================================================*/
    const heroBg = document.querySelector('.parallax-bg');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (heroBg && scrolled < window.innerHeight) {
            // Move image down slightly as user scrolls down
            heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    });


    /*=====================================================
      INTERSECTION OBSERVER FOR REVEAL ANIMATIONS
    =====================================================*/
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-scale');

    const revealOptions = {
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: "0px 0px -50px 0px" // Slight offset
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('is-revealed');

            // Optional: stop observing once revealed
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    /*=====================================================
      CUSTOM AUDIO PLAYER
    =====================================================*/
    const audioPlayer = document.getElementById('audio-player');
    const tracks = document.querySelectorAll('.play-track');
    let currentTrack = null;

    // Global Player DOM Elements
    const globalPlayerUI = document.getElementById('global-player');
    const gpBtnClose = document.getElementById('close-player-btn');
    const gpTitle = document.getElementById('player-track-name');
    const gpBtnPlayPause = document.getElementById('player-play-pause');
    const gpBtnPrev = document.getElementById('player-prev');
    const gpBtnNext = document.getElementById('player-next');
    const gpTimeCurrent = document.getElementById('player-time-current');
    const gpTimeTotal = document.getElementById('player-time-total');
    const gpProgressBg = document.getElementById('player-progress-bg');
    const gpProgressFill = document.getElementById('player-progress-fill');

    // Volume Control Elements
    const gpVolumeBg = document.getElementById('player-volume-bg');
    const gpVolumeFill = document.getElementById('player-volume-fill');
    const gpVolumeIcon = document.getElementById('volume-icon');

    if (audioPlayer) {
        audioPlayer.volume = 0.5;
    }

    // Equalizer HTML template
    const equalizerHTML = `
        <div class="playing-bars">
            <span></span><span></span><span></span>
        </div>
    `;

    function updatePlayPauseIcon(isPlaying) {
        if (isPlaying) {
            gpBtnPlayPause.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            gpBtnPlayPause.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    }

    function playTrack(trackElement) {
        if (!audioPlayer) return;
        const src = trackElement.getAttribute('data-src');
        if (!src) return;

        // Slide up the global player on first use
        if (!globalPlayerUI.classList.contains('show')) {
            globalPlayerUI.classList.add('show');
        }

        // Make sure to remove old active states
        tracks.forEach(t => t.classList.remove('active-track', 'is-playing'));
        const existingEqs = document.querySelectorAll('.playing-bars');
        existingEqs.forEach(eq => eq.remove());

        // If clicking the same track
        if (currentTrack === trackElement) {
            if (audioPlayer.paused) {
                audioPlayer.play();
                trackElement.classList.add('active-track', 'is-playing');
                trackElement.insertAdjacentHTML('beforeend', equalizerHTML);
                updatePlayPauseIcon(true);
            } else {
                audioPlayer.pause();
                trackElement.classList.add('active-track'); // keep it highlighted but paused
                trackElement.insertAdjacentHTML('beforeend', equalizerHTML);
                updatePlayPauseIcon(false);
            }
            return;
        }

        // Clicked a new track
        currentTrack = trackElement;

        // Update Title in Global Player
        const trackNameNode = trackElement.querySelector('.track-name');
        if (trackNameNode) gpTitle.textContent = trackNameNode.textContent;

        currentTrack.classList.add('active-track');
        currentTrack.insertAdjacentHTML('beforeend', equalizerHTML);

        audioPlayer.src = src;
        audioPlayer.play().then(() => {
            currentTrack.classList.add('is-playing');
            updatePlayPauseIcon(true);
        }).catch(err => {
            console.error("Audio playback failed:", err);
            updatePlayPauseIcon(false);
        });
    }

    // Attach click to tracklist items
    tracks.forEach(track => {
        track.addEventListener('click', () => playTrack(track));
    });

    // Global Player Controls
    if (gpBtnPlayPause) {
        gpBtnPlayPause.addEventListener('click', () => {
            if (currentTrack) {
                playTrack(currentTrack); // This toggles if it's the same track
            } else if (tracks.length > 0) {
                playTrack(tracks[0]);
            }
        });
    }

    if (gpBtnClose) {
        gpBtnClose.addEventListener('click', () => {
            if (audioPlayer) {
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
            }
            globalPlayerUI.classList.remove('show');
            tracks.forEach(t => t.classList.remove('active-track', 'is-playing'));
            const existingEqs = document.querySelectorAll('.playing-bars');
            existingEqs.forEach(eq => eq.remove());
            currentTrack = null;
            updatePlayPauseIcon(false);
        });
    }

    function playAdjacentTrack(direction) {
        if (!currentTrack) return;
        let index = Array.from(tracks).indexOf(currentTrack);

        if (direction === 'next') {
            index = (index + 1) % tracks.length;
        } else if (direction === 'prev') {
            index = (index - 1 + tracks.length) % tracks.length;
        }

        currentTrack = null;
        playTrack(tracks[index]);
    }

    if (gpBtnNext) gpBtnNext.addEventListener('click', () => playAdjacentTrack('next'));
    if (gpBtnPrev) gpBtnPrev.addEventListener('click', () => playAdjacentTrack('prev'));

    let isDraggingProgress = false;
    let dragPos = 0;

    // Progress Bar + Time Update
    if (audioPlayer) {
        audioPlayer.addEventListener('timeupdate', () => {
            if (audioPlayer.duration && isFinite(audioPlayer.duration) && !isDraggingProgress) {
                const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
                gpProgressFill.style.width = `${percent}%`;
                gpTimeCurrent.textContent = formatTime(audioPlayer.currentTime);
            }
        });

        audioPlayer.addEventListener('loadedmetadata', () => {
            if (isFinite(audioPlayer.duration)) {
                gpTimeTotal.textContent = formatTime(audioPlayer.duration);
            }
        });

        // Auto-advance
        audioPlayer.addEventListener('ended', () => {
            playAdjacentTrack('next');
        });
    }

    // Seek functionality
    if (gpProgressBg && audioPlayer) {
        function handleDragVal(e) {
            if (!audioPlayer.duration || !isFinite(audioPlayer.duration)) return false;
            const clientX = e.type.includes('touch') ? (e.touches.length > 0 ? e.touches[0].clientX : e.changedTouches[0].clientX) : e.clientX;

            const rect = gpProgressBg.getBoundingClientRect();
            let pos = (clientX - rect.left) / rect.width;
            pos = Math.max(0, Math.min(1, pos));
            dragPos = pos;

            gpProgressFill.style.width = `${pos * 100}%`;
            gpTimeCurrent.textContent = formatTime(pos * audioPlayer.duration);
            return true;
        }

        gpProgressBg.addEventListener('mousedown', (e) => {
            isDraggingProgress = true;
            handleDragVal(e);
        });
        gpProgressBg.addEventListener('touchstart', (e) => {
            isDraggingProgress = true;
            handleDragVal(e);
        }, { passive: true });

        document.addEventListener('mousemove', (e) => {
            if (isDraggingProgress) {
                e.preventDefault();
                handleDragVal(e);
            }
        });
        document.addEventListener('touchmove', (e) => {
            if (isDraggingProgress) handleDragVal(e);
        }, { passive: true });

        const commitSeek = () => {
            if (isDraggingProgress) {
                isDraggingProgress = false;
                if (audioPlayer.duration && isFinite(audioPlayer.duration)) {
                    audioPlayer.currentTime = dragPos * audioPlayer.duration;
                }
            }
        };

        document.addEventListener('mouseup', commitSeek);
        document.addEventListener('touchend', commitSeek);

        gpProgressBg.addEventListener('click', (e) => {
            if (handleDragVal(e)) {
                audioPlayer.currentTime = dragPos * audioPlayer.duration;
            }
        });
    }

    // Volume functionality
    if (gpVolumeBg && audioPlayer) {
        let isDraggingVolume = false;

        function updateVolume(e) {
            const clientX = e.type.includes('touch') ? (e.touches.length > 0 ? e.touches[0].clientX : e.changedTouches[0].clientX) : e.clientX;

            const rect = gpVolumeBg.getBoundingClientRect();
            let pos = (clientX - rect.left) / rect.width;
            pos = Math.max(0, Math.min(1, pos));
            audioPlayer.volume = pos;
            gpVolumeFill.style.width = `${pos * 100}%`;

            if (pos === 0) {
                gpVolumeIcon.className = 'fa-solid fa-volume-xmark';
            } else if (pos < 0.5) {
                gpVolumeIcon.className = 'fa-solid fa-volume-low';
            } else {
                gpVolumeIcon.className = 'fa-solid fa-volume-high';
            }
        }

        gpVolumeBg.addEventListener('mousedown', (e) => {
            isDraggingVolume = true;
            updateVolume(e);
        });
        gpVolumeBg.addEventListener('touchstart', (e) => {
            isDraggingVolume = true;
            updateVolume(e);
        }, { passive: true });

        document.addEventListener('mousemove', (e) => {
            if (isDraggingVolume) {
                e.preventDefault();
                updateVolume(e);
            }
        });
        document.addEventListener('touchmove', (e) => {
            if (isDraggingVolume) updateVolume(e);
        }, { passive: true });

        document.addEventListener('mouseup', () => isDraggingVolume = false);
        document.addEventListener('touchend', () => isDraggingVolume = false);

        gpVolumeBg.addEventListener('click', (e) => {
            updateVolume(e);
        });
    }

    /*=====================================================
      NAVIGATION TRANSITION LOGIC
    =====================================================*/
    const transitionLayer = document.getElementById('navigation-transition');
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-link, .logo a, .hero-listen-btn');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    // Trigger Transition In
                    transitionLayer.classList.add('active');

                    setTimeout(() => {
                        // Scroll while screen is covered
                        const navbarHeight = 80;
                        const isMobile = window.innerWidth <= 768;
                        let offset = navbarHeight - 20;

                        // On mobile, if targeting music, scroll deeper to hit the tracklist
                        if (isMobile && targetId === 'music') {
                            offset = -100; // Scroll past the section header and art
                        }

                        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'auto' // Instant scroll while covered
                        });

                        // Close mobile menu if open
                        if (menuToggle && menuToggle.classList.contains('open')) {
                            menuToggle.classList.remove('open');
                            mobileMenu.classList.remove('open');
                            document.body.style.overflow = '';
                        }

                        // Trigger Transition Out
                        setTimeout(() => {
                            transitionLayer.classList.add('exit');
                            setTimeout(() => {
                                transitionLayer.classList.remove('active', 'exit');
                            }, 800);
                        }, 200);
                    }, 600); // Wait for logo to expand
                }
            }
        });
    });

});
