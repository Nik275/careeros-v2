/**
 * Mentor Engine
 * 
 * The Mentor Engine provides personalized, context-aware guidance to students
 * throughout their CareerOS journey. Unlike a simple chatbot, the Mentor Engine
 * maintains context across interactions, understands the student's emotional state,
 * and provides guidance that evolves with the student's understanding.
 * 
 * Architecture Principle:
 *   The mentor is not just an information source - it's a guide that helps students
 *   navigate uncertainty, validate their understanding, and make thoughtful decisions.
 *   The mentor has access to all intelligence systems but presents information
 *   in a human, accessible way.
 * 
 * Key Concepts:
 *   - MentorContext: The complete context for a mentor interaction
 *   - MentorInteraction: A single exchange between student and mentor
 *   - EmotionalState: The student's current emotional condition
 *   - GuidanceStrategy: How the mentor should respond given the context
 *   - ConversationMemory: History and patterns in the conversation
 * 
 * Inputs:
 *   - StudentBelief: The student's profile and history
 *   - CurrentRecommendation: What the student is currently exploring
 *   - StudentInput: What the student is asking or expressing
 *   - ConversationHistory: Previous interactions
 *   - EmotionalState: Current emotional condition (if detected)
 * 
 * Outputs:
 *   - MentorResponse: Personalized guidance response
 *   - SuggestedActions: Concrete next steps
 *   - EmotionalGuidance: Support for emotional concerns
 *   - ClarificationQuestions: Questions to deepen understanding
 * 
 * Dependencies:
 *   - StudentBelief (reads from)
 *   - RecommendationEngine (uses for context)
 *   - RegretEngine (uses for risk discussion)
 *   - PathCascade (uses for alternative exploration)
 * 
 * Future Expansion:
 *   - Multi-modal interactions (voice, video)
 *   - Proactive guidance (reaching out when patterns detected)
 *   - Integration with human mentors for escalation
 *   - Personalized explanation styles based on student preferences
 *   - Cultural and linguistic adaptation
 */

import {
  StudentBelief,
  CareerRecommendation,
  CareerPath,
  MentorContext,
  MentorInteraction,
  MentorResponse,
  ResponseType,
  EmotionalState,
  EntityId,
  ConfidenceScore,
  Result,
  AsyncResult,
} from '../types';

import { queryStudentBelief } from '../student-model/StudentBelief';

/**
 * Configuration for the Mentor Engine.
 */
export interface MentorEngineConfig {
  /** Tone of mentor responses */
  tone: 'SUPPORTIVE' | 'DIRECT' | 'Socratic' | 'ENCOURAGING';
  
  /** Detail level of responses */
  detailLevel: 'CONCISE' | 'MODERATE' | 'DETAILED';
  
  /** Whether to proactively suggest actions */
  proactiveSuggestions: boolean;
  
  /** Maximum conversation history to consider */
  maxHistoryLength: number;
  
  /** Whether to detect and respond to emotional states */
  emotionalAwareness: boolean;
  
  /** Whether to ask clarifying questions */
  askClarifyingQuestions: boolean;
}

/**
 * Default configuration.
 */
export const DEFAULT_MENTOR_CONFIG: MentorEngineConfig = {
  tone: 'SUPPORTIVE',
  detailLevel: 'MODERATE',
  proactiveSuggestions: true,
  maxHistoryLength: 10,
  emotionalAwareness: true,
  askClarifyingQuestions: true,
};

/**
 * Input to a mentor interaction.
 */
export interface MentorInput {
  /** The student's message or question */
  studentInput: string;
  
  /** Current student belief model */
  studentBelief: StudentBelief;
  
  /** Current recommendation being discussed (if any) */
  currentRecommendation?: CareerRecommendation;
  
  /** Previous interactions in this conversation */
  conversationHistory: MentorInteraction[];
  
  /** Detected emotional state (if known) */
  emotionalState?: EmotionalState;
  
  /** Specific topic the student is asking about */
  topic?: MentorTopic;
}

/**
 * Topics the mentor can discuss.
 */
