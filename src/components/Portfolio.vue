<template>
  <div class="hello">
    <div>Text</div>
    <b-form-input v-model="url" placeholder="Ticket"></b-form-input>
    <b-button variant="primary" prevent @click="getValueByUrl"
    >Get value by ticket
    </b-button
    >
    <br/>
    <h3>Курс Usd {{ usdCurrency }} RUB</h3>
    <h3>Текущая стоимость портфеля {{ totalPortfolioCost}}
      <a href="#" @click.stop="nextCurrencyType">{{ fullCostCurrencyType }}</a>*</h3>
    <h5>*При продаже из валюты позиции</h5>
    <br/>

<!--    <b-form-select-->
<!--        id="sel-cur-type"-->
<!--        class="mb-2 mr-sm-2 mb-sm-0"-->
<!--        :options="[{ text: 'Конвертация', value: null }, 'One', 'Two', 'Three']"-->
<!--        :value="null"-->
<!--    ></b-form-select>-->

    <b-table :items="positions" :fields="fields"></b-table>
  </div>
</template>

<script>
import PositionInfo from "../class/PositionInfo";
import axios from "axios";

const PORTFOLIO_DELAY = 5000;
const USD_CURRENCY_DELAY = 60 * 60 * 1000;
const URL_MOEX_CURRENCIES = "http://iss.moex.com/iss/engines/currency/markets/selt/boards/CETS/securities.json?iss.only=marketdata&marketdata.columns=SECID,LAST";
const URL_TINKOFF_CURRENCIES = "https://www.tinkoff.ru/api/v1/currency_rates/";

// let currencies = {
//   "RUB": ["₽", "RUB", "RUBBLES"],
//   "EUR": ["€", "EUR", "EURUSD000TOM",],
//   "USD": ["$", "USD", "USD000UTSTOM", "EUR_RUB__TOM"]
// };

let currencies = ["RUB", "EUR", "USD",];
let rates = {
  "RUB": {USD: 0.0, EUR: 0.0},
  "EUR": {USD: 0.0, RUB: 0.0},
  "USD": {EUR: 0.0, RUB: 0.0},
  "GBP": {EUR: 0.0, RUB: 0.0}
};

export default {
  name: "Portfolio",
  props: {
    msg: String,
  },
  data() {
    return {
      positions: [],
      totalPortfolioCost: 0.0,
      usdCurrency: 0.0,
      url: "",
      fullCostCurrencyType: currencies[0],
      positionCurrencyConvertType: null,
      fields: [
        {key: "name", label: "Имя", sortable: true},
        {key: "ticker", label: "Тикер", sortable: true},
        {
          key: "averagePositionPriceValue",
          label: "Текущая стоимость",
          sortable: true,
        },
        {
          key: "fullCost",
          label: "Полная стоимость",
          sortable: true,
        },
        {
          key: "expectedYieldValue",
          label: "Доходность",
          sortable: true,
        },
        {
          key: "expectedYieldCurrRub",
          label: "Доходность RUB",
          sortable: true,
        },
        {key: "balance", label: "Количество", sortable: true},
        {
          key: "averagePositionPriceCurr",
          label: "Валюта",
          sortable: true,
        },
      ],
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
            this.getConvertedValues();
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
            console.log("Ticker", response.data.payload);
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
        let position = new PositionInfo(element, this.usdCurrency);

        results.push(position);
      });

      return results;
    },

    getConvertedValues() {
      let tempCost = 0.0;
      this.positions.forEach((position => {
        tempCost += this.convertCurrency(position.fullCost, position.averagePositionPriceCurr, this.fullCostCurrencyType);
      }))

      this.totalPortfolioCost = this.fixedFloatNum(tempCost);
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
      let index = currencies.indexOf(this.fullCostCurrencyType);
      if (index === undefined) {
        return;
      }

      index++;
      if (index >= currencies.length) {
        index = 0;
      }
      this.fullCostCurrencyType = currencies[index];

      this.getConvertedValues();
    },

    convertCurrency(value, fromType, toType) {
      if (fromType === toType) {
        return value;
      }

      return value * rates[fromType][toType];
    },

    fixedFloatNum(num) {
      return Math.round(num * 100) / 100;
    }
  },

  created() {
    this.getPortfolio();
    this.getRatesCurrencyTinkoff();
    this.getUsdCurrencyMoex();

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
