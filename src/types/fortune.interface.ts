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
    THOUGHTFUL = 'Gestures.Thoughtful',
    CLOSE_EYES = 'Gestures.CloseEyes',
    OPEN_EYES = 'Gestures.OpenEyes',
    SMILE_BACK = 'Gestures.SmileBack',
    PROMINENCE = 'Gestures.Prominence',
    USER_SPEECH_START = 'Gestures.UserSpeechStart',
    BROW_UP = 'Gestures.BrowUp',
    LOOK_AROUND = 'Gestures.LookAround',
    TILT_LEFT = 'Gestures.TiltLeft',
    TILT_RIGHT = 'Gestures.TiltRight',
    BLINK = 'Gestures.Blink'
}