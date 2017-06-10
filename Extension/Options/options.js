$(document).ready(function(){
    chrome.storage.sync.get("enableTelemetry", function(items){
        if ("enableTelemetry" in items){
            document.getElementById("enableTelemetry").checked = items["enableTelemetry"];
        }
        else{
            document.getElementById("enableTelemetry").checked = true;
            chrome.storage.sync.set({"enableTelemetry": true});
        }
    });
    document.getElementById("save").addEventListener("click",function(){
        chrome.storage.sync.set({"enableTelemetry": document.getElementById("enableTelemetry").checked == true});
        chrome.runtime.reload();
    });
});
