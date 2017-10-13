$(function(){
    browser.storage.sync.get("enableTelemetry", function(items){
        if ("enableTelemetry" in items){
            document.getElementById("enableTelemetry").checked = items["enableTelemetry"];
        }
        else{
            document.getElementById("enableTelemetry").checked = true;
            browser.storage.sync.set({"enableTelemetry": true});
        }
    });
    document.getElementById("save").addEventListener("click",function(){
        browser.storage.sync.set({"enableTelemetry": document.getElementById("enableTelemetry").checked == true});
        console.log(browser.storage.sync);
        //browser.runtime.reload();
    });
});
