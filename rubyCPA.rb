#initialMessage - an initial message to play to the called party while CPA detection takes place.
#initialMessageType - text to be rendered using TTS or an audio file URL (tts / audio).
message = "This is a test of the Vocksio CPA logic. I am now detecting whether you are a human or a machine. Please remain on the line while I figure out what you are. If this were an actual call, you would be hearing something interesting right now. Is this a real human or a machine. I am still listening for a beep."
initialCallerMessage = $initialMessage.nil?  ? message : $initialMessage
initialCallerMessageType = $initialMessageType.nil?  ? "tts" : $initialMessageType

# callerID - the caller ID to use on the outbound call attempt.
# maxTime - The maximum time for initial voice activity used to detect voicemail or answering machine messages.
# maxSilence - The maximum amount of silence used to detect the end of voice activity.
# runTime - The maximum runtime for CPA.
outboundCallerID = $callerID.nil?  ? "13971234567" : $callerID
cpaMaxSilence = $maxSilence.nil?  ? "900" : $maxSilence
cpaMaxTime = $maxTime.nil?  ? "6000" : $maxTime
cpaRunTime = $runTime.nil?  ? "30000" : $runTime
numberToCall = $numberToCall.nil? ? "+14071233232" : "+" + $numberToCall


call_event = call numberToCall, {
    :callerID => outboundCallerID, 
    :timeout => 90
}

log("call_event.name " + call_event.name)

if call_event.name == "answer"

  #Outbound call is answered.
  log "*** Outbound call answered by " + call_event.value.calledID

  #Do transfer to CCXML CPA script with SIP headers.
  cpa_headers = {
  "x-cpa-max-silence" => cpaMaxSilence,
  "x-cpa-max-time" => cpaMaxTime,
  "x-cpa-runtime" => cpaRunTime,
  "x-initial-message" => initialCallerMessage,
  "x-initial-message-type" => initialCallerMessageType
  }

  cpa_event = transfer "sip:9996151102@sip-noproxy.voxeo.net", {
    "headers" => cpa_headers 
  }

  #Back from CCXML.
  log "*** Transfer to CPA script complete ***"

  #Get CPA result.
  result = cpa_event.value.getHeader('x-cparesult');
  #headers = cpa_event.value.result;
  log("*** CPA result returned from CCXML: " + result)

  #Play message to the caller.
  say "C P A detection is now complete. I detected you as " + result
  if (result == "unknown") 
    say "I will assume you are a human."
  end
  say "Goodbye"
  hangup

else 
  log("*** Call not answered. ***")
end
