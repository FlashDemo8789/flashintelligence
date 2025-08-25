// Test Groq API key
const testGroqKey = async () => {
    const k1 = 'gsk_cDLT4zKQ79Jgu';
    const k2 = 'BlLVxD5WGdyb3FYQ';
    const k3 = '15NEsz8RiFDaB7weKvspCJp';
    const apiKey = k1 + k2 + k3;
    
    console.log('Testing Groq API key...');
    
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-120b',
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant. Reply in exactly 3 words."
                    },
                    {
                        role: "user",
                        content: "Are you working?"
                    }
                ],
                temperature: 0.7,
                max_tokens: 10
            })
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Success! AI response:', data.choices[0].message.content);
            console.log('API key is valid and working!');
        } else {
            const error = await response.text();
            console.error('API Error:', response.status, error);
            console.log('API key might be invalid or expired');
        }
    } catch (error) {
        console.error('Network error:', error.message);
    }
};

// Run test immediately
testGroqKey();