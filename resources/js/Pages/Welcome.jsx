import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRightIcon, Bars3Icon, CheckIcon, ChevronDownIcon, PlayIcon, StarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { useLayoutEffect, useRef, useState } from 'react';
import SmoothScroll from '@/Components/SmoothScroll';

gsap.registerPlugin(ScrollTrigger);

const practiceItems = [
    ['Mock papers', 'SPM Mathematics · Paper 2'],
    ['Instant feedback', '8 / 10 questions mastered'],
    ['Weekly momentum', '+18% stronger this month'],
];

const journey = [
    ['01', 'Find your tutor', 'Tell us the subject, level and way your child learns best.', '/images/cikgu-aina.png', 'A tutor who gets them'],
    ['02', 'Join live class', 'Connect face-to-face online, with every question welcomed.', '/images/background_classroom.jpg', 'Live class / Mathematics'],
    ['03', 'Complete practice', 'Build understanding with focused worksheets and instant feedback.', '/images/background_quiz.jpg', 'Practice studio / 08'],
    ['04', 'Achieve top grades', 'Track steady growth and celebrate the results together.', '/images/child_celeb.png', 'Progress worth celebrating']
];

const testimonials = [
    { name: 'Nur Afiqah', role: 'Parent of SPM student', image: '/avatars/avatar_1.png', quote: 'The progress reports make it so easy to see where our son is improving. His confidence is completely different now.', score: '5.0' },
    { name: 'Sarah Lim', role: 'IGCSE student', image: '/avatars/avatar_2.png', quote: 'The live lessons feel personal, even online. I can ask questions without feeling shy and revisit every recording.', score: '4.9' },
    { name: 'Amirul H.', role: 'Parent of Year 6 student', image: '/avatars/avatar_3.png', quote: 'The match was spot on. Our tutor turns difficult Maths topics into something that finally makes sense.', score: '5.0' },
];

function Reveal({ children, className = '', delay = 0 }) {
    return <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.16 }} transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>{children}</motion.div>;
}

function Counter({ value, suffix = '' }) {
    const valueRef = useRef(null);
    useLayoutEffect(() => {
        const node = valueRef.current;
        const state = { value: 0 };
        const context = gsap.context(() => {
            gsap.to(state, { value, duration: 1.75, ease: 'power2.out', scrollTrigger: { trigger: node, start: 'top 85%', once: true }, onUpdate: () => { node.textContent = `${Math.round(state.value)}${suffix}`; } });
        }, node);
        return () => context.revert();
    }, [value, suffix]);
    return <span ref={valueRef}>0{suffix}</span>;
}

