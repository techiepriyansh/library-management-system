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
              <span class="subtitle"> Total: {{bookData.total}} </span> <br>
              <span class="subtitle"> Available: {{bookData.available}} </span> <br> <br>
              <p class="content"> {{bookData.info}} </p>
            </div>
          </section>
          <footer class="modal-card-foot">
            <button class="button is-success" @click="showEditModal">Edit</button>
            <button class="button" @click="closeMoreModal">Back</button>
          </footer>
        </div>
      </div>
      <div class="modal" v-bind:class="{ 'is-active': isEditModalActive }">
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Edit: {{bookData.title}}</p>
            <button class="delete" aria-label="close" @click="closeEditModal"></button>
          </header>
          <section class="modal-card-body">
            <div class="field">
              <label class="label"> Title </label>
              <div class="control">
                <input class="input is-large" type="text" required="true" v-model="bookData.title">
              </div>
            </div>
            <div class="field">
              <label class="label"> Author </label>
              <div class="control">
                <input class="input is-normal" type="text" required="true" v-model="bookData.author">
              </div>
            </div>
            <div class="field">
              <label class="label"> Publisher </label>
              <div class="control">
                <input class="input is-normal" type="text" required="true" v-model="bookData.publisher">
              </div>
            </div>
            <div class="field">
              <label class="label"> Pages </label>
              <div class="control">
                <input class="input is-normal" type="text" required="true" pattern="[0-9]+" v-model="bookData.pages">
              </div>
            </div>
            <div class="field">
              <label class="label"> Total </label>
              <div class="control">
                <input class="input is-normal" type="text" required="true" pattern="[0-9]+" v-model="bookData.total">
              </div>
            </div>
            <div class="field">
              <label class="label"> Available </label>
              <div class="control">
                <input class="input is-normal" type="text" required="true" pattern="[0-9]+" v-model="bookData.available">
              </div>
            </div>
            <div class="field">
              <label class="label"> Description </label>
              <div class="control">
                <textarea class="textarea" v-model="bookData.info"></textarea>
              </div>
            </div>
          </section>
            <footer class="modal-card-foot">
              <button class="button is-success" @click="editBookData">Save Changes</button>
              <button class="button" @click="closeEditModal">Cancel</button>
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

  methods: {
    showMoreModal: function() {
      this.isMoreModalActive = true;
    },

    closeMoreModal: function() {
      this.isMoreModalActive = false;
    },

    showEditModal: function() {
      this.isMoreModalActive = false;
      this.isEditModalActive = true;
    },

    closeEditModal: function() {
      this.isEditModalActive = false;
      this.isMoreModalActive = true;
    },

    editBookData: async function() {
      console.log("submitted");
      console.log(this.bookData);
      let resData = await postJSON('/edit-book-data', this.bookData);
      if (!resData.success) {
        await rootEl.$refs['bookItemsContainer'].getBooksData();
      }
      this.closeEditModal();
    },
  },
});

Vue.component('add-book-modal', {
  template: `
    <div class="modal" v-bind:class="{ 'is-active': isActive }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Add Book</p>
          <button class="delete" aria-label="close" @click="close"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label"> Title </label>
            <div class="control">
              <input class="input is-large" type="text" required="true" v-model="bookData.title">
            </div>
          </div>
          <div class="field">
            <label class="label"> Author </label>
            <div class="control">
              <input class="input is-normal" type="text" required="true" v-model="bookData.author">
            </div>
          </div>
          <div class="field">
            <label class="label"> Publisher </label>
            <div class="control">
              <input class="input is-normal" type="text" required="true" v-model="bookData.publisher">
            </div>
          </div>
          <div class="field">
            <label class="label"> Pages </label>
            <div class="control">
              <input class="input is-normal" type="text" required="true" pattern="[0-9]+" v-model="bookData.pages">
            </div>
          </div>
          <div class="field">
            <label class="label"> Total </label>
            <div class="control">
              <input class="input is-normal" type="text" required="true" pattern="[0-9]+" v-model="bookData.total">
            </div>
          </div>
          <div class="field">
            <label class="label"> Available </label>
            <div class="control">
              <input class="input is-normal" type="text" required="true" pattern="[0-9]+" v-model="bookData.available">
            </div>
          </div>
          <div class="field">
            <label class="label"> Description </label>
            <div class="control">
              <textarea class="textarea" v-model="bookData.info"></textarea>
            </div>
          </div>
        </section>
          <footer class="modal-card-foot">
            <button class="button is-success" @click="addBook">Add</button>
            <button class="button" @click="close">Cancel</button>
          </footer>
      </div>
    </div>
  `,

  data: function () {
    return {
      isActive: false,
      bookData: {
        title: '',
        author: '',
        publisher: '',
        pages: 0,
        total: 0,
        available: 0,
        info: '',
      },
    };
  },

  methods: {
    show: function() {
      this.isActive = true;
    },

    close: function() {
      this.isActive = false;
    },

    addBook: async function() {
      console.log("add book");
      console.log(this.bookData);
      let resData = await postJSON('/add-book', this.bookData);
      await rootEl.$refs['bookItemsContainer'].getBooksData();
      this.close();
    }
  },

});

Vue.component('book-items-container', {
  template: `
    <div class="book-items-container">
      <div class="block add-book-container">
        <button class="button is-success" @click="addBookPrompt">
          <span class="icon is-small">
            <i class="fas fa-plus"></i>
          </span>
           <span>Add Book</span>
        </button>
      </div>
      <add-book-modal ref="addBookModal"></add-book-modal>
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

    addBookPrompt: async function() {
      this.$refs['addBookModal'].show();
    },
  },

  mounted() {
    this.getBooksData();
  }

});