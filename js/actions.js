const ALTANA_PASSWORD = "carza2020";

function cleanForm() {
  financialProjection.resetValues();

  let slotSelector = getField("units");
  slotSelector.value = JSON.stringify(
    apartmentsData[slotSelector.options.selectedIndex]
  );
  specialPayments = {};
  getField("special-payments-table").innerHTML = "";
  slotSelector.dispatchEvent(new Event("change"));
}

function addSpecialPayment() {
  if (getField("special-payments-amount").value !== "$0") {
    const monthSelector = getField("months");
    const amount = getFieldValueAsNumber("special-payments-amount");

    if (specialPayments[monthSelector.value]) {
      specialPayments[monthSelector.value] += amount;
    } else {
      specialPayments[monthSelector.value] = amount;
    }

    addSpecialPaymentToTable(
      monthSelector.value,
      monthSelector[monthSelector.value].innerHTML,
      amount
    );
    getField("special-payments-amount").value = "$0";
    financialProjection.compute();
  }
}

function loadImage(type) {
  getField("image").innerHTML = "";

  if (type !== "-") {
    let img = document.createElement("img");
    img.src = typeUnits[type];
    img.alt = `Type ${type}`;

    getField("image").appendChild(img);
  }
}

function enter() {
  const password = getField("password-enter").value;

  if (
    password !== undefined &&
    password != "" &&
    password === ALTANA_PASSWORD
  ) {
    setDate();
    getField("broker").textContent = getField("broker-enter").value;
    getField("client").textContent = getField("client-enter").value;
    getField("email").textContent = getField("email-enter").value;
    getField("tel").textContent = getField("tel-enter").value;

    getField("popup").style = "visibility: hidden";
    return;
  }

  showErrorMsg("La contraseña es incorrecta.");
}
