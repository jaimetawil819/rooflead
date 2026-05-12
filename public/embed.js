(function () {
  var script = document.currentScript;
  var widgetKey = script && script.getAttribute("data-key");
  var baseUrl = (script && script.src.match(/^(https?:\/\/[^\/]+)/) || [])[1] || "";

  if (!script || !script.parentNode || !widgetKey) return;

  var configUrl = baseUrl + "/api/forms/" + encodeURIComponent(widgetKey) + "/config";
  var apiUrl = baseUrl + "/api/forms/" + encodeURIComponent(widgetKey);
  var container = document.createElement("div");
  var uid = "rooflead-" + Math.random().toString(36).slice(2, 9);

  script.parentNode.insertBefore(container, script);

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function fieldStyles() {
    return [
      "width:100%",
      "min-height:46px",
      "box-sizing:border-box",
      "border:1px solid #cbd5e1",
      "border-radius:10px",
      "background:#ffffff",
      "color:#0f172a",
      "font-size:16px",
      "line-height:1.4",
      "padding:10px 12px",
      "outline:none",
      "transition:border-color 160ms ease, box-shadow 160ms ease",
    ].join(";");
  }

  function label(forId, text) {
    return (
      '<label for="' + forId + '" style="display:block;margin:0 0 6px;color:#334155;font-size:14px;font-weight:700;line-height:1.4;">' +
      escapeHtml(text) +
      "</label>"
    );
  }

  function setStatus(message, tone) {
    var status = document.getElementById(uid + "-status");
    if (!status) return;

    var styles = {
      info: "background:#eff6ff;border-color:#bfdbfe;color:#1d4ed8;",
      error: "background:#fef2f2;border-color:#fecaca;color:#b91c1c;",
      success: "background:#ecfdf5;border-color:#a7f3d0;color:#047857;",
    };

    status.setAttribute("style", "display:block;margin:0 0 16px;padding:12px 14px;border:1px solid;border-radius:12px;font-size:14px;font-weight:700;line-height:1.5;" + (styles[tone] || styles.info));
    status.textContent = message;
  }

  function render(config) {
    var services = Array.isArray(config.services) ? config.services : [];
    var intakeQuestion = config.intakeQuestion || "What type of roofing issue are you dealing with?";
    var serviceId = uid + "-service";
    var consentId = uid + "-sms-consent";

    var serviceOptions = services.map(function (s) {
      return '<option value="' + escapeHtml(s.value) + '">' + escapeHtml(s.label) + "</option>";
    }).join("");

    var serviceField = services.length > 0
      ? label(serviceId, intakeQuestion) +
        '<select id="' + serviceId + '" name="serviceType" style="' + fieldStyles() + '">' +
          '<option value="">Select a service...</option>' +
          serviceOptions +
        "</select>"
      : label(serviceId, intakeQuestion) +
        '<input id="' + serviceId + '" name="serviceType" style="' + fieldStyles() + '" placeholder="Describe what you need..." autocomplete="off" />';

    container.innerHTML =
      '<div style="font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif;max-width:460px;color:#0f172a;">' +
        '<form id="' + uid + '-form" style="box-sizing:border-box;width:100%;overflow:hidden;border:1px solid #e2e8f0;border-radius:18px;background:#ffffff;box-shadow:0 18px 40px rgba(15,23,42,0.10);">' +
          '<div style="background:#020617;color:#ffffff;padding:22px 22px 20px;">' +
            '<div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:14px;border:1px solid rgba(96,165,250,0.35);border-radius:999px;background:rgba(37,99,235,0.14);padding:6px 10px;color:#bfdbfe;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;">' +
              '<span style="display:block;width:8px;height:8px;border-radius:999px;background:#10b981;"></span>' +
              "Fast roofing response" +
            "</div>" +
            '<h2 style="margin:0;color:#ffffff;font-size:24px;line-height:1.15;font-weight:800;letter-spacing:-0.01em;">Request a roofing estimate</h2>' +
            '<p style="margin:10px 0 0;color:#cbd5e1;font-size:14px;line-height:1.6;">Send your request now. This roofing company will follow up by SMS to learn what happened and how urgent it is.</p>' +
          "</div>" +
          '<div style="padding:22px;">' +
            '<div id="' + uid + '-status" role="status" aria-live="polite" style="display:none;"></div>' +
            '<div style="display:grid;gap:15px;">' +
              '<div>' +
                label(uid + "-name", "Your Name") +
                '<input id="' + uid + '-name" name="name" required autocomplete="name" style="' + fieldStyles() + '" placeholder="Jane Smith" />' +
              "</div>" +
              '<div>' +
                label(uid + "-phone", "Phone Number") +
                '<input id="' + uid + '-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel" style="' + fieldStyles() + '" placeholder="+1 555 000 0000" />' +
              "</div>" +
              '<div>' +
                label(uid + "-address", "Property Address") +
                '<input id="' + uid + '-address" name="address" autocomplete="street-address" style="' + fieldStyles() + '" placeholder="123 Main St, San Diego, CA" />' +
              "</div>" +
              '<div>' + serviceField + "</div>" +
            "</div>" +
            '<label for="' + consentId + '" style="display:flex;gap:10px;align-items:flex-start;margin:16px 0 0;border:1px solid #bfdbfe;border-radius:12px;background:#eff6ff;padding:12px 14px;color:#334155;cursor:pointer;">' +
              '<input id="' + consentId + '" name="smsConsent" type="checkbox" required style="width:18px;height:18px;margin:2px 0 0;flex:0 0 auto;accent-color:#2563eb;cursor:pointer;" />' +
              '<span style="display:block;font-size:12px;line-height:1.6;">I agree to receive automated SMS messages from this business about my estimate request. Message and data rates may apply. Reply STOP to opt out or HELP for help.</span>' +
            "</label>" +
            '<button type="submit" id="' + uid + '-btn" style="width:100%;min-height:48px;margin-top:18px;border:0;border-radius:10px;background:#2563eb;color:#ffffff;cursor:pointer;font-size:16px;font-weight:800;line-height:1.2;transition:background 160ms ease, transform 160ms ease;">Get a Free Estimate</button>' +
            '<p style="margin:12px 0 0;text-align:center;color:#94a3b8;font-size:11px;line-height:1.5;">Powered by RoofLead AI intake</p>' +
          "</div>" +
        "</form>" +
      "</div>";

    var fields = container.querySelectorAll("input:not([type='checkbox']), select");
    Array.prototype.forEach.call(fields, function (field) {
      field.addEventListener("focus", function () {
        field.style.borderColor = "#2563eb";
        field.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.14)";
      });
      field.addEventListener("blur", function () {
        field.style.borderColor = "#cbd5e1";
        field.style.boxShadow = "none";
      });
    });

    var button = document.getElementById(uid + "-btn");
    button.addEventListener("mouseenter", function () {
      if (!button.disabled) button.style.background = "#1d4ed8";
    });
    button.addEventListener("mouseleave", function () {
      if (!button.disabled) button.style.background = "#2563eb";
    });

    document.getElementById(uid + "-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var form = e.target;

      setStatus("Sending your request...", "info");
      button.textContent = "Sending...";
      button.disabled = true;
      button.style.cursor = "not-allowed";
      button.style.opacity = "0.72";

      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.value,
          phone: form.phone.value,
          address: form.address.value,
          serviceType: form.serviceType.value,
          smsConsent: form.smsConsent.checked,
        }),
      }).then(function (response) {
        if (!response.ok) throw new Error("submit_failed");
        container.innerHTML =
          '<div style="font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif;box-sizing:border-box;max-width:460px;border:1px solid #a7f3d0;border-radius:18px;background:#ecfdf5;padding:24px;color:#064e3b;box-shadow:0 18px 40px rgba(15,23,42,0.10);">' +
            '<div style="display:flex;gap:12px;align-items:flex-start;">' +
              '<div style="display:flex;width:36px;height:36px;align-items:center;justify-content:center;border-radius:10px;background:#10b981;color:#ffffff;font-size:12px;font-weight:900;">OK</div>' +
              '<div>' +
                '<h2 style="margin:0;color:#064e3b;font-size:20px;line-height:1.25;font-weight:800;">Request received</h2>' +
                '<p style="margin:8px 0 0;color:#047857;font-size:14px;line-height:1.6;">Thanks. You should receive a text shortly so the roofing company can learn more about your project.</p>' +
              "</div>" +
            "</div>" +
          "</div>";
      }).catch(function () {
        setStatus("We could not send the request. Please check the fields and try again.", "error");
        button.textContent = "Try Again";
        button.disabled = false;
        button.style.cursor = "pointer";
        button.style.opacity = "1";
      });
    });
  }

  fetch(configUrl)
    .then(function (r) { return r.json(); })
    .then(render)
    .catch(function () {
      container.innerHTML =
        '<div style="font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif;max-width:460px;border:1px solid #fecaca;border-radius:14px;background:#fef2f2;padding:16px;color:#991b1b;font-size:14px;font-weight:700;line-height:1.5;">RoofLead form is unavailable. Please try again later.</div>';
    });
})();
