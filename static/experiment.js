var metronomeInterval;
    let startTime;

    function startMetronome(bpm, numberOfBeats) {
        var context = new (window.AudioContext || window.webkitAudioContext)();

        // Calculate the delay time between each beat
        var delay = 60 / bpm * 1000;

        // Schedule a short beep on every beat
        var scheduleBeep = function(time) {
            var osc = context.createOscillator();
            osc.type = 'sine'; // Eperiment with different waveforms: sine, square, sawtooth, triangle

            osc.connect(context.destination);
            osc.start(time);
            osc.stop(context.currentTime + 0.1); // The beep lasts for 0.1 seconds
        };

        if (numberOfBeats && numberOfBeats > 0) {
            metronomeInterval = setInterval(scheduleBeep, delay);
            setTimeout(function() {
                clearInterval(metronomeInterval);
            }, numberOfBeats * delay);
        } else {
            metronomeInterval = setInterval(scheduleBeep, delay);
        }

        startTime = performance.now();
    }


    // Web MIDI API Integration
    let midiData=[];

    function handleMIDIMessage(message) {
        console.log("MIDI message received:", message);
        midiData.push(message.data);

        var midiDataDiv = document.getElementById('midi-data');
        if (midiDataDiv) {
            midiDataDiv.innerHTML = "MIDI Data: " + JSON.stringify(message.data);
        }

        let currentTime = performance.now();

        // Calculate the relative timing
        let relativeTime = currentTime - startTime;

        // Calculate the position of the note relative to the beat
        let beatLength = 60 * 1000 / bpm; // in milliseconds for one beat
        let beatPosition = (relativeTime / beatLength) % 4; // for 4/4 time signature

        console.log("Relative Time:", relativeTime, "Beat Position:", beatPosition);

    };


    console.log("Starting Web MIDI API Integration")



    function requestMIDIAccess() {
        //If MIDI avaliable
        if (navigator.requestMIDIAccess) {
            // sysex is a security measure to ensure web page can't send arbitrary data to MIDI without user's permission
            // If Promise resolved = onMIDISuccess
            navigator.requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);
        } else {
            console.warn("Web MIDI API not supported in this browser");
        }
    };



    // Handle successful MIDI connection
    function onMIDISuccess(midiAccess) {
        console.log("MIDI Access Success");
        var inputs = midiAccess.inputs.values();
        // Connecting to MIDI device and getting the value
        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            input.value.onmidimessage = handleMIDIMessage;
        }
    };


    // Handle Failed MIDI connection
    function onMIDIFailure() {
        console.warn("MIDI Access Failed");
    };


    function updateMidiData(message) {
        var midiDataDiv = document.getElementById('midi-data');
        if (midiDataDiv) {
            midiDataDiv.innerHTML = "MIDI Data: " + JSON.stringify(message.data);
        }
    }

    

    // Timer 

    var timerInterval;

    function startCountUpTimer(elementId) {
        var timerElement = document.getElementById(elementId);
        console.log("Timer element:", timerElement);
        var seconds = 0;

        timerInterval = setInterval(function() {
            seconds++;
            timerElement.innerHTML = seconds;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }



    // All outputs from above are proccessed here
    // Initialize MIDI Access Request
    requestMIDIAccess();

    //JsPsych

    var jsPsych = initJsPsych({  
        use_webaudio: false,
        on_finish: function(){
            jsPsych.data.displayData();
        }
    });

    // Warm-Up

    var condition0Choice = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: 'Warm up. Get ready!',
        choices: ['f', 'c'],
        prompt: "<p>Press C = Key of C<br>Press F = Key of F</p>",
        
        on_start: function() {
            console.log('Condition 0 Key Choice');
            midiData = [];
            requestMIDIAccess();
        
        },
        on_finish: function(data) {
            data.condition = 'Condition 0 Key Choice';
            data.midiData = midiData;
            console.log(data);
        }
    };


    var condition0Trial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: 'Warm Up!',
        choices: "ALL_KEYS",
        prompt: "<p>V-I</p>",
        trial_duration: 30000, // unit is ms, 30 sec
        on_start: function() {
            console.log('Condition 0 started');
            midiData = [];
            requestMIDIAccess();

            // Start metronome
            setTimeout(function() {
                startMetronome(85);
            }, 3000) // 3 sec delay for countdown


            // Start timer
            startCountUpTimer('timer');

        },

        on_finish: function(data) {
            data.condition = 'Condition 0 Play';
            data.midiData = midiData;
            console.log(data);
            clearInterval(metronomeInterval); // Stop the metronome here
            stopTimer(); // Stop timer
        }
    };



    // Condition 1

    var condition1Choice = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: 'Condition 1: Metronome guidance throughout',
        choices: ['f', 'c'],
        prompt: "<p>Press C = Key of C<br>Press F = Key of F</p>",
        
        on_start: function() {
            console.log('Condition 1 Key Choice');
            midiData = [];
            requestMIDIAccess();
        },
        on_finish: function(data) {
            data.condition = 'Condition 1 Key Choice';
            data.midiData = midiData;
            console.log(data);
        }
    };


    var condition1Trial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: 'Condition 1: Metronome guidance throughout',
        choices: "ALL_KEYS",
        prompt: "<p>V-I</p>",
        trial_duration: 30000, // unit is ms, 30 sec
        on_start: function() {
            console.log('Condition 1 started')
            midiData = [];
            requestMIDIAccess();

            // Start metronome after the timer countdown
            setTimeout(function() {
                startMetronome(85);
            }, 3000) // 3 sec delay for countdown
        },

        on_finish: function(data) {
            data.condition = 'Condition 1 Play';
            data.midiData = midiData;
            console.log(data);
            clearInterval(metronomeInterval); // Stop the metronome here
        }
    };


    // Condition 2

    var condition2Choice = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: 'Condition 2: Metronome guidance in the beginning',
        choices: ['f', 'c'],
        prompt: "<p>Press C = Key of C<br>Press F = Key of F</p>",
        
        on_start: function() {
            console.log('Condition 2 Key Choice')
            midiData = [];
            requestMIDIAccess();
        },
        on_finish: function(data) {
            data.condition = 'Condition 2 Key Choice';
            data.midiData = midiData;
            console.log(data);
        }
    };

    var condition2Trial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: 'Condition 2: Metronome guidance in the beginning',
        choices: "ALL_KEY",
        prompt: "<p>V-I</p>",
        trial_duration: 30000, // unit is ms, 30 sec
        on_start: function() {
            console.log('Condition 2 started')
            midiData = [];
            requestMIDIAccess();

            setTimeout(function() {
                startMetronome(85, 10);
            }, 3000) // 3 sec delay for countdown
        },
        on_finish: function(data) {
            data.condition = 'Condition 2 Play';
            data.midiData = midiData;
            console.log(data);
            clearInterval(metronomeInterval); // Stop the metronome here
        }
    };


    // Condition 3

    var condition3Choice = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: 'Condition 3: No Metronome guidance',
        choices: ['f', 'c'],
        prompt: "<p>Press C = Key of C<br>Press F = Key of F</p>",
        
        on_start: function() {
            console.log('Condition 3 Key Choice')
            midiData = [];
            requestMIDIAccess();
        },
        on_finish: function(data) {
            data.condition = 'Condition 3 Key Choice';
            data.midiData = midiData;
            console.log(data);
        }
    };

    var condition3Trial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: 'Condition 3: No Metronome guidance',
        choices: "ALL_KEY",
        prompt: "<p>V-I</p>",
        trial_duration: 30000, // unit is ms, 30 sec
        on_start: function() {
            console.log('Condition 3 started')
            midiData = [];
            requestMIDIAccess();
            // No metronome
            
        },
        on_finish: function(data) {
            data.condition = 'Condition 3 Play';
            data.midiData = midiData;
            console.log(data);
            
        }
    };



    var timeline = [condition0Choice, condition0Trial, condition1Choice, condition1Trial, condition2Choice, condition2Trial, condition3Choice, condition3Trial];


        

    function startExperiment() {
        document.getElementById('start-btn').style.display = 'none';
        
    // Running the experiment
        jsPsych.run(timeline); // Updated
    };




            
        

