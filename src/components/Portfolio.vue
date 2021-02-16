<template>
  <div class="hello">
    <!-- only for debug -->
    <!--    <b-row class="my-2">-->
    <!--      <b-col cols="4">-->
    <!--        <b-form-input v-model="url" placeholder="With Tinkoff token"></b-form-input>-->
    <!--      </b-col>-->
    <!--      <b-col cols="2">-->
    <!--        <b-button variant="primary" prevent @click="getValueByUrl"-->
    <!--        >Get JSON by URL-->
    <!--        </b-button>-->
    <!--      </b-col>-->
    <!--    </b-row>-->

    <br/>

    <b-container>
      <h3>Курс Usd {{ usdCurrency }} RUB, покупка {{ usdCurrencySell }} RUB</h3>
      <b-row class="justify-content-md-center">
        <b-col col lg="6">
          <h3>Текущая стоимость портфеля {{ totalPortfolioCost }}</h3>
        </b-col>
        <b-col col lg="1">
          <h3><a href="#" @click.stop="nextCurrencyType">{{ fullCostCurrencyType }}</a>*</h3>
        </b-col>
      </b-row>
      <h5>*При продаже из валюты позиции</h5>
      <b-row class="justify-content-md-center">
        <h3>За всё время {{ totalYield }} {{positionCurrencyConvertType}}</h3>
      </b-row>
    </b-container>

    <br/>

    <b-row class="my-2">
      <b-col xl="3" md="4">
        <label>Валюта для конвертации доходности</label>
      </b-col>
      <b-col xl="1" md="2">
        <b-form-select
            id="inp-curr-type"
            v-model="positionCurrencyConvertType"
            :options="currenciesTypes"
            @change="getConvertedCurrencyValues"
        ></b-form-select>
      </b-col>
    </b-row>

    <b-row class="my-2">
      <b-col xl="3" md="4">
        <b-form-checkbox
            id="check-port"
            v-model="isShowFullInfo"
            name="check-port"
            @change="getVisibleFields"
        >
          Показать полную информацию
        </b-form-checkbox>
      </b-col>

    </b-row>


    <br/>

    <b-table :items="positions" :fields="visibleFields" bordered></b-table>
  </div>
</template>

<script>
import PositionInfo from "../class/PositionInfo";
import axios from "axios";

const PORTFOLIO_DELAY = 5000;
const USD_CURRENCY_DELAY = 60 * 60 * 1000;
const URL_MOEX_CURRENCIES = "http://iss.moex.com/iss/engines/currency/markets/selt/boards" +
    "/CETS/securities.json?iss.only=marketdata&marketdata.columns=SECID,LAST";
const URL_TINKOFF_CURRENCIES = "https://www.tinkoff.ru/api/v1/currency_rates/";

// let currencies = {
//   "RUB": ["₽", "RUB", "RUBBLES"],
//   "EUR": ["€", "EUR", "EURUSD000TOM",],
//   "USD": ["$", "USD", "USD000UTSTOM", "EUR_RUB__TOM"]
// };

let CURRENCIES_TYPES = ["RUB", "EUR", "USD",];
let rates = {
  "RUB": {USD: 0.0, EUR: 0.0},
  "EUR": {USD: 0.0, RUB: 0.0},
  "USD": {EUR: 0.0, RUB: 0.0},
  "GBP": {EUR: 0.0, RUB: 0.0}
};

const fieldsVisibleKeys = ["balance", "averagePositionPriceCurr",];

