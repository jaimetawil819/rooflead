(function () {
    var script = document.currentScript;
    var widgetKey = script.getAttribute("data-key");
    var apiUrl = script.getAttribute("data-url") + "/api/forms/" + widgetKey;
  
    var container = document.createElement("div");
    container.innerHTML = `
      <form id="rooflead-form" style="font-family:sans-serif;max-width:400px;">
        <div style="margin-bottom:12px;">
          <label style="display:block;margin-bottom:4px;font-weight:500;">Your Name</label>
          <input name="name" required style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;" />
        </div>
        <div style="margin-bottom:12px;">
          <label style="display:block;margin-bottom:4px;font-weight:500;">Phone Number</label>
          <input name="phone" type="tel" required style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;" />
        </div>
        <div style="margin-bottom:12px;">
          <label style="display:block;margin-bottom:4px;font-weight:500;">Property Address</label>
          <input name="address" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;" />
        </div>
        <div style="margin-bottom:16px;">
          <label style="display:block;margin-bottom:4px;font-weight:500;">What do you need?</label>
          <select name="serviceType" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;">
            <option value="">Select...</option>
            <option value="repair">Roof Repair</option>
            <option value="replacement">Full Replacement</option>
            <option value="inspection">Inspection</option>
            <option value="storm_damage">Storm Damage</option>
          </select>
        </div>
        <p style="font-size:11px;color:#888;margin-bottom:12px;">
          By submitting, you agree to receive SMS messages from this business. Reply STOP to opt out.
        </p>
        <button type="submit" id="rooflead-btn" style="width:100%;padding:10px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;font-size:16px;">
          Get a Free Estimate
        </button>
        <div id="rooflead-success" style="display:none;padding:16px;background:#dcfce7;border-radius:4px;color:#166534;margin-top:12px;">
          Thanks! Someone will be in touch shortly.
        </div>
      </form>
    `;
  
    script.parentNode.insertBefore(container, script);
  
    document.getElementById("rooflead-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var form = e.target;
      var btn = document.getElementById("rooflead-btn");
      btn.textContent = "Sending...";
      btn.disabled = true;
  
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.value,
          phone: form.phone.value,
          address: form.address.value,
          serviceType: form.serviceType.value,
        }),
      }).then(function () {
        container.innerHTML = '<div style="padding:16px;background:#dcfce7;border-radius:4px;color:#166534;">Thanks! Someone will be in touch shortly.</div>';
      });
    });
  })();