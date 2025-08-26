/**
 * Contextual JARVIS System
 * Understands context and responds intelligently like the real JARVIS
 */

class ContextualJARVIS {
    constructor() {
        this.contextEngine = new ContextEngine();
        this.personality = new JARVISPersonality();
        
        // JARVIS memory
        this.memory = {
            userPreferences: {},
            importantEvents: [],
            ongoingTasks: [],
            lastBusinessUpdate: null
        };
        
        // Initialize with startup context if available
        this.startupContext = {
            metrics: {},
            lastUpdated: null,
            trends: {}
        };
    }
    
    /**
     * Generate contextually aware response
     */
    async generateContextualResponse(message, conversationHistory = [], additionalContext = {}) {
        // Analyze the context deeply
        const contextAnalysis = this.contextEngine.analyzeContext(message, conversationHistory);
        
        // Determine if we need to use AI for complex understanding
        const needsAI = this.requiresAIUnderstanding(contextAnalysis);
        
        if (needsAI) {
            return await this.generateAIResponse(message, contextAnalysis, conversationHistory);
        } else {
            return this.generateLocalResponse(message, contextAnalysis);
        }
    }
    
    /**
     * Determine if we need AI for understanding
     */
    requiresAIUnderstanding(analysis) {
        // Complex queries that need AI
        if (analysis.requiredContext.includes('previous-topic') && !analysis.references) {
            return true;
        }
        
        if (analysis.intent.type === 'advice-request' || 
            analysis.intent.type === 'opinion-request' ||
            analysis.intent.type === 'explanation-request') {
            return true;
        }
        
        // Ambiguous references
        if (analysis.implicitMeaning.needsPreviousContext) {
            return true;
        }
        
        // Business analysis
        if (analysis.topic.category === 'business') {
            return true;
        }
        
        return false;
    }
    
    /**
     * Generate AI-powered contextual response
     */
    async generateAIResponse(message, contextAnalysis, conversationHistory) {
        const contextSummary = this.buildContextSummary(contextAnalysis, conversationHistory);
        
        const systemPrompt = `You are JARVIS, Tony Stark's AI assistant, reimagined for a startup founder.

CRITICAL CONTEXT UNDERSTANDING:
${contextSummary}

PERSONALITY RULES:
- Always address user as "Sir" 
- Be sophisticated, witty, and protective
- Understand context deeply - when user says "it" or "that", you know what they're referring to
- Give concise, relevant responses (1-2 sentences unless asked for more)
- Show you remember previous conversations
- Be proactive with helpful observations

CURRENT ANALYSIS:
- Intent: ${contextAnalysis.intent.type} (${contextAnalysis.intent.subtype})
- Topic: ${contextAnalysis.topic.category} - ${contextAnalysis.topic.specific}
- Sentiment: ${contextAnalysis.sentiment}
- References: ${JSON.stringify(contextAnalysis.references)}
- Required Context: ${contextAnalysis.requiredContext.join(', ')}

Respond naturally and contextually. If something is unclear, ask for clarification elegantly.`;

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('GROQ_API_KEY')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...conversationHistory.slice(-10).map(msg => ({
                            role: msg.role,
                            content: msg.content
                        })),
                        { role: 'user', content: message }
                    ],
                    temperature: 0.7,
                    max_tokens: 150
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            const responseText = data.choices[0].message.content;
            
            // Determine emotion from response
            const emotion = this.detectResponseEmotion(responseText, contextAnalysis);
            
