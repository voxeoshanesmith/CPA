/**
* Required variables that must be submitted with API call.
*/
// numberToCall - the number to make the outbound call to.
// initialMessage - an initial message to play to the called party while CPA detection takes place.
// initialMessageType - text to be rendered using TTS or an audio file URL (tts / audio)

var message = 'This is a test of the Vokseo CPA logic. Pleas remain on the line while I determine what you are. If this were an actual call, you would be hearing something more interesting right now. This is a test. This is a test.This is a test of the Vokseo CPA logic. Pleas remain on the line while I determine what you are. If this were an actual call, you would be hearing something more interesting right now. This is a test. This is a test.';
var initialCallerMessage = typeof (initialMessage) == 'undefined' ? message : initialMessage;
var initialCallerMessageType = typeof (initialMessageType) == 'undefined' ? 'tts' : initialMessageType;

/**
* Optional variables that can be submitted with API call.
*/
// voice - the TTS voice to use when playing the initial message: Victor (male), or Vanessa (female).
// callerID - the caller ID to use on the outbound call attempt.
// maxTime - The maximum time for initial voice activity used to detect
// voicemail or answering machine messages.
// maxSilence - The maximum amount of silence used to detect the end of voice activity.
// runTime - The maximum runtime for CPA.

var ttsVoice = typeof(voice) == 'undefined' ? 'Allison' : voice;
var outboundCallerID = typeof (callerID) == 'undefined' ? '13971234567' : callerID;
var cpaMaxSilence = typeof (maxSilence) == 'undefined' ? '900' : maxSilence;
var cpaMaxTime = typeof (maxTime) == 'undefined' ? '6000' : maxTime;
var cpaRunTime = typeof (runTime) == 'undefined' ? '30000' : runTime;

var options = {
    'callerID' : outboundCallerID,
    'timeout' : '90'
};

var call_event = call("+14072559655", options);

if (call_event.name == 'answer') {

    // Outbound call is answered.
    log('*** Outbound call answered by ' + call_event.value.calledID);

    // Do transfer to CCXML CPA script with SIP headers.
    var cpa_headers = {
        'x-cpa-max-silence' : cpaMaxSilence,
        'x-cpa-max-time' : cpaMaxTime,
        'x-cpa-runtime' : cpaRunTime,
        'x-initial-message' : initialCallerMessage,
        'x-initial-message-type' : initialCallerMessageType,
        'x-tts-voice' : ttsVoice
    };
    var cpa_event = transfer('sip:9996151102@sip.voxeo.net', { 'headers' : cpa_headers });

    // Back from CCXML.
    log('*** Transfer to CPA script complete ***');

    // Get results returned from CCXML.
    var result = cpa_event.value.getHeader('x-cparesult');
    var selection = cpa_event.value.getHeader('x-caller-selection');
    log('*** CPA result returned from CCXML: ' + result);

    //Play message to the caller.
    say("C P A detection is now complete. I detected you as " + result);

    say("Goodbye");
    hangup();
}

else {
    log('*** Call not answered. ***');
}