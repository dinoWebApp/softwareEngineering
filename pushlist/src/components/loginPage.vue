<template>
  <div class="container mt-3 col-9 col-sm-7 col-md-6 col-lg-5 col-xxl-4 border">
    
    <h1 class="h3 mb-3 fw-normal">로그인</h1>
    <div class="form-floating mb-2">
      <input type="text" class="form-control" id="floatingIdInput" placeholder="아이디" @keyup.enter="login" v-model="id">
      <label for="floatingIdInput">아이디</label>
    </div>
    <div class="form-floating">
      <input type="password" class="form-control" id="floatingPassword" placeholder="패스워드" autocomplete="off" @keyup.enter="login" v-model="pw">
      <label for="floatingPassword">패스워드</label>
    </div>
    <button @click="login" class="w-100 btn btn-lg btn-success mt-3 mb-2" style="font-weight:bold;">로그인</button>
    <button class="w-100 btn btn-lg mb-3" @click="signUp" id="naver" style="color:white; font-weight:bold; background-color:#12D308;">간편 회원가입</button>
  </div>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
export default {
  name:'loginPage',
  setup() {
    const router = useRouter();
    let id = ref('');
    let pw = ref('');
    let loginData = ref({
      id : id,
      pw : pw
    });

    function login() {
      axios.post('/api/login', loginData.value)
      .then(res=>{
        
        if (res.data === 'login fail') {
          alert('아이디 또는 비밀번호가 일치하지 않습니다.')
        } else {
          router.push({path:'/'});
        }
      }).catch(err=>{
        console.log(err);
      })
    }

    function signUp() {
      router.push({path : 'signUp'});
    }

    return {id, pw, loginData, login, signUp};
  }
}
</script>

<style>

</style>