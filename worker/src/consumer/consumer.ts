import Writer from '../writer/writer';

interface Consumer {
    connect(): Promise<void>;
    disconnect(): Promise<void>;

    isConnnected(): boolean;

    consume(writer: Writer): Promise<void>;
}

export default Consumer;
