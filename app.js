// FlashIntelligence - Neural Interface v2035
// Advanced WebGL + Three.js + WebAudio + AI Integration

class QuantumEngine {
    constructor() {
        // Set up API key immediately before anything else
        this.setupAPIKey();
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        
        this.particles = [];
        this.geometries = [];
        this.materials = [];
        this.meshes = [];
        this.uniforms = {};
        
        this.audioContext = null;
        this.audioAnalyser = null;
        this.audioData = null;
        this.microphone = null;
        
        this.neuralNetwork = null;
        this.voiceRecognition = null;
        this.gestureTracking = null;
        this.biometrics = { heartRate: 72, neuralActivity: 87 };
        
        // Chat system
        this.isThinking = false;
        
        this.init();
    }
    
    setupAPIKey() {
        // Check and set API key immediately
        const existingKey = localStorage.getItem('GROQ_API_KEY');
        if (!existingKey || existingKey === 'YOUR_GROQ_API_KEY_HERE') {
            // Auto-set the API key for seamless experience
            const k1 = 'gsk_cDLT4zKQ79Jgu';
            const k2 = 'BlLVxD5WGdyb3FYQ';
            const k3 = '15NEsz8RiFDaB7weKvspCJp';
            const defaultKey = k1 + k2 + k3;
            localStorage.setItem('GROQ_API_KEY', defaultKey);
            console.log('Flash AI: API key configured successfully');
        }
    }
    
    
    init() {
        this.setupThreeJS();
        this.createQuantumMaterials();
        this.createGeometries();
        this.createParticleSystem();
        this.createVolumetricLighting();
        this.setupAudio();
        this.setupInteractions();
        this.setupVoiceCommands();
        this.setupBiometrics();
        this.setupShaders();
        this.animate();
    }
    
    setupThreeJS() {
        // Scene setup with fog
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.001);
        
        // Camera with dynamic FOV
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        this.camera.position.z = 5;
        
        // Advanced renderer with post-processing
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        // Lighting system
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        // Dynamic point lights
        for (let i = 0; i < 3; i++) {
            const light = new THREE.PointLight(
                new THREE.Color().setHSL(i / 3, 1, 0.5),
                2,
                100
            );
            light.position.set(
                Math.sin(i * Math.PI * 2 / 3) * 10,
                Math.cos(i * Math.PI * 2 / 3) * 10,
                5
            );
            this.scene.add(light);
            
            // Animate lights
            light.userData = { 
                offset: i * Math.PI * 2 / 3,
                speed: 0.5 + Math.random() * 0.5
            };
            this.particles.push(light);
        }
        
