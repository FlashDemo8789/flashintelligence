// Groq API Configuration
// IMPORTANT: In production, this should be handled server-side for security
// For demo purposes, we'll use it client-side but recommend implementing a backend proxy

const GROQ_CONFIG = {
    // API key is loaded from localStorage for security
    // Use setup.html to configure your API key
    get apiKey() {
        // Dynamically get API key when needed
        return localStorage.getItem('GROQ_API_KEY') || 'YOUR_GROQ_API_KEY_HERE';
    },
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'openai/gpt-oss-120b', // OpenAI GPT open source model
    // Alternative current models:
    // 'openai/gpt-oss-20b' - Smaller GPT model
    // 'llama-3.1-8b-instant' - Fastest response
    // 'llama-3.3-70b-versatile' - Good balance
};

// System prompt for Flash AI
const FLASH_SYSTEM_PROMPT = `You are Flash, an advanced AI investment advisor for FlashIntelligence. You provide:
- Concise, actionable investment insights
- Market analysis and trends
- Startup evaluation guidance
- Risk assessment
- Portfolio recommendations

Keep responses brief (2-3 sentences) unless asked for details. Be confident but acknowledge uncertainties. Focus on practical advice for startup investors.`;

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GROQ_CONFIG, FLASH_SYSTEM_PROMPT };
}