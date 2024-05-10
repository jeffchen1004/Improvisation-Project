import pandas as pd
import numpy as np

# Load the organized MIDI data CSV file
df = pd.read_csv('/Users/jeffchen/Desktop/Janata Lab/Improvisation Project/Extracted data/midi_data.csv')

# Separate Left and Right Hand Notes
left_hand_notes = df[df['MIDI Message'].str.contains("'1': [0-5][0-9]", regex=True)].copy()
right_hand_notes = df[df['MIDI Message'].str.contains("'1': [6-9][0-9]", regex=True)].copy()

# Group Left Hand Notes into Chords
def group_chords(df, time_window=100):
    df = df.sort_values(by='Timestamp')
    chord_groups = []
    current_group = [df.iloc[0]]

    for index, row in df.iloc[1:].iterrows():
        if row['Timestamp'] - current_group[-1]['Timestamp'] <= time_window:
            current_group.append(row)
        else:
            chord_groups.append(current_group)
            current_group = [row]
    chord_groups.append(current_group)

    # Take the earliest timestamp as the chord timestamp
    chords = [{'Chord_Timestamp': group[0]['Timestamp'], 'Notes': len(group), 'Condition': group[0]['Condition'], 'MIDI Events': [note['MIDI Message'] for note in group]} for group in chord_groups]
    return pd.DataFrame(chords)

left_chords = group_chords(left_hand_notes)

# Verify column names for debugging
print(left_chords.columns)

# Calculate Metronome Timestamps (85 BPM)
bpm = 85
beat_interval = 60 / bpm * 1000  # Convert to milliseconds
metronome_timestamps = np.arange(df['Timestamp'].min(), df['Timestamp'].max(), beat_interval)

# Calculate Deviation of Notes from Metronome
def calculate_deviation(notes, metronome_times):
    deviations = []
    for _, note in notes.iterrows():
        closest_metronome = min(metronome_times, key=lambda x: abs(note['Timestamp'] - x))
        deviation = note['Timestamp'] - closest_metronome
        deviation_data = {
            'Timestamp': note['Timestamp'], 
            'Deviation': deviation, 
            'Condition': note['Condition']
        }
        if 'MIDI Events' in note:
            deviation_data['MIDI Events'] = note['MIDI Events']  # Add MIDI events if they exist
        deviations.append(deviation_data)
    return pd.DataFrame(deviations)

# Make sure to use 'Chord_Timestamp' for left_chords
right_deviation = calculate_deviation(right_hand_notes, metronome_timestamps)
left_deviation = calculate_deviation(left_chords.rename(columns={'Chord_Timestamp': 'Timestamp'}), metronome_timestamps)

# Add hand labels
#right_deviation['Hand'] = 'Right'
#left_deviation['Hand'] = 'Left'

# Save Results to CSV
right_deviation.to_csv('/Users/jeffchen/Desktop/Janata Lab/Improvisation Project/Extracted data/right_hand_deviations.csv', index=False)
left_deviation.to_csv('/Users/jeffchen/Desktop/Janata Lab/Improvisation Project/Extracted data/left_hand_chord_deviations.csv', index=False)


