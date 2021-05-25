Vue.component('checkin-item', {
  template: `
    <div class="box">
      <div class="checkin-item">
        <div>
          <span class="tag is-medium"> {{checkinData.user.name}} </span> 
          <span class="tag is-medium"> {{checkinData.book.title}} </span>
        </div>
        <div>
          <button class="button is-success" @click="approveRequest">
            <span class="icon is-small">
              <i class="fas fa-check"></i>
            </span>
            <span> Approve </span>
          </button>
          <button class="button is-danger is-outlined" @click="rejectRequest">
            <span> Reject </span>
            <span class="icon is-small">
              <i class="fas fa-times"></i>
            </span>
          </button>
        </div>
      </div>
    </div>
  `,

  props: {
    checkinData: { required: true }
  },

  data: function() {
    return {};
  },

  methods: {
    approveRequest: async function() {
      let {checkinData} = this;
      let postData = {
        id: this.checkinData.id,
        requestee: this.checkinData.user.id,
        book: this.checkinData.book.id,
      }
      let resData = await postJSON('/approve-checkin-request', postData);
      if (resData.success) {
        console.log("successfully approved");
        rootEl.$refs['checkinItemsContainer'].getPendingCheckinsData();
      }
    },

    rejectRequest: async function() {
      let {checkinData} = this;
      let postData = {
        id: this.checkinData.id,
      }
      let resData = await postJSON('/reject-checkin-request', postData);
      if (resData.success) {
        console.log(`successfully rejected`);
        rootEl.$refs['checkinItemsContainer'].getPendingCheckinsData();
      }
    },
  },
});

Vue.component('checkin-items-container', {
  template: `
    <div class="checkin-items-container">
      <ul>
        <li v-for="checkinItem in checkinItems">
          <checkin-item v-bind:checkinData="checkinItem"></checkin-item>
        </li>
      </ul>
    </div>
  `,

  data: function() {
    return { checkinItems: [] };
  },

  methods: {
    getPendingCheckinsData: async function() {
      console.log("getting request data");
      const checkinData = await fetchJSON('/pending-checkins');
      this.checkinItems = checkinData.arr;
    }
  },

  mounted() {
    this.getPendingCheckinsData();
  },
});

