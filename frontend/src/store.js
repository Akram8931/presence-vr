import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    functionalChartData: [],
    crossOrgChartData: [],
    activeChartData: [],
    selectedNode: [],

  },
  mutations: {
    setFunctionalChartData(state, payload) {
      state.functionalChartData = payload;
    },

    setCrossOrgChartData(state, payload) {
      state.crossOrgChartData = payload;
    },

    getSelectedNode(state, selectedNodeName) {
      state.selectedNode = _.filter(state.activeChartData, (o) => {
        if (o.indexOf(selectedNodeName) > -1) {
          return o;
        }
      });
    },

    activeChartData(state, payload) {
      if (payload === 'functional') {
        state.activeChartData = state.functionalChartData;
      } else if (payload === 'cross-org') {
        state.activeChartData = state.crossOrgChartData;
      }

      state.selectedNode = state.activeChartData;
      console.log('i fill it');
    },

    reDrawMainChart(state) {
      console.log('he click me');
      state.selectedNode = state.activeChartData;
    },
  },
  actions: {
    initChart({ commit }) {
      axios.get('http://192.168.1.131:3000/functional_capability')
        .then((response) => {
          commit('setFunctionalChartData', response.data);
        })
        .catch((error) => {
          console.log(error);
        });

      axios.get('http://192.168.1.131:3000/cross_org_capability')
        .then((response) => {
          commit('setCrossOrgChartData', response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
});

export { store as default };