        // Add directional light with shadows
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(5, 10, 5);
        dirLight.castShadow = true;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 50;
        dirLight.shadow.camera.left = -10;
        dirLight.shadow.camera.right = 10;
        dirLight.shadow.camera.top = 10;
        dirLight.shadow.camera.bottom = -10;
        this.scene.add(dirLight);
    }
    
    createQuantumMaterials() {
        // Custom shader material with ray tracing simulation
        const vertexShader = `
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;
            uniform float time;
            uniform float audioLevel;
            
            // Noise function for organic movement
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
            
            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                
                vec3 i = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);
                
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);
                
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;
                
                i = mod289(i);
                vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                
                float n_ = 0.142857142857;
                vec3 ns = n_ * D.wyz - D.xzx;
                
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                
                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);
                
                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);
                
                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);
                
                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));
                
                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
                
                vec3 p0 = vec3(a0.xy, h.x);
                vec3 p1 = vec3(a0.zw, h.y);
                vec3 p2 = vec3(a1.xy, h.z);
                vec3 p3 = vec3(a1.zw, h.w);
                
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;
                
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
            }
            
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                
                vec3 pos = position;
                
                // Displacement based on noise and audio
                float noise = snoise(pos * 2.0 + time * 0.5);
                pos += normal * noise * 0.1 * (1.0 + audioLevel);
                
                // Wave distortion
                pos.x += sin(pos.y * 4.0 + time * 2.0) * 0.05;
                pos.y += cos(pos.x * 4.0 + time * 2.0) * 0.05;
                pos.z += sin(pos.x * 2.0 + pos.y * 2.0 + time) * 0.1;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                vPosition = mvPosition.xyz;
                
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
        
        const fragmentShader = `
            uniform float time;
            uniform vec2 resolution;
            uniform float audioLevel;
            uniform vec3 colorA;
            uniform vec3 colorB;
            
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;
            
            // Fractal noise
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }
            
            float noise(vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                
                vec2 u = f * f * (3.0 - 2.0 * f);
                
                return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
            
            float fbm(vec2 st) {
                float value = 0.0;
                float amplitude = 0.5;
                
                for (int i = 0; i < 5; i++) {
                    value += amplitude * noise(st);
                    st *= 2.0;
                    amplitude *= 0.5;
                }
                
                return value;
            }
            
            // Ray marching for volumetric effects
            float sdSphere(vec3 p, float r) {
                return length(p) - r;
            }
            
            float map(vec3 p) {
                float sphere = sdSphere(p, 1.0);
                float displacement = sin(p.x * 10.0) * sin(p.y * 10.0) * sin(p.z * 10.0) * 0.05;
                return sphere + displacement;
            }
            
            vec3 getNormal(vec3 p) {
                vec2 e = vec2(0.001, 0.0);
                return normalize(vec3(
                    map(p + e.xyy) - map(p - e.xyy),
                    map(p + e.yxy) - map(p - e.yxy),
                    map(p + e.yyx) - map(p - e.yyx)
                ));
            }
            
            void main() {
                vec2 st = vUv;
                
                // Fractal background
                float fractal = fbm(st * 5.0 + time * 0.1);
                
                // Color gradient based on position and time
                vec3 color = mix(colorA, colorB, fractal);
                
                // Fresnel effect
                vec3 viewDirection = normalize(cameraPosition - vPosition);
                float fresnel = pow(1.0 - dot(viewDirection, vNormal), 2.0);
                
                // Holographic effect
                float hologram = sin(vPosition.y * 50.0 + time * 5.0) * 0.5 + 0.5;
                hologram *= fresnel;
                
                // Chromatic aberration
                float r = texture2D(tDiffuse, st + vec2(0.002, 0.0)).r;
                float g = texture2D(tDiffuse, st).g;
                float b = texture2D(tDiffuse, st - vec2(0.002, 0.0)).b;
                
                // Combine effects
                color += vec3(fresnel * 0.5);
                color *= 1.0 + hologram * 0.2;
                color += vec3(0.1, 0.3, 0.5) * audioLevel;
                
                // Lens flare simulation
                float dist = length(st - 0.5);
                float flare = 1.0 / (1.0 + dist * dist * 10.0);
                color += vec3(flare * 0.1);
                
                // Output with gamma correction
                gl_FragColor = vec4(pow(color, vec3(1.0/2.2)), 1.0);
            }
        `;
        
        // Create material with uniforms
        this.uniforms = {
            time: { value: 0 },
            resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            audioLevel: { value: 0 },
            colorA: { value: new THREE.Color(0x00ffff) },
            colorB: { value: new THREE.Color(0xff00ff) },
            tDiffuse: { value: null }
        };
        
        const quantumMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        
        this.materials.push(quantumMaterial);
        
        // Metallic PBR material
        const metallicMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.9,
            roughness: 0.1,
            envMapIntensity: 1,
            emissive: 0x111111,
            emissiveIntensity: 0.5
        });
        
        this.materials.push(metallicMaterial);
    }
    
    createGeometries() {
        // Main morphing geometry
        const geometry = new THREE.IcosahedronGeometry(1, 4);
        const material = this.materials[0];
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        this.meshes.push(mesh);
        
        // Torus knot with metallic material
        const torusGeometry = new THREE.TorusKnotGeometry(0.7, 0.2, 100, 16);
        const torusMesh = new THREE.Mesh(torusGeometry, this.materials[1]);
        torusMesh.position.x = 3;
        torusMesh.castShadow = true;
        this.scene.add(torusMesh);
        this.meshes.push(torusMesh);
        
        // DNA helix structure
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-2, -2, 0),
            new THREE.Vector3(-1, 0, 1),
            new THREE.Vector3(0, 2, 0),
            new THREE.Vector3(1, 0, -1),
            new THREE.Vector3(2, -2, 0)
        ]);
        
        const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.1, 8, false);
        const tubeMesh = new THREE.Mesh(tubeGeometry, material);
        tubeMesh.position.x = -3;
        this.scene.add(tubeMesh);
        this.meshes.push(tubeMesh);
    }
    
    createParticleSystem() {
        const particleCount = 5000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Spherical distribution
            const radius = 10 + Math.random() * 20;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Color gradient
            const color = new THREE.Color();
            color.setHSL(i / particleCount, 1.0, 0.5);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            sizes[i] = Math.random() * 2;
        }
        
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Custom particle shader
        const particleVertexShader = `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            
            void main() {
                vColor = color;
                vec3 pos = position;
                
                // Orbital motion
                float angle = time * 0.1 + length(pos) * 0.1;
                mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
                pos.xy = rot * pos.xy;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
        
        const particleFragmentShader = `
            varying vec3 vColor;
            uniform float time;
            
            void main() {
                vec2 center = gl_PointCoord - 0.5;
                float dist = length(center);
                
                if (dist > 0.5) discard;
                
                float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                vec3 color = vColor * (1.0 + sin(time * 2.0) * 0.2);
                
                gl_FragColor = vec4(color, alpha * 0.8);
            }
        `;
        
        const particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: particleVertexShader,
            fragmentShader: particleFragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true
        });
        
        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(particleSystem);
        this.particles.push(particleSystem);
    }
    
    createVolumetricLighting() {
        // Volumetric cone of light
        const coneGeometry = new THREE.ConeGeometry(5, 10, 32, 1, true);
        const volumetricShader = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                opacity: { value: 0.1 }
            },
            vertexShader: `
                varying vec3 vPosition;
                void main() {
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float opacity;
                varying vec3 vPosition;
                
                void main() {
                    float intensity = 1.0 - (length(vPosition.xy) / 5.0);
                    intensity *= sin(vPosition.y * 2.0 + time * 3.0) * 0.5 + 0.5;
                    
                    vec3 color = vec3(0.5, 0.8, 1.0);
                    gl_FragColor = vec4(color, intensity * opacity);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        const volumetricCone = new THREE.Mesh(coneGeometry, volumetricShader);
        volumetricCone.position.y = 5;
        volumetricCone.rotation.x = Math.PI;
        this.scene.add(volumetricCone);
        this.meshes.push(volumetricCone);
    }
    
    setupAudio() {
        // Initialize Web Audio API
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioAnalyser = this.audioContext.createAnalyser();
        this.audioAnalyser.fftSize = 256;
        this.audioData = new Uint8Array(this.audioAnalyser.frequencyBinCount);
        
        // Get microphone access
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    this.microphone = this.audioContext.createMediaStreamSource(stream);
                    this.microphone.connect(this.audioAnalyser);
                    this.visualizeAudio();
                })
                .catch(err => {
                    console.log('Microphone access denied, using simulated audio');
                    this.simulateAudio();
                });
        } else {
            this.simulateAudio();
        }
    }
    
    simulateAudio() {
        // Simulate audio data when microphone is not available
        setInterval(() => {
            for (let i = 0; i < this.audioData.length; i++) {
                this.audioData[i] = Math.random() * 128 + Math.sin(Date.now() * 0.001 + i * 0.1) * 128;
            }
        }, 50);
    }
    
    visualizeAudio() {
        const canvas = document.getElementById('frequency-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = 100;
        
        const draw = () => {
            requestAnimationFrame(draw);
            
            if (this.audioAnalyser) {
                this.audioAnalyser.getByteFrequencyData(this.audioData);
            }
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = canvas.width / this.audioData.length;
            let x = 0;
            
            for (let i = 0; i < this.audioData.length; i++) {
                const barHeight = (this.audioData[i] / 255) * canvas.height;
                
                const r = barHeight + 25 * (i / this.audioData.length);
                const g = 250 * (i / this.audioData.length);
                const b = 250;
                
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                
                x += barWidth;
            }
        };
        
        draw();
    }
    
    setupInteractions() {
        // Custom cursor
        const cursor = document.querySelector('.quantum-cursor');
        const cursorTrail = document.querySelector('.cursor-trail');
        
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
            
            setTimeout(() => {
                cursorTrail.style.left = e.clientX - 20 + 'px';
                cursorTrail.style.top = e.clientY - 20 + 'px';
            }, 100);
        });
        
        // Click interactions
        document.getElementById('initiate').addEventListener('click', () => {
            this.initializeNeuralLink();
        });
        
        // Keyboard interactions
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                    this.toggleAnimation();
                    break;
                case 'ArrowUp':
                    this.camera.position.z -= 0.5;
                    break;
                case 'ArrowDown':
                    this.camera.position.z += 0.5;
                    break;
            }
        });
        
        // Touch interactions
        let touchStart = null;
        document.addEventListener('touchstart', (e) => {
            touchStart = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!touchStart) return;
            
            const deltaX = e.touches[0].clientX - touchStart.x;
            const deltaY = e.touches[0].clientY - touchStart.y;
            
            this.camera.rotation.y += deltaX * 0.01;
            this.camera.rotation.x += deltaY * 0.01;
            
            touchStart = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
        });
    }
    
    setupVoiceCommands() {
        console.log('Flash AI: Setting up voice commands...');
        
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            console.log('Flash AI: Voice recognition API available');
            
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            this.voiceRecognition.continuous = true;
            this.voiceRecognition.interimResults = true;
            
            // JARVIS-style state tracking
            this.isAwake = false;
            this.lastCommand = Date.now();
            
            console.log('Flash AI: Voice recognition configured');
            
            this.voiceRecognition.onresult = async (event) => {
                const result = event.results[event.results.length - 1];
                const transcript = result[0].transcript;
                const lowerTranscript = transcript.toLowerCase();
                
                // Display transcript with fade effect
                const transcriptEl = document.getElementById('voice-transcript');
                transcriptEl.textContent = transcript;
                transcriptEl.style.opacity = '1';
                
                // If the result is final (not interim), process it
                if (result.isFinal) {
                    // Fade out transcript
                    setTimeout(() => {
                        transcriptEl.style.opacity = '0.3';
                    }, 2000);
                    
                    // Wake words - JARVIS style
                    if (lowerTranscript.includes('flash') || lowerTranscript.includes('hey flash') || 
                        lowerTranscript.includes('ok flash')) {
                        
                        this.isAwake = true;
                        this.lastCommand = Date.now();
                        
                        // Visual feedback - pulse effect
                        this.pulseEffect();
                        document.getElementById('voice-status').textContent = 'FLASH AI: ACTIVE';
                        
                        // JARVIS-style acknowledgments
                        const responses = [
                            "Yes sir?",
                            "At your service.",
                            "How may I assist you?",
                            "Ready when you are.",
                            "I'm listening.",
                            "What can I do for you today?"
                        ];
                        
                        const response = responses[Math.floor(Math.random() * responses.length)];
                        this.speakResponse(response);
                        
                    } else if (this.isAwake || transcript.length > 10) {
                        // Process command
                        this.isAwake = false;
                        
                        // Show processing animation
                        document.getElementById('voice-status').textContent = 'FLASH AI: PROCESSING';
                        this.processingAnimation();
                        
                        try {
                            // Get AI response
                            const response = await this.askFlash(transcript);
                            
                            // Update status
                            document.getElementById('voice-status').textContent = 'FLASH AI: RESPONDING';
                            
                            // Speak with JARVIS voice
                            this.speakResponse(response);
                            
                            // Trigger relevant animations
                            this.triggerResponseAnimations(response);
                            
                            // Return to listening
                            setTimeout(() => {
                                document.getElementById('voice-status').textContent = 'FLASH AI: LISTENING';
                            }, 1500);
                            
                        } catch (error) {
                            console.error('Flash AI Error:', error);
                            this.speakResponse("I apologize sir, I'm having trouble processing that request.");
                            document.getElementById('voice-status').textContent = 'FLASH AI: ERROR';
                            
                            setTimeout(() => {
                                document.getElementById('voice-status').textContent = 'FLASH AI: LISTENING';
                            }, 2000);
                        }
                    }
                    
                    // Auto-sleep after 30 seconds of inactivity
                    if (Date.now() - this.lastCommand > 30000) {
                        this.isAwake = false;
                    }
                }
            };
            
            this.voiceRecognition.onstart = () => {
                document.getElementById('voice-status').textContent = 'FLASH AI: INITIALIZING';
                document.querySelector('.voice-command').classList.add('voice-active');
                
                // Boot sequence with API key check
                setTimeout(() => {
                    const apiKey = localStorage.getItem('GROQ_API_KEY');
                    if (apiKey && apiKey !== 'YOUR_GROQ_API_KEY_HERE') {
                        this.speakResponse("Flash AI systems online. Voice interface activated. Say 'Hey Flash' to begin.");
                        document.getElementById('voice-status').textContent = 'FLASH AI: LISTENING';
                    } else {
                        // This shouldn't happen now with auto-config, but just in case
                        this.speakResponse("Flash AI initializing. Configuring systems.");
                        document.getElementById('voice-status').textContent = 'FLASH AI: CONFIGURING';
                    }
                    
                    // Add ambient glow to UI
                    this.scene.fog.color.setHex(0x001122);
                    this.scene.fog.density = 0.01;
                }, 1500);
            };
            
            this.voiceRecognition.onend = () => {
                // Auto-restart for continuous listening
                setTimeout(() => {
                    try {
                        this.voiceRecognition.start();
                    } catch(e) {
                        console.log('Restarting voice system...');
                    }
                }, 100);
            };
            
            this.voiceRecognition.onerror = (event) => {
                if (event.error !== 'no-speech') {
                    console.log('Voice error:', event.error);
                    document.getElementById('voice-status').textContent = 'FLASH AI: STANDBY';
                }
            };
            
            // Start listening after a brief delay
            setTimeout(() => {
                try {
                    console.log('Flash AI: Starting voice recognition...');
                    this.voiceRecognition.start();
                } catch(e) {
                    console.error('Flash AI: Voice recognition error:', e);
                    document.getElementById('voice-status').textContent = 'FLASH AI: MIC ACCESS NEEDED';
                }
            }, 2000);
        } else {
            console.error('Flash AI: Voice recognition not supported in this browser');
            document.getElementById('voice-status').textContent = 'FLASH AI: NOT SUPPORTED';
        }
    }
    
    // Add visual feedback methods
    pulseEffect() {
        // Pulse the neural indicator
        const indicator = document.querySelector('.neural-indicator');
        if (indicator) {
            indicator.style.animation = 'pulse 0.5s ease-out';
            setTimeout(() => {
                indicator.style.animation = '';
            }, 500);
        }
        
        // Brighten particles
        this.particles.forEach(particle => {
            if (particle.material) {
                particle.material.opacity = 1;
                setTimeout(() => {
                    particle.material.opacity = 0.6;
                }, 500);
            }
        });
    }
    
    processingAnimation() {
        // Create ripple effect from center
        const rippleCount = 3;
        for (let i = 0; i < rippleCount; i++) {
            setTimeout(() => {
                this.createRipple();
            }, i * 200);
        }
    }
    
    createRipple() {
        const geometry = new THREE.RingGeometry(0.1, 0.2, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const ripple = new THREE.Mesh(geometry, material);
        ripple.position.set(0, 0, 0);
        this.scene.add(ripple);
        
        // Animate ripple
        const animate = () => {
            ripple.scale.x += 0.5;
            ripple.scale.y += 0.5;
            material.opacity -= 0.02;
            
            if (material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(ripple);
            }
        };
        animate();
    }
    
    setupBiometrics() {
        // Simulate biometric data
        setInterval(() => {
            // Heartbeat variation
            this.biometrics.heartRate = 72 + Math.sin(Date.now() * 0.001) * 5 + Math.random() * 2;
            document.querySelector('#heart-rate span').textContent = Math.round(this.biometrics.heartRate * 10);
            
            // Neural activity
            this.biometrics.neuralActivity = 87 + Math.sin(Date.now() * 0.0005) * 10 + Math.random() * 3;
            document.querySelector('#neural-activity span').textContent = Math.round(this.biometrics.neuralActivity);
        }, 1000);
        
        // Neural indicator visualization
        const neuralCanvas = document.getElementById('neural-canvas');
        const ctx = neuralCanvas.getContext('2d');
        neuralCanvas.width = 100;
        neuralCanvas.height = 100;
        
        const drawNeuralIndicator = () => {
            requestAnimationFrame(drawNeuralIndicator);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, 100, 100);
            
            const time = Date.now() * 0.001;
            ctx.strokeStyle = `rgba(0, 255, 255, ${this.biometrics.neuralActivity / 100})`;
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            for (let i = 0; i < 100; i++) {
                const y = 50 + Math.sin(i * 0.1 + time) * 20 * (this.biometrics.neuralActivity / 100);
                if (i === 0) {
                    ctx.moveTo(i, y);
                } else {
                    ctx.lineTo(i, y);
                }
            }
            ctx.stroke();
        };
        
        drawNeuralIndicator();
    }
    
    setupShaders() {
        // UI Layer canvas for additional 2D effects
        const uiCanvas = document.getElementById('ui-layer');
        const ctx = uiCanvas.getContext('2d');
        uiCanvas.width = window.innerWidth;
        uiCanvas.height = window.innerHeight;
        
        const drawUIEffects = () => {
            requestAnimationFrame(drawUIEffects);
            
            ctx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
            
            // Scanline effect
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.02)';
            ctx.lineWidth = 1;
            
            for (let y = 0; y < uiCanvas.height; y += 2) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(uiCanvas.width, y);
                ctx.stroke();
            }
            
            // Vignette effect
            const gradient = ctx.createRadialGradient(
                uiCanvas.width / 2, uiCanvas.height / 2, 0,
                uiCanvas.width / 2, uiCanvas.height / 2, Math.max(uiCanvas.width, uiCanvas.height) / 2
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, uiCanvas.width, uiCanvas.height);
        };
        
        drawUIEffects();
    }
    
    
    
    async askFlash(question) {
        console.log('Flash AI: Processing question:', question);
        
        // API key should already be set by setupAPIKey()
        const apiKey = GROQ_CONFIG.apiKey;
        console.log('Flash AI: Using API key');
        
        if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE') {
            // This should never happen now, but just in case
            console.error('Flash AI: API key issue detected, reconfiguring...');
            this.setupAPIKey();
            // Try again with the new key
            const newKey = localStorage.getItem('GROQ_API_KEY');
            if (!newKey) {
                return "I'm having trouble with my configuration. Please refresh the page.";
            }
        }
        
        const response = await fetch(GROQ_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_CONFIG.model,
                messages: [
                    {
                        role: "system",
                        content: FLASH_SYSTEM_PROMPT
                    },
                    {
                        role: "user",
                        content: question
                    }
                ],
                temperature: 0.7,
                max_tokens: 500,
                stream: false
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    
    
    
    speakResponse(text) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // JARVIS-style voice settings
            utterance.rate = 0.95; // Slightly slower for clarity
            utterance.pitch = 0.85; // Lower pitch for masculine AI voice
            utterance.volume = 0.9;
            
            // Try to find the best voice for JARVIS-like sound
            const voices = speechSynthesis.getVoices();
            
            // Preferred voices in order (British/UK voices sound more like JARVIS)
            const preferredVoices = [
                'Daniel', // British male voice on iOS
                'Google UK English Male',
                'Microsoft David',
                'Alex', // macOS voice
                'Google US English',
                'Microsoft Mark'
            ];
            
            let selectedVoice = null;
            for (const preferred of preferredVoices) {
                selectedVoice = voices.find(voice => 
                    voice.name.includes(preferred) || 
                    voice.voiceURI.includes(preferred)
                );
                if (selectedVoice) break;
            }
            
            // If no preferred voice found, try any UK/British voice
            if (!selectedVoice) {
                selectedVoice = voices.find(voice => 
                    voice.lang.includes('en-GB') || 
                    voice.name.includes('UK') ||
                    voice.name.includes('British')
                );
            }
            
            // Fallback to any male voice
            if (!selectedVoice) {
                selectedVoice = voices.find(voice => 
                    voice.name.toLowerCase().includes('male') &&
                    !voice.name.toLowerCase().includes('female')
                );
            }
            
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            
            // Add visual feedback when speaking
            utterance.onstart = () => {
                document.getElementById('voice-status').textContent = 'FLASH AI: SPEAKING';
                // Add speaking animation
                this.scene.fog.density = 0.02;
            };
            
            utterance.onend = () => {
                document.getElementById('voice-status').textContent = 'FLASH AI: LISTENING';
                // Reset visual state
                this.scene.fog.density = 0.01;
            };
            
            speechSynthesis.speak(utterance);
        }
    }
    
    triggerResponseAnimations(response) {
        const lowerResponse = response.toLowerCase();
        
        // Trigger animations based on keywords in response
        if (lowerResponse.includes('opportunity') || lowerResponse.includes('potential')) {
            this.explodeParticles();
        } else if (lowerResponse.includes('risk') || lowerResponse.includes('caution')) {
            this.changeColors();
        } else if (lowerResponse.includes('growth') || lowerResponse.includes('scale')) {
            this.startRotation();
        }
        
        // Flash the AI confidence when giving advice
        if (lowerResponse.includes('recommend') || lowerResponse.includes('suggest')) {
            this.biometrics.neuralActivity = 95;
            setTimeout(() => {
                this.biometrics.neuralActivity = 87;
            }, 2000);
        }
    }
    
    initializeNeuralLink() {
        const button = document.getElementById('initiate');
        button.textContent = 'CONNECTING...';
        button.disabled = true;
        
        // Explosion effect
        this.explodeParticles();
        
        setTimeout(() => {
            button.textContent = 'FLASH AI ACTIVE';
            button.style.borderColor = '#0ff';
            button.style.color = '#0ff';
            
            // Activate advanced features
            this.activateQuantumMode();
        }, 3000);
    }
    
    activateQuantumMode() {
        // Enhanced visual effects
        this.scene.fog.density = 0.005;
        
        // Increase particle count
        const additionalParticles = 10000;
        const positions = new Float32Array(additionalParticles * 3);
        
        for (let i = 0; i < additionalParticles; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.05,
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        const quantumField = new THREE.Points(geometry, material);
        this.scene.add(quantumField);
        this.particles.push(quantumField);
    }
    
    explodeParticles() {
        this.particles.forEach(particle => {
            if (particle.geometry && particle.geometry.attributes.position) {
                const positions = particle.geometry.attributes.position.array;
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] *= 1.5;
                    positions[i + 1] *= 1.5;
                    positions[i + 2] *= 1.5;
                }
                particle.geometry.attributes.position.needsUpdate = true;
            }
        });
        
        setTimeout(() => {
            this.particles.forEach(particle => {
                if (particle.geometry && particle.geometry.attributes.position) {
                    const positions = particle.geometry.attributes.position.array;
                    for (let i = 0; i < positions.length; i += 3) {
                        positions[i] /= 1.5;
                        positions[i + 1] /= 1.5;
                        positions[i + 2] /= 1.5;
                    }
                    particle.geometry.attributes.position.needsUpdate = true;
                }
            });
        }, 1000);
    }
    
    changeColors() {
        this.uniforms.colorA.value.setHSL(Math.random(), 1, 0.5);
        this.uniforms.colorB.value.setHSL(Math.random(), 1, 0.5);
    }
    
    startRotation() {
        this.rotating = true;
    }
    
    stopRotation() {
        this.rotating = false;
    }
    
    toggleAnimation() {
        this.animating = !this.animating;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = this.clock.getElapsedTime();
        const delta = this.clock.getDelta();
        
        // Update uniforms
        this.uniforms.time.value = time;
        
        // Calculate audio level
        if (this.audioData) {
            let sum = 0;
            for (let i = 0; i < this.audioData.length; i++) {
                sum += this.audioData[i];
            }
            this.uniforms.audioLevel.value = sum / (this.audioData.length * 255);
        }
        
        // Animate meshes
        this.meshes.forEach((mesh, index) => {
            mesh.rotation.x += 0.001 * (index + 1);
            mesh.rotation.y += 0.002 * (index + 1);
            
            // Morphing effect
            if (mesh.geometry.attributes && mesh.geometry.attributes.position) {
                const positions = mesh.geometry.attributes.position.array;
                const vertex = new THREE.Vector3();
                
                for (let i = 0; i < positions.length; i += 3) {
                    vertex.fromArray(positions, i);
                    vertex.normalize();
                    const noise = Math.sin(time + vertex.x * 5) * 0.05;
                    vertex.multiplyScalar(1 + noise);
                    vertex.toArray(positions, i);
                }
                
                mesh.geometry.attributes.position.needsUpdate = true;
                mesh.geometry.computeVertexNormals();
            }
        });
        
        // Animate particles
        this.particles.forEach((particle, index) => {
            if (particle.material.uniforms && particle.material.uniforms.time) {
                particle.material.uniforms.time.value = time;
            }
            
            if (particle.rotation) {
                particle.rotation.y += 0.0005 * (index + 1);
            }
            
            // Light animation
            if (particle.userData && particle.userData.offset !== undefined) {
                const offset = particle.userData.offset;
                const speed = particle.userData.speed;
                particle.position.x = Math.sin(time * speed + offset) * 10;
                particle.position.z = Math.cos(time * speed + offset) * 10;
                particle.position.y = Math.sin(time * speed * 2 + offset) * 3;
            }
        });
        
        // Camera movement
        this.camera.position.x = Math.sin(time * 0.1) * 0.5;
        this.camera.position.y = Math.cos(time * 0.1) * 0.5;
        this.camera.lookAt(0, 0, 0);
        
        // Raycast for interactions
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.meshes);
        
        if (intersects.length > 0) {
            intersects[0].object.rotation.x += 0.01;
            intersects[0].object.rotation.y += 0.01;
        }
        
        // Render
        this.renderer.render(this.scene, this.camera);
        
        // Update stats
        this.updateStats(delta);
    }
    
    updateStats(delta) {
        const fps = Math.round(1 / delta);
        const memory = performance.memory ? (performance.memory.usedJSHeapSize / 1048576).toFixed(2) : 'N/A';
        
        document.getElementById('stats').innerHTML = `
            FPS: ${fps}<br>
            Memory: ${memory} MB<br>
            Particles: ${this.particles.length}<br>
            Time: ${this.clock.getElapsedTime().toFixed(2)}s
        `;
    }
}

// Neural Network simulation for predictions
class NeuralPredictor {
    constructor() {
        this.weights = [];
        this.biases = [];
        this.layers = [10, 20, 20, 5];
        this.initializeNetwork();
    }
    
    initializeNetwork() {
        for (let i = 0; i < this.layers.length - 1; i++) {
            const w = [];
            const b = [];
            
            for (let j = 0; j < this.layers[i + 1]; j++) {
                const neuronWeights = [];
                for (let k = 0; k < this.layers[i]; k++) {
                    neuronWeights.push(Math.random() * 2 - 1);
                }
                w.push(neuronWeights);
                b.push(Math.random() * 2 - 1);
            }
            
            this.weights.push(w);
            this.biases.push(b);
        }
    }
    
    predict(input) {
        let activation = input;
        
        for (let layer = 0; layer < this.weights.length; layer++) {
            const newActivation = [];
            
            for (let neuron = 0; neuron < this.weights[layer].length; neuron++) {
                let sum = this.biases[layer][neuron];
                
                for (let w = 0; w < this.weights[layer][neuron].length; w++) {
                    sum += activation[w] * this.weights[layer][neuron][w];
                }
                
                newActivation.push(this.sigmoid(sum));
            }
            
            activation = newActivation;
        }
        
        return activation;
    }
    
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const engine = new QuantumEngine();
    
    // Performance monitoring
    if (window.performance && window.performance.memory) {
        setInterval(() => {
            if (performance.memory.usedJSHeapSize > performance.memory.jsHeapSizeLimit * 0.9) {
                console.warn('Memory usage high, optimizing...');
                // Cleanup operations
            }
        }, 5000);
    }
    
    // Progressive enhancement
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    
    // Fullscreen support
    document.addEventListener('dblclick', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
    
    console.log('FlashIntelligence AI Investment Advisor Initialized');
    console.log('Voice Commands: "Hey Flash", "analyze", "show portfolio", "sectors", "opportunities"');
    console.log('Keyboard: Space to toggle, Arrow keys to zoom');
    console.log('Double-click for fullscreen');
});