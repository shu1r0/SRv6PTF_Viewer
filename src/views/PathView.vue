<template>
  <div class="path-view-container">
    <div
      id="path-buttons">
        <button class="update-topology" @click="updateTopology()">update Topology</button>
        <button class="update-srv6paths" @click="updateSRv6Paths()">update SRv6 Paths</button>
        <input type="text" name="columnNum" id="columnNum" v-model="columnNum">
    </div>
    <div 
      id="path-view"
      class="path-view">

      <div
        id="net-canvas">
      </div>

      <packetListVue 
        :srv6Paths="srv6Paths"
        @clickPacketPath="onClickPacketPath"
        @filteredPathsRequest="onFilteredPathsRequest">
      </packetListVue>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, onActivated, onDeactivated, onMounted, PropType, watch } from 'vue'
import { SRv6Network } from '@/scripts/net/net'
import { NetElement } from '@/scripts/net/elements'
import { WSClient } from '@/scripts/remote/remoteClient'

import packetListVue from '@/components/pathView/packetList.vue'

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

    // 初期のX，Y
    const paddingX = 300
    const paddingY = 300
    // ノードの数
    let nodeCounter = 0
    // 列数
    const columnNum = ref<any>([8])
    // ノード間の距離
    const betweenNodesX = 170
    const betweenNodesY = 150

    watch(columnNum, (newNum, oldNum) => {
      columnNum.value = newNum.value.split(",").map((v: string) => {return parseInt(v, 10)})
      if(!columnNum.value){
        columnNum.value = [8]
      }
    })

    const onGetNodes = (nodes: any) => {
      // columnNum.value = columnNum.value.split(",").map((v: string) => {return parseInt(v, 10)})
      // if(!columnNum.value){
      //   columnNum.value = [8]
      // }
      let rNum = 0
      let cNum = columnNum.value[0]
      let nodeCounterOnRaw = 0
      console.log(columnNum.value)

      for(let node in nodes) {
        if (net) {
          const x = paddingX + betweenNodesX*(nodeCounter % cNum)
          const y = paddingY + betweenNodesY*rNum
          net.addSRv6Node(node, x, y)
          nodeCounter++
          nodeCounterOnRaw++

          
          let tmpColumn = rNum < columnNum.value.length ? columnNum.value[rNum] : columnNum.value[0]
          if(nodeCounterOnRaw - tmpColumn == 0){
            cNum = rNum+1 < columnNum.value.length ? columnNum.value[rNum+1] : columnNum.value[0]
            rNum++
            nodeCounterOnRaw = 0
            // break
          }
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
      net?.removeAllElement()
      nodeCounter = 0
      props.client?.getNodes(onGetNodes)
      props.client?.getLinks(onGetLinks)
    }

    const updateSRv6Paths = (filter?: string) => {
      props.client?.getSRv6Paths(pathRes => {
        const paths = pathRes.paths
        srv6Paths.value = paths
      }, filter)
    }


    onMounted(() => {
      const netElement = document.getElementById("net-canvas")
      net = new SRv6Network(netElement as HTMLElement)
      onGetNodes({"r1": {}, "r2": {}, "r3": {}, "r4": {}, "r5": {}, "r6": {}})
      onGetLinks({
        node_pairs: [["r1", "r2"], ["r1", "r3"], ["r2", "r3"], ["r2", "r4"], ["r3", "r5"], ["r4", "r5"], ["r4", "r6"], ["r5", "r6"]]
      })
    })

    const onClickPacketPath = (nodes: string[]) => {
      // remove path
      net?.remove(".packet-arc")

      // draw path
      for(let i = 0; i < nodes.length - 1; i++) {
        net?.addPacketArc(nodes[i], nodes[i+1])
      }
    }

    const onFilteredPathsRequest = (filter: string) => {
      updateSRv6Paths(filter)
    }

    return {
      columnNum,
      updateTopology,
      updateSRv6Paths,
      srv6Paths,
      onClickPacketPath,
      onFilteredPathsRequest
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
        "net-canvas"
        " path-list";
      // grid-auto-columns: 
      //   minmax(70rem, auto)
      //   minmax(30rem, 50rem);
      grid-auto-rows: 
        minmax(20rem, 60rem)
        minmax(20rem, auto);

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