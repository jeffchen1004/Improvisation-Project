// Plugin
// MIDI API and trial details

// The pipeline should be
// 1. Start MIDI Access
// 2. Start Timer at experiment start
// 3. Start Metronome
// 4. Record and collect MIDI and timing data

jsPsych.plugins['record-midi'] = (function() {
    // Empty Javascript object to store info in plugins
    var plugin = {};

    var keyboardListener;
    var display_element;
    var startTime; // Define this globally
    var recordedMIDIData = [];

    // Plugin info; the parameters
    plugin.info = {
        name: 'record-midi', // should match the name of the plugin file
        description: 'Web MIDI API Integration', // not important
        parameters: {     
            prompt: {
                type: jsPsych.plugins.parameterType.HTML_STRING, // The type of the parameter
                default: 'Get Ready! Press Y to start' // Default value of the parameter
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                default: 30000 //ms
            },
            metronome_bpm: {
                type: jsPsych.plugins.parameterType.INT,
                default: 85
            },
            metronome_beats: {
                type: jsPsych.plugins.parameterType.INT,
                default: null // null means play indefinitely
            },
            metronome_condition: {
                type: jsPsych.plugins.parameterType.STRING,
                default: 'throughout',
                options: ['none', 'beginning', 'throughout']
            },
        }
    };

    // Start MIDI Access
    function startMIDIAccess() {
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);
        } else {
            console.log("Web MIDI API not supported in this browser, change to Chrome!");
        }
    }

    // Now it actually checks MIDI input instead of just browser compatibility (I think)
    function onMIDISuccess(midiAccess) {
        console.log("MIDI Access successful! Reached the onMIDISuccess function");
        var inputs = midiAccess.inputs;
        if (inputs.size === 0) {
            console.log("No MIDI inputs available");
        } else {
            var inputValues = inputs.values();
            for (var input = inputValues.next(); input && !input.done; input = inputValues.next()) {
                input.value.onmidimessage = onMIDIMessage;
            }
        }
    }


    function onMIDIFailure() {
        console.log("Cannot access the MIDI device!");
    }


    // Important to have this function to process and collect incoming MIDI data
    function onMIDIMessage(message) {
        console.log("MIDI message received:", message);
        var data = message.data;
        var elapsedTime = performance.now() - startTime; // performance.now is the time right now, so minus the startTime to get the elapsed time

        recordedMIDIData.push({
            midiMessage: data,
            timestamp: elapsedTime
        });

        updateMIDIData({mididata: data, time: elapsedTime});
    }

    // Updates the data collected in the onMIDIMessage function
    function updateMIDIData(data) {
        var midiDataDiv = document.getElementById('midi-data');
        if (midiDataDiv) {
            midiDataDiv.innerHTML = "MIDI Data: " + JSON.stringify(data.mididata) + ", Elapsed Time: " + data.time + "ms";
        }
    }

/*
    // Updates the data collected in the onMIDIMessage function
    function updateMIDIData(data, elapsedTime) {
        var midiDataDiv = document.getElementById('midi-data');
        if (midiDataDiv) {
            midiDataDiv.innerHTML = "MIDI Data: " + JSON.stringify(data) + ", Elapsed Time: " + elapsedTime + "ms";
            // if we want to display the midi-data, we need "<div id="midi-data"></div>" in the HTML file
            //midiDataDiv.innerHTML = "MIDI Data: " + JSON.stringify(data) + 
            //                        " at " + elapsedTime + "ms";
        }
    }; 
*/ 
    
    

    // Start timer function
    function startTimer() {
        startTime = performance.now();
    }


    // Start metronome function here? I think so
    function startMetronome(bpm, numberOfBeats) {
        console.log("startMetronome reached")

        // Create an AudioContext object
        var context = new (window.AudioContext || window.webkitAudioContext)();
    
        // Calculate the delay time between each beat
        var beatInterval = 60 * 1000 / bpm;
    
        // Function to play a beep sound
        var playBeep = function() {
            var osc = context.createOscillator();
            osc.type = 'sine'; // Experiment with different waveforms: sine, square, sawtooth, triangle
    
            osc.connect(context.destination);
            osc.start();
            osc.stop(context.currentTime + 0.1); // The beep lasts for 0.1 seconds
        };
    
        // Start the metronome
        var beatCount = 0;

        var metronomeInterval = setInterval(function() {
            playBeep();
            beatCount++;
            if (numberOfBeats && beatCount >= numberOfBeats) {
                clearInterval(metronomeInterval);
                // DO NOT endTrial HERE
            }
        }, beatInterval);

        return metronomeInterval;
    }


    // After the participant presses Y, the trial starts
    function startTrial(display_element, trial) {
        console.log("Trial Data", trial)
        console.log("startingTrial reached should have metronome and midi input")

        // Start MIDI Access
        startMIDIAccess();

        // Start the timer
        startTimer(); 

        var metronomeInterval;

        // Start the metronome based on the metronome_condition parameter
        switch (trial.metronome_condition) {
            case 'throughout':
                console.log("'throughout metronome' condition reached");
                metronomeInterval = startMetronome(trial.metronome_bpm, trial.metronome_beats);
                break;
            case 'beginning':
                console.log("'beginning metronome' condition reached");
                // Start the metronome, but stop it after a certain number of beats
                metronomeInterval = startMetronome(trial.metronome_bpm, 10); // 10 beats
                break;
            case 'none':
                console.log("'no metronome' condition reached");
                // Don't start the metronome
                break;
        }

        setTimeout(function() {
            endTrial(); // endTrial after the trial duration
            if (metronomeInterval) {
                clearInterval(metronomeInterval); // Stop the metronome if it's still playing
            }
        }, trial.trial_duration);
    };
    

    // Function that jsPsych calls when it's time to run the trial
    // 2 arguments rn, display_element and trial
    plugin.trial = function(de, trial) {
        display_element = de; // Assign the passed display element to the outer variable
        // Sets HTML content of display_element to value of trial.prompt
        // HTML element to display the prompt = object containing the parameters for the current trial
        display_element.innerHTML = trial.prompt;

        // Wait for participants to press y to start
        jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: function(info) {
                console.log("Key pressed:", info.key);
                // Start the trial when 'Y' or 'y' is pressed
                if (info.key === 'y' || info.key === 'Y') {
                    console.log("Starting trial")
                    startTrial(display_element, trial); // have to define this later as a function 
                }
            },
            valid_responses: ['y', 'Y'], // keycodes for 'Y' and 'y'
            rt_method: 'performance', // reation time measured using performace.now()
            persist: false, // whether keyboard should persist after being pressed, False = stop after key press
            allow_held_key: false // don't want this to be true, self explainatory
        });
    };


    // Function to end the trial
    function endTrial() {
    
        // clear keyboard response
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
    
        // save data
        var trial_data = {
            midi_data: recordedMIDIData // Add the MIDI data
        };
    
        display_element.innerHTML = '';
    
        // next trial
        jsPsych.finishTrial(trial_data);

        // Save data (did not work, messed the metronome up)
        // jsPsych.data.get().localSave('data.csv', 'csv');
    }

    return plugin;
})();

        
