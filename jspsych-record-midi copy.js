jsPsych.plugins['record-midi'] = (function() {

    var plugin = {};

    plugin.info = {
        name: 'record-midi',
        description: 'Web MIDI API Integration',
        parameters: {
            /* stimulus: {
                type: jsPsych.plugins.parameterType.AUDIO,
                default: undefined
            }, */
            click_to_start: {
                type: jsPsych.plugins.parameterType.BOOL,
                default: true
            },
            prompt: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                default: ''
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                default: 3000
            },
            metronome_bpm: {
                type: jsPsych.plugins.parameterType.INT,
                default: 85
            },
            metronome_delay: {
                type: jsPsych.plugins.parameterType.INT,
                default: 3000
            },
            metronome_beats: {
                type: jsPsych.plugins.parameterType.INT,
                default: null
            },
        }
    };

    // Function to start the metronome
    plugin.startMetronome = function(bpm, numberOfBeats, startDelay) {
        var context = new (window.AudioContext || window.webkitAudioContext)();

        // Calculate the delay time between each beat
        var beatInterval = 60 / bpm * 1000;

        // Function to play a beep sound
        var playBeep = function() {
            var osc = context.createOscillator();
            osc.type = 'sine'; // Experiment with different waveforms: sine, square, sawtooth, triangle

            osc.connect(context.destination);
            osc.start();
            osc.stop(context.currentTime + 0.1); // The beep lasts for 0.1 seconds
        };

        // Start the metronome after the specified start delay
        setTimeout(function() {
            plugin.metronomeInterval = setInterval(function() {
                playBeep();

                if (numberOfBeats) {
                    numberOfBeats--;
                    if (numberOfBeats <= 0) {
                        clearInterval(plugin.metronomeInterval);
                    }
                }
            }, beatInterval);
        }, startDelay);
    };


    plugin.trial = function (display_element, trial) {
        // Web MIDI API Integration
        let startTime; // This will hold the start time of recording
        let midiData = []; // For MIDI Data
        let metronomeInterval; // Storing metronome interval function

        function handleMIDIMessage(message) {
            let currentTime = performance.now();
            if (!startTime) { // Set startTime on the first MIDI message
                startTime = currentTime;
            }
            let elapsedTime = currentTime - startTime; // Time since start of trial

            midiData.push({
                data: message.data,
                timestamp: elapsedTime
            });
            // Start the metronome based on trial parameters
            if (trial.useMetronome) {
                plugin.startMetronome(trial.metronome_bpm, trial.metronome_beats, trial.metronome_delay);
            }

            updateMidiData(message.data, elapsedTime);
        }

        // Function to update the display of MIDI data
        function updateMidiData(data, elapsedTime) {
            var midiDataDiv = document.getElementById('midi-data');
            if (midiDataDiv) {
                midiDataDiv.innerHTML = "MIDI Data: " + JSON.stringify(data) + 
                                        " at " + elapsedTime + "ms";
            }
        }

        // Function to start the metronome
        function startMetronome(bpm, beats) {
            let beatLength = 60 * 1000 / bpm;
            let beatCount = 0;
            metronomeInterval = setInterval(function() {
                console.log("Metronome tick");
                beatCount++;
                if (beats && beatCount >= beats) {
                    clearInterval(metronomeInterval);
                }
            }, beatLength);
        }

        // Function to request MIDI access
        function requestMIDIAccess() {
            if (navigator.requestMIDIAccess) {
                navigator.requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);
            } else {
                console.warn("Web MIDI API not supported in this browser");
            }
        }

        // Function to handle successful MIDI connection
        function onMIDISuccess(midiAccess) {
            console.log("MIDI Access Success");
            var inputs = midiAccess.inputs.values();
            for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
                input.value.onmidimessage = handleMIDIMessage;
            }
        }

        // Function to handle failed MIDI connection
        function onMIDIFailure() {
            console.warn("MIDI Access Failed");
        }

        // Display the prompt if it exists
        if (trial.prompt) {
            display_element.innerHTML = trial.prompt;
        }

        // Function to start the trial
        function startTrial() {
            startTime = performance.now(); // Set the start time for the trial

            // Start the metronome after the specified delay
            setTimeout(function() {
                startMetronome(trial.metronome_bpm, trial.metronome_beats);
            }, trial.metronome_delay);

            // Request MIDI Access
            requestMIDIAccess();

            // End the trial after trial_duration
            setTimeout(function() {
                endTrial();
            }, trial.trial_duration);
        }

        // Function to end the trial
        function endTrial() {
            clearInterval(metronomeInterval); // Stop the metronome
            // Gather data and finish the trial
            jsPsych.finishTrial({
                midiData: midiData
            });
        }

        // Handle the click_to_start logic
        if (trial.click_to_start) {
            var startButton = document.createElement('button');
            startButton.id = 'start_button';
            startButton.innerHTML = 'Start';
            display_element.appendChild(startButton);

            startButton.addEventListener('click', function() {
                startButton.style.display = 'none';
                startTrial();
            });
        } else {
            startTrial();
        }
    };

    return plugin;
})();
