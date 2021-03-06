let MIN_PERCENTAGE = 20;

// Used for computing numbers in the form
let financialProjection;

function populateUnits() {
  const apartmentSelector = getField("units");

  // apartmentData is defined in data/apartment-data.json
  for (let apartment of apartmentsData) {
    const option = document.createElement("option");
    option.value = JSON.stringify(apartment);
    option.innerHTML = apartment.unit;
    apartmentSelector.appendChild(option);
  }

  apartmentSelector.dispatchEvent(new Event("change"));
}

function populateSpecialPayments() {
  const specialPaymentMonthSelector = getField("months");
  const dateOfToday = new Date();

  let todayYear = dateOfToday.getFullYear();
  let monthCount = 0;
  let i = dateOfToday.getMonth();

  if (dateOfToday.getMonth() === 11) {
    i = 0;
    todayYear++;
  }

  while (monthCount < MONTHLY_PAYMENTS) {
    const option = document.createElement("option");
    option.value = monthCount;
    option.innerHTML = `${monthsOfYear[i]}, ${todayYear}`;
    specialPaymentMonthSelector.appendChild(option);

    if (i === 11) {
      i = 0;
      todayYear++;
    } else {
      i++;
    }

    monthCount++;
  }

  specialPaymentMonthSelector.dispatchEvent(new Event("change"));
}

document.addEventListener("DOMContentLoaded", () => {
  financialProjection = new FinancialProjection();
  populateUnits();
  populateSpecialPayments();
});

function onApartmentChange(apartment) {
  financialProjection.apartment = JSON.parse(apartment);

  getField("unit-floor").innerHTML = financialProjection.apartment.floor;
  getField("unit-type").innerHTML = financialProjection.apartment.type;
  //loadImage(financialProjection.apartment.type);
  getField("unit-structure").innerHTML =
    financialProjection.apartment.structure;
  getField("unit-interior-size").innerHTML = numberWithCommas(
    financialProjection.apartment.interior_size
  );
  getField("unit-balcony-size").innerHTML = numberWithCommas(
    financialProjection.apartment.balcony_size
  );
  getField("unit-total-size").innerHTML = numberWithCommas(
    financialProjection.apartment.total_size
  );
  getField("unit-view").innerHTML = financialProjection.apartment.view;
  getField("unit-price").innerHTML = numberToCurrency(
    financialProjection.apartment.price
  );
  getField("unit-m2-price").innerHTML = numberToCurrency(
    financialProjection.apartment.m2_price
  );
  getField("unit-parking-space").innerHTML =
    financialProjection.apartment.parking_space;
  getField("unit-status").innerHTML = financialProjection.apartment.status;
  disableFields(financialProjection.apartment.status);

  financialProjection.compute();
}

function onSpecialPaymentsAmountBlur() {
  getField("special-payments-amount").value = numberToCurrency(
    getFieldValueAsNumber("special-payments-amount")
  );
}

function onDownPaymentPercentageBlur() {
  getField(
    "down-payment-percentage"
  ).value = financialProjection.validatePercentage(
    getField("down-payment-percentage").value,
    5,
    100
  );

  const min =
    getField("down-payment-percentage").value - MIN_PERCENTAGE >= 0
      ? 0
      : MIN_PERCENTAGE - getField("down-payment-percentage").value;

  getField("monthly-percentage").value = financialProjection.validatePercentage(
    getField("monthly-percentage").value,
    min,
    100 - getField("down-payment-percentage").value
  );

  evaluateForm();
}

function onDownPaymentPriceBlur() {
  const downPaymentPrice = getFieldValueAsNumber("down-payment-price");

  if (
    Number(financialProjection.downPaymentPrice.toFixed(2)) !== downPaymentPrice
  ) {
    financialProjection.downPaymentPrice = downPaymentPrice;
    getField("down-payment-percentage").value = Math.round(
      (100 * downPaymentPrice) / financialProjection.apartment.price
    );

    onDownPaymentPercentageBlur();
  }
}

function onMonthlyPercentageBlur() {
  getField("monthly-percentage").value = financialProjection.validatePercentage(
    getField("monthly-percentage").value,
    0,
    95
  );

  const min =
    Number(getField("monthly-percentage").value) +
      Number(getField("down-payment-percentage").value) >=
    MIN_PERCENTAGE
      ? 5
      : MIN_PERCENTAGE - getField("monthly-percentage").value;

  getField(
    "down-payment-percentage"
  ).value = financialProjection.validatePercentage(
    getField("down-payment-percentage").value,
    min,
    100 - getField("monthly-percentage").value
  );

  evaluateForm();
}

function onMonthlyPriceBlur() {
  const monthlyPrice = getFieldValueAsNumber("monthly-price");

  if (Number(financialProjection.monthlyPrice.toFixed(2)) !== monthlyPrice) {
    getField("monthly-percentage").value = Math.round(
      (100 * monthlyPrice) / financialProjection.apartment.price
    );

    onMonthlyPercentageBlur();
  }
}

function onMonthlyPaymentsPriceBlur() {
  const monthlyPaymentPrice = getFieldValueAsNumber("monthly-payments-price");

  if (
    Number(financialProjection.monthlyPaymentPrice.toFixed(2)) !==
    monthlyPaymentPrice
  ) {
    getField("monthly-price").value =
      monthlyPaymentPrice * getFieldValueAsNumber("monthly-payments");

    onMonthlyPriceBlur();
  }
}

function evaluateForm() {
  financialProjection.evaluateForm(
    Number(getField("down-payment-percentage").value),
    Number(getField("monthly-percentage").value)
  );
}

function disableFields(status) {
  const statusSold = "Vendido";
  const statusSeparated = "Separado";
  const bar = "-";
  const isDisabled =
    status === statusSold || status === bar || status === statusSeparated;

  if (status === statusSold) {
    getField("unit-status").style = "color: darkred";
  } else if (status === statusSeparated) {
    getField("unit-status").style = "color: darkblue";
  } else {
    getField("unit-status").style = "color: #44392D";
  }

  getField("down-payment-percentage").disabled = isDisabled ? true : false;
  getField("down-payment-price").disabled = isDisabled ? true : false;
  getField("monthly-percentage").disabled = isDisabled ? true : false;
  getField("monthly-price").disabled = isDisabled ? true : false;
  getField("monthly-payments-price").disabled = isDisabled ? true : false;
  getField("months").disabled = isDisabled ? true : false;
  getField("special-payments-amount").disabled = isDisabled ? true : false;
  getField("btn-add").disabled = isDisabled ? true : false;
  getField("btn-pdf").disabled = isDisabled ? true : false;
  getField("btn-clean").disabled = isDisabled ? true : false;
}

function confinanciamiento() {
  const checkbox = getField('confi');
  if (checkbox.checked) {
    downPaymentPerc = 5;
    monthlyPerc = 0;
    getField('p-confi').style.visibility = "visible";
  } else {
    downPaymentPerc = 5;
    monthlyPerc = 15;
    getField('p-confi').style.visibility = "hidden";
  }

  MIN_PERCENTAGE = downPaymentPerc + monthlyPerc;
  financialProjection.resetValues();
  financialProjection.compute();
}
