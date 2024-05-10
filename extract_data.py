# extract_data.py
import os
import sys
import json
import pandas as pd

# Ensure the 'pyensemble' directory is in the Python path
sys.path.append('/Users/jeffchen/git/pyensemble')

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pyensemble.settings.settings')

# Initialize Django
import django
django.setup()

from pyensemble.models import Response

# Fetch the last three responses for the 'MIDI test' experiment
responses = Response.objects.filter(experiment__title='MIDI test').order_by('-id')[:3]
responses = list(responses)[::-1]

# Initialize an empty list to store all MIDI data
all_midi_data = []

# Extract MIDI data from each response
for i, response in enumerate(responses):
    response_data = json.loads(response.jspsych_data)
    print(f"Response {i + 1}:")
    print(response.jspsych_data)
    print("\n")
    
    # Assuming 'midi_data' is always present in each response's jspsych_data
    midi_data = response_data[0]['midi_data']
    
    # Add a column indicating the condition based on the response index
    condition = ''
    if i == 0:
        condition = 'Metronome Throughout'
    elif i == 1:
        condition = 'Metronome Beginning Only'
    else:
        condition = 'No Metronome'
    
    # Append the condition to each MIDI message
    for midi_message in midi_data:
        midi_message['condition'] = condition
        all_midi_data.append(midi_message)

# Convert the collected MIDI data into a DataFrame
df = pd.DataFrame(all_midi_data)

# Rename columns for clarity
df.rename(columns={
    'midiMessage': 'MIDI Message',
    'timestamp': 'Timestamp',
    'condition': 'Condition'
}, inplace=True)

# Save the DataFrame to a CSV file
output_path = '/Users/jeffchen/Desktop/Janata Lab/Improvisation Project/Extracted Data/midi_data.csv'
df.to_csv(output_path, index=False)

print(f"MIDI data extracted and saved to '{output_path}'")
