const HIDDEN = "visibility: hidden;";
const VISIBLE = "visibility: visible;";

function getField(fieldName) {
  return document.getElementById(fieldName);
}

function numberToCurrency(x) {
  return "$" + numberWithCommas(x);
}

function numberWithCommas(x) {
  return (Math.round((x + Number.EPSILON) * 100) / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function numberWithoutCommas(x) {
  return Number(x.replace(/\$/g, "").replace(/,/g, ""));
}

function getFieldValueAsNumber(fieldName) {
  return numberWithoutCommas(getField(fieldName).value);
}

function setDate() {
  const date = new Date();
  getField("date").textContent =
    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
}

function showErrorMsg(errorMsg) {
  getField("error-msg").innerHTML = errorMsg;
  removeErrorMsg();
}

function removeErrorMsg() {
  setTimeout(() => {
    getField("error-msg").innerHTML = "";
  }, 5000);
}

function roundDecimals(x) {
  return Number(Math.round(x + "e2") + "e-2");
}
