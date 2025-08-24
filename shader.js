// WebGL Shader Background for premium visual effects
class ShaderBackground {
    constructor() {
        this.canvas = document.getElementById('shader-bg');
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.log('WebGL not supported, falling back to canvas');
            return;
        }

        this.time = 0;
        this.mouseX = 0.5;
        this.mouseY = 0.5;
        this.init();
    }

    init() {
        this.resize();
        this.createShaders();
        this.createBuffers();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX / window.innerWidth;
            this.mouseY = 1.0 - (e.clientY / window.innerHeight);
        });
    }

    createShaders() {
        // Vertex shader
        const vertexShaderSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        // Fragment shader with gradient flow effect
        const fragmentShaderSource = `
            precision mediump float;
            
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec2 u_mouse;
            
            vec3 rgb2hsv(vec3 c) {
                vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
                vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
                vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
                
                float d = q.x - min(q.w, q.y);
                float e = 1.0e-10;
                return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
            }
            
            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }
            
            float noise(vec2 p) {
                return sin(p.x * 10.0) * sin(p.y * 10.0);
            }
            
            void main() {
                vec2 st = gl_FragCoord.xy / u_resolution.xy;
                vec2 mouse = u_mouse;
                
                // Create flowing gradient
                float angle = u_time * 0.1;
                vec2 pos = st - 0.5;
                pos = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * pos;
                pos += 0.5;
                
                // Multi-layered noise for organic movement
                float n1 = noise(pos * 3.0 + u_time * 0.1);
                float n2 = noise(pos * 5.0 - u_time * 0.15) * 0.5;
                float n3 = noise(pos * 8.0 + u_time * 0.2) * 0.25;
                
                float n = n1 + n2 + n3;
                
                // Color gradient inspired by Apple's colorful wallpapers
                vec3 color1 = vec3(1.0, 0.42, 0.42); // Soft red
                vec3 color2 = vec3(0.31, 0.80, 0.77); // Cyan
                vec3 color3 = vec3(0.27, 0.72, 0.82); // Light blue
                
                // Mix colors based on position and noise
                float mixFactor1 = smoothstep(0.0, 1.0, st.x + n * 0.2);
                float mixFactor2 = smoothstep(0.0, 1.0, st.y + n * 0.2);
                
                vec3 color = mix(color1, color2, mixFactor1);
                color = mix(color, color3, mixFactor2);
                
                // Add mouse interaction
                float mouseDist = distance(st, mouse);
                float mouseInfluence = smoothstep(0.5, 0.0, mouseDist);
                color += mouseInfluence * 0.1;
                
                // Subtle pulse effect
                float pulse = sin(u_time * 2.0) * 0.05 + 1.0;
                color *= pulse;
                
                // Soft vignette
                float vignette = smoothstep(1.0, 0.3, length(st - 0.5));
                color *= vignette;
                
                // Output with reduced opacity for subtlety
                gl_FragColor = vec4(color, 0.15);
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

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program');
            return;
        }

        this.gl.useProgram(this.program);

        // Get uniform locations
        this.uniforms = {
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            mouse: this.gl.getUniformLocation(this.program, 'u_mouse')
        };
    }

    compileShader(source, type) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    createBuffers() {
        // Create a buffer for the square vertices
        const vertices = new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            1.0, 1.0,
        ]);

        const vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

    animate() {
        this.time += 0.01;

        // Set uniforms
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.uniforms.time, this.time);
        this.gl.uniform2f(this.uniforms.mouse, this.mouseX, this.mouseY);

        // Draw
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize shader background when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ShaderBackground();
});