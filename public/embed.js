(function () {
  var script = document.currentScript;
  var widgetKey = script.getAttribute("data-key");
  var baseUrl = (script.src.match(/^(https?:\/\/[^\/]+)/) || [])[1] || "";
  var configUrl = baseUrl + "/api/forms/" + widgetKey + "/config";
  var apiUrl = baseUrl + "/api/forms/" + widgetKey;

  var container = document.createElement("div");
  script.parentNode.insertBefore(container, script);

  fetch(configUrl)
    .then(function (r) { return r.json(); })
    .then(function (config) {
      var services = config.services || [];
      var intakeQuestion = config.intakeQuestion || "What do you need help with?";

      var serviceOptions = services.map(function (s) {
        return '<option value="' + s.value + '">' + s.label + '</option>';
      }).join("");

      var serviceField = services.length > 0
        ? '<div style="margin-bottom:16px;">' +
            '<label style="display:block;margin-bottom:4px;font-weight:500;">' + intakeQuestion + '</label>' +
            '<select name="serviceType" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;">' +
              '<option value="">Select...</option>' +
              serviceOptions +
            '</select>' +
          '</div>'
        : '<div style="margin-bottom:16px;">' +
            '<label style="display:block;margin-bottom:4px;font-weight:500;">' + intakeQuestion + '</label>' +
            '<input name="serviceType" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;" placeholder="Describe what you need..." />' +
          '</div>';

      container.innerHTML =
        '<form id="rooflead-form" style="font-family:sans-serif;max-width:400px;">' +
          '<div style="margin-bottom:12px;">' +
            '<label style="display:block;margin-bottom:4px;font-weight:500;">Your Name</label>' +
            '<input name="name" required style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;" />' +
          '</div>' +
          '<div style="margin-bottom:12px;">' +
            '<label style="display:block;margin-bottom:4px;font-weight:500;">Phone Number</label>' +
            '<input name="phone" type="tel" required style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;" />' +
          '</div>' +
          '<div style="margin-bottom:12px;">' +
            '<label style="display:block;margin-bottom:4px;font-weight:500;">Property Address</label>' +
            '<input name="address" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;" />' +
          '</div>' +
          serviceField +
          '<p style="font-size:11px;color:#888;margin-bottom:12px;">' +
            'By submitting, you agree to receive SMS messages from this business. Reply STOP to opt out.' +
          '</p>' +
          '<button type="submit" id="rooflead-btn" style="width:100%;padding:10px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;font-size:16px;">' +
            'Get a Free Estimate' +
          '</button>' +
        '</form>';

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
          container.innerHTML =
            '<div style="padding:16px;background:#dcfce7;border-radius:4px;color:#166534;">' +
              'Thanks! You\'ll receive a text shortly.' +
            '</div>';
        });
      });
    });
})();
