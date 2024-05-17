% grouped_right_ioi = group_right_ioi(right_ioi, grouped_notes)


function grouped_right_ioi = group_right_ioi(right_ioi, grouped_notes)
    num_groups = numel(grouped_notes);
    grouped_right_ioi = cell(num_groups, 1);

    start_idx = 1;
    for i = 1:num_groups
        group_length = size(grouped_notes{i}, 1) - 1; % IOI group length is one less than note group length
        end_idx = start_idx + group_length - 1;
        grouped_right_ioi{i} = right_ioi(start_idx:end_idx);
        start_idx = end_idx + 1;
    end
end




