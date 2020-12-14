function displayDownPaymentTable(monthlyPrice, monthlyPaymentsPrice) {
  if (monthlyPrice === 0 && monthlyPaymentsPrice === 0) {
    getField("down-payments-table-container").style.display = "none";
    return;
  }

  getField("down-payments-table-container").style.display = "flex";
  getField("down-payments-table").innerHTML = "";
  createDownPaymentTable(monthlyPrice, monthlyPaymentsPrice);
}

function createDownPaymentTable(monthlyPrice, monthlyPaymentsPrice) {
  let rowsData =
    "<tr><th>Mes</th><th>Saldo Inicial</th>" +
    "<th>Pago Mensual</th><th>Saldo Final</th></tr>";

  for (let i = 1; i <= MONTHLY_PAYMENTS; i++) {
    rowsData += "<tr>";
    rowsData += "<td>Mes " + i + "</td>";
    rowsData += "<td>" + numberWithCommas(monthlyPrice) + "</td>";
    rowsData += "<td>" + numberWithCommas(monthlyPaymentsPrice) + "</td>";
    monthlyPrice -= monthlyPaymentsPrice;
    rowsData +=
      i == MONTHLY_PAYMENTS
        ? "<td>-</td>"
        : "<td>" + numberWithCommas(monthlyPrice) + "</td>";
    rowsData += "</tr>";
  }

  getField("down-payments-table").insertAdjacentHTML("beforeend", rowsData);
}

function addSpecialPaymentToTable(value, date, amount) {
  let rowsData = "";

  if (getField("special-payments-table").innerHTML === "") {
    rowsData = "<tr><th>Fecha</th><th>Cantidad</th></tr>";
    rowsData +=
      "<tr id=" +
      value +
      "><td>" +
      date +
      "</td><td>" +
      numberToCurrency(amount) +
      "</td></tr>";

    getField("special-payments-table").insertAdjacentHTML(
      "beforeend",
      rowsData
    );
    return;
  }

  rowsData +=
    "<tr id=" +
    value +
    "><td>" +
    date +
    "</td><td>" +
    numberToCurrency(amount) +
    "</td></tr>";

  getField("special-payments-table").firstChild.insertAdjacentHTML(
    "beforeend",
    rowsData
  );
}
