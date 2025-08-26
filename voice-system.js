/**
 * Advanced Voice System for FlashIntelligence
 * Implements natural conversation flow with JARVIS-like capabilities
 */

class AdvancedVoiceSystem {
    constructor() {
        // Conversation state machine
        this.states = {
            IDLE: 'idle',
            LISTENING: 'listening',
            THINKING: 'thinking',
            SPEAKING: 'speaking',
            INTERRUPTED: 'interrupted',
            PROCESSING: 'processing'
        };
        
        this.currentState = this.states.IDLE;
        this.attentionLevel = 0; // 0-1, replaces binary wake/sleep
        
        // Conversation management
        this.conversationThread = [];
        this.currentContext = {};
        this.emotionalState = { user: 'neutral', assistant: 'professional' };
        this.interruptionBuffer = '';
        
        // Audio processing
        this.audioContext = null;
        this.mediaStreamSource = null;
        this.silenceDetector = null;
        this.voiceActivityLevel = 0;
        
        // Speech synthesis
        this.speechQueue = [];
        this.currentUtterance = null;
        this.streamBuffer = '';
        
        // Timing parameters
        this.lastSpeechTime = Date.now();
        this.silenceThreshold = 800; // ms of silence before considering turn complete
        this.interruptionThreshold = 200; // ms to detect interruption
        
        this.initializeAudioContext();
    }
    
    initializeAudioContext() {
        if (typeof window !== 'undefined' && 'AudioContext' in window) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    /**
     * Enhanced voice recognition with natural turn-taking
     */
    async startAdvancedListening() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3; // For better accuracy
        
        // Track speech timing for natural pauses
        let speechStartTime = null;
        let lastSpeechEnd = Date.now();
        let currentTranscript = '';
        
        this.recognition.onstart = () => {
            this.setState(this.states.LISTENING);
            this.updateUI('listening', 'Ready for conversation');
        };
        
        this.recognition.onresult = async (event) => {
            const result = event.results[event.results.length - 1];
            const transcript = result[0].transcript;
            const confidence = result[0].confidence || 0.5;
            
            // Update attention level based on keywords and context
            this.updateAttentionLevel(transcript);
            
            if (!speechStartTime) {
                speechStartTime = Date.now();
            }
            
            // Handle interim results for real-time feedback
            if (!result.isFinal) {
                currentTranscript = transcript;
                this.updateUI('speaking-indicator', transcript);
                
                // Detect if user is still forming thoughts
                const pauseDuration = Date.now() - lastSpeechEnd;
                if (pauseDuration < this.silenceThreshold) {
                    // User is still speaking, don't interrupt
                    return;
                }
            } else {
                // Final result - process based on attention and context
                lastSpeechEnd = Date.now();
                const fullTranscript = currentTranscript;
                currentTranscript = '';
                speechStartTime = null;
                
                // Intelligent turn-taking decision
                if (this.shouldRespond(fullTranscript, confidence)) {
                    await this.processUserInput(fullTranscript);
                } else {
                    // Keep listening, user might continue
                    this.updateUI('listening', 'Listening...');
                }
            }
        };
        
        this.recognition.onspeechend = () => {
            // Natural pause detected - decide if turn is complete
            setTimeout(() => {
                if (currentTranscript && Date.now() - lastSpeechEnd > this.silenceThreshold) {
                    this.processUserInput(currentTranscript);
                    currentTranscript = '';
                }
            }, this.silenceThreshold);
        };
        
        this.recognition.onerror = (event) => {
            if (event.error !== 'no-speech') {
                console.error('Voice recognition error:', event.error);
                this.handleError(event.error);
            }
        };
        
        // Auto-restart for continuous conversation
        this.recognition.onend = () => {
            if (this.currentState !== this.states.IDLE) {
                setTimeout(() => this.recognition.start(), 100);
            }
        };
        
        this.recognition.start();
    }
    
