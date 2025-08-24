// Advanced Three.js effects for premium visuals
let scene, camera, renderer;
let logoMesh, envMap;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

// Initialize Three.js scene
function initThreeJS() {
    const container = document.getElementById('logo-container');
    
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 100, 1000);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Renderer setup with premium settings
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);
    
    // Create environment map for reflections
    createEnvironmentMap();
    
    // Create 3D logo
    create3DLogo();
    
    // Lighting setup
    setupLighting();
    
    // Post-processing
    setupPostProcessing();
    
    // Mouse tracking
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
}

// Create environment map for realistic reflections
function createEnvironmentMap() {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    
    // Create gradient environment
    const gradientTexture = new THREE.DataTexture(
        generateGradientData(),
        256, 256,
        THREE.RGBFormat
    );
    gradientTexture.needsUpdate = true;
    
    envMap = pmremGenerator.fromEquirectangular(gradientTexture).texture;
    scene.environment = envMap;
}

// Generate gradient data for environment
function generateGradientData() {
    const size = 256;
    const data = new Uint8Array(size * size * 3);
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const index = (i * size + j) * 3;
            const t = i / size;
            
            // Gradient colors
            const r = Math.floor(255 * (0.5 + 0.5 * Math.sin(t * Math.PI)));
            const g = Math.floor(255 * (0.5 + 0.5 * Math.sin(t * Math.PI + 1)));
            const b = Math.floor(255 * (0.5 + 0.5 * Math.sin(t * Math.PI + 2)));
            
            data[index] = r;
            data[index + 1] = g;
            data[index + 2] = b;
        }
    }
    
    return data;
}

// Create 3D metallic logo
function create3DLogo() {
    // Custom geometry for lightning bolt
    const shape = new THREE.Shape();
    shape.moveTo(0, 2);
    shape.lineTo(-0.5, 0.5);
    shape.lineTo(0.3, 0.5);
    shape.lineTo(-0.2, -2);
    shape.lineTo(0.5, -0.5);
    shape.lineTo(-0.3, -0.5);
    shape.lineTo(0, 2);
    
    const extrudeSettings = {
        depth: 0.5,
        bevelEnabled: true,
        bevelSegments: 10,
        bevelSize: 0.1,
        bevelThickness: 0.1
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    
    // Premium metallic material
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        reflectivity: 1,
        envMap: envMap,
        envMapIntensity: 2
    });
    
    logoMesh = new THREE.Mesh(geometry, material);
    scene.add(logoMesh);
    
    // Add inner glow
    const glowGeometry = geometry.clone();
    glowGeometry.scale(1.1, 1.1, 1.1);
    
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x4ECDC4,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
    });
    
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    logoMesh.add(glowMesh);
}

// Setup premium lighting
function setupLighting() {
    // Key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);
    
    // Fill light
    const fillLight = new THREE.DirectionalLight(0x4ECDC4, 1);
    fillLight.position.set(-5, 0, 5);
    scene.add(fillLight);
    
    // Rim light
    const rimLight = new THREE.DirectionalLight(0xFF006E, 1.5);
    rimLight.position.set(0, -5, -5);
    scene.add(rimLight);
    
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    // Point lights for sparkle
    for (let i = 0; i < 5; i++) {
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        scene.add(pointLight);
    }
}

// Setup post-processing effects
function setupPostProcessing() {
    // This would include bloom, depth of field, etc.
    // For now, we'll keep it simple with built-in renderer settings
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

// Mouse move handler
function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Window resize handler
function onWindowResize() {
    const container = document.getElementById('logo-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Smooth mouse follow
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;
    
    // Rotate logo
    if (logoMesh) {
        logoMesh.rotation.x = targetY * 0.5;
        logoMesh.rotation.y = targetX * 0.5 + Date.now() * 0.001;
        logoMesh.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    }
    
    // Update camera position for parallax
    camera.position.x = targetX * 0.5;
    camera.position.y = targetY * 0.5;
    camera.lookAt(0, 0, 0);
    
    renderer.render(scene, camera);
}

// Background shader animation
class BackgroundShader {
    constructor() {
        this.canvas = document.getElementById('webgl-background');
        this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
        this.time = 0;
        
        this.init();
    }
    
    init() {
        this.resize();
        this.createShader();
        this.createGeometry();
        window.addEventListener('resize', () => this.resize());
        this.render();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    
    createShader() {
        const vertexShaderSource = `
            attribute vec2 a_position;
            varying vec2 v_uv;
            
            void main() {
                v_uv = a_position * 0.5 + 0.5;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
        
        const fragmentShaderSource = `
            precision highp float;
            
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;
            
            varying vec2 v_uv;
            
            vec3 palette(float t) {
                vec3 a = vec3(0.5, 0.5, 0.5);
                vec3 b = vec3(0.5, 0.5, 0.5);
                vec3 c = vec3(1.0, 1.0, 1.0);
                vec3 d = vec3(0.263, 0.416, 0.557);
                
                return a + b * cos(6.28318 * (c * t + d));
            }
            
            float noise(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }
            
            float smoothNoise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                
                float a = noise(i);
                float b = noise(i + vec2(1.0, 0.0));
                float c = noise(i + vec2(0.0, 1.0));
                float d = noise(i + vec2(1.0, 1.0));
                
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }
            
            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                
                for (int i = 0; i < 6; i++) {
                    value += amplitude * smoothNoise(p);
                    p *= 2.0;
                    amplitude *= 0.5;
                }
                
                return value;
            }
            
            void main() {
                vec2 uv = v_uv;
                vec2 p = uv * 2.0 - 1.0;
                p.x *= u_resolution.x / u_resolution.y;
                
                // Animated distortion
                float t = u_time * 0.1;
                p += 0.2 * vec2(
                    fbm(p + vec2(t * 0.1, t * 0.15)),
                    fbm(p + vec2(t * 0.13, t * 0.11))
                );
                
                // Color mixing
                vec3 col = vec3(0.0);
                float d = length(p);
                
                for (float i = 0.0; i < 4.0; i++) {
                    vec2 q = p + vec2(cos(t + i * 0.5), sin(t + i * 0.5)) * 0.5;
                    d = min(d, length(q));
                    col += palette(d + t * 0.2 + i * 0.1) * 0.25;
                }
                
                // Vignette
                col *= 1.0 - 0.5 * length(uv - 0.5);
                
                // Output
                gl_FragColor = vec4(col * 0.3, 1.0);
            }
        `;
        
        // Compile shaders
        const vertexShader = this.compileShader(vertexShaderSource, this.gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER);
        
        // Create program
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        
        // Get uniform locations
        this.uniforms = {
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            mouse: this.gl.getUniformLocation(this.program, 'u_mouse')
        };
    }
    
    compileShader(source, type) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
            return null;
        }
        
        return shader;
    }
    
    createGeometry() {
        const vertices = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1,
        ]);
        
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
        
        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }
    
    render() {
        this.time += 0.01;
        
        this.gl.useProgram(this.program);
        
        // Set uniforms
        this.gl.uniform1f(this.uniforms.time, this.time);
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform2f(this.uniforms.mouse, mouseX, mouseY);
        
        // Draw
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        
        requestAnimationFrame(() => this.render());
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    new BackgroundShader();
});