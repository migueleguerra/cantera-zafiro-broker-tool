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

function showSpinner(show) {
  getField("spinner").style = show ? VISIBLE : HIDDEN;
}

function editImage(edit) {
  getField("image").style =
    edit && getField("down-payments-table").innerHTML !== ""
      ? "margin-top: 25rem"
      : "margin-top: 0";
}

function hideElements(hide) {
  getField("btn-pdf").style = hide ? HIDDEN : VISIBLE;
  getField("btn-clean").style = hide ? HIDDEN : VISIBLE;
  getField("months").style = hide ? HIDDEN : VISIBLE;
  getField("special-payments-amount").style = hide ? HIDDEN : VISIBLE;
  getField("btn-add").style = hide ? HIDDEN : VISIBLE;
}

function showTerms(show) {
  getField("terms-info-hidden").style = show
    ? "display: flex"
    : "display: none";
}
