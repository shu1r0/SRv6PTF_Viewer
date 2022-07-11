<!-- 
  todo:
    * クラスにIDの情報を含める
    
 -->

<template>
  <div id="packet-list" class="packet-list">
    <table id="packet-list-table">
      <tr>
        <th>pakcet ID</th>
        <th>fields</th>
      </tr>

      <tr
          class="trace"
          v-for="(pap, index) in packetAndPath"
          :key="index"
          @click="emitClickPacket(pap)">
        <td>
          {{ pap.packetId.toString(16) }}
        </td>
        <td>
          {{ pap.packetText }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue'

export interface PacketAndPath {
  packetId: number
  packetText: string
  timestamp: number
  path: string[]
}

export default defineComponent({
  props: {
    srv6Paths: Object as PropType<any[]>
  },
  setup(props, ctx) {
    
    const packetAndPath = ref<PacketAndPath[]>([])
    const addPacketAndPath = (pap: PacketAndPath) => {
      let insert = false
      for(let i = 0; i < packetAndPath.value.length; i++){
        if(pap.timestamp < packetAndPath.value[i].timestamp){
          packetAndPath.value.splice(1, 0, pap)
          insert = true
        }
      }
      if(!insert){
        packetAndPath.value.push(pap)
      }
    }

    const pktShowText = (pkt: any) => {
      return `|IPv6 src=${pkt.IPv6.src} dst=${pkt.IPv6.dst}|` + ` SRH segs=[${pkt["IPv6 Option Header Segment Routing"].addresses}] sl=${pkt["IPv6 Option Header Segment Routing"].segleft}`
    }
    
    /**
     *  SRv6 Path が変化したとき
     */
    watch(() => props.srv6Paths, (newPaths, oldPaths) => {
      // reset packets
      packetAndPath.value = []

      // クライントから取得したPathを表示用に変換
      newPaths?.forEach(path => {
        let tmpPathNode: string[] = []
        let tmpPacketAndPaths: PacketAndPath[] = []

        path.packets.forEach((packet: any) => {
          const pap: PacketAndPath = {
            packetId: packet.packet_id,
            packetText: pktShowText(packet.packet_obj),
            timestamp: packet.timestamp,
            path: []
          }
          tmpPacketAndPaths.push(pap)
          tmpPathNode.push(packet.node)
        })

        // update packetAndPath
        tmpPacketAndPaths.forEach(pap => {
          pap.path = tmpPathNode
          addPacketAndPath(pap)
        })
      })
    }, {deep: true})

    const emitClickPacket = (pap: PacketAndPath) => {
      console.log("click packet")
      console.log(pap)
      ctx.emit("clickPacket", {packetAndPath: pap})
    }

    return {
      packetAndPath,
      emitClickPacket
    }
  },
})
</script>

<style lang="scss">
.packet-list{
  font-size: 1.3rem;
  border: 1px solid $black;
  border-collapse: collapse;

  table, tr, th, td{
    border: 1px solid $black;
    border-collapse: collapse;
  }

  #packet-list-table{
    width: 100%;
  }
}
</style>
