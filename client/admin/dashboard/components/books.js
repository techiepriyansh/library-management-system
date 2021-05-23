Vue.component('book-item', {
  template: `
    <div class="box">
      <div class="book-item" @click="showModal">
        <div class="content">
          <p class="title"> {{bookData.title}} </p> 
          <p class="subtitle"> {{bookData.author}} </p>
          <p class="content"> {{bookData.info}} </p>
        </div>
      </div>
      <div class="modal" v-bind:class="{ 'is-active': isModalActive }">
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">{{bookData.title}}</p>
            <button class="delete" aria-label="close" @click="closeModal"></button>
          </header>
          <section class="modal-card-body">
            <div> 
              <span class="title"> {{bookData.title}} </span> <br> <br>
              <span class="subtitle"> Author: {{bookData.author}} </span> <br>
              <span class="subtitle"> Publisher: {{bookData.publisher}} </span> <br>
              <span class="subtitle"> Pages: {{bookData.pages}} </span> <br>
              <span class="subtitle"> Total: {{bookData.total}} </span> <br>
              <span class="subtitle"> Available: {{bookData.available}} </span> <br> <br>
              <p class="content"> {{bookData.info}} </p>
            </div>
          </section>
          <footer class="modal-card-foot">
            <div>
            <button class="button is-success">Edit</button>
          </footer>
        </div>
      </div>
    </div>
  `,

  props: {
    bookData: { required: true },
  }, 

  data: function() {
    return { isModalActive: false };
  },

  methods: {
    editBookPrompt: function() {
      console.log("edit");
    },

    showModal: function() {
      this.isModalActive = true;
    },

    closeModal: function() {
      this.isModalActive = false;
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
      const bookData = await fetchJSON('/books-data');
      this.bookItems = bookData.arr;
    },
  },

  mounted() {
    this.getBooksData();
  }

});