    /**
     * Intelligent attention level management
     */
    updateAttentionLevel(transcript) {
        const lowerTranscript = transcript.toLowerCase();
        
        // Direct address increases attention
        if (lowerTranscript.includes('flash') || lowerTranscript.includes('hey') || lowerTranscript.includes('listen')) {
            this.attentionLevel = Math.min(1, this.attentionLevel + 0.3);
        }
        
        // Questions increase attention
        if (lowerTranscript.includes('?') || this.isQuestion(lowerTranscript)) {
            this.attentionLevel = Math.min(1, this.attentionLevel + 0.2);
        }
        
        // Decay attention over time
        const timeSinceLastSpeech = Date.now() - this.lastSpeechTime;
        if (timeSinceLastSpeech > 30000) { // 30 seconds
            this.attentionLevel = Math.max(0, this.attentionLevel - 0.1);
        }
        
        return this.attentionLevel;
    }
    
    /**
     * Determine if AI should respond based on context
     */
    shouldRespond(transcript, confidence) {
        // Always respond to direct questions
        if (this.isQuestion(transcript)) return true;
        
        // Respond if attention is high
        if (this.attentionLevel > 0.7) return true;
        
        // Respond if confidence is high and transcript is substantial
        if (confidence > 0.8 && transcript.split(' ').length > 3) return true;
        
        // Check for conversation continuity
        if (this.isConversationContinuation(transcript)) return true;
        
        return false;
    }
    
    /**
     * Process user input with streaming response
     */
    async processUserInput(transcript) {
        this.setState(this.states.THINKING);
        this.conversationThread.push({ role: 'user', content: transcript, timestamp: Date.now() });
        
        // Update emotional state based on user input
        this.analyzeUserEmotion(transcript);
        
        // Get streaming response
        try {
            await this.getStreamingResponse(transcript);
        } catch (error) {
            console.error('Processing error:', error);
            this.speakWithEmotion("My apologies, Sir. I'm experiencing technical difficulties. Shall we try again?", 'apologetic');
        }
    }
    
