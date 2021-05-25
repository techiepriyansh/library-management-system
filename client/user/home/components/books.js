Vue.component('book-item', {
  template: `
    <div class="box">
      <div class="book-item" @click="showMoreModal">
        <div class="content">
          <p class="title"> {{bookData.title}} </p> 
          <p class="subtitle"> {{bookData.author}} </p>
          <p class="content"> {{bookData.info}} </p>
        </div>
      </div>
      <div class="modal" v-bind:class="{ 'is-active': isMoreModalActive }">
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">{{bookData.title}}</p>
            <button class="delete" aria-label="close" @click="closeMoreModal"></button>
          </header>
          <section class="modal-card-body">
            <div> 
              <span class="title"> {{bookData.title}} </span> <br> <br>
              <span class="subtitle"> Author: {{bookData.author}} </span> <br>
              <span class="subtitle"> Publisher: {{bookData.publisher}} </span> <br>
              <span class="subtitle"> Pages: {{bookData.pages}} </span> <br>
              <span class="subtitle"> Available: {{bookData.available}} </span> <br> <br>
              <p class="content"> {{bookData.info}} </p>
            </div>
          </section>
          <footer class="modal-card-foot">
            <button v-bind:class="{ 'button': true, 'is-success': !bookData.requested, 'is-static': bookData.requested}" @click="requestCheckout">{{checkoutButtonValue}}</button>
            <button class="button" @click="closeMoreModal">Back</button>
          </footer>
        </div>
      </div>
    </div>
  `,

  props: {
    bookData: { required: true },
  }, 

  data: function() {
    return { 
      isMoreModalActive: false,
      isEditModalActive: false, 
    };
  },

  computed: {
    checkoutButtonValue: function() {
      return this.bookData.requested ? "Checkout Requested" : "Request Checkout";
    }
  },

  methods: {
    showMoreModal: function() {
      this.isMoreModalActive = true;
    },

    closeMoreModal: function() {
      this.isMoreModalActive = false;
    },

    requestCheckout: async function() {
      console.log("Requesting checkout");
      let resData = await postJSON('/request-checkout', {book: this.bookData.id});
      if (!resData.success) {
        await rootEl.$refs['bookItemsContainer'].getBooksData();
      }
      else {
        this.bookData.requested = true;
      }
    },
  },
});

Vue.component('book-items-container', {
  template: `
    <div class="book-items-container">
      <ul>
        <li v-for="bookItem in bookItems">
          <book-item v-bind:bookData="bookItem"></book-item>
        </li>
      </ul>
    </div>
  `,

  data: function() {
    return { bookItems: [] };
  },

  methods: {
    getBooksData: async function() {
      console.log("getting books data");
      const bookData = await fetchJSON('/user-book-library');
      
      this.bookItems = bookData.arr;
    },
  },

  mounted() {
    this.getBooksData();
  }

});