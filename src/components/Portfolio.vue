<template>
  <div class="hello">
    <b-form-input v-model="url" placeholder="Ticket"></b-form-input>
    <b-button variant="primary" prevent @click="getValueByUrl"
      >Get value by ticket</b-button
    >
    <br />
    <h3>Текущая стоимость портфеля {{ totalPortfolioPrice }} fixme ru/usd</h3>
    <h3>Курс Usd {{ usdCurrency }} RUB</h3>
    <br />
    <b-table :items="positions" :fields="fields"></b-table>
  </div>
</template>

<script>
import PositionInfo from "../class/PositionInfo";
import axios from "axios";

const PORTFOLIO_DELAY = 5000;
const USD_CURRENCY_DELAY = 1 * 60 * 60 * 1000;

export default {
  name: "Portfolio",
  props: {
    msg: String,
  },
  data() {
    return {
      positions: [],
      totalPortfolioPrice: 0,
      usdCurrency: 0,
      url: "",
      fields: [
        { key: "name", label: "Имя", sortable: true },
        { key: "ticker", label: "Тикер", sortable: true },
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
        { key: "balance", label: "Количество", sortable: true },
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
        headers: { Authorization: "Bearer " + process.env.VUE_APP_SECRET_TOKEN },
      })
        .then((response) => {
          // console.log("response", response);

          this.positions = this.encodeInfo(response);
        })
        .catch((error) => {
          console.log(error);
        });
    },

    getValueByUrl() {
      axios({
        method: "get",
        url: this.url,
        headers: { Authorization: "Bearer " +  process.env.VUE_APP_SECRET_TOKEN },
      })
        .then((response) => {
          console.log("Ticker", response.data.payload);
        })
        .catch((error) => {
          console.log(error);
        });
    },

    getUsdCurrencyTink(positionInfo) {
      var result = positionInfo.filter((obj) => {
        return obj.ticker === "USD000UTSTOM";
      });

      return result[0].averagePositionPriceValue;
    },

    getUsdCurrency() {
      axios({
        method: "get",
        url:
          "http://iss.moex.com/iss/engines/currency/markets/selt/boards/CETS/securities.json?iss.only=marketdata&marketdata.columns=SECID,LAST",
      })
        .then((response) => {
          // var values = response.marketdata.
          console.log("usd", response);
          var dataArray = response.data.marketdata.data;

          var result = dataArray.filter((obj) => {
            return obj[0] === "USD000UTSTOM";
          });

          this.usdCurrency = result[0][1];
          // console.log("usd", result[0][1]);
        })
        .catch((error) => {
          console.log(error);
        });
    },

    encodeInfo(response) {
      var results = [];
      var positions = response.data.payload.positions;
      var currPortfolioPrice = 0;

      positions.forEach((element) => {
        let position = new PositionInfo(element, this.usdCurrency);

        currPortfolioPrice += position.totalValue;

        results.push(position);
      });

      this.totalPortfolioPrice = currPortfolioPrice;


      // console.log("results",results);
      return results;
    },

    getData() {
      setInterval(() => {
        this.getPortfolio();
      }, PORTFOLIO_DELAY);

      setInterval(() => {
        this.getUsdCurrency();
      }, USD_CURRENCY_DELAY);
    },
  },

  created() {
    this.getPortfolio();
    this.getUsdCurrency();

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
