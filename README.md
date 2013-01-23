#Description
***
A CCXML application for providing advanced CPA detection to Tropo scripts. Also included in this repo are sample Tropo apps written in PHP and JavaScript that demonstrates usage.

#Usage
***
Tropo applications can interact with the Voxeo CPA detection application by doing a transfer to a specific SIP address on the Voxeo network and passing along customer SIP headers with the call.

    9996151102@sip-noproxy.voxeo.net

This will pass control of the call to the CPA detection app. When detection is finished or the initial message is finished playing (whichever occurs first), the CPA application will return control to the Tropo script that initiated the transfer, passing back the result of the CPA detection in a custom sip header:

    x-cparesult

There are two parameters that must be submitted with the SIP transfer to the Voxeo CPA application - <strong>initialMessage</strong> and <strong>initialMessageType</strong>. initialMessage is a prompt or message that is played to the called party while CPA detection occurs (i.e., CPA detection occurs asynchronously, while the prompt is played to the called party). initialMessageType defines whether the initialMessage is a string of text to be played via TTS or an absolute URL reference to an audio file (WAV format).

There are also several optional parameters that can be submitted with the SIP transfer to the Voxeo CPA application, to control the specific CPA settings used for detection, and for other purposes:

* maxTime - The maximum time for initial voice activity used to detect voicemail or answering machine messages (default is 1200ms).

* maxSilence - The maximum amount of silence used to detect the end of voice activity (default is 7000ms).

* runTime - The maximum runtime for the CPA logic (default is 20000ms).


#Assumptions
***
The Voxeo CPA detection app makes two basic assumptions.

First, it is assumed that your application has a generic introductory prompt which can be played while CPA detection occurs. This is typically a greeting prompt, telling the called party the reason for the call and providing basic introductory information. Ideally, this prompt will be a minimum of about 10 seconds in length. This will give the CPA engine sufficient time to accurately detect the type of called party that answers the outbound call (i.e., human vs. machine).

Keep in mind that one of the elements that the CPA engine reacts to is the 'beep' that is delivered after a voicemail message and prior to recording. Different systems may vary the length of the voicemail message, and the beep signaling that the call has reached a machine may not be delivered for several seconds after the call has been answered. It is critical to find the right balance between the initialMessage that is provided to the CPA application and the CPA runtime settings, all of which may be controlled by your Tropo application.

The second major assumption is that the introductory message needs to be played in full after a voicemail or answering machine has been definitively identified. With one exception (noted below), the CPA application will restart the introductory message and replay it from the beginning after the detection of a voicemail beep or answering machine recoding start. The application will then pass control back to your Tropo app with the CPA result so that you can control subsequent prompting - i.e., a repeat option, or IVR menu for a human.

#Launching an outbound call
***
Launch a call to the Tropo Session API as illustrated in the documentation:

    ~$ curl http://api.tropo.com/1.0/sessions?action=create&token=[your-application-token]&numberToCall=14075558888 

Use the token for your Tropo script which includes the logic described above. Include any additional parameters as querystring parameters on this API call.

#Advanced Usage
***
There are several advanced features that maybe used, depending on the requirements of your application.

###Alternate TTS Voices

Specifying a TTS voice is optional. If a voice name is not specified, the default TTS voice (Allison) is used. You may alternatively specify the following TTS voices:

* Susan
* Dave
* Steven

###Asking the called party for input

As an alternative to a static message that is played to a called party during CPA detection, you may also use a message that asks the caller to press a DTMF key in reponse to a prompt (a common technique in CPA detection). To utilize this feature, you must:

* Tailor your prompt to instruct the user to press a DTMF key - "Press 1 if this is Craig Jones. Otherwise, press 2."

* Specify an initialMessageType of 'collect' (This will instruct the CPA application to use a special digit collection dialog).

* Look for the value of the DTMF key pressed in a custom SIP header returned to your Tropo application (x-caller-selection).

Note that the use of the 'collect' initialMessageType will cause the default behavior of the CPA application to change.

* If an answering machine or voicemail is detected during the playing of your DTMF prompt, control will be returned immediately to your Tropo script with the CPA result in the 'x-cparesult' header. Your DTMF collection prompt will not be replayed from the beginning as it is assumed to be unsuitable for an answering machine message.

* The initialMessage you send to the CPA application with DTMF prompting will be played up to 2 times (assuming no response from the caller on the first attempt).

Also note that the use of the 'collect' initialMessageType can provide another decision point on whether your Tropo app is dealing with a human or a machine. The default CPA result is always human, so it is possible to receive an 'x-cparesult' value of human and have an empty 'x-caller-selection' header. This means your DTMF collection prompt was played to the called party, but not key was pressed and no answering machine was detected. How your Tropo app logic reconciles these values is up to you, and depends on your specific use case.


#Limitations
Currently, the CPA detection method detailed here works in Tropo Scripting. If you are using webAPI, you can have the CPA script transfer to you webAPI app once the CPA result is acquired.

#Further Reading:
[Voxeo Labs Article on Answering Machine Dectection / Call Progress Analyzer](https://evolution.voxeo.com/wiki/docs:answering_machine_detection)
