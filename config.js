// Groq API Configuration
// IMPORTANT: In production, this should be handled server-side for security
// For demo purposes, we'll use it client-side but recommend implementing a backend proxy

const GROQ_CONFIG = {
    // API key is loaded from localStorage for security
    // Use setup.html to configure your API key
    apiKey: localStorage.getItem('GROQ_API_KEY') || 'YOUR_GROQ_API_KEY_HERE',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'mixtral-8x7b-32768', // Fast and cost-effective
    // Alternative models:
    // 'llama2-70b-4096' - Good balance
    // 'gemma-7b-it' - Cheapest option
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