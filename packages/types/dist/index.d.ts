export interface Profile {
    id: string;
    name: string;
    birthdate: string;
    gender?: string;
    orientation?: string;
    intent: 'open' | 'casual' | 'serious';
    match_mode: 'flow' | 'depth' | 'fate' | 'blend';
    flow_weight: number;
    depth_weight: number;
    bio_prompts: BioPrompt[];
    photos: Photo[];
    location?: GeoPoint;
    city?: string;
    is_verified: boolean;
    trust_score: number;
    subscription_tier: 'free' | 'plus' | 'gold';
    daily_cards_used: number;
    daily_cards_reset_at?: string;
    last_active: string;
    created_at: string;
}
export interface BioPrompt {
    prompt_id: number;
    prompt_text: string;
    answer: string;
}
export interface Photo {
    url: string;
    is_primary: boolean;
    is_verified: boolean;
    order: number;
}
export interface GeoPoint {
    lat: number;
    lng: number;
}
export interface QuizAnswer {
    id: string;
    user_id: string;
    question_id: number;
    question_text: string;
    answer_value: string;
    answer_weight?: number;
    updated_at: string;
}
export interface Action {
    id: string;
    actor_id: string;
    target_id: string;
    action: 'like' | 'pass' | 'superlike';
    engine_source?: 'flow' | 'depth' | 'fate';
    scroll_depth: number;
    time_spent_ms: number;
    created_at: string;
}
export interface Match {
    id: string;
    user_a: string;
    user_b: string;
    matched_at: string;
    compatibility_score: number;
    compatibility_breakdown: CompatibilityBreakdown;
    engine_source: 'flow' | 'depth' | 'fate';
    conversation_started: boolean;
    date_planned: boolean;
    expires_at: string;
}
export interface CompatibilityBreakdown {
    values: number;
    lifestyle: number;
    goals: number;
    personality?: number;
    love_language?: number;
    conflict_style?: number;
    humor?: number;
}
export interface Message {
    id: string;
    match_id: string;
    sender_id: string;
    content: string;
    type: 'text' | 'voice' | 'gif' | 'ai_suggestion';
    sent_at: string;
    read_at?: string;
}
export interface Event {
    id: string;
    title: string;
    description?: string;
    location_name: string;
    location: GeoPoint;
    city: string;
    event_date: string;
    price: number;
    max_attendees: number;
    image_url?: string;
    created_at: string;
}
export interface EventAttendee {
    id: string;
    event_id: string;
    user_id: string;
    status: 'going' | 'maybe' | 'cancelled';
}
export interface Block {
    id: string;
    blocker_id: string;
    blocked_id: string;
    reason?: string;
    created_at: string;
}
export interface DiscoveryStackResponse {
    candidates: DiscoveryCandidate[];
    fate_card?: DiscoveryCandidate;
}
export interface DiscoveryCandidate {
    profile: Profile;
    scores: CandidateScores;
    breakdown: CompatibilityBreakdown;
    engine_source: 'flow' | 'depth' | 'fate';
}
export interface CandidateScores {
    overall: number;
    flow_score?: number;
    depth_score?: number;
}
export interface ActionRequest {
    target_id: string;
    action: 'like' | 'pass' | 'superlike';
    engine_source?: 'flow' | 'depth' | 'fate';
    scroll_depth: number;
    time_spent_ms: number;
}
export interface ConversationAssistRequest {
    match_id: string;
    context_messages: Message[];
}
export interface ConversationAssistResponse {
    openers: string[];
}
export interface ProfileCoachResponse {
    tips: ProfileTip[];
}
export interface ProfileTip {
    area: string;
    issue: string;
    suggestion: string;
}
export interface FateRationaleRequest {
    user_profile: Profile;
    match_profile: Profile;
    diff_dimensions: string[];
}
export interface FateRationaleResponse {
    rationale: string;
}
export interface QuizQuestion {
    id: number;
    question: string;
    category: 'values' | 'lifestyle' | 'goals' | 'personality' | 'love_language' | 'conflict' | 'humor' | 'dealbreakers';
    options: string[];
    weights?: number[];
}
export interface SubscriptionTier {
    id: 'free' | 'plus' | 'gold';
    name: string;
    price: number;
    features: string[];
}
export interface UserPermissions {
    daily_cards_limit: number;
    can_see_who_liked: boolean;
    can_use_blend: boolean;
    can_use_ai_assist: boolean;
    can_boost_profile: boolean;
    can_rewind_swipe: boolean;
    can_read_receipts: boolean;
    can_use_incognito: boolean;
    can_unlimited_fate: boolean;
    can_free_events: boolean;
}
