<template>
  <div class="container">
    
    <button @click="logout" style="font-weight: bold;" class="btn btn-danger mb-2">로그아웃</button>
    <div class="mb-3" style="font-size: larger; font-weight: bold;">회원목록</div>
    <hr/>
    <div v-for="item in members" :key="item">
      <div class="mb-2">{{ item.id }}</div>
      <button @click="push" class="btn btn-danger btn-sm">push</button>
      <hr/>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { useRouter } from 'vue-router'
import { io } from 'socket.io-client'
import { onUnmounted, ref } from 'vue'
export default {
  name: 'pushList',
  setup() {
    const router = useRouter();
    const socket = io('https://port-0-softwareengineering-e9btb72mlh4lnrto.sel4.cloudtype.app');
    // const socket = id('http://localhost:8080');
    let id = ref('');
    let members = ref([]);

    onUnmounted(()=>{
      socket.emit('leave', id.value);
    });
    socket.on('connect', () => {
      console.log('connected to server');
    });

    axios.get('/api/login-check')
    .then(res=>{
      if(res.data === 'not login') {
        alert('로그인이 필요합니다.');
        router.push({path : '/login'});
      } else {
        id.value = res.data;
        socket.emit('join', res.data);
        return axios.get('/api/')
      }
    })
    .then(res=>{
      members.value = res.data;
    })
    .catch(err=>{
      console.log(err);
    });

    socket.on('push', (data)=>{
      alert(data + '님의 push 알림');
    })

    function logout() {
      axios.get('/api/logout')
      .then(()=>{
        alert('로그아웃 되었습니다.');
        router.push({path : '/login'});
      })
      .catch(err=>{
        console.log(err);
      })
    }

    function push(e) {
      let pushData = {
        sendTo : e.target.previousElementSibling.innerText,
        sendFrom : id.value
      }
      socket.emit('push', pushData);
    }

    return {members, id, logout, push};
  }
  
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