export enum MentorTopic {
  RECOMMENDATION_EXPLANATION = 'recommendation_explanation',
  CAREER_DETAILS = 'career_details',
  PATH_EXPLORATION = 'path_exploration',
  REGRET_CONCERNS = 'regret_concerns',
  NEXT_STEPS = 'next_steps',
  SELF_UNDERSTANDING = 'self_understanding',
  CONFIDENCE_BUILDING = 'confidence_building',
  DECISION_SUPPORT = 'decision_support',
  GENERAL_GUIDANCE = 'general_guidance',
}

/**
 * Result of a mentor interaction.
 */
export interface MentorInteractionResult {
  /** The mentor's response */
  response: MentorResponse;
  
  /** Updated context after this interaction */
  updatedContext: MentorContext;
  
  /** Insights gained from this interaction */
  insights: InteractionInsight[];
  
  /** Whether the conversation should continue */
  shouldContinue: boolean;
  
  /** Suggested follow-up topics */
  suggestedTopics: MentorTopic[];
}

/**
 * Insight gained from an interaction.
 */
export interface InteractionInsight {
  /** Type of insight */
  type: 'BELIEF_CLARIFICATION' | 'EMOTIONAL_SIGNAL' | 'KNOWLEDGE_GAP' | 'DECISION_READINESS';
  
  /** Description of the insight */
  description: string;
  
  /** Confidence in this insight */
  confidence: ConfidenceScore;
  
  /** Suggested action based on insight */
  suggestedAction?: string;
}

/**
 * The Mentor Engine.
 * 
 * This engine provides personalized, context-aware guidance to students.
 */
export class MentorEngine {
  private config: MentorEngineConfig;

  constructor(config: Partial<MentorEngineConfig> = {}) {
    this.config = { ...DEFAULT_MENTOR_CONFIG, ...config };
  }

