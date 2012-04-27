<?php

// initialMessage - an initial message to play to the called party while CPA detection takes place.
// initialMessageType - text to be rendered using TTS or an audio file URL (tts / audio).
$message = "This is a test of the Vocksio CPA logic. I am now detecting whether you are a human or a machine. Please remain on the line while I figure out what you are. If this were an actual call, you would be hearing something interesting right now.";
$initialCallerMessage = is_null($initialMessage)  ? $message : $initialMessage;
$initialCallerMessageType = is_null($initialMessageType)  ? "tts" : $initialMessageType;

// callerID - the caller ID to use on the outbound call attempt.
// maxTime - The maximum time for initial voice activity used to detect voicemail or answering machine messages.
// maxSilence - The maximum amount of silence used to detect the end of voice activity.
// runTime - The maximum runtime for CPA.
$outboundCallerID = is_null($callerID)  ? "13971234567" : $callerID;
$cpaMaxSilence = is_null($maxSilence)  ? "900" : $maxSilence;
$cpaMaxTime = is_null($maxTime)  ? "6000" : $maxTime;
$cpaRunTime = is_null($runTime)  ? "30000" : $runTime;

$options = array("callerID" => outboundCallerID, "timeout" => "90");

$call_event = call($numberToCall, $options);

if ($call_event->name == "answer") {

  // Outbound call is answered.
  _log("*** Outbound call answered by " + $call_event->value->calledID);

  // Do transfer to CCXML CPA script with SIP headers.
  $cpa_headers = array(
    "x-cpa-max-silence" => $cpaMaxSilence,
    "x-cpa-max-time" => $cpaMaxTime,
    "x-cpa-runtime" => $cpaRunTime,
    "x-initial-message" => $initialCallerMessage,
    "x-initial-message-type" => $initialCallerMessageType
    );

  $cpa_event = transfer("sip:9996151102@sip-noproxy.voxeo.net", array("headers" => $cpa_headers ));

  // Back from CCXML.
  _log("*** Transfer to CPA script complete ***");

  // Get CPA result.
  $result = $cpa_event->value->getHeader('x-cparesult');
  //$headers = $cpa_event->value->result;
  _log("*** CPA result returned from CCXML: " . $result);

  // Play message to the caller.
  say("C P A detection is now complete. I detected you as " . $result);

  say("Goodbye");
  hangup();
}

else {
  _log("*** Call not answered. ***");
}

?>