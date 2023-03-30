import axios, { AxiosResponse } from 'axios';
import { Poll } from './model';

class PollClient {
    private readonly baseUrl: string;
    private readonly apiUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.apiUrl = `${baseUrl}/polls`;
    }

    async getPolls(): Promise<AxiosResponse<Poll[]>> {
        const url = `${this.apiUrl}`;
        return axios.get<Poll[]>(url);
    }

    async getPollById(id: string): Promise<AxiosResponse<Poll>> {
        if (id) {
            const url = `${this.apiUrl}/${id}`;
            return axios.get<Poll>(url);
        } else {
            throw new Error('No id provided');
        }
    }

    async createPoll(poll: Poll): Promise<AxiosResponse<Poll>> {
        if (poll) {
            const url = `${this.apiUrl}`;
            return axios.post<Poll>(url, poll);
        } else {
            throw new Error('No poll provided');
        }
    }

    async updatePoll(id: string, poll: Poll): Promise<AxiosResponse<Poll>> {
        if (id && poll) {
            const url = `${this.apiUrl}/${id}`;
            return axios.put<Poll>(url, poll);
        } else {
            throw new Error('No id or poll provided');
        }
    }

    async deletePoll(id: string): Promise<AxiosResponse<void>> {
        if (id) {
            const url = `${this.apiUrl}/${id}`;
            return axios.delete<void>(url);
        } else {
            throw new Error('No id provided');
        }
    }

    async votePoll(id: string, option: string): Promise<AxiosResponse<Poll>> {
        if (id && option) {
            const url = `${this.apiUrl}/${id}/vote`;
            return axios.post<Poll>(url, { option });
        } else {
            const url = `${this.apiUrl}/${id}/vote`;
            return axios.post<Poll>(url, { option });
        }
    }
}

export default PollClient;
