export function getOSName() {
  let operatingSystem = "";
  if (window.navigator.userAgent.indexOf("Win") !== -1) {
    operatingSystem = "Windows";
  }
  if (window.navigator.userAgent.indexOf("Mac") !== -1) {
    operatingSystem = "Mac";
  }
  if (window.navigator.userAgent.indexOf("X11") !== -1) {
    operatingSystem = "UNIX";
  }
  if (window.navigator.userAgent.indexOf("Linux") !== -1) {
    operatingSystem = "Linux";
  }
  if (window.navigator.userAgent.indexOf("Android") !== -1) {
    operatingSystem = "Android";
  }

  if (operatingSystem) {
    return operatingSystem;
  }
}
