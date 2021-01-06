const MONTHLY_PAYMENTS = 21;
const ANNUAL_INTEREST_RATE_UNDER_80 = 0.045 / 12;
const ANNUAL_INTEREST_RATE_OVER_OR_EQUAL_80 = 0.055 / 12;

let specialPayments = {};

class FinancialProjection {
  constructor() {
    this.apartment = {};

    this.resetValues();
    this.setFields();
  }

  validatePercentage(percentage, min, max) {
    if (percentage < min) {
      return min;
    } else if (percentage > max) {
      return max;
    }

    return percentage;
  }

  evaluateForm(newDownPaymentPercentage, newMonthlyPercentage) {
    let letsCompute = false;

    if (
      roundDecimals(newDownPaymentPercentage) !=
      this.downPaymentPercentageRounded
    ) {
      this.downPaymentPercentage = newDownPaymentPercentage;
      letsCompute = true;
    }

    if (roundDecimals(newMonthlyPercentage) != this.monthlyPercentageRounded) {
      this.monthlyPercentage = newMonthlyPercentage;
      letsCompute = true;
    }

    if (letsCompute) {
      financialProjection.compute();
    } else {
      this.setFields();
    }
  }

  compute() {
    if (this.apartment.unit == 0) {
      this.resetValues();
    }

    // Descuento
    this.discountPercentage =
      Number(
        this.calculateDiscountPercentage(
          this.apartment.price,
          this.downPaymentPercentage / 100,
          this.monthlyPercentage / 100
        )
      ) + 2 || 0;
    this.discountPrice = (this.apartment.price * this.discountPercentage) / 100;

    // Enganche
    this.downPaymentPrice =
      (this.apartment.price - this.discountPrice) *
      (this.downPaymentPercentage / 100);

    // Mensualidad
    this.monthlyPrice =
      (this.apartment.price - this.discountPrice) *
      (this.monthlyPercentage / 100);

    // Mensualidades
    this.monthlyPaymentPrice =
      this.monthlyPrice == 0 ? 0 : this.monthlyPrice / this.monthlyPayment;

    // Aportacion Extraordinaria
    if (Object.keys(specialPayments).length !== 0) {
      const totalSpecialPayments = Object.values(specialPayments).reduce(
        (a, b) => a + b
      );
      this.specialPaymentPercentage =
        (totalSpecialPayments / (this.apartment.price - this.discountPrice)) *
        100;
      this.specialPaymentPrice = totalSpecialPayments;
    }

    // Escrituración
    this.deedPercentage =
      100 -
      (this.downPaymentPercentage +
        this.monthlyPercentage +
        this.specialPaymentPercentage);
    this.deedPrice =
      this.apartment.price -
      this.discountPrice -
      this.specialPaymentPrice -
      (this.downPaymentPrice + this.monthlyPrice);

    // Precio final
    this.finalPrice = this.apartment.price - this.discountPrice;

    // Precio m2 final
    this.finalM2Price =
      this.apartment.m2_price -
      this.apartment.m2_price * (this.discountPercentage / 100);

    displayDownPaymentTable(this.monthlyPrice, this.monthlyPaymentPrice);

    this.calculateRoundedPercentages();
    this.setFields();
  }

  calculateRoundedPercentages() {
    this.downPaymentPercentageRounded = roundDecimals(
      this.downPaymentPercentage
    );
    this.monthlyPercentageRounded = roundDecimals(this.monthlyPercentage);
    this.deedPercentageRounded = roundDecimals(this.deedPercentage);
    this.discountPercentageRounded = roundDecimals(this.discountPercentage);
  }

