'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Register service worker after page load
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((registration) => {
                        console.log('SW registered:', registration.scope);
                        
                        // Check for updates
                        registration.onupdatefound = () => {
                            const installingWorker = registration.installing;
                            if (installingWorker) {
                                installingWorker.onstatechange = () => {
                                    if (installingWorker.state === 'installed') {
                                        if (navigator.serviceWorker.controller) {
                                            console.log('New content available; please refresh.');
                                        } else {
                                            console.log('Content cached for offline use.');
                                        }
                                    }
                                };
                            }
                        };
                    })
                    .catch((error) => {
                        console.log('SW registration failed:', error);
                    });
            });
        }
    }, []);

    return null;
}
