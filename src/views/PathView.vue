<template>
  <div 
    id="creating_vnet_view"
    class="creating_vnet">

    <div
      id="net_canvas" />

  </div>
</template>

<script lang="ts">
import { defineComponent, onActivated, onDeactivated, onMounted, PropType } from 'vue'
import { SRv6Network } from '@/scripts/net/net'
import { WSClient } from '@/scripts/remote/remoteClient'

// import { DummyRemoteClient, RemoteClient } from '../api/remoteClient'
// import { DEVICE_TYPE } from '@/vnet/devices'

export default defineComponent({
  props: {
    client: Object as PropType<WSClient>
  },
  setup(props, ctx){
    

    onMounted(() => {
      const netElement = document.getElementById("net_canvas")
      const net = new SRv6Network(netElement as HTMLElement)
      net.addSRv6Node("n1")
      net.addSRv6Node("n2")
      net.addLink("n1", "n2")
    })


    return {  }
  }
})
</script>

<style lang="scss">
.creating_vnet{
  // background-color: #eeeeee;

  #net_canvas{
    position: relative;  // basis for the position of child elements
    height: 1000px;
    width: auto;

    *{
      position: absolute;
    }
  }
}
</style>