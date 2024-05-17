% Calculate deviations of left and right

% deviations = calc_dev(left_onset_time, right_hand_events)

function deviations = calc_dev(left_onset_time, right_hand_events)

    right_onset_time = right_hand_events (:,6);

    deviations = zeros(size(right_onset_time));

    for i = 1:length(right_onset_time)
        % Nearest left onset time
        [min_value, min_idx] = min(abs(left_onset_time - right_onset_time(i)));
        deviations(i) = right_onset_time(i) - left_onset_time(min_idx);
    end
end
