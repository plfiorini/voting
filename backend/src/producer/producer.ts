interface IMessage {
    [key: string]: any;
}

interface Producer {
    connect(): Promise<void>;
    disconnect(): Promise<void>;

    isConnnected(): boolean;

    publish(message: IMessage): Promise<void>;
}

export { IMessage, Producer };
