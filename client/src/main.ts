import { AxiosResponse } from 'axios';
import { Poll, PollClient } from './polls';

const pollClient = new PollClient('http://localhost:8080');

const pollQuestions: Record<string, string[]> = {
    'What is your favorite color?': ['Red', 'Blue', 'Green', 'Yellow', 'Other'],
    'How often do you exercise?': ['Every day', 'A few times a week', 'Once a week', 'Less than once a week', 'Never'],
    'What is your favorite food?': ['Pizza', 'Sushi', 'Burgers', 'Tacos', 'Other'],
    'How many hours of sleep do you get per night?': ['8 or more hours', '6-8 hours', '4-6 hours', 'Less than 4 hours', 'It varies'],
    'What is your favorite hobby?': ['Reading', 'Playing sports', 'Watching movies/TV shows', 'Traveling', 'Other'],
    'What is your favorite type of music?': ['Rock', 'Pop', 'Hip hop', 'Country', 'Other'],
    'How do you prefer to spend your weekends?': ['Relaxing at home', 'Hanging out with friends', 'Exploring new places', 'Doing outdoor activities', 'Other'],
    'What is your favorite season?': ['Spring', 'Summer', 'Fall', 'Winter', 'Other'],
    'What is your favorite movie genre?': ['Action', 'Comedy', 'Drama', 'Sci-fi', 'Other'],
    'What is your favorite type of pet?': ['Dog', 'Cat', 'Fish', 'Bird', 'Other']
};

let polls: Poll[] = Object.entries(pollQuestions).map(([question, options]) => ({
    question,
    options
}));

async function run() {
    // Delete all polls
    await pollClient.getPolls().then((response: AxiosResponse<Poll[]>) => {
        response.data.forEach(async (poll) => {
            await pollClient.deletePoll(poll.id!).then((response: AxiosResponse<void>) => {
                console.info(`== Deleted poll: ${poll.id}`);
                console.log(response.data);
            });
        });
    });

    // Create polls
    await polls.forEach(async (poll) => {
        await pollClient.createPoll(poll).then((response: AxiosResponse<Poll>) => {
            console.info(`== Created poll: ${poll.question}`);
            console.log(response.data);
        });
    });

    // List polls
    await pollClient.getPolls().then((response: AxiosResponse<Poll[]>) => {
        console.info('== All polls');
        console.log(response.data);
        polls = response.data as Poll[];
    });

    // Get a specific poll (pick a random one)
    const randomPollIndex = Math.floor(Math.random() * polls.length);
    const randomPoll = polls[randomPollIndex];
    console.info(`== Random poll: ${randomPoll.question} (ID: ${randomPoll.id})`);
    await pollClient.getPollById(randomPoll.id!).then((response: AxiosResponse<Poll>) => {
        console.info(`== Poll: ${randomPoll.question}`);
        console.log(response.data);
    });

    // Update the random poll changing the question and the options
    const updatedPoll = {
        ...randomPoll,
        question: 'TEST?',
        options: ['TEST1', 'TEST2', 'TEST3', 'TEST4'],
    };
    await pollClient.updatePoll(randomPoll.id!, updatedPoll).then((response: AxiosResponse<Poll>) => {
        console.info(`== Updated poll: ${randomPoll.question}`);
        console.log(response.data);
    });

    // Now delete that poll
    await pollClient.deletePoll(randomPoll.id!).then((response: AxiosResponse<void>) => {
        console.info(`== Deleted poll: ${randomPoll.id}`);
        console.log(response.data);
    });

    // Vote
    await pollClient.votePoll(randomPoll.id!, randomPoll.options[0]).then((response: AxiosResponse<Poll>) => {
        console.info(`== Voted for poll: ${randomPoll.question}`);
        console.log(response.data);
    });
}

try {
    run();
} catch (error) {
    process.exit(1);
}