function LearningJourney() {
    const sectionRef = useRef(null);
    const canvasRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useLayoutEffect(() => {
        const section = sectionRef.current;
        const canvas = canvasRef.current;
        if (!section || !canvas) return undefined;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        camera.position.z = 2.3;
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const geometry = new THREE.PlaneGeometry(1, 0.74, 32, 20);
        const textureLoader = new THREE.TextureLoader();
        const scrollState = { progress: 0, velocity: 0 };
        const layout = { width: 1.35, spacing: 1.55 };
        const meshes = journey.map(([, , , image], index) => {
            const texture = textureLoader.load(image, (loadedTexture) => {
                const source = loadedTexture.image;
                material.uniforms.uTextureSize.value.set(source.naturalWidth || source.width, source.naturalHeight || source.height);
            });
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearFilter;
            const material = new THREE.ShaderMaterial({
                transparent: true,
                uniforms: {
                    uTexture: { value: texture },
                    uVelocity: { value: 0 },
                    uAlpha: { value: index === 0 ? 1 : 0.42 },
                    uTextureSize: { value: new THREE.Vector2(1, 1) },
                    uPlaneSize: { value: new THREE.Vector2(1, 0.74) },
                },
                vertexShader: `
                    uniform float uVelocity;
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        vec3 p = position;
                        float bend = sin(uv.y * 3.14159265) * uVelocity;
                        p.x -= bend;
                        p.z += abs(bend) * 0.18;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D uTexture;
                    uniform float uVelocity;
                    uniform float uAlpha;
                    uniform vec2 uTextureSize;
                    uniform vec2 uPlaneSize;
                    varying vec2 vUv;

                    vec2 coverUv(vec2 uv) {
                        float planeAspect = uPlaneSize.x / uPlaneSize.y;
                        float imageAspect = uTextureSize.x / uTextureSize.y;
                        if (planeAspect > imageAspect) {
                            float scale = imageAspect / planeAspect;
                            uv.y = uv.y * scale + (1.0 - scale) * 0.5;
                        } else {
                            float scale = planeAspect / imageAspect;
                            uv.x = uv.x * scale + (1.0 - scale) * 0.5;
                        }
                        return uv;
                    }

                    void main() {
                        vec2 uv = coverUv(vUv);
                        float shift = uVelocity * 0.035;
                        float r = texture2D(uTexture, uv + vec2(shift, 0.0)).r;
                        float g = texture2D(uTexture, uv).g;
                        float b = texture2D(uTexture, uv - vec2(shift, 0.0)).b;
                        vec3 color = vec3(r, g, b);
                        float edge = smoothstep(0.0, 0.035, vUv.x) * smoothstep(0.0, 0.035, 1.0 - vUv.x);
                        gl_FragColor = vec4(color, uAlpha * edge);
                    }
                `,
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.userData.index = index;
            scene.add(mesh);
            return mesh;
        });

        const resize = () => {
            const width = section.clientWidth;
            const height = section.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, width < 768 ? 1.5 : 2));

            const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
            const visibleWidth = visibleHeight * camera.aspect;
            layout.width = THREE.MathUtils.clamp(visibleWidth * (width < 768 ? 0.78 : 0.4), 0.82, 1.5);
            layout.spacing = layout.width * (width < 768 ? 1.14 : 1.2);
            meshes.forEach((mesh) => {
                mesh.scale.set(layout.width, layout.width, 1);
                mesh.material.uniforms.uPlaneSize.value.set(layout.width, layout.width * 0.74);
            });
        };
        resize();

        const context = gsap.context(() => {
            ScrollTrigger.create({
                trigger: section,
                start: 'top top',
                end: () => `+=${window.innerHeight * journey.length}`,
                pin: true,
                pinSpacing: true,
                anticipatePin: 1,
                scrub: true,
                snap: { snapTo: 1 / (journey.length - 1), duration: { min: 0.2, max: 0.6 }, delay: 0.08, ease: 'power2.out' },
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    scrollState.progress = self.progress;
                    scrollState.velocity = THREE.MathUtils.clamp(self.getVelocity() * 0.000035, -0.22, 0.22);
                    const nextIndex = Math.min(journey.length - 1, Math.round(self.progress * (journey.length - 1)));
                    setActiveIndex((current) => current === nextIndex ? current : nextIndex);
                },
            });
        }, section);

        let frameId;
        const render = () => {
            const travel = scrollState.progress * (journey.length - 1) * layout.spacing;
            scrollState.velocity *= 0.9;
            meshes.forEach((mesh, index) => {
                const x = (index * layout.spacing) - travel;
                const distance = Math.min(1, Math.abs(x) / layout.spacing);
                mesh.position.x = x;
                mesh.position.y = -0.02 + distance * 0.06;
                mesh.position.z = -distance * 0.18;
                mesh.rotation.y = THREE.MathUtils.lerp(-0.05, 0.05, (x / layout.spacing + 1) / 2);
                mesh.material.uniforms.uVelocity.value = THREE.MathUtils.lerp(mesh.material.uniforms.uVelocity.value, scrollState.velocity, 0.15);
                mesh.material.uniforms.uAlpha.value = THREE.MathUtils.lerp(mesh.material.uniforms.uAlpha.value, 1 - distance * 0.62, 0.1);
            });
            renderer.render(scene, camera);
            frameId = requestAnimationFrame(render);
        };
        frameId = requestAnimationFrame(render);
        window.addEventListener('resize', resize);

        return () => {
            context.revert();
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', resize);
            meshes.forEach((mesh) => {
                mesh.material.uniforms.uTexture.value.dispose();
                mesh.material.dispose();
                scene.remove(mesh);
            });
            geometry.dispose();
            renderer.dispose();
            renderer.forceContextLoss();
        };
    }, []);

    const active = journey[activeIndex];
    return <section ref={sectionRef} id="journey" className="relative h-[100svh] overflow-hidden bg-[#0B132B] text-white"><canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" /><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(11,19,43,.82)_90%)]" /><div className="absolute left-6 top-7 z-10 font-mono text-[10px] uppercase tracking-[0.18em] text-blue-200 md:left-12 md:top-10">03 / Your learning journey</div><div className="absolute right-6 top-7 z-10 flex gap-2 md:right-12 md:top-10">{journey.map((item, index) => <span key={item[0]} className={`h-1 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-8 bg-amber-300' : 'w-3 bg-white/25'}`} />)}</div><div className="pointer-events-none absolute inset-x-6 bottom-8 z-10 md:inset-x-12 md:bottom-10"><AnimatePresence mode="wait"><motion.div key={active[0]} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }} className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><span className="inline-flex rounded-full border border-white/15 bg-slate-950/55 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.13em] text-blue-100 backdrop-blur">{active[4]}</span><h3 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.06em] md:text-6xl">{active[1]}</h3></div><div className="max-w-sm"><p className="text-sm leading-6 text-slate-200">{active[2]}</p><p className="mt-3 font-mono text-xs text-amber-300">{active[0]} / 04</p></div></motion.div></AnimatePresence></div></section>;
}

