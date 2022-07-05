<template>
  <div class="path-view-container">
    <div
      id="path-buttons">
        <button class="update-topology" @click="updateTopology()">update Topology</button>
        <button class="update-srv6paths" @click="updateSRv6Paths()">update SRv6 Paths</button>
    </div>
    <div 
      id="path-view"
      class="path-view">

      <div
        id="net-canvas">
      </div>

      <packetListVue 
        :srv6Paths="srv6Paths"
        @clickPacket="onClickPacket"></packetListVue>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, onActivated, onDeactivated, onMounted, PropType } from 'vue'
import { SRv6Network } from '@/scripts/net/net'
import { WSClient } from '@/scripts/remote/remoteClient'

import packetListVue, { PacketAndPath } from '@/components/pathView/packetList.vue'

// import { DummyRemoteClient, RemoteClient } from '../api/remoteClient'
// import { DEVICE_TYPE } from '@/vnet/devices'

export default defineComponent({
  components: {
    packetListVue
  },
  props: {
    client: Object as PropType<WSClient>
  },
  setup(props, ctx){
    
    let net: SRv6Network | undefined = undefined
    const srv6Paths: Ref<any[]> = ref<any[]>([])

    const onGetNodes = (nodes: any) => {
      for(let node in nodes) {
        if (net) {
          net.addSRv6Node(node)
        }else{
          console.error("No SRv6Network instance")
        }
      }
    }

    const onGetLinks = (links: any) => {
      links.node_pairs.forEach((pair: string[]) => {
        if(net){
          net.addLink(pair[0], pair[1])
        }else{
          console.error("No SRv6Network instance")
        }
      })
    }

    const updateTopology = () => {
      props.client?.getNodes(onGetNodes)
      props.client?.getLinks(onGetLinks)
    }

    const updateSRv6Paths = () => {
      props.client?.getSRv6Paths((pathRes => {
        const paths = pathRes.paths
        srv6Paths.value = paths
      }))
    }


    onMounted(() => {
      const netElement = document.getElementById("net-canvas")
      net = new SRv6Network(netElement as HTMLElement)
      net.addSRv6Node("r1")
      net.addSRv6Node("r2")
      net.addSRv6Node("r3")
      net.addSRv6Node("r4")
      net.addSRv6Node("r5")
      net.addSRv6Node("r6")

      net.addLink("r1", "r2")
      net.addLink("r1", "r3")
      net.addLink("r2", "r3")
      net.addLink("r2", "r4")
      net.addLink("r3", "r5")
      net.addLink("r4", "r5")
      net.addLink("r4", "r6")
      net.addLink("r5", "r6")

      net.addPacketArc("r1", "r2")
      net.addPacketArc("r2", "r3")
      net.addPacketArc("r3", "r5")
      net.addPacketArc("r5", "r6")
    })

    const onClickPacket = (pap: PacketAndPath) => {
      for(let i = 0; i < pap.path.length - 1; i++) {
        net?.addPacketArc(pap.path[i], pap.path[i+1])
      }
    }


    return {
      updateTopology,
      updateSRv6Paths,
      srv6Paths,
      onClickPacket
    }
  }
})
</script>

<style lang="scss">
.path-view-container{
    button {
    background: $navy;
    color: $white;
  }

  .path-view{
    
      display: grid;

      grid-template-areas: 
        "net-canvas path-list"
        "net-canvas path-list";
      grid-auto-columns: 
        minmax(70rem, 85rem)
        minmax(30rem, 50rem);
      grid-auto-rows: 
        minmax(20rem, 60rem)
        20rem;

    #net-canvas{
      grid-area: net-canvas;
      position: relative;  // basis for the position of child elements
      height: 1000px;
      width: auto;

      *{
        position: absolute;
      }
    }

    #path-list{
      grid-area: path-list;
    }
  }
}
</style>