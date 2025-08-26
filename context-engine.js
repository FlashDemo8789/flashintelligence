/**
 * Context Understanding Engine for JARVIS
 * Provides deep contextual understanding of conversations
 */

class ContextEngine {
    constructor() {
        // Conversation context
        this.conversationHistory = [];
        this.currentTopic = null;
        this.topicHistory = [];
        this.referenceMap = new Map(); // Maps pronouns to their references
        
        // User context
        this.userContext = {
            name: null,
            company: null,
            recentActivities: [],
            preferences: {},
            currentProject: null,
            emotionalState: 'neutral',
            workingHours: 0,
            location: null
        };
        
        // Environmental context
        this.environmentContext = {
            timeOfDay: this.getTimeOfDay(),
            dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
            weather: null,
            recentEvents: []
        };
        
        // Business context (if applicable)
        this.businessContext = {
            metrics: {},
            recentChanges: [],
            concerns: [],
            goals: []
        };
        
        // Knowledge graph for understanding relationships
        this.knowledgeGraph = {
            entities: new Map(),
            relationships: new Map()
        };
    }
    
    /**
     * Analyze message with full context understanding
     */
    analyzeContext(message, conversationHistory = []) {
        // Update conversation history
        this.conversationHistory = conversationHistory;
        
        // Extract entities and intent
        const analysis = {
            entities: this.extractEntities(message),
            intent: this.detectIntent(message),
            sentiment: this.analyzeSentiment(message),
            references: this.resolveReferences(message),
            topic: this.identifyTopic(message),
            requiredContext: this.determineRequiredContext(message),
            timeContext: this.extractTimeContext(message),
            implicitMeaning: this.detectImplicitMeaning(message)
        };
        
        // Update knowledge graph
        this.updateKnowledgeGraph(analysis);
        
        // Determine response strategy
        analysis.responseStrategy = this.determineResponseStrategy(analysis);
        
        return analysis;
    }
    
    /**
     * Extract entities from the message
     */
    extractEntities(message) {
        const entities = {
            people: [],
            places: [],
            things: [],
            concepts: [],
            numbers: [],
            timeReferences: []
        };
        
        // Time references
        const timePatterns = /\b(yesterday|today|tomorrow|last\s+\w+|next\s+\w+|this\s+\w+|\d+\s*(hours?|minutes?|days?|weeks?|months?)\s*ago)\b/gi;
        const timeMatches = message.match(timePatterns);
        if (timeMatches) {
            entities.timeReferences = timeMatches;
        }
        
        // Numbers and metrics
        const numberPatterns = /\b\d+(?:\.\d+)?[kKmMbB]?\b|\$[\d,]+(?:\.\d+)?[kKmMbB]?/g;
        const numberMatches = message.match(numberPatterns);
        if (numberMatches) {
            entities.numbers = numberMatches;
        }
        
        // Pronouns that need resolution
        const pronouns = /\b(it|that|this|they|them|he|she)\b/gi;
        const pronounMatches = message.match(pronouns);
        if (pronounMatches) {
            entities.pronouns = pronounMatches;
        }
        
        // Business concepts
        const businessTerms = /\b(revenue|burn rate|runway|funding|startup|company|product|customer|metric|growth)\b/gi;
        const businessMatches = message.match(businessTerms);
        if (businessMatches) {
            entities.concepts = businessMatches;
        }
        
        return entities;
    }
    
    /**
     * Detect the true intent behind the message
     */
    detectIntent(message) {
        const lower = message.toLowerCase();
        
        // Question types
        if (lower.includes('?') || lower.match(/^(what|how|why|when|where|who|which|can|could|would|should)/)) {
            // Determine question type
            if (lower.includes('how are') || lower.includes('how do you feel')) {
                return { type: 'personal-inquiry', subtype: 'wellbeing' };
            }
            if (lower.match(/how (is|are|was|were)/) && !lower.includes('you')) {
                return { type: 'status-inquiry', subtype: 'general' };
            }
            if (lower.includes('what') && lower.includes('think')) {
                return { type: 'opinion-request', subtype: 'general' };
            }
            if (lower.includes('should') || lower.includes('would you recommend')) {
                return { type: 'advice-request', subtype: 'decision' };
            }
            if (lower.match(/what (is|are|was|were)/)) {
                return { type: 'information-request', subtype: 'definition' };
            }
            if (lower.includes('why')) {
                return { type: 'explanation-request', subtype: 'reasoning' };
            }
            return { type: 'question', subtype: 'general' };
        }
        
        // Statements
        if (lower.includes('i think') || lower.includes('i believe')) {
            return { type: 'opinion-sharing', subtype: 'personal' };
        }
        if (lower.includes('i am') || lower.includes("i'm") || lower.includes('i feel')) {
            return { type: 'state-sharing', subtype: 'personal' };
        }
        if (lower.match(/^(yes|no|yeah|nope|sure|okay|alright)/)) {
            return { type: 'confirmation', subtype: 'response' };
        }
        
        // Commands
        if (lower.match(/^(show|tell|explain|calculate|analyze|find)/)) {
            return { type: 'command', subtype: 'action' };
        }
        
        // Social
        if (lower.match(/^(hi|hello|hey|good morning|good evening)/)) {
            return { type: 'greeting', subtype: 'social' };
        }
        if (lower.includes('thank') || lower.includes('appreciate')) {
            return { type: 'gratitude', subtype: 'social' };
        }
        
        return { type: 'statement', subtype: 'general' };
    }
    
