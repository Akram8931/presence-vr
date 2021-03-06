import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import env from '@/env';

Vue.use(Vuex);

const state = {
  modalShow: false,
  USStates: [],
  colomn: ['State', 'No of hospital employees'],
  PieGenderRows: [],
  PieAgeRows: [],
  PieRaceRows: [],
  stateName: null,
  LoginError: false,
  stateFaces: {
    Florida: 'fl',
    Washington_DC: 'wa',
    Texas: 'tx',
    Utah: 'ut',
    Michigan: 'mi',
    New_York: 'ny',
    Oklahoma: 'ok',
    Tennessee: 'tn',
    Missouri: 'mo',
    North_Carolina: 'nc',
    California: 'ca',
    Illinois: 'il',
  },
  statePrev: '',
  functionalChartData: [],
  crossOrgChartData: [],
  isExpired: localStorage.getItem('isExpired') || 'true',
  expiryDate: localStorage.getItem('expiry-date') || '',
  status: '',
  token: localStorage.getItem('user-token') || '',
};
const getters = {};
const mutations = {
  SetUSMapData(state, Res) {
    state.USStates = Res;
    state.USStates.unshift(state.colomn);
  },

  SetGenderData(state, Res) {
    state.PieGenderRows = Res;
  },
  SetAgeData(state, Res) {
    state.PieAgeRows = Res;
  },
  SetRaceData(state, Res) {
    state.PieRaceRows = Res;
  },
  showModal() {
    state.modalShow = !state.modalShow;
  },
  changeStateName(state, Selection) {
    state.stateName = `${Selection}`;
    if (Selection.split(' ').length === 1) {
      state.statePrev = state.stateFaces[Selection];
    } else {
      const newSelection = `${Selection.split(' ')[0]}_${Selection.split(' ')[1]}`;
      state.statePrev = state.stateFaces[newSelection];
    }
  },
  setFunctionalChartData(state, payload) {
    state.functionalChartData = payload;
  },
  setCrossOrgChartData(state, payload) {
    state.crossOrgChartData = payload;
  },
  // Login methods
  AUTH_REQUEST(state) {
    state.status = 'loading';
  },
  AUTH_SUCCESS(state, payload) {
    state.status = 'success';
    state.token = payload.token;
    state.expiryDate = payload.expiryDate;
    if (Date.now() < state.expiryDate) {
      state.isExpired = 'false';
      localStorage.setItem('isExpired', state.isExpired);
    } else {
      localStorage.removeItem('user-token');
      localStorage.removeItem('expiry-date');
      localStorage.removeItem('isExpired');
    }
  },
  AUTH_ERROR(state) {
    state.status = 'error';
  },
  ErrorInLogin(state) {
    state.LoginError = true;
  },
  initialiseStore(state) {
    if (localStorage.getItem('user-token')) {
      this.replaceState(
        Object.assign(state, JSON.parse(localStorage.getItem('store'))),
      );
    }
    if (localStorage.getItem('expiry-date')) {
      this.replaceState(
        Object.assign(state, JSON.parse(localStorage.getItem('expiry-date'))),
      );
    }
    if (localStorage.getItem('isExpired')) {
      this.replaceState(
        Object.assign(state, JSON.parse(localStorage.getItem('isExpired'))),
      );
    }
  },
};
const actions = {
  // api of US Map
  loadUSAMap(context) {
    axios.get(env.server.url + '/us_map').then((Response) => {
      context.commit('SetUSMapData', Response.data);
    });
  },
  // api of Pie Charts
  loadPieChart(context, stateName) {
    axios
      .get(env.server.url + `/race_gender_age/${stateName}`)
      .then((Response) => {
        context.commit('SetGenderData', Response.data.gender);
        context.commit('SetAgeData', Response.data.age);
        context.commit('SetRaceData', Response.data.race);
      })
      .then(() => {
        context.commit('showModal');
      });
  },
  initCrossOrgChart({ commit }) {
    axios.get(env.server.url + '/cross_org_capability')
      .then((response) => {
        commit('setCrossOrgChartData', response.data);
      });
  },
  initfunctionalChart({ commit }) {
    axios.get(env.server.url + '/functional_capability')
      .then((response) => {
        commit('setFunctionalChartData', response.data);
      });
  },
  // Login Api
  AUTH_REQUEST({ commit }, user) {
    const NPromise = new Promise((resolve, reject) => {
      commit('AUTH_REQUEST');
      axios({ url: env.server.url + '/login', data: user, method: 'POST' })
        .then((resp) => {
          const token = resp.data.token;
          const expiryDate = resp.data.expiryDate;

          localStorage.setItem('user-token', token);
          localStorage.setItem('expiry-date', expiryDate);

          commit('AUTH_SUCCESS', { token, expiryDate });
          localStorage.setItem('isExpired', state.isExpired);
          resolve(resp);
        }).catch((err) => {
          commit('ErrorInLogin');
          commit('AUTH_ERROR', err);
          localStorage.removeItem('user-token');
          localStorage.removeItem('expiry-date');
          localStorage.removeItem('isExpired');

          reject(err);
        });
    });
  },
};

const store = new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
});
export default store;


store.subscribe((mutation, state) => {
  localStorage.setItem('user-token', state.token);
  localStorage.setItem('expiry-date', state.expiryDate);
  localStorage.setItem('isExpired', state.isExpired);
});
