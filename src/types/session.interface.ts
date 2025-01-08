import { Card } from './card.interface'; // Adjust the path based on your setup
import { Fortune } from './fortune.interface';

export interface Session {
    id: string; // Unique identifier for the session
    topic: string; // Topic of the session
    cards: Card[];     // List of cards in the session
    fortune: Fortune[];  // fortune-telling result
    fortuneSummary: string; // summary of the fortune-telling result
    openQuestions: { question: string, answer: string }[]; // open questions
}