            return {
                text: responseText,
                emotion: emotion,
                context: contextAnalysis,
                voiceSettings: this.personality.getVoiceSettings(emotion)
            };
            
        } catch (error) {
            console.error('AI response error:', error);
            return this.generateFallbackResponse(message, contextAnalysis);
        }
    }
    
    /**
     * Generate local response for simple queries
     */
    generateLocalResponse(message, contextAnalysis) {
        // Use personality system for simple responses
        return this.personality.generateResponse(message, {
            context: contextAnalysis,
            conversationHistory: this.contextEngine.conversationHistory
        });
    }
    
    /**
     * Build comprehensive context summary
     */
    buildContextSummary(analysis, history) {
        let summary = '';
        
        // Previous conversation context
        if (history.length > 0) {
            const recentExchanges = history.slice(-4);
            summary += 'Recent conversation:\n';
            recentExchanges.forEach(msg => {
                summary += `${msg.role === 'user' ? 'User' : 'JARVIS'}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}\n`;
            });
        }
        
        // Current topic understanding
        if (this.contextEngine.currentTopic) {
            summary += `\nCurrent topic: ${this.contextEngine.currentTopic.category} - ${this.contextEngine.currentTopic.specific}\n`;
        }
        
        // Reference resolution
        if (Object.keys(analysis.references).length > 0) {
            summary += '\nResolved references:\n';
            Object.entries(analysis.references).forEach(([pronoun, referent]) => {
                summary += `- "${pronoun}" refers to: ${referent}\n`;
            });
        }
        
        // Time context
        const timeOfDay = this.contextEngine.environmentContext.timeOfDay;
        const dayOfWeek = this.contextEngine.environmentContext.dayOfWeek;
        summary += `\nTime context: ${timeOfDay} on ${dayOfWeek}\n`;
        
        // User state
        if (this.contextEngine.userContext.emotionalState !== 'neutral') {
            summary += `User appears to be: ${this.contextEngine.userContext.emotionalState}\n`;
        }
        
        // Business context if relevant
        if (analysis.topic.category === 'business' && this.startupContext.metrics.runway) {
            summary += `\nBusiness context: ${this.startupContext.metrics.runway} months runway, burning $${this.startupContext.metrics.burnRate}/month\n`;
        }
        
        return summary;
    }
    
    /**
     * Generate fallback response with context
     */
    generateFallbackResponse(message, analysis) {
        const intent = analysis.intent;
        const topic = analysis.topic;
        
        // Contextual fallbacks based on intent and topic
        if (intent.type === 'question' && analysis.requiredContext.includes('previous-topic')) {
            return {
                text: "I apologize Sir, but I need more context. What specifically are you referring to?",
                emotion: 'inquisitive',
                voiceSettings: { pitch: 1.0, rate: 0.95, volume: 0.9 }
            };
        }
        
        if (intent.type === 'state-sharing' && analysis.sentiment === 'negative') {
            return {
                text: "I understand, Sir. Is there anything I can do to assist with the situation?",
                emotion: 'concerned',
                voiceSettings: { pitch: 0.95, rate: 0.9, volume: 0.85 }
            };
        }
        
        // Default contextual response
        return {
            text: "I see. Please tell me more so I can assist you properly, Sir.",
            emotion: 'attentive',
            voiceSettings: { pitch: 1.0, rate: 0.95, volume: 0.9 }
        };
    }
    
    /**
     * Detect emotion from response content
     */
    detectResponseEmotion(responseText, contextAnalysis) {
        const lower = responseText.toLowerCase();
        
        if (lower.includes('concern') || lower.includes('worried')) {
            return 'concerned';
        }
        if (lower.includes('excellent') || lower.includes('splendid')) {
            return 'pleased';
        }
        if (lower.includes('shall i') || lower.includes('would you like')) {
            return 'helpful';
        }
        if (contextAnalysis.sentiment === 'negative') {
            return 'supportive';
        }
        
        return 'professional';
    }
    
    /**
     * Update business context
     */
    updateBusinessContext(metrics) {
        this.startupContext.metrics = metrics;
        this.startupContext.lastUpdated = Date.now();
        
        // Calculate trends
        if (this.memory.lastBusinessUpdate) {
            this.startupContext.trends = {
                revenue: metrics.revenue > this.memory.lastBusinessUpdate.revenue ? 'increasing' : 'decreasing',
                burn: metrics.burnRate > this.memory.lastBusinessUpdate.burnRate ? 'increasing' : 'decreasing'
            };
        }
        
        this.memory.lastBusinessUpdate = { ...metrics };
    }
    
    /**
     * Handle proactive insights based on context
     */
    generateProactiveInsight() {
        const context = this.contextEngine.getContextSummary();
        const insights = [];
        
        // Time-based insights
        if (context.timeContext.timeOfDay === 'night' && context.conversationLength > 5) {
            insights.push({
                text: "You've been working late again, Sir. Shall I schedule a reminder for tomorrow instead?",
                priority: 'medium',
                trigger: 'late-work'
            });
        }
        
        // Pattern-based insights
        if (this.contextEngine.topicHistory.filter(t => t.topic.category === 'business').length > 3) {
            insights.push({
                text: "You seem focused on business metrics tonight, Sir. Would you like me to prepare a summary report?",
                priority: 'low',
                trigger: 'business-focus'
            });
        }
        
        return insights;
    }
}

// Export
window.ContextualJARVIS = ContextualJARVIS;