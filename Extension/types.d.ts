export type BiasRating = "Left" | "Lean Left" | "Center" | "Lean Right" | "Right" | "Mixed" | "Not Rated";

export interface Publication {
    source_name: string;
    source_type: string;
    media_bias_rating: BiasRating;
    source_url: string;
    allsides_url: string;
}

export interface NewsSource {
    publication: Publication;
}

export interface AllSidesDataFeed {
    allsides_media_bias_ratings: NewsSource[];
}

interface RequestSourceMessage {
    type: 'requestSource';
}

interface RequestContextMessage {
    type: 'requestContext';
}

export type Message
    = RequestSourceMessage
    | RequestContextMessage
    ;


export interface RequestSourceResponse {
    type: 'requestSource';
    source?: NewsSource;
}

export interface RequestContextResponse {
    type: 'requestContext';
    firstParagraph?: string;
    confidence?: string;
}

export type Response
    = RequestSourceResponse
    | RequestContextResponse
    ;