function Finder() {
    const [mode, setMode] = useState('Home Tutor');
    const fields = [['Subject', 'Mathematics'], ['Level', 'SPM'], ['Mode', mode]];
    return <div className="rounded-2xl border border-blue-400/20 bg-slate-950/50 p-3 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-4"><div className="mb-3 flex rounded-xl bg-white/5 p-1"><button onClick={() => setMode('Home Tutor')} className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${mode === 'Home Tutor' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Home Tutoring</button><button onClick={() => setMode('Online Class')} className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${mode === 'Online Class' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Online Classes</button></div><AnimatePresence mode="wait"><motion.div key={mode} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="grid gap-2 sm:grid-cols-3">{fields.map(([label, value]) => <button type="button" key={label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.055] px-3 py-3 text-left"><span><span className="block text-[10px] uppercase tracking-[0.13em] text-slate-500">{label}</span><span className="mt-1 block text-xs font-medium text-white">{value}</span></span><ChevronDownIcon className="h-3.5 w-3.5 text-slate-500" /></button>)}</motion.div></AnimatePresence><button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] hover:bg-blue-500">Find a match <ArrowRightIcon className="h-4 w-4" /></button></div>;
}

function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 900], [0, 95]);
    return <main className="min-h-screen overflow-x-clip bg-[#0F172A] font-sans text-white selection:bg-amber-400 selection:text-slate-950">
        <section className="relative overflow-hidden border-b border-white/10"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(37,99,235,.22),transparent_25%),radial-gradient(circle_at_20%_80%,rgba(16,185,129,.12),transparent_25%)]" /><div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.055)_1px,transparent_1px)] [background-size:100%_52px,52px_100%]" />
            <nav className="relative z-20 mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 md:px-12"><Link href="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-[-0.05em]"><span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-sm">H</span>HomeTutor<span className="text-amber-300">.</span></Link><div className="hidden items-center gap-7 text-sm text-slate-300 md:flex"><a href="#practice" className="hover:text-white">Practice</a><a href="#live-class" className="hover:text-white">Live classes</a><a href="#journey" className="hover:text-white">How it works</a><Link href={route('login')} className="rounded-lg border border-white/20 px-4 py-2 font-medium transition hover:border-blue-400 hover:bg-white/5">Log in</Link></div><button type="button" onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg border border-white/15 p-2 md:hidden">{menuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}</button></nav>
            {menuOpen && <div className="absolute z-10 w-full border-y border-white/10 bg-[#0F172A] px-6 py-6 md:hidden"><div className="flex flex-col gap-5 text-sm text-slate-200"><a href="#practice" onClick={() => setMenuOpen(false)}>Practice</a><a href="#live-class" onClick={() => setMenuOpen(false)}>Live classes</a><a href="#journey" onClick={() => setMenuOpen(false)}>How it works</a><Link href={route('login')} onClick={() => setMenuOpen(false)}>Log in</Link></div></div>}
            <div className="relative mx-auto grid min-h-[710px] max-w-[1440px] gap-12 px-6 pb-20 pt-16 md:px-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pb-28"><Reveal className="relative z-[1]"><p className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-blue-300">Online & in-person tutoring / Malaysia</p><h1 className="max-w-3xl text-5xl font-semibold leading-[0.94] tracking-[-0.07em] sm:text-6xl xl:text-7xl">Master any subject with <span className="text-amber-300">1-on-1</span> home & online tutoring.</h1><p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">Empowering students through personalized practice sessions, interactive live classes, and Malaysia’s top verified tutors.</p><div className="mt-9"><Finder /></div></Reveal><motion.div style={{ y: heroY }} className="relative mx-auto grid w-full max-w-xl gap-4 sm:grid-cols-[1.05fr_.95fr]"><div className="relative overflow-hidden rounded-3xl border border-blue-400/20 bg-white/[0.06] p-3 shadow-2xl backdrop-blur"><img src="/images/background_classroom.jpg" alt="Student in a live tutoring session" className="h-[360px] w-full rounded-2xl object-cover" /><div className="absolute left-7 top-7 inline-flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-1.5 text-[10px] font-bold tracking-[0.13em] text-emerald-300 backdrop-blur"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />LIVE NOW</div><div className="absolute inset-x-7 bottom-7 rounded-2xl border border-white/15 bg-slate-950/80 p-3 backdrop-blur"><p className="text-xs font-semibold">Mathematics · Form 4</p><p className="mt-1 text-[11px] text-slate-400">Cikgu Aina is sharing her whiteboard</p></div></div><div className="flex flex-col justify-between rounded-3xl border border-blue-400/20 bg-gradient-to-b from-blue-600/25 to-white/[0.06] p-5 backdrop-blur"><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-blue-200">Practice studio</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.045em]">Your next<br />small win.</h2></div><div className="space-y-2">{practiceItems.map(([title, detail], index) => <motion.div whileHover={{ scale: 1.03 }} key={title} className="rounded-xl border border-white/10 bg-slate-950/45 p-3"><p className="text-xs font-semibold text-amber-200">0{index + 1} · {title}</p><p className="mt-1 text-[11px] leading-4 text-slate-400">{detail}</p></motion.div>)}</div></div></motion.div></div>
        </section>
        <section className="border-b border-white/10 bg-[#0B132B]"><div className="mx-auto grid max-w-[1440px] divide-y divide-white/10 px-6 md:grid-cols-3 md:divide-x md:divide-y-0 md:px-12"><div className="py-7"><p className="font-mono text-3xl font-semibold tracking-[-0.05em] text-white"><Counter value={10000} suffix="+" /></p><p className="mt-1 text-sm text-slate-400">Active students</p></div><div className="py-7 md:px-10"><p className="font-mono text-3xl font-semibold tracking-[-0.05em] text-amber-300"><Counter value={94} suffix="%" /></p><p className="mt-1 text-sm text-slate-400">Achieved grade improvement</p></div><div className="py-7 md:pl-10"><p className="font-mono text-3xl font-semibold tracking-[-0.05em] text-emerald-300"><Counter value={1000} suffix="+" /></p><p className="mt-1 text-sm text-slate-400">Verified tutors</p></div></div></section>
        <section id="practice" className="bg-slate-100 px-6 py-24 text-slate-900 md:px-12 md:py-32"><div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-2 lg:items-center"><Reveal><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-blue-600">01 / Practice made personal</p><h2 className="mt-4 max-w-xl text-4xl font-semibold leading-[0.96] tracking-[-0.06em] md:text-6xl">Every worksheet, a clearer next step.</h2><p className="mt-6 max-w-md leading-7 text-slate-600">Move beyond the tick-box. Practice adapts to the learner with instant feedback, skill tracking, and thoughtful revision cues.</p><a href="#journey" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.03]">Explore the learning journey <ArrowRightIcon className="h-4 w-4" /></a></Reveal><Reveal delay={0.12} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-300/40"><div className="flex items-center justify-between border-b border-slate-100 pb-4"><span className="text-sm font-semibold">Mathematics / Algebra</span><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">AUTO-GRADED</span></div><div className="mt-5 rounded-2xl bg-slate-50 p-5"><p className="text-xs font-medium text-slate-400">QUESTION 08</p><p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Solve for x: 3x + 4 = 19</p><div className="mt-5 grid grid-cols-2 gap-2">{['x = 5', 'x = 7', 'x = 9', 'x = 11'].map((answer, index) => <button key={answer} className={`rounded-xl border p-3 text-left text-sm font-medium transition hover:-translate-y-0.5 ${index === 0 ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600'}`}>{answer}{index === 0 && <CheckIcon className="float-right h-4 w-4" />}</button>)}</div></div><div className="mt-5 flex items-center justify-between"><div><p className="text-xs text-slate-400">Weekly mastery</p><p className="mt-1 text-sm font-semibold">18 of 24 skills complete</p></div><div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-3/4 rounded-full bg-blue-600" /></div></div></Reveal></div></section>
        <section id="live-class" className="border-y border-white/10 bg-[#101C38] px-6 py-24 md:px-12 md:py-32"><div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-2 lg:items-center"><Reveal className="order-2 lg:order-1"><div className="overflow-hidden rounded-3xl border border-blue-400/20 bg-slate-950/50 p-4 shadow-2xl"><div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs"><span className="font-medium text-slate-200">Live whiteboard</span><span className="inline-flex items-center gap-1.5 text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />42 students online</span></div><div className="relative mt-4 h-64 rounded-2xl bg-[#F8FAFC] p-7 text-slate-900"><p className="text-lg font-semibold tracking-[-0.04em]">Photosynthesis</p><p className="mt-5 text-sm text-slate-500">light + carbon dioxide + water →</p><div className="mt-3 inline-block rounded-lg border-2 border-blue-500 px-4 py-2 text-lg font-medium text-blue-700">glucose + oxygen</div><div className="absolute bottom-6 right-6 flex gap-2"><span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-white">T</span><span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-400 text-slate-900">S</span></div></div><div className="mt-4 flex gap-2 overflow-hidden">{['Screen share', 'Real-time Q&A', 'Lesson replay'].map((item) => <span key={item} className="whitespace-nowrap rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-slate-300">{item}</span>)}</div></div></Reveal><Reveal delay={0.1} className="order-1 lg:order-2"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300">02 / Live online classes</p><h2 className="mt-4 max-w-xl text-4xl font-semibold leading-[0.96] tracking-[-0.06em] md:text-6xl">A live class that feels close.</h2><p className="mt-6 max-w-md leading-7 text-slate-300">Bring the energy of a great tutor into every home—with shared whiteboards, screen sharing, real-time questions, and replays when learners need another look.</p><button className="mt-8 inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold transition hover:scale-[1.03] hover:bg-white hover:text-slate-950"><PlayIcon className="h-4 w-4 fill-current" /> Watch class preview</button></Reveal></div></section>
        <LearningJourney />
        <section id="results" className="bg-slate-100 px-6 py-24 text-slate-900 md:px-12 md:py-32"><div className="mx-auto max-w-[1440px]"><Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-blue-600">Real learning, real change</p><h2 className="mt-4 text-4xl font-semibold leading-[0.96] tracking-[-0.06em] md:text-6xl">Trusted progress stories.</h2></div><p className="max-w-sm text-sm leading-6 text-slate-500">Small teaching moments build into lasting confidence, one learner at a time.</p></Reveal><div className="mt-12 grid gap-5 lg:grid-cols-3">{testimonials.map((testimonial, index) => <Reveal key={testimonial.name} delay={index * 0.08}><motion.article whileHover={{ y: -6 }} className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"><div className="flex items-center justify-between"><img src={testimonial.image} alt={testimonial.name} className="h-12 w-12 rounded-2xl object-cover" /><span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-500"><StarIcon className="h-4 w-4 fill-current" />{testimonial.score}</span></div><p className="mt-7 text-lg leading-7 tracking-[-0.025em] text-slate-700">“{testimonial.quote}”</p><div className="mt-7 border-t border-slate-100 pt-4"><p className="text-sm font-semibold">{testimonial.name}</p><p className="mt-1 text-xs text-slate-400">{testimonial.role}</p></div></motion.article></Reveal>)}</div></div></section>
        <section className="bg-[#0B132B] px-6 py-24 text-center md:px-12 md:py-32"><Reveal><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300">The next class starts here</p><h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-[0.96] tracking-[-0.06em] md:text-6xl">Give every learner the right kind of support.</h2><p className="mx-auto mt-6 max-w-xl leading-7 text-slate-300">Find a verified tutor, join a live class, and turn learning into forward motion.</p><Link href={route('login')} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3.5 text-sm font-semibold transition hover:scale-[1.03] hover:bg-blue-500">Find a tutor <ArrowRightIcon className="h-4 w-4" /></Link></Reveal></section>
        <footer className="border-t border-white/10 px-6 py-7 text-xs text-slate-400 md:px-12"><div className="mx-auto flex max-w-[1440px] flex-col gap-4 sm:flex-row sm:justify-between"><span>© {new Date().getFullYear()} HomeTutor Malaysia</span><div className="flex gap-5"><a href="https://hometutor.com.my/" target="_blank" rel="noreferrer" className="hover:text-white">Official site</a><Link href={route('login')} className="hover:text-white">Log in</Link></div></div></footer>
    </main>;
}

export default function Welcome() {
    return <><Head title="HomeTutor | Home & Online Tutoring" /><SmoothScroll><LandingPage /></SmoothScroll></>;
}
