Vue.component('request-item', {
  template: `
    <div class="box">
      <div class="request-item">
        <div>
          <span class="tag is-medium"> {{name}} </span> 
          <span class="tag is-medium"> {{email}} </span>
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
    name: { required: true },
    email: { required: true },
  },

  data: function() {
    return {};
  },

  methods: {
    approveRequest: async function() {
      let {name, email} = this;      
      let resData = await postJSON('/approve-registration-request', {name, email});
      if (resData.success) {
        console.log("successfully approved");
        rootEl.$refs['reqItemsContainer'].getPendingRequestsData();
      }
    },

    rejectRequest: async function() {
      let {name, email} = this;
      let resData = await postJSON('/reject-registration-request', {name, email});
      if (resData.success) {
        console.log(`successfully rejected ${this.name} ${this.email}`);
        rootEl.$refs['reqItemsContainer'].getPendingRequestsData();
      }
    },
  },
});

Vue.component('request-items-container', {
  template: `
    <div class="request-items-container">
      <ul>
        <li v-for="reqItem in reqItems">
          <request-item v-bind:name="reqItem.name" v-bind:email="reqItem.email""></request-item>
        </li>
      </ul>
    </div>
  `,

  data: function() {
    return { reqItems: [] };
  },

  methods: {
    getPendingRequestsData: async function() {
      console.log("getting request data");
      const reqData = await fetchJSON('/pending-requests');
      this.reqItems = reqData.arr;
    }
  },

  mounted() {
    this.getPendingRequestsData();
  },
});

