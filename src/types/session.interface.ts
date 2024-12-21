import { Card } from './card.interface'; // Adjust the path based on your setup

export interface Session {
    id: string; // Unique identifier for the session
    topic: string; // Topic of the session
    cards?: Card[];     // Optional List of cards in the session
    fortune?: string;  // Optional fortune-telling result
}