interface Poll {
    id: string;
    question: string;
    options: string[];
    votes?: Map<string, number>;
}

export default Poll;
