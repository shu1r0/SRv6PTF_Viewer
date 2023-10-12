<template>
  <div class="path-view-container">
    <div
      id="path-buttons">
        <button class="update-topology" @click="updateTopology()">update Topology</button>
        <button class="update-srv6paths" @click="updateSRv6Paths()">update SRv6 Paths</button>
        <button class="update-srv6flows" @click="updateSRv6Flows()">update SRv6 Flows</button>
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
        :srv6Flows="srv6Flows"
        @clickPacketPath="onClickPacketPath"
        @clickPacketPathList="onClickPacketPathList"
        @filteredPathsRequest="onFilteredPathsRequest">
      </packetListVue>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, onActivated, onDeactivated, onMounted, PropType, watch } from 'vue'
import { SRv6Network } from '@/scripts/net/net'
import { FlowPacketArc, NetElement, PacketArc } from '@/scripts/net/elements'
import { WSClient } from '@/scripts/remote/remoteClient'

import packetListVue from '@/components/pathView/packetList.vue'
import { viewConfig } from "@/App.vue";

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
    
    // ネットワーク
    let net: SRv6Network | undefined = undefined
    // 得られたpaths, flows
    const srv6Paths: Ref<any[]> = ref<any[]>([])
    const srv6Flows: Ref<any[]> = ref<any[]>([])

    // 初期のX，Y
    const paddingX = 300
    const paddingY = 300
    // ノードの数
    let nodeCounter = 0
    // 列数 (テキストボックスから取得)
    const columnNum = ref<any>([8])
    // ノード間の距離
    const betweenNodesX = 170
    const betweenNodesY = 150

    watch(columnNum, (newNum, oldNum) => {
      columnNum.value = newNum.value.split(",").map((v: string) => {return parseInt(v, 10)})
      if(!columnNum.value){
        // default value
        columnNum.value = [8]
      }
    })

    const onGetNodes = (nodes: any) => {

      // row number for topology
      let rNum = 0
      // column number for topology
      let cNum = columnNum.value[0]
      // 行ごとのカウンタ
      let nodeCounterOnRaw = 0

      for(let node in nodes) {
        if (net) {
          const x = paddingX + betweenNodesX*(nodeCounter % cNum)
          const y = paddingY + betweenNodesY*rNum
          net.addSRv6Node(node, x, y)
          nodeCounter++
          nodeCounterOnRaw++

          // 指定がない場合，columnNum.value[0]を列数
          let tmpColumn = rNum < columnNum.value.length ? columnNum.value[rNum] : columnNum.value[0]
          // 列数が指定と一致
          if(nodeCounterOnRaw - tmpColumn == 0){
            cNum = rNum+1 < columnNum.value.length ? columnNum.value[rNum+1] : columnNum.value[0]
            rNum++
            nodeCounterOnRaw = 0
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

    // Get Paths, Flows
    const updateSRv6Paths = (filter?: string) => {
      props.client?.getSRv6Paths(pathRes => {
        const paths = pathRes.paths
        srv6Paths.value = paths
      }, filter)
    }
    const updateSRv6Flows = (filter?: string) => {
      props.client?.getSRv6Flows(flowRes => {
        const flows = flowRes.flows
        srv6Flows.value = flows
      })
    }


    onMounted(() => {
      const netElement = document.getElementById("net-canvas")
      net = new SRv6Network(netElement as HTMLElement)

      // サンプルのトポロジ図．
      onGetNodes({"r1": {}, "r2": {}, "r3": {}, "r4": {}, "r5": {}, "r6": {}})
      onGetLinks({
        node_pairs: [["r1", "r2"], ["r1", "r3"], ["r2", "r3"], ["r2", "r4"], ["r3", "r5"], ["r4", "r5"], ["r4", "r6"], ["r5", "r6"]]
      })
    })

    // Table packet path is clicked
    const onClickPacketPath = (nodes: string[]) => {
      // remove path
      net?.removeAllPacketArcs()
      

      // draw path
      for(let i = 0; i < nodes.length - 1; i++) {
        net?.addPacketArc(nodes[i], nodes[i+1])
      }
    }

    const onClickPacketPathList = (nodes: string[][]) => {
      net?.removeAllPacketArcs()

      // draw flow path
      switch (viewConfig.flowRepresentation) {
        case "number":
          for(let i = 0; i < nodes.length; i++){
            for(let j = 0; j < nodes[i].length - 1; j++){
              net?.addFlowPacketArc(nodes[i][j], nodes[i][j+1])
            }
          }
          break;
        case "thickness":
          for(let i = 0; i < nodes.length; i++){
            for(let j = 0; j < nodes[i].length - 1; j++){
              const node1 = nodes[i][j]
              const node2 = nodes[i][j+1]
              let find_arc = false
              net?.getAllNetElements().forEach((link) => {
                if(link instanceof FlowPacketArc){
                  if(link.getSource() === node1 && link.getDestination() === node2){
                    net?.removeNetElement(link.getId() as string)
                    find_arc = true
                    // increments width and label
                    if(link.style?.width){
                      link.style.width += viewConfig.flowThickness
                      link.style.label = parseInt(link.style.label) + 1
                    }else {
                      link.style = {width: viewConfig.flowThickness, label: 1}
                      link.addClass("bezier")
                      console.warn("FlowPacketArc style does not have width")
                    }
                    net?.addNetElement(link)
                    return
                  }
                }
              });
              if(!find_arc){
                console.log("Not found link :" + node1 + " " + node2)
                net?.addFlowPacketArc(node1, node2)
              }
            }
          }
          break;
        default:
          console.error("Unknown flow Representation " + viewConfig.flowRepresentation)
          break;
      }
    }

    const onFilteredPathsRequest = (filter: string) => {
      updateSRv6Paths(filter) 
    }

    return {
      columnNum,
      updateTopology,
      updateSRv6Paths,
      updateSRv6Flows,
      srv6Paths,
      srv6Flows,
      onClickPacketPath,
      onClickPacketPathList,
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