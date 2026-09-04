import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Site-level Lenis driver with one requestAnimationFrame render loop. */
export default function SmoothScroll({ children }) {
    const lenisRef = useRef(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
        lenisRef.current = lenis;
        let frameId;
        const raf = (time) => { lenis.raf(time); frameId = requestAnimationFrame(raf); };
        frameId = requestAnimationFrame(raf);
        const updateScrollTrigger = () => ScrollTrigger.update();
        lenis.on('scroll', updateScrollTrigger);
        ScrollTrigger.refresh();

        const onAnchorClick = (event) => {
            const anchor = event.target.closest('a[href^="#"]');
            if (!anchor) return;
            const target = document.querySelector(anchor.getAttribute('href'));
            if (!target) return;
            event.preventDefault();
            lenis.scrollTo(target, { offset: -24, duration: 1.15 });
        };
        document.addEventListener('click', onAnchorClick);
        return () => { cancelAnimationFrame(frameId); lenis.off('scroll', updateScrollTrigger); document.removeEventListener('click', onAnchorClick); lenis.destroy(); lenisRef.current = null; };
    }, []);

    return children;
}
