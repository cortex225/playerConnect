export interface Message {
    id: string;
    content: string;
    userId: string;
    userName: string;
    userPhotoURL?: string;
    timestamp: any; // FirebaseTimestamp
}