    /**
     * Streaming response with progressive speech synthesis
     */
    async getStreamingResponse(userInput) {
        this.setState(this.states.PROCESSING);
        
        // Use ContextualJARVIS for deep context understanding
        if (window.ContextualJARVIS) {
            const contextualJarvis = new window.ContextualJARVIS();
            
            // Get contextually aware response
            const contextualResponse = await contextualJarvis.generateContextualResponse(
                userInput,
                this.conversationThread,
                {
                    emotionalState: this.emotionalState,
                    attentionLevel: this.attentionLevel,
                    currentContext: this.currentContext
                }
            );
            
            // Use the response
            this.speakSentenceWithEmotion(contextualResponse.text);
            
            // Update conversation history with context
            this.conversationThread.push({
                role: 'assistant',
                content: contextualResponse.text,
                timestamp: Date.now(),
                personality: 'contextual-jarvis',
                emotion: contextualResponse.emotion,
                context: contextualResponse.context
            });
            
            // Update our current context
            if (contextualResponse.context) {
                this.currentContext = {
                    topic: contextualResponse.context.topic,
                    references: contextualResponse.context.references,
                    intent: contextualResponse.context.intent
                };
            }
            
            this.lastSpeechTime = Date.now();
            return;
        }
        
        // Fall back to business advisor for business questions
        const advisor = window.advisor || new FlashAdvisor();
        const conversation = this.buildConversationContext();
        
        try {
            // Call the API with streaming enabled
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('GROQ_API_KEY')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: this.buildSystemPrompt(advisor.currentPersonality)
                        },
                        ...conversation,
                        {
                            role: 'user',
                            content: userInput
                        }
                    ],
                    temperature: 0.8,
                    max_tokens: 150,
                    stream: true
                })
            });
            
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            
            // Process streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullResponse = '';
            let sentenceBuffer = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;
                        
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content || '';
                            
                            if (content) {
                                fullResponse += content;
                                sentenceBuffer += content;
                                
                                // Progressive speech - speak complete sentences
                                if (this.isCompleteSentence(sentenceBuffer)) {
                                    this.speakSentenceWithEmotion(sentenceBuffer.trim());
                                    sentenceBuffer = '';
                                }
                            }
                        } catch (e) {
                            console.error('Parse error:', e);
                        }
                    }
                }
            }
            
            // Speak any remaining text
            if (sentenceBuffer.trim()) {
                this.speakSentenceWithEmotion(sentenceBuffer.trim());
            }
            
            // Add to conversation history
            this.conversationThread.push({
                role: 'assistant',
                content: fullResponse,
                timestamp: Date.now(),
                personality: advisor.currentPersonality
            });
            
            // Update last speech time
            this.lastSpeechTime = Date.now();
            
        } catch (error) {
            console.error('Streaming error:', error);
            this.setState(this.states.LISTENING);
            throw error;
        }
    }
    
    /**
     * Enhanced speech synthesis with emotion and natural pacing
     */
    speakSentenceWithEmotion(text) {
        if (!text || this.currentState === this.states.INTERRUPTED) return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply emotional voice settings
        const emotion = this.detectSentenceEmotion(text);
        const voiceSettings = this.getEmotionalVoiceSettings(emotion);
        
        utterance.rate = voiceSettings.rate;
        utterance.pitch = voiceSettings.pitch;
        utterance.volume = voiceSettings.volume;
        
        // Add to speech queue
        this.speechQueue.push(utterance);
        
        // Handle interruption capability
        utterance.onstart = () => {
            this.setState(this.states.SPEAKING);
            this.currentUtterance = utterance;
        };
        
        utterance.onend = () => {
            this.currentUtterance = null;
            if (this.speechQueue.length === 0) {
                this.setState(this.states.LISTENING);
            }
        };
        
        // Process speech queue
        this.processSpeechQueue();
    }
    
    /**
     * Handle speech queue with interruption support
     */
    processSpeechQueue() {
        if (this.currentUtterance || this.speechQueue.length === 0) return;
        
        const utterance = this.speechQueue.shift();
        speechSynthesis.speak(utterance);
    }
    
    /**
     * Interrupt current speech
     */
    interruptSpeech() {
        if (this.currentState === this.states.SPEAKING) {
            speechSynthesis.cancel();
            this.speechQueue = [];
            this.currentUtterance = null;
            this.setState(this.states.INTERRUPTED);
            
            // Save interrupted context
            this.interruptionBuffer = this.conversationThread[this.conversationThread.length - 1]?.content || '';
        }
    }
    
    /**
     * Build conversation context for AI
     */
    buildConversationContext() {
        // Keep last 5 exchanges for context
        const recentConversation = this.conversationThread.slice(-10);
        
        // Add emotional context
        const contextMessages = recentConversation.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        
        return contextMessages;
    }
    
    /**
     * Build dynamic system prompt based on context
     */
    buildSystemPrompt(personality) {
        const emotionalContext = this.emotionalState.user;
        const conversationLength = this.conversationThread.length;
        
        return `You are JARVIS, an advanced AI assistant with the personality of ${personality}.

CONVERSATION RULES:
- Keep responses to 1-2 sentences maximum
- Be naturally conversational, not robotic
- ${emotionalContext === 'stressed' ? 'Be especially supportive and calm' : ''}
- ${emotionalContext === 'excited' ? 'Match their energy and enthusiasm' : ''}
- ${conversationLength > 10 ? 'You\'ve been talking for a while, be more concise' : ''}
- If interrupted, gracefully acknowledge and continue
- Ask clarifying questions when needed
- Show personality through word choice and tone
- Never lecture or monologue

Current context: ${this.getCurrentContextSummary()}`;
    }
    
    /**
     * Emotional intelligence functions
     */
    analyzeUserEmotion(text) {
        const lower = text.toLowerCase();
        
        if (lower.includes('stress') || lower.includes('worried') || lower.includes('scared')) {
            this.emotionalState.user = 'stressed';
        } else if (lower.includes('excited') || lower.includes('great') || lower.includes('awesome')) {
            this.emotionalState.user = 'excited';
        } else if (lower.includes('confused') || lower.includes("don't understand")) {
            this.emotionalState.user = 'confused';
        } else if (lower.includes('urgent') || lower.includes('asap') || lower.includes('quickly')) {
            this.emotionalState.user = 'urgent';
        } else {
            this.emotionalState.user = 'neutral';
        }
    }
    
    detectSentenceEmotion(text) {
        // Simple emotion detection for voice modulation
        const lower = text.toLowerCase();
        
        if (text.includes('!') || lower.includes('great') || lower.includes('excellent')) {
            return 'enthusiastic';
        } else if (text.includes('?')) {
            return 'inquisitive';
        } else if (lower.includes('however') || lower.includes('but') || lower.includes('concerning')) {
            return 'thoughtful';
        } else if (lower.includes('urgent') || lower.includes('critical') || lower.includes('immediately')) {
            return 'urgent';
        }
        
        return 'neutral';
    }
    
    getEmotionalVoiceSettings(emotion) {
        const settings = {
            enthusiastic: { rate: 1.1, pitch: 1.1, volume: 0.95 },
            inquisitive: { rate: 0.95, pitch: 1.05, volume: 0.9 },
            thoughtful: { rate: 0.9, pitch: 0.95, volume: 0.85 },
            urgent: { rate: 1.15, pitch: 1.0, volume: 1.0 },
            neutral: { rate: 1.0, pitch: 1.0, volume: 0.9 }
        };
        
        return settings[emotion] || settings.neutral;
    }
    
    /**
     * Utility functions
     */
    isQuestion(text) {
        const lower = text.toLowerCase();
        return text.includes('?') || 
               lower.startsWith('what') || 
               lower.startsWith('how') || 
               lower.startsWith('why') || 
               lower.startsWith('when') || 
               lower.startsWith('where') || 
               lower.startsWith('who') ||
               lower.startsWith('can') ||
               lower.startsWith('should') ||
               lower.startsWith('would') ||
               lower.includes('tell me');
    }
    
    isCompleteSentence(text) {
        return text.match(/[.!?]$/) || text.split(' ').length > 15;
    }
    
    isConversationContinuation(text) {
        const lower = text.toLowerCase();
        const continuationWords = ['also', 'and', 'but', 'however', 'actually', 'oh', 'wait', 'another thing'];
        return continuationWords.some(word => lower.startsWith(word));
    }
    
    getCurrentContextSummary() {
        if (this.conversationThread.length === 0) return 'First interaction';
        
        const topics = this.extractTopics();
        const duration = Date.now() - this.conversationThread[0].timestamp;
        const turns = this.conversationThread.length;
        
        return `Discussing ${topics.join(', ')} for ${Math.round(duration/60000)} minutes (${turns} exchanges)`;
    }
    
    extractTopics() {
        // Simple topic extraction from conversation
        const keywords = ['funding', 'product', 'revenue', 'team', 'growth', 'customers', 'runway'];
        const topics = new Set();
        
        this.conversationThread.forEach(msg => {
            keywords.forEach(keyword => {
                if (msg.content.toLowerCase().includes(keyword)) {
                    topics.add(keyword);
                }
            });
        });
        
        return Array.from(topics).slice(0, 3);
    }
    
    setState(newState) {
        this.currentState = newState;
        this.updateUI('state', newState);
    }
    
    updateUI(type, data) {
        // Update UI elements based on state changes
        if (typeof window !== 'undefined' && window.updateVoiceUI) {
            window.updateVoiceUI(type, data);
        }
    }
    
    handleError(error) {
        console.error('Voice system error:', error);
        this.setState(this.states.IDLE);
        this.speakWithEmotion("I encountered an error. Let me reset and try again.", 'apologetic');
    }
    
    speakWithEmotion(text, emotion) {
        const voiceSettings = this.getEmotionalVoiceSettings(emotion);
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.rate = voiceSettings.rate;
        utterance.pitch = voiceSettings.pitch;
        utterance.volume = voiceSettings.volume;
        
        speechSynthesis.speak(utterance);
    }
}

// Export for use
window.AdvancedVoiceSystem = AdvancedVoiceSystem;