  /**
   * Process a student input and generate a mentor response.
   * 
   * This is the main entry point for mentor interactions.
   */
  async processInteraction(
    input: MentorInput
  ): AsyncResult<MentorInteractionResult> {
    try {
      // Step 1: Analyze the input
      const analysis = this.analyzeInput(input);
      
      // Step 2: Determine response strategy
      const strategy = this.determineResponseStrategy(input, analysis);
      
      // Step 3: Generate response
      const response = await this.generateResponse(input, strategy);
      
      // Step 4: Update context
      const updatedContext = this.updateContext(input, response);
      
      // Step 5: Extract insights
      const insights = this.extractInsights(input, response, analysis);
      
      // Step 6: Determine if conversation should continue
      const shouldContinue = this.shouldContinueConversation(input, response);
      
      // Step 7: Suggest follow-up topics
      const suggestedTopics = this.suggestFollowUpTopics(input, response);
      
      return {
        success: true,
        data: {
          response,
          updatedContext,
          insights,
          shouldContinue,
          suggestedTopics,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Initialize a new mentor context for a student.
   */
  initializeContext(
    studentBelief: StudentBelief,
    currentRecommendation?: CareerRecommendation
  ): MentorContext {
    return {
      studentBelief,
      currentRecommendation,
      interactionHistory: [],
      emotionalState: undefined,
      currentConcern: undefined,
    };
  }

  /**
   * Analyze the student input to understand intent and needs.
   */
  private analyzeInput(input: MentorInput): InputAnalysis {
    const query = queryStudentBelief(input.studentBelief);
    
    // Detect topic
    const detectedTopic = this.detectTopic(input.studentInput, input.topic);
    
    // Detect emotional signals
    const emotionalSignals = this.config.emotionalAwareness 
      ? this.detectEmotionalSignals(input.studentInput)
      : [];
    
    // Detect knowledge gaps
    const knowledgeGaps = this.detectKnowledgeGaps(input.studentInput, detectedTopic);
    
    // Assess decision readiness
    const decisionReadiness = this.assessDecisionReadiness(
      input.conversationHistory,
      input.currentRecommendation
    );
    
    return {
      detectedTopic,
      emotionalSignals,
      knowledgeGaps,
      decisionReadiness,
      isFollowUp: input.conversationHistory.length > 0,
      isClarification: this.isClarificationRequest(input.studentInput),
      isExploration: this.isExplorationRequest(input.studentInput),
    };
  }

  /**
   * Determine the best response strategy given the input analysis.
   */
  private determineResponseStrategy(
    input: MentorInput,
    analysis: InputAnalysis
  ): ResponseStrategy {
    // Default strategy
    const strategy: ResponseStrategy = {
      type: ResponseType.GUIDANCE,
      tone: this.config.tone,
      detailLevel: this.config.detailLevel,
      shouldAskClarifyingQuestion: false,
      shouldProvideActionableSteps: this.config.proactiveSuggestions,
      shouldAcknowledgeEmotion: analysis.emotionalSignals.length > 0,
      shouldValidateUnderstanding: analysis.isClarification,
    };
    
    // Adjust based on topic
    switch (analysis.detectedTopic) {
      case MentorTopic.RECOMMENDATION_EXPLANATION:
        strategy.type = ResponseType.EXPLORATION;
        strategy.detailLevel = 'DETAILED';
        break;
        
      case MentorTopic.REGRET_CONCERNS:
        strategy.type = ResponseType.REALITY_CHECK;
        strategy.tone = 'SUPPORTIVE';
        strategy.shouldAcknowledgeEmotion = true;
        break;
        
      case MentorTopic.CONFIDENCE_BUILDING:
        strategy.type = ResponseType.ENCOURAGEMENT;
        strategy.tone = 'ENCOURAGING';
        break;
        
      case MentorTopic.DECISION_SUPPORT:
        strategy.type = ResponseType.GUIDANCE;
        strategy.shouldProvideActionableSteps = true;
        break;
        
      case MentorTopic.SELF_UNDERSTANDING:
        strategy.type = ResponseType.CLARIFICATION;
        strategy.shouldAskClarifyingQuestion = this.config.askClarifyingQuestions;
        break;
    }
    
    // Adjust based on emotional state
    if (analysis.emotionalSignals.includes('anxiety')) {
      strategy.tone = 'SUPPORTIVE';
      strategy.shouldAcknowledgeEmotion = true;
    } else if (analysis.emotionalSignals.includes('excitement')) {
      strategy.tone = 'ENCOURAGING';
    }
    
    // Adjust based on decision readiness
    if (analysis.decisionReadiness > 0.7) {
      strategy.shouldProvideActionableSteps = true;
    }
    
    return strategy;
  }

  /**
   * Generate the actual mentor response.
   */
  private async generateResponse(
    input: MentorInput,
    strategy: ResponseStrategy
  ): Promise<MentorResponse> {
    // Build response components
    const components: string[] = [];
    
    // 1. Emotional acknowledgment (if needed)
    if (strategy.shouldAcknowledgeEmotion) {
      components.push(this.generateEmotionalAcknowledgment(input));
    }
    
    // 2. Main response content
    const mainContent = await this.generateMainContent(input, strategy);
    components.push(mainContent);
    
    // 3. Clarifying question (if strategy calls for it)
    if (strategy.shouldAskClarifyingQuestion) {
      components.push(this.generateClarifyingQuestion(input));
    }
    
    // 4. Actionable steps (if strategy calls for it)
    let suggestedActions: string[] = [];
    if (strategy.shouldProvideActionableSteps) {
      suggestedActions = this.generateSuggestedActions(input, strategy);
    }
    
    // Combine into final response
    const text = components.join('\n\n');
    
    return {
      text,
      type: strategy.type,
      suggestedActions,
      confidence: this.calculateResponseConfidence(input, strategy),
    };
  }

  /**
   * Generate emotional acknowledgment.
   */
  private generateEmotionalAcknowledgment(input: MentorInput): string {
    const emotionalState = input.emotionalState;
    
    if (!emotionalState) {
      return '';
    }
    
    const acknowledgments: Record<EmotionalState, string> = {
      [EmotionalState.ANXIOUS]: "I can sense some uncertainty in your question. That's completely natural when thinking about big career decisions.",
      [EmotionalState.EXCITED]: "I love your enthusiasm! That energy is going to serve you well as you explore these possibilities.",
      [EmotionalState.HOPEFUL]: "It's wonderful that you're feeling optimistic about these directions. Let's make sure we ground that hope in practical understanding.",
      [EmotionalState.CURIOUS]: "Your curiosity is exactly the right mindset for this exploration. Let's dive deeper into what interests you.",
      [EmotionalState.CONFUSED]: "It sounds like there's a lot to process here. Let me help clarify things step by step.",
      [EmotionalState.OVERWHELMED]: "I can tell this feels like a lot right now. Let's break it down into smaller, more manageable pieces.",
      [EmotionalState.DOUBTFUL]: "It's healthy to have questions and doubts. Let's examine those concerns together.",
      [EmotionalState.FRUSTRATED]: "I hear your frustration. Let's figure out what's blocking you and how to move forward.",
      [EmotionalState.CONFIDENT]: "Your confidence is well-placed. Let's build on that foundation with some concrete next steps.",
    };
    
    return acknowledgments[emotionalState] || '';
  }

  /**
   * Generate the main content of the response.
   */
  private async generateMainContent(
    input: MentorInput,
    strategy: ResponseStrategy
  ): Promise<string> {
    const query = queryStudentBelief(input.studentBelief);
    
    // Generate content based on topic
    switch (strategy.type) {
      case ResponseType.EXPLORATION:
        return this.generateExplorationContent(input, strategy);
        
      case ResponseType.GUIDANCE:
        return this.generateGuidanceContent(input, strategy);
        
      case ResponseType.ENCOURAGEMENT:
        return this.generateEncouragementContent(input, strategy);
        
      case ResponseType.REALITY_CHECK:
        return this.generateRealityCheckContent(input, strategy);
        
      case ResponseType.CLARIFICATION:
        return this.generateClarificationContent(input, strategy);
        
      case ResponseType.ACTION_SUGGESTION:
        return this.generateActionSuggestionContent(input, strategy);
        
      default:
        return this.generateGuidanceContent(input, strategy);
    }
  }

  /**
   * Generate exploration content.
   */
  private generateExplorationContent(
    input: MentorInput,
    strategy: ResponseStrategy
  ): string {
    const recommendation = input.currentRecommendation;
    
    if (!recommendation) {
      return "I'd be happy to explore career options with you. Based on your profile, you have several interesting directions to consider. What aspects of your assessment results would you like to understand better?";
    }
    
    const path = recommendation.path;
    const reasoning = recommendation.reasoning;
    
    let content = `The ${path.name} path was recommended because it aligns well with what you've shared about yourself. `;
    
    if (strategy.detailLevel === 'DETAILED') {
      content += `\n\n${reasoning.summary}\n\n`;
      content += `Specifically, this path leverages your strengths in ways that will help you excel, while also satisfying your core motivations. `;
      content += `The progression from ${path.nodes[0].name} to ${path.nodes[path.nodes.length - 1].name} gives you both immediate opportunities and long-term growth.`;
    } else {
      content += `It matches your motivations, leverages your strengths, and offers a clear growth trajectory over ${path.totalYears} years.`;
    }
    
    return content;
  }

  /**
   * Generate guidance content.
   */
  private generateGuidanceContent(
    input: MentorInput,
    strategy: ResponseStrategy
  ): string {
    const query = queryStudentBelief(input.studentBelief);
    const topStrengths = query.getStrengths()
      .sort((a, b) => b.level - a.level)
      .slice(0, 2);
    
    let content = "Based on your profile, here's what I'd suggest focusing on:";
    
    if (topStrengths.length > 0) {
      content += `\n\nYour ${topStrengths.map(s => s.name).join(' and ')} are real assets. `;
      content += `Look for roles where these capabilities make a difference.`;
    }
    
    content += `\n\nThe key is finding a path that feels right both now and in the long term. `;
    content += `Take time to validate any direction before committing fully.`;
    
    return content;
  }

  /**
   * Generate encouragement content.
   */
  private generateEncouragementContent(
    input: MentorInput,
    strategy: ResponseStrategy
  ): string {
    const query = queryStudentBelief(input.studentBelief);
    const motivations = query.getMotivations();
    
    let content = "You have more clarity than you might realize. ";
    
    if (motivations.length > 0) {
      content += `Understanding that you're driven by ${motivations[0]?.name.toLowerCase() || 'specific goals'} puts you ahead of many people. `;
    }
    
    content += "Trust the process, and trust yourself. You're asking the right questions.";
    
    return content;
  }

  /**
   * Generate reality check content.
   */
  private generateRealityCheckContent(
    input: MentorInput,
    strategy: ResponseStrategy
  ): string {
    return "It's important to look at challenges honestly. Every path has trade-offs, and recognizing them upfront helps you prepare. The concerns we've identified aren't roadblocks - they're just areas to be thoughtful about. What specific worry would you like to explore?";
  }

  /**
   * Generate clarification content.
   */
  private generateClarificationContent(
    input: MentorInput,
    strategy: ResponseStrategy
  ): string {
    return "Let me make sure I understand correctly. You're wondering about how your interests and capabilities align with different career directions. Is that right? Or is there a specific aspect you'd like to focus on first?";
  }

  /**
   * Generate action suggestion content.
   */
  private generateActionSuggestionContent(
    input: MentorInput,
    strategy: ResponseStrategy
  ): string {
    const recommendation = input.currentRecommendation;
    
    if (!recommendation) {
      return "Let's start with some concrete steps. First, I'd suggest reviewing your assessment results to identify which career directions resonate most with you. Then we can dive deeper into those specific paths.";
    }
    
    const nextSteps = recommendation.nextSteps.slice(0, 2);
    
    let content = "Here are some specific next steps to move forward:";
    
    for (let i = 0; i < nextSteps.length; i++) {
      const step = nextSteps[i];
      content += `\n\n${i + 1}. ${step.action} - ${step.reasoning}`;
    }
    
    return content;
  }

  /**
   * Generate a clarifying question.
   */
  private generateClarifyingQuestion(input: MentorInput): string {
    const questions = [
      "What aspect of this feels most important to you right now?",
      "Is there a specific concern or excitement you'd like to explore further?",
      "What would help you feel more confident about this direction?",
      "Are you more interested in understanding the day-to-day reality, or the long-term trajectory?",
    ];
    
    // Select based on conversation history to avoid repetition
    const historyLength = input.conversationHistory.length;
    const questionIndex = historyLength % questions.length;
    
    return questions[questionIndex];
  }

  /**
   * Generate suggested actions.
   */
  private generateSuggestedActions(
    input: MentorInput,
    strategy: ResponseStrategy
  ): string[] {
    const actions: string[] = [];
    const recommendation = input.currentRecommendation;
    
    if (recommendation) {
      // Use recommendation's next steps
      actions.push(...recommendation.nextSteps.slice(0, 2).map(s => s.action));
    } else {
      actions.push('Review your assessment results');
      actions.push('Identify which career directions interest you most');
    }
    
    // Add contextual actions
    if (strategy.type === ResponseType.REALITY_CHECK) {
      actions.push('Talk to someone currently working in this field');
    }
    
    if (strategy.shouldAskClarifyingQuestion) {
      actions.push('Reflect on what matters most to you in a career');
    }
    
    return actions.slice(0, 3);
  }

  /**
   * Update the mentor context after an interaction.
   */
  private updateContext(
    input: MentorInput,
    response: MentorResponse
  ): MentorContext {
    // Create new interaction record
    const newInteraction: MentorInteraction = {
      timestamp: Date.now(),
      studentInput: input.studentInput,
      mentorResponse: response,
      emotionalState: input.emotionalState || EmotionalState.CURIOUS,
    };
    
    // Add to history
    const updatedHistory = [
      ...input.conversationHistory,
      newInteraction,
    ].slice(-this.config.maxHistoryLength);
    
    return {
      studentBelief: input.studentBelief,
      currentRecommendation: input.currentRecommendation,
      interactionHistory: updatedHistory,
      emotionalState: input.emotionalState,
      currentConcern: this.extractConcern(input.studentInput),
    };
  }

  /**
   * Extract insights from the interaction.
   */
  private extractInsights(
    input: MentorInput,
    response: MentorResponse,
    analysis: InputAnalysis
  ): InteractionInsight[] {
    const insights: InteractionInsight[] = [];
    
    // Belief clarification insight
    if (analysis.isClarification) {
      insights.push({
        type: 'BELIEF_CLARIFICATION',
        description: 'Student is seeking to understand their assessment results better',
        confidence: 0.8,
        suggestedAction: 'Provide detailed explanation of recommendation reasoning',
      });
    }
    
    // Emotional signal insight
    if (analysis.emotionalSignals.length > 0) {
      insights.push({
        type: 'EMOTIONAL_SIGNAL',
        description: `Detected emotional signals: ${analysis.emotionalSignals.join(', ')}`,
        confidence: 0.7,
        suggestedAction: 'Adjust tone and provide emotional support',
      });
    }
    
    // Knowledge gap insight
    if (analysis.knowledgeGaps.length > 0) {
      insights.push({
        type: 'KNOWLEDGE_GAP',
        description: `Student has questions about: ${analysis.knowledgeGaps.join(', ')}`,
        confidence: 0.75,
        suggestedAction: 'Provide educational content on these topics',
      });
    }
    
    // Decision readiness insight
    if (analysis.decisionReadiness > 0.8) {
      insights.push({
        type: 'DECISION_READINESS',
        description: 'Student appears ready to take concrete action',
        confidence: analysis.decisionReadiness,
        suggestedAction: 'Provide specific next steps and resources',
      });
    }
    
    return insights;
  }

  /**
   * Determine if conversation should continue.
   */
  private shouldContinueConversation(
    input: MentorInput,
    response: MentorResponse
  ): boolean {
    // Continue if there are suggested actions
    if (response.suggestedActions.length > 0) {
      return true;
    }
    
    // Continue if response asks a question
    if (response.text.includes('?')) {
      return true;
    }
    
    // Don't continue if it's a final guidance response
    if (response.type === ResponseType.GUIDANCE && input.conversationHistory.length > 5) {
      return false;
    }
    
    return true;
  }

  /**
   * Suggest follow-up topics.
   */
  private suggestFollowUpTopics(
    input: MentorInput,
    response: MentorResponse
  ): MentorTopic[] {
    const topics: MentorTopic[] = [];
    
    // Always suggest exploration
    topics.push(MentorTopic.PATH_EXPLORATION);
    
    // Suggest next steps if we have a recommendation
    if (input.currentRecommendation) {
      topics.push(MentorTopic.NEXT_STEPS);
    }
    
    // Suggest regret discussion if concerns exist
    if (input.currentRecommendation && input.currentRecommendation.concerns.length > 0) {
      topics.push(MentorTopic.REGRET_CONCERNS);
    }
    
    // Suggest self-understanding for early conversations
    if (input.conversationHistory.length < 3) {
      topics.push(MentorTopic.SELF_UNDERSTANDING);
    }
    
    return topics.slice(0, 3);
  }

  // Helper methods
  
  private detectTopic(input: string, explicitTopic?: MentorTopic): MentorTopic {
    if (explicitTopic) return explicitTopic;
    
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('why') || lowerInput.includes('explain')) {
      return MentorTopic.RECOMMENDATION_EXPLANATION;
    }
    
    if (lowerInput.includes('regret') || lowerInput.includes('worry') || lowerInput.includes('concern')) {
      return MentorTopic.REGRET_CONCERNS;
    }
    
    if (lowerInput.includes('next') || lowerInput.includes('step') || lowerInput.includes('do')) {
      return MentorTopic.NEXT_STEPS;
    }
    
    if (lowerInput.includes('confident') || lowerInput.includes('sure') || lowerInput.includes('ready')) {
      return MentorTopic.CONFIDENCE_BUILDING;
    }
    
    if (lowerInput.includes('understand') || lowerInput.includes('who am i')) {
      return MentorTopic.SELF_UNDERSTANDING;
    }
    
    return MentorTopic.GENERAL_GUIDANCE;
  }
  
  private detectEmotionalSignals(input: string): string[] {
    const signals: string[] = [];
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('worried') || lowerInput.includes('anxious') || lowerInput.includes('nervous')) {
      signals.push('anxiety');
    }
    
    if (lowerInput.includes('excited') || lowerInput.includes('thrilled') || lowerInput.includes('love')) {
      signals.push('excitement');
    }
    
    if (lowerInput.includes('confused') || lowerInput.includes('lost') || lowerInput.includes('don\'t understand')) {
      signals.push('confusion');
    }
    
    if (lowerInput.includes('frustrated') || lowerInput.includes('annoyed') || lowerInput.includes('stuck')) {
      signals.push('frustration');
    }
    
    return signals;
  }
  
  private detectKnowledgeGaps(input: string, topic: MentorTopic): string[] {
    const gaps: string[] = [];
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('what does') || lowerInput.includes('what is')) {
      gaps.push('role definition');
    }
    
    if (lowerInput.includes('how much') || lowerInput.includes('salary')) {
      gaps.push('compensation expectations');
    }
    
    if (lowerInput.includes('how long') || lowerInput.includes('years')) {
      gaps.push('timeline expectations');
    }
    
    return gaps;
  }
  
  private assessDecisionReadiness(
    history: MentorInteraction[],
    recommendation?: CareerRecommendation
  ): number {
    let readiness = 0.3; // Base readiness
    
    // Increase with conversation depth
    readiness += Math.min(history.length * 0.05, 0.3);
    
    // Increase if we have a recommendation
    if (recommendation) {
      readiness += 0.2;
    }
    
    return Math.min(readiness, 1.0);
  }
  
  private isClarificationRequest(input: string): boolean {
    const lowerInput = input.toLowerCase();
    return lowerInput.includes('?') && 
           (lowerInput.includes('what') || lowerInput.includes('how') || lowerInput.includes('why'));
  }
  
  private isExplorationRequest(input: string): boolean {
    const lowerInput = input.toLowerCase();
    return lowerInput.includes('explore') || 
           lowerInput.includes('tell me about') || 
           lowerInput.includes('learn more');
  }
  
  private extractConcern(input: string): string | undefined {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('worried about')) {
      const match = lowerInput.match(/worried about (.+?)(?:\.|$)/);
      return match?.[1];
    }
    
    if (lowerInput.includes('concerned about')) {
      const match = lowerInput.match(/concerned about (.+?)(?:\.|$)/);
      return match?.[1];
    }
    
    return undefined;
  }
  
