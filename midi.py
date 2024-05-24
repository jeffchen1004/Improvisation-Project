# midi.py
# Pyensemble integration
import random # randomization
from django.conf import settings
from pyensemble.models import Session

# creates a timeline with trials having different 'metronome_condition'
def midi_timeline(request, *args, **kwargs):
    timeline = []
    session_id = kwargs['session_id']
    session = Session.objects.get(id=session_id)
    cache_key = session.experiment.cache_key
    exp_session_info = request.session.get(cache_key, {})

    # Warm-up Phase
    timeline += warmup_phase()

    # Experimental Phase
    # Left -> Right -> Both, repeated three times / three loops
    # Don't need values so use "_"
    for _ in range(3):
        # add trials to timeline
        timeline += randomized_phase('left', 1) # ('hand condition', repetitions = each loop has one of these)
        timeline += randomized_phase('right', 1)
        timeline += randomized_phase('both', 1)

    exp_session_info['timeline'] = timeline
    request.session[cache_key] = exp_session_info

    return timeline

# warmup phase with a fixed order of conditions
def warmup_phase():
    # defines the conditions for the warmup phase
    warmup_conditions = [
        {'metronome_condition': 'throughout'},
        {'metronome_condition': 'beginning'},
        {'metronome_condition': 'none'}
    ]
    # repeat the warmup_conditions twice
    return create_trials(warmup_conditions * 2, 'warmup')

def randomized_phase(hand, repetitions):
    conditions = [
        {'metronome_condition': 'throughout'},
        {'metronome_condition': 'beginning'},
        {'metronome_condition': 'none'}
    ]
    # Initialize an empty list to store randomized trials
    randomized_trials = []

    # Loop for the specified number of repetitions
    for _ in range(repetitions):
        random.shuffle(conditions) # randomly shuffle the conditions
        while conditions: # continue until conditions is empty
            condition = conditions.pop()  # Remove and return the last condition
            randomized_trials += create_trials([condition], hand) # Create trials with the current condition and add them to the randomized_trials list
    return randomized_trials

# Create trials based on the given conditions in warm_up_phase and randomized_phase for the midi_timeline
# Generates a complete list of trials at the start of the experiment
def create_trials(conditions, hand):
    trials = []
    for trial_num, condition in enumerate(conditions, start=1): 
        # trial number starts from 1 cuz we are randomizing it; part of enumerate
        metronome_beats = None  # Default value for 'throughout,' 'null'
        if condition['metronome_condition'] == 'beginning':
            metronome_beats = 10  # Number of beats for 'beginning' condition

        trial = {
            'type': 'record-midi',
            'prompt': 'Get Ready! Press Y to continue. Hand: {}. Condition: {}'.format(hand, trial_num),
            'click_to_start': True,
            'trial_duration': 30000,  # in ms
            'metronome_bpm': 85,      # beats per minute
            'metronome_delay': 3000,  # delay before metronome starts
            'metronome_beats': metronome_beats,
            'metronome_condition': condition['metronome_condition'] # store the condition here instead of the plugin
        }
        trials.append(trial)
    return trials

# Record MIDI data for the given trial
# fetches the next trial from the pre generated timeline and updates the current trial number
# then trial data fetched is passed to the jsPsych plugin to be executed
# Handle recording MIDI for the current trial
def record_midi(request, hand, *args, **kwargs):
    session_id = kwargs['session_id']
    session = Session.objects.get(id=session_id)
    cache_key = session.experiment.cache_key
    exp_session_info = request.session.get(cache_key, {})

    if 'current_trial' not in exp_session_info:
        exp_session_info['current_trial'] = 1
    else:
        exp_session_info['current_trial'] += 1

    current_trial = exp_session_info['current_trial'] - 1  # Adjust for 0-index
    timeline = exp_session_info.get('timeline', [])
    
    if current_trial < len(timeline):
        trial = timeline[current_trial]
    else:
        trial = None  # Handle case where all trials are completed

    return trial, None


