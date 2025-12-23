// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // PWA Detection and Logo Background Change
    function detectPWAAndUpdateLogo() {
        // Check if the app is running in standalone mode (PWA installed)
        const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                      window.matchMedia('(display-mode: minimal-ui)').matches ||
                      window.matchMedia('(display-mode: fullscreen)').matches ||
                      window.navigator.standalone === true; // iOS Safari
        
        if (isPWA) {
            // Apply black background and red border to all logos
            const logos = document.querySelectorAll('.logo, .category-header .logo');
            logos.forEach(logo => {
                logo.style.background = '#000000';
                logo.style.border = '3px solid #d32f2f';
            });
            
            // Change logo image to logo.JPG for PWA installation
            const logoImages = document.querySelectorAll('.logo img, .category-header .logo img');
            logoImages.forEach(img => {
                if (img.src.includes('logo.JPG') || img.src.includes('logo.jpg')) {
                    img.src = './image/logo.JPG';
                }
            });
            
            // Add a class for additional styling if needed
            document.body.classList.add('pwa-installed');
        } else {
            // Restore original logo and styling when PWA is not installed
            const logos = document.querySelectorAll('.logo, .category-header .logo');
            logos.forEach(logo => {
                logo.style.background = '';
                logo.style.border = '';
            });
            
            // Restore original logo image
            const logoImages = document.querySelectorAll('.logo img, .category-header .logo img');
            logoImages.forEach(img => {
                if (img.src.includes('logo.JPG') || img.src.includes('logo.jpg')) {
                    img.src = './image/logo.JPG';
                }
            });
            
            // Remove PWA class
            document.body.classList.remove('pwa-installed');
        }
    }
    
    // Run PWA detection immediately
    detectPWAAndUpdateLogo();
    
    // Also listen for changes in display mode (when PWA is installed/uninstalled)
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const mediaQueryMinimal = window.matchMedia('(display-mode: minimal-ui)');
        const mediaQueryFullscreen = window.matchMedia('(display-mode: fullscreen)');
        
        // Use modern addEventListener for newer browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', detectPWAAndUpdateLogo);
            mediaQueryMinimal.addEventListener('change', detectPWAAndUpdateLogo);
            mediaQueryFullscreen.addEventListener('change', detectPWAAndUpdateLogo);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(detectPWAAndUpdateLogo);
            mediaQueryMinimal.addListener(detectPWAAndUpdateLogo);
            mediaQueryFullscreen.addListener(detectPWAAndUpdateLogo);
        }
    }
    
    // Additional PWA detection for iOS
    if (window.navigator.standalone !== undefined) {
        window.addEventListener('load', detectPWAAndUpdateLogo);
    }
    
    // Listen for PWA installation event
    window.addEventListener('appinstalled', function() {
        console.log('PWA was installed');
        // Small delay to ensure the display mode has changed
        setTimeout(detectPWAAndUpdateLogo, 100);
    });

    // Get all category buttons and menu sections
    const categoryButtons = document.querySelectorAll('.category-btn');
    const menuSections = document.querySelectorAll('.menu-section');

    // Add click event listeners to category buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetCategory = this.getAttribute('data-category');
            
            // Remove active class from all buttons and sections
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            menuSections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show target section
            const targetSection = document.getElementById(targetCategory);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // Set first category as active by default
    if (categoryButtons.length > 0) {
        categoryButtons[0].classList.add('active');
    }

    // Add smooth scroll behavior for better UX
    document.documentElement.style.scrollBehavior = 'smooth';

    // Add loading animation when page loads
    const menuContent = document.querySelector('.menu-content');
    if (menuContent) {
        menuContent.style.opacity = '0';
        setTimeout(() => {
            menuContent.style.transition = 'opacity 0.5s ease-in-out';
            menuContent.style.opacity = '1';
        }, 100);
    }

    // Add hover effects for menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Price click functionality removed - prices are no longer clickable

    // Add contact icon functionality
    const contactIcons = document.querySelectorAll('.contact-icon');
    contactIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Add contact button functionality
    const contactBtn = document.querySelector('.contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', function() {
            // You can add contact functionality here
            window.open('mailto:emil@example.com', '_blank');
        });
    }

    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        const activeButton = document.querySelector('.category-btn.active');
        const buttons = Array.from(categoryButtons);
        const currentIndex = buttons.indexOf(activeButton);
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % buttons.length;
            buttons[nextIndex].click();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = currentIndex === 0 ? buttons.length - 1 : currentIndex - 1;
            buttons[prevIndex].click();
        }
    });

    // Add touch support for mobile devices
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            const activeButton = document.querySelector('.category-btn.active');
            const buttons = Array.from(categoryButtons);
            const currentIndex = buttons.indexOf(activeButton);
            
            if (diff > 0) {
                // Swipe left - next category
                const nextIndex = (currentIndex + 1) % buttons.length;
                buttons[nextIndex].click();
            } else {
                // Swipe right - previous category
                const prevIndex = currentIndex === 0 ? buttons.length - 1 : currentIndex - 1;
                buttons[prevIndex].click();
            }
        }
    }

    // Add service worker registration for PWA functionality
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            // Only register service worker if not using file:// protocol
            if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
                navigator.serviceWorker.register('./sw.js')
                    .then(function(registration) {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(function(error) {
                        console.log('ServiceWorker registration failed: ', error);
                    });
            }
        });
    }
    
    // Preload all product images to prevent reload on scroll
    const productImages = document.querySelectorAll('.item-image img, .logo-image');
    productImages.forEach((img, index) => {
        // Preload all images immediately
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src;
        link.fetchPriority = index < 2 ? 'high' : 'auto';
        document.head.appendChild(link);
        
        // Force image to stay in memory
        if (img.complete) {
            // Image already loaded, keep reference
            img.style.willChange = 'auto';
        } else {
            img.addEventListener('load', function() {
                this.style.willChange = 'auto';
                // Keep image in memory by creating a reference
                if (!window.imageCache) window.imageCache = [];
                window.imageCache.push(this);
            }, { once: true });
        }
    });
    
    // Prevent image unloading on scroll
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            productImages.forEach(img => {
                // Force browser to keep image in memory
                if (img.complete) {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = 1;
                    canvas.height = 1;
                    ctx.drawImage(img, 0, 0, 1, 1);
                }
            });
        });
    }

    // Add install prompt for PWA
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        
        // You can show an install button here if desired
        console.log('PWA install prompt available');
    });

    // Add online/offline status indicator
    window.addEventListener('online', function() {
        showStatusMessage('Conectado', 'success');
    });

    window.addEventListener('offline', function() {
        showStatusMessage('Sin conexión', 'error');
    });

    function showStatusMessage(message, type) {
        const statusDiv = document.createElement('div');
        statusDiv.textContent = message;
        statusDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 25px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        `;
        
        document.body.appendChild(statusDiv);
        
        setTimeout(() => {
            statusDiv.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(statusDiv);
            }, 300);
        }, 2000);
    }

    // Add CSS animations for status messages
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Add install banner functionality
    const installBanner = document.querySelector('.install-banner');
    if (installBanner) {
        // Hide banner after 5 seconds
        setTimeout(() => {
            installBanner.style.display = 'none';
        }, 5000);

        // Allow users to dismiss banner
        installBanner.addEventListener('click', function() {
            this.style.display = 'none';
        });
    }

    console.log('Hunguer FOOD Digital Menu loaded successfully!');
}); 