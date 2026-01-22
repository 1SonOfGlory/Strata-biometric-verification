// content.js - Strata Injection Engine

(function() {
    // Prevent double-injection
    if (document.getElementById('strata-root')) {
        const app = document.getElementById('strata-root');
        app.style.display = app.style.display === 'none' ? 'flex' : 'none';
        return;
    }

    // 1. Create Host
    const host = document.createElement('div');
    host.id = 'strata-root';
    host.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        z-index: 2147483647; background: rgba(255,255,255,0.95);
        display: flex; flex-direction: column; opacity: 0; transition: opacity 0.3s ease;
    `;
    document.body.appendChild(host);

    // 2. Create Shadow DOM
    const shadow = host.attachShadow({ mode: 'open' });

    // 3. Inject External Fonts (Inter + Merriweather)
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=JetBrains+Mono:wght@400;500&display=swap';
    shadow.appendChild(fontLink);

    // 4. Inject Styles (The Publisher Aesthetic)
    const style = document.createElement('style');
    style.textContent = `
        :host { all: initial; font-family: 'Inter', sans-serif; color: #242424; }
        
        /* Layout */
        .container { display: grid; grid-template-columns: 1fr 400px; height: 100vh; width: 100vw; }
        .editor-zone { padding: 80px 15%; display: flex; flex-direction: column; overflow-y: auto; background: #fff; position: relative; }
        .dash-zone { background: #F9F9F9; border-left: 1px solid #E6E6E6; padding: 40px 30px; display: flex; flex-direction: column; gap: 30px; }
        
        /* Typography */
        h1 { font-family: 'Merriweather', serif; font-size: 1.5rem; margin: 0 0 5px 0; }
        h2 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #6B6B6B; margin: 0 0 15px 0; }
        
        /* Editor */
        textarea, .replay-box {
            flex: 1; border: none; background: transparent; resize: none; outline: none;
            font-family: 'Merriweather', serif; font-size: 1.25rem; line-height: 2;
            color: rgba(0, 0, 0, 0.84); white-space: pre-wrap; min-height: 60vh;
        }
        .replay-box { display: none; }
        
        /* Highlights */
        .char-clean { background-color: rgba(26, 137, 23, 0.15); }
        .char-edit { background-color: rgba(41, 121, 255, 0.15); color: #0044CC; }
        .char-paste { background-color: rgba(200, 0, 0, 0.15); color: #CC0000; border-bottom: 2px solid #CC0000; }

        /* Controls */
        .btn-close { position: absolute; top: 20px; right: 20px; cursor: pointer; border: none; background: transparent; font-size: 1.5rem; color: #999; }
        .btn-submit {
            position: fixed; bottom: 40px; right: 440px;
            background: #000; color: #fff; padding: 12px 24px; border-radius: 30px;
            font-family: 'Inter', sans-serif; font-weight: 500; border: none;
            cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.1); transition: transform 0.2s;
            z-index: 100;
        }
        .btn-submit:hover { transform: translateY(-2px); }
        .btn-submit.review { background: #1A8917; }

        /* Dashboard Cards */
        .card { background: #fff; border: 1px solid #E6E6E6; border-radius: 8px; padding: 20px; }
        .row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.9rem; }
        .swatch { width: 12px; height: 12px; border-radius: 2px; display: inline-block; margin-right: 8px; }
        .badge { font-family: 'JetBrains Mono'; font-size: 0.8rem; background: #F2F2F2; padding: 2px 6px; border-radius: 4px; color: #666; }
        
        /* Player */
        input[type="range"] { width: 100%; margin-top: 15px; cursor: pointer; }
        .btn-play { width: 100%; margin-top: 10px; padding: 8px; background: #fff; border: 1px solid #E6E6E6; border-radius: 4px; cursor: pointer; }
        .btn-play:hover { border-color: #000; }
    `;
    shadow.appendChild(style);

    // 5. Inject HTML
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="container">
            <button id="btnClose" class="btn-close">×</button>
            
            <div class="editor-zone">
                <div style="margin-bottom: 40px; border-bottom:1px solid #eee; padding-bottom:20px;">
                    <h1>Strata</h1>
                    <span style="font-size:0.8rem; color:#666;">Secure Verification Environment</span>
                </div>
                
                <textarea id="input" placeholder="Start writing..."></textarea>
                <div id="replay" class="replay-box"></div>
            </div>

            <button id="submit" class="btn-submit">Verify & Publish</button>

            <div class="dash-zone">
                <div>
                    <h2>Provenance</h2>
                    <div class="card">
                        <div class="row">
                            <span><span class="swatch" style="background:rgba(26, 137, 23, 0.5)"></span>Original</span>
                            <span class="badge">Verified</span>
                        </div>
                        <div class="row">
                            <span><span class="swatch" style="background:rgba(41, 121, 255, 0.5)"></span>Edited</span>
                            <span id="count-edit" class="badge">0</span>
                        </div>
                        <div class="row">
                            <span><span class="swatch" style="background:rgba(200, 0, 0, 0.5)"></span>Source</span>
                            <span id="count-paste" class="badge" style="color:#c00; background:rgba(200,0,0,0.1)">0</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h2>Replay</h2>
                    <div class="card">
                        <span id="time" style="font-family:'JetBrains Mono'; font-size:1.2rem;">00:00</span>
                        <input type="range" id="timeline" min="0" value="0" disabled>
                        <button id="play" class="btn-play">▶ Play Replay</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    shadow.appendChild(wrapper);

    // 6. The Logic Class
    class StrataEngine {
        constructor(root) {
            this.root = root;
            this.input = root.getElementById('input');
            this.replay = root.getElementById('replay');
            this.timeline = root.getElementById('timeline');
            
            this.sessionStart = Date.now();
            this.charData = []; 
            this.snapshots = []; 
            this.dirtyIndex = -1;
            this.totalEdits = 0; 
            this.totalPastes = 0;
            this.isPlaying = false;

            this.init();
        }

        init() {
            this.input.addEventListener('keydown', e => {
                if(e.key === 'Backspace' && this.input.selectionStart > 0) 
                    this.dirtyIndex = this.input.selectionStart - 1;
            });
            
            this.input.addEventListener('paste', e => {
                this.totalPastes++;
                this.root.getElementById('count-paste').innerText = this.totalPastes;
            });
            
            this.input.addEventListener('input', e => this.handleInput(e));
            this.timeline.addEventListener('input', e => this.renderFrame(e.target.value));
        }

        handleInput(e) {
            const val = this.input.value;
            const cursor = this.input.selectionStart;
            const type = e.inputType;

            if (type === 'deleteContentBackward') {
                this.charData.splice(cursor, this.charData.length - val.length);
                this.totalEdits++;
            } 
            else if (type === 'insertFromPaste') {
                const txt = val.substring(cursor - (val.length - this.charData.length), cursor);
                const newChars = txt.split('').map(c => ({ char: c, type: 'char-paste' }));
                this.charData.splice(cursor - txt.length, 0, ...newChars);
            }
            else {
                const isEdit = (Math.abs(cursor - 1 - this.dirtyIndex) < 2);
                const gene = { char: e.data || val.slice(-1), type: isEdit ? 'char-edit' : 'char-clean' };
                if (cursor === val.length) this.charData.push(gene);
                else this.charData.splice(cursor - 1, 0, gene);
                if(isEdit) { this.dirtyIndex = -1; this.totalEdits++; }
            }
            
            this.root.getElementById('count-edit').innerText = this.totalEdits;
            this.saveSnapshot();
        }

        saveSnapshot() {
            if(this.isPlaying) return;
            this.snapshots.push({ 
                t: Date.now() - this.sessionStart, 
                data: JSON.parse(JSON.stringify(this.charData)) 
            });
            this.timeline.max = this.snapshots.length - 1;
            this.timeline.value = this.snapshots.length - 1;
            this.timeline.disabled = false;
        }

        renderFrame(idx) {
            if(!this.snapshots[idx]) return;
            const frame = this.snapshots[idx];
            this.replay.innerHTML = frame.data.map(c => 
                `<span class="${c.type}">${c.char === '\n' ? '<br>' : c.char.replace(/</g, '&lt;')}</span>`
            ).join('');
            
            const date = new Date(frame.t);
            this.root.getElementById('time').innerText = date.toISOString().substr(14, 5);
        }

        toggleReplay(btn) {
            if(this.isPlaying) {
                this.isPlaying = false; clearInterval(this.interval); btn.innerText = "▶ Play Replay";
            } else {
                this.isPlaying = true; btn.innerText = "⏸ Pause";
                // Force switch to review mode
                if(this.input.style.display !== 'none') this.root.getElementById('submit').click();
                
                let i = parseInt(this.timeline.value);
                this.interval = setInterval(() => {
                    if(i >= this.snapshots.length) return this.toggleReplay(btn);
                    this.renderFrame(i); this.timeline.value = i; i++;
                }, 50); // Speed
            }
        }
    }

    // Initialize Engine
    const engine = new StrataEngine(shadow);

    // Bind UI Actions
    shadow.getElementById('submit').addEventListener('click', function() {
        const input = shadow.getElementById('input');
        const replay = shadow.getElementById('replay');
        
        if (input.style.display !== 'none') {
            // Verify Mode
            input.style.display = 'none'; replay.style.display = 'block';
            this.innerText = "✎ Resume Editing"; this.classList.add('review');
            engine.renderFrame(engine.charData.length - 1);
        } else {
            // Edit Mode
            input.style.display = 'block'; replay.style.display = 'none';
            this.innerText = "Verify & Publish"; this.classList.remove('review');
        }
    });

    shadow.getElementById('play').addEventListener('click', e => engine.toggleReplay(e.target));
    
    shadow.getElementById('btnClose').addEventListener('click', () => {
        host.style.opacity = '0';
        setTimeout(() => host.style.display = 'none', 300);
    });

    // Fade In
    setTimeout(() => host.style.opacity = '1', 10);

})();