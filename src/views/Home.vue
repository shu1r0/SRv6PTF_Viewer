<template>
  <div class="home">
    <p>This is Config page.</p>

    <div class="container-wssetting">
      <label for="ws-addr">WebSocket Server Address</label>
      <input type="text" name="ws-addr" id="ws-addr" v-model="wsAddr" style="width: 50%" placeholder="192.168.0.1">
      <button @click="updateWsAddr(wsAddr)">connect</button>
      <label for="ws-port">WebSocket Server Port</label>
      <input type="text" name="ws-port" id="ws-port" v-model="wsPort" style="width: 50%" placeholder="192.168.0.1">
      <button @click="updateWsPort(wsPort)">connect</button>
    </div>

  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { WSClient } from "../scripts/remote/remoteClient"; 

export default defineComponent({
  name: 'Home',
  components: {
  },
  props: {
    client: Object as PropType<WSClient>
  },
  setup(props, ctx) {
    let wsAddr = props.client?.getIp()
    let wsPort = props.client?.getPort()

    const updateWsAddr = (addr?: string) => {
      if(addr){
        props.client?.setIp(addr)
        props.client?.connect()
      }
    }

    const updateWsPort = (port?: string) => {
      if(port){
        props.client?.setPort(port)
        props.client?.connect()
      }
    }
    
    return {
      wsAddr,
      wsPort,
      updateWsAddr,
      updateWsPort
    }
  },
});
</script>


<style lang="scss">
.home {
  font-size: 2rem;

  button {
    background: $navy;
    color: $white;
  }

  .container-wssetting{
    label {
      display: block;
    }
  }
}
</style>
