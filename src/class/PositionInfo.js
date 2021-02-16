export default class PositionInfo {
    figi;
    ticker;
    isin;
    instrumentType;
    balance;
    blocked;
    expectedYieldCurr;
    expectedYieldCurrConvert;
    expectedYieldValue;
    expectedYieldPercent;
    lots;
    averagePositionPriceCurr;
    averagePositionPriceValue;
    averagePositionPriceNoNkdCurr;
    averagePositionPriceNoNkdValue;
    name;
    _cellVariants;
    fullCost;

    constructor(params) {
        this.figi = params.figi;
        this.ticker = params.ticker;
        this.isin = params.isin;
        this.instrumentType = params.instrumentType;
        this.balance = params.balance;
        this.blocked = params.blocked;
        this.expectedYieldCurr = params.expectedYield === undefined ? null : params.expectedYield.currency;
        this.expectedYieldValue = params.expectedYield === undefined ? null : params.expectedYield.value;
        this.lots = params.lots;
        this.averagePositionPriceCurr = params.averagePositionPrice === undefined ? null : params.averagePositionPrice.currency;
        this.averagePositionPriceValue = params.averagePositionPrice === undefined ? null : params.averagePositionPrice.value;
        this.averagePositionPriceNoNkdCurr = params.averagePositionPriceNoNkdCurr == undefined ?
            null : params.averagePositionPriceNoNkdCurr.currency;
        this.averagePositionPriceNoNkdValue = params.averagePositionPriceNoNkdValue === undefined ?
            null : params.averagePositionPriceNoNkdValue.value;
        this.name = params.name;
        this.fullCost = this.fixedFloatnum(this.averagePositionPriceValue * this.balance + this.expectedYieldValue);
        this.expectedYieldCurrConvert = null;
        this.expectedYieldPercent = this.fixedFloatnum(this.expectedYieldValue * 100 / this.fullCost);

        this._cellVariants = {
            expectedYieldValue: this.expectedYieldPercent > 0 ? 'success' :  this.expectedYieldPercent > - 5 ? 'warning' : 'danger',
            expectedYieldCurrConvert: this.expectedYieldPercent > 0 ? 'success' :  this.expectedYieldPercent > - 5 ? 'warning' : 'danger',
        }

    }

    fixedFloatnum(num) {
        return Math.round(num * 100) / 100;
    }
}
