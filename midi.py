# midi.py
import os
from django.conf import settings
from pyensemble.models import Stimulus, Session
import pdb



def record_midi(request, *args, **kwargs):
    session_id = kwargs['session_id']
    session = Session.objects.get(id=session_id) # or we can do (pk=session_id)
    cache_key = session.experiment.cache_key
    exp_session_info = request.session.get(cache_key, {})
    
    timeline = []

    # Initialize condition if not set
    if 'current_trial' not in exp_session_info:
        exp_session_info['current_trial'] = 1
    else:
        # Move to the next trial
        exp_session_info['current_trial'] += 1

    # Configure metronome settings based on the current trial
    if exp_session_info['current_trial'] == 1:
        # First trial: 30 seconds of metronome
        metronome_beats = 30 * kwargs.get('metronome_bpm', 85) // 60
    elif exp_session_info['current_trial'] == 2:
        # Second trial: 10 metronome beeps
        metronome_beats = 10
    elif exp_session_info['current_trial'] == 3:
        # Third trial: no metronome
        metronome_beats = None

    # Calculates # of beat for continous
    #beats_per_minute = 85 # bpm
    #trial_duration_ms = 30000  # trial duration in milliseconds
    #beats_per_second = beats_per_minute / 60
    #trial_duration_seconds = trial_duration_ms / 1000
    #total_beats = int(beats_per_second * trial_duration_seconds)

    #current_condition = exp_session_info.get('condition', 'metronome throughout')

    #if current_condition == 'metronome throughout':
        #metronome_beats = total_beats
    #elif current_condition == 'metronome beginning':
        #metronome_beats = 10
    #elif current_condition == 'no metronome':
        #metronome_beats = None

    # Set default values for parameters
    #trial_duration = kwargs.get('trial_duration', 30000)  # in ms
    #metronome_bpm = kwargs.get('metronome_bpm', 85)      # beats per minute
    #metronome_delay = kwargs.get('metronome_delay', 3000)  # delay before metronome starts
    
    trial = {
        'type': 'record-midi',
        'click_to_start': False,
        'trial_duration': kwargs.get('trial_duration', 30000),  # in ms
        'metronome_bpm': kwargs.get('metronome_bpm', 85),      # beats per minute
        'metronome_delay': kwargs.get('metronome_delay', 3000),  # delay before metronome starts
        'metronome_beats': metronome_beats
    }
    timeline.append(trial)

    # Save the updated session data
    request.session[cache_key] = exp_session_info


    # Return the timeline with the trial configuration
    return timeline, None


      

