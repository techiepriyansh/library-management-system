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
      await rootEl.$refs['bookItemsContainer'].getBooksData();
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


Vue.component('issued-book-item', {
  template: `
    <div class="box">
      <div class="issued-book-item" @click="showMoreModal">
        <div class="content">
          <p class="title"> {{bookData.title}} </p> 
          <p class="subtitle"> {{bookData.author}} </p>
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
              <span class="subtitle"> Pages: {{bookData.pages}} </span> <br> <br>
              <span class="subtitle"> Time elapsed since issue: {{timeElapsed}} </span> <br> <br>
              <p class="content"> {{bookData.info}} </p>
            </div>
          </section>
          <footer class="modal-card-foot">
            <button v-bind:class="{ 'button': true, 'is-success': !bookData.requested, 'is-static': bookData.requested}" @click="requestCheckin">{{checkinButtonValue}}</button>
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
    checkinButtonValue: function() {
      return this.bookData.requested ? "Checkin Requested" : "Request Checkin";
    },

    timeElapsed: function() {
      let dt = (Date.now() - this.bookData.timeIssued);

      let millis = dt % 1000;
      dt = (dt - millis) / 1000;
      let seconds = dt % 60;
      dt = (dt - seconds) / 60;
      let minutes = dt % 60;
      dt = (dt - minutes) / 60;
      let hrs = dt % 24;
      let days = (dt - hrs) / 24;

      if (days > 0) { 
        return `${days} days, ${hrs} hrs`;
      }
      else if (hrs > 0) {
        return `${hrs} hrs, ${minutes} mins`;
      }
      else {
        return `${minutes} mins, ${seconds} secs`;
      }
    },
  },

  methods: {
    showMoreModal: function() {
      this.isMoreModalActive = true;
    },

    closeMoreModal: function() {
      this.isMoreModalActive = false;
    },

    requestCheckin: async function() {
      console.log("Requesting checkin");
      let resData = await postJSON('/request-checkin', {
        book: this.bookData.id, 
        issueId: this.bookData.issueId,
      });
      if (!resData.success) {
        await rootEl.$refs['issuedBookItemsContainer'].getBooksData();
      }
      else {
        this.bookData.requested = true;
      }
    },
  },
});

Vue.component('issued-book-items-container', {
  template: `
    <div class="book-items-container">
      <ul>
        <li v-for="bookItem in bookItems">
          <issued-book-item v-bind:bookData="bookItem"></issued-book-item>
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
      const bookData = await fetchJSON('/user-books-data');
      
      this.bookItems = bookData.arr;
    },
  },

  mounted() {
    this.getBooksData();
  }

});