  setFields() {
    getField("down-payment-percentage").value = numberWithCommas(
      this.downPaymentPercentageRounded
    );
    getField("down-payment-price").value = numberToCurrency(
      this.downPaymentPrice
    );

    getField("monthly-percentage").value = numberWithCommas(
      this.monthlyPercentageRounded
    );
    getField("monthly-price").value = numberToCurrency(this.monthlyPrice);

    getField("monthly-payments-price").value = numberToCurrency(
      this.monthlyPaymentPrice
    );

    getField("special-payments-percentage").value = numberWithCommas(
      this.specialPaymentPercentage
    );
    getField("special-payments-price").value = numberToCurrency(
      this.specialPaymentPrice
    );

    getField("deed-percentage").value = numberWithCommas(
      this.deedPercentageRounded
    );
    getField("deed-price").value = numberToCurrency(this.deedPrice);

    getField("discount-percentage").value = numberWithCommas(
      this.discountPercentageRounded
    );
    getField("discount-price").value = numberToCurrency(this.discountPrice);

    getField("final-price").value = numberToCurrency(this.finalPrice);
    getField("final-m2-price").value = numberToCurrency(this.finalM2Price);
  }

  resetValues() {
    this.downPaymentPrice = 0;
    this.downPaymentPercentage = 5;
    this.downPaymentPercentageRounded = 0;

    this.monthlyPrice = 0;
    this.monthlyPercentage = 15;
    this.monthlyPercentageRounded = 0;

    this.monthlyPaymentPrice = 0;
    this.monthlyPayment = MONTHLY_PAYMENTS;

    this.specialPaymentPercentage = 0;
    this.specialPaymentPrice = 0;

    this.deedPrice = 0;
    this.deedPercentage = 0;
    this.deedPercentageRounded = 0;

    this.discountPrice = 0;
    this.discountPercentage = 0;
    this.discountPercentageRounded = 0;

    this.finalPrice = 0;
    this.finalM2Price = 0;
  }

  calculateDiscountPercentage(
    unitValue,
    downPaymentPercentage,
    monthlyPercentage
  ) {
    const annualInterestRate =
      downPaymentPercentage + monthlyPercentage < 0.8
        ? ANNUAL_INTEREST_RATE_UNDER_80
        : ANNUAL_INTEREST_RATE_OVER_OR_EQUAL_80;

    const baseScenario = this.baseScenario(unitValue, annualInterestRate);
    const chosenScenario = this.chosenScenario(
      unitValue,
      downPaymentPercentage,
      monthlyPercentage,
      annualInterestRate
    );

    return (Math.abs(baseScenario - chosenScenario) / unitValue) * 100;
  }

  baseScenario(unitValue, annualInterestRate) {
    const downPaymentPercentage = 0.05;
    const monthlyPercentage = 0.15;
    const monthlyEquation = (unitValue * monthlyPercentage) / MONTHLY_PAYMENTS;

    let finalBalance = unitValue - unitValue * downPaymentPercentage;
    let initialBalance = unitValue;
    let monthlyInterest = 0;

    for (let i = 0; i <= MONTHLY_PAYMENTS; i++) {
      monthlyInterest +=
        ((initialBalance + finalBalance) / 2) * annualInterestRate;
      initialBalance = finalBalance;
      finalBalance = initialBalance - monthlyEquation;
    }

    return monthlyInterest;
  }

  chosenScenario(
    unitValue,
    downPaymentPercentage,
    monthlyPercentage,
    annualInterestRate
  ) {
    const monthlyDownPayment =
      (unitValue * monthlyPercentage) / MONTHLY_PAYMENTS;

    let initialBalance = unitValue;
    let finalBalance = initialBalance - initialBalance * downPaymentPercentage;
    let monthlyInterest = 0;

    for (let i = 0; i <= MONTHLY_PAYMENTS; i++) {
      monthlyInterest +=
        ((initialBalance + finalBalance) / 2) * annualInterestRate;
      initialBalance = finalBalance;
      finalBalance = specialPayments[i]
        ? finalBalance - monthlyDownPayment - specialPayments[i]
        : finalBalance - monthlyDownPayment;
    }

    return monthlyInterest;
  }

  getPrice(percentage) {
    return (percentage / 100) * this.apartment.price;
  }
}