    /**
     * Resolve pronoun references from context
     */
    resolveReferences(message) {
        const references = {};
        const pronouns = ['it', 'that', 'this', 'they', 'them'];
        
        pronouns.forEach(pronoun => {
            if (message.toLowerCase().includes(pronoun)) {
                // Look back through conversation history
                const referent = this.findReferent(pronoun);
                if (referent) {
                    references[pronoun] = referent;
                }
            }
        });
        
        return references;
    }
    
    /**
     * Find what a pronoun refers to
     */
    findReferent(pronoun) {
        // Look through recent conversation for nouns
        for (let i = this.conversationHistory.length - 1; i >= 0 && i >= this.conversationHistory.length - 5; i--) {
            const msg = this.conversationHistory[i];
            if (msg.role === 'user') {
                // Simple noun extraction
                const nouns = this.extractNouns(msg.content);
                if (nouns.length > 0) {
                    // Return the most recent relevant noun
                    return nouns[0];
                }
            }
        }
        
        // Check current topic
        if (this.currentTopic) {
            return this.currentTopic;
        }
        
        return null;
    }
    
    /**
     * Extract nouns from text (simplified)
     */
    extractNouns(text) {
        // Common nouns in startup context
        const nounPatterns = /\b(company|startup|product|revenue|burn rate|runway|funding|team|customer|market|competitor|feature|metric|number|rate|percentage)\b/gi;
        const matches = text.match(nounPatterns);
        return matches || [];
    }
    
    /**
     * Identify the current topic of conversation
     */
    identifyTopic(message) {
        const entities = this.extractEntities(message);
        const intent = this.detectIntent(message);
        
        // Business topics
        if (entities.concepts.some(c => ['revenue', 'burn rate', 'runway', 'funding'].includes(c.toLowerCase()))) {
            return { category: 'business', specific: 'financial-metrics' };
        }
        if (entities.concepts.some(c => ['product', 'feature', 'customer'].includes(c.toLowerCase()))) {
            return { category: 'business', specific: 'product-development' };
        }
        
        // Personal topics
        if (intent.type === 'personal-inquiry' || intent.type === 'state-sharing') {
            return { category: 'personal', specific: 'wellbeing' };
        }
        
        // Technical topics
        if (message.toLowerCase().includes('code') || message.toLowerCase().includes('bug') || message.toLowerCase().includes('technical')) {
            return { category: 'technical', specific: 'development' };
        }
        
        // Continue previous topic if unclear
        return this.currentTopic || { category: 'general', specific: 'conversation' };
    }
    
    /**
     * Determine what context is needed to respond appropriately
     */
    determineRequiredContext(message) {
        const required = [];
        const lower = message.toLowerCase();
        
        // "How is it going?" - needs to know what "it" refers to
        if (lower.includes('it') && !this.resolveReferences(message)['it']) {
            required.push('previous-topic');
        }
        
        // "What do you think?" - needs to know about what
        if (lower.includes('what do you think') && !lower.includes('about')) {
            required.push('previous-statement');
        }
        
        // "The numbers" - needs specific numbers context
        if (lower.includes('the numbers') || lower.includes('the metrics')) {
            required.push('recent-metrics');
        }
        
        // Time-based queries
        if (lower.includes('since') || lower.includes('progress') || lower.includes('change')) {
            required.push('temporal-comparison');
        }
        
        return required;
    }
    
