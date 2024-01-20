<template>
  <div class="home">
    <h2>設定ページ</h2>

    <div class="container-wssetting">
      <label for="ws-addr">WebSocket Server Address</label>
      <input type="text" name="ws-addr" id="ws-addr" v-model="wsAddr" style="width: 50%" placeholder="192.168.0.1">
      <button @click="updateWsAddr(wsAddr)">connect</button>
      <label for="ws-port">WebSocket Server Port</label>
      <input type="text" name="ws-port" id="ws-port" v-model="wsPort" style="width: 50%" placeholder="192.168.0.1">
      <button @click="updateWsPort(wsPort)">connect</button>

      <p> トポロジ図の列数 (ノードを横に8個ずつ並べるときは「8」，1行目3個で2行目4個とするときは「3,4」と指定): <br>
        <input type="text" name="columnNum" id="columnNum" v-model="columnNum">
      </p>

      <p> フローの表現: <br>
        <input type="radio" v-model="flowRepresentation" id="number" value="number">矢印の数
        <input type="radio" v-model="flowRepresentation" id="thickness" value="thickness">矢印の太さ
      </p>
    </div>

  </div>
</template>

<script lang="ts">
import { PropType, defineComponent, ref, watch } from 'vue';
import { WSClient } from "../scripts/remote/remoteClient";
import { useTopoViewColumnNum, useFlowViewRepresentation, useFlowViewThickness } from '@/store'

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
    const columnNum = useTopoViewColumnNum()
    const flowRepresentation = useFlowViewRepresentation()
    const flowThickness = useFlowViewThickness()

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
      updateWsPort,
      flowRepresentation,
      flowThickness,
      columnNum,
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
