<!-- 
  todo:
    * クラスにIDの情報を含める
    
 -->

<template>
  <div id="packet-list" class="packet-list">
    <label for="path-only">display only path</label>
    
    <!-- render from ViewTable -->
    <table id="packet-list-table">
      <tr>
        <th>pakcet ID</th>
        <th
          v-for="(head, index) in viewTable.header"
          :key = "index"
          >
          {{ head }}
        </th>
      </tr>

      <tr
          class="trace"
          v-for="(content, index) in viewTable.contents"
          :key="index"
          @click="emitClickPacketPath(viewTable.paths[index])">
        <td
          v-for="index in viewTable.columnNum"
          :key="index"
          >
          {{ content[index] }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import { ViewPathTable, ViewTable } from '@/scripts/utils/path_view'
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
    const viewTable = ref<ViewPathTable>(new ViewPathTable())

    watch(() => props.srv6Paths, (newPaths, oldPaths) => {
      viewTable.value.clear()
      newPaths?.forEach(path => {
        viewTable.value.addPath(path.packets)
      })
    }, {deep: true})

    const emitClickPacketPath = (nodes: string[]) => {
      ctx.emit("clickPacketPath", nodes)
    }

    return {
      viewTable,
      emitClickPacketPath
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
