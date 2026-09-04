import React, { useEffect, useRef } from 'react';

const LEGACY_PRIMARY_BASE = 'https://hometutor.com.my/main/simpana/images/';
const LEGACY_BACKUP_BASE = 'https://asset.cloudhub.my/files/simpana/images/';

const STATUS_STYLES = {
    checking: 'bg-amber-100 text-amber-700',
    found: 'bg-emerald-100 text-emerald-700',
    missing: 'bg-rose-100 text-rose-700',
};

const STATUS_TEXT = {
    checking: 'Checking…',
    found: 'Found',
    missing: 'Not found',
};

const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const getBackupPath = (source) => {
    if (!source?.startsWith(LEGACY_PRIMARY_BASE)) return null;

    const filename = source.split('/').pop();
    const digitMatch = filename?.match(/^(\d{6})-/);
    if (!digitMatch) return null;

    return `${LEGACY_BACKUP_BASE}${digitMatch[1].split('').join('/')}/${filename}`;
};

const getLabelForImage = (image) => {
    const label = image?.nextElementSibling;
    return label?.matches?.('[data-image-path-label]') ? label : null;
};

const updateLabel = (label, status, path, statusText = STATUS_TEXT[status]) => {
    if (!label) return;

    const pathValue = label.querySelector('[data-image-path-value]');
    const statusBadge = label.querySelector('[data-image-path-status]');

    if (pathValue && path) pathValue.textContent = path;
    if (!statusBadge) return;

    statusBadge.className = `ml-2 inline-flex rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold ${STATUS_STYLES[status]}`;
    statusBadge.textContent = statusText;
};

const tryLegacyBackup = (image) => {
    if (!image || image.dataset.legacyBackupTried === 'true') return false;

    const backupPath = getBackupPath(image.currentSrc || image.src);
    if (!backupPath) return false;

    image.dataset.legacyBackupTried = 'true';
    updateLabel(getLabelForImage(image), 'checking', backupPath, 'Trying backup…');
    image.src = backupPath;

    return true;
};

const handleImageLoad = (image) => {
    updateLabel(getLabelForImage(image), 'found', image.currentSrc || image.src);
};

const handleImageError = (image) => {
    if (!tryLegacyBackup(image)) {
        updateLabel(getLabelForImage(image), 'missing', image.currentSrc || image.src);
    }
};

if (typeof document !== 'undefined' && !window.__imagePathStatusListenersAdded) {
    document.addEventListener('load', (event) => {
        if (event.target instanceof HTMLImageElement) handleImageLoad(event.target);
    }, true);

    document.addEventListener('error', (event) => {
        if (event.target instanceof HTMLImageElement) handleImageError(event.target);
    }, true);

    window.__imagePathStatusListenersAdded = true;
}

export const addImagePathLabels = (html) => {
    if (!html) return html;

    return html.replace(
        /(<img\b[^>]*?\bsrc\s*=\s*(["'])([^"']+)\2[^>]*>)/gi,
        (imageTag, _fullTag, _quote, source) => `${imageTag}<span data-image-path-label class="mt-1 mb-3 block break-all rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] leading-4 text-slate-600"><strong class="font-semibold text-slate-700">Full path:</strong> <span data-image-path-value>${escapeHtml(source)}</span><span data-image-path-status class="ml-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 font-sans text-[10px] font-semibold text-amber-700">Checking…</span></span>`,
    );
};

export default function ImagePathLabel({ path, className = '' }) {
    const labelRef = useRef(null);

    useEffect(() => {
        const image = labelRef.current?.previousElementSibling;
        if (!(image instanceof HTMLImageElement) || !image.complete) return;

        if (image.naturalWidth > 0) {
            handleImageLoad(image);
        } else {
            handleImageError(image);
        }
    }, [path]);

    if (!path) return null;

    return (
        <div ref={labelRef} data-image-path-label className={`mt-1 break-all rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] leading-4 text-slate-600 ${className}`}>
            <strong className="font-semibold text-slate-700">Full path:</strong>{' '}
            <span data-image-path-value>{path}</span>
            <span data-image-path-status className="ml-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 font-sans text-[10px] font-semibold text-amber-700">Checking…</span>
        </div>
    );
}
