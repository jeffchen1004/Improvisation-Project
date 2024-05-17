% [right_hand_events, grouped_notes] = right_melody(nmat, left_onset_time)

function [right_hand_events, grouped_notes] = right_melody(nmat, left_onset_time, custom_params)

default_params = struct( ...
    'MIDI_NOTE_NUMBER_COL', 4, ...
    'MIN_RGT_HND_NOTE_NUM', 60, ...
    'ONSET_BEAT_COL', 1, ...
    'ONSET_TIME_COL', 6 ...
);



if nargin < 3
    params = default_params;
else
    params = mergeStructs(default_params, custom_params);
end

MIDI_NOTE_NUMBER_COL = params.MIDI_NOTE_NUMBER_COL;
MIN_RGT_HND_NOTE_NUM = params.MIN_RGT_HND_NOTE_NUM;
ONSET_BEAT_COL = params.ONSET_BEAT_COL;
ONSET_TIME_COL = params.ONSET_TIME_COL;

% Create logical mask where 20 <= pitch value < 60 is true(1)
% Can vary based on MIDI setting 
right_hand_note_mask = (nmat (:,MIDI_NOTE_NUMBER_COL) >= MIN_RGT_HND_NOTE_NUM);

% Eliminate unwanted pitch values in nmat
right_hand_events = nmat(right_hand_note_mask,:);




pianoroll(right_hand_events,'name','sec','vel')

% or

% pitch = right_hand_events(:, MIDI_NOTE_NUMBER_COL); 
% onset_beat = right_hand_events(:, ONSET_BEAT_COL);
% plot(onset_beat, pitch); 
% xlabel('Onset Beat');
% ylabel('Pitch');
% title('Pitch vs. Onset(Beat) for Right Hand');


% Initialize cell array to store the grouped right hand notes
grouped_notes = cell(length(left_onset_time) - 1, 1);

% Loop through the chord start times to create the groups
for i = 1:length(left_onset_time) - 1
    start_time = left_onset_time(i);
    end_time = left_onset_time(i+1);
    
    % Find the indices of right hand notes within the current time range
    note_index = right_hand_events(:, ONSET_TIME_COL) >= start_time & right_hand_events(:, ONSET_TIME_COL) < end_time;
    
    % Store the corresponding notes in the cell array
    grouped_notes{i} = right_hand_events(note_index, :);


end

% For customized params
function result = mergeStructs(default_params, custom_params)
    result = default_params;
    fields = fieldnames(custom_params);
    for i = 1:numel(fields)
        if isfield(default_params, fields{i})
            result.(fields{i}) = custom_params.(fields{i});
        else
            error(['Invalid parameter "' fields{i} '"'])
        end
    end

end

end
   
 