export default {
  name: "Portfolio",
  props: {
    msg: String,
  },
  data() {
    return {
      currenciesTypes: CURRENCIES_TYPES,
      positions: [],
      totalPortfolioCost: 0.0,
      totalYield: 0.0,
      usdCurrency: 0.0,
      usdCurrencySell: 0.0,
      url: "",
      fullCostCurrencyType: CURRENCIES_TYPES[0],
      positionCurrencyConvertType: CURRENCIES_TYPES[0],
      isShowFullInfo: false,
      fields: [
        {key: "name", label: "Имя", sortable: true, visible: true},
        {key: "ticker", label: "Тикер", sortable: true, visible: true},
        {
          key: "averagePositionPriceValue",
          label: "На момент покупки",
          sortable: true,
        },
        {
          key: "balance",
          label: "Количество",
          sortable: true,
        },
        {
          key: "fullCost",
          label: "Стоимость в портфеле",
          sortable: true,
        },
        {
          key: "expectedYieldValue",
          label: "Доходность",
          sortable: true,
        },
        {
          key: "expectedYieldCurrConvert",
          label: "Доходность в валюте",
          sortable: true,
        },
        {
          key: "expectedYieldPercent",
          label: "Доходность, %",
          sortable: true,
        },
        {
          key: "averagePositionPriceCurr",
          label: "Валюта",
          sortable: true,
        },
      ],
      visibleFields: [],
    };
  },
  methods: {
    getPortfolio() {
      axios({
        method: "get",
        url: "https://api-invest.tinkoff.ru/openapi/portfolio",
        headers: {Authorization: "Bearer " + process.env.VUE_APP_SECRET_TOKEN},
      })
          .then((response) => {
            this.positions = this.encodeInfo(response);
            this.getConvertedCurrencyValues();
          })
          .catch((error) => {
            console.log(error);
          });
    },

    getValueByUrl() {
      axios({
        method: "get",
        url: this.url,
        headers: {Authorization: "Bearer " + process.env.VUE_APP_SECRET_TOKEN},
      })
          .then((response) => {
            console.log("getValueByUrl", response.data.payload);
          })
          .catch((error) => {
            console.log(error);
          });
    },

    getRatesCurrencyTinkoff() {
      axios({
        method: "get",
        url: URL_TINKOFF_CURRENCIES
      })
          .then((response) => {
            let dataArray = response.data.payload.rates;

            let result = dataArray.filter((obj) => {
              return obj.category === "DepositPayments";
            });

            result.forEach((element) => {
              let rate = rates[element.fromCurrency.name][element.toCurrency.name];

              // value for sell currency to broker
              if (rate !== undefined) {
                rates[element.fromCurrency.name][element.toCurrency.name] = element.buy;
              }
            })

            if (rates.EUR.RUB > 0.0) {
              rates.RUB.EUR = 1 / rates.EUR.RUB;
            }

            if (rates.USD.RUB > 0.0) {
              rates.RUB.USD = 1 / rates.USD.RUB;
              this.usdCurrencySell = rates.USD.RUB;
            }
          })
          .catch((error) => {
            console.log(error);
          });
    },

    getUsdCurrencyMoex() {
      axios({
        method: "get",
        url: URL_MOEX_CURRENCIES
      })
          .then((response) => {
            let dataArray = response.data.marketdata.data;

            let result = dataArray.filter((obj) => {
              return obj[0] === "USD000UTSTOM";
            });

            if (result.length > 0) {
              this.usdCurrency = result[0][1];
            }
          })
          .catch((error) => {
            console.log(error);
          });
    },

    encodeInfo(response) {
      let results = [];
      let positions = response.data.payload.positions;

      positions.forEach((element) => {
        let position = new PositionInfo(element);

        results.push(position);
      });

      return results;
    },

    getConvertedCurrencyValues() {
      let tempCost = 0.0;
      let tempYield = 0.0;
      this.positions.forEach((position => {
        let convertFullVal = this.convertCurrency(position.fullCost, position.averagePositionPriceCurr,
            this.fullCostCurrencyType);
        tempCost += convertFullVal;

        let convertPositionVal = this.convertCurrency(position.expectedYieldValue, position.averagePositionPriceCurr,
            this.positionCurrencyConvertType)
        position.expectedYieldCurrConvert = convertPositionVal;
        tempYield += convertPositionVal;
      }))

      this.totalPortfolioCost = this.fixedFloatNum(tempCost);
      this.totalYield = this.fixedFloatNum(tempYield);

    },

    getData() {
      setInterval(() => {
        this.getPortfolio();
      }, PORTFOLIO_DELAY);

      setInterval(() => {
        this.getRatesCurrencyTinkoff();
      }, USD_CURRENCY_DELAY);

      setInterval(() => {
        this.getUsdCurrencyMoex();
      }, USD_CURRENCY_DELAY);
    },

    nextCurrencyType() {
      let index = CURRENCIES_TYPES.indexOf(this.fullCostCurrencyType);
      if (index === undefined) {
        return;
      }

      index++;
      if (index >= CURRENCIES_TYPES.length) {
        index = 0;
      }
      this.fullCostCurrencyType = CURRENCIES_TYPES[index];

      this.getConvertedCurrencyValues();
    },

    convertCurrency(value, fromType, toType) {
      if (fromType === toType) {
        return value;
      }

      return this.fixedFloatNum(value * rates[fromType][toType]);
    },

    fixedFloatNum(num) {
      return Math.round(num * 100) / 100;
    },

    getVisibleFields() {
      this.visibleFields = this.fields.filter(field => {
        let isInclude = fieldsVisibleKeys.includes(field.key);
        let isVisible = (isInclude && this.isShowFullInfo) || !isInclude;

        return isVisible;
      })

    }
  },

  created() {
    this.getPortfolio();
    this.getRatesCurrencyTinkoff();
    this.getUsdCurrencyMoex();
    this.getVisibleFields()

    this.getData();
  },

};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
