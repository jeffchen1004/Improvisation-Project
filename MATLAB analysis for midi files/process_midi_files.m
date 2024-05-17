% process_midi_files.m
% file path /Users/jeffchen/Desktop/Janata Lab/Improvisation Project/MATLAB
% test midi/participant.mid
% midifiles = {'path/to/participant1.mid','path/to/aprticipant2.mid'}
% results = process_midi_files(midifiles)
% or
% results = process_midi_files({'path/to/participant1.mid','path/to/aprticipant2.mid'})

% Combining all the functions for MIDI processing



function results = process_midi_files(midifiles)

% Initialize struct to store participant/file names
results = struct();

for idx = 1:length(midifiles)

    single_midifiles = midifiles{idx};

    % Use fileparts [pathstr, basename, ext] Only extract basename
    [~, basename, ~] = fileparts(single_midifiles);

    % Process MIDI file
    nmat = readmidi(single_midifiles);
    % Call group_chords.m 
    [grouped_chords, left_first_beat, left_onset_time] = group_chords(nmat);
    % Call right_melody.m
    [right_hand_events, grouped_notes] = right_melody(nmat, left_onset_time);
    % Call calc_right_ioi.m
    right_ioi = calc_right_ioi(right_hand_events);
    % Call group_right_ioi.m
    grouped_right_ioi = group_right_ioi(right_ioi, grouped_notes);
    % Call calc_dev.m
    deviations = calc_dev(left_onset_time, right_hand_events);

    % Store matrices within a participant
    results.(basename) = struct('grouped_chords', {grouped_chords}, ...
                        'left_first_beat', {left_first_beat}, ...
                        'left_onset_time', {left_onset_time}, ...
                        'right_hand_events', {right_hand_events}, ...
                        'grouped_notes', {grouped_notes}, ...
                        'right_ioi', {right_ioi}, ...
                        'grouped_right_ioi', {grouped_right_ioi}, ...
                        'deviations', {deviations});


end

disp('Complete')
end
