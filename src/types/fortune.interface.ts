import { Card } from "./card.interface";

export interface Fortune {
    content: string;
    card?: Card;
    gestures?: Gesture;
}

export enum Gesture {
    SMILE = 'Gestures.Smile',
    BIG_SMILE = 'Gestures.BigSmile',
    EXPRESS_FEAR = 'Gestures.ExpressFear',
    WINK = 'Gestures.Wink',
    NOD = 'Gestures.Nod',
    SHAKE = 'Gestures.Shake',
    SURPRISE = 'Gestures.Surprise',
    BROW_RAISE = 'Gestures.BrowRaise',
    BROW_FROWN = 'Gestures.BrowFrown',
    THOUGHTFUL = 'Gestures.Thoughtful'
}