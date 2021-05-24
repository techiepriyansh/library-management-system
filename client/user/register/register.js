let log = new Vue({
  el: '#log',
  data: {
    msg: '',
    seen: false,
  },
})

let app = new Vue({
  el: 'form',
  data: {
    name: '',
    email: '',
    pass: '',
  },
  methods: {
    requestReg: async function() {
      let {name, email, pass} = this;
      let postData = {name, email, pass}
      const opts = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      };
      const res = await fetch('/register', opts);
      const resData = await res.json();
      if (resData.success) {
        log.msg = 'Registration Requested Successfully!';
        log.seen = true;
      }
      else if (resData.repeat){
        log.msg = 'User already exists!';
        log.seen = true;
      }
    },
  },
})