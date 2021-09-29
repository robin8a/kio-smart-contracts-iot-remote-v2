export interface UtilInterface {
    isOnMessagesUUID(pUUID: string): Promise<boolean>;
    writeMessagesUUID(pUUID: string):  Promise<string>;
}