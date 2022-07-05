<template>
  <div id="packet-list" class="packet-list">
    <table id="packet-list-table">
      <tr>
        <th>protocol</th>
        <th>route</th>
      </tr>

      <tr
          class="trace"
          v-for="(pap, index) in packetAndPath"
          :key="index"
          @click="emitClickPacket(pap)">
        <td>
          {{ pap.timestamp }}
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
    
    watch(() => props.srv6Paths, (newPaths, oldPaths) => {
      // reset packets
      packetAndPath.value = []

      newPaths?.forEach(path => {
        let tmpPathNode: string[] = []
        let tmpPacketAndPaths: PacketAndPath[] = []

        path.packets.forEach((packet: any) => {
          const pap: PacketAndPath = {
            packetText: packet.packet_obj.toString(),
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
  font-size: 2rem;
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
