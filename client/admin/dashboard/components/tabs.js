Vue.component('tabs', {
  template: `
    <div class="tabs-root">
      <div class="tabs is-boxed is-large">
        <ul>
          <li v-for="tab in tabs" v-bind:class="{ 'is-active': tab.isActive }">
            <a @click="selectTab(tab)">{{ tab.name }}</a>
          </li>
        </ul>
      </div>
      <div class="tabs-content">
        <slot></slot>
      </div>
    </div>
  `,
    
  data: function() {
    return {tabs: [] };
  },
  
  created() {
    this.tabs = this.$children; 
  },

  methods: {
    selectTab: function (selectedTab) {
      this.tabs.forEach(tab => {
        tab.isActive = (tab.name == selectedTab.name);
      });
    },
  },
});

Vue.component('tab', {
  template: `
    <div v-show="isActive"><slot></slot></div>
  `,
  
  props: {
    name: { required: true },
    selected: { default: false},
  },
  
  data: function() {    
    return { isActive: false };
  },
  
  computed: {
    href() {
      return '#' + this.name.toLowerCase().replace(/ /g, '-');
    }
  },
  
  mounted() {
    this.isActive = this.selected;  
  }
});