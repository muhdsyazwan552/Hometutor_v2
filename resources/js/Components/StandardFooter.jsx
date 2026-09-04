import React from 'react';

const footerLinks = {
  about: [
    { label: 'Our Company', href: '/about' },
    { label: 'Our Products', href: '/products' },
    { label: 'Payment', href: '/payment' },
  ],
  support: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact Us', href: '/contact' },
  ],
};

const socials = [
  {
    label: 'Facebook',
    path: 'M13.5 22v-8h2.75l.41-3H13.5V9.08c0-.87.24-1.46 1.5-1.46H16.8V4.94a24 24 0 0 0-1.75-.09c-1.73 0-2.91 1.05-2.91 3V11H9.5v3h2.64v8h1.36Z',
  },
  {
    label: 'Instagram',
    path: 'M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm4.5 3.25A4.75 4.75 0 1 1 7.25 12 4.76 4.76 0 0 1 12 7.25Zm0 2A2.75 2.75 0 1 0 14.75 12 2.75 2.75 0 0 0 12 9.25ZM17 6.1a1.15 1.15 0 1 1-1.15 1.15A1.15 1.15 0 0 1 17 6.1Z',
  },
  {
    label: 'YouTube',
    path: 'M21.58 6.18a2.98 2.98 0 0 0-2.1-2.11C17.63 3.57 12 3.57 12 3.57s-5.63 0-7.48.5a2.98 2.98 0 0 0-2.1 2.11A31.2 31.2 0 0 0 1.92 12a31.2 31.2 0 0 0 .5 5.82 2.98 2.98 0 0 0 2.1 2.11c1.85.5 7.48.5 7.48.5s5.63 0 7.48-.5a2.98 2.98 0 0 0 2.1-2.11 31.2 31.2 0 0 0 .5-5.82 31.2 31.2 0 0 0-.5-5.82ZM9.75 15.57V8.43L16 12l-6.25 3.57Z',
  },
];

const LinkColumn = ({ title, links }) => (
  <div className="text-center sm:text-left">
    <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-sky-200">{title}</h3>
    <ul className="mt-4 space-y-3">
      {links.map((link) => (
        <li key={link.label}>
          <a href={link.href} className="text-sm text-slate-300 transition hover:text-white hover:underline hover:decoration-sky-400 hover:underline-offset-4">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default function StandardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-2 border-t border-white/10 bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
        <div className="grid gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.7fr)_minmax(140px,0.65fr)_minmax(140px,0.65fr)] lg:gap-16">
          <div className="mx-auto max-w-xl text-center sm:mx-0 sm:text-left">
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <img src="/images/HT_Rectangle_3D.png" alt="HomeTutor" className="h-11 w-auto rounded-xl object-contain" />
              <span className="text-lg font-bold tracking-tight text-white">HomeTutor</span>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-300 sm:text-base">
              HomeTutor provides engaging digital learning content and mastery modules to help every student progress with confidence.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Practice with purpose, understand your progress, and get personalised learning support at every step.
            </p>
          </div>

          <LinkColumn title="About" links={footerLinks.about} />
          <LinkColumn title="Support" links={footerLinks.support} />
        </div>

        <div className="flex flex-col gap-5 pt-6 text-center sm:text-left lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-center gap-3 text-xs text-slate-400 sm:flex-row sm:flex-wrap sm:justify-start sm:gap-x-5 sm:gap-y-2">
            <span>© {currentYear} HomeTutor. All rights reserved.</span>
            <a href="/terms" className="transition hover:text-white">Terms of Use</a>
            <a href="/privacy" className="transition hover:text-white">Privacy Policy</a>
            <label className="flex items-center gap-2">
              <span>Language</span>
              <select aria-label="Language" defaultValue="en" className="rounded-md border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none transition focus:border-sky-400">
                <option value="en">English</option>
                <option value="ms">Bahasa Melayu</option>
              </select>
            </label>
          </div>

          <div className="flex justify-center gap-2.5 lg:justify-end">
            {socials.map((social) => (
              <a key={social.label} href="#" aria-label={social.label} className="grid h-9 w-9 place-items-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 transition hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-500 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d={social.path} /></svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
