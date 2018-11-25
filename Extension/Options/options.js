$(() => {
    browser.storage.sync.get("enableTelemetry").then(({enableTelemetry}) => {
        if (enableTelemetry !== undefined){
            document.getElementById("telemetry").MaterialCheckbox[enableTelemetry ? 'check' : 'uncheck']();
        }
        else{
            document.getElementById("telemetry").MaterialCheckbox.check();
            browser.storage.sync.set({enableTelemetry: true});
        }
    });
    document.getElementById('save').addEventListener('click', () => {
        browser.storage.sync.set({
            enableTelemetry: document.getElementById('telemetry-checkbox').checked
        });
    });
});