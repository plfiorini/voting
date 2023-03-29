interface Poll {
    id: string;
    question: string;
    options: string[];
    votes?: Vote;
}

type Vote = {
    [key: string]: number;
};

export { Poll, Vote };
