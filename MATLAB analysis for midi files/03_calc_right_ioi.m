% [right_ioi] = calc_right_ioi(right_hand_events)

function [right_ioi] = calc_right_ioi(right_hand_events, custom_params)


% Some parameters are unused
default_params = struct( ...
    'MIDI_NOTE_NUMBER_COL', 4, ...
    'MIN_SEPARATION_BEATS', 0.5, ...
    'MAX_LFT_HND_NOTE_NUM', 60, ...
    'ONSET_BEAT_COL', 1, ...
    'ONSET_TIME_COL', 6 ...
);
     

if nargin < 2
    params = default_params;
else
    params = mergeStructs(default_params, custom_params);
end


ONSET_TIME_COL = params.ONSET_TIME_COL;

    % Extract the onset times from the sixth column of right_hand_events
    onsetTimes = right_hand_events(:, ONSET_TIME_COL);

    % Calculate the inter-onset intervals (IOIs) in seconds
    deltaTimes = diff(onsetTimes);
    

    % Return the IOIs
    right_ioi = deltaTimes;
end

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





