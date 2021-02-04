
export default class PositionInfo {
    figi;
    ticker;
    isi;
    instrumentType;
    balance;
    blocked;
    expectedYieldCurr;
    expectedYieldCurrRub;
    expectedYieldValue;
    lots;
    averagePositionPriceCurr;
    averagePositionPriceValue;
    averagePositionPriceNoNkdCurr;
    averagePositionPriceNoNkdValue;
    name;
    _cellVariants;
    fullCost;

    constructor(params, usdCurr) {
        this.figi = params.figi;
        this.ticker = params.ticker;
        this.isin = params.isin;
        this.instrumentType = params.instrumentType;
        this.balance = params.balance;
        this.blocked = params.blocked;
        this.expectedYieldCurr =  params.expectedYield == undefined ? null : params.expectedYield.currency;
        this.expectedYieldValue = params.expectedYield == undefined ? null : params.expectedYield.value;
        this.lots = params.lots;
        this.averagePositionPriceCurr = params.averagePositionPrice == undefined ? null : params.averagePositionPrice.currency;
        this.averagePositionPriceValue = params.averagePositionPrice == undefined ? null : params.averagePositionPrice.value;
        this.averagePositionPriceNoNkdCurr = params.averagePositionPriceNoNkd == undefined ? null :  params.averagePositionPriceNoNkd.currency;
        this.averagePositionPriceNoNkdValue = params.averagePositionPriceNoNkd == undefined ? null :  params.averagePositionPriceNoNkd.value;
        this.name = params.name;
        this.fullCost = this.fixedFloatnum(this.averagePositionPriceValue * this.balance + this.expectedYieldValue);
        this.expectedYieldCurrRub = this.getExpectedYieldCurrRub(this.averagePositionPriceCurr, usdCurr, this.expectedYieldValue);

        this._cellVariants = this.expectedYieldValue > 0 ? {expectedYieldCurrRub :'success' }: {expectedYieldCurrRub :'danger'};
    }
    
    getExpectedYieldCurrRub(type, usdCurr, expectedYieldValue) {
        var result;
        if(type === 'USD'){
            result = usdCurr * expectedYieldValue;
        } else {
            result = expectedYieldValue;
        }

        return this.fixedFloatnum(result);
    }

    fixedFloatnum(num) {
        return Math.round(num * 100) / 100
    }
}
