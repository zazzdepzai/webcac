const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'd683a22c-d8fe-4b56-9100-ad63701235f3';

const htmlTemplate = (step, finalKey) => `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SCRIPT GET KEY SYSTEM</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        body { background: #050505; font-family: 'JetBrains Mono', monospace; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .main-card { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 20px; box-shadow: 0 0 30px rgba(0,0,0,0.5); position: relative; overflow: hidden; }
        .main-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #3b82f6, transparent); animation: scan 3s linear infinite; }
        @keyframes scan { 0% { left: -100%; } 100% { left: 100%; } }
        .btn-cyber { background: #3b82f6; transition: all 0.3s; text-shadow: 0 0 5px rgba(255,255,255,0.5); }
        .btn-cyber:hover { background: #2563eb; box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); transform: translateY(-1px); }
        .btn-cyber:disabled { background: #1e293b; cursor: not-allowed; }
        .step-bar { height: 4px; background: #1a1a1a; border-radius: 2px; flex: 1; position: relative; }
        .step-bar.fill::after { content: ''; position: absolute; width: 100%; height: 100%; background: #3b82f6; box-shadow: 0 0 10px #3b82f6; border-radius: 2px; }
    </style>
</head>
<body>
    <div class="main-card p-8 w-full max-w-sm text-center">
        <div class="mb-6">
            <h1 class="text-xl font-bold tracking-tighter text-blue-500 mb-1">SCRIPT GET KEY</h1>
            <div class="text-[10px] text-gray-500 uppercase tracking-[4px]">Verified Security</div>
        </div>

        <div class="flex gap-2 mb-8">
            <div class="step-bar ${step >= 1 ? 'fill' : ''}"></div>
            <div class="step-bar ${step >= 2 ? 'fill' : ''}"></div>
            <div class="step-bar ${step >= 3 ? 'fill' : ''}"></div>
        </div>

        ${step <= 3 ? `
            <div class="space-y-6">
                <div class="text-sm text-gray-400">Vui lòng hoàn thành bước <span class="text-blue-500 font-bold">${step}/3</span> để tiếp tục.</div>
                <button onclick="generateLink(${step})" id="btn" class="btn-cyber w-full py-4 rounded-lg font-bold text-xs uppercase tracking-widest">
                    Bắt đầu xác minh
                </button>
            </div>
        ` : `
            <div class="animate-fadeIn">
                <div class="bg-blue-500/5 border border-blue-500/20 p-5 rounded-lg mb-6">
                    <p class="text-[10px] text-gray-500 mb-3 uppercase tracking-widest">Script Key của bạn:</p>
                    <div class="bg-black p-3 rounded border border-gray-800">
                        <code class="text-green-400 text-lg font-bold">${finalKey}</code>
                    </div>
                </div>
                <button onclick="copyKey('${finalKey}')" class="w-full py-3 border border-gray-700 rounded-lg text-xs hover:bg-white/5 transition">SAO CHÉP KEY</button>
            </div>
        `}

        <div class="mt-8 text-[9px] text-gray-600 italic">
            Device ID: <span class="text-gray-400">Recognized</span>
        </div>
    </div>

    <script>
        async function generateLink(s) {
            const b = document.getElementById('btn');
            b.disabled = true;
            b.innerText = 'ĐANG KHỞI TẠO...';
            try {
                const res = await fetch('/generate?step=' + s);
                const d = await res.json();
                if(d.url) window.location.href = d.url;
                else throw new Error();
            } catch {
                alert('Lỗi kết nối API!');
                b.disabled = false;
                b.innerText = 'THỬ LẠI';
            }
        }
        function copyKey(k) {
            navigator.clipboard.writeText(k);
            alert('Đã sao chép Script Key!');
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => {
    const step = parseInt(req.query.step) || 1;
    let key = step > 3 ? "SCR-" + Math.random().toString(36).substr(2, 10).toUpperCase() : null;
    res.send(htmlTemplate(step, key));
});

app.get('/generate', async (req, res) => {
    const step = parseInt(req.query.step) || 1;
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const destination = `${protocol}://${req.get('host')}/?step=${step + 1}`;
    try {
        const response = await axios.get('https://work.ink/api/v1/shorten', {
            params: { api_key: API_KEY, url: destination }
        });
        res.json({ url: response.data.url });
    } catch (e) {
        res.status(500).json({ error: "API Error" });
    }
});

app.listen(PORT, () => console.log('Server Live'));