  private calculateResponseConfidence(
    input: MentorInput,
    strategy: ResponseStrategy
  ): ConfidenceScore {
    let confidence = 0.7; // Base confidence
    
    // Increase with more context
    if (input.currentRecommendation) {
      confidence += 0.1;
    }
    
    if (input.conversationHistory.length > 0) {
      confidence += 0.05;
    }
    
    // Decrease if emotional (harder to predict needs)
    if (strategy.shouldAcknowledgeEmotion) {
      confidence -= 0.05;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }
}

/**
 * Internal types for input analysis.
 */
interface InputAnalysis {
  detectedTopic: MentorTopic;
  emotionalSignals: string[];
  knowledgeGaps: string[];
  decisionReadiness: number;
  isFollowUp: boolean;
  isClarification: boolean;
  isExploration: boolean;
}

interface ResponseStrategy {
  type: ResponseType;
  tone: string;
  detailLevel: string;
  shouldAskClarifyingQuestion: boolean;
  shouldProvideActionableSteps: boolean;
  shouldAcknowledgeEmotion: boolean;
  shouldValidateUnderstanding: boolean;
}

/**
 * Factory function to create a MentorEngine.
 */
export function createMentorEngine(
  config?: Partial<MentorEngineConfig>
): MentorEngine {
  return new MentorEngine(config);
}

/**
 * Convenience function for single mentor interaction.
 */
export async function getMentorGuidance(
  input: MentorInput,
  config?: Partial<MentorEngineConfig>
): AsyncResult<MentorInteractionResult> {
  const engine = createMentorEngine(config);
  return engine.processInteraction(input);
}
