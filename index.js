const showAlert = (type, text, options = {}) => {
  options = jsExtend(getDefaults(type), options);
  type = type || "default";

  const alertId = `alertNotify_${new Date().getTime()}_${makeid()}`;
  const notification = getNotificationHTML(type, text, options, alertId);
  const parser = new DOMParser();
  const alert = parser.parseFromString(notification, "text/html");

  document
    .getElementById("alertNotify_main_container")
    .append(alert.body.firstChild);

  const alertNotice = document.querySelector(`#${alertId}`);

  alertNotice
    .querySelector(".alertNotify_close_notification")
    ?.addEventListener("click", function () {
      const this_element = this;
      this_element.parentElement.parentElement.parentElement.classList.add(
        "start_animation"
      );
      setTimeout(function () {
        this_element.parentElement.parentElement.parentElement.remove();
      }, 250);
    });

  setTimeout(() => {
    alertNotice.classList.remove("start_animation");
    setTimeout(function () {
      alertNotice.classList.add("start_animation");
      setTimeout(function () {
        alertNotice.remove();
      }, 300);
    }, options?.timeout);
  }, 100);
};

const getNotificationHTML = (type, text, options, id) => {
  console.log(type, text, options, id);
  let notificationHtml = `<div id="${id}" class="alertNotify_ start_animation alertNotify_${type}"><div class="alertNotify_body"><div class="alertNotify_icon_text_container"><div class="alertNotify_type_icon_container"><span class="alertNotify_type_icon alertNotify_type_icon_${type}">${options.icon}</span></div><div class="alertNotify_text_div"><span class="alertNotify_text alertNotify_text_${type}">${text}</span></div></div>`;
  if (options?.isDismissible) {
    notificationHtml += `<div class="alertNotify_close_notification_container"><span class="alertNotify_close_notification alertNotify_close_notification_${type}">&times;</span></div>`;
  }
  notificationHtml += "</div></div>";
  return notificationHtml;
};

function jsExtend(defaults, options) {
  const settings = {};
  const ObjectKeys = Object.keys(defaults);
  for (var i = 0; i < ObjectKeys.length; i++) {
    const singleKey = ObjectKeys[i];
    if (Object.prototype.hasOwnProperty.call(options, singleKey)) {
      settings[singleKey] = options[singleKey];
    } else {
      settings[singleKey] = defaults[singleKey];
    }
  }
  return settings;
}

const getDefaults = (type) => {
  var icon = "&#x2726;";
  if (typeof type !== "undefined") {
    switch (type) {
      case "success":
        icon = "&#x2714;";
        break;
      case "warning":
        icon = "&#x26a0;";
        break;
      case "error":
        icon = "&#x2718;";
        break;
      case "info":
        icon = "!";
        break;
      default:
        icon = "&#x2726;";
    }
  }
  return {
    timeout: 5000,
    icon: icon,
    isDismissible: true,
  };
};

const makeid = () => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < 15; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const SUCCESS = "success";
export const WARNING = "warning";
export const ERROR = "error";
export const INFO = "info";
export const DEFAULT = "default";

export default showAlert;