    /**
     * Detect implicit meaning in the message
     */
    detectImplicitMeaning(message) {
        const implicit = {};
        const lower = message.toLowerCase();
        
        // "How are you?" might really mean "Are you functioning properly?"
        if (lower === 'how are you?' || lower === 'how are you') {
            implicit.possibleMeanings = [
                'status-check',
                'social-greeting',
                'genuine-concern'
            ];
            implicit.likelyMeaning = this.conversationHistory.length === 0 ? 'social-greeting' : 'genuine-concern';
        }
        
        // "Not bad" usually means "good" in context
        if (lower.includes('not bad') || lower.includes('not too bad')) {
            implicit.sentiment = 'positive';
            implicit.actualMeaning = 'good';
        }
        
        // "Fine" often means "not great"
        if (lower === 'fine' || lower === "i'm fine") {
            implicit.sentiment = 'neutral-negative';
            implicit.possibleMeanings = ['actually-not-fine', 'neutral', 'dismissive'];
        }
        
        // Questions without context
        if (lower === 'why?' || lower === 'really?') {
            implicit.needsPreviousContext = true;
            implicit.type = 'follow-up';
        }
        
        return implicit;
    }
    
    /**
     * Determine the best response strategy
     */
    determineResponseStrategy(analysis) {
        const strategy = {
            approach: 'direct',
            tone: 'professional',
            length: 'concise',
            includeContext: false,
            askClarification: false,
            offerHelp: false
        };
        
        // Adjust based on intent
        switch (analysis.intent.type) {
            case 'personal-inquiry':
                strategy.approach = 'warm';
                strategy.tone = 'friendly';
                break;
                
            case 'advice-request':
                strategy.approach = 'helpful';
                strategy.includeContext = true;
                strategy.length = 'moderate';
                break;
                
            case 'state-sharing':
                if (analysis.sentiment === 'negative') {
                    strategy.approach = 'empathetic';
                    strategy.tone = 'supportive';
                    strategy.offerHelp = true;
                }
                break;
                
            case 'question':
                if (analysis.requiredContext.length > 0) {
                    strategy.askClarification = true;
                }
                break;
        }
        
        // Adjust based on conversation length
        if (this.conversationHistory.length > 10) {
            strategy.length = 'brief'; // Be more concise in long conversations
        }
        
        // Adjust based on time of day
        const hour = new Date().getHours();
        if (hour >= 23 || hour <= 5) {
            strategy.tone = 'gentle';
        }
        
        return strategy;
    }
    
    /**
     * Analyze sentiment of the message
     */
    analyzeSentiment(message) {
        const lower = message.toLowerCase();
        
        // Positive indicators
        const positive = ['good', 'great', 'excellent', 'happy', 'excited', 'wonderful', 'amazing', 'love', 'fantastic'];
        const negative = ['bad', 'terrible', 'awful', 'sad', 'angry', 'frustrated', 'hate', 'worried', 'stressed', 'tired'];
        
        let score = 0;
        positive.forEach(word => {
            if (lower.includes(word)) score++;
        });
        negative.forEach(word => {
            if (lower.includes(word)) score--;
        });
        
        if (score > 0) return 'positive';
        if (score < 0) return 'negative';
        return 'neutral';
    }
    
    /**
     * Extract time context from message
     */
    extractTimeContext(message) {
        const lower = message.toLowerCase();
        const context = {};
        
        if (lower.includes('yesterday')) {
            context.reference = 'past';
            context.specific = new Date(Date.now() - 86400000);
        } else if (lower.includes('today')) {
            context.reference = 'present';
            context.specific = new Date();
        } else if (lower.includes('tomorrow')) {
            context.reference = 'future';
            context.specific = new Date(Date.now() + 86400000);
        } else if (lower.includes('last week')) {
            context.reference = 'past';
            context.specific = new Date(Date.now() - 604800000);
        }
        
        return context;
    }
    
    /**
     * Update knowledge graph with new information
     */
    updateKnowledgeGraph(analysis) {
        // Store entities
        if (analysis.entities.concepts) {
            analysis.entities.concepts.forEach(concept => {
                this.knowledgeGraph.entities.set(concept, {
                    type: 'concept',
                    lastMentioned: Date.now(),
                    context: analysis.topic
                });
            });
        }
        
        // Update current topic
        if (analysis.topic) {
            this.currentTopic = analysis.topic;
            this.topicHistory.push({
                topic: analysis.topic,
                timestamp: Date.now()
            });
        }
    }
    
    /**
     * Get time of day context
     */
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        if (hour < 21) return 'evening';
        return 'night';
    }
    
    /**
     * Generate context summary for response generation
     */
    getContextSummary() {
        return {
            currentTopic: this.currentTopic,
            recentTopics: this.topicHistory.slice(-3),
            userState: this.userContext,
            timeContext: this.environmentContext,
            conversationLength: this.conversationHistory.length,
            lastInteraction: this.conversationHistory[this.conversationHistory.length - 1]
        };
    }
}

// Export for use
window.ContextEngine = ContextEngine;