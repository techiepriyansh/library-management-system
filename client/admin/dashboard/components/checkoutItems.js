Vue.component('checkout-item', {
  template: `
    <div class="box">
      <div class="checkout-item">
        <div>
          <span class="tag is-medium"> {{checkoutData.user.name}} </span> 
          <span class="tag is-medium"> {{checkoutData.book.title}} </span>
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
    checkoutData: { required: true }
  },

  data: function() {
    return {};
  },

  methods: {
    approveRequest: async function() {
      let {checkoutData} = this;
      let postData = {
        id: this.checkoutData.id,
        requestee: this.checkoutData.user.id,
        book: this.checkoutData.book.id,
      }
      let resData = await postJSON('/approve-checkout-request', postData);
      if (resData.success) {
        console.log("successfully approved");
        rootEl.$refs['checkoutItemsContainer'].getPendingCheckoutsData();
      }
    },

    rejectRequest: async function() {
      let {checkoutData} = this;
      let postData = {
        id: this.checkoutData.id,
      }
      let resData = await postJSON('/reject-checkout-request', postData);
      if (resData.success) {
        console.log(`successfully rejected`);
        rootEl.$refs['checkoutItemsContainer'].getPendingCheckoutsData();
      }
    },
  },
});

Vue.component('checkout-items-container', {
  template: `
    <div class="checkout-items-container">
      <ul>
        <li v-for="checkoutItem in checkoutItems">
          <checkout-item v-bind:checkoutData="checkoutItem"></checkout-item>
        </li>
      </ul>
    </div>
  `,

  data: function() {
    return { checkoutItems: [] };
  },

  methods: {
    getPendingCheckoutsData: async function() {
      console.log("getting request data");
      const checkoutData = await fetchJSON('/pending-checkouts');
      this.checkoutItems = checkoutData.arr;
    }
  },

  mounted() {
    this.getPendingCheckoutsData();
  },
});

