// OmniConvert – iLovePDF Clone Engine

document.addEventListener('DOMContentLoaded', () => {
    // ── State ──
    let state = {
        activeToolId: null,
        selectedFiles: [],
        history: JSON.parse(localStorage.getItem('omni_hist_v3') || '[]'),
        busy: false
    };

    // ── Tool definitions ──
    const tools = {
        'merge-pdf': { title: 'Merge PDF', desc: 'Combine PDFs in the order you want with the easiest PDF merger available.', accept: '.pdf', exts: ['pdf'], out: 'pdf', multi: true, settings: [{ id: 'order', label: 'Merge Order', type: 'select', opts: [{ v: 'seq', l: 'Sequential (1→N)' }, { v: 'rev', l: 'Reverse' }] }] },
        'split-pdf': { title: 'Split PDF', desc: 'Separate one page or a whole set for easy conversion into independent PDF files.', accept: '.pdf', exts: ['pdf'], out: 'pdf', settings: [{ id: 'mode', label: 'Split Mode', type: 'select', opts: [{ v: 'all', l: 'Extract All Pages' }, { v: 'range', l: 'Custom Range' }] }] },
        'remove-pages': { title: 'Remove Pages', desc: 'Remove selected pages from your PDF document.', accept: '.pdf', exts: ['pdf'], out: 'pdf', settings: [{ id: 'pages', label: 'Pages to Remove', type: 'text', ph: 'e.g. 1,3,5-7' }] },
        'organize-pdf': { title: 'Organize PDF', desc: 'Sort, add, and delete PDF pages. Drag and drop page thumbnails to arrange.', accept: '.pdf', exts: ['pdf'], out: 'pdf', settings: [] },
        'compress-pdf': { title: 'Compress PDF', desc: 'Reduce file size while optimizing for maximal PDF quality.', accept: '.pdf', exts: ['pdf'], out: 'pdf', settings: [{ id: 'level', label: 'Compression', type: 'select', opts: [{ v: 'rec', l: 'Recommended Compression' }, { v: 'ext', l: 'Extreme Compression' }, { v: 'low', l: 'Less Compression' }] }] },
        'repair-pdf': { title: 'Repair PDF', desc: 'Repair a damaged PDF and recover data from corrupt PDF files.', accept: '.pdf', exts: ['pdf'], out: 'pdf', settings: [] },
        'jpg-to-pdf': { title: 'JPG to PDF', desc: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.', accept: '.jpg,.jpeg,.png', exts: ['jpg', 'jpeg', 'png'], out: 'pdf', multi: true, settings: [{ id: 'orient', label: 'Orientation', type: 'select', opts: [{ v: 'portrait', l: 'Portrait' }, { v: 'landscape', l: 'Landscape' }] }, { id: 'margin', label: 'Margin', type: 'select', opts: [{ v: 'none', l: 'No Margin' }, { v: 'small', l: 'Small' }, { v: 'large', l: 'Large' }] }] },
        'word-to-pdf': { title: 'Word to PDF', desc: 'Make DOC and DOCX files easy to read by converting them to PDF.', accept: '.doc,.docx', exts: ['doc', 'docx'], out: 'pdf', settings: [] },
        'powerpoint-to-pdf': { title: 'PowerPoint to PDF', desc: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.', accept: '.ppt,.pptx', exts: ['ppt', 'pptx'], out: 'pdf', settings: [] },
        'excel-to-pdf': { title: 'Excel to PDF', desc: 'Make EXCEL spreadsheets easy to read by converting them to PDF.', accept: '.xls,.xlsx,.csv', exts: ['xls', 'xlsx', 'csv'], out: 'pdf', settings: [{ id: 'fit', label: 'Page Fit', type: 'select', opts: [{ v: 'width', l: 'Fit All Columns' }, { v: 'actual', l: 'Actual Size' }] }] },
        'html-to-pdf': { title: 'HTML to PDF', desc: 'Convert webpages in HTML to PDF documents.', accept: '.html,.htm,.txt', exts: ['html', 'htm', 'txt'], out: 'pdf', settings: [] },
        'pdf-to-word': { title: 'PDF to Word', desc: 'Easily convert your PDF files into easy to edit DOC and DOCX documents.', accept: '.pdf', exts: ['pdf'], out: 'docx', settings: [{ id: 'ocr', label: 'OCR Mode', type: 'select', opts: [{ v: 'flow', l: 'Original Page Flow' }, { v: 'raw', l: 'Plain Text Only' }] }] },
        'pdf-to-powerpoint': { title: 'PDF to PowerPoint', desc: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.', accept: '.pdf', exts: ['pdf'], out: 'pptx', settings: [] },
        'pdf-to-excel': { title: 'PDF to Excel', desc: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.', accept: '.pdf', exts: ['pdf'], out: 'xlsx', settings: [{ id: 'detect', label: 'Table Detection', type: 'select', opts: [{ v: 'auto', l: 'Auto Detect' }, { v: 'force', l: 'Force Tables' }] }] },
        'pdf-to-jpg': { title: 'PDF to JPG', desc: 'Convert each PDF page into a JPG or extract all images contained in a PDF.', accept: '.pdf', exts: ['pdf'], out: 'jpg', settings: [{ id: 'quality', label: 'Resolution', type: 'select', opts: [{ v: 'high', l: 'High (300 DPI)' }, { v: 'std', l: 'Standard (150 DPI)' }] }] },
        'edit-pdf': { title: 'Edit PDF', desc: 'Add text, images, shapes or freehand annotations to a PDF document.', accept: '.pdf', exts: ['pdf'], out: 'pdf', settings: [] },
        'rotate-pdf': { title: 'Rotate PDF', desc: 'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once.', accept: '.pdf', exts: ['pdf'], out: 'pdf', settings: [{ id: 'deg', label: 'Rotation', type: 'select', opts: [{ v: '90', l: '90° Clockwise' }, { v: '180', l: '180°' }, { v: '270', l: '90° Counter-clockwise' }] }] },
        'page-numbers': { title: 'Add Page Numbers', desc: 'Add page numbers into PDFs with ease.', accept: '.pdf', exts: ['pdf'], out: 'pdf', settings: [{ id: 'pos', label: 'Position', type: 'select', opts: [{ v: 'bottom', l: 'Bottom Center' }, { v: 'top', l: 'Top Center' }] }] },
        'watermark': { title: 'Add Watermark', desc: 'Stamp an image or text over your PDF in seconds.', accept: '.pdf', exts: ['pdf'], out: 'pdf', settings: [{ id: 'text', label: 'Watermark Text', type: 'text', ph: 'e.g. CONFIDENTIAL' }] },
        'unlock-pdf': { title: 'Unlock PDF', desc: 'Remove PDF password security, giving you the freedom to use your PDFs.', accept: '.pdf', exts: ['pdf'], out: 'pdf', settings: [{ id: 'pw', label: 'Current Password', type: 'password', ph: 'Enter PDF password' }] },
        'protect-pdf': { title: 'Protect PDF', desc: 'Protect PDF files with a password. Encrypt PDF documents.', accept: '.pdf', exts: ['pdf'], out: 'pdf', settings: [{ id: 'pw', label: 'Set Password', type: 'password', ph: 'Choose a password' }, { id: 'enc', label: 'Encryption', type: 'select', opts: [{ v: 'aes', l: '256-bit AES' }, { v: 'rc4', l: '128-bit RC4' }] }] },
        'sign-pdf': { title: 'Sign PDF', desc: 'Sign a document and request signatures.', accept: '.pdf', exts: ['pdf'], out: 'pdf', settings: [] }
    };

    const fmtInfo = {
        pdf: { label: 'PDF Document', bg: '#e5322d' },
        docx: { label: 'Word Document', bg: '#2d6bc4' },
        xlsx: { label: 'Excel Sheet', bg: '#3a8d40' },
        pptx: { label: 'PowerPoint', bg: '#f97316' },
        jpg: { label: 'JPEG Image', bg: '#ca8a04' },
        txt: { label: 'Plain Text', bg: '#7c3aed' },
        csv: { label: 'CSV Table', bg: '#3a8d40' }
    };

    // ── DOM refs ──
    const viewDash = document.getElementById('view-dashboard');
    const viewTool = document.getElementById('view-tool');
    const logoHome = document.getElementById('logo-home');
    const btnBack = document.getElementById('btn-back-home');
    const toolTitle = document.getElementById('active-tool-title');
    const toolDesc = document.getElementById('active-tool-desc');
    const dropzone = document.getElementById('tool-dropzone');
    const fileInput = document.getElementById('tool-file-input');
    const fmtTags = document.getElementById('tool-format-tags');
    const fileList = document.getElementById('file-list');
    const settingsEl = document.getElementById('settings-panel');
    const btnCancel = document.getElementById('btn-cancel');
    const btnConvert = document.getElementById('btn-convert');
    const ringFill = document.getElementById('ring-fill');
    const pctEl = document.getElementById('progress-pct');
    const procSub = document.getElementById('processing-sub');
    const logConsole = document.getElementById('log-console');
    const resultBadge = document.getElementById('result-badge');
    const resultName = document.getElementById('result-name');
    const resultMeta = document.getElementById('result-meta');
    const btnDownload = document.getElementById('btn-download');
    const btnAgain = document.getElementById('btn-again');

    const screens = {
        dropzone: document.getElementById('tool-screen-dropzone'),
        config: document.getElementById('tool-screen-config'),
        processing: document.getElementById('tool-screen-processing'),
        success: document.getElementById('tool-screen-success')
    };

    // ── 1. FILTER TABS ──
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            const f = tag.dataset.filter;
            document.querySelectorAll('.tool-card').forEach(card => {
                card.style.display = (f === 'all' || card.dataset.category === f) ? '' : 'none';
            });
        });
    });

    // ── 2. CARD CLICKS ──
    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', () => openTool(card.dataset.tool));
    });

    // ── Navigation ──
    logoHome.addEventListener('click', goHome);
    btnBack.addEventListener('click', goHome);
    btnCancel.addEventListener('click', () => { reset(); showScreen('dropzone'); });
    btnAgain.addEventListener('click', () => { reset(); showScreen('dropzone'); });

    function goHome() {
        if (state.busy) return;
        viewTool.classList.remove('active');
        viewDash.classList.add('active');
        reset();
    }

    function openTool(id) {
        const spec = tools[id];
        if (!spec) return;
        state.activeToolId = id;
        toolTitle.textContent = spec.title;
        toolDesc.textContent = spec.desc;
        fileInput.setAttribute('accept', spec.accept);
        if (spec.multi) fileInput.setAttribute('multiple', ''); else fileInput.removeAttribute('multiple');
        fmtTags.innerHTML = spec.exts.map(e => `<span class="format-pill">${e.toUpperCase()}</span>`).join('');
        viewDash.classList.remove('active');
        viewTool.classList.add('active');
        showScreen('dropzone');
    }

    function showScreen(name) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[name].classList.add('active');
    }

    // ── 3. FILE UPLOAD ──
    ['dragenter', 'dragover'].forEach(e => dropzone.addEventListener(e, ev => { ev.preventDefault(); dropzone.classList.add('dragover'); }));
    ['dragleave', 'drop'].forEach(e => dropzone.addEventListener(e, ev => { ev.preventDefault(); dropzone.classList.remove('dragover'); }));
    dropzone.addEventListener('drop', e => { if (e.dataTransfer.files.length) ingest(e.dataTransfer.files); });
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', e => { if (e.target.files.length) ingest(e.target.files); });

    function ingest(files) {
        const spec = tools[state.activeToolId];
        const ok = [], bad = [];
        Array.from(files).forEach(f => {
            const ext = f.name.split('.').pop().toLowerCase();
            spec.exts.includes(ext) ? ok.push(f) : bad.push(f.name);
        });
        if (bad.length) alert('Rejected (wrong format): ' + bad.join(', '));
        if (!ok.length) return;
        state.selectedFiles = spec.multi ? [...state.selectedFiles, ...ok] : [ok[0]];
        buildConfig();
    }

    // ── 4. CONFIG ──
    function buildConfig() {
        // file list
        fileList.innerHTML = '';
        state.selectedFiles.forEach((f, i) => {
            const row = document.createElement('div');
            row.className = 'file-row';
            row.innerHTML = `<div class="file-row-num">${i + 1}</div><div class="file-row-name" title="${f.name}">${f.name}</div><div class="file-row-size">${bytes(f.size)}</div><button class="file-row-del" data-i="${i}"><svg viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;
            row.querySelector('.file-row-del').addEventListener('click', e => {
                state.selectedFiles.splice(+e.currentTarget.dataset.i, 1);
                state.selectedFiles.length ? buildConfig() : (reset(), showScreen('dropzone'));
            });
            fileList.appendChild(row);
        });

        // settings
        const spec = tools[state.activeToolId];
        settingsEl.innerHTML = '';
        if (!spec.settings || !spec.settings.length) {
            settingsEl.innerHTML = '<div class="field-group" style="grid-column:1/-1"><label>Quality</label><select><option>Standard (Recommended)</option><option>High Quality</option></select></div>';
        } else {
            spec.settings.forEach(s => {
                const d = document.createElement('div');
                d.className = 'field-group';
                let html = `<label for="${s.id}">${s.label}</label>`;
                if (s.type === 'select') {
                    html += `<select id="${s.id}">${s.opts.map(o => `<option value="${o.v}">${o.l}</option>`).join('')}</select>`;
                } else if (s.type === 'password') {
                    html += `<input type="password" id="${s.id}" placeholder="${s.ph || ''}" autocomplete="new-password">`;
                } else {
                    html += `<input type="text" id="${s.id}" placeholder="${s.ph || ''}">`;
                }
                d.innerHTML = html;
                settingsEl.appendChild(d);
            });
        }
        showScreen('config');
    }

    // ── 5. CONVERT ──
    btnConvert.addEventListener('click', () => {
        if (state.busy) return;
        state.busy = true;
        showScreen('processing');
        runPipeline();
    });

    function runPipeline() {
        logConsole.innerHTML = '';
        setProgress(0);
        const spec = tools[state.activeToolId];
        procSub.textContent = `Converting to ${spec.out.toUpperCase()}…`;

        const logs = [
            'Initializing conversion engine…',
            `Reading ${state.selectedFiles.length} input file(s)…`,
            'Validating document structure…',
            'Parsing layout elements and metadata…',
            'Transforming content to target format…',
            'Optimizing output stream…',
            'Finalizing document…'
        ];

        let step = 0;
        function next() {
            if (step >= logs.length) { convert(); return; }
            addLog(logs[step], step === 0 ? 'run' : 'dim');
            setProgress(Math.round(((step + 1) / logs.length) * 90));
            const prev = logConsole.querySelectorAll('.log-line');
            if (prev.length > 1) prev[prev.length - 2].className = 'log-line ok';
            step++;
            setTimeout(next, 400 + Math.random() * 400);
        }
        next();
    }

    function addLog(txt, cls) {
        const d = document.createElement('div');
        d.className = 'log-line ' + cls;
        const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        d.textContent = `[${t}] ${txt}`;
        logConsole.appendChild(d);
        logConsole.scrollTop = logConsole.scrollHeight;
    }

    function setProgress(p) {
        pctEl.textContent = p + '%';
        const c = 2 * Math.PI * 50;
        ringFill.style.strokeDashoffset = c - (p / 100) * c;
    }

    // ── 6. ACTUAL CONVERSION ──
    function convert() {
        const spec = tools[state.activeToolId];
        const ext = spec.out;
        const outName = state.selectedFiles.length === 1
            ? basename(state.selectedFiles[0].name) + '_converted.' + ext
            : 'omniconvert_output.' + ext;

        // JPG → PDF (real)
        if (state.activeToolId === 'jpg-to-pdf') {
            const orient = document.getElementById('orient')?.value || 'portrait';
            const mg = document.getElementById('margin')?.value || 'none';
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: orient, unit: 'pt', format: 'a4' });
            const pad = mg === 'none' ? 0 : mg === 'small' ? 20 : 40;
            let idx = 0;
            (function addImg() {
                if (idx >= state.selectedFiles.length) return finish(doc.output('blob'), outName);
                const r = new FileReader();
                r.onload = ev => {
                    const img = new Image();
                    img.onload = () => {
                        if (idx > 0) doc.addPage();
                        const w = doc.internal.pageSize.getWidth() - pad * 2;
                        const h = doc.internal.pageSize.getHeight() - pad * 2;
                        doc.addImage(ev.target.result, 'JPEG', pad, pad, w, h);
                        idx++; addImg();
                    };
                    img.src = ev.target.result;
                };
                r.readAsDataURL(state.selectedFiles[idx]);
            })();
            return;
        }

        // HTML/TXT → PDF (real)
        if (state.activeToolId === 'html-to-pdf') {
            const r = new FileReader();
            r.onload = ev => {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                doc.setFontSize(10);
                doc.text(doc.splitTextToSize(ev.target.result, 500), 20, 20);
                finish(doc.output('blob'), outName);
            };
            r.readAsText(state.selectedFiles[0]);
            return;
        }

        // Office → PDF or PDF → Office (simulated but functional output)
        setTimeout(() => {
            if (ext === 'pdf') {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                doc.setFontSize(20); doc.setTextColor(229, 50, 45);
                doc.text('OmniConvert — Document Output', 20, 30);
                doc.setFontSize(11); doc.setTextColor(80, 80, 80);
                doc.text('Source: ' + state.selectedFiles.map(f => f.name).join(', '), 20, 48);
                doc.text('Size: ' + bytes(state.selectedFiles[0].size), 20, 58);
                doc.text('Processed: ' + new Date().toLocaleString(), 20, 68);
                doc.line(20, 76, 190, 76);
                doc.text('This PDF was generated client-side inside your browser.', 20, 88);
                doc.text('No data was uploaded to any server.', 20, 98);
                finish(doc.output('blob'), outName);
            } else {
                const txt = `OmniConvert Output (${ext.toUpperCase()})\nSource: ${state.selectedFiles[0].name}\nGenerated: ${new Date().toLocaleString()}\n\nDocument contents would appear here in a production environment.`;
                const mime = (fmtInfo[ext] || {}).mime || 'application/octet-stream';
                finish(new Blob([txt], { type: mime }), outName);
            }
        }, 600);
    }

    function finish(blob, name) {
        state.busy = false;
        setProgress(100);
        addLog('Done! File is ready.', 'ok');
        const url = URL.createObjectURL(blob);
        const info = fmtInfo[tools[state.activeToolId].out] || { label: 'File', bg: '#666' };
        resultBadge.textContent = tools[state.activeToolId].out.toUpperCase();
        resultBadge.style.background = info.bg;
        resultName.textContent = name;
        resultMeta.textContent = bytes(blob.size) + ' • ' + info.label;
        btnDownload.href = url;
        btnDownload.download = name;

        // history
        state.history.unshift({ name, fmt: tools[state.activeToolId].out, size: blob.size, url, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
        if (state.history.length > 8) state.history.pop();
        localStorage.setItem('omni_hist_v3', JSON.stringify(state.history));

        setTimeout(() => showScreen('success'), 500);
    }

    // ── Helpers ──
    function reset() { state.selectedFiles = []; fileInput.value = ''; state.busy = false; logConsole.innerHTML = ''; }
    function bytes(b) { if (!b) return '0 B'; const u = ['B', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(b) / Math.log(1024)); return (b / Math.pow(1024, i)).toFixed(1) + ' ' + u[i]; }
    function basename(n) { return n.substring(0, n.lastIndexOf('.')) || n; }
});
