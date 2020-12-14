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

function createPDF() {
  showSpinner(true);
  hideElements(true);
  showTerms(true);

  if (Object.keys(specialPayments).length === 0) {
    getField("special-payments-container").style = "visibility: hidden";
  }

  const positionInfo = getField("container-site").getBoundingClientRect();
  let width;
  let height;

  if (positionInfo.width < 600) {
    width = 900;
    height = 1290;
  }

  const pdfParameters = {
    htmlWidth: width || positionInfo.width,
    htmlHeight: height || positionInfo.height,
    topLeftMargin: 1,
  };

  pdfParameters.pdfWidth =
    pdfParameters.htmlWidth + pdfParameters.topLeftMargin * 2;

  pdfParameters.pdfHeight =
    pdfParameters.pdfWidth * 1.5 + pdfParameters.topLeftMargin * 2;

  pdfParameters.canvasImageWidth = width
    ? pdfParameters.htmlWidth - 500
    : pdfParameters.htmlWidth;

  pdfParameters.canvasImageHeight = pdfParameters.htmlHeight;

  pdfParameters.totalPDFPages = 2;

  sendPDF(pdfParameters);
}

function sendPDF(pdfParameters) {
  html2canvas(getField("container-site"), { allowTaint: true }).then(
    (canvas) => {
      canvas.getContext("2d");

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "pt", [
        pdfParameters.pdfWidth,
        pdfParameters.pdfHeight,
      ]);

      pdf.addImage(
        imgData,
        "JPG",
        pdfParameters.topLeftMargin,
        pdfParameters.topLeftMargin,
        pdfParameters.canvasImageWidth,
        pdfParameters.canvasImageHeight
      );

      for (let i = 1; i < pdfParameters.totalPDFPages; i++) {
        pdf.addPage(pdfParameters.pdfWidth, pdfParameters.pdfHeight);
        pdf.addImage(
          imgData,
          "JPG",
          pdfParameters.topLeftMargin,
          -(pdfParameters.pdfHeight * i) + pdfParameters.topLeftMargin * 4,
          pdfParameters.canvasImageWidth,
          pdfParameters.canvasImageHeight
        );
      }

      pdf.save("cotizacion-apartamento-altana.pdf");
    }
  );

  hideElements(false);
  showTerms(false);

  if (Object.keys(specialPayments).length === 0) {
    getField("special-payments-container").style = "visibility: visible";
  }

  showSpinner(false);
}
