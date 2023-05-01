<template>
  <div class="container mt-3 col-10 col-sm-8 col-md-7 col-lg-5 col-xxl-4 border ">
    <div class="mt-4 mb-3">
      <h3>간편 회원가입</h3>
    </div>
    <div class="row justify-content-center">

      <div class="col-9">
        아이디
        <div class="col-9 d-flex">
          <div class="col-12">
            <input v-bind:value="id" @input="inputId" type="text" class="form-control mb-2" id="id" placeholder="아이디" maxlength="15">
          </div>
          <div class="col-6" v-if="idCheck === false">
            <button @click="checkId" type="button" class="btn btn-danger" style="font-weight:bold;">중복검사</button>
          </div>
          <div class="col-6" v-if="idCheck === true">
            <button type="button" class="btn btn-success" style="font-weight:bold;">중복검사</button>
          </div>
        </div>
        <div style="float:left; color:red;" v-if="existId">이미 존재하는 아이디입니다.</div>
      </div>
      <div class="col-9 mb-2">
        비밀번호
        <input type="password" class="form-control" id="pw" placeholder="비밀번호 (8~20자)" v-model="pw" autocomplete="off" maxlength="20">
        <div class="ms-1" style="float:left; color:red;" v-if="pwValid === false && pw !== ''">8~20자 입력</div>
      </div>
      
      <div class="col-9 mb-4">
        <input type="password" class="form-control" id="pwCheck" placeholder="비밀번호 확인" v-model="pwCheck" autocomplete="off" maxlength="20">
        <div class="ms-1" style="float:left; color:red;" v-if="pwCheckValid === false && pwCheck !== ''">비밀번호 불일치</div>
      </div>

      <button class="w-100 btn btn-lg mb-3" @click="sendInf" id="naver" style="color:white; font-weight:bold; background-color:#12D308;">간편 회원가입</button>
    </div>
    
   
    

  </div>
</template>

<script>
import { ref, watch } from 'vue';
import axios from 'axios'
import { useRouter } from 'vue-router';
export default {
  name : 'signUp',
  setup() {
    const router = useRouter();
    let idCheck = ref(false);
    let existId = ref(false);
    let id = ref('');
    let pw = ref('');
    let pwCheck = ref('');
    let pwValid = ref(false);
    let pwCheckValid = ref(false);
    let signUpData = ref({
      id : id,
      pw : pw,
    });

    function sendInf() {
      if (id.value === '' || pw.value === '') {
        alert('입력되지 않은 항목이 있습니다.');
      } else if (idCheck.value === false) {
        alert('아이디 중복검사를 하지 않았습니다.');
      } else if (pwValid.value === false) {
        alert('비밀번호는 8~20자를 입력해야 합니다.')
      } else if (pwCheckValid.value === false) {
        alert("'비밀번호'와 '비밀번호 확인'이 일치하지 않습니다.");
      } else {
        axios.post('/api/sign-up', signUpData.value)
        .then(res=>{
          
          if(res.data === 'sign-up success') {
            alert('회원가입이 완료되었습니다.');
            router.push({path : '/login'});
          } else alert('회원가입 오류')
        }).catch(err=>{
          console.log(err);
        });
      }
    }
    function checkId() {
      if (id.value === '') {
        alert('아이디가 입력되지 않았습니다.');
      } else {
        
        axios.get('/api/sign-up/id-check?id=' + id.value)
        .then(res=>{
          
          if (res.data === 'existed') {
            existId.value = true;
          } else {
            idCheck.value = true;
          }
        }).catch(err=>{
          console.log(err);
        });
      }
    
    }
    function inputId(e) {
      idCheck.value = false;
      existId.value = false;
      id.value = e.target.value;
    }
    watch(id, (newValue, oldValue)=>{
      
      let blank_pattern = /[\s]/g;
      let special_pattern = /[~!@#$%^&*()_+|<>?:{}]/;
      let kor_pattern = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
      if(blank_pattern.test(newValue) || special_pattern.test(newValue) ||
      kor_pattern.test(newValue)){
        alert('한글, 특수문자, 공백은 포함될 수 없습니다.');
        id.value = oldValue;
      }
    });

    watch(pw, (newValue, oldValue)=>{
      console.log({newValue, oldValue});
      if (newValue.length >= 8 && newValue.length <= 20) {
        pwValid.value = true;
      } else pwValid.value = false;
      if (newValue === '') {
        document.getElementById('pw').style.borderColor = '';
        document.getElementById('pw').style.borderWidth = '';
        pwCheckValid.value = false;
        document.getElementById('pwCheck').style.borderColor = '';
        document.getElementById('pwCheck').style.borderWidth = '';
      } else if(pwValid.value === true) {
        document.getElementById('pw').style.borderColor = 'green';
        document.getElementById('pw').style.borderWidth = '2px';
      } else if(pwValid.value === false) {
        document.getElementById('pw').style.borderColor = 'red';
        document.getElementById('pw').style.borderWidth = '2px';
      }

      if (newValue === pwCheck.value && newValue !== '') {
        pwCheckValid.value = true;
        document.getElementById('pwCheck').style.borderColor = 'green';
        document.getElementById('pwCheck').style.borderWidth = '2px';
      } else if(newValue !== pwCheck.value){
        pwCheckValid.value = false;
        document.getElementById('pwCheck').style.borderColor = 'red';
        document.getElementById('pwCheck').style.borderWidth = '2px';
      }
    });

    watch(pwCheck, (newValue, oldValue)=>{
      console.log({newValue, oldValue});

      if (newValue === '') {
        pwCheckValid.value = false;
        document.getElementById('pwCheck').style.borderColor = '';
        document.getElementById('pwCheck').style.borderWidth = '';
      } else if(newValue === pw.value) {
        pwCheckValid.value = true;
        document.getElementById('pwCheck').style.borderColor = 'green';
        document.getElementById('pwCheck').style.borderWidth = '2px';
      } else if(newValue !== pw.value) {
        pwCheckValid.value = false;
        document.getElementById('pwCheck').style.borderColor = 'red';
        document.getElementById('pwCheck').style.borderWidth = '2px';
      }
    });

    return {idCheck, id, pw, existId, pwCheck, pwValid, pwCheckValid, signUpData, sendInf, checkId, inputId};
  }
}
</script>

<style>

</style>