/* =====================================================
   ECK-JEFF ASP CONVERTER - Conversion Logic
   Left panel:  HTML/CSS/JS  → VBScript Response.Write
   Right panel: VBScript     → HTML/CSS/JS
   ===================================================== */

// ── Utility: show a quick toast notification ────────────────────────────────
function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2000);
}

// ── Utility: clear a textarea ───────────────────────────────────────────────
function clearArea(id) {
    document.getElementById(id).value = '';
    document.getElementById(id).focus();
}

// ── Utility: copy a textarea's content to clipboard ────────────────────────
function copyArea(id) {
    const el = document.getElementById(id);
    if (!el.value.trim()) {
        showToast('Nothing to copy!');
        return;
    }
    el.select();
    el.setSelectionRange(0, 99999); // mobile support
    try {
        navigator.clipboard.writeText(el.value).then(() => {
            showToast('✅ Copied to clipboard!');
        }).catch(() => {
            document.execCommand('copy');
            showToast('✅ Copied to clipboard!');
        });
    } catch {
        document.execCommand('copy');
        showToast('✅ Copied to clipboard!');
    }
}

// ── LEFT → RIGHT: HTML/CSS/JS  ➜  VBScript Response.Write ─────────────────
function convertToVB() {
    let input = document.getElementById('inputCode').value;

    if (!input.trim()) {
        showToast('⚠️ Source code is empty!');
        return;
    }

    const wrapStyle  = document.getElementById('wrapStyle').checked;
    const wrapScript = document.getElementById('wrapScript').checked;

    // Optionally wrap source in <style> or <script> tags first
    if (wrapStyle)  input = `<style>\n${input}\n</style>`;
    if (wrapScript) input = `<script>\n${input}\n<\/script>`;

    const lines = input.split('\n');
    const converted = lines.map(line => {
        // Trim trailing \r for Windows-style line endings
        const clean = line.replace(/\r$/, '');
        // Escape every " as "" for VBScript string literals
        const escaped = clean.replace(/"/g, '""');
        return `Response.Write("${escaped}") & vbCrLf`;
    });

    document.getElementById('outputCode').value = converted.join('\n');
    showToast('✅ Converted to VBScript!');
}

// ── RIGHT → LEFT: VBScript Response.Write  ➜  HTML/CSS/JS ─────────────────
function convertToJS() {
    const input = document.getElementById('outputCode').value;

    if (!input.trim()) {
        showToast('⚠️ VBScript area is empty!');
        return;
    }

    const lines = input.split('\n');
    const restored = lines.map(line => {
        // Strip trailing carriage return
        const trimmed = line.replace(/\r$/, '');

        // Match full Response.Write("...") & vbCrLf line
        // Handles optional leading whitespace and optional & vbCrLf suffix
        const match = trimmed.match(
            /^\s*Response\.Write\("(.*)"\)\s*(?:&\s*vbCrLf)?\s*$/i
        );

        if (match) {
            // Unescape VBScript double-quotes: "" → "
            return match[1].replace(/""/g, '"');
        }

        // Not a Response.Write line — preserve as-is (comments, blank lines, etc.)
        return trimmed;
    });

    document.getElementById('inputCode').value = restored.join('\n');
    showToast('✅ Converted to JS/HTML!');
}