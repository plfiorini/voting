#!/usr/bin/env python3

import requests

response = requests.post('http://localhost:8080/vote', {'vote': 'x'})
status = response.status_code
json = response.json()
print(f'Status: {status}')
print(f'JSON: {json}')
