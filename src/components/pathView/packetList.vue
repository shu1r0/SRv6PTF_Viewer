<!-- 
  todo:
    * クラスにIDの情報を含める
    
 -->

<template>
  <div id="packet-list" class="packet-list">
    <input type="text" name="path-filter" id="path-filter" v-model="filter" style="width: 50%" placeholder="ex.) ipv6.src =='fc00::1:2'">
    <button @click="filteredPathsRequest(filter)">filter</button>
    
    <!-- render from ViewTable -->
    <table id="packet-list-table">
      <!-- Header -->
      <tr>
        <th
          v-for="(head, index) in viewTable.header"
          :key = "index"
          >
          {{ head }}
        </th>
      </tr>

      <!-- Contents -->
      <tr
          v-for="(content, index) in viewTable.contents"
          :key="'trace' + index"
          @click="onClickContent(index)"
          :class="[viewTable.classes[index]]">
        <td
          v-for="columnIndex in viewTable.columnNum"
          :key="columnIndex"
          >
          {{ content[columnIndex] }}
        </td>
      </tr>
    </table>

  </div>
</template>

<script lang="ts">
import { ViewFlowTable, ViewPathTable, ViewTable } from '@/scripts/utils/path_view'
import { defineComponent, PropType, ref, watch, getCurrentInstance } from 'vue'

export default defineComponent({
  props: {
    srv6Paths: Object as PropType<any[]>,
    srv6Flows: Object as PropType<any[]>
  },
  setup(props, ctx) {
    const viewTable = ref<ViewTable>(new ViewPathTable())
    const filter = ref<string>("")
    let emitedFilter = ""

    // update view table (Packet)
    watch(() => props.srv6Paths, (newPaths, oldPaths) => {
      const newViewTable = new ViewPathTable()
      newPaths?.forEach(path => {
        // set mark class
        let styleClass = ""
        if(emitedFilter){
          styleClass = "NoMark"
        }
        path.marks.forEach((mark: any) => {
          mark.replace(/&quot;/g,'"')
          const m = JSON.parse(mark)
          styleClass = m.name
        });
        newViewTable.addPath(path.packets, styleClass)
      })
      viewTable.value = newViewTable
    }, {deep: true})

    // update view table (Flow)
    watch(() => props.srv6Flows, (newFlows, oldFlows) => {
      const newViewTable = new ViewFlowTable()
      newFlows?.forEach(flow => {
        newViewTable.addFlow(flow)
      })
      viewTable.value = newViewTable
    }, {deep: true})

    const onClickContent = (index: number) => {
      const paths = viewTable.value.getContentPaths(index)
      if(paths.length > 0){
        if(Array.isArray(paths[0])){
          emitClickPacketPathList(paths as string[][])
        } else {
          emitClickPacketPath(paths as string[])
        }
      }
    }

    const emitClickPacketPath = (nodes: string[]) => {
      ctx.emit("clickPacketPath", nodes)
    }

    const emitClickPacketPathList = (nodes: string[][]) => {
      ctx.emit("clickPacketPathList", nodes)
    }

    const filteredPathsRequest = (filter: string) => {
      ctx.emit("filteredPathsRequest", filter)
      emitedFilter = filter
    }

    return {
      viewTable,
      onClickContent,
      filteredPathsRequest,
      filter
    }
  },
})
</script>

<style lang="scss">
.packet-list{
  background-color: $white;
  font-size: 1.5rem;
  border: 1px solid $black;
  border-collapse: collapse;
  z-index: 0;

  table, tr, th, td{
    border: 1px solid $black;
    border-collapse: collapse;
  }

  #packet-list-table{
    width: 100%;
    height: max(20rem);
    overflow: scroll;

    .NoMark{
      display: none;
    }
    
    // Mark sytle
    //TODO: No hardcording
    .FilterNotMatchMark, .NotEqualMark, .NotSoftEqualMark, .NotViaNodeMark, .AddressNotInSRHMark {
      color: black;
      background-color: #B10F41;
    }
  }
}
</style>
