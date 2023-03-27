#!/usr/bin/env python3

import requests

base_url = 'http://localhost:8080'
polls_url = f'{base_url}/polls'

poll_questions = {
    "What is your favorite color?": ["Red", "Blue", "Green", "Yellow", "Other"],
    "How often do you exercise?": ["Every day", "A few times a week", "Once a week", "Less than once a week", "Never"],
    "What is your favorite food?": ["Pizza", "Sushi", "Burgers", "Tacos", "Other"],
    "How many hours of sleep do you get per night?": ["8 or more hours", "6-8 hours", "4-6 hours", "Less than 4 hours", "It varies"],
    "What is your favorite hobby?": ["Reading", "Playing sports", "Watching movies/TV shows", "Traveling", "Other"],
    "What is your favorite type of music?": ["Rock", "Pop", "Hip hop", "Country", "Other"],
    "How do you prefer to spend your weekends?": ["Relaxing at home", "Hanging out with friends", "Exploring new places", "Doing outdoor activities", "Other"],
    "What is your favorite season?": ["Spring", "Summer", "Fall", "Winter", "Other"],
    "What is your favorite movie genre?": ["Action", "Comedy", "Drama", "Sci-fi", "Other"],
    "What is your favorite type of pet?": ["Dog", "Cat", "Fish", "Bird", "Other"]
}

def print_response(what, response):
    print(f'=== {what}')
    status = response.status_code
    print(f'Status: {status}')
    if status < 400:
        json = response.json()
        print(f'JSON: {json}')
    print('\n')

# Delete all
response = requests.delete(polls_url)
print_response('Delete All', response)

# Insert
for question, options in poll_questions.items():
    response = requests.post(polls_url, {'question': question, 'options': options})
    print_response(f'Insert "{question}"', response)

# List
response = requests.get(polls_url)
print_response('List', response)
first_id = response.json()[0]['id']

# Get
response = requests.get(f'{polls_url}/{first_id}')
print_response('Get', response)

# Update
response = requests.put(f'{polls_url}/{first_id}', {'question': 'TEST', 'options': ['TEST1', 'TEST2', 'TEST3']})
print_response('Update', response)

# List
response = requests.get(polls_url)
print_response('List', response)
first_id = response.json()[0]['id']

# Delete
response = requests.delete(f'{polls_url}/{first_id}')
print_response('Delete', response)

# Get
response = requests.get(f'{polls_url}/{first_id}')
print_response('Get', response)
